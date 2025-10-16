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

    const messages = await chatStorageApi.getChatHistory(
      userEmail,
      contactEmail,
      limit,
      offset
    );

    return NextResponse.json({
      success: true,
      messages,
      pagination: {
        limit,
        offset,
        count: messages.length
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