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

    // Get packages directly from canister using the new method
    console.log('About to get marketplace actor...');
    const actor = await getMarketplaceActor();
    console.log('Got marketplace actor successfully');

    try {
      // Test the packages method with correct signature
      console.log('Testing getPackagesByServiceId with correct signature...');
      const packages = await actor.getPackagesByServiceId(serviceId);
      console.log('getPackagesByServiceId worked, result:', packages);

      return NextResponse.json({
        success: true,
        data: packages,
        message: 'Method works with simple return type'
      });
    } catch (error) {
      console.error('Error in getAllServices call:', error);
      return NextResponse.json({
        success: false,
        error: 'getAllServices failed: ' + JSON.stringify(error),
        serviceId: serviceId
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error fetching packages:', error);
    return NextResponse.json({
      success: false,
      error: handleApiError(error)
    }, { status: 500 });
  }
}