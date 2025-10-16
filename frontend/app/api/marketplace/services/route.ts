import { NextRequest, NextResponse } from 'next/server';
import { getMarketplaceActor } from '@/lib/ic-marketplace-agent';
import { mockMarketplaceAgent } from '@/lib/mock-marketplace-agent';

// GET /api/marketplace/services - List services with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const filter = {
      category: searchParams.get('category') || undefined,
      freelancer_id: searchParams.get('freelancer_id') || undefined,
      search_term: searchParams.get('search_term') || '',
      limit: parseInt(searchParams.get('limit') || '10'),
      offset: parseInt(searchParams.get('offset') || '0')
    };

    // Use mock agent for testing
    const actor = mockMarketplaceAgent;
    const result = await actor.listServices(filter);

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
    console.error('Error fetching services:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch services'
    }, { status: 500 });
  }
}

// POST /api/marketplace/services - Create new service
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, serviceData } = body;

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'User ID is required'
      }, { status: 400 });
    }

    if (!serviceData) {
      return NextResponse.json({
        success: false,
        error: 'Service data is required'
      }, { status: 400 });
    }

    // Use mock agent for testing
    const actor = mockMarketplaceAgent;
    const result = await actor.createService(userId, serviceData);

    if ('ok' in result) {
      return NextResponse.json({
        success: true,
        data: result.ok
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.err
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create service'
    }, { status: 500 });
  }
}
