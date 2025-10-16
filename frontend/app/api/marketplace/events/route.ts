import { NextRequest, NextResponse } from 'next/server';
import { getMarketplaceActor } from '@/lib/ic-marketplace-agent';
import { mockMarketplaceAgent } from '@/lib/mock-marketplace-agent';

// GET /api/marketplace/events - Get marketplace event log
export async function GET(request: NextRequest) {
  try {
    // Use mock agent for testing
    const actor = mockMarketplaceAgent;
    const result = await actor.getEventLog();

    return NextResponse.json({
      success: true,
      data: result,
      count: result.length
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch marketplace events'
    }, { status: 500 });
  }
}
