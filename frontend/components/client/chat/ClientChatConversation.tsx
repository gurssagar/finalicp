'use client'
import React, { useState, useEffect, useCallback } from 'react'
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
  const [canChatPermission, setCanChatPermission] = useState<boolean | null>(null)
  const [permissionLoading, setPermissionLoading] = useState(true)

  // Initialize Socket.IO and load chat history when chatId changes
  useEffect(() => {
    if (!chatId || !userEmail) return

    const initializeChat = async () => {
      try {
        // Check chat permissions first
        await checkChatPermissions();

        // First, authenticate user for chat storage
        await authenticateUserForChat();

        // Initialize Socket.IO connection
        const connected = await socketService.connect(userEmail)
        if (connected) {
          console.log('[ClientChat] Socket connected')
        } else {
          console.warn('[ClientChat] Socket connection failed')
        }

        // Load chat history from storage canister (permission will be checked after it's set)
        await loadChatHistory()
      } catch (error) {
        console.error('[ClientChat] Chat initialization error:', error)
      } finally {
        setLoading(false)
        setPermissionLoading(false)
      }
    }

    // Check if users have permission to chat
    const checkChatPermissions = async () => {
      try {
        const response = await fetch('/api/chat/can-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userEmail: userEmail,
            otherUserEmail: chatId
          })
        })

        if (response.ok) {
          const data = await response.json()
          setCanChatPermission(data.canChat)
          console.log('[ClientChat] Chat permission check:', data.canChat)
        } else {
          console.warn('[ClientChat] Permission check failed')
          setCanChatPermission(false)
        }
      } catch (error) {
        console.error('[ClientChat] Permission check error:', error)
        setCanChatPermission(false)
      }
    }

    // Authenticate user for chat storage
    const authenticateUserForChat = async () => {
      try {
        const displayName = userEmail.split('@')[0]; // Use email prefix as display name
        const response = await fetch('/api/chat/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: userEmail, displayName })
        })

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            console.log('[ClientChat] User authenticated for chat storage');
          }
        }
      } catch (error) {
        console.warn('[ClientChat] Chat authentication failed:', error);
      }
    }

    initializeChat()

    // Cleanup on unmount
    return () => {
      // Don't disconnect here as it might be used by other components
    }
  }, [chatId, userEmail])

  // Load chat history from storage canister
  const loadChatHistory = useCallback(async () => {
    try {
      // Only load history if user has permission to chat
      if (canChatPermission === false) {
        console.log('[ClientChat] Skipping chat history load - no permission');
        return;
      }

      const response = await fetch(
        `/api/chat/history?userEmail=${encodeURIComponent(userEmail)}&contactEmail=${encodeURIComponent(chatId)}&limit=50&offset=0`
      )
      const data = await response.json()

      if (data.success) {
        setMessages(data.messages || [])
        console.log(`[ClientChat] Loaded ${data.messages?.length || 0} messages from history`);
      }
    } catch (error) {
      console.error('Error loading chat history:', error)
    }
  }, [canChatPermission, userEmail, chatId])

  // Reload chat history when permission is granted
  useEffect(() => {
    if (canChatPermission === true && !loading) {
      loadChatHistory()
    }
  }, [canChatPermission, loading, loadChatHistory])

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

    // Check if user has permission to chat
    if (canChatPermission === false) {
      throw new Error('You do not have permission to chat with this user. An active booking relationship is required.')
    }

    // Wait for permission check to complete if still loading
    if (canChatPermission === null && permissionLoading) {
      throw new Error('Checking chat permissions... Please wait.')
    }

    const messageText = text.trim()
    const timestamp = new Date().toISOString()
    const displayName = userEmail.split('@')[0]

    // Try Socket.IO first if connected
    if (socketConnected) {
      try {
        const result = await socketService.sendPrivateMessage({
          to: chatId,
          text: messageText,
          timestamp
        })
        if (result.success) {
          // Add message to local state immediately for better UX
          const optimisticMessage: Message = {
            id: `socket-${Date.now()}`,
            from: userEmail,
            to: chatId,
            text: messageText,
            timestamp: result.timestamp || timestamp,
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
          text: messageText,
          messageType: 'text',
          timestamp,
          displayName
        })
      })

      const data = await response.json()
      if (response.ok && data.success) {
        const storedMessage: Message = {
          id: data.messageId || `storage-${Date.now()}`,
          from: userEmail,
          to: chatId,
          text: messageText,
          timestamp,
          delivered: true,
          read: false,
          messageType: 'text'
        }
        setMessages(prev => [...prev, storedMessage])
        console.log('[ClientChat] Message saved to ICP:', data.messageId)
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

  // Show permission checking state
  if (permissionLoading) {
    return (
      <div className="flex flex-col h-full bg-white">
        <div className="p-4 border-b border-gray-200 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-32"></div>
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Checking chat permissions...</p>
            <p className="text-sm text-gray-500 mt-2">Verifying booking relationship</p>
          </div>
        </div>
      </div>
    )
  }

  // Show permission denied state
  if (canChatPermission === false) {
    return (
      <div className="flex flex-col h-full bg-white">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(chatId)}&background=ef4444&color=fff`}
              alt={chatId}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-medium text-gray-900">{chatId.split('@')[0]}</h3>
                <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded-full">
                  No Access
                </span>
              </div>
              <p className="text-sm text-red-600">Chat not available</p>
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Chat Access Restricted</h3>
            <p className="text-gray-600 mb-4">
              You can only chat with freelancers you have an active or completed booking relationship with.
              To start a conversation, please book their service first.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-sm text-amber-800">
                <strong>Already have a booking?</strong><br/>
                If you have an active or completed booking with this freelancer, please try refreshing the page.
                Otherwise, browse available services and complete a booking to enable chat.
              </p>
            </div>
            <div className="mt-4 flex space-x-3">
              <button
                onClick={() => window.location.href = '/client/browse-services'}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
              >
                Browse Services
              </button>
              <button
                onClick={() => window.location.href = '/client/booked-services'}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
              >
                View My Bookings
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

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