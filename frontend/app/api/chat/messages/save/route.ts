import { NextRequest, NextResponse } from 'next/server';
import { chatStorageApi } from '@/lib/chat-storage-agent';

export async function POST(request: NextRequest) {
  try {
    const { from, to, text, messageType, timestamp, displayName } = await request.json();

    if (!from || !to || !text) {
      return NextResponse.json(
        { error: 'From, to, and text are required' },
        { status: 400 }
      );
    }

    // Check if users have permission to chat (active booking relationship)
    const canChat = await chatStorageApi.canChat(from, to);
    if (!canChat) {
      return NextResponse.json(
        { error: 'Chat not allowed - no active booking relationship between these users' },
        { status: 403 }
      );
    }

    const messageId = await chatStorageApi.saveMessage(
      from,
      to,
      text,
      messageType || 'text',
      timestamp,
      displayName || from.split('@')[0] // Use email prefix as default display name
    );

    if (!messageId) {
      return NextResponse.json(
        { error: 'Failed to save message - user may not be authenticated' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      messageId
    });
  } catch (error) {
    console.error('Save message error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}