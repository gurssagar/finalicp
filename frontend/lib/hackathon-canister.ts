import { getHackathonAgent } from './hackathon-agent';
import { CreateHackathonRequest, CreateParticipantRequest, CreateTeamRequest, CreateRegistrationRequest, Hackathon, Participant, Team, Registration } from './hackathon-agent';

export class HackathonCanister {
  // HACKATHON CRUD OPERATIONS
  static async createHackathon(request: CreateHackathonRequest): Promise<Hackathon> {
    try {
      const agent = await getHackathonAgent();

      // Transform the request to match canister expected format
      const transformedRequest = {
        ...request,
        mode: this.transformModeToVariant(request.mode),
      };

      console.log('Transformed request:', transformedRequest);

      const result = await (agent as any).createHackathon(transformedRequest);

      if (result.ok) {
        return result.ok;
      } else {
        throw new Error(result.err);
      }
    } catch (error) {
      console.error('Error creating hackathon:', error);
      throw error;
    }
  }

  private static transformModeToVariant(mode: string): { Online: null } | { Offline: null } | { Hybrid: null } {
    switch (mode) {
      case 'Online':
        return { Online: null };
      case 'Offline':
        return { Offline: null };
      case 'Hybrid':
        return { Hybrid: null };
      default:
        return { Online: null };
    }
  }

  static async getHackathonById(hackathonId: string): Promise<Hackathon> {
    try {
      const agent = await getHackathonAgent();
      const result = await (agent as any).getHackathonById(hackathonId);

      if (result.ok) {
        return result.ok;
      } else {
        throw new Error(result.err);
      }
    } catch (error) {
      console.error('Error getting hackathon:', error);
      throw error;
    }
  }

  static async updateHackathon(hackathonId: string, updatedData: Hackathon): Promise<Hackathon> {
    try {
      const agent = await getHackathonAgent();
      const result = await (agent as any).updateHackathon(hackathonId, updatedData);

      if (result.ok) {
        return result.ok;
      } else {
        throw new Error(result.err);
      }
    } catch (error) {
      console.error('Error updating hackathon:', error);
      throw error;
    }
  }

  static async deleteHackathon(hackathonId: string): Promise<string> {
    try {
      const agent = await getHackathonAgent();
      const result = await (agent as any).deleteHackathon(hackathonId);

      if (result.ok) {
        return result.ok;
      } else {
        throw new Error(result.err);
      }
    } catch (error) {
      console.error('Error deleting hackathon:', error);
      throw error;
    }
  }

  static async listHackathons(limit: number = 10, offset: number = 0): Promise<Hackathon[]> {
    try {
      const agent = await getHackathonAgent();
      const result = await (agent as any).listHackathons(limit, offset);

      // The new canister returns arrays directly, not Result types
      return result || [];
    } catch (error) {
      console.error('Error listing hackathons:', error);
      throw error;
    }
  }

  // PARTICIPANT CRUD OPERATIONS
  static async createParticipant(request: CreateParticipantRequest): Promise<Participant> {
    try {
      const agent = await getHackathonAgent();
      const result = await (agent as any).createParticipant(request);

      if (result.ok) {
        return result.ok;
      } else {
        throw new Error(result.err);
      }
    } catch (error) {
      console.error('Error creating participant:', error);
      throw error;
    }
  }

  static async getParticipantById(participantId: string): Promise<Participant> {
    try {
      const agent = await getHackathonAgent();
      const result = await (agent as any).getParticipantById(participantId);

      if (result.ok) {
        return result.ok;
      } else {
        throw new Error(result.err);
      }
    } catch (error) {
      console.error('Error getting participant:', error);
      throw error;
    }
  }

  static async updateParticipant(participantId: string, updatedData: Participant): Promise<Participant> {
    try {
      const agent = await getHackathonAgent();
      const result = await (agent as any).updateParticipant(participantId, updatedData);

      if (result.ok) {
        return result.ok;
      } else {
        throw new Error(result.err);
      }
    } catch (error) {
      console.error('Error updating participant:', error);
      throw error;
    }
  }

  static async deleteParticipant(participantId: string): Promise<string> {
    try {
      const agent = await getHackathonAgent();
      const result = await (agent as any).deleteParticipant(participantId);

      if (result.ok) {
        return result.ok;
      } else {
        throw new Error(result.err);
      }
    } catch (error) {
      console.error('Error deleting participant:', error);
      throw error;
    }
  }

  static async listParticipants(limit: number = 10, offset: number = 0): Promise<Participant[]> {
    try {
      const agent = await getHackathonAgent();
      const result = await (agent as any).listParticipants(limit, offset);

      if (result.ok) {
        return result.ok;
      } else {
        throw new Error(result.err);
      }
    } catch (error) {
      console.error('Error listing participants:', error);
      throw error;
    }
  }

  // TEAM CRUD OPERATIONS
  static async createTeam(request: CreateTeamRequest): Promise<Team> {
    try {
      const agent = await getHackathonAgent();
      const result = await (agent as any).createTeam(request);

      if (result.ok) {
        return result.ok;
      } else {
        throw new Error(result.err);
      }
    } catch (error) {
      console.error('Error creating team:', error);
      throw error;
    }
  }

  static async getTeamById(teamId: string): Promise<Team> {
    try {
      const agent = await getHackathonAgent();
      const result = await (agent as any).getTeamById(teamId);

      if (result.ok) {
        return result.ok;
      } else {
        throw new Error(result.err);
      }
    } catch (error) {
      console.error('Error getting team:', error);
      throw error;
    }
  }

  static async listTeams(hackathonId: string | null = null, limit: number = 10, offset: number = 0): Promise<Team[]> {
    try {
      const agent = await getHackathonAgent();
      const result = await (agent as any).listTeams(hackathonId, limit, offset);

      if (result.ok) {
        return result.ok;
      } else {
        throw new Error(result.err);
      }
    } catch (error) {
      console.error('Error listing teams:', error);
      throw error;
    }
  }

  // REGISTRATION CRUD OPERATIONS
  static async createRegistration(request: CreateRegistrationRequest): Promise<Registration> {
    try {
      const agent = await getHackathonAgent();
      const result = await (agent as any).createRegistration(request);

      if (result.ok) {
        return result.ok;
      } else {
        throw new Error(result.err);
      }
    } catch (error) {
      console.error('Error creating registration:', error);
      throw error;
    }
  }

  static async getRegistrationById(registrationId: string): Promise<Registration> {
    try {
      const agent = await getHackathonAgent();
      const result = await (agent as any).getRegistrationById(registrationId);

      if (result.ok) {
        return result.ok;
      } else {
        throw new Error(result.err);
      }
    } catch (error) {
      console.error('Error getting registration:', error);
      throw error;
    }
  }

  static async updateRegistrationStatus(registrationId: string, status: any): Promise<Registration> {
    try {
      const agent = await getHackathonAgent();
      const result = await (agent as any).updateRegistrationStatus(registrationId, status);

      if (result.ok) {
        return result.ok;
      } else {
        throw new Error(result.err);
      }
    } catch (error) {
      console.error('Error updating registration status:', error);
      throw error;
    }
  }

  static async listRegistrations(hackathonId: string | null = null, limit: number = 10, offset: number = 0): Promise<Registration[]> {
    try {
      const agent = await getHackathonAgent();
      const result = await (agent as any).listRegistrations(hackathonId, limit, offset);

      if (result.ok) {
        return result.ok;
      } else {
        throw new Error(result.err);
      }
    } catch (error) {
      console.error('Error listing registrations:', error);
      throw error;
    }
  }

  // UTILITY FUNCTIONS
  static async getHackathonStats(): Promise<{
    total_hackathons: number;
    upcoming_hackathons: number;
    ongoing_hackathons: number;
    completed_hackathons: number;
  }> {
    try {
      const agent = await getHackathonAgent();
      const result = await (agent as any).getHackathonStats();

      if (result.ok) {
        return result.ok;
      } else {
        throw new Error(result.err);
      }
    } catch (error) {
      console.error('Error getting hackathon stats:', error);
      throw error;
    }
  }

  static async getParticipantStats(): Promise<{
    total_participants: number;
    total_teams: number;
    total_registrations: number;
  }> {
    try {
      const agent = await getHackathonAgent();
      const result = await (agent as any).getParticipantStats();

      if (result.ok) {
        return result.ok;
      } else {
        throw new Error(result.err);
      }
    } catch (error) {
      console.error('Error getting participant stats:', error);
      throw error;
    }
  }

  // USER-SPECIFIC OPERATIONS
  static async getHackathonsByOrganizer(
    organizerId: string,
    limit: number = 10,
    offset: number = 0,
    status?: string
  ): Promise<Hackathon[]> {
    try {
      const agent = await getHackathonAgent();
      const result = await (agent as any).getHackathonsByOrganizer(organizerId, limit, offset, status || '');

      // The new canister returns arrays directly, not Result types
      return result || [];
    } catch (error) {
      console.error('Error getting hackathons by organizer:', error);

      // Fallback to mock data when canister is not available
      if (error instanceof Error && error.message.includes('fetch failed')) {
        console.log('Returning mock hackathon data due to canister unavailability');
        return this.getMockHackathons(organizerId, limit, offset, status);
      }

      throw error;
    }
  }

  static async updateHackathonStatus(
    hackathonId: string,
    status: string,
    organizerId: string
  ): Promise<Hackathon> {
    try {
      const agent = await getHackathonAgent();
      const result = await (agent as any).updateHackathonStatus(hackathonId, status, organizerId);

      // The new canister returns values directly, not Result types
      return result || null;
    } catch (error) {
      console.error('Error updating hackathon status:', error);
      throw error;
    }
  }

  static async deleteHackathonAsOrganizer(
    hackathonId: string,
    organizerId: string
  ): Promise<string> {
    try {
      const agent = await getHackathonAgent();
      const result = await (agent as any).deleteHackathonAsOrganizer(hackathonId, organizerId);

      // The new canister returns values directly, not Result types
      return result || 'Hackathon deleted';
    } catch (error) {
      console.error('Error deleting hackathon as organizer:', error);
      throw error;
    }
  }

  static async duplicateHackathon(
    hackathonId: string,
    organizerId: string
  ): Promise<Hackathon> {
    try {
      const agent = await getHackathonAgent();
      const result = await (agent as any).duplicateHackathon(hackathonId, organizerId);

      // The new canister returns values directly, not Result types
      return result || null;
    } catch (error) {
      console.error('Error duplicating hackathon:', error);
      throw error;
    }
  }

  // Mock data method for development/testing when canister is not available
  private static getMockHackathons(
    organizerId: string,
    limit: number = 10,
    offset: number = 0,
    status?: string
  ): Hackathon[] {
    const mockHackathons: Hackathon[] = [
      {
        hackathon_id: 'HK-001',
        title: 'AI Innovation Challenge 2024',
        tagline: 'Build the future with AI',
        description: 'A 48-hour hackathon focused on artificial intelligence and machine learning innovations.',
        theme: 'Artificial Intelligence',
        mode: 'Online',
        location: 'Virtual',
        start_date: '2024-12-15T09:00:00Z',
        end_date: '2024-12-17T09:00:00Z',
        registration_start: '2024-11-01T00:00:00Z',
        registration_end: '2024-12-10T23:59:59Z',
        min_team_size: 2,
        max_team_size: 5,
        prize_pool: '$10,000',
        rules: 'Teams must build original AI solutions. All code must be open source.',
        status: 'Upcoming',
        created_at: '2024-10-20T10:00:00Z',
        updated_at: '2024-10-20T10:00:00Z'
      },
      {
        hackathon_id: 'HK-002',
        title: 'Web3 DeFi Hackathon',
        tagline: 'Decentralized Finance Revolution',
        description: 'Create innovative DeFi solutions using blockchain technology and smart contracts.',
        theme: 'Blockchain & DeFi',
        mode: 'Hybrid',
        location: 'San Francisco + Virtual',
        start_date: '2024-11-20T10:00:00Z',
        end_date: '2024-11-22T18:00:00Z',
        registration_start: '2024-10-15T00:00:00Z',
        registration_end: '2024-11-15T23:59:59Z',
        min_team_size: 3,
        max_team_size: 6,
        prize_pool: '$15,000',
        rules: 'Build on Ethereum or compatible chains. Smart contracts must be audited.',
        status: 'Ongoing',
        created_at: '2024-09-15T14:30:00Z',
        updated_at: '2024-10-18T09:15:00Z'
      },
      {
        hackathon_id: 'HK-003',
        title: 'Sustainability Tech Challenge',
        tagline: 'Code for a better planet',
        description: 'Develop technological solutions for environmental sustainability and climate change.',
        theme: 'Sustainability & Climate Tech',
        mode: 'Offline',
        location: 'New York',
        start_date: '2024-10-01T09:00:00Z',
        end_date: '2024-10-03T18:00:00Z',
        registration_start: '2024-08-01T00:00:00Z',
        registration_end: '2024-09-25T23:59:59Z',
        min_team_size: 1,
        max_team_size: 4,
        prize_pool: '$7,500',
        rules: 'Projects must address environmental challenges. Focus on practical solutions.',
        status: 'Completed',
        created_at: '2024-07-20T11:00:00Z',
        updated_at: '2024-10-05T16:45:00Z'
      }
    ];

    // Filter by status if provided
    let filtered = mockHackathons;
    if (status && status !== '') {
      filtered = mockHackathons.filter(h => h.status.toLowerCase() === status.toLowerCase());
    }

    // Apply pagination
    const paginated = filtered.slice(offset, offset + limit);

    return paginated;
  }
}