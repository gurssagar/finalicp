import { NextRequest, NextResponse } from 'next/server';
import { getMarketplaceActor, handleApiError, validateMarketplaceConfig } from '@/lib/ic-marketplace-agent';
import { getSession } from '@/lib/auth';

// GET /api/marketplace/services - List services from canister with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');

    console.log('Fetching services from canister with filters:', {
      limit,
      offset
    });

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

    const actor = await getMarketplaceActor();
    // Use getAllServices since listServices doesn't exist in the canister
    const services = await actor.getAllServices();

    // Load additional service data from storage
    let additionalServicesData: any[] = [];
    try {
      const { getAdditionalServiceData } = await import('@/lib/service-storage');
      // Get additional data for all services
      additionalServicesData = services.map((service: any) => {
        const additionalData = getAdditionalServiceData(service.service_id);
        return additionalData || {};
      });
    } catch (error) {
      console.warn('Failed to load additional service data:', error);
    }

    // Transform canister service data to match frontend interface and merge with additional data
    const transformedServices = services.map((service: any, index: number) => {
      const additionalData = additionalServicesData[index] || {};

      return {
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
        packages: additionalData.packages || [],
        client_questions: additionalData.client_questions || [],
        faqs: additionalData.faqs || []
      };
    });

    // Apply basic filtering (simplified for now)
    let filteredServices = [...transformedServices];

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
    // Get logged-in user session for authentication
    const session = await getSession();
    let authenticatedUserEmail = '';

    if (session && session.email) {
      authenticatedUserEmail = session.email;
      console.log('🔐 Authenticated freelancer:', authenticatedUserEmail);
    }

    const body = await request.json();
    const { userEmail, serviceData } = body;

    // Use authenticated email if available, otherwise use provided userEmail
    const effectiveUserEmail = authenticatedUserEmail || userEmail;

    if (!effectiveUserEmail) {
      return NextResponse.json({
        success: false,
        error: 'User email is required. Please log in.'
      }, { status: 401 });
    }

    if (!serviceData) {
      return NextResponse.json({
        success: false,
        error: 'Service data is required'
      }, { status: 400 });
    }

    console.log('Creating service with complete data:', {
      title: serviceData.title,
      main_category: serviceData.main_category,
      portfolio_images_count: serviceData.portfolio_images?.length || 0,
      client_questions_count: serviceData.client_questions?.length || 0,
      faqs_count: serviceData.faqs?.length || 0,
      packages_count: serviceData.packages?.length || 0
    });

    // Calculate delivery_time_days and starting_from_e8s from packages
    let deliveryTimeDays = 7;
    let startingFromE8s = BigInt(100000000); // 1 ICP default

    if (serviceData.packages && serviceData.packages.length > 0) {
      const deliveryDays = serviceData.packages.map((pkg: any) => pkg.delivery_days || 1);
      const prices = serviceData.packages.map((pkg: any) => pkg.price_e8s || 100000000);

      deliveryTimeDays = Math.min(...deliveryDays);
      startingFromE8s = BigInt(Math.min(...prices));
    }

    // Generate service ID
    const serviceId = `SVC_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    // Create service using canister with freelancer email
    const actor = await getMarketplaceActor();
    console.log('🔧 Creating service with freelancer:', effectiveUserEmail);
    
    const serviceResult = await actor.createServiceForBooking(
      serviceId,
      effectiveUserEmail,  // ✅ Pass the authenticated freelancer email here!
      serviceData.title || 'Service Title',
      serviceData.main_category || 'General',
      serviceData.sub_category || 'General',
      serviceData.description || 'Professional service offering',
      serviceData.whats_included || 'Quality service delivery',
      deliveryTimeDays,
      startingFromE8s,
      serviceData.tags || []
    );

    if ('err' in serviceResult) {
      console.error('Service creation failed:', serviceResult.err);
      return NextResponse.json({
        success: false,
        error: handleApiError(serviceResult.err)
      }, { status: 500 });
    }

    // Service ID is already set above
    console.log('✅ Service created with freelancer:', effectiveUserEmail);
    console.log('Service created successfully with ID:', serviceId);

    // Create packages if provided
    let createdPackages = [];
    if (serviceData.packages && serviceData.packages.length > 0) {
      console.log('Creating packages for service:', serviceId);
      
      for (const pkg of serviceData.packages) {
        try {
          console.log('Creating package:', {
            serviceId,
            title: pkg.title,
            price_e8s: pkg.price_e8s,
            delivery_days: pkg.delivery_days,
            revisions: pkg.revisions_included,
            features: pkg.features
          });

          const packageResult = await actor.createPackage(
            serviceId,
            pkg.title,
            pkg.description,
            BigInt(pkg.price_e8s),
            BigInt(pkg.delivery_days),
            pkg.delivery_timeline,
            BigInt(pkg.revisions_included),
            pkg.features || []
          );

          console.log('Package creation result:', packageResult);

          if ('ok' in packageResult) {
            createdPackages.push({
              package_id: packageResult.ok,
              ...pkg
            });
            console.log('✅ Package created successfully:', packageResult.ok);
          } else {
            console.error('❌ Package creation returned error:', packageResult);
          }
        } catch (packageError) {
          console.error('Failed to create package - exception thrown:', packageError);
          console.error('Package error details:', JSON.stringify(packageError, null, 2));
        }
      }
    }

    // Store additional data in our storage system since canister doesn't support it
    const additionalServiceData = {
      service_id: serviceId,
      freelancer_email: userEmail,
      cover_image_url: serviceData.cover_image_url || '',
      portfolio_images: serviceData.portfolio_images || [],
      description_format: serviceData.description_format || 'markdown',
      tier_mode: serviceData.tier_mode || '3tier',
      packages: createdPackages || [],
      client_questions: serviceData.client_questions || [],
      faqs: serviceData.faqs || [],
      created_at: Date.now() * 1000000,
      updated_at: Date.now() * 1000000
    };

    // Save additional data to our storage system
    try {
      const { saveAdditionalServiceData } = await import('@/lib/service-storage');
      saveAdditionalServiceData(additionalServiceData);
      console.log('Additional service data saved successfully for service:', serviceId);
    } catch (storageError) {
      console.error('Failed to save additional service data:', storageError);
      // Continue with service creation even if additional data storage fails
      // The core service data is already saved in the canister
    }


    // Return comprehensive success response
    return NextResponse.json({
      success: true,
      service_id: serviceId,
      data: {
        service_id: serviceId,
        message: 'Service created successfully',
        additional_data: additionalServiceData,
        packages_created: createdPackages.length,
        portfolio_images_count: serviceData.portfolio_images?.length || 0,
        client_questions_count: serviceData.client_questions?.length || 0,
        faqs_count: serviceData.faqs?.length || 0
      }
    });
  } catch (error) {
    console.error('Error creating service:', error);
    console.error('Error type:', typeof error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : (typeof error === 'string' ? error : JSON.stringify(error) || 'Unknown error occurred')
    }, { status: 500 });
  }
}