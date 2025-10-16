import { NextRequest, NextResponse } from 'next/server';
import { getMarketplaceActor, handleApiError, validateMarketplaceConfig } from '@/lib/ic-marketplace-agent';

// GET /api/marketplace/stats - Get marketplace statistics
export async function GET(request: NextRequest) {
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

    // Use mock agent for testing
    const actor = await getMarketplaceActor();
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
      error: handleApiError(error)
    }, { status: 500 });
  }
}
