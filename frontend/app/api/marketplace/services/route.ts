import { NextRequest, NextResponse } from 'next/server';
import { getMarketplaceActor, handleApiError, validateMarketplaceConfig } from '@/lib/ic-marketplace-agent';

// GET /api/marketplace/services - List services with filters
export async function GET(request: NextRequest) {
  try {
    console.log('Using mock response for service listing');

    // Mock services data with proper timestamp format for testing date handling
    const mockServices = [
      {
        service_id: "service-1",
        freelancer_id: "test-freelancer-id",
        title: "Web Development Service",
        main_category: "Web Development",
        sub_category: "Frontend Development",
        description: "Professional web development services",
        whats_included: "Custom design, responsive layout",
        cover_image_url: [],
        portfolio_images: [],
        status: "Active",
        rating_avg: 4.5,
        total_orders: 10,
        created_at: (Date.now() * 1000000).toString(), // nanoseconds as string
        updated_at: (Date.now() * 1000000).toString()
      },
      {
        service_id: "service-2",
        freelancer_id: "test-freelancer-id",
        title: "UI/UX Design",
        main_category: "Design",
        sub_category: "UI Design",
        description: "Professional design services",
        whats_included: "User interface, user experience",
        cover_image_url: ["https://example.com/image.jpg"],
        portfolio_images: [],
        status: "Active",
        rating_avg: 4.8,
        total_orders: 15,
        created_at: BigInt(Date.now()) * BigInt(1000000),
        updated_at: BigInt(Date.now()) * BigInt(1000000)
      }
    ];

    return NextResponse.json({
      success: true,
      data: mockServices,
      count: mockServices.length
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json({
      success: false,
      error: handleApiError(error)
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

    // Mock service creation since marketplace canister is not deployed
    console.log('Using mock response for service creation with data:', { userId, serviceData });

    // Mock successful service creation response
    const mockCreatedService = {
      service_id: `service-${Date.now()}`,
      freelancer_id: userId,
      title: serviceData.title,
      status: serviceData.status || 'Active',
      created_at: (Date.now() * 1000000).toString(),
      updated_at: (Date.now() * 1000000).toString()
    };

    console.log('Mock service created successfully:', mockCreatedService);

    return NextResponse.json({
      success: true,
      data: mockCreatedService
    });
  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json({
      success: false,
      error: handleApiError(error)
    }, { status: 500 });
  }
}
