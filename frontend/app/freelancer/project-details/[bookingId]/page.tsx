'use client'
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  X, MessageSquare, MoreVertical, Download, ArrowLeft, Clock, CheckCircle,
  AlertCircle, Calendar, User, DollarSign, FileText, Send, Phone, Video
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatICP } from '@/lib/ic-marketplace-agent';

interface BookingDetails {
  booking_id: string;
  client_id: string;
  freelancer_id: string;
  service_id: string;
  service_title: string;
  status: string;
  total_amount_e8s: number;
  total_amount_dollars: number;
  client_notes: string;
  special_instructions: string;
  created_at: number;
  updated_at: number;
  delivery_deadline: number;
  payment_status: string;
}

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params?.bookingId as string;

  const [session, setSession] = useState<any>(null);
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<Array<{id: string, sender: string, message: string, timestamp: number}>>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch('/api/auth/session');
        const data = await response.json();
        if (data.success && data.session) {
          setSession(data.session);
        } else {
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
    if (bookingId && session) {
      fetchBookingDetails();
    }
  }, [bookingId, session]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/marketplace/bookings/${bookingId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch booking details');
      }
      const data = await response.json();
      if (data.success) {
        setBooking(data.data);
      } else {
        setError(data.error || 'Failed to load booking details');
      }
    } catch (error) {
      console.error('Error fetching booking details:', error);
      setError('Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'Active': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'Completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'Cancelled': return <X className="w-4 h-4 text-red-500" />;
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

  const getProjectStage = (status: string) => {
    switch (status) {
      case 'Pending': return { stage: 1, label: 'Order Placed', completed: true };
      case 'Active': return { stage: 2, label: 'Work in Progress', completed: true };
      case 'Completed': return { stage: 5, label: 'Project Completed', completed: true };
      case 'InDispute': return { stage: 4, label: 'In Dispute', completed: false };
      default: return { stage: 1, label: 'Order Placed', completed: true };
    }
  };

  const handleCompleteProject = async () => {
    try {
      const response = await fetch(`/api/marketplace/bookings/${bookingId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          freelancerId: session.email,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to complete project');
      }

      const data = await response.json();
      if (data.success) {
        fetchBookingDetails(); // Refresh booking details
      } else {
        setError(data.error || 'Failed to complete project');
      }
    } catch (error) {
      console.error('Error completing project:', error);
      setError('Failed to complete project');
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const response = await fetch('/api/chat/messages/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          senderEmail: session.email,
          recipientEmail: booking?.client_id,
          message: newMessage,
          bookingId: bookingId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setChatMessages([...chatMessages, {
            id: Date.now().toString(),
            sender: session.email,
            message: newMessage,
            timestamp: Date.now()
          }]);
          setNewMessage('');
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const openChat = () => {
    router.push(`/client/chat?bookingId=${bookingId}&recipient=${booking?.client_id}`);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-white">
        <div className="flex-1">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading project details...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="flex min-h-screen bg-white">
        <div className="flex-1">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-red-600">{error || 'Project not found'}</div>
          </div>
        </div>
      </div>
    );
  }

  const projectStage = getProjectStage(booking.status);
  const stages = [
    { id: 1, label: 'Order Placed', completed: true },
    { id: 2, label: 'Work in Progress', completed: booking.status === 'Active' || booking.status === 'Completed' },
    { id: 3, label: 'Review & Revision', completed: booking.status === 'Completed' },
    { id: 4, label: 'Final Approval', completed: booking.status === 'Completed' },
    { id: 5, label: 'Project Completed', completed: booking.status === 'Completed' },
  ];

  return (
    <div className="flex min-h-screen bg-white">
      <div className="flex-1">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.back()}
                className="flex items-center gap-2"
              >
                <ArrowLeft size={16} />
                Back to Projects
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{booking.service_title}</h1>
                <p className="text-gray-600">Project ID: {booking.booking_id}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={openChat}
                className="flex items-center gap-2"
              >
                <MessageSquare size={18} />
                Chat with Client
              </Button>
              {booking.status === 'Active' && (
                <Button
                  onClick={handleCompleteProject}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Complete Project
                </Button>
              )}
            </div>
          </div>

          {/* Status and Price */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Status</p>
                    <Badge className={getStatusColor(booking.status)}>
                      {getStatusIcon(booking.status)}
                      <span className="ml-1">{booking.status}</span>
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Project Value</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatICP(BigInt(booking.total_amount_e8s))}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Deadline</p>
                    <p className="text-sm font-semibold">
                      {new Date(booking.delivery_deadline).toLocaleDateString()}
                    </p>
                  </div>
                  <Calendar className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Progress Tracker */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Project Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative mb-8">
                <div className="h-2 w-full bg-gray-200 rounded-full">
                  <div
                    className="h-2 bg-green-500 rounded-full transition-all duration-300"
                    style={{ width: `${(projectStage.stage / stages.length) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-6">
                  {stages.map((stage, index) => (
                    <div key={stage.id} className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition-all duration-300 ${
                        stage.completed
                          ? 'bg-green-500'
                          : projectStage.stage >= stage.id
                            ? 'bg-blue-500'
                            : 'bg-gray-300'
                      }`}>
                        {stage.completed ? (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        ) : (
                          stage.id
                        )}
                      </div>
                      <span className="text-xs mt-2 text-center font-medium">{stage.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Project Details */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Client Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User size={20} />
                  Client Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Client ID</p>
                    <p className="font-medium">{booking.client_id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Project Started</p>
                    <p className="font-medium">{new Date(booking.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Payment Status</p>
                    <Badge className={booking.payment_status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                      {booking.payment_status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Project Requirements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText size={20} />
                  Project Requirements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {booking.client_notes && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Client Notes</p>
                      <p className="text-sm bg-gray-50 p-3 rounded">{booking.client_notes}</p>
                    </div>
                  )}
                  {booking.special_instructions && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Special Instructions</p>
                      <p className="text-sm bg-gray-50 p-3 rounded">{booking.special_instructions}</p>
                    </div>
                  )}
                  {!booking.client_notes && !booking.special_instructions && (
                    <p className="text-gray-500 text-sm">No additional requirements provided</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Button onClick={openChat} variant="outline" className="flex items-center gap-2">
                  <MessageSquare size={18} />
                  Send Message
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Phone size={18} />
                  Request Call
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Video size={18} />
                  Schedule Meeting
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Download size={18} />
                  Download Files
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}