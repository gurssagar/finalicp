import { NextRequest, NextResponse } from 'next/server';
import { getHackathonAgent } from '@/lib/hackathon-agent';
import { getAdditionalHackathonData } from '@/lib/hackathon-storage';

// GET /api/hackathons/[hackathonId] - Get specific hackathon
export async function GET(
  request: NextRequest,
  { params }: { params: { hackathonId: string } }
) {
  try {
    const { hackathonId } = params;

    if (!hackathonId) {
      return NextResponse.json({
        success: false,
        error: 'Hackathon ID is required'
      }, { status: 400 });
    }

    console.log('Fetching hackathon by ID from canister:', hackathonId);

    const agent = await getHackathonAgent();
    if (!agent) {
      return NextResponse.json({
        success: false,
        error: 'Failed to connect to hackathon canister'
      }, { status: 500 });
    }

    const result = await agent.getHackathon(hackathonId);
    console.log('Raw result from canister:', result);

    if ('err' in result) {
      console.error('Error in result:', result.err);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch hackathon',
        details: result.err
      }, { status: 404 });
    }

    const hackathon = result.ok;
    console.log('Hackathon from ok result:', hackathon);

    if (!hackathon) {
      console.error('Hackathon not found for ID:', hackathonId);
      return NextResponse.json({
        success: false,
        error: 'Hackathon not found'
      }, { status: 404 });
    }

    console.log('Hackathon found:', hackathon.title);

    // Load additional hackathon data from storage
    let additionalData = {};
    try {
      additionalData = getAdditionalHackathonData(hackathonId) || {};
    } catch (error) {
      console.warn('Failed to load additional hackathon data:', error);
    }

    // Merge canister hackathon data with additional data
    const mergedHackathon = {
      hackathon_id: hackathon.hackathon_id,
      title: hackathon.title,
      tagline: hackathon.tagline,
      description: hackathon.description,
      theme: hackathon.theme,
      mode: hackathon.mode,
      location: hackathon.location,
      start_date: hackathon.start_date,
      end_date: hackathon.end_date,
      registration_start: hackathon.registration_start,
      registration_end: hackathon.registration_end,
      min_team_size: hackathon.min_team_size,
      max_team_size: hackathon.max_team_size,
      prize_pool: hackathon.prize_pool,
      rules: hackathon.rules,
      status: hackathon.status,
      created_at: hackathon.created_at,
      updated_at: hackathon.updated_at,

      // Additional data from storage
      banner_image: additionalData.banner_image || '',
      registration_fee: additionalData.registration_fee || 0,
      max_participants: additionalData.max_participants || 100,
      prizes: additionalData.prizes || [],
      judges: additionalData.judges || [],
      schedule: additionalData.schedule || [],
      tags: additionalData.tags || [],
      social_links: additionalData.social_links || [],
      organizer_email: additionalData.organizer_email || ''
    };

    // Return merged hackathon data
    return NextResponse.json({
      success: true,
      data: mergedHackathon
    });

  } catch (error) {
    console.error('Error in GET /api/hackathons/[hackathonId]:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}

// PUT /api/hackathons/[hackathonId] - Update hackathon
export async function PUT(
  request: NextRequest,
  { params }: { params: { hackathonId: string } }
) {
  try {
    const { hackathonId } = params;
    const body = await request.json();
    const { userEmail, hackathonData } = body;

    if (!hackathonId) {
      return NextResponse.json({
        success: false,
        error: 'Hackathon ID is required'
      }, { status: 400 });
    }

    if (!userEmail) {
      return NextResponse.json({
        success: false,
        error: 'User email is required'
      }, { status: 400 });
    }

    if (!hackathonData) {
      return NextResponse.json({
        success: false,
        error: 'Hackathon data is required'
      }, { status: 400 });
    }

    console.log('Updating hackathon:', hackathonId);

    // For now, we'll only update the additional data in storage
    // Canister updates would require additional implementation

    const additionalData = {
      hackathon_id: hackathonId,
      organizer_email: userEmail,
      banner_image: hackathonData.bannerImage || '',
      registration_fee: hackathonData.registrationFee || 0,
      max_participants: hackathonData.maxParticipants || 100,
      prizes: hackathonData.prizes || [],
      judges: hackathonData.judges || [],
      schedule: hackathonData.schedule || [],
      tags: hackathonData.tags || [],
      social_links: hackathonData.socialLinks || [],
      updated_at: Date.now() * 1000000
    };

    try {
      const { updateAdditionalHackathonData } = await import('@/lib/hackathon-storage');
      const success = updateAdditionalHackathonData(hackathonId, additionalData);

      if (!success) {
        return NextResponse.json({
          success: false,
          error: 'Failed to update hackathon data'
        }, { status: 500 });
      }

      console.log('Hackathon additional data updated successfully');
    } catch (storageError) {
      console.error('Failed to update additional hackathon data:', storageError);
      return NextResponse.json({
        success: false,
        error: 'Failed to update hackathon data'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Hackathon updated successfully',
      data: additionalData
    });

  } catch (error) {
    console.error('Error in PUT /api/hackathons/[hackathonId]:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}