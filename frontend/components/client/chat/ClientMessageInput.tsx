'use client'
import React, { useState } from 'react'
import { Paperclip, Image, Mic, Send, Smile } from 'lucide-react'

interface ClientMessageInputProps {
  onSendMessage: (message: string) => void
}

export function ClientMessageInput({
  onSendMessage
}: ClientMessageInputProps) {
  const [message, setMessage] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim()) {
      onSendMessage(message)
      setMessage('')
    }
  }

  return (
    <div className="p-4 border-t border-gray-200 bg-white">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <button
          type="button"
          className="p-2 text-gray-500 hover:text-purple-600 rounded-full hover:bg-purple-50 transition-colors"
          title="Attach file"
        >
          <Paperclip size={20} />
        </button>

        <div className="flex-1 relative">
          <input
            type="text"
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="w-full py-3 pl-4 pr-10 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <button
            type="button"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-purple-600 transition-colors"
            title="Add emoji"
          >
            <Smile size={20} />
          </button>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            className="p-2 text-gray-500 hover:text-purple-600 rounded-full hover:bg-purple-50 transition-colors"
            title="Share image"
          >
            <Image size={20} />
          </button>

          <button
            type="button"
            className="p-2 text-gray-500 hover:text-purple-600 rounded-full hover:bg-purple-50 transition-colors"
            title="Voice message"
          >
            <Mic size={20} />
          </button>

          <button
            type="submit"
            className="p-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            disabled={!message.trim()}
            title="Send message"
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  )
}