import { NextRequest, NextResponse } from 'next/server';
import { chatStorageApi } from '@/lib/chat-storage-agent';

export async function POST(request: NextRequest) {
  try {
    const { userEmail, otherUserEmail } = await request.json();

    if (!userEmail || !otherUserEmail) {
      return NextResponse.json(
        { error: 'Both user emails are required' },
        { status: 400 }
      );
    }

    // Check chat permissions - updated to allow both active and completed bookings
    const canChat = await chatStorageApi.canChat(userEmail, otherUserEmail);

    return NextResponse.json({
      success: true,
      canChat,
      debug: {
        userEmail,
        otherUserEmail,
        canChat
      }
    });
  } catch (error) {
    console.error('Can chat check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}