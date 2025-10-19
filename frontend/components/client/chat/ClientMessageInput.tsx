'use client'
import React, { useState } from 'react'
import { Paperclip, Image, Mic, Send, Smile, Loader2, Check, X } from 'lucide-react'

interface ClientMessageInputProps {
  onSendMessage: (message: string) => Promise<void>
}

export function ClientMessageInput({
  onSendMessage
}: ClientMessageInputProps) {
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [deliveryStatus, setDeliveryStatus] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() && !sending) {
      setSending(true)
      setDeliveryStatus('sending')

      try {
        await onSendMessage(message)
        setDeliveryStatus('sent')
        setMessage('')

        // Reset status after 2 seconds
        setTimeout(() => setDeliveryStatus('idle'), 2000)
      } catch (error) {
        console.error('Failed to send message:', error)
        setDeliveryStatus('failed')

        // Reset status after 3 seconds
        setTimeout(() => setDeliveryStatus('idle'), 3000)
      } finally {
        setSending(false)
      }
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
            className={`p-3 rounded-full transition-colors disabled:cursor-not-allowed flex items-center justify-center ${
              deliveryStatus === 'sending'
                ? 'bg-blue-600 hover:bg-blue-700'
                : deliveryStatus === 'sent'
                ? 'bg-green-600 hover:bg-green-700'
                : deliveryStatus === 'failed'
                ? 'bg-red-600 hover:bg-red-700'
                : message.trim() && !sending
                ? 'bg-purple-600 hover:bg-purple-700'
                : 'bg-gray-300'
            } text-white`}
            disabled={!message.trim() || sending}
            title={
              deliveryStatus === 'sending'
                ? 'Sending...'
                : deliveryStatus === 'sent'
                ? 'Message sent!'
                : deliveryStatus === 'failed'
                ? 'Failed to send - try again'
                : 'Send message'
            }
          >
            {sending ? (
              <Loader2 size={20} className="animate-spin" />
            ) : deliveryStatus === 'sent' ? (
              <Check size={20} />
            ) : deliveryStatus === 'failed' ? (
              <X size={20} />
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
      </form>
    </div>
  )
}