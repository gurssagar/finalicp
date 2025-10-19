import { NextRequest, NextResponse } from 'next/server';
import { getMarketplaceActor } from '@/lib/ic-marketplace-agent';
import { getPackageById, getServiceById } from '../storage';

// Helper functions to get user information
async function getClientEmail(clientId: string): Promise<string | null> {
  try {
    // In a real implementation, this would query the user database or auth context
    // For now, we'll use the clientId directly if it looks like an email
    if (clientId.includes('@')) {
      return clientId;
    }
    return `client-${clientId}@example.com`;
  } catch (error) {
    console.error('Error getting client email:', error);
    return null;
  }
}

async function getFreelancerEmailFromPackage(packageId: string): Promise<string | null> {
  try {
    // Get package details first
    const packageData = getPackageById(packageId);
    if (!packageData) {
      console.error('Package not found:', packageId);
      return null;
    }

    // Get service details using service_id from package
    const serviceData = getServiceById(packageData.service_id);
    if (!serviceData) {
      console.error('Service not found for package:', packageData.service_id);
      return null;
    }

    // Return the freelancer email from service data
    console.log('Found freelancer email:', serviceData.freelancer_email);
    return serviceData.freelancer_email;
  } catch (error) {
    console.error('Error getting freelancer email from package:', error);
    return null;
  }
}

async function getServiceTitleFromPackage(packageId: string): Promise<string | null> {
  try {
    const packageData = getPackageById(packageId);
    if (!packageData) {
      return null;
    }

    const serviceData = getServiceById(packageData.service_id);
    if (!serviceData) {
      return null;
    }

    return serviceData.title;
  } catch (error) {
    console.error('Error getting service title from package:', error);
    return null;
  }
}

// GET /api/marketplace/bookings - List bookings
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

    // TODO: Connect to real marketplace canister when import issue is fixed
    // For now, return mock data
    const mockBookings = [
      {
        booking_id: `mock-booking-1`,
        client_id: userId,
        freelancer_id: 'mock-freelancer-1',
        service_id: 'mock-service-1',
        status: 'Active',
        created_at: Date.now(),
        total_amount_e8s: 100000000
      }
    ];

    return NextResponse.json({
      success: true,
      data: mockBookings
    });

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
  console.log('🚀 POST /api/marketplace/bookings called');

  try {
    const body = await request.json();
    const {
      clientId,
      packageId,
      specialInstructions,
      paymentMethod,
      totalAmount,
      upsells,
      promoCode,
      paymentId,
      transactionId
    } = body;
    console.log('📝 Request body:', {
      clientId,
      packageId,
      specialInstructions,
      paymentMethod,
      totalAmount,
      upsells: upsells?.length || 0,
      promoCode,
      paymentId,
      transactionId
    });

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

    // Special instructions are optional - provide default if empty
    const instructions = specialInstructions || 'Standard service booking';
    console.log('📝 Instructions:', instructions);

    // Generate idempotency key
    const idempotencyKey = `booking-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    console.log('🔑 Idempotency key:', idempotencyKey);

    // Connect to real marketplace canister
    console.log('🔗 Connecting to marketplace canister...');

    try {
      // Get package data from local storage
      console.log('🔍 Looking for package:', packageId);
      const packageData = getPackageById(packageId);
      console.log('📦 Package data found:', packageData ? 'YES' : 'NO');

      if (!packageData) {
        console.error('❌ Package not found in storage:', packageId);
        return NextResponse.json({
          success: false,
          error: { NotFound: 'Package not found' }
        }, { status: 400 });
      }

      // Get service data from local storage
      const serviceData = getServiceById(packageData.service_id);
      if (!serviceData) {
        console.error('❌ Service not found for package:', packageData.service_id);
        return NextResponse.json({
          success: false,
          error: { NotFound: 'Service not found' }
        }, { status: 400 });
      }

      console.log('✅ Found package and service data');
      console.log('📦 Package:', packageData);
      console.log('🛠️ Service:', serviceData);

      // Create a mock booking response since we're using local storage
      const bookingId = `BK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const escrowAccount = `escrow-${bookingId}`;

      const bookingResponse = {
        booking_id: bookingId,
        escrow_account: escrowAccount,
        amount_e8s: Number(packageData.price_e8s),
        ledger_block: Math.floor(Math.random() * 1000000) // Mock block number
      };

      console.log('📊 Created mock booking:', bookingResponse);

      // Convert BigInt values to numbers for JSON serialization
      const safeBookingData = {
        booking_id: bookingResponse.booking_id,
        escrow_account: bookingResponse.escrow_account,
        amount_e8s: bookingResponse.amount_e8s,
        ledger_block: bookingResponse.ledger_block
      };

      // Get user emails for chat initiation
      const clientEmail = await getClientEmail(clientId);
      const freelancerEmail = serviceData.freelancer_email;
      const serviceTitle = serviceData.title;

      console.log('📧 User emails:', { clientEmail, freelancerEmail });
      console.log('📋 Service title:', serviceTitle);
      console.log('💬 Initiating chat after successful booking...');

      // Initiate chat after successful booking
      let chatInitiationResult = null;
      if (clientEmail && freelancerEmail) {
        try {
          console.log('🔗 Attempting to initiate chat between:', { clientEmail, freelancerEmail });

          const chatResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'}/api/chat/initiate`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              clientEmail,
              freelancerEmail,
              serviceTitle,
              bookingId: safeBookingData.booking_id,
              projectId: safeBookingData.booking_id // Use booking ID as project ID for context
            }),
          });

          if (chatResponse.ok) {
            const chatData = await chatResponse.json();
            chatInitiationResult = {
              success: true,
              chatInitiated: true,
              messageId: chatData.messageId,
              participants: chatData.participants,
              initialMessage: chatData.initialMessage
            };
            console.log('✅ Chat initiated successfully:', chatData);
          } else {
            const errorText = await chatResponse.text();

            // Check if the error response is HTML (indicating canister is down)
            if (errorText.includes('<pre>') || errorText.includes('<html>') || errorText.includes('<!DOCTYPE')) {
              console.error('❌ Chat canister is not running or accessible');
              chatInitiationResult = {
                success: false,
                error: 'Chat service temporarily unavailable',
                details: 'The chat system is currently offline. You can still contact the freelancer through other means.',
                bookingStillSuccessful: true,
                canisterOffline: true
              };
            } else {
              console.error('❌ Chat initiation failed:', errorText);
              chatInitiationResult = {
                success: false,
                error: 'Failed to initiate chat',
                details: errorText,
                bookingStillSuccessful: true
              };
            }
          }
        } catch (chatError) {
          console.error('❌ Error initiating chat:', chatError);
          const errorMessage = chatError instanceof Error ? chatError.message : 'Unknown error';

          // Check for common canister connection errors
          if (errorMessage.includes('ECONNREFUSED') || errorMessage.includes('fetch failed') || errorMessage.includes('ENOTFOUND')) {
            chatInitiationResult = {
              success: false,
              error: 'Chat service temporarily unavailable',
              details: 'Unable to connect to the chat system. The booking was successful and you can start a chat later.',
              bookingStillSuccessful: true,
              canisterOffline: true
            };
          } else {
            chatInitiationResult = {
              success: false,
              error: 'Chat initiation error',
              details: errorMessage,
              bookingStillSuccessful: true
            };
          }
        }
      } else {
        console.warn('⚠️ Cannot initiate chat - missing user emails:', { clientEmail, freelancerEmail });
        chatInitiationResult = {
          success: false,
          error: 'Missing user information for chat initiation',
          details: `Client email: ${clientEmail ? 'Present' : 'Missing'}, Freelancer email: ${freelancerEmail ? 'Present' : 'Missing'}`,
          bookingStillSuccessful: true
        };
      }

      return NextResponse.json({
        success: true,
        data: {
          ...safeBookingData,
          chat: chatInitiationResult,
          participants: {
            client: clientEmail,
            freelancer: freelancerEmail
          },
          serviceTitle,
          paymentDetails: {
            paymentMethod,
            totalAmount,
            upsells: upsells || [],
            promoCode: promoCode || null,
            paymentId: paymentId || null,
            transactionId: transactionId || null
          }
        }
      });
    } catch (error) {
      console.error('❌ Error connecting to marketplace canister:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to connect to marketplace service. Please try again.'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error booking package:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      cause: error instanceof Error ? error.cause : 'No cause'
    });

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}