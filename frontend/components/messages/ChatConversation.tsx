'use client'
import React, { useState } from 'react';
import { MessageInput } from './MessageInput';
interface ChatConversationProps {
  chatId: string;
}
export function ChatConversation({
  chatId
}: ChatConversationProps) {
  const [messages, setMessages] = useState([{
    id: '1',
    sender: 'other',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididun.',
    time: '11:00 Am',
    date: '20 Nov 2022'
  }, {
    id: '2',
    sender: 'other',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididun.',
    time: '11:00 Am',
    date: '20 Nov 2022'
  }, {
    id: '3',
    sender: 'me',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididun.Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididun.',
    time: '11:00 Am',
    date: '20 Nov 2022'
  }, {
    id: '4',
    sender: 'other',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididun.',
    time: '11:00 Am',
    date: '20 Nov 2022'
  }]);
  const [typingMessage, setTypingMessage] = useState('');
  const handleSendMessage = (message: string) => {
    if (message.trim()) {
      const newMessage = {
        id: Date.now().toString(),
        sender: 'me',
        text: message,
        time: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        }),
        date: new Date().toLocaleDateString('en-US', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        })
      };
      setMessages([...messages, newMessage]);
      setTypingMessage('');
    }
  };
  return <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 flex items-center gap-3">
        <div className="relative">
          <img src="https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=150&auto=format&fit=crop" alt="Micheal Jackson" className="w-12 h-12 rounded-full object-cover" />
        </div>
        <div>
          <h3 className="font-medium text-gray-900">Micheal Jackson</h3>
          <p className="text-sm text-green-500">Online</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="text-sm text-gray-500">Switch</div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
            <div className="relative group">
              <span className="text-sm">Cryptogenic</span>
              <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10 hidden group-hover:block">
                <div className="py-2">
                  <div className="px-4 py-2 hover:bg-gray-100">Cryptogenic</div>
                  <div className="px-4 py-2 hover:bg-gray-100">Meme Team</div>
                  <div className="px-4 py-2 hover:bg-gray-100">
                    Check The Box
                  </div>
                  <div className="px-4 py-2 hover:bg-gray-100">Drop Dude</div>
                </div>
              </div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        <div className="space-y-6">
          {messages.map(message => <div key={message.id} className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
              {message.sender !== 'me' && <img src="https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=150&auto=format&fit=crop" alt="Micheal Jackson" className="w-10 h-10 rounded-full object-cover mr-3 mt-1" />}
              <div className="max-w-[70%]">
                <div className={`p-3 rounded-lg ${message.sender === 'me' ? 'bg-gray-800 text-white' : 'bg-white border border-gray-200'}`}>
                  {message.text}
                </div>
                <div className="text-xs text-gray-500 mt-1 flex justify-between">
                  <span>{message.date}</span>
                  <span>{message.time}</span>
                </div>
              </div>
              {message.sender === 'me' && <img src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=150&auto=format&fit=crop" alt="Me" className="w-10 h-10 rounded-full object-cover ml-3 mt-1" />}
            </div>)}
        </div>
      </div>
      {/* Message Input */}
      <MessageInput onSendMessage={handleSendMessage} />
    </div>;
}