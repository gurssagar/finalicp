import { NextRequest, NextResponse } from 'next/server';
import { getMarketplaceActor, handleApiError, validateMarketplaceConfig } from '@/lib/ic-marketplace-agent';

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
      return NextResponse.json({
        success: true,
        data: result.ok
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

// PATCH /api/marketplace/bookings/[bookingId] - Update booking status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const { bookingId } = await params;
    const body = await request.json();
    const { status, specialInstructions } = body;

    if (!status) {
      return NextResponse.json({
        success: false,
        error: 'Status is required'
      }, { status: 400 });
    }

    console.log(`📝 Updating booking ${bookingId} status to: ${status}`);

    // Update enhanced booking data if exists
    if (enhancedBookingStorage[bookingId]) {
      enhancedBookingStorage[bookingId] = {
        ...enhancedBookingStorage[bookingId],
        status: status,
        last_updated: Date.now(),
        ...(specialInstructions && { special_instructions: specialInstructions })
      };
    }

    // TODO: Connect to real marketplace canister and update booking status
    // For now, return success response
    const updatedBooking = {
      booking_id: bookingId,
      status: status,
      special_instructions: specialInstructions,
      last_updated: Date.now()
    };

    return NextResponse.json({
      success: true,
      data: updatedBooking,
      message: 'Booking updated successfully'
    });
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update booking'
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

// Helper function to add enhanced booking data (used by payment confirmation)
export function addEnhancedBookingData(bookingId: string, bookingData: any): void {
  enhancedBookingStorage[bookingId] = bookingData;
}

// Helper function to get enhanced booking data (used by other APIs)
export function getEnhancedBookingData(bookingId: string): any {
  return enhancedBookingStorage[bookingId] || null;
}
