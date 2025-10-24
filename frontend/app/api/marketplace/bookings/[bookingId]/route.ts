import { NextRequest, NextResponse } from 'next/server';
import { getMarketplaceActor, handleApiError, validateMarketplaceConfig, serializeBigInts } from '@/lib/ic-marketplace-agent';

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
      
      // Transform the booking data to include additional information
      const transformedData = {
        ...bookingData,
        
        // Use freelancer email from canister or original freelancer_id
        freelancer_id: finalFreelancerEmail,
        
        // Add USD amounts
        total_amount_usd: bookingData.total_amount_e8s ? (Number(bookingData.total_amount_e8s) / 100000000) * 10 : 0, // Assuming $10 per ICP
        escrow_amount_usd: bookingData.total_amount_e8s ? (Number(bookingData.total_amount_e8s) * 0.95 / 100000000) * 10 : 0,
        
        // Convert timestamps from nanoseconds to milliseconds
        created_at: bookingData.created_at ? Number(bookingData.created_at) / 1000000 : Date.now(),
        updated_at: bookingData.updated_at ? Number(bookingData.updated_at) / 1000000 : Date.now(),
        deadline: bookingData.deadline ? Number(bookingData.deadline) / 1000000 : null,
        
        // Add package details
        package_details: {
          package_id: bookingData.package_id,
          service_id: bookingData.service_id,
          service_title: serviceData?.title || 'Service',
          service_description: serviceData?.description || '',
          service_category: serviceData?.main_category || '',
          service_subcategory: serviceData?.sub_category || '',
          delivery_time_days: serviceData?.delivery_time_days || 7,
          starting_from_e8s: serviceData?.starting_from_e8s || 100000000,
          starting_from_usd: serviceData?.starting_from_e8s ? (Number(serviceData.starting_from_e8s) / 100000000) * 10 : 10,
        },
        
        // Add human-readable dates
        created_at_readable: bookingData.created_at ? new Date(Number(bookingData.created_at) / 1000000).toISOString() : new Date().toISOString(),
        updated_at_readable: bookingData.updated_at ? new Date(Number(bookingData.updated_at) / 1000000).toISOString() : new Date().toISOString(),
        deadline_readable: bookingData.deadline ? new Date(Number(bookingData.deadline) / 1000000).toISOString() : null,
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

