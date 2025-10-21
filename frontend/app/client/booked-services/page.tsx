'use client'
import React, { useState, useEffect } from 'react'
import { BookedServicesList } from '@/components/client/BookedServicesList'
import { BookedService } from '@/types/booking'

export default function BookedServicesPage() {
  const [bookings, setBookings] = useState<BookedService[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    fetchBookings()
  }, [filter])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const userEmail = localStorage.getItem('userEmail') || 'client@example.com' // Fallback for testing

      let url = `/api/marketplace/bookings?user_id=${encodeURIComponent(userEmail)}&user_type=client`
      if (filter !== 'all') {
        url += `&status=${encodeURIComponent(filter)}`
      }

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      if (data.success) {
        // Transform data to match BookedService interface
        const transformedBookings: BookedService[] = data.data.map((booking: any) => ({
          id: booking.booking_id,
          serviceTitle: booking.service_title || 'Service Title',
          serviceId: booking.service_id,
          freelancerName: booking.freelancer_id?.split('@')[0] || 'Freelancer',
          freelancerEmail: booking.freelancer_id,
          status: booking.status,
          totalAmount: Number(booking.total_amount_e8s) / 100000000, // Convert from e8s to ICP
          currency: 'ICP',
          createdAt: new Date(booking.created_at),
          deliveryDeadline: new Date(booking.created_at + (7 * 24 * 60 * 60 * 1000)), // 7 days from creation
          packageTitle: booking.package_title || 'Standard Package',
          packageDescription: booking.package_description || 'Service package',
          lastUpdated: new Date(booking.last_updated || booking.created_at),
          paymentStatus: 'completed', // Default for now
          specialInstructions: booking.special_instructions || '',
          milestones: booking.milestones || []
        }))
        setBookings(transformedBookings)
      } else {
        throw new Error(data.error || 'Failed to fetch bookings')
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
      setError(error instanceof Error ? error.message : 'Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/marketplace/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        fetchBookings() // Refresh bookings
      } else {
        throw new Error('Failed to update booking status')
      }
    } catch (error) {
      console.error('Error updating booking:', error)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-32"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error Loading Bookings</h3>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          <button
            onClick={fetchBookings}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Booked Services</h1>
        <p className="text-gray-600">Manage and track all your service bookings</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex items-center space-x-4">
        <span className="text-sm font-medium text-gray-700">Filter by status:</span>
        <div className="flex space-x-2">
          {['all', 'active', 'completed', 'cancelled'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filter === status
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      {bookings.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
          <p className="text-gray-600 mb-4">
            {filter === 'all'
              ? "You haven't booked any services yet. Browse available services to get started."
              : `No ${filter} bookings found. Try a different filter.`
            }
          </p>
          {filter === 'all' && (
            <a
              href="/client/browse-services"
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Browse Services
            </a>
          )}
        </div>
      ) : (
        <BookedServicesList
          bookings={bookings}
          onStatusChange={handleStatusChange}
          onRefresh={fetchBookings}
        />
      )}
    </div>
  )
}