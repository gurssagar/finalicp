'use client';
import React, { useState } from 'react';
import { ChevronDown, Filter, Search, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Header } from '../../components/Header1';
import { Sidebar } from '../../components/Sidebar';
import { HackathonCard } from '../../components/hackathon/HackathonCard';
import { FeaturedHackathon } from '../../components/hackathon/FeaturedHackathon';
import { cn } from '@/lib/utils';

// TypeScript interfaces
interface Hackathon {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  prizePool: string;
  date: string;
  registrationDays?: number;
  image: string;
  tags: string[];
  mode?: string;
  isLive?: boolean;
  isVoting?: boolean;
  isEnded?: boolean;
  techStack: string;
  level: string;
}

interface FeaturedHackathonData {
  title: string;
  subtitle: string;
  prizePool: string;
  registrationDays: number;
  techStack: string;
  level: string;
  bannerImage: string;
}

interface HackathonsPageProps {
  className?: string;
}

// Categories array moved outside component for better performance
const categories = ['All Events', 'Open Registration', 'Upcoming', 'Ongoing', 'Completed'] as const;

export default function HackathonsPage({ className }: HackathonsPageProps) {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<typeof categories[number]>('Open Registration');
  const [searchQuery, setSearchQuery] = useState('');

  // Featured hackathon data
  const featuredHackathon: FeaturedHackathonData = {
    title: 'Open Source Frontier',
    subtitle: 'AI x WEB3 xTransparency',
    prizePool: '$50,000 USD',
    registrationDays: 12,
    techStack: 'All tech stacks',
    level: 'All levels accepted',
    bannerImage: "/01-1-All-hackatons.png"
  };

  // Hackathon data
  const hackathons: Hackathon[] = [
    {
      id: 1,
      title: 'ChainSpark Hackathon',
      subtitle: 'DeFi Builders Edition',
      description: 'Focus on building secure, auditable smart contracts and identifying vulnerabilities in existing protocols. Help make Web3 safer for everyone.',
      prizePool: '$38,000',
      date: 'OCTOBER 12-16, 2024',
      registrationDays: 12,
      image: "/01-2-One-hackathon.png",
      tags: ['Smart Contracts', 'Financial Inclusion'],
      mode: 'Online',
      isLive: true,
      techStack: 'All tech stack',
      level: 'All levels accepted'
    },
    {
      id: 2,
      title: 'Web3 Innovate Jam',
      subtitle: 'AI & Blockchain Edition',
      description: 'Combine the power of AI and blockchain to create innovative solutions for real-world problems.',
      prizePool: '$30,000',
      date: 'MAY 10-12, 2024',
      registrationDays: 8,
      image: "/01-8-More-Info.png",
      tags: ['AI', 'Blockchain'],
      mode: 'Virtual',
      isVoting: true,
      techStack: 'All tech stack',
      level: 'All levels accepted'
    },
    {
      id: 3,
      title: 'Coindora Hackfest',
      subtitle: 'ASTRAL COSMOS CHALLENGE',
      description: 'Build the next generation of decentralized applications for the cosmos ecosystem.',
      prizePool: '$35,000',
      date: 'SEPTEMBER 5-9, 2024',
      registrationDays: 7,
      image: "/01-5-Prize-Judge.png",
      tags: ['Cosmos', 'DeFi'],
      mode: 'Virtual',
      isVoting: true,
      techStack: 'All tech stack',
      level: 'All levels accepted'
    },
    {
      id: 4,
      title: 'Cryptovate Hack',
      subtitle: 'DIGITAL IDENTITY SPRINT',
      description: 'Secure Credentials & Reputation systems for the decentralized web.',
      prizePool: '$37,500',
      date: 'DECEMBER 1-5, 2024',
      registrationDays: 8,
      image: "/01-6-Schedule.png",
      tags: ['Identity', 'Security'],
      mode: 'Virtual',
      isLive: true,
      techStack: 'All tech stack',
      level: 'All levels accepted'
    }
  ];

  // Past hackathons
  const pastHackathons: Hackathon[] = [
    {
      id: 5,
      title: 'Ledgerforge Hackathon',
      subtitle: 'CHAIN SECURITY LAB',
      description: 'Focus on blockchain security and auditing tools.',
      prizePool: '$41,000',
      date: 'January 12-16, 2024',
      image: "/01-8-More-Info.png",
      tags: ['Security', 'Auditing'],
      isEnded: true,
      techStack: 'All tech stack',
      level: 'All levels accepted'
    },
    {
      id: 6,
      title: 'MetaMask Card Dev Cook-Off',
      subtitle: 'Web3 Card Edition',
      description: 'Build innovative applications for the MetaMask Card ecosystem.',
      prizePool: '$40,000',
      date: 'February 5-10, 2024',
      image: "/01-5-Prize-Judge.png",
      tags: ['MetaMask', 'Payments'],
      isEnded: true,
      techStack: 'All tech stack',
      level: 'All levels accepted'
    }
  ];

  const handleHostHackathon = () => {
    router.push('/create-hackathon');
  };

  const handleHackathonClick = (id: number) => {
    router.push(`/hackathon-detail/${id}`);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterClick = () => {
    // In a real implementation, this would open a filter modal or dropdown
    console.log('Filter clicked');
  };

  return (
    <div className={cn("flex min-h-screen bg-white", className)}>
      {/* Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header section with title and host button */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold mb-1 text-gray-900">
                  Explore Hackathons
                </h1>
                <p className="text-gray-600">
                  Join exciting hackathons, build projects, and win prizes
                </p>
              </div>
              <button 
                onClick={handleHostHackathon} 
                className="hidden md:flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label="Host a new hackathon"
                type="button"
              >
                <Plus size={18} />
                <span>Host a Hackathon</span>
              </button>
            </div>

            {/* Featured Hackathon */}
            <FeaturedHackathon hackathon={featuredHackathon} />

            {/* Filter and Search Section */}
            <div className="mb-8 mt-10">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                {/* Categories */}
                <div className="flex overflow-x-auto pb-2 gap-2" role="tablist" aria-label="Hackathon categories">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={cn(
                        "px-4 py-2 rounded-full whitespace-nowrap transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1",
                        selectedCategory === category
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      )}
                      role="tab"
                      aria-selected={selectedCategory === category}
                      aria-controls={`${category.toLowerCase().replace(' ', '-')}-panel`}
                      type="button"
                    >
                      {category}
                    </button>
                  ))}
                </div>

                {/* Search and filter */}
                <div className="flex gap-2">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search hackathons..."
                      value={searchQuery}
                      onChange={handleSearchChange}
                      className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                      aria-label="Search hackathons"
                    />
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                  </div>
                  <button 
                    onClick={handleFilterClick}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                    aria-label="Open filter options"
                    type="button"
                  >
                    <Filter size={18} className="text-gray-500" />
                  </button>
                </div>
              </div>
            </div>

            {/* Active Hackathons */}
            <section className="mb-12">
              <h2 className="text-xl font-bold mb-6 text-gray-900">Active Hackathons</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {hackathons.map((hackathon) => (
                  <HackathonCard
                    key={hackathon.id}
                    hackathon={hackathon}
                    onClick={() => handleHackathonClick(hackathon.id)}
                  />
                ))}
              </div>
            </section>

            {/* Past Hackathons */}
            <section>
              <h2 className="text-xl font-bold mb-6 text-gray-900">Past Hackathons</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pastHackathons.map((hackathon) => (
                  <HackathonCard
                    key={hackathon.id}
                    hackathon={hackathon}
                    onClick={() => handleHackathonClick(hackathon.id)}
                  />
                ))}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}