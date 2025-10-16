import { NextRequest, NextResponse } from 'next/server';
import { getMarketplaceActor } from '@/lib/ic-marketplace-agent';
import { mockMarketplaceAgent } from '@/lib/mock-marketplace-agent';

// GET /api/marketplace/stages - List stages for booking
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('booking_id');

    if (!bookingId) {
      return NextResponse.json({
        success: false,
        error: 'Booking ID is required'
      }, { status: 400 });
    }

    // Use mock agent for testing
    const actor = mockMarketplaceAgent;
    const result = await actor.listStagesForBooking(bookingId);

    if ('ok' in result) {
      return NextResponse.json({
        success: true,
        data: result.ok,
        count: result.ok.length
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.err
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Error fetching stages:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch stages'
    }, { status: 500 });
  }
}

// POST /api/marketplace/stages - Create stages for booking
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { freelancerId, bookingId, stageDefinitions } = body;

    if (!freelancerId) {
      return NextResponse.json({
        success: false,
        error: 'Freelancer ID is required'
      }, { status: 400 });
    }

    if (!bookingId) {
      return NextResponse.json({
        success: false,
        error: 'Booking ID is required'
      }, { status: 400 });
    }

    if (!stageDefinitions || !Array.isArray(stageDefinitions)) {
      return NextResponse.json({
        success: false,
        error: 'Stage definitions array is required'
      }, { status: 400 });
    }

    // Use mock agent for testing
    const actor = mockMarketplaceAgent;
    const result = await actor.createStages(freelancerId, bookingId, stageDefinitions);

    if ('ok' in result) {
      return NextResponse.json({
        success: true,
        data: result.ok,
        count: result.ok.length
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.err
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Error creating stages:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create stages'
    }, { status: 500 });
  }
}
