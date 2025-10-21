import { NextRequest, NextResponse } from 'next/server';
import { chatStorageApi } from '@/lib/chat-storage-agent';

export async function POST(request: NextRequest) {
  try {
    const { bookingId, newStatus } = await request.json();

    if (!bookingId || !newStatus) {
      return NextResponse.json(
        { error: 'Booking ID and new status are required' },
        { status: 400 }
      );
    }

    const result = await chatStorageApi.updateRelationshipStatus(bookingId, newStatus);

    return NextResponse.json({
      success: result,
      message: result ? 'Relationship status updated successfully' : 'Failed to update relationship status'
    });
  } catch (error) {
    console.error('Update relationship status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}