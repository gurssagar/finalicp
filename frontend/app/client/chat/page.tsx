'use client'
import React, { useState, useEffect } from 'react'
import { MessageSquare, Users, Plus, Search } from 'lucide-react'
import { ClientChatsList } from '../../../components/client/chat/ClientChatsList'
import { ClientChatConversation } from '../../../components/client/chat/ClientChatConversation'
import ClientLayout from '../layout'

export default function ChatPage() {
  const [selectedChatId, setSelectedChatId] = useState<string | null>('1')
  const [activeTab, setActiveTab] = useState<'chats' | 'teams'>('chats')
  const [userEmail, setUserEmail] = useState<string>('')

  // Load user email from URL params, session storage, or auth context
  useEffect(() => {
    const getUserEmail = () => {
      // First check if coming from booking with a freelancer
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search)
        const withParam = urlParams.get('with')

        if (withParam) {
          return withParam // This is the freelancer's email for chat
        }

        // Check session storage for logged-in user
        const sessionEmail = sessionStorage.getItem('userEmail')
        if (sessionEmail) {
          return sessionEmail
        }

        // Check localStorage for persistence
        const localEmail = localStorage.getItem('userEmail')
        if (localEmail) {
          return localEmail
        }
      }

      // Fallback for development - this should be replaced with real auth
      return 'client@example.com'
    }

    const userEmail = getUserEmail()
    setUserEmail(userEmail)

    // Check if we should pre-select a chat from URL params
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const withParam = urlParams.get('with')

      if (withParam) {
        setSelectedChatId(withParam)
      }
    }

    // Also authenticate with the canister
    const authenticateWithCanister = async () => {
      try {
        const response = await fetch('/api/chat/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: userEmail,
            displayName: 'Client User'
          })
        })
        const data = await response.json()
        console.log('Authentication result:', data)
      } catch (error) {
        console.error('Authentication error:', error)
      }
    }

    if (userEmail) {
      authenticateWithCanister()
    }
  }, [])

  const handleSelectChat = (chatId: string) => {
    setSelectedChatId(chatId)
  }

  const handleTabChange = (tab: 'chats' | 'teams') => {
    setActiveTab(tab)
  }

  const handleNewChat = () => {
    // Logic to create new chat
    console.log('Create new chat')
  }

  return (
   
      <div className="h-full flex flex-col bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">Messages</h1>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 -mb-4">
              <button
                onClick={() => handleTabChange('chats')}
                className={`px-4 py-2 text-sm font-medium relative ${
                  activeTab === 'chats'
                    ? 'text-purple-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <MessageSquare size={16} />
                  <span>Chats</span>
                </div>
                {activeTab === 'chats' && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-600"></div>
                )}
              </button>
              <button
                onClick={() => handleTabChange('teams')}
                className={`px-4 py-2 text-sm font-medium relative ${
                  activeTab === 'teams'
                    ? 'text-purple-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Users size={16} />
                  <span>Teams</span>
                </div>
                {activeTab === 'teams' && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-600"></div>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search conversations..."
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            </div>
            <button
              onClick={handleNewChat}
              className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              title="New conversation"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>

        {/* Chat Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Chat List */}
          <div className="w-full md:w-1/3 border-r border-gray-200 flex flex-col">
            {activeTab === 'chats' && (
              <ClientChatsList
                onSelectChat={handleSelectChat}
                selectedChatId={selectedChatId}
                userEmail={userEmail}
              />
            )}
            {activeTab === 'teams' && (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Users size={48} className="mx-auto mb-4 text-gray-300" />
                  <p className="font-medium">Team Chat</p>
                  <p className="text-sm mt-2">Connect with your hackathon teams</p>
                  <button className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm">
                    Create New Team
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Chat Conversation */}
          {selectedChatId ? (
            <div className="hidden md:flex flex-1 flex-col">
              <ClientChatConversation chatId={selectedChatId} userEmail={userEmail} />
            </div>
          ) : (
            <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50">
              <div className="text-center">
                <MessageSquare size={64} className="mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                <p className="text-gray-500">Choose a chat from the left to start messaging</p>
              </div>
            </div>
          )}

          {/* Mobile - Show conversation when selected */}
          {selectedChatId && (
            <div className="md:hidden flex-1 flex flex-col absolute inset-0 bg-white z-10">
              <ClientChatConversation chatId={selectedChatId} userEmail={userEmail} />
            </div>
          )}
        </div>
      </div>
   
  )
}