import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { getMarketplaceActor } from '@/lib/ic-marketplace-agent';
import { createBookingInCanister, ensurePackageExistsInCanister, ensureServiceExistsInCanister } from '@/lib/booking-utils';

// Timeout utility function
async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, errorMessage: string): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(errorMessage)), timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]);
}

// Fetch with timeout utility
async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number = 10000): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timed out. Please check your connection and try again.');
    }
    throw error;
  }
}

// Helper function to determine upsell category
function getUpsellCategory(upsellId: string): string {
  const categoryMap: Record<string, string> = {
    'express-delivery': 'delivery',
    'extra-revisions': 'revisions',
    'priority-support': 'support',
    'commercial-license': 'features',
    'source-files': 'features',
    'extended-support': 'support'
  };
  return categoryMap[upsellId] || 'other';
}

interface PaymentConfirmationRequest {
  paymentId: string;
  paymentMethod: 'credit-card' | 'bitpay' | 'icp';
  transactionId?: string;
  paymentStatus: 'succeeded' | 'failed' | 'cancelled';
  amount: number;
  currency: string;
}

interface PaymentSession {
  paymentId: string;
  packageId: string;
  clientId: string;
  paymentMethod: string;
  totalAmount: number;
  platformFee: number;
  netAmount: number;
  upsells: Array<{
    id: string;
    name: string;
    price: number;
  }>;
  promoCode?: string;
  specialInstructions?: string;
  status: string;
  createdAt: string;
  expiresAt: string;
}

// In-memory payment session storage (for development only)
const paymentSessions: Record<string, PaymentSession> = {};

function getPaymentSessions(): Record<string, PaymentSession> {
  return paymentSessions;
}

function savePaymentSession(paymentId: string, session: PaymentSession): void {
  paymentSessions[paymentId] = session;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  console.log('🚀 POST /api/payment/confirm called at:', new Date().toISOString());

  try {
    const body: PaymentConfirmationRequest = await request.json();
    const { paymentId, paymentMethod, transactionId, paymentStatus, amount, currency } = body;

    console.log('📝 Payment confirmation:', { paymentId, paymentMethod, paymentStatus, amount });

    // Validate required fields
    if (!paymentId || !paymentStatus) {
      return NextResponse.json({
        success: false,
        error: 'Missing required payment confirmation data'
      }, { status: 400 });
    }

    // Retrieve payment session from storage
    const paymentSessions = getPaymentSessions();
    const paymentSession = paymentSessions[paymentId];
    if (!paymentSession) {
      console.error('❌ Payment session not found:', paymentId);
      return NextResponse.json({
        success: false,
        error: 'Payment session not found or expired'
      }, { status: 404 });
    }

    // Verify payment details match
    if (paymentSession.paymentMethod !== paymentMethod) {
      return NextResponse.json({
        success: false,
        error: 'Payment method mismatch'
      }, { status: 400 });
    }

    if (Math.abs(paymentSession.totalAmount - amount) > 0.01) {
      return NextResponse.json({
        success: false,
        error: 'Payment amount mismatch'
      }, { status: 400 });
    }

    if (paymentStatus !== 'succeeded') {
      return NextResponse.json({
        success: false,
        error: 'Payment was not successful',
        paymentStatus
      }, { status: 400 });
    }

    // Update payment session status
    paymentSession.status = 'completed';

    // Create booking after successful payment
    console.log('💰 Payment successful, creating booking...');

    try {
      // Validate payment session data
      if (!paymentSession.packageId) {
        throw new Error('Package ID is missing from payment session');
      }

      console.log('🔍 Looking for package:', paymentSession.packageId);

      // Create service and package data from payment session
      // Since we're working with canister directly, we'll create the data from the payment session
      const serviceData = {
        service_id: paymentSession.serviceId,
        freelancer_email: 'freelancer@example.com', // Default freelancer email
        title: 'Web Development Service',
        main_category: 'Web Development',
        sub_category: 'Frontend Development',
        description: 'Professional web development services with modern technologies and best practices.',
        whats_included: 'Complete web development solution including design, development, testing, and deployment.',
        delivery_time_days: 7,
        starting_from_e8s: 100000000, // 1 ICP
        tags: ['web', 'development', 'modern']
      };

      const packageData = {
        package_id: paymentSession.packageId,
        service_id: paymentSession.serviceId,
        title: 'Standard Package',
        description: 'Complete service package with professional delivery and quality assurance.',
        delivery_days: 7,
        price_e8s: 100000000, // 1 ICP
        delivery_timeline: '7 days delivery',
        revisions_included: 1,
        features: ['Professional delivery', 'Quality assurance', 'Support included']
      };

      console.log('✅ Service data created:', serviceData.title);
      console.log('✅ Package data created:', packageData.title);

      // Create booking via marketplace canister
      const bookingId = `BK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      console.log('📋 Creating booking with ID:', bookingId);
      console.log('📦 Package:', packageData);
      console.log('🛠️ Service:', serviceData);

      const currentTime = Date.now();
      const deliveryDeadline = currentTime + (packageData.delivery_days * 24 * 60 * 60 * 1000);

      // Enhanced booking data with all payment details
      const bookingData = {
        booking_id: bookingId,
        client_id: paymentSession.clientId,
        freelancer_id: serviceData.freelancer_email,
        freelancer_email: serviceData.freelancer_email, // Add explicit freelancer_email field
        service_id: serviceData.service_id,
        service_title: serviceData.title,
        package_id: paymentSession.packageId,
        package_tier: packageData.tier,
        package_title: packageData.title,
        package_description: packageData.description,
        package_delivery_days: packageData.delivery_days,
        package_revisions: packageData.revisions_included,
        package_features: packageData.features || [],

        // Payment details
        total_amount_e8s: Math.floor(amount * 100000000), // Convert to e8s
        base_amount_e8s: Math.floor(paymentSession.netAmount * 100000000),
        platform_fee_e8s: Math.floor(paymentSession.platformFee * 100000000),
        status: 'active',
        payment_id: paymentId,
        payment_method: paymentMethod,
        transaction_id: transactionId,
        payment_status: 'completed',

        // Upsells and enhancements
        upsells: paymentSession.upsells.map(upsell => ({
          id: upsell.id,
          name: upsell.name,
          price: upsell.price,
          category: getUpsellCategory(upsell.id)
        })),

        // Additional details
        special_instructions: paymentSession.specialInstructions || '',
        promo_code: paymentSession.promoCode || null,
        discount_amount: paymentSession.promoCode ? (paymentSession.platformFee * 0.1) : 0,

        // Comprehensive timestamp tracking
        created_at: currentTime,
        updated_at: currentTime,
        expires_at: deliveryDeadline,

        // Booking lifecycle timestamps
        booking_confirmed_at: currentTime,
        payment_completed_at: currentTime,
        delivery_deadline: deliveryDeadline,

        // Human-readable date strings for display
        created_at_readable: new Date(currentTime).toISOString(),
        booking_confirmed_at_readable: new Date(currentTime).toISOString(),
        payment_completed_at_readable: new Date(currentTime).toISOString(),
        delivery_deadline_readable: new Date(deliveryDeadline).toISOString(),

        // Time tracking calculations
        delivery_days: packageData.delivery_days,
        time_remaining_hours: Math.floor((deliveryDeadline - currentTime) / (60 * 60 * 1000))
      };

      // Ensure service exists in canister first (pass package data for price)
      const serviceResult = await ensureServiceExistsInCanister(serviceData, packageData);
      if (!serviceResult.success) {
        throw new Error(`Failed to ensure service exists in canister: ${serviceResult.error}`);
      }
      console.log('✅ Service ensured in canister:', serviceResult.serviceId);

      // Ensure package exists in canister
      const packageResult = await ensurePackageExistsInCanister(packageData, serviceData.service_id);
      if (!packageResult.success) {
        throw new Error(`Failed to ensure package exists in canister: ${packageResult.error}`);
      }
      console.log('✅ Package ensured in canister:', packageResult.packageId);

      // Create booking in canister
      const canisterResult = await createBookingInCanister(bookingData);
      if (!canisterResult.success) {
        throw new Error(`Failed to create booking in canister: ${canisterResult.error}`);
      }
      console.log('✅ Booking created in canister:', canisterResult.bookingId);

      // Initiate chat after successful booking (async, non-blocking)
      let chatInitiationResult = null;
      const clientEmail = paymentSession.clientId;
      const freelancerEmail = serviceData.freelancer_email;
      const serviceTitle = serviceData.title;

      console.log('💬 Starting async chat initiation...');

      if (clientEmail && freelancerEmail) {
        // Start chat initiation in background with timeout, but don't block the payment confirmation
        const initiateChat = async () => {
          try {
            const chatResponse = await fetchWithTimeout(
              `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/chat/initiate`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  clientEmail,
                  freelancerEmail,
                  serviceTitle,
                  bookingId: bookingData.booking_id,
                  projectId: bookingData.booking_id,
                  bookingDetails: {
                    // Service and package details
                    serviceId: bookingData.service_id,
                    packageTier: bookingData.package_tier,
                    packageTitle: bookingData.package_title,
                    packageDescription: bookingData.package_description,
                    deliveryDays: bookingData.package_delivery_days,
                    revisionsIncluded: bookingData.package_revisions,
                    features: bookingData.package_features,

                    // Payment details
                    totalAmount: bookingData.total_amount_e8s / 100000000,
                    paymentMethod: bookingData.payment_method,
                    paymentId: bookingData.payment_id,
                    transactionId: bookingData.transaction_id,

                    // Upsells and enhancements
                    upsells: bookingData.upsells,

                    // Additional information
                    specialInstructions: bookingData.special_instructions,
                    promoCode: bookingData.promo_code,
                    deliveryDeadline: new Date(bookingData.expires_at).toISOString()
                  }
                }),
              },
              8000 // 8 second timeout for chat initiation
            );

            if (chatResponse.ok) {
              const chatData = await chatResponse.json();
              console.log('✅ Chat initiated successfully:', chatData);
              return {
                success: true,
                chatInitiated: true,
                messageId: chatData.messageId,
                participants: chatData.participants,
                initialMessage: chatData.initialMessage
              };
            } else {
              const errorText = await chatResponse.text();
              console.error('❌ Chat initiation failed:', errorText);
              return {
                success: false,
                error: 'Failed to initiate chat',
                details: errorText,
                bookingStillSuccessful: true
              };
            }
          } catch (chatError) {
            console.error('❌ Error initiating chat:', chatError);
            return {
              success: false,
              error: 'Chat initiation error',
              details: chatError instanceof Error ? chatError.message : 'Unknown error',
              bookingStillSuccessful: true
            };
          }
        };

        // Start chat initiation but don't await it - let it run in background
        initiateChat().then(result => {
          chatInitiationResult = result;
          // Optionally log completion or store result for later retrieval
          console.log('📝 Chat initiation completed with result:', result);
        }).catch(error => {
          console.error('📝 Chat initiation background task failed:', error);
        });
      }

      // Send confirmation email (mock)
      console.log('📧 Sending confirmation email...');

      const confirmationData = {
        paymentConfirmation: {
          paymentId,
          amount,
          currency,
          paymentMethod,
          transactionId,
          confirmedAt: new Date().toISOString()
        },
        booking: bookingData,
        chat: chatInitiationResult,
        service: {
          title: serviceData.title,
          freelancerEmail: serviceData.freelancer_email
        }
      };

      const processingTime = Date.now() - startTime;
      console.log('✅ Payment confirmation successful in', processingTime, 'ms:', confirmationData);

      return NextResponse.json({
        success: true,
        data: {
          ...confirmationData,
          processingTime,
          chatStatus: chatInitiationResult ? 'completed' : 'pending_background'
        }
      });

    } catch (bookingError) {
      const processingTime = Date.now() - startTime;
      console.error('❌ Error creating booking after', processingTime, 'ms:', bookingError);

      // Check if it's a timeout error
      if (bookingError instanceof Error && bookingError.message.includes('timed out')) {
        return NextResponse.json({
          success: false,
          error: 'Payment confirmation timed out. Your payment was processed but there was an issue creating the booking. Please contact support.',
          details: bookingError.message,
          processingTime,
          timeout: true,
          paymentProcessed: true
        }, { status: 504 });
      }

      return NextResponse.json({
        success: false,
        error: 'Payment successful but booking creation failed',
        details: bookingError instanceof Error ? bookingError.message : 'Unknown error',
        processingTime,
        paymentProcessed: true
      }, { status: 500 });
    }

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error('Payment confirmation error after', processingTime, 'ms:', error);

    // Check if it's a timeout error
    if (error instanceof Error && error.message.includes('timed out')) {
      return NextResponse.json({
        success: false,
        error: 'Payment confirmation timed out. Please try again or contact support if the issue persists.',
        details: error.message,
        processingTime,
        timeout: true
      }, { status: 504 });
    }

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Payment confirmation failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      processingTime
    }, { status: 500 });
  }
}

// GET endpoint to retrieve payment confirmation status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('paymentId');

    if (!paymentId) {
      return NextResponse.json({
        success: false,
        error: 'Payment ID is required'
      }, { status: 400 });
    }

    // In production, retrieve from database
    // For now, return mock data
    const mockConfirmationData = {
      paymentId,
      status: 'completed',
      bookingId: `BK_${Date.now()}`,
      confirmedAt: new Date().toISOString(),
      amount: 100.00,
      currency: 'USD'
    };

    return NextResponse.json({
      success: true,
      data: mockConfirmationData
    });

  } catch (error) {
    console.error('Payment confirmation status error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve payment confirmation status'
    }, { status: 500 });
  }
}