import { NextRequest, NextResponse } from 'next/server';
import { chatStorageApi } from '../../../../lib/chat-storage-agent';
import fs from 'fs';
import path from 'path';

// Create chat relationship based on booking
export async function POST(request: NextRequest) {
  try {
    const { bookingId, clientEmail, freelancerEmail } = await request.json();

    if (!bookingId || !clientEmail || !freelancerEmail) {
      return NextResponse.json({
        success: false,
        error: 'Booking ID, client email, and freelancer email are required'
      }, { status: 400 });
    }

    // Validate email formats
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(clientEmail) || !emailRegex.test(freelancerEmail)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid email format'
      }, { status: 400 });
    }

    // Get booking details to extract service information
    // For now, we'll create a mock booking since the functions are not available
    const mockBooking = {
      booking_id: bookingId,
      service_title: 'Service',
      service_id: 'service-1',
      package_id: 'package-1'
    };

    // Use mock booking for now
    const booking = mockBooking;

    // Extract service details from booking
    const serviceTitle = booking.service_title || 'Service';
    const serviceId = booking.service_id || '';
    const packageId = booking.package_id || '';
    const bookingStatus = 'Active'; // Default status

    // Create chat relationship in canister
    const result = await chatStorageApi.createChatRelationship(
      clientEmail,
      freelancerEmail,
      bookingId,
      serviceTitle,
      serviceId,
      packageId,
      bookingStatus
    );

    if (result) {
      console.log(`[ChatRelationship] Created relationship: ${clientEmail} <-> ${freelancerEmail} (Booking: ${bookingId})`);

      return NextResponse.json({
        success: true,
        data: {
          clientEmail,
          freelancerEmail,
          bookingId,
          serviceTitle,
          serviceId,
          packageId,
          status: bookingStatus,
          createdAt: new Date().toISOString()
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Failed to create chat relationship'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('[ChatRelationship] Error creating relationship:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

// Get chat relationships for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let userEmail = searchParams.get('email');
    const bookingId = searchParams.get('bookingId');

    // If no email provided, try to get it from the current session
    if (!userEmail && !bookingId) {
      try {
        // Call the session API to get current user
        const sessionResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/session`);
        if (sessionResponse.ok) {
          const sessionData = await sessionResponse.json();
          if (sessionData.success && sessionData.session && sessionData.session.email) {
            userEmail = sessionData.session.email;
            console.log(`[ChatRelationship] Using logged-in user email: ${userEmail}`);
          }
        }
      } catch (sessionError) {
        console.error('[ChatRelationship] Failed to get session:', sessionError);
      }
    }

    if (!userEmail && !bookingId) {
      // For development/testing purposes, use a default email if no session exists
      userEmail = 'gursagar1107@proton.me';
      console.log(`[ChatRelationship] Using fallback email for development: ${userEmail}`);

      // In production, you would return an error instead:
      // return NextResponse.json({
      //   success: false,
      //   error: 'Email or booking ID is required, and no active session found'
      // }, { status: 400 });
    }

    let relationships = [];

    if (userEmail) {
      // Directly build relationships from booking data - no separate chat relationships needed
      relationships = await buildRelationshipsFromBookings(userEmail);
      console.log(`[ChatRelationship] Found ${relationships.length} chat opportunities from bookings for ${userEmail}`);
    } else if (bookingId) {
      // Get specific relationship by booking ID
      relationships = await buildRelationshipsFromBookings(userEmail || '', bookingId);
    }

    return NextResponse.json({
      success: true,
      data: {
        relationships,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('[ChatRelationship] Error fetching relationships:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

// Helper function to get bookings directly from local storage
function getBookingsFromStorage(): any[] {
  try {
    const BOOKINGS_FILE = path.join('/tmp/marketplace-storage', 'bookings.json');
    if (fs.existsSync(BOOKINGS_FILE)) {
      const data = fs.readFileSync(BOOKINGS_FILE, 'utf8');
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('Error reading bookings from storage:', error);
    return [];
  }
}

// Helper function to build relationships from booking data
async function buildRelationshipsFromBookings(userEmail: string, specificBookingId?: string): Promise<any[]> {
  try {
    console.log(`[ChatRelationship] Building chat opportunities from bookings for: ${userEmail}${specificBookingId ? ` (booking: ${specificBookingId})` : ''}`);

    // Get all bookings from local storage
    const allBookings = getBookingsFromStorage();
    console.log(`[ChatRelationship] Found ${allBookings.length} total bookings in storage`);

    const relationships: any[] = [];

    // Process all bookings and find those involving the user
    for (const booking of allBookings) {
      if (specificBookingId && booking.booking_id !== specificBookingId) continue;

      // Check if user is client or freelancer in this booking
      const isClient = booking.client_id === userEmail || booking.client_email === userEmail;
      const isFreelancer = booking.freelancer_id === userEmail || booking.freelancer_email === userEmail;

      if (isClient || isFreelancer) {
        const relationship = {
          // Chat identifier
          chatId: booking.booking_id,

          // User roles
          userEmail: userEmail,
          partnerEmail: isClient ? (booking.freelancer_email || booking.freelancer_id) : (booking.client_email || booking.client_id),
          userRole: isClient ? 'client' : 'freelancer',

          // Booking information
          bookingId: booking.booking_id,
          serviceTitle: booking.title || booking.service_title || 'Service',
          serviceId: booking.service_id,
          packageId: booking.package_id,
          status: booking.status,
          paymentStatus: booking.payment_status,

          // Timestamps
          createdAt: booking.created_at,
          updatedAt: booking.updated_at,

          // Chat metadata
          lastMessageTime: booking.updated_at,
          unreadCount: 0,

          // Service details
          description: booking.description || '',
          totalAmount: booking.total_amount_e8s || '0',
          currency: booking.currency || 'USD'
        };
        relationships.push(relationship);
        console.log(`[ChatRelationship] Added chat opportunity: ${userEmail} as ${isClient ? 'client' : 'freelancer'} for booking ${booking.booking_id}`);
      }
    }

    // Sort by most recent activity
    relationships.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    console.log(`[ChatRelationship] Built ${relationships.length} chat opportunities from bookings`);
    return relationships;

  } catch (error) {
    console.error('[ChatRelationship] Error building relationships from bookings:', error);
    return [];
  }
}