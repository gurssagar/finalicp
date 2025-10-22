import { NextRequest, NextResponse } from 'next/server';
import { getMarketplaceActor, handleApiError, validateMarketplaceConfig } from '@/lib/ic-marketplace-agent';
import { getStagesByBooking, createDefaultStages, getStageById } from '@/lib/stage-storage';
import { getEnhancedBookingData } from '@/lib/booking-utils';

// Transform canister stage data to frontend interface
function transformCanisterStage(canisterStage: any) {
  // Handle BigInt conversion
  const convertBigInt = (value: any): number => {
    if (typeof value === 'bigint') return Number(value);
    return value;
  };

  // Convert timestamp from nanoseconds to milliseconds
  const convertTimestamp = (timestamp: any): number => {
    if (typeof timestamp === 'bigint') return Number(timestamp) / 1000000;
    return timestamp;
  };

  // Transform status variant to string
  const transformStatus = (status: any): string => {
    if (typeof status === 'object' && status !== null) {
      const statusKey = Object.keys(status)[0];
      return statusKey;
    }
    return 'Pending';
  };

  return {
    stage_id: canisterStage.stage_id,
    booking_id: canisterStage.booking_id,
    stage_number: convertBigInt(canisterStage.stage_number),
    title: canisterStage.title,
    description: canisterStage.description,
    amount_e8s: convertBigInt(canisterStage.amount_e8s),
    status: transformStatus(canisterStage.status),
    created_at: convertTimestamp(canisterStage.created_at),
    updated_at: convertTimestamp(canisterStage.updated_at),
    submitted_at: canisterStage.submitted_at ? convertTimestamp(canisterStage.submitted_at) : undefined,
    approved_at: canisterStage.approved_at ? convertTimestamp(canisterStage.approved_at) : undefined,
    rejected_at: canisterStage.rejected_at ? convertTimestamp(canisterStage.rejected_at) : undefined,
    released_at: canisterStage.released_at ? convertTimestamp(canisterStage.released_at) : undefined,
    submission_notes: canisterStage.submission_notes,
    submission_artifacts: canisterStage.submission_artifacts || [],
    rejection_reason: canisterStage.rejection_reason
  };
}

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

    console.log(`🔍 Fetching stages for booking: ${bookingId}`);

    // First, try to get stages from marketplace canister
    try {
      validateMarketplaceConfig();
      const actor = await getMarketplaceActor();
      const result = await actor.listStagesForBooking(bookingId);

      if ('ok' in result) {
        console.log(`✅ Successfully fetched stages from canister: ${result.ok.length} stages`);
        const transformedStages = result.ok.map(transformCanisterStage);

        return NextResponse.json({
          success: true,
          data: transformedStages,
          count: transformedStages.length,
          source: 'canister'
        });
      } else {
        throw new Error(`Canister error: ${result.err}`);
      }
    } catch (canisterError) {
      console.warn('⚠️  Marketplace canister unavailable, falling back to local storage:', canisterError);

      // Fallback to local storage
      let stages = getStagesByBooking(bookingId);

      // If no stages exist locally, try to create default stages
      if (stages.length === 0) {
        console.log('📝 No stages found locally, checking if we should create defaults...');

        // Check if booking exists and get its details
        const bookingData = getEnhancedBookingData(bookingId);
        if (bookingData && bookingData.total_amount_e8s) {
          console.log(`📋 Creating default stages for booking ${bookingId}`);
          stages = createDefaultStages(bookingId, bookingData.total_amount_e8s);
        }
      }

      if (stages.length > 0) {
        console.log(`✅ Found ${stages.length} stages in local storage`);
        return NextResponse.json({
          success: true,
          data: stages,
          count: stages.length,
          source: 'local-storage'
        });
      } else {
        console.log(`📝 No stages found for booking ${bookingId}, returning empty list`);
        return NextResponse.json({
          success: true,
          data: [],
          count: 0,
          source: 'none'
        });
      }
    }
  } catch (error) {
    console.error('Error fetching stages:', error);
    return NextResponse.json({
      success: false,
      error: handleApiError(error)
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
    const actor = await getMarketplaceActor();
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
        error: handleApiError(result.err)
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Error creating stages:', error);
    return NextResponse.json({
      success: false,
      error: handleApiError(error)
    }, { status: 500 });
  }
}
