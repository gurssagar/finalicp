'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import ProfileStatus from '@/components/ProfileStatus'
import { 
  Plus, 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  Star,
  Eye,
  MessageSquare,
  Briefcase,
  Clock,
  CheckCircle,
  Users,
  ShoppingCart
} from 'lucide-react'
import { useBookings, useMarketplaceStats } from '@/hooks/useMarketplace'

interface DashboardStats {
  totalSpent: number
  activeProjects: number
  completedProjects: number
  jobPostsCount: number
  thisMonthSpent: number
  pendingPayments: number
  averageRating: number
  totalReviews: number
}

interface RecentBooking {
  id: string
  freelancer_name: string
  service_title: string
  amount: number
  status: 'In Progress' | 'Pending' | 'Completed'
  created_at: string
  deadline: string
}


export default function ClientDashboard() {
  const router = useRouter()
  const [session, setSession] = useState<any>(null)
  const [userId, setUserId] = useState<string>('')
  const [stats, setStats] = useState<DashboardStats>({
    totalSpent: 0,
    activeProjects: 0,
    completedProjects: 0,
    jobPostsCount: 0,
    thisMonthSpent: 0,
    pendingPayments: 0,
    averageRating: 0,
    totalReviews: 0
  })
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch current session on component mount
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch('/api/auth/session')
        const data = await response.json()

        if (data.success && data.session) {
          setSession(data.session)
          setUserId(data.session.email) // Use email as user ID for now
        } else {
          // Redirect to login if no session
          router.push('/login')
        }
      } catch (error) {
        console.error('Error fetching session:', error)
        router.push('/login')
      }
    }

    fetchSession()
  }, [router])

  // Fetch bookings
  const { bookings, loading: bookingsLoading, error: bookingsError, fetchBookings } = useBookings(userId, 'client')
  
  // Auto-refresh bookings every 30 seconds to get updates
  useEffect(() => {
    if (!userId) return;
    
    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing bookings for dashboard...');
      fetchBookings();
    }, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, [userId, fetchBookings]);
  
  // Fetch marketplace stats
  const { stats: marketplaceStats, loading: statsLoading } = useMarketplaceStats()

  // Helper function to map booking status
  const mapBookingStatus = (status: string): 'In Progress' | 'Pending' | 'Completed' => {
    const statusMap: Record<string, 'In Progress' | 'Pending' | 'Completed'> = {
      'InProgress': 'In Progress',
      'Pending': 'Pending',
      'Completed': 'Completed',
      'Cancelled': 'Pending'
    }
    return statusMap[status] || 'Pending'
  }

  // Calculate statistics from real booking data
  useEffect(() => {
    if (!bookings || bookings.length === 0) {
      setStats({
        totalSpent: 0,
        activeProjects: 0,
        completedProjects: 0,
        jobPostsCount: 0,
        thisMonthSpent: 0,
        pendingPayments: 0,
        averageRating: 0,
        totalReviews: 0
      })
      setRecentBookings([])
      setLoading(false)
      return
    }

    // Calculate statistics from bookings
    const now = new Date()
    const thisMonth = now.getMonth()
    const thisYear = now.getFullYear()

    let totalSpent = 0
    let activeProjects = 0
    let completedProjects = 0
    let thisMonthSpent = 0
    let pendingPayments = 0

    let totalReviews = 0
    let ratingsSum = 0
    let ratingsCount = 0

    bookings.forEach(booking => {
      const amount = Number(booking.total_amount_e8s) / 100000000 // Convert e8s to ICP
      const createdDate = new Date(Number(booking.created_at) / 1000000)
      
      // Total spent (completed bookings with released payment status)
      // Only count spent when funds have been released to freelancer
      const isCompleted = booking.status === 'Completed'
      const isReleased = booking.payment_status === 'Released' || 
                        (isCompleted && (booking.payment_status === 'HeldInEscrow' || !booking.payment_status))
      
      if (isCompleted && isReleased) {
        totalSpent += amount
      }

      // Active projects
      if (booking.status === 'InProgress' || booking.status === 'Pending' || booking.status === 'Active') {
        activeProjects++
      }

      // Completed projects
      if (booking.status === 'Completed') {
        completedProjects++
      }

      // This month spent (only if completed and released)
      if (isCompleted && isReleased && 
          createdDate.getMonth() === thisMonth && createdDate.getFullYear() === thisYear) {
        thisMonthSpent += amount
      }

      // Pending payments (held in escrow, not yet released)
      if (booking.payment_status === 'HeldInEscrow' || booking.payment_status === 'Pending') {
        pendingPayments += amount
      }

      // Count reviews and ratings
      if ((booking as any).client_rating) {
        totalReviews++
        ratingsSum += (booking as any).client_rating
        ratingsCount++
      }
    })

    // Transform bookings for display
    const transformedBookings: RecentBooking[] = bookings.map(booking => ({
      id: booking.booking_id,
      freelancer_name: booking.freelancer_name || booking.freelancer_id.split('@')[0],
      service_title: booking.service_title || 'Service',
      amount: Number(booking.total_amount_e8s) / 100000000, // Convert e8s to ICP
      status: mapBookingStatus(booking.status),
      created_at: (() => {
        try {
          let timestamp = Number(booking.created_at);
          let milliseconds: number;
          
          // Handle different timestamp formats
          if (timestamp > 1000000000000) {
            milliseconds = timestamp;
          } else if (timestamp > 1000000000) {
            milliseconds = timestamp * 1000;
          } else {
            milliseconds = timestamp / 1000000;
          }
          
          // Validate timestamp
          if (milliseconds < 946684800000) { // Before 2000-01-01
            console.warn('Invalid booking created_at timestamp:', booking.created_at, '->', milliseconds);
            return new Date().toISOString();
          }
          
          const date = new Date(milliseconds);
          if (isNaN(date.getTime())) {
            console.warn('Invalid date from created_at:', booking.created_at);
            return new Date().toISOString();
          }
          return date.toISOString();
        } catch (error) {
          console.warn('Error processing booking created_at timestamp:', booking.created_at, error);
          return new Date().toISOString();
        }
      })(),
      deadline: (() => {
        try {
          if (!booking.delivery_deadline || booking.delivery_deadline === 0) {
            // Calculate from created_at + 7 days default
            const created_at_ms = (() => {
              let ts = Number(booking.created_at);
              if (ts > 1000000000000) return ts;
              if (ts > 1000000000) return ts * 1000;
              return ts / 1000000;
            })();
            const futureDate = new Date(created_at_ms + (7 * 24 * 60 * 60 * 1000));
            return futureDate.toISOString();
          }
          
          let timestamp = Number(booking.delivery_deadline);
          let milliseconds: number;
          
          // Handle different timestamp formats
          if (timestamp > 1000000000000) {
            milliseconds = timestamp;
          } else if (timestamp > 1000000000) {
            milliseconds = timestamp * 1000;
          } else {
            milliseconds = timestamp / 1000000;
          }
          
          // Validate timestamp
          if (milliseconds < 946684800000) { // Before 2000-01-01
            console.warn('Invalid booking delivery_deadline timestamp:', booking.delivery_deadline, '->', milliseconds);
            // Calculate from created_at + 7 days
            const created_at_ms = (() => {
              let ts = Number(booking.created_at);
              if (ts > 1000000000000) return ts;
              if (ts > 1000000000) return ts * 1000;
              return ts / 1000000;
            })();
            const futureDate = new Date(created_at_ms + (7 * 24 * 60 * 60 * 1000));
            return futureDate.toISOString();
          }
          
          const date = new Date(milliseconds);
          if (isNaN(date.getTime())) {
            console.warn('Invalid date from delivery_deadline:', booking.delivery_deadline);
            const created_at_ms = (() => {
              let ts = Number(booking.created_at);
              if (ts > 1000000000000) return ts;
              if (ts > 1000000000) return ts * 1000;
              return ts / 1000000;
            })();
            const futureDate = new Date(created_at_ms + (7 * 24 * 60 * 60 * 1000));
            return futureDate.toISOString();
          }
          return date.toISOString();
        } catch (error) {
          console.warn('Error processing booking delivery_deadline timestamp:', booking.delivery_deadline, error);
          const futureDate = new Date();
          futureDate.setDate(futureDate.getDate() + 7);
          return futureDate.toISOString();
        }
      })()
    }))

    const averageRating = ratingsCount > 0 ? ratingsSum / ratingsCount : 0

    setStats({
      totalSpent,
      activeProjects,
      completedProjects,
      jobPostsCount: 0, // No job posts API yet
      thisMonthSpent,
      pendingPayments,
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      totalReviews: totalReviews
    })

    setRecentBookings(transformedBookings)
    setLoading(false)
  }, [bookings])

  const handleBrowseServices = () => {
    router.push('/client/browse-services')
  }

  const handlePostJob = () => {
    router.push('/client/post-job')
  }

  const handleViewProjects = () => {
    router.push('/client/projects')
  }

  const handleViewJobPosts = () => {
    router.push('/client/my-job-posts')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Progress': return 'bg-blue-100 text-blue-800'
      case 'Pending': return 'bg-yellow-100 text-yellow-800'
      case 'Completed': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }


  if (loading || bookingsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (bookingsError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading dashboard data</p>
          <p className="text-gray-600">{bookingsError}</p>
        </div>
      </div>
    )
  }

  const lastMonthSpent = typeof (stats as any).lastMonthSpent === 'number'
    ? (stats as any).lastMonthSpent
    : 0
  const spendDelta = stats.totalSpent - lastMonthSpent
  const spendPercent = lastMonthSpent > 0 ? (spendDelta / lastMonthSpent) * 100 : 0
  const hasTrend = lastMonthSpent > 0

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Client Dashboard</h1>
          <p className="text-gray-600">Manage your projects and find the perfect freelancers</p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={handlePostJob} variant="outline">
            Post a Job
          </Button>
          <Button onClick={handleBrowseServices} className="bg-blue-600 hover:bg-blue-700">
            <Eye className="w-4 h-4 mr-2" />
            Browse Services
          </Button>
        </div>
      </div>

      {/* Profile Status Section */}
      <div className="mb-8">
        <ProfileStatus />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSpent.toFixed(6)} ICP</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              {hasTrend ? (
                <>
                  <TrendingUp
                    className={`w-4 h-4 mr-1 ${spendDelta >= 0 ? 'text-green-600' : 'text-red-600'}`}
                  />
                  <span className={spendDelta >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {spendDelta >= 0 ? '+' : ''}
                    {Math.abs(spendPercent).toFixed(1)}% from last month
                  </span>
                </>
              ) : (
                <span className="text-gray-500">
                  {spendDelta > 0
                    ? `+${Math.abs(spendDelta).toFixed(6)} ICP vs last month`
                    : spendDelta < 0
                      ? `-${Math.abs(spendDelta).toFixed(6)} ICP vs last month`
                      : 'No change from last month'}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Projects</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeProjects}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <Clock className="w-4 h-4 text-blue-600 mr-1" />
              <span className="text-blue-600">{stats.pendingPayments > 0 ? `${stats.pendingPayments.toFixed(6)} ICP pending` : 'All caught up'}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Projects</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedProjects}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <Star className="w-4 h-4 text-yellow-600 mr-1" />
              <span className="text-gray-600">{stats.averageRating} avg rating ({stats.totalReviews} reviews)</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Job Posts</p>
                <p className="text-2xl font-bold text-gray-900">{stats.jobPostsCount}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-2">
              <Button 
                variant="link" 
                className="p-0 h-auto text-blue-600 hover:text-blue-700"
                onClick={handleViewJobPosts}
              >
                Manage Jobs
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Projects */}
      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Projects</CardTitle>
          <Button variant="link" onClick={handleViewProjects} className="p-0 h-auto">
            View All
          </Button>
        </CardHeader>
        <CardContent>
          {recentBookings.length === 0 ? (
            <div className="text-center py-8">
              <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No recent projects</p>
              <Button onClick={handleBrowseServices} className="mt-4 bg-blue-600 hover:bg-blue-700">
                Browse Services
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{booking.service_title}</h4>
                    <p className="text-sm text-gray-600">{booking.freelancer_name}</p>
                    <div className="flex items-center mt-2">
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status}
                      </Badge>
                      <span className="text-sm text-gray-500 ml-2">
                        Due {(() => {
                          try {
                            const deadlineDate = new Date(booking.deadline);
                            if (isNaN(deadlineDate.getTime())) {
                              return 'Date not set';
                            }
                            return deadlineDate.toLocaleDateString();
                          } catch (error) {
                            return 'Date not set';
                          }
                        })()}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{booking.amount.toFixed(6)} ICP</p>
                    <p className="text-sm text-gray-500">
                      {(() => {
                        try {
                          const createdDate = new Date(booking.created_at);
                          if (isNaN(createdDate.getTime())) {
                            return 'Date not set';
                          }
                          return createdDate.toLocaleDateString();
                        } catch (error) {
                          return 'Date not set';
                        }
                      })()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button 
              onClick={handleBrowseServices}
              className="h-20 flex flex-col items-center justify-center space-y-2"
              variant="outline"
            >
              <Eye className="w-6 h-6" />
              <span>Browse Services</span>
            </Button>
            <Button 
              onClick={handlePostJob}
              className="h-20 flex flex-col items-center justify-center space-y-2"
              variant="outline"
            >
              <Plus className="w-6 h-6" />
              <span>Post a Job</span>
            </Button>
            <Button 
              onClick={handleViewProjects}
              className="h-20 flex flex-col items-center justify-center space-y-2"
              variant="outline"
            >
              <Briefcase className="w-6 h-6" />
              <span>My Projects</span>
            </Button>
            <Button 
              onClick={() => router.push('/client/chat')}
              className="h-20 flex flex-col items-center justify-center space-y-2"
              variant="outline"
            >
              <MessageSquare className="w-6 h-6" />
              <span>Messages</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}