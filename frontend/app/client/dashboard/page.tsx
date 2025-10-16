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

interface RecentActivity {
  id: string
  type: 'booking' | 'payment' | 'review' | 'message' | 'job_post'
  title: string
  description: string
  timestamp: string
  amount?: number
}

export default function ClientDashboard() {
  const router = useRouter()
  const [userId] = useState('TEST_USER_123') // TODO: Get from auth context
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
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch bookings
  const { bookings, loading: bookingsLoading } = useBookings(userId, 'client')
  
  // Fetch marketplace stats
  const { stats: marketplaceStats, loading: statsLoading } = useMarketplaceStats()

  // Mock data for now - replace with API calls
  useEffect(() => {
    const mockStats: DashboardStats = {
      totalSpent: 8750,
      activeProjects: 2,
      completedProjects: 8,
      jobPostsCount: 3,
      thisMonthSpent: 1200,
      pendingPayments: 0,
      averageRating: 4.7,
      totalReviews: 12
    }

    const mockBookings: RecentBooking[] = [
      {
        id: 'BK-001',
        freelancer_name: 'John Developer',
        service_title: 'React E-commerce Development',
        amount: 2500,
        status: 'In Progress',
        created_at: '2024-01-15',
        deadline: '2024-02-15'
      },
      {
        id: 'BK-002',
        freelancer_name: 'Sarah Designer',
        service_title: 'UI/UX Design',
        amount: 1200,
        status: 'Pending',
        created_at: '2024-01-20',
        deadline: '2024-02-05'
      }
    ]

    const mockActivity: RecentActivity[] = [
      {
        id: 'ACT-001',
        type: 'booking',
        title: 'New Project Started',
        description: 'Started working with John Developer on React E-commerce Development',
        timestamp: '2024-01-22',
        amount: 2500
      },
      {
        id: 'ACT-002',
        type: 'job_post',
        title: 'Job Posted',
        description: 'Posted a new job for Mobile App Development',
        timestamp: '2024-01-21'
      },
      {
        id: 'ACT-003',
        type: 'payment',
        title: 'Payment Made',
        description: 'Payment of $1,200 made to Sarah Designer for UI/UX Design',
        timestamp: '2024-01-20',
        amount: 1200
      },
      {
        id: 'ACT-004',
        type: 'message',
        title: 'New Message',
        description: 'Message from John Developer about project progress',
        timestamp: '2024-01-19'
      }
    ]

    setTimeout(() => {
      setStats(mockStats)
      setRecentBookings(mockBookings)
      setRecentActivity(mockActivity)
      setLoading(false)
    }, 1000)
  }, [])

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

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'booking': return <Briefcase className="w-4 h-4 text-blue-600" />
      case 'payment': return <DollarSign className="w-4 h-4 text-green-600" />
      case 'review': return <Star className="w-4 h-4 text-yellow-600" />
      case 'message': return <MessageSquare className="w-4 h-4 text-purple-600" />
      case 'job_post': return <Plus className="w-4 h-4 text-orange-600" />
      default: return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

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
                <p className="text-2xl font-bold text-gray-900">${stats.totalSpent.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-green-600">+8.2% from last month</span>
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
              <span className="text-blue-600">{stats.pendingPayments > 0 ? `$${stats.pendingPayments} pending` : 'All caught up'}</span>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Projects */}
        <Card>
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
                          Due {new Date(booking.deadline).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">${booking.amount.toLocaleString()}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(booking.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No recent activity</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900">{activity.title}</h4>
                      <p className="text-sm text-gray-600">{activity.description}</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-gray-500">
                          {new Date(activity.timestamp).toLocaleDateString()}
                        </p>
                        {activity.amount && (
                          <span className="text-xs font-medium text-green-600">
                            ${activity.amount.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

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