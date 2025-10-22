import { NextRequest, NextResponse } from 'next/server';
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

    const actor = await getMarketplaceActor();
    const result = await actor.getService(serviceId);

    // Handle both direct result and wrapped result formats
    let service = null;
    if (Array.isArray(result) && result.length > 0) {
      // Direct result (array with service data)
      service = result[0];
    } else if (result && typeof result === 'object' && 'ok' in result) {
      // Wrapped result object
      if ('err' in result) {
        return NextResponse.json({
          success: false,
          error: handleApiError(result.err)
        }, { status: 404 });
      }
      service = result.ok;
    } else if (result && !('err' in result) && !('ok' in result)) {
      // Direct service object
      service = result;
    }

    if (!service) {
      return NextResponse.json({
        success: false,
        error: 'Service not found'
      }, { status: 404 });
    }

    // Load additional service data from storage
    let additionalData = {};
    try {
      const { getAdditionalServiceData } = await import('@/lib/service-storage');
      additionalData = getAdditionalServiceData(serviceId) || {};
    } catch (error) {
      console.warn('Failed to load additional service data:', error);
    }

    // Load packages from additional data
    let packages = additionalData.packages || [];

    // Merge canister service data with additional data
    const mergedService = {
      service_id: service.service_id,
      freelancer_id: service.freelancer_id,
      freelancer_email: additionalData.freelancer_email || service.freelancer_id,
      title: service.title,
      main_category: service.main_category,
      sub_category: service.sub_category,
      description: service.description,
      description_format: additionalData.description_format || 'markdown',
      whats_included: service.whats_included,
      cover_image_url: additionalData.cover_image_url || service.cover_image_url || '',
      portfolio_images: additionalData.portfolio_images || service.portfolio_images || [],
      status: service.status.Active ? 'Active' : 'Paused',
      rating_avg: Number(service.total_rating || 0),
      total_orders: Number(service.review_count || 0),
      created_at: Number(service.created_at) / 1000000, // Convert from nanoseconds to milliseconds
      updated_at: Number(service.updated_at) / 1000000,
      delivery_time_days: Number(service.delivery_time_days || 7),
      starting_from_e8s: Number(service.starting_from_e8s || 100000000),
      total_rating: Number(service.total_rating || 0),
      review_count: Number(service.review_count || 0),
      tags: service.tags || [],
      min_delivery_days: Number(service.delivery_time_days || 7),
      max_delivery_days: Number(service.delivery_time_days || 7),
      delivery_timeline: `${Number(service.delivery_time_days || 7)} days`,
      tier_mode: additionalData.tier_mode || '3tier',
      packages: packages,
      client_questions: additionalData.client_questions || [],
      faqs: additionalData.faqs || [],
      similarServices: [] // Empty array for now
    };

    // Return merged service data
    return NextResponse.json({
      success: true,
      data: mergedService
    });
  } catch (error) {
    console.error('Error fetching service:', error);
    return NextResponse.json({
      success: false,
      error: handleApiError(error)
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
    const { userEmail, userId, updates } = body;

    if (!userEmail || !userId) {
      return NextResponse.json({
        success: false,
        error: 'User email and ID are required'
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
    const { userEmail, userId } = body;

    if (!userEmail || !userId) {
      return NextResponse.json({
        success: false,
        error: 'User email and ID are required'
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
