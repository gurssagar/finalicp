'use client'
import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

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

interface ChatsListProps {
  onSelectChat: (chatId: string) => void;
  selectedChatId: string | null;
  userEmail: string;
  userType: 'client' | 'freelancer' | 'both';
}
export function ChatsList({
  onSelectChat,
  selectedChatId,
  userEmail,
  userType
}: ChatsListProps) {
  const [chats, setChats] = useState<Chat[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

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
      } finally {
        setLoading(false)
      }
    }

    if (userEmail) {
      loadRecentChats()
    }
  }, [userEmail])

  // Filter chats based on search query
  const filteredChats = chats.filter(chat =>
    chat.contact.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.lastMessage.text.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Convert chat data to display format
  const displayChats = filteredChats.map(chat => ({
    id: chat.contact,
    name: chat.contact,
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(chat.contact)}&background=9333ea&color=fff`,
    lastMessage: chat.lastMessage.text,
    time: new Date(chat.lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    unread: chat.lastMessage.from !== userEmail && !chat.lastMessage.read ? 1 : 0
  }))

  // Fallback to mock data if no chats available
  const chatsToDisplay = displayChats.length > 0 ? displayChats : [
    {
      id: '1',
      name: 'Alex Johnson',
      avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=150&auto=format&fit=crop',
      lastMessage: 'Looking forward to working with you!',
      time: '9:00 AM',
      unread: 1
    },
    {
      id: '2',
      name: 'Sarah Chen',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop',
      lastMessage: 'Project details look great',
      time: '8:30 AM',
      unread: 0
    },
    {
      id: '3',
      name: 'Mike Davis',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=150&auto=format&fit=crop',
      lastMessage: 'When can we start?',
      time: 'Yesterday',
      unread: 2
    }
  ]
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

  return (
    <div className="flex flex-col h-full">
      {/* Search Bar */}
      <div className="p-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search your messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-3 pl-4 pr-12 rounded-full border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-amber-500 rounded-full p-2">
            <Search size={18} className="text-white" />
          </div>
        </div>
      </div>

      {/* Chats List */}
      <div className="flex-1 overflow-y-auto">
        {chatsToDisplay.map(chat => (
          <div
            key={chat.id}
            onClick={() => onSelectChat(chat.id)}
            className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 ${
              selectedChatId === chat.id ? 'bg-gray-50' : ''
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
              <p className="text-sm text-gray-500 truncate">
                {chat.lastMessage}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}