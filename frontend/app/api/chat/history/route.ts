import { NextRequest, NextResponse } from 'next/server';
import { chatStorageApi } from '@/lib/chat-storage-agent';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('userEmail');
    const contactEmail = searchParams.get('contactEmail');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!userEmail || !contactEmail) {
      return NextResponse.json(
        { error: 'userEmail and contactEmail are required' },
        { status: 400 }
      );
    }

    console.log(`[ChatHistory] Loading chat history: ${userEmail} <-> ${contactEmail}`);
    
    // Load all messages (use a high limit to get all messages)
    const allMessages = await chatStorageApi.getChatHistory(
      userEmail,
      contactEmail,
      1000, // High limit to get all messages
      0
    );

    // Sort messages by timestamp (oldest first, newest last)
    const sortedMessages = allMessages.sort((a, b) => {
      const timestampA = new Date(a.timestamp).getTime();
      const timestampB = new Date(b.timestamp).getTime();
      return timestampA - timestampB; // Oldest first
    });

    console.log(`[ChatHistory] Loaded ${sortedMessages.length} messages, sorted by timestamp`);

    return NextResponse.json({
      success: true,
      messages: sortedMessages,
      pagination: {
        limit,
        offset,
        count: sortedMessages.length,
        total: sortedMessages.length
      }
    });
  } catch (error) {
    console.error('Get chat history error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}