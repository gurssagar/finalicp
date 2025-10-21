import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { getPackageById, getServiceById } from '@/app/api/marketplace/storage';

interface BitPayWebhookData {
  event: BitPayEvent;
  data: BitPayInvoiceData;
}

interface BitPayEvent {
  name: string;
  code: number;
}

interface BitPayInvoiceData {
  id: string;
  orderId: string;
  status: string;
  price: number;
  currency: string;
  transactionCurrency: string;
  paid: string; // 'full', 'partial', 'over'
  buyerFields: {
    buyerName: string;
    buyerEmail: string;
  };
  createdTime: number;
  expirationTime: number;
  transactions: Array<{
    txid: string;
    amount: number;
    confirmations: number;
    receivedTime: number;
  }>;
}

export async function POST(request: NextRequest) {
  console.log('🚀 BitPay webhook received');

  try {
    const body: BitPayWebhookData = await request.json();
    const { event, data } = body;

    console.log('📝 BitPay event:', event.name);
    console.log('💰 Invoice data:', {
      id: data.id,
      orderId: data.orderId,
      status: data.status,
      price: data.price,
      currency: data.currency
    });

    // Verify webhook signature (in production, implement proper signature verification)
    const bitpaySignature = request.headers.get('x-bitpay-sig');
    if (!bitpaySignature) {
      console.warn('⚠️ No BitPay signature found - please implement webhook verification');
    }

    // Handle different event types
    switch (event.name) {
      case 'invoice_confirmed':
        await handleInvoiceConfirmed(data);
        break;
      case 'invoice_paidInFull':
        await handleInvoicePaidInFull(data);
        break;
      case 'invoice_completed':
        await handleInvoiceCompleted(data);
        break;
      case 'invoice_failedToConfirm':
        await handleInvoiceFailedToConfirm(data);
        break;
      case 'invoice_refundComplete':
        await handleInvoiceRefundComplete(data);
        break;
      default:
        console.log('ℹ️ Unhandled BitPay event:', event.name);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('❌ BitPay webhook error:', error);
    return NextResponse.json({
      success: false,
      error: 'Webhook processing failed'
    }, { status: 500 });
  }
}

async function handleInvoiceConfirmed(invoiceData: BitPayInvoiceData) {
  console.log('✅ Invoice confirmed:', invoiceData.id);
  // Payment confirmed but waiting for blockchain confirmations
  // Update order status to 'processing'
}

async function handleInvoicePaidInFull(invoiceData: BitPayInvoiceData) {
  console.log('💰 Invoice paid in full:', invoiceData.id);

  try {
    // Extract payment details from BitPay data
    const paymentId = invoiceData.orderId;
    const transactionId = invoiceData.transactions[0]?.txid;
    const amount = invoiceData.price;
    const currency = invoiceData.currency;

    // Forward to payment confirmation endpoint
    const confirmationResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/payment/confirm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentId,
        paymentMethod: 'bitpay',
        transactionId,
        paymentStatus: 'succeeded',
        amount,
        currency
      })
    });

    if (confirmationResponse.ok) {
      const result = await confirmationResponse.json();
      console.log('✅ BitPay payment confirmed and booking created:', result.data);
    } else {
      console.error('❌ Failed to confirm BitPay payment:', await confirmationResponse.text());
    }

  } catch (error) {
    console.error('❌ Error processing BitPay payment confirmation:', error);
  }
}

async function handleInvoiceCompleted(invoiceData: BitPayInvoiceData) {
  console.log('🎉 Invoice completed:', invoiceData.id);
  // Payment is fully confirmed and completed
  // Update order status to 'completed'
}

async function handleInvoiceFailedToConfirm(invoiceData: BitPayInvoiceData) {
  console.log('❌ Invoice failed to confirm:', invoiceData.id);

  try {
    const paymentId = invoiceData.orderId;

    // Update payment status to failed
    // In production, update database with failed status

    console.log('💔 BitPay payment failed for payment ID:', paymentId);

  } catch (error) {
    console.error('❌ Error handling failed BitPay payment:', error);
  }
}

async function handleInvoiceRefundComplete(invoiceData: BitPayInvoiceData) {
  console.log('💸 Invoice refund complete:', invoiceData.id);

  try {
    const paymentId = invoiceData.orderId;

    // Process refund logic
    // Update booking status to 'refunded'
    // Notify both client and freelancer

    console.log('💰 BitPay refund completed for payment ID:', paymentId);

  } catch (error) {
    console.error('❌ Error processing BitPay refund:', error);
  }
}

// GET endpoint for webhook verification
export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'BitPay webhook endpoint is active'
  });
}