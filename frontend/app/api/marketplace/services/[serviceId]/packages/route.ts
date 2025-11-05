import { NextRequest, NextResponse } from 'next/server';
import { getMarketplaceActor, handleApiError, validateMarketplaceConfig, serializeBigInts } from '@/lib/ic-marketplace-agent';

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
      // Get packages from canister
      console.log('Fetching packages for service:', serviceId);
      const packages = await actor.getPackagesByServiceId(serviceId);
      console.log('getPackagesByServiceId worked, result:', packages);

      // Transform packages to convert BigInt values and ensure proper formatting
      const transformedPackages = packages.map((pkg: any) => ({
        package_id: pkg.package_id,
        service_id: pkg.service_id,
        tier: pkg.tier,
        title: pkg.title,
        description: pkg.description,
        price_e8s: typeof pkg.price_e8s === 'bigint' ? Number(pkg.price_e8s) : Number(pkg.price_e8s || 0),
        delivery_days: typeof pkg.delivery_days === 'bigint' ? Number(pkg.delivery_days) : Number(pkg.delivery_days || 1),
        delivery_timeline: pkg.delivery_timeline || `${Number(pkg.delivery_days || 1)} days`,
        features: pkg.features || [],
        revisions_included: typeof pkg.revisions_included === 'bigint' ? Number(pkg.revisions_included) : Number(pkg.revisions_included || 1),
        status: pkg.status || 'Available',
        created_at: typeof pkg.created_at === 'bigint' ? Number(pkg.created_at) : Number(pkg.created_at || 0),
        updated_at: typeof pkg.updated_at === 'bigint' ? Number(pkg.updated_at) : Number(pkg.updated_at || 0)
      }));

      return NextResponse.json({
        success: true,
        data: transformedPackages,
        count: transformedPackages.length
      });
    } catch (error) {
      console.error('Error fetching packages:', error);
      return NextResponse.json({
        success: false,
        error: handleApiError(error),
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