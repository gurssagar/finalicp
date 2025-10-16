'use client'
import React, { useState } from 'react' 
import { useRouter, useParams } from 'next/navigation'
import { Header1 } from '@/components/Header1'
import { Sidebar } from '@/components/Sidebar'
import { ChevronLeft, Share2, Twitter, Globe, Check } from 'lucide-react'
import { HackathonTabs } from '@/components/hackathon/HackathonTabs'
import { CountdownTimer } from '@/components/hackathon/CountdownTimer'
import { PrizeBreakdown } from '@/components/hackathon/PrizeBreakdown'
import { JudgingCriteria } from '@/components/hackathon/JudgingCriteria'
import { HackathonSchedule } from '@/components/hackathon/HackathonSchedule'
import { SubmittedProjects } from '@/components/hackathon/SubmittedProjects'
export default function HackathonDetail() {
  const router = useRouter()
  const { id } = useParams<{
    id: string
  }>()
  const [activeTab, setActiveTab] = useState('overview')
  // Mock hackathon data - in a real app, you would fetch this based on the ID
  const hackathon = {
    id: parseInt(id || '1'),
    title: 'ChainSpark Hackathon',
    subtitle: 'DeFi Builders Edition',
    description:
      "The crypto world is a wild ride—full of chaos, opportunity, and endless what-ifs. But one thing's for sure: innovation thrives where builders and storytellers collide. That's why FAIR3 and CARV are teaming up to launch the Tech Fairness Hackathon, a high-octane sprint to redefine the future of AI, Data, and Web3.",
    longDescription:
      "This isn't just another hackathon. It's a battlefield for fairness, a playground for disruptors, and a launchpad for the next wave of decentralized innovation. Whether you're an AI wizard or a blockchain pioneer, this is your chance to build something that matters.",
    prizePool: '$38,000',
    date: 'OCTOBER 12-16, 2024',
    registrationDays: 12,
    registrationHours: 1,
    registrationMinutes: 42,
    registrationSeconds: 31,
    image:
      'https://uploadthingy.s3.us-west-1.amazonaws.com/94PtykxWM43cqE6zT6QGKr/01-2-One-hackathon.png',
    tags: ['Smart Contracts', 'Financial Inclusion'],
    mode: 'Online',
    isLive: true,
    techStack: 'All tech stack',
    level: 'All levels accepted',
    bannerImage:
      'https://uploadthingy.s3.us-west-1.amazonaws.com/94PtykxWM43cqE6zT6QGKr/01-2-One-hackathon.png',
    prizes: [
      {
        name: 'Tech Fairness Exploration Awards (9 winners)',
        amount: '18,000 USD',
      },
      {
        name: 'FAIR3 Public Infrastructure Awards (3 winners)',
        amount: '6,000 USD',
      },
      {
        name: 'RNGChain Integration Awards (2 winners)',
        amount: '4,000 USD',
      },
      {
        name: 'Unicorns Special Award (1 winner)',
        amount: '2,000 USD',
      },
      {
        name: 'AI Agent Infrastructure on SVN Chain (2 winners)',
        amount: '4,000 USD',
      },
      {
        name: 'Decentralized Data Orchestration with D.A.T.A. Framework (2 winners)',
        amount: '4,000 USD',
      },
      {
        name: 'Mutual Identity & Reputation with CARV (5 IERC-723) (3 winners)',
        amount: '4,000 USD',
      },
      {
        name: 'Open Innovation: AI + Web3 for Real World Use Cases (3 winners)',
        amount: '8,000 USD',
      },
    ],
    judgingCriteria: [
      {
        name: 'Originality',
        description:
          'Is the idea novel and imaginative? Does it offer a new take on an old problem?',
        score: 20,
      },
      {
        name: 'Relevance to Tech Fairness',
        description:
          'Does the project address core fairness challenges (algorithm transparency, data sovereignty, sustainable income, etc)?',
        score: 25,
      },
      {
        name: 'Functionality & Implementation',
        description:
          'How well is the project executed? Is there a working demo or prototype?',
        score: 20,
      },
      {
        name: 'Impact & Usefulness',
        description:
          'Can this project be applied to real communities or users? Is it scalable or integrate-able?',
        score: 20,
      },
      {
        name: 'Design & Clarity',
        description:
          'Is the presentation intuitive? Is the design and documentation clear enough to be understood and used?',
        score: 15,
      },
    ],
    schedule: [
      {
        date: 'Jun 17, 2025 19:00 - Jul 19, 2025 19:00',
        event: 'Registration Period',
      },
      {
        date: 'Jun 26, 2025 15:00',
        event: 'Kickoff Meeting',
      },
      {
        date: 'Jun 28, 2025 15:00',
        event: 'Workshop: Smart Contract Security',
      },
      {
        date: 'Jun 30, 2025 15:00',
        event: 'Office Hours with Mentors',
      },
      {
        date: 'Jul 19, 2025 19:00 - Jul 30, 2025 19:00',
        event: 'Project Submission Period',
      },
      {
        date: 'Aug 3, 2025 19:00',
        event: 'Winners Announcement',
      },
    ],
    projects: [
      {
        id: 1,
        name: 'Init Club Pro',
        description:
          "Init Club Pro was born from a simple but radical belief: true innovation shouldn't be strangled by black-box algorithms or centralized gatekeepers.",
        lastEdited: '6 days ago',
        builder: 'John McKenzie',
        image: 'https://via.placeholder.com/80',
        likes: 5,
        tags: ['DeFi', 'Infra'],
      },
      {
        id: 2,
        name: 'Ward',
        description:
          "Ward was born from a simple but radical belief: true innovation shouldn't be strangled by black-box algorithms or centralized gatekeepers.",
        lastEdited: '6 days ago',
        builder: 'John McKenzie',
        image: 'https://via.placeholder.com/80',
        likes: 10,
        tags: ['DeFi', 'Infra'],
      },
      {
        id: 3,
        name: 'Wiral',
        description:
          "Wiral was born from a simple but radical belief: true innovation shouldn't be strangled by black-box algorithms or centralized gatekeepers.",
        lastEdited: '6 days ago',
        builder: 'John McKenzie',
        image: 'https://via.placeholder.com/80',
        likes: 5,
        tags: ['DeFi', 'Infra'],
      },
      {
        id: 4,
        name: 'ProjectDetails Demo',
        description:
          'A comprehensive project management platform for hackathons that streamlines team collaboration, tracks progress, and showcases project details with integrated demo capabilities.',
        lastEdited: '2 days ago',
        builder: 'Emma Rodriguez',
        image:
          'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=300&auto=format&fit=crop',
        likes: 23,
        tags: ['Project Management', 'Collaboration', 'Web3'],
      },
    ],
  }
  const handleBack = () => {
    router.push('/freelancer/hackathons')
  }
  const handleRegister = () => {
    router.push(`/freelancer/hackathons/${id}/registeration`)
  }
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-bold mb-4">ChainSpark Hackathon</h2>
              <h3 className="text-lg font-semibold mb-4">
                Calling All Builders, Dreamers, and Rule-Breakers!
              </h3>
              <p className="text-gray-700 mb-4">{hackathon.description}</p>
              <p className="text-gray-700">{hackathon.longDescription}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Why ChainSpark Hackathon?
              </h3>
              <h4 className="font-medium mb-2">
                Saluting the Early Rebels—Redefining Data & Collaboration
              </h4>
              <p className="text-gray-700 mb-4">
                ChainSpark Hackathon was born from a simple but radical belief:
                true innovation shouldn't be strangled by black-box algorithms
                or centralized gatekeepers. In an era of platform monopolies and
                diluted creator value, ChainSpark is rallying builders to forge
                a transparent, platform-agnostic, and verifiable future for data
                governance and the creator economy.
              </p>
            </div>
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Project Quests</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                    <Check size={14} className="text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">Join Telegram Group</p>
                    <a href="#" className="text-blue-500 text-sm">
                      Join Community
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                    <Twitter size={14} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">
                      Follow Tech Fairness Hackathon on X
                    </p>
                    <a href="#" className="text-blue-500 text-sm">
                      Follow on X
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
                    <Globe size={14} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium">
                      Join Tech Fairness Hackathon on Discord
                    </p>
                    <a href="#" className="text-blue-500 text-sm">
                      Join Discord
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      case 'prizes':
        return (
          <div>
            <PrizeBreakdown prizes={hackathon.prizes} totalPrize="50,000 USD" />
            <JudgingCriteria criteria={hackathon.judgingCriteria} />
          </div>
        )
      case 'schedule':
        return <HackathonSchedule schedule={hackathon.schedule} />
      case 'projects':
        return <SubmittedProjects projects={hackathon.projects} />
      default:
        return <div>Content not available</div>
    }
  }
  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
       
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Back button */}
            <button
              onClick={handleBack}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
            >
              <ChevronLeft size={16} className="mr-1" />
              <span>Back to Hackathons</span>
            </button>
            {/* Tabs navigation */}
            <HackathonTabs activeTab={activeTab} setActiveTab={setActiveTab} />
            {/* Main content area */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Left content - Tab content */}
              <div className="md:col-span-2">{renderTabContent()}</div>
              {/* Right sidebar - Registration info */}
              <div className="space-y-6">
                {/* Registration countdown */}
                <div className="border border-gray-200 rounded-lg p-6 bg-white">
                  <h3 className="text-lg font-medium mb-4">Left to register</h3>
                  <CountdownTimer
                    days={hackathon.registrationDays}
                    hours={hackathon.registrationHours}
                    minutes={hackathon.registrationMinutes}
                    seconds={hackathon.registrationSeconds}
                  />
                  <button
                    onClick={handleRegister}
                    className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                  >
                    Register to Hackathon
                  </button>
                </div>
                {/* Hackathon details */}
                <div className="border border-gray-200 rounded-lg p-6 bg-white">
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Registration</span>
                      <span className="font-medium">
                        {hackathon.registrationDays} days left
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tech stack</span>
                      <span className="font-medium">{hackathon.techStack}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Level</span>
                      <span className="font-medium">{hackathon.level}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Prize</span>
                      <span className="font-medium">{hackathon.prizePool}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Location</span>
                      <span className="font-medium">{hackathon.mode}</span>
                    </div>
                  </div>
                  <div className="mt-6">
                    <h4 className="text-sm font-medium mb-2">Links</h4>
                    <div className="flex gap-2">
                      <a
                        href="#"
                        className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200"
                      >
                        <Twitter size={16} />
                      </a>
                      <a
                        href="#"
                        className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200"
                      >
                        <Globe size={16} />
                      </a>
                    </div>
                  </div>
                </div>
                {/* Share button */}
                <button className="flex items-center justify-center gap-2 w-full border border-gray-300 rounded-lg py-3 px-4 text-gray-700 hover:bg-gray-50">
                  <Share2 size={18} />
                  <span>Share Link</span>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
