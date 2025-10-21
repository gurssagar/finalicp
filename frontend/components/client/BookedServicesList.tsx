'use client'
import React, { useState } from 'react'
import { BookedService } from '@/types/booking'
import {
  Calendar,
  Clock,
  DollarSign,
  User,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Check,
  AlertCircle,
  X,
  Package,
  Star,
  ExternalLink
} from 'lucide-react'

interface BookedServicesListProps {
  bookings: BookedService[]
  onStatusChange: (bookingId: string, newStatus: string) => void
  onRefresh: () => void
}

export function BookedServicesList({ bookings, onStatusChange, onRefresh }: BookedServicesListProps) {
  const [expandedBooking, setExpandedBooking] = useState<string | null>(null)

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return <AlertCircle size={16} className="text-green-600" />
      case 'completed':
        return <Check size={16} className="text-blue-600" />
      case 'cancelled':
        return <X size={16} className="text-red-600" />
      case 'pending':
        return <Clock size={16} className="text-yellow-600" />
      default:
        return <Package size={16} className="text-gray-600" />
    }
  }

  const getDaysRemaining = (deadline: Date) => {
    const now = new Date()
    const diffTime = deadline.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date)
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency === 'ICP' ? 'USD' : currency // ICP shown as USD equivalent
    }).format(amount)
  }

  const handleStartChat = (freelancerEmail: string) => {
    window.location.href = `/client/chat?chatId=${encodeURIComponent(freelancerEmail)}`
  }

  const handleViewService = (serviceId: string) => {
    window.location.href = `/client/service/${serviceId}`
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => {
        const isExpanded = expandedBooking === booking.id
        const daysRemaining = getDaysRemaining(booking.deliveryDeadline)
        const isOverdue = daysRemaining < 0

        return (
          <div
            key={booking.id}
            className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{booking.serviceTitle}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${getStatusColor(booking.status)}`}>
                      {getStatusIcon(booking.status)}
                      <span>{booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}</span>
                    </span>
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <User size={14} />
                      <span>{booking.freelancerName}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Package size={14} />
                      <span>{booking.packageTitle}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar size={14} />
                      <span>Booked {formatDate(booking.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xl font-bold text-gray-900">
                    {formatCurrency(booking.totalAmount, booking.currency)}
                  </div>
                  <div className="text-sm text-gray-600">{booking.currency}</div>
                </div>
              </div>
            </div>

            {/* Quick Actions Bar */}
            <div className="bg-gray-50 px-6 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`flex items-center space-x-1 text-sm ${isOverdue ? 'text-red-600' : 'text-gray-600'}`}>
                    <Clock size={14} />
                    <span>
                      {isOverdue
                        ? `${Math.abs(daysRemaining)} days overdue`
                        : daysRemaining === 0
                        ? 'Due today'
                        : `${daysRemaining} days remaining`
                      }
                    </span>
                  </div>
                  {booking.paymentStatus === 'completed' && (
                    <div className="flex items-center space-x-1 text-green-600 text-sm">
                      <Check size={14} />
                      <span>Paid</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleStartChat(booking.freelancerEmail)}
                    className="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm flex items-center space-x-1"
                  >
                    <MessageCircle size={14} />
                    <span>Chat</span>
                  </button>
                  <button
                    onClick={() => handleViewService(booking.serviceId)}
                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm flex items-center space-x-1"
                  >
                    <ExternalLink size={14} />
                    <span>View Service</span>
                  </button>
                  <button
                    onClick={() => setExpandedBooking(isExpanded ? null : booking.id)}
                    className="p-1 text-gray-500 hover:text-gray-700"
                  >
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Expanded Details */}
            {isExpanded && (
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Service Details */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Service Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Package:</span>
                        <span className="font-medium">{booking.packageTitle}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Description:</span>
                        <span className="font-medium text-right max-w-xs">{booking.packageDescription}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Service ID:</span>
                        <span className="font-mono text-xs">{booking.serviceId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Booking ID:</span>
                        <span className="font-mono text-xs">{booking.id}</span>
                      </div>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Timeline</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Booked:</span>
                        <span>{formatDate(booking.createdAt)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Delivery Deadline:</span>
                        <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                          {formatDate(booking.deliveryDeadline)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Last Updated:</span>
                        <span>{formatDate(booking.lastUpdated)}</span>
                      </div>
                      {booking.specialInstructions && (
                        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                          <p className="text-sm font-medium text-amber-900 mb-1">Special Instructions:</p>
                          <p className="text-xs text-amber-800">{booking.specialInstructions}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex flex-wrap gap-3">
                    {booking.status === 'active' && (
                      <>
                        <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm flex items-center space-x-2">
                          <MessageCircle size={16} />
                          <span>Start Chat</span>
                        </button>
                        <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm flex items-center space-x-2">
                          <Package size={16} />
                          <span>View Deliverables</span>
                        </button>
                      </>
                    )}
                    {booking.status === 'completed' && (
                      <>
                        <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm flex items-center space-x-2">
                          <Star size={16} />
                          <span>Leave Review</span>
                        </button>
                        <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm flex items-center space-x-2">
                          <Package size={16} />
                          <span>Book Again</span>
                        </button>
                      </>
                    )}
                    <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm flex items-center space-x-2">
                      <ExternalLink size={16} />
                      <span>View Service</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}