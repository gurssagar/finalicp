import { NextRequest, NextResponse } from 'next/server';
import { chatStorageApi } from '@/lib/chat-storage-agent';

// POST /api/chat/initiate - Initiate chat between users
export async function POST(request: NextRequest) {
  try {
    const { clientEmail, freelancerEmail, serviceTitle, projectId, bookingId } = await request.json();

    if (!clientEmail || !freelancerEmail) {
      return NextResponse.json(
        { error: 'Client email and freelancer email are required' },
        { status: 400 }
      );
    }

    // Authenticate both users with the chat canister
    const [clientAuth, freelancerAuth] = await Promise.all([
      chatStorageApi.authenticateUser(clientEmail, 'Client'),
      chatStorageApi.authenticateUser(freelancerEmail, 'Freelancer')
    ]);

    if (!clientAuth || !freelancerAuth) {
      return NextResponse.json(
        { error: 'Failed to authenticate users for chat' },
        { status: 500 }
      );
    }

    // Create initial message based on context
    let initialMessage = 'Hello! I would like to discuss the project.';
    let messageType = 'text';

    if (serviceTitle) {
      initialMessage = `Hello! I'm interested in your service: ${serviceTitle}. Let's discuss the details.`;
      messageType = 'service_inquiry';
    } else if (projectId) {
      initialMessage = `Hello! I've assigned you to project ${projectId}. Let's coordinate on the next steps.`;
      messageType = 'project_assignment';
    } else if (bookingId) {
      initialMessage = `Hello! I've booked your service (Booking ID: ${bookingId}). Let's get started!`;
      messageType = 'booking_confirmation';
    }

    // Send initial message from client to freelancer
    const messageId = await chatStorageApi.saveMessage(
      clientEmail,
      freelancerEmail,
      initialMessage,
      messageType,
      new Date().toISOString()
    );

    if (!messageId) {
      return NextResponse.json(
        { error: 'Failed to initiate chat' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      chatInitiated: true,
      messageId,
      participants: {
        client: clientEmail,
        freelancer: freelancerEmail
      },
      initialMessage
    });
  } catch (error) {
    console.error('Chat initiation error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate chat' },
      { status: 500 }
    );
  }
}

// GET /api/chat/initiate - Check if chat exists between users
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientEmail = searchParams.get('clientEmail');
    const freelancerEmail = searchParams.get('freelancerEmail');

    if (!clientEmail || !freelancerEmail) {
      return NextResponse.json(
        { error: 'Client email and freelancer email are required' },
        { status: 400 }
      );
    }

    // Check if chat exists by getting chat history
    const messages = await chatStorageApi.getChatHistory(
      clientEmail,
      freelancerEmail,
      1, // Just get 1 message to check if chat exists
      0
    );

    const chatExists = messages.length > 0;

    return NextResponse.json({
      success: true,
      chatExists,
      messageCount: messages.length
    });
  } catch (error) {
    console.error('Chat check error:', error);
    return NextResponse.json(
      { error: 'Failed to check chat status' },
      { status: 500 }
    );
  }
}