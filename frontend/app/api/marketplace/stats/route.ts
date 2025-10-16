import { NextRequest, NextResponse } from 'next/server';
import { getMarketplaceActor } from '@/lib/ic-marketplace-agent';
import { mockMarketplaceAgent } from '@/lib/mock-marketplace-agent';

// GET /api/marketplace/stats - Get marketplace statistics
export async function GET(request: NextRequest) {
  try {
    // Use mock agent for testing
    const actor = mockMarketplaceAgent;
    const result = await actor.getStats();

    return NextResponse.json({
      success: true,
      data: {
        total_services: result.total_services,
        total_packages: result.total_packages,
        total_bookings: result.total_bookings,
        total_stages: result.total_stages,
        total_transactions: result.total_transactions
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch marketplace statistics'
    }, { status: 500 });
  }
}
