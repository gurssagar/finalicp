import { NextRequest, NextResponse } from 'next/server';
import { getServices, addService, Service } from '../storage';

// GET /api/marketplace/services - List services with filters
export async function GET(request: NextRequest) {
  try {
    const servicesStorage = getServices();
    console.log('Fetching services from storage, current count:', servicesStorage.length);

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const freelancer_email = searchParams.get('freelancer_email');
    const search_term = searchParams.get('search_term');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');

    let filteredServices = [...servicesStorage];

    // Apply filters
    if (category) {
      filteredServices = filteredServices.filter(service =>
        service.main_category === category
      );
    }

    if (freelancer_email) {
      // Filter by freelancer_email (primary identifier)
      filteredServices = filteredServices.filter(service =>
        service.freelancer_email === freelancer_email
      );
    }

    if (search_term) {
      const searchTerm = search_term.toLowerCase();
      filteredServices = filteredServices.filter(service =>
        service.title.toLowerCase().includes(searchTerm) ||
        service.description.toLowerCase().includes(searchTerm) ||
        service.main_category.toLowerCase().includes(searchTerm)
      );
    }

    // Apply pagination
    const limitNum = limit ? parseInt(limit) : 10;
    const offsetNum = offset ? parseInt(offset) : 0;
    const paginatedServices = filteredServices.slice(offsetNum, offsetNum + limitNum);

    return NextResponse.json({
      success: true,
      data: paginatedServices,
      count: paginatedServices.length,
      total: filteredServices.length
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}

// POST /api/marketplace/services - Create new service
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userEmail, serviceData } = body;

    if (!userEmail) {
      return NextResponse.json({
        success: false,
        error: 'User email is required'
      }, { status: 400 });
    }

    if (!serviceData) {
      return NextResponse.json({
        success: false,
        error: 'Service data is required'
      }, { status: 400 });
    }

    // Create new service with complete data from add-service forms
    const timestamp = Date.now() * 1000000; // nanoseconds
    const newService = {
      service_id: `service-${Date.now()}`,
      freelancer_email: userEmail,
      title: serviceData.title,
      main_category: serviceData.main_category,
      sub_category: serviceData.sub_category || 'General',
      description: serviceData.description || 'Professional service offering',
      description_format: serviceData.description_format || 'markdown',
      whats_included: serviceData.whats_included || 'Quality service delivery',
      cover_image_url: serviceData.cover_image_url || '',
      portfolio_images: serviceData.portfolio_images || [],
      status: serviceData.status || 'Active',
      rating_avg: 0.0,
      total_orders: 0,
      created_at: timestamp.toString(),
      updated_at: timestamp.toString(),

      // NEW FIELDS FROM ADD-SERVICE FORMS
      tier_mode: serviceData.tier_mode || '3tier',
      client_questions: serviceData.client_questions || [],
      faqs: serviceData.faqs || [],
      packages: serviceData.packages || []
    };

    // Store service in persistent storage
    addService(newService as Service);
    console.log('Service created and stored:', newService);
    const allServices = getServices();
    console.log('Total services in storage:', allServices.length);

    return NextResponse.json({
      success: true,
      data: newService
    });
  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}