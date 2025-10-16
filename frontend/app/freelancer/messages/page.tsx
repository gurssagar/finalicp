'use client'
import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { ChatsList } from '@/components/messages/ChatsList';
import { ChatConversation } from '@/components/messages/ChatConversation';
import { PeopleTab } from '@/components/messages/PeopleTab';
import { AddMemberForm } from '@/components/messages/AddMemberForm';
import { InviteSentConfirmation } from '@/components/messages/InviteSentConfirmation';

export default function MessagesPage() {
  const [activeTab, setActiveTab] = useState<'chats' | 'people'>('chats');
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showInviteSuccess, setShowInviteSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const [userType, setUserType] = useState<'client' | 'freelancer' | 'both'>('both');

  // Load user information from session/storage
  useEffect(() => {
    // Check user type and email from session
    // This would typically come from your authentication system
    const checkUserSession = async () => {
      try {
        const response = await fetch('/api/profile/check-completeness')
        const data = await response.json()

        if (data.success) {
          setUserEmail(data.email || 'user@example.com')
          // Determine user type based on available features
          const hasClientFeatures = data.is_client || false
          const hasFreelancerFeatures = data.is_freelancer || false

          if (hasClientFeatures && hasFreelancerFeatures) {
            setUserType('both')
          } else if (hasClientFeatures) {
            setUserType('client')
          } else if (hasFreelancerFeatures) {
            setUserType('freelancer')
          }
        } else {
          // Fallback for demo purposes
          setUserEmail('demo@example.com')
        }
      } catch (error) {
        console.error('Error checking user session:', error)
        // Fallback for demo purposes
        setUserEmail('demo@example.com')
      }
    }

    checkUserSession()

    // Authenticate with the canister
    const authenticateWithCanister = async () => {
      if (userEmail) {
        try {
          const response = await fetch('/api/chat/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: userEmail,
              displayName: userType === 'both' ? 'User' : (userType === 'client' ? 'Client' : 'Freelancer')
            })
          })
          const data = await response.json()
          console.log('Authentication result:', data)
        } catch (error) {
          console.error('Authentication error:', error)
        }
      }
    }

    if (userEmail) {
      authenticateWithCanister()
    }
  }, [userEmail, userType])
  const handleTabChange = (tab: 'chats' | 'people') => {
    setActiveTab(tab);
  };
  const handleSelectChat = (chatId: string) => {
    setSelectedChatId(chatId);
  };
  const handleAddMember = () => {
    setShowAddMember(true);
  };
  const handleSendInvite = () => {
    setShowAddMember(false);
    setShowInviteSuccess(true);
  };
  const handleBackToMembers = () => {
    setShowInviteSuccess(false);
  };
  return <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
       
        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel */}
          <div className="w-full md:w-1/3 border-r border-gray-200 flex flex-col">
            <div className="p-6">
              <h1 className="text-2xl font-bold">Messages</h1>
            </div>
            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              <button onClick={() => handleTabChange('chats')} className={`flex-1 py-4 text-center relative ${activeTab === 'chats' ? 'text-blue-500 font-medium' : 'text-gray-500'}`}>
                Chats
                {activeTab === 'chats' && <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-500"></div>}
              </button>
              <button onClick={() => handleTabChange('people')} className={`flex-1 py-4 text-center relative ${activeTab === 'people' ? 'text-blue-500 font-medium' : 'text-gray-500'}`}>
                People
                {activeTab === 'people' && <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-500"></div>}
              </button>
            </div>
            {/* Content based on active tab */}
            <div className="flex-1 overflow-y-auto">
              {activeTab === 'chats' && (
                <ChatsList
                  onSelectChat={handleSelectChat}
                  selectedChatId={selectedChatId}
                  userEmail={userEmail}
                  userType={userType}
                />
              )}
              {activeTab === 'people' && !showAddMember && !showInviteSuccess && <PeopleTab onAddMember={handleAddMember} />}
              {activeTab === 'people' && showAddMember && !showInviteSuccess && <AddMemberForm onSendInvite={handleSendInvite} />}
              {activeTab === 'people' && showInviteSuccess && <InviteSentConfirmation onGoBack={handleBackToMembers} />}
            </div>
          </div>
          {/* Right Panel - Chat Conversation */}
          {activeTab === 'chats' && selectedChatId && (
            <div className="hidden md:flex flex-1 flex-col">
              <ChatConversation
                chatId={selectedChatId}
                userEmail={userEmail}
                userType={userType}
              />
            </div>
          )}
        </div>
      </div>
    </div>;
}