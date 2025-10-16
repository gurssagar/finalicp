import { NextRequest, NextResponse } from 'next/server';
import { getMarketplaceActor, handleApiError, validateMarketplaceConfig } from '@/lib/ic-marketplace-agent';

// GET /api/marketplace/job-posts - List job posts
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    
    const filter = {
      category: searchParams.get('category') || undefined,
      client_id: searchParams.get('client_id') || undefined,
      search_term: searchParams.get('search_term') || '',
      limit: parseInt(searchParams.get('limit') || '10'),
      offset: parseInt(searchParams.get('offset') || '0')
    };

    // Use mock agent for testing
    const actor = await getMarketplaceActor();
    const result = await actor.listJobPosts(filter);

    if ('ok' in result) {
      return NextResponse.json({
        success: true,
        data: result.ok,
      }, { status: 200 });
    } else {
      return NextResponse.json({
        success: false,
        error: handleApiError(result.err)
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Error listing job posts:', error);
    return NextResponse.json({
      success: false,
      error: handleApiError(error)
    }, { status: 500 });
  }
}

// POST /api/marketplace/job-posts - Create job post
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, jobData } = body;

    if (!userId || !jobData) {
      return NextResponse.json({
        success: false,
        error: 'User ID and job data are required'
      }, { status: 400 });
    }

    // Use mock agent for testing
    const actor = await getMarketplaceActor();
    const result = await actor.createJobPost(userId, jobData);

    if ('ok' in result) {
      return NextResponse.json({
        success: true,
        data: result.ok
      }, { status: 200 });
    } else {
      return NextResponse.json({
        success: false,
        error: handleApiError(result.err)
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Error creating job post:', error);
    return NextResponse.json({
      success: false,
      error: handleApiError(error)
    }, { status: 500 });
  }
}

