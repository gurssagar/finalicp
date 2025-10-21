import { NextRequest, NextResponse } from 'next/server';
import { getServiceById, getSimilarServices } from '../../storage';
import { validateMarketplaceConfig, getMarketplaceActor, handleApiError } from '@/lib/ic-marketplace-agent';

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

    console.log('Fetching service by ID:', serviceId);
    const service = getServiceById(serviceId);

    if (!service) {
      return NextResponse.json({
        success: false,
        error: 'Service not found'
      }, { status: 404 });
    }

    // Get similar services for the sidebar
    const similarServices = getSimilarServices(service.main_category, 3);

    console.log('Service found:', service.title);
    console.log('Similar services found:', similarServices.length);

    return NextResponse.json({
      success: true,
      data: {
        ...service,
        similarServices: similarServices
      }
    });
  } catch (error) {
    console.error('Error fetching service:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}

// PUT /api/marketplace/services/[serviceId] - Update service
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ serviceId: string }> }
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

    const { serviceId } = await params;
    const body = await request.json();
    const { userEmail, updates } = body;
    const userId = userEmail;

    if (!userEmail) {
      return NextResponse.json({
        success: false,
        error: 'User email is required'
      }, { status: 400 });
    }

    if (!updates) {
      return NextResponse.json({
        success: false,
        error: 'Update data is required'
      }, { status: 400 });
    }

    const actor = await getMarketplaceActor();

    // Map updates to ICP expected format (only send allowed fields)
    const icpUpdates = {
      title: updates.title,
      description: updates.description,
      status: updates.status
    };

    const result = await actor.updateService(userId, serviceId, icpUpdates);

    if ('ok' in result) {
      return NextResponse.json({
        success: true,
        data: result.ok
      });
    } else {
      return NextResponse.json({
        success: false,
        error: handleApiError(result.err)
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Error updating service:', error);
    return NextResponse.json({
      success: false,
      error: handleApiError(error)
    }, { status: 500 });
  }
}

// DELETE /api/marketplace/services/[serviceId] - Delete service
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ serviceId: string }> }
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

    const { serviceId } = await params;
    const body = await request.json();
    const { userEmail } = body;
    const userId = userEmail;

    if (!userEmail) {
      return NextResponse.json({
        success: false,
        error: 'User email is required'
      }, { status: 400 });
    }

    const actor = await getMarketplaceActor();
    const result = await actor.deleteService(userId, serviceId);

    if ('ok' in result) {
      return NextResponse.json({
        success: true,
        message: 'Service deleted successfully'
      });
    } else {
      return NextResponse.json({
        success: false,
        error: handleApiError(result.err)
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Error deleting service:', error);
    return NextResponse.json({
      success: false,
      error: handleApiError(error)
    }, { status: 500 });
  }
}
