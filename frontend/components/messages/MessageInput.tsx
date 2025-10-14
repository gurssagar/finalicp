'use client'
import React, { useState } from 'react';
import { Paperclip, Image, Mic, Send } from 'lucide-react';
interface MessageInputProps {
  onSendMessage: (message: string) => void;
}
export function MessageInput({
  onSendMessage
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSendMessage(message);
    setMessage('');
  };
  return <div className="p-4 border-t border-gray-200">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <button type="button" className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100">
          <Paperclip size={20} />
        </button>
        <div className="flex-1 relative">
          <input type="text" value={message} onChange={e => setMessage(e.target.value)} placeholder="Type a message here" className="w-full py-3 pl-4 pr-10 rounded-full border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500" />
        </div>
        <div className="flex gap-2">
          <button type="button" className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100">
            <Image size={20} />
          </button>
          <button type="button" className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100">
            <Mic size={20} />
          </button>
          <button type="submit" className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600" disabled={!message.trim()}>
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>;
}