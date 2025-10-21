import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-client';

// GET /api/hackathons/drafts - Get user's hackathon drafts
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.email) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || session.email;

    // For now, we'll return drafts from localStorage in the frontend
    // In a production environment, you might want to store drafts in a database
    return NextResponse.json({
      success: true,
      data: [],
      message: 'Drafts are stored locally in browser'
    });

  } catch (error) {
    console.error('Error fetching drafts:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch drafts'
    }, { status: 500 });
  }
}

// POST /api/hackathons/drafts - Save or update a hackathon draft
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.email) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }

    const body = await request.json();
    const { draft, source = 'manual' } = body;

    if (!draft) {
      return NextResponse.json({
        success: false,
        error: 'Draft data is required'
      }, { status: 400 });
    }

    // Validate draft structure
    const requiredFields = ['id', 'name', 'shortDescription', 'createdAt', 'updatedAt'];
    for (const field of requiredFields) {
      if (!draft[field]) {
        return NextResponse.json({
          success: false,
          error: `Missing required field: ${field}`
        }, { status: 400 });
      }
    }

    // Add user ID to draft if not present
    const draftWithUser = {
      ...draft,
      userId: draft.userId || session.email,
      lastSavedAt: new Date().toISOString(),
      saveSource: source
    };

    // In a production environment, you would save this to a database
    // For now, the primary storage is localStorage in the frontend
    console.log('Draft saved to backend:', {
      id: draftWithUser.id,
      userId: draftWithUser.userId,
      source,
      timestamp: draftWithUser.lastSavedAt
    });

    return NextResponse.json({
      success: true,
      data: draftWithUser,
      message: 'Draft saved successfully'
    });

  } catch (error) {
    console.error('Error saving draft:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save draft'
    }, { status: 500 });
  }
}

// PUT /api/hackathons/drafts - Update a specific draft
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.email) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }

    const body = await request.json();
    const { draftId, updates } = body;

    if (!draftId || !updates) {
      return NextResponse.json({
        success: false,
        error: 'Draft ID and updates are required'
      }, { status: 400 });
    }

    // In a production environment, you would update this in a database
    console.log('Draft updated:', {
      draftId,
      userId: session.email,
      updates,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: 'Draft updated successfully'
    });

  } catch (error) {
    console.error('Error updating draft:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update draft'
    }, { status: 500 });
  }
}

// DELETE /api/hackathons/drafts - Delete a specific draft
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.email) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const draftId = searchParams.get('draftId');

    if (!draftId) {
      return NextResponse.json({
        success: false,
        error: 'Draft ID is required'
      }, { status: 400 });
    }

    // In a production environment, you would delete this from a database
    console.log('Draft deleted:', {
      draftId,
      userId: session.email,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: 'Draft deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting draft:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete draft'
    }, { status: 500 });
  }
}