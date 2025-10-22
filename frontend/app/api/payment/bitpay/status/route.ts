import { NextRequest, NextResponse } from 'next/server';

// Mock payment status storage
const paymentStatusStore: Record<string, any> = {
  // Mock data for testing
  'PAY_sample': {
    status: 'pending',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString()
  }
};

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

    // In a real implementation, you would check the status with BitPay API
    // For now, we'll simulate the status check
    const mockStatus = paymentStatusStore[paymentId] || {
      status: 'pending',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString()
    };

    // Simulate random completion for testing
    if (Math.random() > 0.8) { // 20% chance of completion
      mockStatus.status = 'completed';
    }

    return NextResponse.json({
      success: true,
      data: mockStatus
    });

  } catch (error) {
    console.error('BitPay status check error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to check payment status'
    }, { status: 500 });
  }
}