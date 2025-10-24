'use client'
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import ProjectDetailHeader from '@/components/ProjectDetailHeader';
import ProjectTimeline from '@/components/ProjectTimeline';
import FinancialInformation from '@/components/FinancialInformation';
import DocumentManager from '@/components/DocumentManager';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calendar,
  DollarSign,
  User,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageSquare,
  FileText,
  Settings,
  Activity,
  ArrowLeft
} from 'lucide-react';
import { formatBookingDate, formatBookingDateShort, formatRelativeTime, isOverdue, getTimeRemaining } from '@/lib/date-utils';
import { useBookings, useStages } from '@/hooks/useMarketplace';

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const bookingId = params.bookingId as string;

  const [session, setSession] = useState<any>(null);
  const [userId, setUserId] = useState<string>('');
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());
  const [documents, setDocuments] = useState<any[]>([]);

  const {
    stages,
    loading: stagesLoading,
    error: stagesError,
    approveStage,
    rejectStage
  } = useStages(bookingId);

  // Fetch current session on component mount
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch('/api/auth/session');
        const data = await response.json();

        if (data.success && data.session) {
          setSession(data.session);
          setUserId(data.session.email);
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

  // Fetch project details function
  const fetchProjectDetails = async () => {
    if (!bookingId || !userId) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/marketplace/bookings/${bookingId}`);
      const data = await response.json();

      if (data.success) {
        setProject(data.data);
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch project details');
      }
    } catch (error) {
      console.error('Error fetching project details:', error);
      setError('Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  // Fetch project details
  useEffect(() => {
    fetchProjectDetails();
  }, [bookingId, userId]);

  // Auto-refresh project details every 30 seconds
  useEffect(() => {
    if (!autoRefresh || !bookingId || !userId) return;

    const interval = setInterval(() => {
      fetchProjectDetails();
      setLastUpdate(Date.now());
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, bookingId, userId, fetchProjectDetails]);

  
  const handleApproveStage = async (stageId: string) => {
    if (!userId) return;

    if (confirm('Are you sure you want to approve this stage? This will release the funds to the freelancer.')) {
      await approveStage(userId, stageId);
    }
  };

  const handleRejectStage = async (stageId: string, reason: string) => {
    if (!userId) return;

    if (reason.trim()) {
      await rejectStage(userId, stageId, reason);
    }
  };

  const handleChatWithFreelancer = () => {
    if (project?.freelancer_email) {
      // Redirect to the correct chat URL with the freelancer's email
      window.location.href = `http://localhost:3001/client/chat?with=${encodeURIComponent(project.freelancer_email)}`;
    }
  };

  const handleViewTransaction = () => {
    if (project?.payment_id) {
      // For now, just copy the payment ID to clipboard
      // In a real implementation, this could open a blockchain explorer
      navigator.clipboard.writeText(project.payment_id);
      alert('Payment ID copied to clipboard!');
    }
  };

  const handleUploadDocument = async (files: FileList, stageId?: string) => {
    // Mock document upload implementation
    const newDocuments = Array.from(files).map((file, index) => ({
      id: `doc_${Date.now()}_${index}`,
      name: file.name,
      type: file.type.startsWith('image/') ? 'image' :
            file.type.startsWith('video/') ? 'video' :
            file.name.endsWith('.zip') || file.name.endsWith('.rar') ? 'archive' : 'document',
      size: file.size,
      uploadedBy: session?.email || 'Current User',
      uploadedAt: Date.now() * 1000000, // Convert to nanoseconds
      stageId: stageId,
      description: `Uploaded document: ${file.name}`,
      url: URL.createObjectURL(file)
    }));

    setDocuments(prev => [...prev, ...newDocuments]);
    alert(`Successfully uploaded ${files.length} document(s)!`);
  };

  const handleViewDocument = (document: any) => {
    if (document.url) {
      window.open(document.url, '_blank');
    } else {
      alert('Document preview not available');
    }
  };

  const handleDownloadDocument = (document: any) => {
    // Mock download implementation
    alert(`Downloading: ${document.name}`);
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
       
        <main className="flex-1 container mx-auto px-4 py-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading project details...</div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Project</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={() => router.back()}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      

      <main className="flex-1 container mx-auto px-4 py-6">
        {/* Header with navigation */}
        <ProjectDetailHeader
          project={project}
          autoRefresh={autoRefresh}
          setAutoRefresh={setAutoRefresh}
          lastUpdate={lastUpdate}
          onChatWithFreelancer={handleChatWithFreelancer}
        />

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Project Overview */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="stages">Stages</TabsTrigger>
                <TabsTrigger value="deliverables">Deliverables</TabsTrigger>
                <TabsTrigger value="communication">Communication</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Project Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">Service Details</h3>
                      <p className="text-gray-600">{project.service_title || project.package_details?.service_title}</p>
                      {project.package_title && (
                        <p className="text-sm text-gray-500">
                          {project.package_tier && `${project.package_tier.charAt(0).toUpperCase() + project.package_tier.slice(1)} Package`} • {project.package_title}
                        </p>
                      )}
                    </div>

                    {project.package_details && (
                      <div>
                        <h3 className="font-medium mb-2">Package Details</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Package ID:</span>
                            <span className="text-sm font-mono">{project.package_details.package_id}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Service ID:</span>
                            <span className="text-sm font-mono">{project.package_details.service_id}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Delivery Time:</span>
                            <span className="text-sm">{project.package_details.delivery_time_days} days</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Starting Price:</span>
                            <div className="text-right">
                              {project.package_details.starting_from_usd && (
                                <div className="text-sm text-green-600">${project.package_details.starting_from_usd.toFixed(2)} USD</div>
                              )}
                            </div>
                          </div>
                          {project.package_details.service_category && (
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Category:</span>
                              <span className="text-sm">{project.package_details.service_category}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div>
                      <h3 className="font-medium mb-2">Special Instructions</h3>
                      <p className="text-gray-600">{project.special_instructions || 'No special instructions provided'}</p>
                    </div>

                    <div>
                      <h3 className="font-medium mb-2">Freelancer</h3>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span>{project.freelancer_name || project.freelancer_id}</span>
                      </div>
                    </div>

                    {project.delivery_deadline && (
                      <div>
                        <h3 className="font-medium mb-2">Delivery Deadline</h3>
                        <div className={`flex items-center gap-2 ${isOverdue(project.delivery_deadline) ? 'text-red-600' : 'text-orange-600'}`}>
                          <Calendar className="w-4 h-4" />
                          <span>{formatBookingDateShort(project.delivery_deadline)}</span>
                          {isOverdue(project.delivery_deadline) && (
                            <span className="ml-2 text-xs font-semibold bg-red-100 text-red-700 px-2 py-1 rounded">
                              OVERDUE
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {getTimeRemaining(project.delivery_deadline)}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="stages" className="space-y-4">
                <ProjectTimeline
                  stages={stages}
                  loading={stagesLoading}
                  error={stagesError || undefined}
                  onApproveStage={handleApproveStage}
                  onRejectStage={handleRejectStage}
                />
              </TabsContent>

              <TabsContent value="deliverables" className="space-y-4">
                <DocumentManager
                  documents={documents}
                  stages={stages}
                  onUploadDocument={handleUploadDocument}
                  onViewDocument={handleViewDocument}
                  onDownloadDocument={handleDownloadDocument}
                />
              </TabsContent>

              <TabsContent value="communication" className="space-y-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <h3 className="font-medium mb-2">Chat with Freelancer</h3>
                      <p className="text-gray-600 mb-4">
                        Start a conversation with the freelancer to discuss project details, provide feedback, or ask questions.
                      </p>
                      <Button onClick={handleChatWithFreelancer}>
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Start Chat
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Financial Info */}
          <div className="space-y-6">
            <FinancialInformation
              project={project}
              onViewTransaction={handleViewTransaction}
            />

            {/* Project Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Project Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">Created</div>
                      <div className="text-xs text-gray-500">
                        {project.created_at_readable ? 
                          new Date(project.created_at_readable).toLocaleDateString() : 
                          formatBookingDateShort(project.created_at)
                        }
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">In Progress</div>
                      <div className="text-xs text-gray-500">
                        {project.deadline_readable ? 
                          `Due: ${new Date(project.deadline_readable).toLocaleDateString()}` :
                          project.delivery_deadline ? 
                            `Due: ${formatBookingDateShort(project.delivery_deadline)}` : 
                            'No deadline set'
                        }
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">Completed</div>
                      <div className="text-xs text-gray-500">Pending</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleChatWithFreelancer}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Message Freelancer
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  View Documents
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Activity className="w-4 h-4 mr-2" />
                  Project Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}