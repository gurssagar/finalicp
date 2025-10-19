import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { getMarketplaceActor } from '@/lib/ic-marketplace-agent';
import { getPackageById, getServiceById, getServices } from '../../marketplace/storage';
import { addEnhancedBookingData } from '../../marketplace/bookings/[bookingId]/route';

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

// Shared payment session storage
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

const PAYMENT_SESSIONS_FILE = '/tmp/payment-sessions.json';

// Initialize payment sessions storage
if (!existsSync(PAYMENT_SESSIONS_FILE)) {
  writeFileSync(PAYMENT_SESSIONS_FILE, JSON.stringify({}), 'utf8');
}

function getPaymentSessions(): Record<string, PaymentSession> {
  try {
    const data = readFileSync(PAYMENT_SESSIONS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading payment sessions:', error);
    return {};
  }
}

function savePaymentSession(paymentId: string, session: PaymentSession): void {
  try {
    const sessions = getPaymentSessions();
    sessions[paymentId] = session;
    writeFileSync(PAYMENT_SESSIONS_FILE, JSON.stringify(sessions), 'utf8');
  } catch (error) {
    console.error('Error saving payment session:', error);
  }
}

export async function POST(request: NextRequest) {
  console.log('🚀 POST /api/payment/confirm called');

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

      // Get package data
      const packageData = getPackageById(paymentSession.packageId);
      if (!packageData) {
        console.error('❌ Package lookup failed. Available packages in services:');

        // Debug: Show available packages for debugging
        const services = getServices();
        services.forEach(service => {
          if (service.packages && service.packages.length > 0) {
            console.log(`Service: ${service.title} (${service.service_id})`);
            service.packages.forEach(pkg => {
              console.log(`  - ${pkg.title} (${pkg.package_id})`);
            });
          }
        });

        throw new Error(`Package not found: ${paymentSession.packageId}. Please check the package ID and try again.`);
      }

      console.log('✅ Package found:', packageData.title);

      // Get service data
      const serviceData = getServiceById(packageData.service_id);
      if (!serviceData) {
        console.error('❌ Service lookup failed for service_id:', packageData.service_id);
        throw new Error(`Service not found: ${packageData.service_id}`);
      }

      console.log('✅ Service found:', serviceData.title);

      // Create booking via marketplace canister
      const bookingId = `BK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      console.log('📋 Creating booking with ID:', bookingId);
      console.log('📦 Package:', packageData);
      console.log('🛠️ Service:', serviceData);

      // Enhanced booking data with all payment details
      const bookingData = {
        booking_id: bookingId,
        client_id: paymentSession.clientId,
        freelancer_id: serviceData.freelancer_email,
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

        // Timestamps
        created_at: Date.now(),
        updated_at: Date.now(),
        expires_at: Date.now() + (packageData.delivery_days * 24 * 60 * 60 * 1000) // Delivery deadline
      };

      // Store enhanced booking data
      addEnhancedBookingData(bookingData.booking_id, bookingData);
      console.log('💾 Enhanced booking data stored:', bookingData.booking_id);

      // Initiate chat after successful booking
      let chatInitiationResult = null;
      const clientEmail = paymentSession.clientId;
      const freelancerEmail = serviceData.freelancer_email;
      const serviceTitle = serviceData.title;

      console.log('💬 Initiating chat after successful booking...');

      if (clientEmail && freelancerEmail) {
        try {
          const chatResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/chat/initiate`, {
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
            console.error('❌ Chat initiation failed:', errorText);
            chatInitiationResult = {
              success: false,
              error: 'Failed to initiate chat',
              details: errorText,
              bookingStillSuccessful: true
            };
          }
        } catch (chatError) {
          console.error('❌ Error initiating chat:', chatError);
          chatInitiationResult = {
            success: false,
            error: 'Chat initiation error',
            details: chatError instanceof Error ? chatError.message : 'Unknown error',
            bookingStillSuccessful: true
          };
        }
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

      console.log('✅ Payment confirmation successful:', confirmationData);

      return NextResponse.json({
        success: true,
        data: confirmationData
      });

    } catch (bookingError) {
      console.error('❌ Error creating booking:', bookingError);
      return NextResponse.json({
        success: false,
        error: 'Payment successful but booking creation failed',
        details: bookingError instanceof Error ? bookingError.message : 'Unknown error'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Payment confirmation error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Payment confirmation failed'
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