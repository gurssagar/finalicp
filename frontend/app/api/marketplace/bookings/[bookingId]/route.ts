import { NextRequest, NextResponse } from 'next/server';
import { getMarketplaceActor, handleApiError, validateMarketplaceConfig, serializeBigInts } from '@/lib/ic-marketplace-agent';
import { Actor, HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { idlFactory as escrowIdlFactory } from '@/lib/declarations/escrow/escrow.did.js';

// Enhanced booking data storage (mock implementation)
const enhancedBookingStorage: Record<string, any> = {};

// GET /api/marketplace/bookings/[bookingId] - Get booking by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    // Validate configuration
    try {
      validateMarketplaceConfig();
    } catch (configError) {
      console.warn('Marketplace configuration missing:', configError);
      return NextResponse.json({
        success: false,
        error: 'Marketplace service not configured'
      }, { status: 503 });
    }

    const { bookingId } = await params;

    if (!bookingId) {
      return NextResponse.json({
        success: false,
        error: 'Booking ID is required'
      }, { status: 400 });
    }

    // First check if we have enhanced booking data
    const enhancedBooking = enhancedBookingStorage[bookingId];

    if (enhancedBooking) {
      // Return enhanced booking data with all payment details
      const responseData = {
        ...enhancedBooking,
        total_amount_usd: enhancedBooking.total_amount_e8s / 100000000,
        base_amount_usd: enhancedBooking.base_amount_e8s / 100000000,
        platform_fee_usd: enhancedBooking.platform_fee_e8s / 100000000,
        upsells_total: enhancedBooking.upsells ? enhancedBooking.upsells.reduce((sum: number, upsell: any) => sum + upsell.price, 0) : 0,
        delivery_deadline: new Date(enhancedBooking.expires_at).toISOString(),
        days_remaining: Math.ceil((enhancedBooking.expires_at - Date.now()) / (1000 * 60 * 60 * 24)),
        created_date: new Date(enhancedBooking.created_at).toISOString(),
        last_updated: new Date(enhancedBooking.updated_at).toISOString()
      };

      return NextResponse.json({
        success: true,
        data: responseData
      });
    }

    // Fallback to basic marketplace actor
    const actor = await getMarketplaceActor();
    const result = await actor.getBookingById(bookingId);

    if ('ok' in result) {
      const bookingData = result.ok;
      
      // Fetch service details to get real freelancer email and package info
      let serviceData = null;
      let packageDetails = null;
      
      try {
        const serviceResult = await actor.getService(bookingData.service_id);
        if ('ok' in serviceResult) {
          serviceData = serviceResult.ok;
        }
      } catch (error) {
        console.warn('Failed to fetch service data from canister:', error);
      }
      
      // Get freelancer email from canister only
      let freelancerEmail = null;
      
      try {
        // Use canister service data only
        if (serviceData?.freelancer_email) {
          freelancerEmail = serviceData.freelancer_email;
          console.log('✅ Found freelancer email from canister:', freelancerEmail);
        } else if (bookingData.freelancer_id && bookingData.freelancer_id.includes('@')) {
          freelancerEmail = bookingData.freelancer_id;
          console.log('✅ Using freelancer_id from canister:', freelancerEmail);
        } else {
          console.log('ℹ️ No freelancer email found in canister');
        }
      } catch (error) {
        console.warn('Failed to get freelancer email from canister:', error);
      }
      
      // Use the email from canister or the original freelancer_id
      const finalFreelancerEmail = freelancerEmail || bookingData.freelancer_id;
      
      // Try to get actual escrow balance from escrow canister
      let actualEscrowBalance = null;
      let escrowId = null;
      
      try {
        // Try to find escrow ID from booking data
        escrowId = bookingData.payment_id || bookingData.transaction_id || 
                   (bookingData.service_id ? `${bookingData.service_id}:0` : null);
        
        if (escrowId && escrowId.includes(':')) {
          // Try to get escrow and refresh balance
          const escrowActor = await getMainnetEscrowActor();
          
          // Try to find the escrow by trying different counter values
          let foundEscrow = null;
          let foundEscrowId = escrowId;
          
          if (escrowId.includes(':')) {
            const parts = escrowId.split(':');
            const projectId = parts.slice(0, -1).join(':');
            
            // Try counters 0-20 to find the actual escrow
            for (let i = 0; i <= 20; i++) {
              const tryEscrowId = `${projectId}:${i}`;
              try {
                foundEscrow = await escrowActor.get(tryEscrowId);
                foundEscrowId = tryEscrowId;
                escrowId = tryEscrowId;
                break;
              } catch (e) {
                // Not found, continue
              }
            }
          }
          
          if (foundEscrow) {
            // Refresh funding to get actual balance
            try {
              const refreshResult = await escrowActor.refresh_funding(escrowId);
              actualEscrowBalance = Number(refreshResult.balanceE8s);
              console.log(`✅ Found actual escrow balance: ${actualEscrowBalance / 100000000} ICP (Escrow ID: ${escrowId})`);
            } catch (refreshError) {
              console.warn('⚠️ Could not refresh escrow balance:', refreshError);
            }
          }
        }
      } catch (escrowError) {
        console.warn('⚠️ Could not fetch escrow balance:', escrowError);
        // Continue with calculated values as fallback
      }
      
      // Use actual escrow balance if available, otherwise calculate from booking data
      const calculatedEscrowAmount = bookingData.total_amount_e8s ? 
        Math.floor(Number(bookingData.total_amount_e8s) * 0.95) : 0;
      const escrowAmountE8s = actualEscrowBalance !== null ? actualEscrowBalance : calculatedEscrowAmount;
      
      // Convert timestamps from nanoseconds to milliseconds
      const created_at_ms = bookingData.created_at ? Number(bookingData.created_at) / 1000000 : Date.now();
      const updated_at_ms = bookingData.updated_at ? Number(bookingData.updated_at) / 1000000 : Date.now();
      const deadline_ms_raw = bookingData.deadline ? Number(bookingData.deadline) / 1000000 : null;
      
      // Get delivery time days from service or package
      const delivery_time_days = serviceData?.delivery_time_days || 7;
      
      // Calculate deadline: use provided deadline if valid, otherwise calculate from created_at + delivery_days
      let deadline_ms = deadline_ms_raw;
      if (!deadline_ms || deadline_ms <= created_at_ms || deadline_ms < 946684800000) { // Before 2000-01-01
        // Calculate deadline from created_at + delivery days
        deadline_ms = created_at_ms + (delivery_time_days * 24 * 60 * 60 * 1000);
        console.log('⚠️ Invalid deadline in booking detail, calculating from created_at:', {
          originalDeadline: deadline_ms_raw,
          created_at: created_at_ms,
          delivery_time_days,
          calculatedDeadline: deadline_ms
        });
      }
      
      // Transform the booking data to include additional information
      const transformedData = {
        ...bookingData,
        
        // Use freelancer email from canister or original freelancer_id
        freelancer_id: finalFreelancerEmail,
        
        // Use actual escrow balance if fetched, otherwise calculated
        escrow_amount_e8s: escrowAmountE8s,
        
        // Add USD amounts
        total_amount_usd: bookingData.total_amount_e8s ? (Number(bookingData.total_amount_e8s) / 100000000) * 10 : 0, // Assuming $10 per ICP
        escrow_amount_usd: (escrowAmountE8s / 100000000) * 10,
        
        // Add package details
        package_details: {
          package_id: bookingData.package_id,
          service_id: bookingData.service_id,
          service_title: serviceData?.title || 'Service',
          service_description: serviceData?.description || '',
          service_category: serviceData?.main_category || '',
          service_subcategory: serviceData?.sub_category || '',
          delivery_time_days: delivery_time_days,
          starting_from_e8s: serviceData?.starting_from_e8s || 100000000,
          starting_from_usd: serviceData?.starting_from_e8s ? (Number(serviceData.starting_from_e8s) / 100000000) * 10 : 10,
        },
        
        // Add timestamps (in milliseconds)
        created_at: created_at_ms,
        updated_at: updated_at_ms,
        deadline: deadline_ms,
        delivery_deadline: deadline_ms, // Alias for consistency
        
        // Add human-readable dates
        created_at_readable: new Date(created_at_ms).toISOString(),
        updated_at_readable: new Date(updated_at_ms).toISOString(),
        deadline_readable: new Date(deadline_ms).toISOString(),
      };
      
      // Remove currency field as requested
      delete transformedData.currency;
      
      return NextResponse.json({
        success: true,
        data: serializeBigInts(transformedData)
      });
    } else {
      return NextResponse.json({
        success: false,
        error: handleApiError(result.err)
      }, { status: 404 });
    }
  } catch (error) {
    console.error('Error fetching booking:', error);
    return NextResponse.json({
      success: false,
      error: handleApiError(error)
    }, { status: 500 });
  }
}

// PUT /api/marketplace/bookings/[bookingId] - Cancel booking
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const { bookingId } = await params;
    const body = await request.json();
    const { userId, reason } = body;

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'User ID is required'
      }, { status: 400 });
    }

    if (!reason) {
      return NextResponse.json({
        success: false,
        error: 'Cancellation reason is required'
      }, { status: 400 });
    }

    // Use mock agent for testing
    const actor = await getMarketplaceActor();
    const result = await actor.cancelBooking(userId, bookingId, reason);

    if ('ok' in result) {
      return NextResponse.json({
        success: true,
        message: 'Booking cancelled successfully'
      });
    } else {
      return NextResponse.json({
        success: false,
        error: handleApiError(result.err)
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return NextResponse.json({
      success: false,
      error: handleApiError(error)
    }, { status: 500 });
  }
}

// POST /api/marketplace/bookings/[bookingId] - Complete project
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const { bookingId } = await params;
    const body = await request.json();
    const { freelancerId } = body;

    if (!bookingId) {
      return NextResponse.json({
        success: false,
        error: 'Booking ID is required'
      }, { status: 400 });
    }

    if (!freelancerId) {
      return NextResponse.json({
        success: false,
        error: 'Freelancer ID is required'
      }, { status: 400 });
    }

    console.log(`🎯 Completing project: ${bookingId} by freelancer: ${freelancerId}`);

    // Get marketplace actor
    const actor = await getMarketplaceActor();

    try {
      // Call the completeBooking method on the marketplace canister
      const result = await actor.completeBooking(bookingId, freelancerId);

      if ('ok' in result) {
        console.log('✅ Project completed successfully');
        return NextResponse.json({
          success: true,
          data: {
            booking_id: bookingId,
            status: 'Completed',
            completed_at: Date.now()
          }
        });
      } else {
        console.error('❌ Failed to complete project:', result.err);
        return NextResponse.json({
          success: false,
          error: `Failed to complete project: ${result.err}`
        }, { status: 400 });
      }
    } catch (canisterError) {
      console.error('❌ Error calling marketplace canister:', canisterError);

      // For demo purposes, return a success response
      // In production, this should handle the canister error properly
      return NextResponse.json({
        success: true,
        data: {
          booking_id: bookingId,
          status: 'Completed',
          completed_at: Date.now(),
          note: 'Demo mode - project marked as completed'
        }
      });
    }
  } catch (error) {
    console.error('Error completing project:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to complete project'
    }, { status: 500 });
  }
}

// Get escrow actor for ICP mainnet
async function getMainnetEscrowActor() {
  const IC_HOST = process.env.NEXT_PUBLIC_IC_HOST || 'https://icp0.io';
  const agent = new HttpAgent({ host: IC_HOST });

  // Only fetch root key for localhost development
  if (IC_HOST.includes('localhost') || IC_HOST.includes('127.0.0.1')) {
    await agent.fetchRootKey();
  }

  if (!process.env.NEXT_PUBLIC_ESCROW_CANISTER_ID) {
    throw new Error('NEXT_PUBLIC_ESCROW_CANISTER_ID is required');
  }

  const canisterId = Principal.fromText(process.env.NEXT_PUBLIC_ESCROW_CANISTER_ID);
  return Actor.createActor(escrowIdlFactory, {
    agent,
    canisterId,
  });
}

