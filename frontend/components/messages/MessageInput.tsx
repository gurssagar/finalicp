'use client'
import React, { useState, useEffect, useRef } from 'react';
import { Paperclip, Image, Mic, Send } from 'lucide-react';
interface MessageInputProps {
  onSendMessage: (message: string) => void;
  onTypingIndicator?: (isTyping: boolean) => void;
}
export function MessageInput({
  onSendMessage,
  onTypingIndicator
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Handle typing indicator
  const handleTyping = (value: string) => {
    setMessage(value);

    // Send typing indicator if callback is provided
    if (onTypingIndicator) {
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Send typing indicator
      onTypingIndicator(true);

      // Set timeout to stop typing indicator after 1 second of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        onTypingIndicator(false);
      }, 1000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (message.trim()) {
      await onSendMessage(message);
      setMessage('');

      // Stop typing indicator
      if (onTypingIndicator && typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        onTypingIndicator(false);
      }
    }
  };

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);
  return <div className="p-4 border-t border-gray-200">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <button type="button" className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100">
          <Paperclip size={20} />
        </button>
        <div className="flex-1 relative">
          <input
            type="text"
            value={message}
            onChange={e => handleTyping(e.target.value)}
            placeholder="Type a message here"
            className="w-full py-3 pl-4 pr-10 rounded-full border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
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