'use client'
import React, { useState, useEffect } from 'react'
import ProfileStatus from '@/components/ProfileStatus'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Check, Clock, Plus } from 'lucide-react'
import { useBookings } from '@/hooks/useMarketplace'
import { getCurrentSession } from '@/lib/actions/auth'

export default function DashboardHome() {
  const router = useRouter()
  const [userId, setUserId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState([
    {
      title: 'Total Earnings',
      value: '$0.00',
      change: '+0%',
      subtitle: 'USD EQUIVALENT',
      icon: '$',
    },
    {
      title: 'Active Projects',
      value: '0',
      change: '+0%',
      subtitle: 'IN PROGRESS',
      icon: '📄',
    },
    {
      title: 'Completed',
      value: '0%',
      change: '+0%',
      subtitle: 'PROJECTS FINISHED',
      icon: '✓',
    },
    {
      title: 'Success Rate',
      value: '0%',
      change: '+0%',
      subtitle: 'CLIENT SATISFACTION',
      icon: '📈',
    },
  ])
  const [recentProjects, setRecentProjects] = useState<any[]>([])

  // Get user session
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const session = await getCurrentSession()
        if (session?.email) {
          setUserId(session.email)
        } else {
          router.push('/login')
        }
      } catch (error) {
        console.error('Error fetching session:', error)
        router.push('/login')
      }
    }
    fetchSession()
  }, [router])

  // Fetch bookings for freelancer
  const { bookings, loading: bookingsLoading, error: bookingsError } = useBookings(
    userId,
    'freelancer'
  )

  // Log bookings data when it changes
  useEffect(() => {
    if (userId) {
      console.log('🔍 Dashboard - Fetching bookings for freelancer:', userId)
    }
  }, [userId])

  useEffect(() => {
    console.log('📊 Dashboard - Bookings data received:', {
      bookingsCount: bookings?.length || 0,
      bookings: bookings,
      loading: bookingsLoading,
      error: bookingsError,
      userId: userId
    })
    
    if (bookingsError) {
      console.error('❌ Dashboard - Error fetching bookings:', bookingsError)
    }
  }, [bookings, bookingsLoading, bookingsError, userId])

  // Calculate metrics from bookings
  useEffect(() => {
    if (!bookings || bookings.length === 0) {
      console.log('⚠️ Dashboard - No bookings found for freelancer:', userId)
      setMetrics([
        {
          title: 'Total Earnings',
          value: '$0.00',
          change: '+0%',
          subtitle: 'USD EQUIVALENT',
          icon: '$',
        },
        {
          title: 'Active Projects',
          value: '0',
          change: '+0%',
          subtitle: 'IN PROGRESS',
          icon: '📄',
        },
        {
          title: 'Completed',
          value: '0%',
          change: '+0%',
          subtitle: 'PROJECTS FINISHED',
          icon: '✓',
        },
        {
          title: 'Success Rate',
          value: '0%',
          change: '+0%',
          subtitle: 'CLIENT SATISFACTION',
          icon: '📈',
        },
      ])
      setRecentProjects([])
      setLoading(false)
      return
    }

    console.log('📈 Dashboard - Calculating metrics from bookings:', {
      totalBookings: bookings.length,
      bookings: bookings.map(b => ({
        booking_id: b.booking_id,
        status: b.status,
        total_amount_e8s: b.total_amount_e8s,
        escrow_amount_e8s: b.escrow_amount_e8s,
        client_id: b.client_id,
        freelancer_id: b.freelancer_id,
        created_at: b.created_at
      }))
    })

    // Calculate statistics from bookings
    let totalEarnings = 0
    let activeProjects = 0
    let completedProjects = 0
    let totalProjects = 0

    bookings.forEach(booking => {
      // Convert e8s to ICP, then to USD (assuming $10 per ICP)
      const amountE8s = Number(booking.total_amount_e8s || booking.escrow_amount_e8s || 0)
      const amountICP = amountE8s / 100000000
      const amountUSD = amountICP * 10 // Assuming $10 per ICP

      // Total earnings (completed bookings only)
      if (booking.status === 'Completed') {
        totalEarnings += amountUSD
        completedProjects++
      }

      // Active projects
      if (booking.status === 'Active' || booking.status === 'InProgress') {
        activeProjects++
      }

      // Count total projects (excluding cancelled)
      if (booking.status !== 'Cancelled') {
        totalProjects++
      }
    })

    // Calculate completion rate
    const completionRate = totalProjects > 0 
      ? Math.round((completedProjects / totalProjects) * 100) 
      : 0

    // Success rate (completed vs total, excluding cancelled)
    const cancelledCount = bookings.filter(b => b.status === 'Cancelled').length
    const validProjects = totalProjects || 1 // Avoid division by zero
    const successRate = Math.round((completedProjects / validProjects) * 100)

    console.log('📊 Dashboard - Calculated metrics:', {
      totalEarnings,
      activeProjects,
      completedProjects,
      totalProjects,
      cancelledCount,
      completionRate,
      successRate
    })

    // Update metrics
    setMetrics([
      {
        title: 'Total Earnings',
        value: `$${totalEarnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        change: '+0%', // TODO: Calculate from previous period
        subtitle: 'USD EQUIVALENT',
        icon: '$',
      },
      {
        title: 'Active Projects',
        value: activeProjects.toString(),
        change: '+0%', // TODO: Calculate from previous period
        subtitle: 'IN PROGRESS',
        icon: '📄',
      },
      {
        title: 'Completed',
        value: `${completionRate}%`,
        change: '+0%', // TODO: Calculate from previous period
        subtitle: 'PROJECTS FINISHED',
        icon: '✓',
      },
      {
        title: 'Success Rate',
        value: `${successRate}%`,
        change: '+0%', // TODO: Calculate from previous period
        subtitle: 'CLIENT SATISFACTION',
        icon: '📈',
      },
    ])

    // Transform recent bookings to recent projects
    console.log('🔄 Dashboard - Transforming bookings to projects...')
    const transformedProjects = bookings
      .sort((a, b) => Number(b.created_at) - Number(a.created_at)) // Sort by most recent
      .slice(0, 4) // Get top 4 most recent
      .map(booking => {
        const amountE8s = Number(booking.total_amount_e8s || booking.escrow_amount_e8s || 0)
        const amountICP = amountE8s / 100000000
        const createdDate = new Date(Number(booking.created_at) / 1000000)
        
        return {
          id: booking.booking_id,
          title: (booking as any).service_title || (booking as any).package_title || 'Project',
          amount: `+${amountICP.toFixed(2)} ICP`,
          status: booking.status === 'Completed' ? 'Completed' : 
                  booking.status === 'Active' || booking.status === 'InProgress' ? 'Active' : 
                  booking.status,
          from: (booking as any).client_name || booking.client_id || 'client@example.com',
          date: createdDate.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
        }
      })

    console.log('✅ Dashboard - Transformed projects:', transformedProjects)
    console.log('✅ Dashboard - Final metrics:', metrics)
    
    setRecentProjects(transformedProjects)
    setLoading(false)
  }, [bookings])

  // Show loading state
  if (loading || bookingsLoading || !userId) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }
  return (
    <div className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold mb-1">Browse Projects</h1>
              <p className="text-gray-600">
                Join Exciting Hackathons and win prizes
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center gap-2">
              <div className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-md">
                Available
              </div>
              <Link href="/freelancer/add-service"> 
              <button className="flex items-center gap-2 bg-rainbow-gradient text-white px-4 py-2 rounded-lg">
                <Plus size={16} />
                <span>New Service</span>
              </button>
              </Link>
            </div>
          </div>
          {/* Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {metrics.map((metric, index) => (
              <div
                key={index}
                className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm"
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-sm text-gray-500">{metric.title}</div>
                  <div className="text-xs text-green-500 flex items-center">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M18 15L12 9L6 15"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {metric.change}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {index === 0 && (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 1V23"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                  {index === 1 && (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect
                        x="3"
                        y="3"
                        width="18"
                        height="18"
                        rx="2"
                        ry="2"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <line
                        x1="3"
                        y1="9"
                        x2="21"
                        y2="9"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <line
                        x1="9"
                        y1="21"
                        x2="9"
                        y2="9"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                  {index === 2 && <Clock size={20} />}
                  {index === 3 && (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 20V10"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M18 20V4"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M6 20V16"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                  <h3 className="text-xl font-bold">{metric.value}</h3>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {metric.subtitle}
                </div>
              </div>
            ))}
          </div>

          {/* Profile Status Section */}
          <div className="mb-8">
            <ProfileStatus />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Recent Projects</h2>
                <button className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                  Browse All
                </button>
              </div>
              <div className="space-y-4">
                {recentProjects.length > 0 ? (
                  recentProjects.map((project) => (
                    <div
                      key={project.id}
                      className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm flex"
                    >
                      <div className={`mr-4 rounded-lg w-12 h-12 flex items-center justify-center text-white ${
                        project.status === 'Completed' ? 'bg-green-500' :
                        project.status === 'Active' || project.status === 'InProgress' ? 'bg-blue-500' :
                        'bg-gray-500'
                      }`}>
                        <Check size={20} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{project.title}</h3>
                        <div className="text-xs text-gray-500">
                          From: {project.from}
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="flex items-center text-green-500">
                          <span>{project.amount}</span>
                          <div className={`ml-2 text-xs px-2 py-0.5 rounded ${
                            project.status === 'Completed' ? 'bg-green-100 text-green-700' :
                            project.status === 'Active' || project.status === 'InProgress' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {project.status}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {project.date}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white border border-gray-100 rounded-lg p-8 text-center">
                    <p className="text-gray-500">No projects yet. Start by creating a service!</p>
                    <Link href="/freelancer/add-service">
                      <button className="mt-4 flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg mx-auto">
                        <Plus size={16} />
                        <span>Create Your First Service</span>
                      </button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
            <div>
              <div className="bg-white border border-gray-100 rounded-lg p-6 shadow-sm mb-6">
                <h2 className="text-xl font-bold mb-4">Performance</h2>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category</span>
                    <span className="font-medium">ICP Development</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Timeline</span>
                    <span className="font-medium">3-4 weeks</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Level</span>
                    <span className="font-medium text-green-500">
                      $75K - $100K
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Proposals</span>
                    <span className="font-medium">5</span>
                  </div>
                </div>
              </div>
              <div className="bg-white border border-gray-100 rounded-lg p-6 shadow-sm">
                <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
                <div className="space-y-6">
                  <button className="w-full flex items-center justify-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <Plus size={18} />
                    <span>Create New Proposal</span>
                  </button>
                  <button className="w-full flex items-center justify-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <Clock size={18} />
                    <span>View Active Projects</span>
                  </button>
                  <button className="w-full flex items-center justify-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>Hire Talent</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
    </div>
  )
}
