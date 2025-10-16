import { NextRequest, NextResponse } from 'next/server';
import { mockMarketplaceAgent } from '@/lib/mock-marketplace-agent';

// GET /api/marketplace/job-posts/[jobId] - Get specific job post
export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const { jobId } = params;

    // Use mock agent for testing
    const actor = mockMarketplaceAgent;
    const result = await actor.getJobPostById(jobId);

    if ('ok' in result) {
      return NextResponse.json({
        success: true,
        data: result.ok,
      }, { status: 200 });
    } else {
      return NextResponse.json({
        success: false,
        error: result.err
      }, { status: 404 });
    }
  } catch (error: any) {
    console.error('Error fetching job post:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch job post'
    }, { status: 500 });
  }
}

// PUT /api/marketplace/job-posts/[jobId] - Update job post
export async function PUT(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const { jobId } = params;
    const body = await request.json();
    const { userId, updates } = body;

    if (!userId || !updates) {
      return NextResponse.json({
        success: false,
        error: 'User ID and updates are required'
      }, { status: 400 });
    }

    // Use mock agent for testing
    const actor = mockMarketplaceAgent;
    const result = await actor.updateJobPost(userId, jobId, updates);

    if ('ok' in result) {
      return NextResponse.json({
        success: true,
        data: result.ok
      }, { status: 200 });
    } else {
      return NextResponse.json({
        success: false,
        error: result.err
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Error updating job post:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update job post'
    }, { status: 500 });
  }
}

// DELETE /api/marketplace/job-posts/[jobId] - Delete job post
export async function DELETE(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const { jobId } = params;
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'User ID is required'
      }, { status: 400 });
    }

    // Use mock agent for testing
    const actor = mockMarketplaceAgent;
    const result = await actor.deleteJobPost(userId, jobId);

    if ('ok' in result) {
      return NextResponse.json({
        success: true,
        data: result.ok
      }, { status: 200 });
    } else {
      return NextResponse.json({
        success: false,
        error: result.err
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Error deleting job post:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete job post'
    }, { status: 500 });
  }
}