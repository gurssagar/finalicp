import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-server';
import { HackathonCanister } from '@/lib/hackathon-canister';

// GET /api/hackathons/user/[userId] - Get hackathons for a specific user (organizer)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    // Get current session to verify authentication
    const session = await getSession();
    if (!session) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }

    const { userId } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10') || 10;
    const offset = parseInt(searchParams.get('offset') || '0') || 0;
    const status = searchParams.get('status'); // Optional status filter

    // Verify that the user can only access their own data
    // For now, we'll use email as the primary identifier since that's what's in the session
    // In a real implementation, you might want to map emails to user IDs or store userId in the session
    if (userId !== (session.userId || '') && userId !== session.email) {
      return NextResponse.json({
        success: false,
        error: 'Access denied: You can only view your own hackathons'
      }, { status: 403 });
    }

    console.log(`Fetching hackathons for user: ${userId} (session: ${session.email})`);

    // Get hackathons organized by this user
    const hackathons = await HackathonCanister.getHackathonsByOrganizer(
      userId || session.email || '',
      limit,
      offset,
      status || undefined
    );

    return NextResponse.json({
      success: true,
      data: hackathons,
      count: hackathons.length,
      limit,
      offset,
      userId,
      organizerEmail: session.email
    });

  } catch (error) {
    console.error('Error fetching user hackathons:', error);

    // Return more detailed error information
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch user hackathons';

    return NextResponse.json({
      success: false,
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    }, { status: 500 });
  }
}

// POST /api/hackathons/user/[userId] - Create a new hackathon for this user
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    // Get current session to verify authentication
    const session = await getSession();
    if (!session) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }

    const { userId } = await params;

    // Verify that the user can only create hackathons for themselves
    if (userId !== (session.userId || '') && userId !== session.email) {
      return NextResponse.json({
        success: false,
        error: 'Access denied: You can only create hackathons for yourself'
      }, { status: 403 });
    }

    const body = await request.json();

    // Add organizer information to the hackathon data
    const hackathonData = {
      ...body,
      organizer_id: userId,
      organizer_email: session.email,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Validate required fields
    const requiredFields = [
      'title', 'tagline', 'description', 'theme', 'mode',
      'location', 'start_date', 'end_date', 'registration_start', 'registration_end',
      'min_team_size', 'max_team_size', 'prize_pool', 'rules'
    ];

    for (const field of requiredFields) {
      if (!hackathonData[field]) {
        return NextResponse.json({
          success: false,
          error: `Missing required field: ${field}`
        }, { status: 400 });
      }
    }

    // Validate mode
    const validModes = ['Online', 'Offline', 'Hybrid'];
    if (!validModes.includes(hackathonData.mode)) {
      return NextResponse.json({
        success: false,
        error: `Invalid mode. Must be one of: ${validModes.join(', ')}`
      }, { status: 400 });
    }

    // Validate team sizes
    if (hackathonData.min_team_size > hackathonData.max_team_size) {
      return NextResponse.json({
        success: false,
        error: 'min_team_size cannot be greater than max_team_size'
      }, { status: 400 });
    }

    console.log(`Creating hackathon for user: ${userId}`);

    const hackathon = await HackathonCanister.createHackathon(hackathonData);

    return NextResponse.json({
      success: true,
      data: hackathon,
      message: 'Hackathon created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating hackathon:', error);

    const errorMessage = error instanceof Error ? error.message : 'Failed to create hackathon';

    return NextResponse.json({
      success: false,
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    }, { status: 500 });
  }
}