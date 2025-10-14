'use client'    
import React, { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { ChatsList } from '@/components/messages/ChatsList';
import { ChatConversation } from '@/components/messages/ChatConversation';
import { PeopleTab } from '@/components/messages/PeopleTab';
import { AddMemberForm } from '@/components/messages/AddMemberForm';
import { InviteSentConfirmation } from '@/components/messages/InviteSentConfirmation';
export default function MessagesPage() {
  const [activeTab, setActiveTab] = useState<'chats' | 'people'>('chats');
  const [selectedChatId, setSelectedChatId] = useState<string | null>('1');
  const [showAddMember, setShowAddMember] = useState(false);
  const [showInviteSuccess, setShowInviteSuccess] = useState(false);
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
      <div className="hidden md:block">
        <Sidebar />
      </div>
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="flex justify-between items-center p-4 border-b border-gray-200">
          <div className="md:hidden">
            <svg width="110" height="32" viewBox="0 0 40 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-8">
              <path d="M20.0001 0L0 11.5556V23.1111L20.0001 11.5556L40.0001 23.1111V11.5556L20.0001 0Z" fill="#FF3B30" />
              <path d="M0 23.1111L20.0001 11.5555V23.1111V34.6667L0 23.1111Z" fill="#34C759" />
              <path d="M40.0001 23.1111L20.0001 11.5555V23.1111V34.6667L40.0001 23.1111Z" fill="#007AFF" />
            </svg>
          </div>
          <div className="flex items-center ml-auto gap-4">
            <div className="flex items-center border rounded-full px-4 py-2 gap-2">
              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M2 12H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 2C14.5013 4.73835 15.9228 8.29203 16 12C15.9228 15.708 14.5013 19.2616 12 22C9.49872 19.2616 8.07725 15.708 8 12C8.07725 8.29203 9.49872 4.73835 12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-sm">Client</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full overflow-hidden">
                <img src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=300&auto=format&fit=crop" alt="Profile" className="w-full h-full object-cover" />
              </div>
              <span className="hidden md:inline">John Doe</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </header>
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
              {activeTab === 'chats' && <ChatsList onSelectChat={handleSelectChat} selectedChatId={selectedChatId} />}
              {activeTab === 'people' && !showAddMember && !showInviteSuccess && <PeopleTab onAddMember={handleAddMember} />}
              {activeTab === 'people' && showAddMember && !showInviteSuccess && <AddMemberForm onSendInvite={handleSendInvite} />}
              {activeTab === 'people' && showInviteSuccess && <InviteSentConfirmation onGoBack={handleBackToMembers} />}
            </div>
          </div>
          {/* Right Panel - Chat Conversation */}
          {activeTab === 'chats' && selectedChatId && <div className="hidden md:flex flex-1 flex-col">
              <ChatConversation chatId={selectedChatId} />
            </div>}
        </div>
      </div>
    </div>;
}