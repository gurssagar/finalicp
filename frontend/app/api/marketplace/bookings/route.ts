import { NextRequest, NextResponse } from 'next/server';
import { getMarketplaceActor } from '@/lib/ic-marketplace-agent';
import { mockMarketplaceAgent } from '@/lib/mock-marketplace-agent';

// Helper functions to get user information
async function getClientEmail(clientId: string): Promise<string | null> {
  try {
    // In a real implementation, this would query the user database
    // For now, return a mock email based on client ID
    return `client-${clientId}@example.com`;
  } catch (error) {
    console.error('Error getting client email:', error);
    return null;
  }
}

async function getFreelancerEmailFromPackage(packageId: string): Promise<string | null> {
  try {
    // In a real implementation, this would get the package details first
    // For now, return a mock email based on package ID
    return `freelancer-${packageId}@example.com`;
  } catch (error) {
    console.error('Error getting freelancer email from package:', error);
    return null;
  }
}

async function getServiceTitle(packageId: string): Promise<string | null> {
  try {
    // In a real implementation, this would get the package details
    // For now, return a mock title
    return 'Professional Service Package';
  } catch (error) {
    console.error('Error getting service title:', error);
    return null;
  }
}

// GET /api/marketplace/bookings - List bookings for user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const userType = searchParams.get('user_type') as 'client' | 'freelancer';
    const status = searchParams.get('status') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'User ID is required'
      }, { status: 400 });
    }

    if (!userType || !['client', 'freelancer'].includes(userType)) {
      return NextResponse.json({
        success: false,
        error: 'User type must be client or freelancer'
      }, { status: 400 });
    }

    // Use mock agent for testing
    const actor = mockMarketplaceAgent;
    let result;

    if (userType === 'client') {
      result = await actor.listBookingsForClient(userId, status as any, limit, offset);
    } else {
      result = await actor.listBookingsForFreelancer(userId, status as any, limit, offset);
    }

    if ('ok' in result) {
      return NextResponse.json({
        success: true,
        data: result.ok,
        count: result.ok.length
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.err
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch bookings'
    }, { status: 500 });
  }
}

// POST /api/marketplace/bookings - Book a package
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clientId, packageId, specialInstructions } = body;

    if (!clientId) {
      return NextResponse.json({
        success: false,
        error: 'Client ID is required'
      }, { status: 400 });
    }

    if (!packageId) {
      return NextResponse.json({
        success: false,
        error: 'Package ID is required'
      }, { status: 400 });
    }

    if (!specialInstructions) {
      return NextResponse.json({
        success: false,
        error: 'Special instructions are required'
      }, { status: 400 });
    }

    // Generate idempotency key
    const idempotencyKey = `booking-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Use mock agent for testing
    const actor = mockMarketplaceAgent;
    const result = await actor.bookPackage(clientId, packageId, idempotencyKey, specialInstructions);

    if ('ok' in result) {
      const bookingData = result.ok;

      // Get user emails for chat initiation
      const clientEmail = await getClientEmail(clientId);
      const freelancerEmail = await getFreelancerEmailFromPackage(packageId);

      if (clientEmail && freelancerEmail) {
        // Initiate chat between client and freelancer
        try {
          const chatResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/chat/initiate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              clientEmail,
              freelancerEmail,
              serviceTitle: await getServiceTitle(packageId),
              bookingId: bookingData.id
            })
          });

          const chatResult = await chatResponse.json();
          if (chatResult.success) {
            console.log('Chat initiated successfully for booking:', bookingData.id);
          }
        } catch (chatError) {
          console.error('Failed to initiate chat for booking:', chatError);
          // Don't fail the booking if chat initiation fails
        }
      }

      return NextResponse.json({
        success: true,
        data: bookingData
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.err
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Error booking package:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to book package'
    }, { status: 500 });
  }
}
