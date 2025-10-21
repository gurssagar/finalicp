import { NextRequest, NextResponse } from 'next/server';
import { chatStorageApi } from '@/lib/chat-storage-agent';

export async function POST(request: NextRequest) {
  try {
    const { clientEmail, freelancerEmail, bookingId, serviceTitle, status } = await request.json();

    if (!clientEmail || !freelancerEmail || !bookingId || !serviceTitle) {
      return NextResponse.json(
        { error: 'Client email, freelancer email, booking ID, and service title are required' },
        { status: 400 }
      );
    }

    const result = await chatStorageApi.createChatRelationship(
      clientEmail,
      freelancerEmail,
      bookingId,
      serviceTitle,
      status || 'Active'
    );

    return NextResponse.json({
      success: result,
      message: result ? 'Chat relationship created successfully' : 'Failed to create chat relationship'
    });
  } catch (error) {
    console.error('Create relationship error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}