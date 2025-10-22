'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { useBookings, useStages } from '@/hooks/useMarketplace';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatICP } from '@/lib/ic-marketplace-agent';
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  ThumbsUp,
  ThumbsDown,
  DollarSign,
  Calendar,
  User,
  RefreshCw,
  Activity
} from 'lucide-react';

export default function ClientProjects() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [userId, setUserId] = useState<string>('');
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);

  const {
    bookings,
    loading: bookingsLoading,
    error: bookingsError,
    fetchBookings
  } = useBookings(userId, 'client');

  const {
    stages,
    loading: stagesLoading,
    error: stagesError,
    approveStage,
    rejectStage
  } = useStages(selectedBooking || undefined);

  const [showRejectionForm, setShowRejectionForm] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Fetch current session on component mount
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch('/api/auth/session');
        const data = await response.json();

        if (data.success && data.session) {
          setSession(data.session);
          setUserId(data.session.email); // Use email as user ID for now
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

  // Manual refresh function
  const handleRefresh = () => {
    fetchBookings();
    setLastUpdate(Date.now());
  };

  const handleApproveStage = async (stageId: string) => {
    if (!userId) return;
    
    if (confirm('Are you sure you want to approve this stage? This will release the funds to the freelancer.')) {
      await approveStage(userId, stageId);
    }
  };

  const handleRejectStage = async (stageId: string) => {
    if (!userId) return;
    
    if (rejectionReason.trim()) {
      await rejectStage(userId, stageId, rejectionReason);
      setShowRejectionForm(null);
      setRejectionReason('');
    }
  };

  // Helper function to convert status object to string
  const getStatusString = (status: any): string => {
    if (typeof status === 'string') {
      return status;
    } else if (typeof status === 'object' && status !== null) {
      // Handle canister variant status format like {Active: null}, {Pending: null}, etc.
      const statusKey = Object.keys(status)[0];
      return statusKey || 'Pending';
    }
    return 'Pending';
  };

  const getStatusIcon = (status: any) => {
    const statusStr = getStatusString(status);
    switch (statusStr) {
      case 'Pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'InProgress': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'Completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'Cancelled': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'Disputed': return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case 'Active': return <Clock className="w-4 h-4 text-blue-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStageStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'InProgress': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'Submitted': return <Eye className="w-4 h-4 text-blue-500" />;
      case 'Approved': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'Rejected': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'Released': return <DollarSign className="w-4 h-4 text-green-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  if (bookingsLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <main className="flex-1 container mx-auto px-4 py-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading projects...</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-[#161616]">My Projects</h1>
            <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
              <Activity size={14} />
              <span>Last updated: {new Date(lastUpdate).toLocaleTimeString()}</span>
              <button
                onClick={handleRefresh}
                className="flex items-center gap-1 text-purple-600 hover:text-purple-700 transition-colors"
                disabled={bookingsLoading}
              >
                <RefreshCw size={14} className={bookingsLoading ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                autoRefresh
                  ? 'bg-green-100 text-green-700 border border-green-300'
                  : 'bg-gray-100 text-gray-700 border border-gray-300'
              }`}
            >
              {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
            </button>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="InProgress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Disputed">Disputed</option>
            </select>
          </div>
        </div>

        {bookingsError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {bookingsError}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bookings List */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Projects ({bookings.length})</h2>
            {bookings.map((booking) => (
              <Card 
                key={booking.booking_id} 
                className={`border cursor-pointer transition-colors ${
                  selectedBooking === booking.booking_id 
                    ? 'border-[#0B1F36] bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedBooking(booking.booking_id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">Project #{booking.booking_id.slice(-8)}</CardTitle>
                      {booking.service_title && (
                        <p className="text-sm font-medium text-gray-700 mt-1">{booking.service_title}</p>
                      )}
                      {booking.package_title && (
                        <p className="text-xs text-gray-500 mt-1">
                          {booking.package_tier && `${booking.package_tier.charAt(0).toUpperCase() + booking.package_tier.slice(1)} Package`} • {booking.package_title}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        {getStatusIcon(booking.status)}
                        <Badge
                          variant={getStatusString(booking.status) === 'Completed' ? 'default' : 'secondary'}
                        >
                          {getStatusString(booking.status)}
                        </Badge>
                        <Badge
                          variant={getStatusString(booking.payment_status) === 'Completed' ? 'default' : 'outline'}
                        >
                          {getStatusString(booking.payment_status)}
                        </Badge>
                        {booking.payment_method && (
                          <Badge variant="outline" className="text-xs">
                            {booking.payment_method.replace('-', ' ').toUpperCase()}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-[#0B1F36]">
                        {formatICP(BigInt(booking.escrow_amount_e8s))}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(booking.created_at / 1000000).toLocaleDateString()}
                      </div>
                      {booking.delivery_deadline && (
                        <div className="text-xs text-orange-600 mt-1">
                          📅 Due: {new Date(booking.delivery_deadline / 1000000).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {booking.special_instructions && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {booking.special_instructions}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <User size={12} />
                          {booking.freelancer_name || booking.freelancer_id}
                        </span>
                        {booking.ledger_deposit_block && (
                          <span>Block: {booking.ledger_deposit_block.toString()}</span>
                        )}
                      </div>
                      {booking.payment_id && (
                        <span className="text-xs">
                          ID: {booking.payment_id.slice(-8)}
                        </span>
                      )}
                    </div>

                    {booking.upsells && booking.upsells.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {booking.upsells.slice(0, 2).map((upsell, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            + {upsell.name}
                          </Badge>
                        ))}
                        {booking.upsells.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{booking.upsells.length - 2} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Stages for Selected Booking */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">
                Project Stages {selectedBooking ? `(${stages.length})` : ''}
              </h2>
            </div>

            {selectedBooking ? (
              stagesLoading ? (
                <div className="text-center py-4">Loading stages...</div>
              ) : stagesError ? (
                <div className="text-red-600">{stagesError}</div>
              ) : stages.length > 0 ? (
                <div className="space-y-3">
                  {stages.map((stage, index) => (
                    <Card key={stage.stage_id} className="border border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm font-medium">Stage {stage.stage_number}</span>
                              {getStageStatusIcon(stage.status)}
                              <Badge 
                                variant={stage.status === 'Released' ? 'default' : 'secondary'}
                              >
                                {stage.status}
                              </Badge>
                            </div>
                            <h3 className="font-medium">{stage.title}</h3>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {stage.description}
                            </p>
                            <div className="flex items-center justify-between mt-3">
                              <div className="text-sm font-semibold text-[#0B1F36]">
                                {formatICP(BigInt(stage.amount_e8s))}
                              </div>
                              <div className="flex gap-2">
                                {stage.status === 'Submitted' && (
                                  <>
                                    <Button
                                      size="sm"
                                      onClick={() => handleApproveStage(stage.stage_id)}
                                      className="bg-green-600 text-white hover:bg-green-700"
                                    >
                                      <ThumbsUp size={12} className="mr-1" />
                                      Approve
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => setShowRejectionForm(stage.stage_id)}
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      <ThumbsDown size={12} className="mr-1" />
                                      Reject
                                    </Button>
                                  </>
                                )}
                                {stage.status === 'Approved' && (
                                  <div className="text-sm text-green-600">
                                    Approved - funds released
                                  </div>
                                )}
                                {stage.status === 'Rejected' && (
                                  <div className="text-sm text-red-600">
                                    Rejected: {stage.rejection_reason}
                                  </div>
                                )}
                                {stage.status === 'Released' && (
                                  <div className="text-sm text-green-600">
                                    Funds released
                                  </div>
                                )}
                                {stage.status === 'Pending' && (
                                  <div className="text-sm text-yellow-600">
                                    Awaiting freelancer submission
                                  </div>
                                )}
                              </div>
                            </div>
                            {stage.submission_notes && (
                              <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                                <strong>Submission Notes:</strong> {stage.submission_notes}
                              </div>
                            )}
                            {stage.submission_artifacts && stage.submission_artifacts.length > 0 && (
                              <div className="mt-2">
                                <div className="text-sm font-medium">Deliverables:</div>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {stage.submission_artifacts.map((artifact, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                      {artifact}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No stages created yet. The freelancer will create project stages soon.
                </div>
              )
            ) : (
              <div className="text-center py-8 text-gray-500">
                Select a project to view its stages
              </div>
            )}
          </div>
        </div>

        {/* Rejection Form Modal */}
        {showRejectionForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Reject Stage</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Reason for Rejection</label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 h-24"
                    placeholder="Please explain why you're rejecting this stage..."
                    required
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowRejectionForm(null);
                      setRejectionReason('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => handleRejectStage(showRejectionForm)}
                    disabled={!rejectionReason.trim()}
                    className="bg-red-600 text-white hover:bg-red-700"
                  >
                    Reject Stage
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
