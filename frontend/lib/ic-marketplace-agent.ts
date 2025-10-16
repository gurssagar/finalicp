import { Actor, HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';

// Mock IDL factory for testing (will be replaced with actual generated file)
const idlFactory = ({ IDL }: any) => {
  return IDL.Service({
    // Mock service methods for testing
    listServices: IDL.Func([IDL.Record({
      category: IDL.Opt(IDL.Text),
      freelancer_id: IDL.Opt(IDL.Text),
      search_term: IDL.Text,
      limit: IDL.Nat,
      offset: IDL.Nat
    })], [IDL.Variant({ ok: IDL.Vec(IDL.Record({
      service_id: IDL.Text,
      freelancer_id: IDL.Text,
      title: IDL.Text,
      main_category: IDL.Text,
      sub_category: IDL.Text,
      description: IDL.Text,
      whats_included: IDL.Text,
      cover_image_url: IDL.Opt(IDL.Text),
      portfolio_images: IDL.Vec(IDL.Text),
      status: IDL.Text,
      rating_avg: IDL.Float64,
      total_orders: IDL.Nat,
      created_at: IDL.Int,
      updated_at: IDL.Int
    })), err: IDL.Text })]),
    
    createService: IDL.Func([IDL.Text, IDL.Record({
      title: IDL.Text,
      main_category: IDL.Text,
      sub_category: IDL.Text,
      description: IDL.Text,
      whats_included: IDL.Text,
      cover_image_url: IDL.Opt(IDL.Text),
      portfolio_images: IDL.Vec(IDL.Text),
      status: IDL.Text
    })], [IDL.Variant({ ok: IDL.Record({
      service_id: IDL.Text,
      freelancer_id: IDL.Text,
      title: IDL.Text,
      status: IDL.Text,
      created_at: IDL.Int,
      updated_at: IDL.Int
    }), err: IDL.Text })]),
    
    getServiceById: IDL.Func([IDL.Text], [IDL.Variant({ ok: IDL.Record({
      service_id: IDL.Text,
      freelancer_id: IDL.Text,
      title: IDL.Text,
      main_category: IDL.Text,
      sub_category: IDL.Text,
      description: IDL.Text,
      whats_included: IDL.Text,
      cover_image_url: IDL.Opt(IDL.Text),
      portfolio_images: IDL.Vec(IDL.Text),
      status: IDL.Text,
      rating_avg: IDL.Float64,
      total_orders: IDL.Nat,
      created_at: IDL.Int,
      updated_at: IDL.Int
    }), err: IDL.Text })]),
    
    updateService: IDL.Func([IDL.Text, IDL.Text, IDL.Record({
      title: IDL.Opt(IDL.Text),
      description: IDL.Opt(IDL.Text),
      status: IDL.Opt(IDL.Text)
    })], [IDL.Variant({ ok: IDL.Record({
      service_id: IDL.Text,
      freelancer_id: IDL.Text,
      title: IDL.Text,
      status: IDL.Text,
      created_at: IDL.Int,
      updated_at: IDL.Int
    }), err: IDL.Text })]),
    
    deleteService: IDL.Func([IDL.Text, IDL.Text], [IDL.Variant({ ok: IDL.Null, err: IDL.Text })]),

    getPackagesByService: IDL.Func([IDL.Text], [IDL.Variant({ ok: IDL.Vec(IDL.Record({
      package_id: IDL.Text,
      service_id: IDL.Text,
      tier: IDL.Text,
      title: IDL.Text,
      description: IDL.Text,
      price_e8s: IDL.Text,
      delivery_days: IDL.Nat,
      features: IDL.Vec(IDL.Text),
      revisions_included: IDL.Nat,
      status: IDL.Text,
      created_at: IDL.Int,
      updated_at: IDL.Int
    })), err: IDL.Text })]),

    createPackage: IDL.Func([IDL.Text, IDL.Record({
      service_id: IDL.Text,
      tier: IDL.Text,
      title: IDL.Text,
      description: IDL.Text,
      price_e8s: IDL.Text,
      delivery_days: IDL.Nat,
      features: IDL.Vec(IDL.Text),
      revisions_included: IDL.Nat,
      status: IDL.Text
    })], [IDL.Variant({ ok: IDL.Record({
      package_id: IDL.Text,
      service_id: IDL.Text,
      tier: IDL.Text,
      status: IDL.Text,
      created_at: IDL.Int,
      updated_at: IDL.Int
    }), err: IDL.Text })]),

    // Add other methods as needed for testing
    getStats: IDL.Func([], [IDL.Record({
      total_services: IDL.Nat,
      total_packages: IDL.Nat,
      total_bookings: IDL.Nat,
      total_stages: IDL.Nat,
      total_transactions: IDL.Nat
    })]),
    
    getEventLog: IDL.Func([], [IDL.Vec(IDL.Text)])
  });
};

// Type imports from generated declarations
type _SERVICE = any;

// Marketplace Types
export interface Service {
  service_id: string;
  freelancer_id: string;
  title: string;
  main_category: string;
  sub_category: string;
  description: string;
  whats_included: string;
  cover_image_url?: string;
  portfolio_images: string[];
  status: 'Active' | 'Paused' | 'Deleted';
  created_at: number;
  updated_at: number;
  rating_avg: number;
  total_orders: number;
}

export interface Package {
  package_id: string;
  service_id: string;
  tier: 'Basic' | 'Advanced' | 'Premium';
  title: string;
  description: string;
  price_e8s: bigint;
  delivery_days: number;
  features: string[];
  revisions_included: number;
  status: 'Available' | 'Unavailable';
  created_at: number;
  updated_at: number;
}

export interface Booking {
  booking_id: string;
  package_id: string;
  client_id: string;
  freelancer_id: string;
  total_price_e8s: bigint;
  escrow_amount_e8s: bigint;
  platform_fee_e8s: bigint;
  payment_status: 'Pending' | 'PaymentInitiated' | 'Funded' | 'Released' | 'Refunded' | 'Failed';
  booking_status: 'Pending' | 'InProgress' | 'Completed' | 'Cancelled' | 'Disputed';
  special_instructions: string;
  deliverables: string[];
  idempotency_key: string;
  ledger_deposit_block?: bigint;
  created_at: number;
  updated_at: number;
  funded_at?: number;
  completed_at?: number;
}

export interface ProjectStage {
  stage_id: string;
  booking_id: string;
  stage_number: number;
  title: string;
  description: string;
  amount_e8s: bigint;
  status: 'Pending' | 'InProgress' | 'Submitted' | 'Approved' | 'Rejected' | 'Released';
  submission_notes?: string;
  submission_artifacts: string[];
  rejection_reason?: string;
  submitted_at?: number;
  approved_at?: number;
  rejected_at?: number;
  released_at?: number;
  release_ledger_block?: bigint;
}

export interface EscrowTransaction {
  transaction_id: string;
  booking_id: string;
  transaction_type: 'Deposit' | 'Release' | 'Refund' | 'PlatformFee';
  amount_e8s: bigint;
  from_principal: string;
  to_principal: string;
  ledger_block_index: bigint;
  status: 'Pending' | 'Confirmed' | 'Failed';
  created_at: number;
  confirmed_at?: number;
}

export interface ServiceFilter {
  category?: string;
  freelancer_id?: string;
  search_term: string;
  limit: number;
  offset: number;
}

export interface BookingResponse {
  booking_id: string;
  escrow_account: string;
  amount_e8s: bigint;
  ledger_block?: bigint;
}

export interface ApiError {
  NotFound?: string;
  AlreadyExists?: string;
  InvalidInput?: string;
  Unauthorized?: string;
  PaymentFailed?: string;
  InsufficientFunds?: boolean;
  LedgerError?: string;
  StageNotApproved?: boolean;
  BookingNotFunded?: boolean;
  InvalidStatus?: string;
}

// IC Agent configuration
const IC_HOST = process.env.IC_HOST || 'http://localhost:4943';
const MARKETPLACE_CANISTER_ID = process.env.MARKETPLACE_CANISTER_ID || '';

let agent: HttpAgent | null = null;
let marketplaceActor: _SERVICE | null = null;

export async function getICAgent(): Promise<HttpAgent> {
  if (!agent) {
    agent = new HttpAgent({ 
      host: IC_HOST,
      verifyQuerySignatures: false // Set to true in production
    });
    
    // In development, we don't need to fetch the root key
    if (IC_HOST.includes('localhost')) {
      await agent.fetchRootKey();
    }
  }
  return agent;
}

export async function getMarketplaceActor(): Promise<_SERVICE> {
  if (!marketplaceActor) {
    const agent = await getICAgent();
    const canisterId = Principal.fromText(MARKETPLACE_CANISTER_ID);

    marketplaceActor = Actor.createActor(idlFactory, {
      agent,
      canisterId,
    });
  }
  return marketplaceActor;
}

// Helper function to create a real actor with IDL
export async function createActorWithIDL<T>(
  canisterId: string,
  idlFactory: any
): Promise<T> {
  const agent = await getICAgent();
  const principal = Principal.fromText(canisterId);
  return Actor.createActor(idlFactory, { agent, canisterId: principal });
}

// Environment variables validation
export function validateMarketplaceConfig(): void {
  if (!process.env.MARKETPLACE_CANISTER_ID) {
    throw new Error('MARKETPLACE_CANISTER_ID environment variable is required');
  }
}

// Initialize IC connection
export async function initializeMarketplace(): Promise<void> {
  validateMarketplaceConfig();
  await getICAgent();
  await getMarketplaceActor();
}

// Utility functions
export function e8sToICP(e8s: bigint): number {
  return Number(e8s) / 100_000_000;
}

export function icpToE8s(icp: number): bigint {
  return BigInt(Math.floor(icp * 100_000_000));
}

export function formatICP(amount: bigint): string {
  const icp = e8sToICP(amount);
  return icp.toFixed(2) + ' ICP';
}

// Error handling helper
export function handleApiError(error: any): string {
  if (typeof error === 'object' && error !== null) {
    if ('err' in error) {
      const err = error.err;
      if (typeof err === 'object') {
        if ('NotFound' in err) return `Not found: ${err.NotFound}`;
        if ('AlreadyExists' in err) return `Already exists: ${err.AlreadyExists}`;
        if ('InvalidInput' in err) return `Invalid input: ${err.InvalidInput}`;
        if ('Unauthorized' in err) return `Unauthorized: ${err.Unauthorized}`;
        if ('PaymentFailed' in err) return `Payment failed: ${err.PaymentFailed}`;
        if ('InsufficientFunds' in err) return 'Insufficient funds';
        if ('LedgerError' in err) return `Ledger error: ${err.LedgerError}`;
        if ('StageNotApproved' in err) return 'Stage not approved';
        if ('BookingNotFunded' in err) return 'Booking not funded';
        if ('InvalidStatus' in err) return `Invalid status: ${err.InvalidStatus}`;
      }
    }
  }
  return 'Unknown error occurred';
}

