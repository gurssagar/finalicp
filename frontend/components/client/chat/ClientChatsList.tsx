'use client'
import React, { useState, useEffect } from 'react'
import { Search, MessageSquare, Briefcase, Calendar, DollarSign } from 'lucide-react'
import { getBookingsByClientEmail, createChatRelationshipsFromBookings } from '../../../lib/marketplace-storage'
import { getUserProfileByEmail, UserProfile } from '../../../lib/user-profile'

interface BookingChat {
  booking_id: string
  client_email: string
  freelancer_email: string
  service_title: string
  service_id: string
  package_id: string
  status: string
  created_at: string
  updated_at: string
  package_name: string
  price: string
  description: string
  contactEmail: string
  freelancerProfile?: UserProfile
  lastMessage?: {
    id: string
    from: string
    to: string
    text: string
    timestamp: string
    delivered: boolean
    read: boolean
    messageType: string
  }
}

interface ClientChatsListProps {
  onSelectChat: (chatId: string) => void
  selectedChatId: string | null
  userEmail: string
}

export function ClientChatsList({
  onSelectChat,
  selectedChatId,
  userEmail
}: ClientChatsListProps) {
  const [bookingChats, setBookingChats] = useState<BookingChat[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // Load chat relationships from API
  useEffect(() => {
    const loadChatRelationships = async () => {
      try {
        setLoading(true)
        console.log('Loading chat relationships for user:', userEmail)

        // Get chat relationships from our new API
        const response = await fetch('/api/chat/relationships')
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.data && data.data.relationships) {
            const relationships = data.data.relationships
            console.log('Loaded chat relationships:', relationships)

            // Transform relationships into chat format
            const transformedChats: BookingChat[] = relationships.map((relationship: any) => {
              // Handle status object conversion
              let status = 'Active'; // default status
              if (relationship.status) {
                if (typeof relationship.status === 'string') {
                  status = relationship.status;
                } else if (typeof relationship.status === 'object') {
                  // Handle canister variant status format like {Active: null}
                  const statusKey = Object.keys(relationship.status)[0];
                  status = statusKey || 'Active';
                }
              }

              return {
                booking_id: relationship.chatId,
                client_email: relationship.userRole === 'client' ? userEmail : relationship.partnerEmail,
                freelancer_email: relationship.userRole === 'client' ? relationship.partnerEmail : userEmail,
                service_title: relationship.serviceTitle,
                service_id: relationship.serviceId,
                package_id: relationship.packageId,
                status: status,
                created_at: relationship.createdAt,
                updated_at: relationship.updatedAt,
                package_name: 'Package', // Will be enhanced later
                price: relationship.totalAmount ? `${(parseInt(relationship.totalAmount) / 100000000).toFixed(2)} ICP` : '0 ICP',
                description: relationship.description,
                contactEmail: relationship.partnerEmail,
                // Set up empty lastMessage for now
                lastMessage: undefined
              };
            })

            setBookingChats(transformedChats)
            console.log('Final chat list:', transformedChats)
          } else {
            console.error('Failed to load chat relationships:', data.error)
          }
        } else {
          console.error('Failed to call chat relationships API')
        }
      } catch (error) {
        console.error('Error loading chat relationships:', error)
      } finally {
        setLoading(false)
      }
    }

    if (userEmail) {
      loadChatRelationships()
    }
  }, [userEmail])

  // Filter chats based on search query
  const filteredChats = bookingChats.filter(chat => {
    const contactName = chat.contactEmail.split('@')[0] || '';
    const serviceTitle = chat.service_title || '';
    const packageName = chat.package_name || '';
    const lastMessageText = chat.lastMessage?.text || '';

    return contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           serviceTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
           packageName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           lastMessageText.toLowerCase().includes(searchQuery.toLowerCase());
  })

  // Convert booking chat data to display format
  const displayChats = filteredChats.map(chat => {
    const freelancerProfile = chat.freelancerProfile

    // Use real freelancer profile data or fallback to email-based name
    const displayName = freelancerProfile?.displayName ||
                      freelancerProfile?.firstName + (freelancerProfile?.lastName ? ' ' + freelancerProfile.lastName : '') ||
                      chat.contactEmail.split('@')[0].charAt(0).toUpperCase() + chat.contactEmail.split('@')[0].slice(1)

    const lastMessageText = chat.lastMessage ? chat.lastMessage.text : `Start conversation about ${chat.service_title}`
    const lastMessageTime = chat.lastMessage
      ? new Date(chat.lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : new Date(chat.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    const unread = chat.lastMessage && chat.lastMessage.from !== userEmail && !chat.lastMessage.read ? 1 : 0

    // Use profile image if available, otherwise generate avatar
    const avatarUrl = freelancerProfile?.profileImage && !freelancerProfile.fallback
      ? freelancerProfile.profileImage
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=9333ea&color=fff`

    return {
      id: chat.contactEmail,
      name: displayName,
      avatar: avatarUrl,
      lastMessage: lastMessageText,
      time: lastMessageTime,
      unread: unread,
      type: 'service' as const,
      service: {
        title: chat.service_title,
        package: chat.package_name,
        price: chat.price,
        status: chat.status,
        bookingId: chat.booking_id
      },
      // Additional profile info for display
      profile: {
        bio: freelancerProfile?.bio || '',
        location: freelancerProfile?.location || '',
        skills: freelancerProfile?.skills || [],
        isOnline: freelancerProfile?.isOnline || false
      }
    }
  })

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-200 rounded-full mb-4"></div>
          </div>
        </div>
        <div className="flex-1 p-4 space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Display only real chats - no more mock data
  const chatsToDisplay = displayChats

  return (
    <div className="flex flex-col h-full">
      {/* Search Bar */}
      <div className="p-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search chats and teams..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-3 pl-4 pr-12 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-purple-600 rounded-full p-2">
            <Search size={18} className="text-white" />
          </div>
        </div>
      </div>

      {/* Chats List */}
      <div className="flex-1 overflow-y-auto">
        {chatsToDisplay.length > 0 ? (
          chatsToDisplay.map(chat => (
          <div
            key={chat.id}
            onClick={() => onSelectChat(chat.id)}
            className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
              selectedChatId === chat.id ? 'bg-purple-50 border-l-4 border-purple-600' : ''
            }`}
          >
            <div className="relative">
              <img
                src={chat.avatar}
                alt={chat.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              {chat.unread > 0 && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {chat.unread}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-gray-900 truncate">
                  {chat.name}
                </h3>
                <span className="text-xs text-gray-500">{chat.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  chat.type === 'service' ? 'bg-purple-100 text-purple-700' :
                  chat.type === 'team' ? 'bg-blue-100 text-blue-700' :
                  chat.type === 'support' ? 'bg-green-100 text-green-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {chat.type}
                </span>
                <p className="text-sm text-gray-500 truncate">
                  {chat.lastMessage}
                </p>
              </div>
              {chat.service && (
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                  <Briefcase size={12} />
                  <span className="truncate">{chat.service.title}</span>
                  <span>•</span>
                  <span className="text-purple-600 font-medium">{chat.service.price}</span>
                </div>
              )}
              {chat.profile && (chat.profile.location || chat.profile.skills.length > 0) && (
                <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                  {chat.profile.location && (
                    <>
                      <span>📍 {chat.profile.location}</span>
                      {chat.profile.skills.length > 0 && <span>•</span>}
                    </>
                  )}
                  {chat.profile.skills.length > 0 && (
                    <span className="truncate">
                      💼 {chat.profile.skills.slice(0, 3).join(', ')}
                      {chat.profile.skills.length > 3 && '...'}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center p-8">
              <Briefcase size={48} className="mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No service chats yet</h3>
              <p className="text-sm text-gray-500 mb-4">Chat with freelancers after booking their services</p>
              <div className="bg-purple-50 rounded-lg p-4 text-sm text-purple-700">
                <p className="font-medium mb-1">💡 How to start chatting:</p>
                <ol className="text-left text-xs space-y-1">
                  <li>1. Browse available services</li>
                  <li>2. Book a service that fits your needs</li>
                  <li>3. Chat automatically created with the freelancer</li>
                  <li>4. Discuss project details and requirements</li>
                </ol>
              </div>
              <div className="mt-4">
                <a
                  href="/client/projects"
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Browse Services
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}