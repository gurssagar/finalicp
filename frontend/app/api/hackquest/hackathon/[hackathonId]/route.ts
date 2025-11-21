import { NextRequest, NextResponse } from 'next/server';
import { Actor, HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { IDL } from '@dfinity/candid';

const CANISTER_ID = process.env.NEXT_PUBLIC_HACKATHON_CANISTER_ID ?? '';
const IC_HOST = process.env.NEXT_PUBLIC_IC_HOST ?? '';

const hackquestIdl = ({ IDL }: typeof import('@dfinity/candid')) => {
  const HackathonStatus = IDL.Variant({
    Draft: IDL.Null,
    Upcoming: IDL.Null,
    Ongoing: IDL.Null,
    Judging: IDL.Null,
    Completed: IDL.Null,
    Cancelled: IDL.Null,
  });

  const Hackathon = IDL.Record({
    id: IDL.Text,
    organizer: IDL.Principal,
    title: IDL.Text,
    tagline: IDL.Text,
    summary: IDL.Text,
    bannerUrl: IDL.Text,
    heroVideoUrl: IDL.Text,
    location: IDL.Text,
    theme: IDL.Text,
    prizePool: IDL.Nat64,
    faq: IDL.Vec(IDL.Text),
    resources: IDL.Vec(IDL.Text),
    minTeamSize: IDL.Nat,
    maxTeamSize: IDL.Nat,
    maxTeamsPerCategory: IDL.Nat,
    submissionsOpenAt: IDL.Int,
    submissionsCloseAt: IDL.Int,
    startAt: IDL.Int,
    endAt: IDL.Int,
    createdAt: IDL.Int,
    status: HackathonStatus,
    categories: IDL.Vec(IDL.Text),
    rewards: IDL.Vec(IDL.Text),
  });

  const Category = IDL.Record({
    id: IDL.Text,
    hackathonId: IDL.Text,
    name: IDL.Text,
    description: IDL.Text,
    rewardSlots: IDL.Nat,
    judgingCriteria: IDL.Vec(IDL.Text),
  });

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
    getHackathonDetails: IDL.Func(
      [IDL.Text],
      [IDL.Opt(IDL.Record({
        hackathon: Hackathon,
        categories: IDL.Vec(Category),
        rewards: IDL.Vec(RewardTier),
      }))],
      ['query']
    ),
    listTeams: IDL.Func(
      [IDL.Text, IDL.Opt(IDL.Text)],
      [IDL.Vec(IDL.Record({
        id: IDL.Text,
        hackathonId: IDL.Text,
        categoryId: IDL.Opt(IDL.Text),
        name: IDL.Text,
        leader: IDL.Principal,
        members: IDL.Vec(IDL.Record({
          principal: IDL.Principal,
          accepted: IDL.Bool,
          invitedAt: IDL.Int,
          acceptedAt: IDL.Opt(IDL.Int),
        })),
        createdAt: IDL.Int,
      }))],
      ['query']
    ),
    listSubmissions: IDL.Func(
      [IDL.Text, IDL.Opt(IDL.Text)],
      [IDL.Vec(IDL.Record({
        id: IDL.Text,
        hackathonId: IDL.Text,
        teamId: IDL.Text,
        categoryId: IDL.Text, // Non-optional in canister
        title: IDL.Text,
        summary: IDL.Text, // Added summary field
        description: IDL.Text,
        repoUrl: IDL.Text, // Changed from repositoryUrl
        demoUrl: IDL.Text, // Non-optional in canister
        gallery: IDL.Vec(IDL.Text), // Changed from galleryImages
        submittedAt: IDL.Int,
        status: IDL.Variant({
          Draft: IDL.Null,
          Submitted: IDL.Null,
          UnderReview: IDL.Null,
          Selected: IDL.Null,
          Rejected: IDL.Null,
        }),
      }))],
      ['query']
    ),
    getParticipant: IDL.Func(
      [IDL.Principal],
      [IDL.Opt(IDL.Record({
        principal: IDL.Principal,
        displayName: IDL.Text,
        email: IDL.Text,
        joinedAt: IDL.Int,
      }))],
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

// GET /api/hackquest/hackathon/[hackathonId] - Get hackathon details with stats
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ hackathonId: string }> }
) {
  try {
    const { hackathonId } = await params;

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

    console.log('🔍 Fetching hackathon details for ID:', hackathonId);

    const actor: any = await createHackquestActor();
    
    // Get hackathon details
    const detailsResult = await actor.getHackathonDetails(hackathonId);
    
    if (!detailsResult || !detailsResult[0]) {
      return NextResponse.json({
        success: false,
        error: 'Hackathon not found'
      }, { status: 404 });
    }

    const details = detailsResult[0];
    const hackathon = details.hackathon;
    const categories = details.categories || [];
    const rewards = details.rewards || [];

    // Get organizer email
    let organizerEmail: string | null = null;
    try {
      const organizerParticipant = await actor.getParticipant(hackathon.organizer);
      if (organizerParticipant && organizerParticipant[0]) {
        organizerEmail = organizerParticipant[0].email;
      }
    } catch (error) {
      console.warn('Could not get organizer email:', error);
    }

    // Get teams count
    let teamsCount = 0;
    try {
      const teams = await actor.listTeams(hackathonId, []);
      teamsCount = teams.length;
    } catch (error) {
      console.warn('Could not get teams:', error);
    }

    // Get submissions count
    let submissionsCount = 0;
    try {
      const submissions = await actor.listSubmissions(hackathonId, []);
      submissionsCount = submissions.length;
    } catch (error) {
      console.warn('Could not get submissions:', error);
    }

    // Calculate participants count from teams
    let participantsCount = 0;
    try {
      const teams = await actor.listTeams(hackathonId, []);
      teams.forEach((team: any) => {
        participantsCount += team.members.length;
      });
    } catch (error) {
      console.warn('Could not calculate participants:', error);
    }

    const timestampToDate = (ts: bigint) => {
      const millis = Number(ts) / 1_000_000;
      return new Date(millis).toISOString();
    };

    const transformedHackathon = {
      hackathon_id: hackathon.id,
      id: hackathon.id,
      title: hackathon.title || 'Untitled Hackathon',
      tagline: hackathon.tagline || '',
      description: hackathon.summary || '',
      summary: hackathon.summary || '',
      theme: hackathon.theme || 'General',
      location: hackathon.location || 'Virtual',
      mode: { Online: null },
      bannerUrl: hackathon.bannerUrl || '',
      heroVideoUrl: hackathon.heroVideoUrl || '',
      banner_image: hackathon.bannerUrl || '',
      prize_pool: hackathon.prizePool.toString(),
      start_date: timestampToDate(BigInt(hackathon.startAt)),
      end_date: timestampToDate(BigInt(hackathon.endAt)),
      registration_start: timestampToDate(BigInt(hackathon.submissionsOpenAt)),
      registration_end: timestampToDate(BigInt(hackathon.submissionsCloseAt)),
      min_team_size: Number(hackathon.minTeamSize),
      max_team_size: Number(hackathon.maxTeamSize),
      status: hackathon.status,
      created_at: timestampToDate(BigInt(hackathon.createdAt)),
      updated_at: timestampToDate(BigInt(hackathon.createdAt)),
      organizer: hackathon.organizer.toText(),
      organizerEmail: organizerEmail,
      categories: categories.map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        description: cat.description,
        rewardSlots: Number(cat.rewardSlots),
        judgingCriteria: cat.judgingCriteria,
      })),
      rewards: rewards.map((reward: any) => ({
        id: reward.id,
        title: reward.title,
        description: reward.description,
        amount: reward.amount.toString(),
        rank: Number(reward.rank),
        categoryId: reward.categoryId[0] || null,
        perks: reward.perks,
      })),
      faq: hackathon.faq || [],
      resources: hackathon.resources || [],
      // Stats
      participantsCount,
      teamsCount,
      submissionsCount,
    };

    console.log(`✅ Hackathon details loaded: ${transformedHackathon.title}`);

    return NextResponse.json({
      success: true,
      data: transformedHackathon
    });

  } catch (error) {
    console.error('Error fetching hackathon details:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch hackathon details',
    }, { status: 500 });
  }
}

