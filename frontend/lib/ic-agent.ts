import { Actor, HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { idlFactory } from './declarations/user/user.did.js';

// Type imports from generated declarations
type _SERVICE = any;

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  isVerified: boolean;
  createdAt: number;
  lastLoginAt: number | null;
  profile: ProfileData | null;
  otpData: OTPData | null;
}

export interface ProfileData {
  firstName: string;
  lastName: string;
  bio: string | null;
  phone: string | null;
  location: string | null;
  website: string | null;
  linkedin: string | null;
  github: string | null;
  twitter: string | null;
  profileImageUrl: string | null;
  resumeUrl: string | null;
  skills: string[];
  experience: Experience[];
  education: Education[];
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string | null;
  description: string | null;
  current: boolean;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string | null;
  gpa: string | null;
  description: string | null;
}

export interface OTPData {
  code: string;
  expiresAt: number;
  attempts: number;
}

// IC Agent configuration
const IC_HOST = process.env.IC_HOST || 'http://localhost:4943';
const USER_CANISTER_ID = process.env.USER_CANISTER_ID || '';

let agent: HttpAgent | null = null;
let userActor: _SERVICE | null = null;

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

export async function getUserActor(): Promise<_SERVICE> {
  if (!userActor) {
    const agent = await getICAgent();
    const canisterId = Principal.fromText(USER_CANISTER_ID);

    userActor = Actor.createActor(idlFactory, {
      agent,
      canisterId,
    });
  }
  return userActor;
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
export function validateICConfig(): void {
  if (!process.env.USER_CANISTER_ID) {
    throw new Error('USER_CANISTER_ID environment variable is required');
  }
}

// Initialize IC connection
export async function initializeIC(): Promise<void> {
  validateICConfig();
  await getICAgent();
  await getUserActor();
}
