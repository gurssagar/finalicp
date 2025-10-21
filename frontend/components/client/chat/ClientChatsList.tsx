'use client'
import React, { useState, useEffect } from 'react'
import { Search, MessageSquare, UserPlus } from 'lucide-react'

interface Chat {
  contact: string
  lastMessage: {
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

interface AvailableUser {
  id: string
  email: string
  name: string
  firstName: string
  lastName: string
  profileImageUrl: string | null
  isVerified: boolean
  hasProfile: boolean
  createdAt: string
  skills: string[]
  location: string | null
  bio: string | null
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
  const [chats, setChats] = useState<Chat[]>([])
  const [availableUsers, setAvailableUsers] = useState<AvailableUser[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAvailableUsers, setShowAvailableUsers] = useState(false)

  // Load recent chats from API
  useEffect(() => {
    const loadRecentChats = async () => {
      try {
        const response = await fetch(`/api/chat/recent?userEmail=${encodeURIComponent(userEmail)}&limit=20`)
        const data = await response.json()

        if (data.success) {
          setChats(data.chats)
        }
      } catch (error) {
        console.error('Error loading recent chats:', error)
      }
    }

    // Load available users
    const loadAvailableUsers = async () => {
      try {
        const response = await fetch(`/api/users/all?excludeEmail=${encodeURIComponent(userEmail)}`)
        const data = await response.json()

        if (data.success) {
          setAvailableUsers(data.users)
        }
      } catch (error) {
        console.error('Error loading available users:', error)
      }
    }

    if (userEmail) {
      setLoading(true)
      Promise.all([loadRecentChats(), loadAvailableUsers()])
        .finally(() => setLoading(false))
    }
  }, [userEmail])

  // Filter chats based on search query
  const filteredChats = chats.filter(chat =>
    chat.contact.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.lastMessage.text.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Filter available users based on search query
  const filteredAvailableUsers = availableUsers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  // Convert chat data to display format
  const displayChats = filteredChats.map(chat => ({
    id: chat.contact,
    name: chat.contact,
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(chat.contact)}&background=9333ea&color=fff`,
    lastMessage: chat.lastMessage.text,
    time: new Date(chat.lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    unread: chat.lastMessage.from !== userEmail && !chat.lastMessage.read ? 1 : 0,
    type: 'direct' as const
  }))

  // Convert available users to display format
  const displayAvailableUsers = filteredAvailableUsers.map(user => ({
    id: user.email,
    name: user.name,
    avatar: user.profileImageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=10b981&color=fff`,
    lastMessage: `Start conversation with ${user.firstName}`,
    time: '',
    unread: 0,
    type: 'available' as const,
    isVerified: user.isVerified,
    hasProfile: user.hasProfile,
    skills: user.skills,
    location: user.location
  }))

  // Combine existing chats and available users
  const allContacts = [...displayChats]

  // Add available users that are not already in chats
  displayAvailableUsers.forEach(availableUser => {
    const existingChatIndex = allContacts.findIndex(chat => chat.id === availableUser.id)
    if (existingChatIndex === -1) {
      allContacts.push({...availableUser, type: 'direct' as const})
    }
  })

  // Sort: existing chats first (by most recent), then available users
  allContacts.sort((a, b) => {
    if (a.type === 'direct' && b.type !== 'direct') return -1
    if (a.type !== 'direct' && b.type === 'direct') return 1
    if (a.type === 'direct' && b.type === 'direct') {
      const timeA = a.time ? new Date(a.time).getTime() : 0
      const timeB = b.time ? new Date(b.time).getTime() : 0
      return timeB - timeA
    }
    return a.name.localeCompare(b.name)
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

  // Handle starting a new conversation with an available user
  const handleStartConversation = async (targetUserEmail: string, userName: string) => {
    try {
      // Check if chat already exists
      const checkResponse = await fetch(`/api/chat/initiate?clientEmail=${encodeURIComponent(userEmail)}&freelancerEmail=${encodeURIComponent(targetUserEmail)}`)
      const checkData = await checkResponse.json()

      if (checkData.success && checkData.chatExists) {
        // Chat already exists, just select it
        onSelectChat(targetUserEmail)
        return
      }

      // Initiate new chat
      const response = await fetch('/api/chat/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientEmail: userEmail,
          freelancerEmail: targetUserEmail,
          serviceTitle: 'General Conversation'
        })
      })

      const data = await response.json()

      if (data.success) {
        // Select the newly created chat
        onSelectChat(targetUserEmail)
        console.log('New conversation started with:', userName)
      } else {
        console.error('Failed to start conversation:', data.error)
      }
    } catch (error) {
      console.error('Error starting conversation:', error)
    }
  }

  // Handle chat selection - for available users, start new conversation
  const handleChatClick = (chat: any) => {
    if (chat.type === 'available') {
      handleStartConversation(chat.id, chat.name)
    } else {
      onSelectChat(chat.id)
    }
  }

  // Use combined contacts list
  const chatsToDisplay = allContacts

  return (
    <div className="flex flex-col h-full">
      {/* Search Bar */}
      <div className="p-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search conversations and users..."
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
            onClick={() => handleChatClick(chat)}
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
              {(chat as any).hasProfile === false && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center">
                  <UserPlus size={12} />
                </div>
              )}
              {(chat as any).isVerified && (
                <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-blue-500 text-white rounded-full flex items-center justify-center">
                  ✓
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
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  chat.type === 'direct' ? 'bg-purple-100 text-purple-700' :
                  chat.type === 'available' ? 'bg-green-100 text-green-700' :
                  chat.type === 'team' ? 'bg-blue-100 text-blue-700' :
                  chat.type === 'support' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {chat.type === 'direct' ? 'chat' :
                   chat.type === 'available' ? 'available' :
                   chat.type}
                </span>
                <p className="text-sm text-gray-500 truncate">
                  {chat.lastMessage}
                </p>
              </div>

              {/* Show additional info for available users */}
              {(chat as any).skills && (chat as any).skills.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {(chat as any).skills.slice(0, 3).map((skill: string, index: number) => (
                    <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {skill}
                    </span>
                  ))}
                  {(chat as any).skills.length > 3 && (
                    <span className="text-xs text-gray-500">
                      +{(chat as any).skills.length - 3} more
                    </span>
                  )}
                </div>
              )}

              {(chat as any).location && (
                <p className="text-xs text-gray-400 mt-1">
                  📍 {(chat as any).location}
                </p>
              )}
            </div>
          </div>
        ))
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center p-8">
              <MessageSquare size={48} className="mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations found</h3>
              <p className="text-sm text-gray-500 mb-4">Start chatting with available users or book a service</p>
              <div className="bg-purple-50 rounded-lg p-4 text-sm text-purple-700">
                <p className="font-medium mb-1">💬 How to start chatting:</p>
                <ol className="text-left text-xs space-y-1">
                  <li>1. Click on any available user below to start chatting</li>
                  <li>2. Browse services and book freelancers</li>
                  <li>3. Join hackathons and connect with teams</li>
                </ol>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}