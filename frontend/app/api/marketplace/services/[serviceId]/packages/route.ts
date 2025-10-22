import { NextRequest, NextResponse } from 'next/server';
import { getMarketplaceActor, handleApiError, validateMarketplaceConfig } from '@/lib/ic-marketplace-agent';

// GET /api/marketplace/services/[serviceId]/packages - Get packages for a service
export async function GET(
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

    if (!serviceId) {
      return NextResponse.json({
        success: false,
        error: 'Service ID is required'
      }, { status: 400 });
    }

    // Get service from canister to extract package information
    const actor = await getMarketplaceActor();
    const serviceResult = await actor.getService(serviceId);

    if ('err' in serviceResult) {
      return NextResponse.json({
        success: false,
        error: handleApiError(serviceResult.err)
      }, { status: 404 });
    }

    const service = serviceResult.ok;

    // Add debug logging for service ID mismatch
    console.log('🔍 DEBUG: Looking up service with ID:', serviceId);
    console.log('🔍 DEBUG: Raw canister result:', serviceResult);

    if (!service) {
      console.error('❌ ERROR: Service not found in canister for ID:', serviceId);
      return NextResponse.json({
        success: false,
        error: `Service not found in canister. Requested ID: ${serviceId}`
      }, { status: 404 });
    }

    console.log('✅ DEBUG: Service found successfully:', service.service_id);

    if (!service) {
      return NextResponse.json({
        success: false,
        error: 'Service not found'
      }, { status: 404 });
    }

    const packages = service.packages || [];

    return NextResponse.json({
      success: true,
      data: packages
    });
  } catch (error) {
    console.error('Error fetching packages:', error);
    return NextResponse.json({
      success: false,
      error: handleApiError(error)
    }, { status: 500 });
  }
}