'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { useBookings } from '@/hooks/useMarketplace';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatICP } from '@/lib/ic-marketplace-agent';
import { formatBookingDate, formatBookingDateShort, formatRelativeTime, isOverdue, getTimeRemaining } from '@/lib/date-utils';
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign,
  User,
  RefreshCw,
  Activity,
  Wallet,
  Send,
  ArrowLeft
} from 'lucide-react';

export default function ClientProjects() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [userId, setUserId] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [escrowStatuses, setEscrowStatuses] = useState<Record<string, { funded: boolean; balanceE8s: number; status: string }>>({});
  const [escrowIds, setEscrowIds] = useState<Record<string, string>>({}); // Map booking_id to escrowId
  const [processingEscrow, setProcessingEscrow] = useState<Record<string, 'releasing' | 'refunding'>>({});

  const {
    bookings,
    loading: bookingsLoading,
    error: bookingsError,
    fetchBookings
  } = useBookings(userId, 'client');

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
    console.log('🔄 ClientProjects: useEffect triggered', {
      userId,
      hasFetchBookings: !!fetchBookings,
      statusFilter
    });
    if (userId) {
      console.log('✅ ClientProjects: Calling fetchBookings with userId:', userId);
      fetchBookings();
    } else {
      console.log('⏸️ ClientProjects: Skipping fetchBookings - no userId');
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

  // Get escrow ID from booking - try multiple formats since escrow ID is projectId:number
  // Also try to find escrows even if there's no booking (for escrows created before booking creation was added)
  const getEscrowId = async (booking: any, userPrincipal?: string): Promise<string | null> => {
    const projectId = booking.service_id || booking.booking_id;
    if (!projectId) {
      console.log('No projectId for booking:', booking.booking_id);
      return null;
    }

    console.log('Searching for escrow with projectId:', projectId);

    // Try to find the escrow by checking multiple possible IDs (0, 1, 2, etc.)
    // Escrow IDs are in format projectId:number where number auto-increments
    for (let i = 0; i < 20; i++) { // Increased to 20 to find more escrows
      const escrowId = `${projectId}:${i}`;
      try {
        console.log('Trying escrow ID:', escrowId);
        const response = await fetch(`/api/escrow/${escrowId}/refresh`);
        const result = await response.json();
        if (result.success) {
          // Found a valid escrow - verify it belongs to this user if we have principal
          if (userPrincipal) {
            try {
              // Get escrow details to verify client
              const escrowResponse = await fetch(`/api/escrow/${escrowId}/get`);
              if (escrowResponse.ok) {
                const escrowData = await escrowResponse.json();
                if (escrowData.success && escrowData.data.client === userPrincipal) {
                  console.log('✅ Found escrow ID for user:', escrowId, 'funded:', result.data.funded);
                  return escrowId;
                } else {
                  console.log('Escrow belongs to different client, skipping');
                  continue;
                }
              }
            } catch (e) {
              // If we can't verify, still use it (might be the user's escrow)
              console.log('Could not verify escrow ownership, using it anyway');
            }
          }
          // Found a valid escrow
          console.log('✅ Found escrow ID:', escrowId, 'funded:', result.data.funded);
          return escrowId;
        } else {
          console.log('Escrow ID not found or error:', escrowId, result.error);
        }
      } catch (error: any) {
        console.log('Error checking escrow ID:', escrowId, error.message);
        // Continue to next number
        continue;
      }
    }
    console.log('❌ No escrow found for projectId:', projectId);
    return null;
  };

  // Fetch escrow status for a booking
  const fetchEscrowStatus = async (escrowId: string) => {
    try {
      const response = await fetch(`/api/escrow/${escrowId}/refresh`);
      const result = await response.json();
      if (result.success) {
        setEscrowStatuses(prev => ({
          ...prev,
          [escrowId]: {
            funded: result.data.funded,
            balanceE8s: result.data.balanceE8s,
            status: result.data.funded ? 'funded' : 'created'
          }
        }));
      }
    } catch (error) {
      console.error('Error fetching escrow status:', error);
    }
  };

  // Release escrow funds using Plug wallet
  const handleReleaseEscrow = async (e: React.MouseEvent, escrowId: string) => {
    e.stopPropagation(); // Prevent card click
    
    if (!confirm('Are you sure you want to release the escrow? Funds will be transferred to the freelancer.')) {
      return;
    }
    
    setProcessingEscrow(prev => ({ ...prev, [escrowId]: 'releasing' }));
    
    try {
      // Check if Plug wallet is available
      if (typeof window === 'undefined' || !(window as any).ic?.plug) {
        throw new Error('Plug wallet not found. Please install Plug wallet extension.');
      }

      const plug = (window as any).ic.plug;
      const IC_HOST = process.env.NEXT_PUBLIC_IC_HOST || 'https://icp0.io';
      const escrowCanisterId = process.env.NEXT_PUBLIC_ESCROW_CANISTER_ID;

      if (!escrowCanisterId) {
        throw new Error('Escrow canister ID not configured');
      }

      // Ensure wallet is connected
      const isConnected = await plug.isConnected();
      if (!isConnected) {
        const connected = await plug.requestConnect({
          whitelist: [escrowCanisterId],
          host: IC_HOST,
        });
        if (!connected) {
          throw new Error('Wallet connection was cancelled or failed');
        }
      }

      await new Promise(resolve => setTimeout(resolve, 500));

      // Get agent from Plug
      let agent = plug.agent || plug.createAgent?.() || plug.getAgent?.();
      if (!agent) {
        await new Promise(resolve => setTimeout(resolve, 500));
        agent = plug.agent;
      }

      if (!agent) {
        throw new Error('Failed to get wallet agent');
      }

      // Fetch root key for localhost
      if (IC_HOST.includes('localhost') || IC_HOST.includes('127.0.0.1')) {
        try {
          await agent.fetchRootKey();
        } catch (e) {
          // Ignore
        }
      }

      // Create escrow actor with Plug's agent
      const { Actor } = await import('@dfinity/agent');
      const { Principal } = await import('@dfinity/principal');
      const { idlFactory: escrowIdlFactory } = await import('@/lib/declarations/escrow/escrow.did.js');

      const canisterId = Principal.fromText(escrowCanisterId);
      const escrowActor = Actor.createActor(escrowIdlFactory, {
        agent,
        canisterId,
      });

      // Call release function directly
      const result: any = await escrowActor.release(escrowId);

      if ('err' in result) {
        throw new Error(result.err);
      }

      // Success - refresh status and bookings
      await fetchEscrowStatus(escrowId);
      await fetchBookings();
      alert('Escrow released successfully! Funds have been transferred to the freelancer.');
      
    } catch (error: any) {
      console.error('Error releasing escrow:', error);
      alert(`Failed to release escrow: ${error.message || 'Unknown error'}`);
    } finally {
      setProcessingEscrow(prev => {
        const newState = { ...prev };
        delete newState[escrowId];
        return newState;
      });
    }
  };

  // Refund escrow funds using Plug wallet
  const handleRefundEscrow = async (e: React.MouseEvent, escrowId: string) => {
    e.stopPropagation(); // Prevent card click
    if (!confirm('Are you sure you want to refund this escrow? Funds will be returned to your wallet.')) {
      return;
    }
    
    setProcessingEscrow(prev => ({ ...prev, [escrowId]: 'refunding' }));
    
    try {
      // Check if Plug wallet is available
      if (typeof window === 'undefined' || !(window as any).ic?.plug) {
        throw new Error('Plug wallet not found. Please install Plug wallet extension.');
      }

      const plug = (window as any).ic.plug;
      const IC_HOST = process.env.NEXT_PUBLIC_IC_HOST || 'https://icp0.io';
      const escrowCanisterId = process.env.NEXT_PUBLIC_ESCROW_CANISTER_ID;

      if (!escrowCanisterId) {
        throw new Error('Escrow canister ID not configured');
      }

      // Ensure wallet is connected
      const isConnected = await plug.isConnected();
      if (!isConnected) {
        const connected = await plug.requestConnect({
          whitelist: [escrowCanisterId],
          host: IC_HOST,
        });
        if (!connected) {
          throw new Error('Wallet connection was cancelled or failed');
        }
      }

      await new Promise(resolve => setTimeout(resolve, 500));

      // Get agent from Plug
      let agent = plug.agent || plug.createAgent?.() || plug.getAgent?.();
      if (!agent) {
        await new Promise(resolve => setTimeout(resolve, 500));
        agent = plug.agent;
      }

      if (!agent) {
        throw new Error('Failed to get wallet agent');
      }

      // Fetch root key for localhost
      if (IC_HOST.includes('localhost') || IC_HOST.includes('127.0.0.1')) {
        try {
          await agent.fetchRootKey();
        } catch (e) {
          // Ignore
        }
      }

      // Create escrow actor with Plug's agent
      const { Actor } = await import('@dfinity/agent');
      const { Principal } = await import('@dfinity/principal');
      const { idlFactory: escrowIdlFactory } = await import('@/lib/declarations/escrow/escrow.did.js');

      const canisterId = Principal.fromText(escrowCanisterId);
      const escrowActor = Actor.createActor(escrowIdlFactory, {
        agent,
        canisterId,
      });

      // Call refund function directly
      const result: any = await escrowActor.refund(escrowId);

      if ('err' in result) {
        throw new Error(result.err);
      }

      // Success - refresh status and bookings
      await fetchEscrowStatus(escrowId);
      await fetchBookings();
      alert('Escrow refunded successfully! Funds have been returned to your wallet.');
      
    } catch (error: any) {
      console.error('Error refunding escrow:', error);
      alert(`Failed to refund escrow: ${error.message || 'Unknown error'}`);
    } finally {
      setProcessingEscrow(prev => {
        const newState = { ...prev };
        delete newState[escrowId];
        return newState;
      });
    }
  };

  // Fetch escrow statuses for all bookings with escrow payments
  useEffect(() => {
    const fetchEscrows = async () => {
      if (bookings.length > 0) {
        console.log('Fetching escrow statuses for', bookings.length, 'bookings');
        for (const booking of bookings) {
          // Only fetch if payment status indicates escrow
          const isEscrowPayment = getStatusString(booking.payment_status) === 'HeldInEscrow' || booking.payment_method === 'escrow';
          if (isEscrowPayment) {
            console.log('Looking for escrow for booking:', booking.booking_id, 'service_id:', booking.service_id);
            const escrowId = await getEscrowId(booking);
            if (escrowId) {
              console.log('Found escrow ID:', escrowId, 'for booking:', booking.booking_id);
              // Store the escrow ID for this booking
              setEscrowIds(prev => ({
                ...prev,
                [booking.booking_id]: escrowId
              }));
              // Fetch status if not already fetched
              if (!escrowStatuses[escrowId]) {
                await fetchEscrowStatus(escrowId);
              }
            } else {
              console.log('No escrow found for booking:', booking.booking_id);
            }
          }
        }
      }
    };
    fetchEscrows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookings]);

  
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

        {/* Debug Info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-xs">
            <p><strong>Debug Info:</strong></p>
            <p>Bookings loaded: {bookings.length}</p>
            <p>Escrow IDs found: {Object.keys(escrowIds).length}</p>
            <p>Escrow statuses: {Object.keys(escrowStatuses).length}</p>
            <p>User ID: {userId || 'Not set'}</p>
            <details className="mt-2">
              <summary className="cursor-pointer font-semibold">Bookings Details</summary>
              <pre className="mt-2 text-xs overflow-auto max-h-40">
                {JSON.stringify(bookings.map(b => ({
                  booking_id: b.booking_id,
                  service_id: b.service_id,
                  payment_method: b.payment_method,
                  payment_status: getStatusString(b.payment_status),
                  escrow_id: escrowIds[b.booking_id],
                  escrow_funded: escrowIds[b.booking_id] ? escrowStatuses[escrowIds[b.booking_id]]?.funded : 'not checked'
                })), null, 2)}
              </pre>
            </details>
          </div>
        )}

        {bookings.length === 0 && !bookingsLoading && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No projects found</p>
            <p className="text-gray-400 text-sm mt-2">
              {bookingsError 
                ? `Error: ${bookingsError}` 
                : 'Create a booking or escrow payment to see your projects here'}
            </p>
            {userId && (
              <p className="text-gray-400 text-xs mt-1">User ID: {userId}</p>
            )}
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg max-w-md mx-auto">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> If you recently created an escrow payment, it should appear here once it's funded. 
                New escrows will automatically create a booking.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Projects Grid */}
          {bookings.length > 0 ? (
            bookings
              .filter((booking) => {
                // Show all non-escrow projects
                const isEscrowPayment = booking.payment_method === 'escrow' || getStatusString(booking.payment_status) === 'HeldInEscrow';
                if (!isEscrowPayment) {
                  console.log('Showing non-escrow project:', booking.booking_id);
                  return true; // Show all non-escrow projects
                }
                
                // For escrow projects:
                const escrowId = escrowIds[booking.booking_id];
                console.log('Escrow project check:', {
                  booking_id: booking.booking_id,
                  service_id: booking.service_id,
                  escrowId,
                  hasStatus: !!escrowStatuses[escrowId],
                  funded: escrowStatuses[escrowId]?.funded
                });
                
                // If escrow ID not found yet, still show it (escrow lookup might be in progress)
                if (!escrowId) {
                  console.log('Showing escrow project (ID not found yet):', booking.booking_id);
                  return true;
                }
                
                // If escrow ID found, check if it's funded
                const escrowStatus = escrowStatuses[escrowId];
                if (!escrowStatus) {
                  console.log('Showing escrow project (status loading):', booking.booking_id);
                  return true; // Still loading status, show it
                }
                
                // Only show if funded
                const shouldShow = escrowStatus.funded;
                console.log('Escrow project filter result:', {
                  booking_id: booking.booking_id,
                  escrowId,
                  funded: escrowStatus.funded,
                  shouldShow
                });
                return shouldShow;
              })
              .map((booking) => {
            // Get the escrow ID for this booking
            const escrowId = escrowIds[booking.booking_id];
            const escrowStatus = escrowId ? escrowStatuses[escrowId] : null;
            const isEscrowPayment = booking.payment_method === 'escrow' || getStatusString(booking.payment_status) === 'HeldInEscrow';
            const isProcessing = escrowId && processingEscrow[escrowId];
            
            return (
              <Card
                key={booking.booking_id}
                className="border cursor-pointer transition-all border-gray-200 hover:border-gray-300 hover:shadow-md"
                onClick={() => router.push(`/client/projects/${booking.booking_id}`)}
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
                      {booking.escrow_amount_dollars && (
                        <div className="text-sm text-green-600 font-medium">
                          ${booking.escrow_amount_dollars.toFixed(2)} USD
                        </div>
                      )}
                      <div className="text-sm text-gray-500">
                        {formatBookingDateShort(booking.created_at)}
                      </div>
                      {booking.delivery_deadline && (
                        <div className={`text-xs mt-1 ${isOverdue(booking.delivery_deadline) ? 'text-red-600' : 'text-orange-600'}`}>
                          📅 Due: {formatBookingDateShort(booking.delivery_deadline)}
                          {isOverdue(booking.delivery_deadline) && (
                            <span className="ml-1 font-semibold">(OVERDUE)</span>
                          )}
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

                    {/* Escrow Actions - Only show for funded escrows */}
                    {isEscrowPayment && escrowId && escrowStatus && escrowStatus.funded && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-2 mb-3">
                          <Wallet size={14} className="text-purple-600" />
                          <span className="text-xs font-medium text-gray-700">Escrow Payment</span>
                          <Badge variant="default" className="text-xs bg-green-600">
                            ✓ Funded
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <button
                            onClick={(e) => handleReleaseEscrow(e, escrowId)}
                            disabled={!!isProcessing}
                            className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                          >
                            {isProcessing === 'releasing' ? (
                              <>
                                <RefreshCw size={14} className="animate-spin" />
                                Releasing...
                              </>
                            ) : (
                              <>
                                <CheckCircle size={14} />
                                Mark Complete & Release
                              </>
                            )}
                          </button>
                          <button
                            onClick={(e) => handleRefundEscrow(e, escrowId)}
                            disabled={!!isProcessing}
                            className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                          >
                            {isProcessing === 'refunding' ? (
                              <>
                                <RefreshCw size={14} className="animate-spin" />
                                Refunding...
                              </>
                            ) : (
                              <>
                                <ArrowLeft size={14} />
                                Request Refund
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">No bookings to display</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
