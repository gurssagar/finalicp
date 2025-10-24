'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Clock, CheckCircle, XCircle, AlertCircle, Eye, DollarSign, Calendar, User, RefreshCw, Activity } from 'lucide-react';
import { useBookings } from '@/hooks/useMarketplace';
import { formatICP } from '@/lib/ic-marketplace-agent';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function MyProjectsPage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [userId, setUserId] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);

  const {
    bookings,
    loading: bookingsLoading,
    error: bookingsError,
    fetchBookings
  } = useBookings(userId, 'freelancer', statusFilter);

  // Fetch session on component mount
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch('/api/auth/session');
        const data = await response.json();
        if (data.success && data.session) {
          setSession(data.session);
          setUserId(data.session.email); // Use email as freelancer ID
        } else {
          // Redirect to login if no session
          router.push('/auth/login');
        }
      } catch (error) {
        console.error('Error fetching session:', error);
        router.push('/auth/login');
      }
    };

    fetchSession();
  }, [router]);

  useEffect(() => {
    if (userId) {
      fetchBookings();
    }
  }, [fetchBookings, userId, statusFilter]);

  // Auto-refresh bookings every 30 seconds
  useEffect(() => {
    if (!autoRefresh || !userId) return;

    const interval = setInterval(() => {
      fetchBookings();
      setLastUpdate(Date.now());
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, userId, fetchBookings]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'Active': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'Completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'Cancelled': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'InDispute': return <AlertCircle className="w-4 h-4 text-orange-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Active': return 'bg-blue-100 text-blue-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      case 'InDispute': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate stats
  const totalProjects = bookings.length;
  const activeProjects = bookings.filter(b => b.status === 'Active').length;
  const completedProjects = bookings.filter(b => b.status === 'Completed').length;
  const totalEarnings = bookings
    .filter(b => b.status === 'Completed')
    .reduce((sum, b) => sum + Number(b.total_amount_e8s), 0);

  if (bookingsLoading) {
    return (
      <div className="flex min-h-screen bg-white">
        
        <div className="flex-1">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading projects...</div>
          </div>
        </div>
      </div>
    );
  }

  if (bookingsError) {
    return (
      <div className="flex min-h-screen bg-white">
        
        <div className="flex-1">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-red-600">Error: {bookingsError}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white">
     
      <div className="flex-1">
        <div className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h1 className="text-2xl font-bold">My Projects</h1>
              <p className="text-gray-600">
                Manage your projects and track earnings
              </p>
            </div>
            <div className="flex gap-4">
              <Link href="/freelancer/add-service">
                <Button className="flex items-center gap-2">
                  <Plus size={18} />
                  Post New Service
                </Button>
              </Link>
              <Button 
                variant="outline" 
                onClick={() => fetchBookings()}
                className="flex items-center gap-2"
              >
                <RefreshCw size={18} />
                Refresh
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Projects</p>
                    <p className="text-2xl font-bold text-gray-900">{totalProjects}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Activity className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Projects</p>
                    <p className="text-2xl font-bold text-gray-900">{activeProjects}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <Clock className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Completed</p>
                    <p className="text-2xl font-bold text-gray-900">{completedProjects}</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <CheckCircle className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                    <p className="text-2xl font-bold text-gray-900">{formatICP(BigInt(totalEarnings))}</p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <DollarSign className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Status Filter */}
          <div className="mb-6">
            <div className="flex gap-2">
              <Button
                variant={statusFilter === '' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('')}
              >
                All
              </Button>
              <Button
                variant={statusFilter === 'Active' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('Active')}
              >
                Active
              </Button>
              <Button
                variant={statusFilter === 'Completed' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('Completed')}
              >
                Completed
              </Button>
              <Button
                variant={statusFilter === 'Pending' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('Pending')}
              >
                Pending
              </Button>
            </div>
          </div>

          {/* Projects List */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Projects</CardTitle>
            </CardHeader>
            <CardContent>
              {bookings.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No projects yet</p>
                  <Link href="/freelancer/add-service">
                    <Button className="mt-4">Post Your First Service</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <Card key={booking.booking_id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                              <span className="text-blue-600 font-semibold">
                                {booking.service_title?.charAt(0) || 'P'}
                              </span>
                            </div>
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">
                                {booking.service_title || 'Project'}
                              </h3>
                              <p className="text-sm text-gray-600">
                                Client: {booking.client_id}
                              </p>
                              <p className="text-sm text-gray-500">
                                Started {new Date(booking.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <Badge className={getStatusColor(booking.status)}>
                              {getStatusIcon(booking.status)}
                              <span className="ml-1">{booking.status}</span>
                            </Badge>
                            <span className="text-lg font-semibold text-gray-900">
                              {formatICP(BigInt(booking.total_amount_e8s))}
                            </span>
                            <Button
                              onClick={() => router.push(`/freelancer/project-details/${booking.booking_id}`)}
                              variant="outline"
                            >
                              View Details
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}