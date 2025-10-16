'use client'  
import React, { useState } from 'react'
import { Header } from '@/components/Header1'
import { Sidebar } from '@/components/Sidebar'
import { Filter, Search, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { HackathonCard } from '@/components/hackathon/HackathonCard'
import { FeaturedHackathon } from '@/components/hackathon/FeaturedHackathon'
export default function Hackathons() {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState('Open Registration')
  const categories = [
    'All Events',
    'Open Registration',
    'Upcoming',
    'Ongoing',
    'Completed',
  ]
  // Featured hackathon data
  const featuredHackathon = {
    title: 'Open Source Frontier',
    subtitle: 'AI x WEB3 xTransparency',
    prizePool: '$50,000 USD',
    registrationDays: 12,
    techStack: 'All tech stacks',
    level: 'All levels accepted',
    bannerImage:
      'https://uploadthingy.s3.us-west-1.amazonaws.com/mQYcPe5QRQZ3KZTJ6qZGJB/01-1-All-hackatons.png',
  }
  // Hackathon data
  const hackathons = [
    {
      id: 1,
      title: 'ChainSpark Hackathon',
      subtitle: 'DeFi Builders Edition',
      description:
        'Focus on building secure, auditable smart contracts and identifying vulnerabilities in existing protocols. Help make Web3 safer for everyone.',
      prizePool: '$38,000',
      date: 'OCTOBER 12-16, 2024',
      registrationDays: 12,
      image:
        'https://uploadthingy.s3.us-west-1.amazonaws.com/94PtykxWM43cqE6zT6QGKr/01-2-One-hackathon.png',
      tags: ['Smart Contracts', 'Financial Inclusion'],
      mode: 'Online',
      isLive: true,
      techStack: 'All tech stack',
      level: 'All levels accepted',
    },
    {
      id: 2,
      title: 'Web3 Innovate Jam',
      subtitle: 'AI & Blockchain Edition',
      description:
        'Combine the power of AI and blockchain to create innovative solutions for real-world problems.',
      prizePool: '$30,000',
      date: 'MAY 10-12, 2024',
      registrationDays: 8,
      image:
        'https://uploadthingy.s3.us-west-1.amazonaws.com/sLFpjAQ1GVzHK3VpgiSjYa/01-8-More-Info.png',
      tags: ['AI', 'Blockchain'],
      mode: 'Virtual',
      isVoting: true,
      techStack: 'All tech stack',
      level: 'All levels accepted',
    },
    {
      id: 3,
      title: 'Coindora Hackfest',
      subtitle: 'ASTRAL COSMOS CHALLENGE',
      description:
        'Build the next generation of decentralized applications for the cosmos ecosystem.',
      prizePool: '$35,000',
      date: 'SEPTEMBER 5-9, 2024',
      registrationDays: 7,
      image:
        'https://uploadthingy.s3.us-west-1.amazonaws.com/4DkAvkGkXjmXDRPfaWKJm4/01-5-Prize-Judge.png',
      tags: ['Cosmos', 'DeFi'],
      mode: 'Virtual',
      isVoting: true,
      techStack: 'All tech stack',
      level: 'All levels accepted',
    },
    {
      id: 4,
      title: 'Cryptovate Hack',
      subtitle: 'DIGITAL IDENTITY SPRINT',
      description:
        'Secure Credentials & Reputation systems for the decentralized web.',
      prizePool: '$37,500',
      date: 'DECEMBER 1-5, 2024',
      registrationDays: 8,
      image:
        'https://uploadthingy.s3.us-west-1.amazonaws.com/pfFBXxejtJh1ANhQLLRKzT/01-6-Schedule.png',
      tags: ['Identity', 'Security'],
      mode: 'Virtual',
      isLive: true,
      techStack: 'All tech stack',
      level: 'All levels accepted',
    },
  ]
  // Past hackathons
  const pastHackathons = [
    {
      id: 5,
      title: 'Ledgerforge Hackathon',
      subtitle: 'CHAIN SECURITY LAB',
      description: 'Focus on blockchain security and auditing tools.',
      prizePool: '$41,000',
      date: 'January 12-16, 2024',
      image:
        'https://uploadthingy.s3.us-west-1.amazonaws.com/sLFpjAQ1GVzHK3VpgiSjYa/01-8-More-Info.png',
      tags: ['Security', 'Auditing'],
      isEnded: true,
      techStack: 'All tech stack',
      level: 'All levels accepted',
    },
    {
      id: 6,
      title: 'MetaMask Card Dev Cook-Off',
      subtitle: 'Web3 Card Edition',
      description:
        'Build innovative applications for the MetaMask Card ecosystem.',
      prizePool: '$40,000',
      date: 'February 5-10, 2024',
      image:
        'https://uploadthingy.s3.us-west-1.amazonaws.com/4DkAvkGkXjmXDRPfaWKJm4/01-5-Prize-Judge.png',
      tags: ['MetaMask', 'Payments'],
      isEnded: true,
      techStack: 'All tech stack',
      level: 'All levels accepted',
    },
  ]
  const handleHostHackathon = () => {
    router.push('/freelancer/create-hackathon')
  }
  const handleHackathonClick = (id: number) => {
    router.push(`/freelancer/hackathons/${id}`)
  }
  return (
    <div className="flex min-h-screen bg-white">
    
      <div className="flex-1 flex flex-col">
        
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header section with title and host button */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold mb-1">Explore Hackathons</h1>
                <p className="text-gray-600">
                  Join exciting hackathons, build projects, and win prizes
                </p>
              </div>
              <button
                onClick={handleHostHackathon}
                className="hidden md:flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
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
                <div className="flex overflow-x-auto pb-2 gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2 rounded-full whitespace-nowrap ${selectedCategory === category ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
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
                      className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Search
                      className="absolute left-3 top-2.5 text-gray-400"
                      size={18}
                    />
                  </div>
                  <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <Filter size={18} className="text-gray-500" />
                  </button>
                </div>
              </div>
            </div>
            {/* Active Hackathons */}
            <div className="mb-12">
              <h2 className="text-xl font-bold mb-6">Active Hackathons</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {hackathons.map((hackathon) => (
                  <HackathonCard
                    key={hackathon.id}
                    hackathon={hackathon}
                    onClick={() => handleHackathonClick(hackathon.id)}
                  />
                ))}
              </div>
            </div>
            {/* Past Hackathons */}
            <div>
              <h2 className="text-xl font-bold mb-6">Past Hackathons</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pastHackathons.map((hackathon) => (
                  <HackathonCard
                    key={hackathon.id}
                    hackathon={hackathon}
                    onClick={() => handleHackathonClick(hackathon.id)}
                  />
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
