import { NextRequest, NextResponse } from 'next/server';
import { getPackagesByServiceId, addPackage, Package } from '../storage';

// GET /api/marketplace/packages - List packages by service
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get('service_id');

    if (!serviceId) {
      return NextResponse.json({
        success: false,
        error: 'Service ID is required'
      }, { status: 400 });
    }

    console.log('Fetching packages for service:', serviceId);

    // Filter packages by service ID
    const servicePackages = getPackagesByServiceId(serviceId);

    return NextResponse.json({
      success: true,
      data: servicePackages,
      count: servicePackages.length
    });
  } catch (error) {
    console.error('Error fetching packages:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}

// POST /api/marketplace/packages - Create new package
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, packageData } = body;

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'User ID is required'
      }, { status: 400 });
    }

    if (!packageData) {
      return NextResponse.json({
        success: false,
        error: 'Package data is required'
      }, { status: 400 });
    }

    // Create new package with complete data
    const timestamp = Date.now() * 1000000; // nanoseconds
    const newPackage = {
      package_id: `package-${Date.now()}`,
      service_id: packageData.service_id,
      tier: packageData.tier || 'Basic',
      title: packageData.title,
      description: packageData.description || 'Professional service package',
      price_e8s: packageData.price_e8s.toString(),
      delivery_days: packageData.delivery_days || 1,
      features: packageData.features || [],
      revisions_included: packageData.revisions_included || 1,
      status: packageData.status || 'Available',
      created_at: timestamp.toString(),
      updated_at: timestamp.toString()
    };

    // Store package in persistent storage
    addPackage(newPackage as Package);
    console.log('Package created and stored:', newPackage);
    const allPackages = getPackagesByServiceId(newPackage.service_id);
    console.log('Total packages for this service:', allPackages.length);

    return NextResponse.json({
      success: true,
      data: newPackage
    });
  } catch (error) {
    console.error('Error creating package:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}