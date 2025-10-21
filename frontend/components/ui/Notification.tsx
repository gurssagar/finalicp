'use client'

import React, { useEffect } from 'react'
import { CheckCircle, XCircle, X, AlertCircle, Info } from 'lucide-react'

interface NotificationProps {
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  onClose: () => void
  duration?: number
}

export function Notification({
  type,
  message,
  onClose,
  duration = 5000
}: NotificationProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  const getNotificationStyles = () => {
    switch (type) {
      case 'success':
        return {
          container: 'bg-green-50 border-green-200 text-green-800',
          icon: 'text-green-500',
          Icon: CheckCircle
        }
      case 'error':
        return {
          container: 'bg-red-50 border-red-200 text-red-800',
          icon: 'text-red-500',
          Icon: XCircle
        }
      case 'warning':
        return {
          container: 'bg-orange-50 border-orange-200 text-orange-800',
          icon: 'text-orange-500',
          Icon: AlertCircle
        }
      case 'info':
        return {
          container: 'bg-blue-50 border-blue-200 text-blue-800',
          icon: 'text-blue-500',
          Icon: Info
        }
      default:
        return {
          container: 'bg-gray-50 border-gray-200 text-gray-800',
          icon: 'text-gray-500',
          Icon: Info
        }
    }
  }

  const styles = getNotificationStyles()
  const { Icon } = styles

  return (
    <div className={`fixed top-4 right-4 max-w-sm w-full border rounded-lg shadow-lg p-4 z-50 animate-slide-in ${styles.container}`}>
      <div className="flex items-start space-x-3">
        <Icon size={20} className={`flex-shrink-0 mt-0.5 ${styles.icon}`} />

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">
            {message}
          </p>
        </div>

        <button
          onClick={onClose}
          className={`flex-shrink-0 p-1 rounded-full hover:bg-black hover:bg-opacity-10 transition-colors ${styles.icon}`}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}

interface NotificationContainerProps {
  notifications: Array<{
    id: string
    type: 'success' | 'error' | 'warning' | 'info'
    message: string
  }>
  onClose: (id: string) => void
}

export function NotificationContainer({
  notifications,
  onClose
}: NotificationContainerProps) {
  if (notifications.length === 0) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <div key={notification.id}>
          <Notification
            type={notification.type}
            message={notification.message}
            onClose={() => onClose(notification.id)}
          />
        </div>
      ))}
    </div>
  )
}