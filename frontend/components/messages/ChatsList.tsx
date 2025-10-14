'use client'
import React from 'react';
import { Search } from 'lucide-react';
interface ChatsListProps {
  onSelectChat: (chatId: string) => void;
  selectedChatId: string | null;
}
export function ChatsList({
  onSelectChat,
  selectedChatId
}: ChatsListProps) {
  // Mock data for chat list
  const chats = [{
    id: '1',
    name: 'Micheal Jackson',
    avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=150&auto=format&fit=crop',
    lastMessage: 'You have very good work',
    time: '9:00 Am',
    unread: 0
  }, {
    id: '2',
    name: 'Micheal Jackson',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop',
    lastMessage: 'You have very good work',
    time: '9:00 Am',
    unread: 1
  }, {
    id: '3',
    name: 'Micheal Jackson',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=150&auto=format&fit=crop',
    lastMessage: 'You have very good work',
    time: '9:00 Am',
    unread: 1
  }];
  return <div className="flex flex-col h-full">
      {/* Search Bar */}
      <div className="p-4">
        <div className="relative">
          <input type="text" placeholder="Search your messages..." className="w-full py-3 pl-4 pr-12 rounded-full border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-amber-500 rounded-full p-2">
            <Search size={18} className="text-white" />
          </div>
        </div>
      </div>
      {/* Chats List */}
      <div className="flex-1 overflow-y-auto">
        {chats.map(chat => <div key={chat.id} onClick={() => onSelectChat(chat.id)} className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 ${selectedChatId === chat.id ? 'bg-gray-50' : ''}`}>
            <div className="relative">
              <img src={chat.avatar} alt={chat.name} className="w-12 h-12 rounded-full object-cover" />
              {chat.unread > 0 && <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {chat.unread}
                </div>}
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
          </div>)}
      </div>
    </div>;
}