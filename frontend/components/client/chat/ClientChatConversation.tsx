'use client'
import React, { useState, useEffect } from 'react'
import { ClientMessageInput } from './ClientMessageInput'
import socketService, { SocketMessage } from '@/lib/socket-service'
import { MessageCircle, Wifi, WifiOff } from 'lucide-react'

interface Message {
  id: string
  from: string
  to: string
  text: string
  timestamp: string
  delivered: boolean
  read: boolean
  messageType: string
}

interface ClientChatConversationProps {
  chatId: string
  userEmail: string
}

export function ClientChatConversation({
  chatId,
  userEmail
}: ClientChatConversationProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [socketConnected, setSocketConnected] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)

  // Initialize Socket.IO and load chat history when chatId changes
  useEffect(() => {
    if (!chatId || !userEmail) return

    // Initialize Socket.IO connection
    const initializeSocket = async () => {
      try {
        const connected = await socketService.connect(userEmail)
        if (connected) {
          console.log('[ClientChat] Socket connected')
        } else {
          console.warn('[ClientChat] Socket connection failed')
        }
      } catch (error) {
        console.error('[ClientChat] Socket initialization error:', error)
      }
    }

    // Load chat history from storage canister
    const loadChatHistory = async () => {
      try {
        const response = await fetch(
          `/api/chat/history?userEmail=${encodeURIComponent(userEmail)}&contactEmail=${encodeURIComponent(chatId)}&limit=50&offset=0`
        )
        const data = await response.json()

        if (data.success) {
          setMessages(data.messages || [])
        }
      } catch (error) {
        console.error('Error loading chat history:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeSocket()
    loadChatHistory()

    // Cleanup on unmount
    return () => {
      // Don't disconnect here as it might be used by other components
    }
  }, [chatId, userEmail])

  // Setup Socket.IO event listeners
  useEffect(() => {
    if (!chatId || !userEmail) return

    // Listen for connection status changes
    const handleConnectionStatus = (status: any) => {
      setSocketConnected(status.connected)
      setConnectionError(status.error || null)
    }

    // Listen for new private messages
    const handlePrivateMessage = (message: SocketMessage) => {
      // Only add messages that are relevant to this chat
      if ((message.from === chatId && message.to === userEmail) ||
          (message.to === chatId && message.from === userEmail)) {

        const newMessage: Message = {
          id: `socket-${Date.now()}`,
          from: message.from,
          to: message.to,
          text: message.text,
          timestamp: message.timestamp || new Date().toISOString(),
          delivered: true,
          read: false,
          messageType: 'text'
        }

        setMessages(prev => {
          // Avoid duplicates
          const exists = prev.some(m =>
            m.text === newMessage.text &&
            Math.abs(new Date(m.timestamp).getTime() - new Date(newMessage.timestamp).getTime()) < 1000
          )
          return exists ? prev : [...prev, newMessage]
        })
      }
    }

    // Register event listeners
    socketService.on('connectionStatus', handleConnectionStatus)
    socketService.on('privateMessage', handlePrivateMessage)

    // Initial connection status
    setSocketConnected(socketService.isConnected())

    // Cleanup
    return () => {
      socketService.off('connectionStatus', handleConnectionStatus)
      socketService.off('privateMessage', handlePrivateMessage)
    }
  }, [chatId, userEmail])

  // Send message via Socket.IO or fallback to storage canister
  const sendMessage = async (text: string) => {
    if (!text.trim() || !chatId || !userEmail) {
      throw new Error('Missing required information to send message')
    }

    const messageData = {
      to: chatId,
      text: text.trim(),
      timestamp: new Date().toISOString()
    }

    // Try Socket.IO first if connected
    if (socketConnected) {
      try {
        const result = await socketService.sendPrivateMessage(messageData)
        if (result.success) {
          // Add message to local state immediately for better UX
          const optimisticMessage: Message = {
            id: `socket-${Date.now()}`,
            from: userEmail,
            to: chatId,
            text: text.trim(),
            timestamp: result.timestamp || messageData.timestamp,
            delivered: true,
            read: false,
            messageType: 'text'
          }
          setMessages(prev => [...prev, optimisticMessage])
          return // Success, no need to try storage
        }
        console.warn('[ClientChat] Socket send failed, falling back to storage')
      } catch (error) {
        console.warn('[ClientChat] Socket send error, falling back to storage:', error)
      }
    }

    // Fallback to storage canister
    try {
      const response = await fetch('/api/chat/messages/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: userEmail,
          to: chatId,
          text: text.trim(),
          messageType: 'text',
          timestamp: messageData.timestamp
        })
      })

      const data = await response.json()
      if (response.ok && data.success) {
        const storedMessage: Message = {
          id: data.messageId || `storage-${Date.now()}`,
          from: userEmail,
          to: chatId,
          text: text.trim(),
          timestamp: messageData.timestamp,
          delivered: true,
          read: false,
          messageType: 'text'
        }
        setMessages(prev => [...prev, storedMessage])
        return // Success
      } else {
        throw new Error(data.error || 'Failed to send message')
      }
    } catch (error) {
      console.error('[ClientChat] Failed to send message via storage:', error)
      throw new Error('Failed to send message. Please try again.')
    }
  }

  // Convert messages to display format
  const displayMessages = messages.map(msg => ({
    id: msg.id,
    sender: msg.from === userEmail ? 'me' : 'other',
    senderName: msg.from === userEmail ? 'Me' : msg.from,
    senderAvatar: msg.from === userEmail
      ? 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=150&auto=format&fit=crop'
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.from)}&background=9333ea&color=fff`,
    text: msg.text,
    time: new Date(msg.timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    }),
    date: new Date(msg.timestamp).toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }))

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-white">
        <div className="p-4 border-b border-gray-200 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
        </div>
        <div className="flex-1 p-4 space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
              <div className="max-w-[70%] space-y-2">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-20 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Use real messages only - no more mock data
  const finalMessages = displayMessages

  const handleSendMessage = sendMessage

  // Get chat info based on chatId
  const getChatInfo = () => {
    if (chatId.includes('@')) {
      // Direct chat with email
      const displayName = chatId.split('@')[0];
      const formattedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);

      return {
        name: formattedName,
        fullName: chatId, // Show full email for clarity
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=9333ea&color=fff`,
        status: 'Online',
        type: 'direct',
        email: chatId // Store email for display
      }
    }

    // Fallback for mock data
    switch (chatId) {
      case '1':
        return {
          name: 'AI Innovation Team',
          avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=150&auto=format&fit=crop',
          status: 'Active',
          type: 'team',
          members: 5
        }
      case '2':
        return {
          name: 'Sarah Chen',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop',
          status: 'Online',
          type: 'direct'
        }
      default:
        return {
          name: chatId,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(chatId)}&background=9333ea&color=fff`,
          status: 'Online',
          type: 'direct'
        }
    }
  }

  const chatInfo = getChatInfo()

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 flex items-center gap-3 bg-white">
        <div className="relative">
          <img
            src={chatInfo.avatar}
            alt={chatInfo.name}
            className="w-12 h-12 rounded-full object-cover"
          />
          {chatInfo.status === 'Online' && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h3 className="font-medium text-gray-900">{chatInfo.name}</h3>
            {chatInfo.type === 'direct' && (
              <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                Freelancer
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <p className="text-green-600">
              {chatInfo.status}
            </p>
            {chatInfo.type === 'team' && (
              <span className="text-gray-600">• {chatInfo.members} members</span>
            )}
            {chatInfo.email && (
              <span className="text-gray-500 text-xs">• {chatInfo.email}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Connection Status Indicator */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs">
            {socketConnected ? (
              <>
                <Wifi size={12} className="text-green-500" />
                <span className="text-green-600">Connected</span>
              </>
            ) : (
              <>
                <WifiOff size={12} className="text-red-500" />
                <span className="text-red-600">Offline</span>
              </>
            )}
          </div>

          <button
            className="p-2 text-gray-500 hover:text-purple-600 rounded-full hover:bg-purple-50 transition-colors"
            title="Video call"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M23 7L16 12L23 17V7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <rect x="1" y="5" width="15" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </button>
          <button
            className="p-2 text-gray-500 hover:text-purple-600 rounded-full hover:bg-purple-50 transition-colors"
            title="Voice call"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 4.5C15 3.67157 14.3284 3 13.5 3C12.6716 3 12 3.67157 12 4.5V12.5C12 13.3284 12.6716 14 13.5 14C14.3284 14 15 13.3284 15 12.5V4.5Z" stroke="currentColor" strokeWidth="2"/>
              <path d="M19 10C19 13.866 15.866 17 12 17C8.13401 17 5 13.866 5 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M12 17V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M8 21H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
          <button
            className="p-2 text-gray-500 hover:text-purple-600 rounded-full hover:bg-purple-50 transition-colors"
            title="More options"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="1"/>
              <circle cx="19" cy="12" r="1"/>
              <circle cx="5" cy="12" r="1"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        <div className="space-y-4">
          {finalMessages.map((message, index) => {
            const showDate = index === 0 || message.date !== finalMessages[index - 1]?.date
            return (
              <div key={message.id}>
                {showDate && (
                  <div className="flex justify-center my-4">
                    <span className="bg-white px-3 py-1 rounded-full text-xs text-gray-500 shadow-sm">
                      {message.date}
                    </span>
                  </div>
                )}
                <div className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                  {message.sender !== 'me' && (
                    <img
                      src={message.senderAvatar}
                      alt={message.senderName}
                      className="w-8 h-8 rounded-full object-cover mr-2 mt-1"
                    />
                  )}
                  <div className="max-w-[70%]">
                    {message.sender !== 'me' && (
                      <p className="text-xs text-gray-600 mb-1 ml-1">{message.senderName}</p>
                    )}
                    <div
                      className={`p-3 rounded-lg ${
                        message.sender === 'me'
                          ? 'bg-purple-600 text-white'
                          : 'bg-white border border-gray-200 text-gray-900'
                      }`}
                    >
                      {message.text}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 px-1">
                      {message.time}
                    </div>
                  </div>
                  {message.sender === 'me' && (
                    <img
                      src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=150&auto=format&fit=crop"
                      alt="Me"
                      className="w-8 h-8 rounded-full object-cover ml-2 mt-1"
                    />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Message Input */}
      <ClientMessageInput onSendMessage={handleSendMessage} />
    </div>
  )
}