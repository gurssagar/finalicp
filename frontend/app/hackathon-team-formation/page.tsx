'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header1';
import { Sidebar } from '@/components/Sidebar';
import { ChevronLeft, Search, Plus, Users, UserPlus, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

// TypeScript interfaces
interface TeamLeader {
  name: string;
  image: string;
}

interface Team {
  id: number;
  name: string;
  description: string;
  members: number;
  maxMembers: number;
  skills: string[];
  leader: TeamLeader;
}

interface Participant {
  id: number;
  name: string;
  skills: string[];
  image: string;
  bio: string;
}

interface TeamMember {
  id: number;
  name: string;
  role: string;
  skills: string[];
  image: string;
}

interface PendingInvite {
  id: number;
  name: string;
  skills: string[];
  image: string;
}

interface MyTeam {
  name: string;
  description: string;
  members: TeamMember[];
  pendingInvites: PendingInvite[];
}

interface HackathonTeamFormationProps {
  className?: string;
}

// Extracted components
interface TeamCardProps {
  team: Team;
  onJoinRequest: (teamId: number) => void;
  onMessage: (teamId: number) => void;
}

const TeamCard: React.FC<TeamCardProps> = ({ team, onJoinRequest, onMessage }) => (
  <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200">
    <div className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <img 
            src={team.leader.image} 
            alt={team.leader.name} 
            className="w-10 h-10 rounded-full object-cover mr-3" 
          />
          <div>
            <h3 className="font-bold">{team.name}</h3>
            <p className="text-sm text-gray-600">
              Led by {team.leader.name}
            </p>
          </div>
        </div>
        <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
          {team.members}/{team.maxMembers} Members
        </div>
      </div>
      <p className="text-gray-700 text-sm mb-4">
        {team.description}
      </p>
      <div className="mb-4">
        <p className="text-xs text-gray-500 mb-2">
          LOOKING FOR SKILLS:
        </p>
        <div className="flex flex-wrap gap-2">
          {team.skills.map((skill, index) => (
            <span 
              key={index} 
              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
      <div className="flex space-x-2">
        <button 
          onClick={() => onJoinRequest(team.id)}
          className="flex-1 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-md font-medium hover:opacity-90 text-sm flex items-center justify-center transition-opacity duration-200"
          aria-label={`Request to join ${team.name}`}
        >
          <UserPlus size={16} className="mr-1" />
          Request to Join
        </button>
        <button 
          onClick={() => onMessage(team.id)}
          className="px-3 py-2 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors duration-200"
          aria-label={`Message ${team.name}`}
        >
          <MessageSquare size={16} />
        </button>
      </div>
    </div>
  </div>
);

interface ParticipantCardProps {
  participant: Participant;
  onInvite: (participantId: number) => void;
  onMessage: (participantId: number) => void;
}

const ParticipantCard: React.FC<ParticipantCardProps> = ({ participant, onInvite, onMessage }) => (
  <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200">
    <div className="p-6">
      <div className="flex items-center mb-4">
        <img 
          src={participant.image} 
          alt={participant.name} 
          className="w-12 h-12 rounded-full object-cover mr-3" 
        />
        <div>
          <h3 className="font-bold">{participant.name}</h3>
        </div>
      </div>
      <p className="text-gray-700 text-sm mb-4">
        {participant.bio}
      </p>
      <div className="mb-4">
        <p className="text-xs text-gray-500 mb-2">SKILLS:</p>
        <div className="flex flex-wrap gap-2">
          {participant.skills.map((skill, index) => (
            <span 
              key={index} 
              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
      <div className="flex space-x-2">
        <button 
          onClick={() => onInvite(participant.id)}
          className="flex-1 py-2 border border-purple-500 text-purple-600 rounded-md font-medium hover:bg-purple-50 text-sm flex items-center justify-center transition-colors duration-200"
          aria-label={`Invite ${participant.name} to team`}
        >
          <UserPlus size={16} className="mr-1" />
          Invite to Team
        </button>
        <button 
          onClick={() => onMessage(participant.id)}
          className="px-3 py-2 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors duration-200"
          aria-label={`Message ${participant.name}`}
        >
          <MessageSquare size={16} />
        </button>
      </div>
    </div>
  </div>
);

// Move static data outside component for better performance
const teams: Team[] = [
  {
    id: 1,
    name: 'BlockSecurity',
    description: 'Looking for blockchain experts to build a security audit tool',
    members: 3,
    maxMembers: 5,
    skills: ['Smart Contracts', 'Solidity', 'Security'],
    leader: {
      name: 'Alex Johnson',
      image: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=100&auto=format&fit=crop'
    }
  },
  {
    id: 2,
    name: 'Web3 Guardians',
    description: 'Building a user-friendly security dashboard for DeFi protocols',
    members: 2,
    maxMembers: 4,
    skills: ['React', 'UI/UX', 'DeFi'],
    leader: {
      name: 'Sarah Chen',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop'
    }
  },
  {
    id: 3,
    name: 'Secure Chain',
    description: 'Developing a new approach to smart contract verification',
    members: 4,
    maxMembers: 5,
    skills: ['Rust', 'Cryptography', 'Blockchain'],
    leader: {
      name: 'Michael Rodriguez',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop'
    }
  }
];

const participants: Participant[] = [
  {
    id: 1,
    name: 'Emma Wilson',
    skills: ['JavaScript', 'React', 'Node.js'],
    image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=100&auto=format&fit=crop',
    bio: 'Frontend developer with 3 years of experience in React'
  },
  {
    id: 2,
    name: 'David Kim',
    skills: ['Solidity', 'Smart Contracts', 'Ethereum'],
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=100&auto=format&fit=crop',
    bio: 'Blockchain developer specializing in Ethereum smart contracts'
  },
  {
    id: 3,
    name: 'Priya Patel',
    skills: ['UI/UX Design', 'Figma', 'Product Design'],
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop',
    bio: 'Product designer with a focus on blockchain applications'
  },
  {
    id: 4,
    name: 'James Lee',
    skills: ['Python', 'Machine Learning', 'Data Analysis'],
    image: 'https://images.unsplash.com/photo-1504257432389-52343af06ae3?q=80&w=100&auto=format&fit=crop',
    bio: 'ML engineer interested in applying AI to blockchain security'
  }
];

const myTeam: MyTeam = {
  name: 'CryptoDefenders',
  description: 'Building tools to detect and prevent smart contract vulnerabilities',
  members: [
    {
      id: 1,
      name: 'You',
      role: 'Team Leader',
      skills: ['JavaScript', 'React', 'Web3'],
      image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=100&auto=format&fit=crop'
    },
    {
      id: 2,
      name: 'Alice Brown',
      role: 'Smart Contract Developer',
      skills: ['Solidity', 'Ethereum', 'Security'],
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=100&auto=format&fit=crop'
    }
  ],
  pendingInvites: [
    {
      id: 3,
      name: 'John Smith',
      skills: ['Backend', 'Node.js', 'API Design'],
      image: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=100&auto=format&fit=crop'
    }
  ]
};

export default function HackathonTeamFormation({ className }: HackathonTeamFormationProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'find' | 'participants' | 'myteam'>('find');
  const [searchQuery, setSearchQuery] = useState('');

  // Event handlers
  const handleBackNavigation = () => {
    router.push('/hackathon-registration-confirmation');
  };

  const handleJoinRequest = (teamId: number) => {
    console.log('Join request for team:', teamId);
    // Implement join request logic
  };

  const handleMessage = (id: number) => {
    console.log('Message:', id);
    // Implement messaging logic
  };

  const handleInvite = (participantId: number) => {
    console.log('Invite participant:', participantId);
    // Implement invite logic
  };

  const handleCreateTeam = () => {
    console.log('Create new team');
    // Implement create team logic
  };

  const handleSendMessage = (message: string) => {
    console.log('Send message:', message);
    // Implement send message logic
  };

  return (
    <div className={cn("flex min-h-screen bg-white", className)}>
      {/* Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Header showSearch={false} />
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <button 
                onClick={handleBackNavigation}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
                aria-label="Back to Registration"
              >
                <ChevronLeft size={16} className="mr-1" />
                <span>Back to Registration</span>
              </button>
              <h1 className="text-2xl font-bold mt-4">
                Web3 Security Challenge Team Formation
              </h1>
              <p className="text-gray-600">
                Find a team or create your own for the hackathon
              </p>
            </div>
            
            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6" role="tablist">
              <button 
                onClick={() => setActiveTab('find')} 
                className={cn(
                  "py-3 px-4 relative transition-colors duration-200",
                  activeTab === 'find' 
                    ? 'text-black font-medium' 
                    : 'text-gray-500 hover:text-gray-700'
                )}
                role="tab"
                aria-selected={activeTab === 'find'}
                aria-controls="find-panel"
              >
                Find a Team
                {activeTab === 'find' && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500"></div>
                )}
              </button>
              <button 
                onClick={() => setActiveTab('participants')} 
                className={cn(
                  "py-3 px-4 relative transition-colors duration-200",
                  activeTab === 'participants' 
                    ? 'text-black font-medium' 
                    : 'text-gray-500 hover:text-gray-700'
                )}
                role="tab"
                aria-selected={activeTab === 'participants'}
                aria-controls="participants-panel"
              >
                Find Participants
                {activeTab === 'participants' && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500"></div>
                )}
              </button>
              <button 
                onClick={() => setActiveTab('myteam')} 
                className={cn(
                  "py-3 px-4 relative transition-colors duration-200",
                  activeTab === 'myteam' 
                    ? 'text-black font-medium' 
                    : 'text-gray-500 hover:text-gray-700'
                )}
                role="tab"
                aria-selected={activeTab === 'myteam'}
                aria-controls="myteam-panel"
              >
                My Team
                {activeTab === 'myteam' && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500"></div>
                )}
              </button>
            </div>
            
            {/* Search */}
            {activeTab !== 'myteam' && (
              <div className="mb-6">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder={`Search ${activeTab === 'find' ? 'teams' : 'participants'}...`} 
                    className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    aria-label={`Search ${activeTab === 'find' ? 'teams' : 'participants'}`}
                  />
                  <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                </div>
              </div>
            )}
            
            {/* Content based on active tab */}
            {activeTab === 'find' && (
              <div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                role="tabpanel"
                id="find-panel"
                aria-labelledby="find-tab"
              >
                {/* Create Team Card */}
                <div className="border border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-center h-64 hover:border-purple-400 transition-colors duration-200">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                    <Plus size={24} className="text-purple-600" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Create a New Team</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Start your own team and invite other participants to join
                  </p>
                  <button 
                    onClick={handleCreateTeam}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
                    aria-label="Create a new team"
                  >
                    Create Team
                  </button>
                </div>
                
                {/* Team Cards */}
                {teams.map(team => (
                  <TeamCard
                    key={team.id}
                    team={team}
                    onJoinRequest={handleJoinRequest}
                    onMessage={handleMessage}
                  />
                ))}
              </div>
            )}
            
            {activeTab === 'participants' && (
              <div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                role="tabpanel"
                id="participants-panel"
                aria-labelledby="participants-tab"
              >
                {participants.map(participant => (
                  <ParticipantCard
                    key={participant.id}
                    participant={participant}
                    onInvite={handleInvite}
                    onMessage={handleMessage}
                  />
                ))}
              </div>
            )}
            
            {activeTab === 'myteam' && (
              <div 
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
                role="tabpanel"
                id="myteam-panel"
                aria-labelledby="myteam-tab"
              >
                <div className="md:col-span-2">
                  <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mb-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h2 className="text-xl font-bold">{myTeam.name}</h2>
                        <p className="text-gray-600">{myTeam.description}</p>
                      </div>
                      <button className="px-3 py-1 border border-gray-200 rounded text-sm hover:bg-gray-50">
                        Edit
                      </button>
                    </div>
                    <div className="mb-6">
                      <h3 className="font-medium mb-3 flex items-center">
                        <Users size={18} className="mr-2" />
                        Team Members ({myTeam.members.length}/5)
                      </h3>
                      <div className="space-y-3">
                        {myTeam.members.map(member => <div key={member.id} className="flex items-center justify-between border-b border-gray-100 pb-3">
                            <div className="flex items-center">
                              <img src={member.image} alt={member.name} className="w-10 h-10 rounded-full object-cover mr-3" />
                              <div>
                                <p className="font-medium">{member.name}</p>
                                <p className="text-sm text-gray-600">
                                  {member.role}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {member.skills.map((skill, index) => <span key={index} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                                  {skill}
                                </span>)}
                            </div>
                          </div>)}
                      </div>
                    </div>
                    {myTeam.pendingInvites.length > 0 && <div>
                        <h3 className="font-medium mb-3">Pending Invites</h3>
                        <div className="space-y-3">
                          {myTeam.pendingInvites.map(invite => <div key={invite.id} className="flex items-center justify-between border-b border-gray-100 pb-3">
                              <div className="flex items-center">
                                <img src={invite.image} alt={invite.name} className="w-10 h-10 rounded-full object-cover mr-3" />
                                <div>
                                  <p className="font-medium">{invite.name}</p>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {invite.skills.map((skill, index) => <span key={index} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                                        {skill}
                                      </span>)}
                                  </div>
                                </div>
                              </div>
                              <div className="text-xs text-gray-500">
                                Invited 2 hours ago
                              </div>
                            </div>)}
                        </div>
                      </div>}
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <h3 className="font-medium mb-4">Team Discussion</h3>
                    <div className="border border-gray-200 rounded-lg p-4 mb-4 max-h-60 overflow-y-auto">
                      <div className="space-y-4">
                        <div className="flex">
                          <img src={myTeam.members[0].image} alt={myTeam.members[0].name} className="w-8 h-8 rounded-full object-cover mr-2 flex-shrink-0" />
                          <div className="bg-gray-100 rounded-lg p-3 text-sm">
                            <p className="font-medium mb-1">You</p>
                            <p>
                              Welcome to the team! Let's discuss our project
                              ideas.
                            </p>
                          </div>
                        </div>
                        <div className="flex">
                          <img src={myTeam.members[1].image} alt={myTeam.members[1].name} className="w-8 h-8 rounded-full object-cover mr-2 flex-shrink-0" />
                          <div className="bg-gray-100 rounded-lg p-3 text-sm">
                            <p className="font-medium mb-1">Alice Brown</p>
                            <p>
                              I'm thinking we could focus on a tool that helps
                              audit smart contracts automatically.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex">
                      <input type="text" placeholder="Type a message..." className="flex-1 border border-gray-300 rounded-l-lg p-2" />
                      <button className="bg-blue-500 text-white px-4 rounded-r-lg">
                        Send
                      </button>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mb-6">
                    <h3 className="font-medium mb-4">Team Management</h3>
                    <div className="space-y-4">
                      <button className="w-full py-2 flex items-center justify-center gap-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <UserPlus size={16} />
                        <span>Invite Participants</span>
                      </button>
                      <button className="w-full py-2 flex items-center justify-center gap-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span>Edit Team Info</span>
                      </button>
                      <button className="w-full py-2 flex items-center justify-center gap-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 8V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span>Add Project Idea</span>
                      </button>
                    </div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <h3 className="font-medium mb-4">Important Dates</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="font-medium">Team Formation Deadline</p>
                        <p className="text-sm text-gray-600">
                          October 14, 2023
                        </p>
                      </div>
                      <div>
                        <p className="font-medium">Hackathon Kickoff</p>
                        <p className="text-sm text-gray-600">
                          October 15, 2023
                        </p>
                      </div>
                      <div>
                        <p className="font-medium">Project Submission</p>
                        <p className="text-sm text-gray-600">
                          November 15, 2023
                        </p>
                      </div>
                      <div>
                        <p className="font-medium">Results Announcement</p>
                        <p className="text-sm text-gray-600">
                          November 30, 2023
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
         
)}
