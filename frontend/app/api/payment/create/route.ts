import { NextRequest, NextResponse } from 'next/server';
import { createHash, randomUUID } from 'crypto';
import { writeFileSync, readFileSync, existsSync } from 'fs';

// Shared payment session storage
const PAYMENT_SESSIONS_FILE = '/tmp/payment-sessions.json';

// Initialize payment sessions storage
if (!existsSync(PAYMENT_SESSIONS_FILE)) {
  writeFileSync(PAYMENT_SESSIONS_FILE, JSON.stringify({}), 'utf8');
}

function savePaymentSession(paymentId: string, session: any): void {
  try {
    let sessions = {};
    try {
      const data = readFileSync(PAYMENT_SESSIONS_FILE, 'utf8');
      sessions = JSON.parse(data);
    } catch (error) {
      console.error('Error reading payment sessions:', error);
    }

    sessions[paymentId] = session;
    writeFileSync(PAYMENT_SESSIONS_FILE, JSON.stringify(sessions), 'utf8');
  } catch (error) {
    console.error('Error saving payment session:', error);
  }
}

interface PaymentRequest {
  packageId: string;
  clientId: string;
  paymentMethod: 'credit-card' | 'bitpay' | 'icp';
  totalAmount: number;
  upsells: Array<{
    id: string;
    name: string;
    price: number;
  }>;
  promoCode?: string;
  specialInstructions?: string;
}

// Mock payment processing for demonstration
export async function POST(request: NextRequest) {
  try {
    const body: PaymentRequest = await request.json();
    const { packageId, clientId, paymentMethod, totalAmount, upsells, promoCode, specialInstructions } = body;

    // Validate required fields
    if (!packageId || !clientId || !paymentMethod || totalAmount <= 0) {
      return NextResponse.json({
        success: false,
        error: 'Missing required payment information'
      }, { status: 400 });
    }

    // Generate payment session
    const paymentId = `PAY_${Date.now()}_${randomUUID().slice(0, 8)}`;
    const timestamp = new Date().toISOString();

    // Calculate platform fee (5%)
    const platformFee = totalAmount * 0.05;
    const netAmount = totalAmount - platformFee;

    // Create payment session
    const paymentSession = {
      paymentId,
      packageId,
      clientId,
      paymentMethod,
      totalAmount,
      platformFee,
      netAmount,
      upsells: upsells || [],
      promoCode: promoCode || null,
      specialInstructions: specialInstructions || '',
      status: 'pending',
      createdAt: timestamp,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
    };

    // Generate payment method specific details
    let paymentDetails = {};

    switch (paymentMethod) {
      case 'credit-card':
        paymentDetails = {
          type: 'credit_card',
          processor: 'stripe',
          intentId: `pi_${randomUUID().slice(0, 24)}`,
          clientSecret: randomUUID().replace(/-/g, ''),
          requiresAction: false
        };
        break;

      case 'bitpay':
        const bitpayAmount = (totalAmount * 4.5).toFixed(2); // Convert to crypto equivalent
        paymentDetails = {
          type: 'bitpay',
          invoiceId: randomUUID().replace(/-/g, ''),
          amount: bitpayAmount,
          currency: 'BTC',
          paymentUrl: `https://bitpay.com/invoice?id=${paymentId}`,
          expirationTime: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minutes
        };
        break;

      case 'icp':
        paymentDetails = {
          type: 'icp',
          ledger: 'ic',
          amount: (totalAmount * 4.5).toFixed(4), // Convert to ICP
          canisterId: process.env.NEXT_PUBLIC_MARKETPLACE_CANISTER_ID,
          account: randomUUID().replace(/-/g, ''),
          transactionId: null
        };
        break;
    }

    // Store payment session in mock storage
    const sessionData = {
      ...paymentSession,
      paymentDetails,
      hash: createHash('sha256').update(JSON.stringify(paymentSession)).digest('hex')
    };

    savePaymentSession(paymentId, sessionData);
    console.log('Payment session created and stored:', sessionData);

    // Return payment session details
    return NextResponse.json({
      success: true,
      data: {
        paymentId: sessionData.paymentId,
        paymentDetails: sessionData.paymentDetails,
        amount: sessionData.totalAmount,
        currency: 'USD',
        status: 'pending',
        expiresAt: sessionData.expiresAt
      }
    });

  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create payment session'
    }, { status: 500 });
  }
}

// GET endpoint to retrieve payment status
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
    const mockPaymentData = {
      paymentId,
      status: 'pending',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString()
    };

    return NextResponse.json({
      success: true,
      data: mockPaymentData
    });

  } catch (error) {
    console.error('Payment status error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve payment status'
    }, { status: 500 });
  }
}