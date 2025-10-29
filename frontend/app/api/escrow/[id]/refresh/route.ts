import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/actions/auth';
import { getEscrowActor } from '@/lib/ic-agent';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getCurrentSession();

    if (!session) {
      return NextResponse.json({
        success: false,
        error: 'Not authenticated',
      }, { status: 401 });
    }

    const { id: escrowId } = await params;

    if (!escrowId) {
      return NextResponse.json({
        success: false,
        error: 'Escrow ID is required',
      }, { status: 400 });
    }

    const escrowActor = await getEscrowActor();

    try {
      const result = await escrowActor.refresh_funding(escrowId);

      return NextResponse.json({
        success: true,
        data: {
          funded: result.funded,
          balanceE8s: Number(result.balanceE8s),
        },
      });
    } catch (escrowError: any) {
      console.error('Escrow refresh error:', escrowError);
      return NextResponse.json({
        success: false,
        error: escrowError.message || 'Failed to refresh escrow funding status',
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Escrow refresh API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to refresh escrow funding status',
    }, { status: 500 });
  }
}
