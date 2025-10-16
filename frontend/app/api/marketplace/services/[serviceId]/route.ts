import { NextRequest, NextResponse } from 'next/server';
import { getMarketplaceActor } from '@/lib/ic-marketplace-agent';
import { mockMarketplaceAgent } from '@/lib/mock-marketplace-agent';

// GET /api/marketplace/services/[serviceId] - Get service by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ serviceId: string }> }
) {
  try {
    const { serviceId } = await params;

    if (!serviceId) {
      return NextResponse.json({
        success: false,
        error: 'Service ID is required'
      }, { status: 400 });
    }

    // Use mock agent for testing
    const actor = mockMarketplaceAgent;
    const result = await actor.getServiceById(serviceId);

    if ('ok' in result) {
      return NextResponse.json({
        success: true,
        data: result.ok
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.err
      }, { status: 404 });
    }
  } catch (error) {
    console.error('Error fetching service:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch service'
    }, { status: 500 });
  }
}

// PUT /api/marketplace/services/[serviceId] - Update service
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ serviceId: string }> }
) {
  try {
    const { serviceId } = await params;
    const body = await request.json();
    const { userId, updates } = body;

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'User ID is required'
      }, { status: 400 });
    }

    if (!updates) {
      return NextResponse.json({
        success: false,
        error: 'Update data is required'
      }, { status: 400 });
    }

    // Use mock agent for testing
    const actor = mockMarketplaceAgent;
    const result = await actor.updateService(userId, serviceId, updates);

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
    console.error('Error updating service:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update service'
    }, { status: 500 });
  }
}

// DELETE /api/marketplace/services/[serviceId] - Delete service
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ serviceId: string }> }
) {
  try {
    const { serviceId } = await params;
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'User ID is required'
      }, { status: 400 });
    }

    // Use mock agent for testing
    const actor = mockMarketplaceAgent;
    const result = await actor.deleteService(userId, serviceId);

    if ('ok' in result) {
      return NextResponse.json({
        success: true,
        message: 'Service deleted successfully'
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.err
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Error deleting service:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete service'
    }, { status: 500 });
  }
}
