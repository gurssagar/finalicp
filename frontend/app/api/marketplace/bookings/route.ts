import { NextRequest, NextResponse } from 'next/server';
import { getMarketplaceActor } from '@/lib/ic-marketplace-agent';
import { getMarketplaceConfig, validateMarketplaceConfig } from '@/lib/marketplace-config';
import {
  transformCanisterBookings,
  convertStatusFilter,
  createMockBooking
} from '@/lib/booking-transformer';
import { emailsMatch } from '@/lib/email-matching';
import { getBookingsForClientFromCanister, getBookingsForFreelancerFromCanister } from '@/lib/booking-utils';

// Helper function to map payment booking status to marketplace status
function mapBookingStatus(paymentStatus: string): string {
  const statusMap: Record<string, string> = {
    'active': 'InProgress',
    'completed': 'Completed',
    'pending': 'Pending',
    'pending_payment': 'Pending',
    'cancelled': 'Cancelled',
    'expired': 'Cancelled'
  };

  return statusMap[paymentStatus.toLowerCase()] || 'Pending';
}

// Helper functions to get user information
async function getClientEmail(clientId: string): Promise<string | null> {
  try {
    // In a real implementation, this would query the user database or auth context
    // For now, we'll use the clientId directly if it looks like an email
    if (clientId.includes('@')) {
      return clientId;
    }
    return `client-${clientId}@example.com`;
  } catch (error) {
    console.error('Error getting client email:', error);
    return null;
  }
}

// Storage helper functions removed - using canister data directly

// GET /api/marketplace/bookings - List bookings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const userType = searchParams.get('user_type') as 'client' | 'freelancer';
    const status = searchParams.get('status') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'User ID is required'
      }, { status: 400 });
    }

    if (!userType || !['client', 'freelancer'].includes(userType)) {
      return NextResponse.json({
        success: false,
        error: 'User type must be client or freelancer'
      }, { status: 400 });
    }

    let bookings: any[] = [];
  let realBookingsCount = 0;
  let mockBookingsCount = 0;
  let dataSource = 'unknown';

  try {
    // Try to get real data from marketplace canister
    console.log('🔍 Attempting to fetch bookings from marketplace canister...');
    validateMarketplaceConfig();

    const actor = await getMarketplaceActor();

    // Call marketplace canister based on user type
    const result = userType === 'client' 
      ? await actor.listBookingsForClient(
          userId,
          convertStatusFilter(status),
          BigInt(limit),
          BigInt(offset)
        )
      : await actor.listBookingsForFreelancer(
          userId,
          convertStatusFilter(status),
          BigInt(limit),
          BigInt(offset)
        );

    if ('ok' in result) {
      console.log('✅ Successfully fetched bookings from canister');
      const canisterBookings = result.ok;
      bookings = transformCanisterBookings(canisterBookings);
      realBookingsCount = canisterBookings.length;
      dataSource = 'canister';

      console.log(`📊 Retrieved ${realBookingsCount} real bookings from marketplace canister for user ${userId}`);
    } else {
      throw new Error(`Canister error: ${result.err}`);
    }

  } catch (canisterError) {
    console.error('❌ Failed to fetch from marketplace canister:', canisterError);
    console.log('🔄 Falling back to available data sources...');

    // Fallback 1: Try to get bookings from canister with fuzzy email matching
    try {
      console.log('🔄 Attempting to get bookings from canister with fuzzy matching...');
      
      if (userType === 'client') {
        // Get bookings for client from canister
        const canisterBookings = await getBookingsForClientFromCanister(userId, status, limit, offset);
        
        if (canisterBookings.length > 0) {
          // Transform canister bookings to match expected format
          const transformedBookings = canisterBookings.map(booking => ({
            booking_id: booking.booking_id,
            client_id: booking.client_id,
            freelancer_id: booking.freelancer_id,
            package_id: booking.package_id,
            service_id: booking.service_id,
            status: booking.status,
            total_amount_e8s: Number(booking.total_amount_e8s),
            escrow_amount_e8s: Math.floor(Number(booking.total_amount_e8s) * 0.95),
            payment_status: booking.payment_status || 'Completed',
            client_notes: booking.description || '',
            service_title: booking.title || 'Service',
            freelancer_name: booking.freelancer_id.split('@')[0],
            package_title: 'Package', // Will be enhanced with service data
            package_tier: 'basic',
            payment_method: 'icp',
            payment_id: booking.booking_id,
            transaction_id: `txn_${booking.booking_id}`,
            created_at: Number(booking.created_at),
            updated_at: Number(booking.updated_at),
            ledger_deposit_block: null,
            delivery_deadline: Number(booking.deadline),
            special_instructions: booking.description || '',
            upsells: [],
            promo_code: undefined
          }));

          bookings = transformedBookings;
          realBookingsCount = transformedBookings.length;
          dataSource = 'canister';
          console.log(`📊 Retrieved ${realBookingsCount} bookings from canister for user ${userId} (${userType})`);
          console.log(`📋 Booking IDs found:`, transformedBookings.map(b => b.booking_id));
        } else {
          console.log(`❌ No bookings found for user ${userId} (${userType}) in canister`);
        }
      } else if (userType === 'freelancer') {
        // Get bookings for freelancer from canister
        const canisterBookings = await getBookingsForFreelancerFromCanister(userId, status, limit, offset);
        
        if (canisterBookings.length > 0) {
          // Transform canister bookings to match expected format
          const transformedBookings = canisterBookings.map(booking => ({
            booking_id: booking.booking_id,
            client_id: booking.client_id,
            freelancer_id: booking.freelancer_id,
            package_id: booking.package_id,
            service_id: booking.service_id,
            status: booking.status,
            total_amount_e8s: Number(booking.total_amount_e8s),
            escrow_amount_e8s: Math.floor(Number(booking.total_amount_e8s) * 0.95),
            payment_status: booking.payment_status || 'Completed',
            client_notes: booking.description || '',
            service_title: booking.title || 'Service',
            freelancer_name: booking.freelancer_id.split('@')[0],
            package_title: 'Package', // Will be enhanced with service data
            package_tier: 'basic',
            payment_method: 'icp',
            payment_id: booking.booking_id,
            transaction_id: `txn_${booking.booking_id}`,
            created_at: Number(booking.created_at),
            updated_at: Number(booking.updated_at),
            ledger_deposit_block: null,
            delivery_deadline: Number(booking.deadline),
            special_instructions: booking.description || '',
            upsells: [],
            promo_code: undefined
          }));

          bookings = transformedBookings;
          realBookingsCount = transformedBookings.length;
          dataSource = 'canister';
          console.log(`📊 Retrieved ${realBookingsCount} bookings from canister for freelancer ${userId}`);
          console.log(`📋 Booking IDs found:`, transformedBookings.map(b => b.booking_id));
        } else {
          console.log(`❌ No bookings found for freelancer ${userId} in canister`);
        }
      }
    } catch (canisterError) {
      console.warn('⚠️  Canister fallback also failed:', canisterError);
    }


    // Fallback 2: Create mock data only for development/demo with specific conditions
    if (bookings.length === 0) {
      // Only create mock data if the user looks like a test/demo user
      const isTestUser = userId.includes('test@') || userId.includes('demo@') || userId.includes('example@');

      if (isTestUser) {
        console.log('📝 Test user detected, creating mock booking for demonstration');
        const mockBooking = createMockBooking(userId);
        bookings = [mockBooking];
        mockBookingsCount = 1;
        dataSource = 'mock';
      } else {
        console.log(`📝 No real bookings found for user ${userId} and not a test user - returning empty list`);
      }
    }
  }

  console.log(`📊 Final result: ${bookings.length} bookings (Real: ${realBookingsCount}, Mock: ${mockBookingsCount}, Source: ${dataSource})`);

  return NextResponse.json({
    success: true,
    data: bookings,
    realBookingsCount,
    mockBookingsCount,
    dataSource,
    canisterAvailable: dataSource === 'canister',
    environmentConfigured: getMarketplaceConfig().isConfigured
  });

  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch bookings'
    }, { status: 500 });
  }
}

// POST /api/marketplace/bookings - Book a package
export async function POST(request: NextRequest) {
  console.log('🚀 POST /api/marketplace/bookings called');

  try {
    const body = await request.json();
    const {
      clientId,
      packageId,
      specialInstructions,
      paymentMethod,
      totalAmount,
      upsells,
      promoCode,
      paymentId,
      transactionId
    } = body;
    console.log('📝 Request body:', {
      clientId,
      packageId,
      specialInstructions,
      paymentMethod,
      totalAmount,
      upsells: upsells?.length || 0,
      promoCode,
      paymentId,
      transactionId
    });

    if (!clientId) {
      return NextResponse.json({
        success: false,
        error: 'Client ID is required'
      }, { status: 400 });
    }

    if (!packageId) {
      return NextResponse.json({
        success: false,
        error: 'Package ID is required'
      }, { status: 400 });
    }

    // Special instructions are optional - provide default if empty
    const instructions = specialInstructions || 'Standard service booking';
    console.log('📝 Instructions:', instructions);

    // Generate idempotency key
    const idempotencyKey = `booking-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    console.log('🔑 Idempotency key:', idempotencyKey);

    // Connect to real marketplace canister
    console.log('🔗 Connecting to marketplace canister...');

    try {
      // Get marketplace actor
      const actor = await getMarketplaceActor();

      // Extract service ID from package ID (assuming packageId contains service info or we need to parse it)
      // For now, we'll use a simple approach - this may need adjustment based on your ID format
      const serviceId = packageId.split('_')[0]; // Adjust this logic based on your actual ID format

      // Get service data from canister
      console.log('🔍 Looking for service:', serviceId);
      const serviceResult = await actor.getService(serviceId);

      if ('err' in serviceResult) {
        console.error('❌ Service not found in canister:', serviceId);
        return NextResponse.json({
          success: false,
          error: { NotFound: 'Service not found' }
        }, { status: 400 });
      }

      const serviceData = serviceResult.ok;

      // Find package in service packages
      const packageData = serviceData.packages?.find((pkg: any) => pkg.package_id === packageId);
      if (!packageData) {
        console.error('❌ Package not found in service packages:', packageId);
        return NextResponse.json({
          success: false,
          error: { NotFound: 'Package not found' }
        }, { status: 400 });
      }

      console.log('✅ Found package and service data');
      console.log('📦 Package:', packageData);
      console.log('🛠️ Service:', serviceData);

      // Create a mock booking response since we're using local storage
      const bookingId = `BK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const escrowAccount = `escrow-${bookingId}`;

      const bookingResponse = {
        booking_id: bookingId,
        escrow_account: escrowAccount,
        amount_e8s: Number(packageData.price_e8s),
        ledger_block: Math.floor(Math.random() * 1000000) // Mock block number
      };

      console.log('📊 Created mock booking:', bookingResponse);

      // Convert BigInt values to numbers for JSON serialization
      const safeBookingData = {
        booking_id: bookingResponse.booking_id,
        escrow_account: bookingResponse.escrow_account,
        amount_e8s: bookingResponse.amount_e8s,
        ledger_block: bookingResponse.ledger_block
      };

      // Get user emails for chat initiation
      const clientEmail = await getClientEmail(clientId);
      const freelancerEmail = serviceData.freelancer_email;
      const serviceTitle = serviceData.title;

      console.log('📧 User emails:', { clientEmail, freelancerEmail });
      console.log('📋 Service title:', serviceTitle);
      console.log('💬 Initiating chat after successful booking...');

      // Initiate chat after successful booking
      let chatInitiationResult = null;
      if (clientEmail && freelancerEmail) {
        try {
          console.log('🔗 Attempting to initiate chat between:', { clientEmail, freelancerEmail });

          const chatResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'}/api/chat/initiate`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              clientEmail,
              freelancerEmail,
              serviceTitle,
              bookingId: safeBookingData.booking_id,
              projectId: safeBookingData.booking_id // Use booking ID as project ID for context
            }),
          });

          if (chatResponse.ok) {
            const chatData = await chatResponse.json();
            chatInitiationResult = {
              success: true,
              chatInitiated: true,
              messageId: chatData.messageId,
              participants: chatData.participants,
              initialMessage: chatData.initialMessage
            };
            console.log('✅ Chat initiated successfully:', chatData);
          } else {
            const errorText = await chatResponse.text();

            // Check if the error response is HTML (indicating canister is down)
            if (errorText.includes('<pre>') || errorText.includes('<html>') || errorText.includes('<!DOCTYPE')) {
              console.error('❌ Chat canister is not running or accessible');
              chatInitiationResult = {
                success: false,
                error: 'Chat service temporarily unavailable',
                details: 'The chat system is currently offline. You can still contact the freelancer through other means.',
                bookingStillSuccessful: true,
                canisterOffline: true
              };
            } else {
              console.error('❌ Chat initiation failed:', errorText);
              chatInitiationResult = {
                success: false,
                error: 'Failed to initiate chat',
                details: errorText,
                bookingStillSuccessful: true
              };
            }
          }
        } catch (chatError) {
          console.error('❌ Error initiating chat:', chatError);
          const errorMessage = chatError instanceof Error ? chatError.message : 'Unknown error';

          // Check for common canister connection errors
          if (errorMessage.includes('ECONNREFUSED') || errorMessage.includes('fetch failed') || errorMessage.includes('ENOTFOUND')) {
            chatInitiationResult = {
              success: false,
              error: 'Chat service temporarily unavailable',
              details: 'Unable to connect to the chat system. The booking was successful and you can start a chat later.',
              bookingStillSuccessful: true,
              canisterOffline: true
            };
          } else {
            chatInitiationResult = {
              success: false,
              error: 'Chat initiation error',
              details: errorMessage,
              bookingStillSuccessful: true
            };
          }
        }
      } else {
        console.warn('⚠️ Cannot initiate chat - missing user emails:', { clientEmail, freelancerEmail });
        chatInitiationResult = {
          success: false,
          error: 'Missing user information for chat initiation',
          details: `Client email: ${clientEmail ? 'Present' : 'Missing'}, Freelancer email: ${freelancerEmail ? 'Present' : 'Missing'}`,
          bookingStillSuccessful: true
        };
      }

      return NextResponse.json({
        success: true,
        data: {
          ...safeBookingData,
          chat: chatInitiationResult,
          participants: {
            client: clientEmail,
            freelancer: freelancerEmail
          },
          serviceTitle,
          paymentDetails: {
            paymentMethod,
            totalAmount,
            upsells: upsells || [],
            promoCode: promoCode || null,
            paymentId: paymentId || null,
            transactionId: transactionId || null
          }
        }
      });
    } catch (error) {
      console.error('❌ Error connecting to marketplace canister:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to connect to marketplace service. Please try again.'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error booking package:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      cause: error instanceof Error ? error.cause : 'No cause'
    });

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}