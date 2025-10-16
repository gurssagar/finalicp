'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '../../components/Sidebar';
import { Header } from '../../components/Header1';
import { ProjectCard } from '../../components/project/ProjectCard';
import { ChevronLeft, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

// TypeScript interfaces
interface Project {
  id: number;
  name: string;
  description: string;
  image: string;
  hackathon: string;
  tags: string[];
  status: 'Live' | 'Voting' | 'Completed' | 'Draft';
  daysLeft: string;
  teamLeader: string;
}

interface SubmittedProjectsPageProps {
  className?: string;
}

// Static data moved outside component for better performance
const mockProjects: Project[] = [
  {
    id: 1,
    name: 'Openwave',
    description: 'Openwave is a decentralized platform rewarding GitHub contributions with crypto, enabling bounties, transparent tracking.',
    image: "/screencapture-hackquest-io-projects-VietBUIDL-Hackathon-Openwave-2025-10-15-15_06_33.png",
    hackathon: 'VietBUIDL Hackathon',
    tags: ['DeFi', 'SocialFi', 'AI'],
    status: 'Live',
    daysLeft: '3 days left',
    teamLeader: 'Lovepreet Singh'
  },
  {
    id: 2,
    name: 'Dunk Verse',
    description: 'A Mobile Dapp which offers AI-Driven Quizzes, NFT-Powered Social Media, and Blockchain Gaming.',
    image: "/screencapture-hackquest-io-projects-VietBUIDL-Hackathon-Openwave-2025-10-15-15_06_53.png",
    hackathon: 'VietBUIDL Hackathon',
    tags: ['GameFi', 'NFT', 'SocialFi', 'AI'],
    status: 'Voting',
    daysLeft: '5 days left',
    teamLeader: 'Amaan Sayyad'
  },
  {
    id: 3,
    name: 'SafeSend',
    description: 'Secure and authenticated transfers of Ether, Erc20 NFTs, and SCROM tokens, relief from phishing scams.',
    image: "/screencapture-hackquest-io-projects-VietBUIDL-Hackathon-Openwave-2025-10-15-15_07_08.png",
    hackathon: 'VietBUIDL Hackathon',
    tags: ['DeFi', 'Other'],
    status: 'Live',
    daysLeft: '3 days left',
    teamLeader: 'andreou00'
  }
];

export default function SubmittedProjectsPage({ className }: SubmittedProjectsPageProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter projects based on search query
  const filteredProjects = mockProjects.filter(project => 
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    project.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
    project.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Navigation handlers
  const handleBack = () => {
    router.push('/hackathons');
  };

  const handleProjectClick = (id: number) => {
    router.push(`/project-detail/${id}`);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className={cn("flex min-h-screen bg-white", className)}>
      {/* Sidebar */}
      

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-4 md:p-6" role="main">
          <div className="max-w-7xl mx-auto">
            {/* Back button */}
            <button 
              onClick={handleBack} 
              className={cn(
                "flex items-center text-gray-600 hover:text-gray-900 mb-6",
                "transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md p-1"
              )}
              aria-label="Go back to hackathons page"
            >
              <ChevronLeft size={16} className="mr-1" />
              <span>Back to Hackathons</span>
            </button>

            {/* Header section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Submitted Projects</h1>
                <p className="text-gray-600 mt-1">
                  View and manage your submitted hackathon projects
                </p>
              </div>

              {/* Search input */}
              <div className="relative w-full md:w-auto">
                <label htmlFor="project-search" className="sr-only">
                  Search projects
                </label>
                <input 
                  id="project-search"
                  type="text" 
                  placeholder="Search projects..." 
                  className={cn(
                    "pl-10 pr-4 py-2 w-full md:w-80 border border-gray-300 rounded-lg",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                    "transition-all duration-200 shadow-sm hover:shadow-md"
                  )}
                  value={searchQuery} 
                  onChange={handleSearchChange}
                  aria-describedby="search-description"
                />
                <Search 
                  className="absolute left-3 top-2.5 text-gray-400 pointer-events-none" 
                  size={18} 
                  aria-hidden="true"
                />
                <div id="search-description" className="sr-only">
                  Search by project name, description, or tags
                </div>
              </div>
            </div>

            {/* Projects list */}
            <div className="grid grid-cols-1 gap-6" role="list" aria-label="Submitted projects">
              {filteredProjects.map(project => (
                <div key={project.id} role="listitem">
                  <ProjectCard 
                    project={project} 
                    onClick={() => handleProjectClick(project.id)}
                  />
                 
                </div>
              ))}

              {/* Empty state */}
              {filteredProjects.length === 0 && (
                <div className={cn(
                  "text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200",
                  "transition-all duration-200 hover:bg-gray-100"
                )}>
                  <div className="w-32 h-32 mx-auto mb-4 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Search size={48} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No projects found
                  </h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    {searchQuery 
                      ? `No projects match "${searchQuery}". Try adjusting your search criteria.`
                      : "You haven't submitted any projects yet. Start by joining a hackathon!"
                    }
                  </p>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className={cn(
                        "mt-4 px-4 py-2 text-blue-600 hover:text-blue-800",
                        "border border-blue-200 hover:border-blue-300 rounded-lg",
                        "transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      )}
                    >
                      Clear search
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Results summary */}
            {filteredProjects.length > 0 && (
              <div className="mt-8 text-center text-sm text-gray-500" aria-live="polite">
                Showing {filteredProjects.length} of {mockProjects.length} projects
                {searchQuery && ` matching "${searchQuery}"`}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}