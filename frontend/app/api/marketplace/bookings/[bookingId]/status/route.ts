import { NextRequest, NextResponse } from 'next/server';
import { getStagesByBooking, getBookingTimeline, addTimelineEvent, formatNanoseconds, formatRelativeTime, calculateTimeRemaining } from '@/lib/stage-storage';

// Helper function to get enhanced booking data directly
function getEnhancedBookingData(bookingId: string) {
  try {
    const fs = require('fs');
    const enhancedStoragePath = '/tmp/marketplace-storage/enhanced-bookings.json';

    if (fs.existsSync(enhancedStoragePath)) {
      const enhancedStorageData = JSON.parse(fs.readFileSync(enhancedStoragePath, 'utf8'));
      return enhancedStorageData[bookingId] || null;
    }
    return null;
  } catch (error) {
    console.error('Error getting enhanced booking data:', error);
    return null;
  }
}

// GET /api/marketplace/bookings/[bookingId]/status - Get comprehensive booking status
export async function GET(request: NextRequest, { params }: { params: Promise<{ bookingId: string }> }) {
  try {
    const { bookingId } = await params;

    if (!bookingId) {
      return NextResponse.json({
        success: false,
        error: 'Booking ID is required'
      }, { status: 400 });
    }

    console.log(`🔍 Fetching comprehensive status for booking: ${bookingId}`);

    // Get booking details from enhanced storage
    const bookingData = getEnhancedBookingData(bookingId);
    if (!bookingData) {
      return NextResponse.json({
        success: false,
        error: 'Booking not found'
      }, { status: 404 });
    }

    // Get stages for this booking
    const stages = getStagesByBooking(bookingId);

    // Get timeline events
    const timeline = getBookingTimeline(bookingId);

    // Calculate booking statistics
    const totalStages = stages.length;
    const completedStages = stages.filter(s => s.status === 'Approved' || s.status === 'Released').length;
    const inProgressStages = stages.filter(s => s.status === 'InProgress' || s.status === 'Submitted').length;
    const pendingStages = stages.filter(s => s.status === 'Pending').length;

    // Calculate progress percentage
    const progressPercentage = totalStages > 0 ? (completedStages / totalStages) * 100 : 0;

    // Determine overall booking status
    let overallStatus = 'Pending';
    if (stages.some(s => s.status === 'Rejected')) {
      overallStatus = 'Rejected';
    } else if (completedStages === totalStages && totalStages > 0) {
      overallStatus = 'Completed';
    } else if (inProgressStages > 0) {
      overallStatus = 'In Progress';
    } else if (bookingData.status === 'active' || bookingData.status === 'completed') {
      overallStatus = 'Active';
    }

    // Calculate time information
    const now = Date.now();
    const bookingCreated = bookingData.created_at / 1000000; // Convert from nanoseconds
    const bookingAge = now - bookingCreated;
    const deliveryDeadline = bookingData.expires_at || (bookingCreated + (7 * 24 * 60 * 60 * 1000)); // 7 days default

    // Enhanced status response
    const statusResponse = {
      success: true,
      data: {
        // Basic booking information
        booking_id: bookingData.booking_id,
        service_title: bookingData.service_title || bookingData.title,
        service_id: bookingData.service_id,
        package_title: bookingData.package_title,

        // Current status information
        status: overallStatus,
        payment_status: bookingData.payment_status || 'Unknown',
        progress_percentage: Math.round(progressPercentage),

        // Time information
        created_at: bookingCreated,
        formatted_created_at: formatNanoseconds(bookingData.created_at),
        relative_created_at: formatRelativeTime(bookingData.created_at),
        delivery_deadline: deliveryDeadline,
        formatted_deadline: formatNanoseconds(bookingData.expires_at || bookingData.created_at),
        time_remaining: calculateTimeRemaining(bookingData.expires_at || bookingData.created_at),

        // Financial information
        total_amount_e8s: bookingData.total_amount_e8s,
        total_amount_icp: bookingData.total_amount_e8s / 100000000,
        escrow_amount_e8s: bookingData.base_amount_e8s || Math.floor(bookingData.total_amount_e8s * 0.95),

        // Stage information
        stages: {
          total: totalStages,
          completed: completedStages,
          in_progress: inProgressStages,
          pending: pendingStages,
          details: stages.map(stage => ({
            stage_id: stage.stage_id,
            stage_number: stage.stage_number,
            title: stage.title,
            description: stage.description,
            status: stage.status,
            amount_e8s: stage.amount_e8s,
            amount_icp: stage.amount_e8s / 100000000,
            created_at: stage.created_at,
            formatted_created_at: formatNanoseconds(stage.created_at * 1000000),
            updated_at: stage.updated_at,
            formatted_updated_at: formatNanoseconds(stage.updated_at * 1000000),
            submitted_at: stage.submitted_at ? formatNanoseconds(stage.submitted_at * 1000000) : null,
            approved_at: stage.approved_at ? formatNanoseconds(stage.approved_at * 1000000) : null,
            rejected_at: stage.rejected_at ? formatNanoseconds(stage.rejected_at * 1000000) : null,
            released_at: stage.released_at ? formatNanoseconds(stage.released_at * 1000000) : null,
            submission_notes: stage.submission_notes,
            submission_artifacts: stage.submission_artifacts || [],
            rejection_reason: stage.rejection_reason
          }))
        },

        // Timeline information
        timeline: timeline ? {
          events: timeline.events.map(event => ({
            type: event.type,
            timestamp: event.timestamp,
            formatted_timestamp: formatNanoseconds(event.timestamp),
            relative_time: formatRelativeTime(event.timestamp),
            description: event.description,
            metadata: event.metadata
          }))
        } : null,

        // Participant information
        participants: {
          client_id: bookingData.client_id,
          freelancer_id: bookingData.freelancer_id || bookingData.freelancer_email,
          freelancer_email: bookingData.freelancer_email
        },

        // Additional booking details
        special_instructions: bookingData.special_instructions || bookingData.description,
        payment_method: bookingData.payment_method,
        transaction_id: bookingData.transaction_id
      }
    };

    console.log(`✅ Successfully retrieved status for booking ${bookingId}`);
    return NextResponse.json(statusResponse);

  } catch (error) {
    console.error('Error fetching booking status:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch booking status'
    }, { status: 500 });
  }
}

// POST /api/marketplace/bookings/[bookingId]/status - Update booking status
export async function POST(request: NextRequest, { params }: { params: Promise<{ bookingId: string }> }) {
  try {
    const { bookingId } = await params;
    const body = await request.json();
    const { action, metadata, notes } = body;

    if (!bookingId) {
      return NextResponse.json({
        success: false,
        error: 'Booking ID is required'
      }, { status: 400 });
    }

    if (!action) {
      return NextResponse.json({
        success: false,
        error: 'Action is required'
      }, { status: 400 });
    }

    console.log(`🔄 Updating status for booking ${bookingId} with action: ${action}`);

    // Add timeline event for status change
    let description = '';
    switch (action) {
      case 'payment_completed':
        description = 'Payment confirmed and booking activated';
        break;
      case 'stage_created':
        description = 'New stage created';
        break;
      case 'stage_approved':
        description = 'Stage approved by client';
        break;
      case 'stage_rejected':
        description = 'Stage rejected by client';
        break;
      case 'completed':
        description = 'Booking completed successfully';
        break;
      case 'cancelled':
        description = 'Booking cancelled';
        break;
      default:
        description = `Status updated: ${action}`;
    }

    addTimelineEvent(bookingId, action, description, metadata);

    return NextResponse.json({
      success: true,
      message: 'Status updated successfully',
      data: {
        action,
        timestamp: Date.now() * 1000000, // Convert to nanoseconds
        description,
        metadata
      }
    });

  } catch (error) {
    console.error('Error updating booking status:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update booking status'
    }, { status: 500 });
  }
}