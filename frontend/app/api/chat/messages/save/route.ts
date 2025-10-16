import { NextRequest, NextResponse } from 'next/server';
import { chatStorageApi } from '@/lib/chat-storage-agent';

export async function POST(request: NextRequest) {
  try {
    const { from, to, text, messageType, timestamp } = await request.json();

    if (!from || !to || !text) {
      return NextResponse.json(
        { error: 'From, to, and text are required' },
        { status: 400 }
      );
    }

    const messageId = await chatStorageApi.saveMessage(
      from,
      to,
      text,
      messageType || 'text',
      timestamp
    );

    if (!messageId) {
      return NextResponse.json(
        { error: 'Failed to save message' },
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