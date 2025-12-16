'use client'
import React, { useState, useEffect, useCallback } from 'react';
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
import { ReviewModal } from '@/components/ReviewModal';

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const bookingId = params.bookingId as string;

  const [session, setSession] = useState<any>(null);
  const [userId, setUserId] = useState<string>('');
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [releasing, setReleasing] = useState(false);
  const [refunding, setRefunding] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

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

  // Fetch project details function - wrapped in useCallback to prevent unnecessary re-renders
  const fetchProjectDetails = useCallback(async () => {
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
  }, [bookingId, userId]);

  // Fetch project details on mount or when bookingId/userId changes
  useEffect(() => {
    fetchProjectDetails();
  }, [fetchProjectDetails]);


  
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

  // Helper to get status string
  const getStatusString = (status: any): string => {
    if (typeof status === 'string') return status;
    if (typeof status === 'object' && status !== null) {
      const statusKey = Object.keys(status)[0];
      return statusKey || 'Pending';
    }
    return 'Pending';
  };

  // Get escrow ID from project - try multiple fields
  const getEscrowId = (): string | null => {
    if (!project) return null;
    
    console.log('🔍 Looking for escrow ID in project:', {
      payment_id: project.payment_id,
      transaction_id: project.transaction_id,
      escrow_account: project.escrow_account,
      service_id: project.service_id,
      package_service_id: project.package_details?.service_id
    });
    
    // Try escrow_account first (this is the actual escrow ID from booking response)
    if (project.escrow_account && typeof project.escrow_account === 'string') {
      // escrow_account is the escrow ID in format: serviceId:number
      if (project.escrow_account.includes(':')) {
        console.log('✅ Found escrow ID in escrow_account:', project.escrow_account);
        return project.escrow_account;
      }
    }
    
    // Try payment_id (might be escrow ID)
    if (project.payment_id && typeof project.payment_id === 'string') {
      if (project.payment_id.includes(':')) {
        console.log('✅ Found escrow ID in payment_id:', project.payment_id);
        return project.payment_id;
      }
    }
    
    // Try transaction_id
    if (project.transaction_id && typeof project.transaction_id === 'string' && project.transaction_id.includes(':')) {
      console.log('✅ Found escrow ID in transaction_id:', project.transaction_id);
      return project.transaction_id;
    }
    
    // Last resort: construct from service_id
    const serviceId = project.service_id || project.package_details?.service_id;
    if (serviceId) {
      const constructedId = `${serviceId}:0`;
      console.log('⚠️ Constructed escrow ID from service_id:', constructedId);
      return constructedId;
    }
    
    console.error('❌ No escrow ID found in project data');
    return null;
  };

  // Handle release funds - call escrow canister directly using Plug wallet
  const handleReleaseFunds = async () => {
    let escrowId = getEscrowId();
    if (!escrowId) {
      alert('Escrow ID not found. Cannot release funds. Please check if the escrow exists.');
      return;
    }

    if (!confirm('Are you sure you want to release funds to the freelancer? This action cannot be undone.')) {
      return;
    }

    // Check if Plug wallet is available
    if (typeof window === 'undefined' || !(window as any).ic?.plug) {
      alert('Plug wallet not found. Please install and connect Plug wallet to release funds.');
      return;
    }

    const plug = (window as any).ic.plug;
    
    // Check if wallet is connected
    try {
      const isConnected = await plug.isConnected();
      if (!isConnected) {
        const connected = await plug.requestConnect({
          whitelist: [process.env.NEXT_PUBLIC_ESCROW_CANISTER_ID || ''],
          host: process.env.NEXT_PUBLIC_IC_HOST || 'https://ic0.app',
        });
        if (!connected) {
          alert('Please connect your Plug wallet to release funds.');
          return;
        }
      }
    } catch (error) {
      alert('Failed to connect Plug wallet. Please try again.');
      return;
    }

    setReleasing(true);
    let success = false;
    let lastError = 'Unknown error';
    let foundEscrowId = escrowId;

    try {
      // First, get the escrow actor using Plug wallet
      const { Actor, HttpAgent } = await import('@dfinity/agent');
      const { Principal } = await import('@dfinity/principal');
      
      // Import IDL factory directly - ensure we get the latest version
      const escrowDidModule = await import('@/lib/declarations/escrow/escrow.did.js');
      const escrowIdlFactory = escrowDidModule.idlFactory;
      
      // Verify IDL factory exists and has the release method
      if (!escrowIdlFactory) {
        throw new Error('Failed to load escrow IDL factory');
      }
      console.log('✅ Escrow IDL factory loaded:', typeof escrowIdlFactory);
      
      // Get agent from Plug (has user's identity)
      // Increased wait time to ensure agent is fully ready
      await new Promise(resolve => setTimeout(resolve, 1500)); // Wait for agent to be ready
      let agent = plug.agent;
      if (!agent) {
        agent = plug.createAgent?.() || plug.getAgent?.();
      }
      
      if (!agent) {
        // Create agent manually with Plug's identity
        const IC_HOST = process.env.NEXT_PUBLIC_IC_HOST || 'https://ic0.app';
        agent = new HttpAgent({
          host: IC_HOST,
          identity: plug.sessionManager?.identity || plug.identity,
        });
        
        if (IC_HOST.includes('localhost') || IC_HOST.includes('127.0.0.1')) {
          await agent.fetchRootKey();
        }
      }

      // Ensure agent is ready by verifying it has an identity
      if (!agent || !agent.getPrincipal) {
        throw new Error('Agent is not properly initialized. Please reconnect your Plug wallet.');
      }
      
      // Verify agent identity is available
      try {
        const principal = await agent.getPrincipal();
        console.log('✅ Agent ready with principal:', principal.toString());
      } catch (identityError) {
        console.warn('⚠️ Could not verify agent identity, but continuing:', identityError);
      }

      const canisterId = Principal.fromText(process.env.NEXT_PUBLIC_ESCROW_CANISTER_ID || '');
      console.log('🔧 Creating actor with canister ID:', canisterId.toString());
      console.log('🔧 IDL factory type:', typeof escrowIdlFactory);
      
      // Verify IDL factory structure
      if (typeof escrowIdlFactory !== 'function') {
        throw new Error(`Invalid IDL factory: expected function, got ${typeof escrowIdlFactory}`);
      }
      
      // Create actor with explicit IDL factory
      const escrowActor = Actor.createActor(escrowIdlFactory, {
        agent,
        canisterId,
      });
      
      // Verify the actor has the release method
      if (!escrowActor || typeof escrowActor.release !== 'function') {
        const actorKeys = escrowActor ? Object.keys(escrowActor) : [];
        throw new Error(`Escrow actor does not have release method. Available methods: ${actorKeys.join(', ')}`);
      }
      console.log('✅ Escrow actor created, release method available:', typeof escrowActor.release);
      
      // First, test with a query function to verify canister is accessible and IDL matches
      try {
        console.log('🔍 Testing canister connection with get_treasury query...');
        const treasuryTest: any = await escrowActor.get_treasury();
        console.log('✅ Canister query successful, treasury:', treasuryTest.toString());
      } catch (testError: any) {
        console.error('❌ Canister query test failed:', testError);
        throw new Error(`Cannot connect to escrow canister. This might indicate the canister needs to be redeployed or there's a network issue. Error: ${testError.message}`);
      }

      // Try to find the escrow - try different counter values if needed
      console.log('🔍 Attempting to release escrow:', escrowId);
      
      let escrow: any = null;
      let escrowFound = false;
      
      try {
        escrow = await escrowActor.get(escrowId);
        escrowFound = true;
        foundEscrowId = escrowId;
        console.log('✅ Escrow found with ID:', escrowId);
      } catch (getError: any) {
        // Try different counter values
        if (escrowId.includes(':')) {
          const parts = escrowId.split(':');
          const projectId = parts.slice(0, -1).join(':');
          
          for (let i = 0; i <= 20; i++) {
            const tryEscrowId = `${projectId}:${i}`;
            try {
              escrow = await escrowActor.get(tryEscrowId);
              foundEscrowId = tryEscrowId;
              escrowFound = true;
              console.log(`✅ Found escrow with ID: ${tryEscrowId}`);
              break;
            } catch (e) {
              // Not found, continue
            }
          }
        }
      }

      if (!escrowFound || !escrow) {
        throw new Error(`Escrow not found: ${escrowId}`);
      }

      // IMPORTANT: Refresh funding status first to update from #created to #funded
      // This checks the ledger balance and updates status if funds are available
      console.log('🔄 Refreshing escrow funding status...');
      const refreshResult: any = await escrowActor.refresh_funding(foundEscrowId);
      const balance = Number(refreshResult.balanceE8s);
      const isFunded = refreshResult.funded;
      const expectedE8s = Number(escrow.expectedE8s || 0);
      
      console.log('📊 Refresh result:', {
        funded: isFunded,
        balanceE8s: balance,
        balanceICP: balance / 100000000,
        expectedE8s: expectedE8s,
        expectedICP: expectedE8s / 100000000
      });

      if (!isFunded) {
        if (balance === 0) {
          throw new Error(`No funds found in escrow. Balance: 0 ICP. Please deposit funds to the escrow account first.`);
        } else {
          throw new Error(`Escrow is not fully funded. Current balance: ${balance / 100000000} ICP, Expected: ${expectedE8s / 100000000} ICP`);
        }
      }

      // Get updated escrow to verify status
      escrow = await escrowActor.get(foundEscrowId);
      console.log('✅ Escrow status updated. Current status:', 
        escrow.status && 'funded' in escrow.status ? 'FUNDED' : 
        escrow.status && 'created' in escrow.status ? 'CREATED' : 'OTHER');

      // Call release directly with Plug wallet (authenticated call)
      // Update calls can take 30-90 seconds, so we add a timeout wrapper
      console.log('🚀 Releasing escrow with Plug wallet:', foundEscrowId);
      console.log('🔍 Escrow actor type:', typeof escrowActor);
      console.log('🔍 Release function type:', typeof escrowActor.release);
      
      let releaseResult: any;
      try {
        // Add timeout wrapper for the release call (update calls can take 30-90 seconds)
        const releasePromise = escrowActor.release(foundEscrowId);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Release call timed out after 120 seconds. The canister may be processing the request. Please check the escrow status and try again if needed.')), 120000)
        );
        
        releaseResult = await Promise.race([releasePromise, timeoutPromise]);
        console.log('✅ Release result received:', releaseResult);
        console.log('✅ Release result type:', typeof releaseResult);
        console.log('✅ Release result keys:', Object.keys(releaseResult || {}));
      } catch (callError: any) {
        console.error('❌ Error calling release:', callError);
        console.error('❌ Error details:', {
          message: callError.message,
          stack: callError.stack,
          name: callError.name,
          cause: callError.cause
        });
        
        // Check for timeout or read state errors
        if (callError.message?.includes('Invalid read state') || 
            callError.message?.includes('response could not be found') ||
            callError.message?.includes('timed out')) {
          const errorMsg = `The release call timed out or the response was not found. This can happen if:\n\n` +
            `1. The network is slow or unstable\n` +
            `2. The canister is processing other requests\n` +
            `3. The agent connection was interrupted\n\n` +
            `Please try again. If the issue persists, check:\n` +
            `- Your internet connection\n` +
            `- The escrow canister status\n` +
            `- Try refreshing the page and reconnecting your wallet\n\n` +
            `Escrow ID: ${foundEscrowId}\n` +
            `Original error: ${callError.message}`;
          throw new Error(errorMsg);
        }
        
        // Check if it's an IDL parsing error
        if (callError.message?.includes('IDL error') || callError.message?.includes('parsing') || callError.message?.includes('unexpected IDL type')) {
          const errorMsg = `IDL Mismatch Error: The deployed escrow canister (${process.env.NEXT_PUBLIC_ESCROW_CANISTER_ID}) has a different interface than expected.\n\n` +
            `Expected: release(escrowId) returns TransferResult { ok: Nat } | { err: Text }\n` +
            `Actual: The deployed canister appears to return a different type.\n\n` +
            `Solution: Rebuild and redeploy the escrow canister with:\n` +
            `  cd backend && dfx deploy escrow --network ic\n\n` +
            `Original error: ${callError.message}`;
          throw new Error(errorMsg);
        }
        throw callError;
      }

      // Handle the result - check for both possible formats
      if (!releaseResult) {
        throw new Error('Release function returned undefined or null');
      }

      if (typeof releaseResult === 'object') {
        if ('err' in releaseResult) {
          throw new Error(String(releaseResult.err));
        }
        if ('ok' in releaseResult) {
          console.log('✅ Release successful, block index:', releaseResult.ok);
        } else {
          console.warn('⚠️ Unexpected result format:', releaseResult);
          // Try to proceed anyway if it seems like a success
          if (typeof releaseResult === 'bigint' || typeof releaseResult === 'number') {
            console.log('✅ Assuming success - got block index:', releaseResult);
          } else {
            throw new Error(`Unexpected release result format: ${JSON.stringify(releaseResult)}`);
          }
        }
      } else {
        throw new Error(`Release function returned unexpected type: ${typeof releaseResult}, value: ${releaseResult}`);
      }

      // Mark project as completed and update payment status
      try {
        console.log('📝 Marking project as completed...');
        
        // Update booking status to Completed using updateBookingStatusWithTimeline
        // This allows the client to mark the project as completed after releasing funds
        const statusResponse = await fetch(`/api/marketplace/bookings/${bookingId}/status`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            userId: userId,
            status: 'Completed',
            description: 'Project completed and funds released from escrow'
          }),
        });

        if (statusResponse.ok) {
          console.log('✅ Project marked as completed');
        } else {
          console.warn('⚠️ Failed to mark project as completed, but escrow was released');
        }
      } catch (completeError) {
        console.warn('⚠️ Failed to mark project as completed:', completeError);
        // Don't fail the whole operation - escrow was successfully released
      }

      success = true;
      
      // Refresh project details to get updated status
      await fetchProjectDetails();
      
      // Show success message and review modal
      console.log('✅ Funds released successfully! Project marked as completed.');
      setShowReviewModal(true);
    } catch (error: any) {
      console.error('❌ Error releasing escrow:', error);
      lastError = error.message || 'Unknown error';
      
      // Handle specific errors
      if (error.message?.includes('Unauthorized') || error.message?.includes('unauthorized')) {
        alert(`Failed to release funds: ${lastError}\n\nMake sure you are using the correct wallet that created the escrow.\nEscrow ID: ${foundEscrowId}`);
      } else {
        alert(`Failed to release funds: ${lastError}\n\nEscrow ID used: ${foundEscrowId}\n\nPlease check the escrow ID or contact support.`);
      }
    } finally {
      setReleasing(false);
    }
  };

  // Handle refund funds - call escrow canister directly using Plug wallet
  const handleRefundFunds = async () => {
    let escrowId = getEscrowId();
    if (!escrowId) {
      alert('Escrow ID not found. Cannot refund funds. Please check if the escrow exists.');
      return;
    }

    if (!confirm('Are you sure you want to refund the funds? This will return the money to your wallet.')) {
      return;
    }

    // Check if Plug wallet is available
    if (typeof window === 'undefined' || !(window as any).ic?.plug) {
      alert('Plug wallet not found. Please install and connect Plug wallet to refund funds.');
      return;
    }

    const plug = (window as any).ic.plug;
    
    // Check if wallet is connected
    try {
      const isConnected = await plug.isConnected();
      if (!isConnected) {
        const connected = await plug.requestConnect({
          whitelist: [process.env.NEXT_PUBLIC_ESCROW_CANISTER_ID || ''],
          host: process.env.NEXT_PUBLIC_IC_HOST || 'https://ic0.app',
        });
        if (!connected) {
          alert('Please connect your Plug wallet to refund funds.');
          return;
        }
      }
    } catch (error) {
      alert('Failed to connect Plug wallet. Please try again.');
      return;
    }

    setRefunding(true);
    let success = false;
    let lastError = 'Unknown error';
    let foundEscrowId = escrowId;

    try {
      // Get the escrow actor using Plug wallet
      const { Actor, HttpAgent } = await import('@dfinity/agent');
      const { Principal } = await import('@dfinity/principal');
      const { idlFactory: escrowIdlFactory } = await import('@/lib/declarations/escrow/escrow.did.js');
      
      // Get agent from Plug (has user's identity)
      // Increased wait time to ensure agent is fully ready
      await new Promise(resolve => setTimeout(resolve, 1500)); // Wait for agent to be ready
      let agent = plug.agent;
      if (!agent) {
        agent = plug.createAgent?.() || plug.getAgent?.();
      }
      
      if (!agent) {
        // Create agent manually with Plug's identity
        const IC_HOST = process.env.NEXT_PUBLIC_IC_HOST || 'https://ic0.app';
        agent = new HttpAgent({
          host: IC_HOST,
          identity: plug.sessionManager?.identity || plug.identity,
        });
        
        if (IC_HOST.includes('localhost') || IC_HOST.includes('127.0.0.1')) {
          await agent.fetchRootKey();
        }
      }

      // Ensure agent is ready by verifying it has an identity
      if (!agent || !agent.getPrincipal) {
        throw new Error('Agent is not properly initialized. Please reconnect your Plug wallet.');
      }
      
      // Verify agent identity is available
      try {
        const principal = await agent.getPrincipal();
        console.log('✅ Agent ready with principal:', principal.toString());
      } catch (identityError) {
        console.warn('⚠️ Could not verify agent identity, but continuing:', identityError);
      }

      const canisterId = Principal.fromText(process.env.NEXT_PUBLIC_ESCROW_CANISTER_ID || '');
      const escrowActor = Actor.createActor(escrowIdlFactory, {
        agent,
        canisterId,
      });

      // Try to find the escrow - try different counter values if needed
      console.log('🔍 Attempting to refund escrow:', escrowId);
      
      let escrow: any = null;
      let escrowFound = false;
      
      try {
        escrow = await escrowActor.get(escrowId);
        escrowFound = true;
        foundEscrowId = escrowId;
        console.log('✅ Escrow found with ID:', escrowId);
      } catch (getError: any) {
        // Try different counter values
        if (escrowId.includes(':')) {
          const parts = escrowId.split(':');
          const projectId = parts.slice(0, -1).join(':');
          
          for (let i = 0; i <= 20; i++) {
            const tryEscrowId = `${projectId}:${i}`;
            try {
              escrow = await escrowActor.get(tryEscrowId);
              foundEscrowId = tryEscrowId;
              escrowFound = true;
              console.log(`✅ Found escrow with ID: ${tryEscrowId}`);
              break;
            } catch (e) {
              // Not found, continue
            }
          }
        }
      }

      if (!escrowFound || !escrow) {
        throw new Error(`Escrow not found: ${escrowId}`);
      }

      // Check escrow status - cannot refund if already released
      if (escrow.status && 'released' in escrow.status) {
        throw new Error('Cannot refund a released escrow');
      }

      // Refresh funding to get current balance
      console.log('🔄 Refreshing escrow funding status before refund...');
      const refreshResult: any = await escrowActor.refresh_funding(foundEscrowId);
      const balance = Number(refreshResult.balanceE8s);
      
      console.log('📊 Refresh result:', {
        funded: refreshResult.funded,
        balanceE8s: balance,
        balanceICP: balance / 100000000
      });

      if (balance === 0) {
        throw new Error('No funds available to refund. Balance: 0 ICP');
      }

      // Call refund directly with Plug wallet (authenticated call)
      // Update calls can take 30-90 seconds, so we add a timeout wrapper
      console.log('🔄 Refunding escrow with Plug wallet:', foundEscrowId);
      
      let refundResult: any;
      try {
        // Add timeout wrapper for the refund call (update calls can take 30-90 seconds)
        const refundPromise = escrowActor.refund(foundEscrowId);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Refund call timed out after 120 seconds. The canister may be processing the request. Please check the escrow status and try again if needed.')), 120000)
        );
        
        refundResult = await Promise.race([refundPromise, timeoutPromise]);
      } catch (callError: any) {
        console.error('❌ Error calling refund:', callError);
        console.error('❌ Error details:', {
          message: callError.message,
          stack: callError.stack,
          name: callError.name,
          cause: callError.cause
        });
        
        // Check for timeout or read state errors
        if (callError.message?.includes('Invalid read state') || 
            callError.message?.includes('response could not be found') ||
            callError.message?.includes('timed out')) {
          const errorMsg = `The refund call timed out or the response was not found. This can happen if:\n\n` +
            `1. The network is slow or unstable\n` +
            `2. The canister is processing other requests\n` +
            `3. The agent connection was interrupted\n\n` +
            `Please try again. If the issue persists, check:\n` +
            `- Your internet connection\n` +
            `- The escrow canister status\n` +
            `- Try refreshing the page and reconnecting your wallet\n\n` +
            `Escrow ID: ${foundEscrowId}\n` +
            `Original error: ${callError.message}`;
          throw new Error(errorMsg);
        }
        
        // Check if it's an IDL parsing error
        if (callError.message?.includes('IDL error') || callError.message?.includes('parsing') || callError.message?.includes('unexpected IDL type')) {
          const errorMsg = `IDL Mismatch Error: The deployed escrow canister (${process.env.NEXT_PUBLIC_ESCROW_CANISTER_ID}) has a different interface than expected.\n\n` +
            `Expected: refund(escrowId) returns TransferResult { ok: Nat } | { err: Text }\n` +
            `Actual: The deployed canister appears to return a different type.\n\n` +
            `Solution: Rebuild and redeploy the escrow canister with:\n` +
            `  cd backend && dfx deploy escrow --network ic\n\n` +
            `Original error: ${callError.message}`;
          throw new Error(errorMsg);
        }
        throw callError;
      }

      if (!refundResult) {
        throw new Error('Refund function returned undefined or null');
      }

      if ('err' in refundResult) {
        throw new Error(String(refundResult.err));
      }

      success = true;
      alert(`Funds refunded successfully! Block index: ${refundResult.ok}`);
      fetchProjectDetails();
    } catch (error: any) {
      console.error('❌ Error refunding escrow:', error);
      lastError = error.message || 'Unknown error';
      
      // Handle specific errors
      if (error.message?.includes('Unauthorized') || error.message?.includes('unauthorized')) {
        alert(`Failed to refund funds: ${lastError}\n\nMake sure you are using the correct wallet that created the escrow.\nEscrow ID: ${foundEscrowId}`);
      } else {
        alert(`Failed to refund funds: ${lastError}\n\nEscrow ID used: ${foundEscrowId}\n\nPlease check the escrow ID or contact support.`);
      }
    } finally {
      setRefunding(false);
    }
  };

  // Handle mark as complete
  const handleMarkAsComplete = async () => {
    if (!confirm('Are you sure you want to mark this project as complete?')) {
      return;
    }

    setCompleting(true);
    try {
      const response = await fetch(`/api/marketplace/bookings/${bookingId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          freelancerId: project?.freelancer_id || project?.freelancer_email,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Project marked as complete!');
        // Refresh project details
        fetchProjectDetails();
      } else {
        alert(`Failed to mark as complete: ${data.error}`);
      }
    } catch (error) {
      console.error('Error marking as complete:', error);
      alert('Failed to mark as complete. Please try again.');
    } finally {
      setCompleting(false);
    }
  };

  // Handle review submission
  const handleSubmitReview = async (rating: number, comment: string) => {
    if (!userId || !bookingId) {
      throw new Error('User ID or Booking ID is missing');
    }

    setSubmittingReview(true);
    try {
      const response = await fetch(`/api/marketplace/bookings/${bookingId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          userId: userId,
          rating: rating,
          comment: comment,
          isClient: true,
        }),
      });

      const data = await response.json();

      if (data.success) {
        console.log('✅ Review submitted successfully');
        setShowReviewModal(false);
        // Refresh project details to show the review
        await fetchProjectDetails();
        alert('Thank you for your review! Your feedback helps improve our platform.');
      } else {
        throw new Error(data.error || 'Failed to submit review');
      }
    } catch (error: any) {
      console.error('Error submitting review:', error);
      throw error;
    } finally {
      setSubmittingReview(false);
    }
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
                            <span className="text-sm">
                              {project.delivery_days 
                                ? (project.delivery_days === 1 ? '1 day' : `${project.delivery_days} days`)
                                : project.package_details?.delivery_time_days 
                                  ? (project.package_details.delivery_time_days === 1 ? '1 day' : `${project.package_details.delivery_time_days} days`)
                                  : project.package_delivery_days
                                    ? (project.package_delivery_days === 1 ? '1 day' : `${project.package_delivery_days} days`)
                                    : 'N/A'}
                            </span>
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

                    {/* Only show delivery deadline if project is not completed */}
                    {project.delivery_deadline && getStatusString(project.status) !== 'Completed' && (
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
            {/* Only show Financial Information if project is not completed */}
            {getStatusString(project.status) !== 'Completed' && (
              <FinancialInformation
                project={project}
                onViewTransaction={handleViewTransaction}
                onReleaseFunds={handleReleaseFunds}
                onRefundFunds={handleRefundFunds}
                onMarkComplete={handleMarkAsComplete}
                releasing={releasing}
                refunding={refunding}
                completing={completing}
              />
            )}

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
                  {getStatusString(project.status) !== 'Completed' && (
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
                  )}
                  {getStatusString(project.status) === 'Completed' && (
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">Completed</div>
                        <div className="text-xs text-gray-500">
                          {project.work_completed_at ? 
                            formatBookingDateShort(project.work_completed_at) :
                            project.updated_at ?
                              formatBookingDateShort(project.updated_at) :
                              'Completed'
                          }
                        </div>
                      </div>
                    </div>
                  )}
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

      {/* Review Modal */}
      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onSubmit={handleSubmitReview}
        freelancerName={project?.freelancer_name || project?.freelancer_email || 'the freelancer'}
        serviceTitle={project?.service_title || project?.package_title || 'this project'}
        submitting={submittingReview}
      />
    </div>
  );
}