import { NextRequest, NextResponse } from 'next/server';
import { Actor, HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { IDL } from '@dfinity/candid';

const CANISTER_ID = process.env.NEXT_PUBLIC_HACKATHON_CANISTER_ID ?? '';
const IC_HOST = process.env.NEXT_PUBLIC_IC_HOST ?? '';

const hackquestIdl = ({ IDL }: typeof import('@dfinity/candid')) => {
  const RewardTier = IDL.Record({
    id: IDL.Text,
    hackathonId: IDL.Text,
    title: IDL.Text,
    description: IDL.Text,
    amount: IDL.Nat64,
    rank: IDL.Nat,
    categoryId: IDL.Opt(IDL.Text),
    perks: IDL.Vec(IDL.Text),
    awardedSubmissionId: IDL.Opt(IDL.Text),
    awardedTeamId: IDL.Opt(IDL.Text),
    awardedAt: IDL.Opt(IDL.Int),
    awardedBy: IDL.Opt(IDL.Principal),
    note: IDL.Opt(IDL.Text),
  });

  return IDL.Service({
    listWinners: IDL.Func(
      [IDL.Text],
      [IDL.Vec(RewardTier)],
      ['query']
    ),
  });
};

const createHackquestActor = async () => {
  const agent = new HttpAgent({ host: IC_HOST });
  if (IC_HOST.includes('127.0.0.1')) {
    await agent.fetchRootKey();
  }
  return Actor.createActor(hackquestIdl as any, {
    agent,
    canisterId: Principal.fromText(CANISTER_ID),
  });
};

// GET /api/hackquest/winners/list?hackathonId=xxx
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const hackathonId = searchParams.get('hackathonId');

    if (!hackathonId) {
      return NextResponse.json({
        success: false,
        error: 'Hackathon ID is required'
      }, { status: 400 });
    }

    if (!CANISTER_ID) {
      return NextResponse.json({
        success: false,
        error: 'HackQuest canister ID not configured'
      }, { status: 500 });
    }

    console.log(`🏆 Fetching winners for hackathon: ${hackathonId}`);

    const actor: any = await createHackquestActor();

    const winners = await actor.listWinners(hackathonId);

    const transformedWinners = winners.map((reward: any) => ({
      id: reward.id,
      hackathonId: reward.hackathonId,
      title: reward.title,
      description: reward.description,
      amount: Number(reward.amount),
      rank: Number(reward.rank),
      categoryId: reward.categoryId && reward.categoryId[0] ? reward.categoryId[0] : null,
      perks: reward.perks || [],
      awardedSubmissionId: reward.awardedSubmissionId && reward.awardedSubmissionId[0] ? reward.awardedSubmissionId[0] : null,
      awardedTeamId: reward.awardedTeamId && reward.awardedTeamId[0] ? reward.awardedTeamId[0] : null,
      awardedAt: reward.awardedAt && reward.awardedAt[0] ? Number(reward.awardedAt[0]) : null,
      awardedBy: reward.awardedBy && reward.awardedBy[0] ? reward.awardedBy[0].toText() : null,
      note: reward.note && reward.note[0] ? reward.note[0] : null,
    }));

    console.log(`✅ Found ${transformedWinners.length} winners`);

    return NextResponse.json({
      success: true,
      data: transformedWinners,
    });

  } catch (error) {
    console.error('Error fetching winners:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch winners',
    }, { status: 500 });
  }
}

