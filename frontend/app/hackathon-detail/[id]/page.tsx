'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Header } from '@/components/Header1';
import { Sidebar } from '@/components/Sidebar';
import { ChevronLeft, Share2, Twitter, Globe, Check } from 'lucide-react';
import { HackathonTabs } from '@/components/hackathon/HackathonTabs';
import { CountdownTimer } from '@/components/hackathon/CountdownTimer';
import { PrizeBreakdown } from '@/components/hackathon/PrizeBreakdown';
import { JudgingCriteria } from '@/components/hackathon/JudgingCriteria';
import { HackathonSchedule } from '@/components/hackathon/HackathonSchedule';
import { SubmittedProjects } from '@/components/hackathon/SubmittedProjects';
import { cn } from '@/lib/utils';

// TypeScript interfaces
interface Prize {
  name: string;
  amount: string;
}

interface JudgingCriterion {
  name: string;
  description: string;
  score: number;
}

interface ScheduleEvent {
  date: string;
  event: string;
}

interface Project {
  id: number;
  name: string;
  description: string;
  lastEdited: string;
  builder: string;
  image: string;
  likes: number;
  tags: string[];
}

interface Hackathon {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  longDescription: string;
  prizePool: string;
  date: string;
  registrationDays: number;
  registrationHours: number;
  registrationMinutes: number;
  registrationSeconds: number;
  image: string;
  tags: string[];
  mode: string;
  isLive: boolean;
  techStack: string;
  level: string;
  bannerImage: string;
  prizes: Prize[];
  judgingCriteria: JudgingCriterion[];
  schedule: ScheduleEvent[];
  projects: Project[];
}

interface HackathonDetailProps {
  className?: string;
}

interface QuestItemProps {
  icon: React.ReactNode;
  title: string;
  linkText: string;
  href: string;
  iconBgColor: string;
}

interface DetailRowProps {
  label: string;
  value: string;
}

// Extracted components
const QuestItem: React.FC<QuestItemProps> = ({ icon, title, linkText, href, iconBgColor }) => (
  <div className="flex items-center gap-3">
    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", iconBgColor)}>
      {icon}
    </div>
    <div className="flex-1">
      <p className="font-medium text-gray-900">{title}</p>
      <a 
        href={href} 
        className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${linkText} - opens in new tab`}
      >
        {linkText}
      </a>
    </div>
  </div>
);

const DetailRow: React.FC<DetailRowProps> = ({ label, value }) => (
  <div className="flex justify-between items-center py-2">
    <span className="text-gray-600 font-medium">{label}</span>
    <span className="font-semibold text-gray-900">{value}</span>
  </div>
);

const SocialLink: React.FC<{ href: string; icon: React.ReactNode; label: string }> = ({ href, icon, label }) => (
  <a 
    href={href} 
    className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    aria-label={label}
    target="_blank"
    rel="noopener noreferrer"
  >
    {icon}
  </a>
);

export default function HackathonDetail({ className }: HackathonDetailProps) {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [activeTab, setActiveTab] = useState('overview');

  // Mock hackathon data - in a real app, you would fetch this based on the ID
  const hackathon: Hackathon = {
    id: parseInt(id || '1'),
    title: 'ChainSpark Hackathon',
    subtitle: 'DeFi Builders Edition',
    description: "The crypto world is a wild ride—full of chaos, opportunity, and endless what-ifs. But one thing's for sure: innovation thrives where builders and storytellers collide. That's why FAIR3 and CARV are teaming up to launch the Tech Fairness Hackathon, a high-octane sprint to redefine the future of AI, Data, and Web3.",
    longDescription: "This isn't just another hackathon. It's a battlefield for fairness, a playground for disruptors, and a launchpad for the next wave of decentralized innovation. Whether you're an AI wizard or a blockchain pioneer, this is your chance to build something that matters.",
    prizePool: '$38,000',
    date: 'OCTOBER 12-16, 2024',
    registrationDays: 12,
    registrationHours: 1,
    registrationMinutes: 42,
    registrationSeconds: 31,
    image: "/01-2-One-hackathon.png",
    tags: ['Smart Contracts', 'Financial Inclusion'],
    mode: 'Online',
    isLive: true,
    techStack: 'All tech stack',
    level: 'All levels accepted',
    bannerImage: "/01-2-One-hackathon.png",
    prizes: [
      {
        name: 'Tech Fairness Exploration Awards (9 winners)',
        amount: '18,000 USD'
      },
      {
        name: 'FAIR3 Public Infrastructure Awards (3 winners)',
        amount: '6,000 USD'
      },
      {
        name: 'RNGChain Integration Awards (2 winners)',
        amount: '4,000 USD'
      },
      {
        name: 'Unicorns Special Award (1 winner)',
        amount: '2,000 USD'
      },
      {
        name: 'AI Agent Infrastructure on SVN Chain (2 winners)',
        amount: '4,000 USD'
      },
      {
        name: 'Decentralized Data Orchestration with D.A.T.A. Framework (2 winners)',
        amount: '4,000 USD'
      },
      {
        name: 'Mutual Identity & Reputation with CARV (5 IERC-723) (3 winners)',
        amount: '4,000 USD'
      },
      {
        name: 'Open Innovation: AI + Web3 for Real World Use Cases (3 winners)',
        amount: '8,000 USD'
      }
    ],
    judgingCriteria: [
      {
        name: 'Originality',
        description: 'Is the idea novel and imaginative? Does it offer a new take on an old problem?',
        score: 20
      },
      {
        name: 'Relevance to Tech Fairness',
        description: 'Does the project address core fairness challenges (algorithm transparency, data sovereignty, sustainable income, etc)?',
        score: 25
      },
      {
        name: 'Functionality & Implementation',
        description: 'How well is the project executed? Is there a working demo or prototype?',
        score: 20
      },
      {
        name: 'Impact & Usefulness',
        description: 'Can this project be applied to real communities or users? Is it scalable or integrate-able?',
        score: 20
      },
      {
        name: 'Design & Clarity',
        description: 'Is the presentation intuitive? Is the design and documentation clear enough to be understood and used?',
        score: 15
      }
    ],
    schedule: [
      {
        date: 'Jun 17, 2025 19:00 - Jul 19, 2025 19:00',
        event: 'Registration Period'
      },
      {
        date: 'Jun 26, 2025 15:00',
        event: 'Kickoff Meeting'
      },
      {
        date: 'Jun 28, 2025 15:00',
        event: 'Workshop: Smart Contract Security'
      },
      {
        date: 'Jun 30, 2025 15:00',
        event: 'Office Hours with Mentors'
      },
      {
        date: 'Jul 19, 2025 19:00 - Jul 30, 2025 19:00',
        event: 'Project Submission Period'
      },
      {
        date: 'Aug 3, 2025 19:00',
        event: 'Winners Announcement'
      }
    ],
    projects: [
      {
        id: 1,
        name: 'Init Club Pro',
        description: "Init Club Pro was born from a simple but radical belief: true innovation shouldn't be strangled by black-box algorithms or centralized gatekeepers.",
        lastEdited: '6 days ago',
        builder: 'John McKenzie',
        image: 'https://via.placeholder.com/80',
        likes: 5,
        tags: ['DeFi', 'Infra']
      },
      {
        id: 2,
        name: 'Ward',
        description: "Ward was born from a simple but radical belief: true innovation shouldn't be strangled by black-box algorithms or centralized gatekeepers.",
        lastEdited: '6 days ago',
        builder: 'John McKenzie',
        image: 'https://via.placeholder.com/80',
        likes: 10,
        tags: ['DeFi', 'Infra']
      },
      {
        id: 3,
        name: 'Wiral',
        description: "Wiral was born from a simple but radical belief: true innovation shouldn't be strangled by black-box algorithms or centralized gatekeepers.",
        lastEdited: '6 days ago',
        builder: 'John McKenzie',
        image: 'https://via.placeholder.com/80',
        likes: 5,
        tags: ['DeFi', 'Infra']
      },
      {
        id: 4,
        name: 'ProjectDetails Demo',
        description: 'A comprehensive project management platform for hackathons that streamlines team collaboration, tracks progress, and showcases project details with integrated demo capabilities.',
        lastEdited: '2 days ago',
        builder: 'Emma Rodriguez',
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=300&auto=format&fit=crop',
        likes: 23,
        tags: ['Project Management', 'Collaboration', 'Web3']
      }
    ]
  };

  const handleBack = () => {
    router.push('/hackathons');
  };

  const handleRegister = () => {
    router.push('/hackathon-registration');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: hackathon.title,
          text: hackathon.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-4 text-gray-900">{hackathon.title}</h2>
              <h3 className="text-xl font-semibold mb-6 text-gray-800">
                Calling All Builders, Dreamers, and Rule-Breakers!
              </h3>
              <p className="text-gray-700 mb-6 leading-relaxed">{hackathon.description}</p>
              <p className="text-gray-700 leading-relaxed">{hackathon.longDescription}</p>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-6 text-gray-900">
                Why ChainSpark Hackathon?
              </h3>
              <h4 className="font-semibold mb-3 text-gray-800">
                Saluting the Early Rebels—Redefining Data & Collaboration
              </h4>
              <p className="text-gray-700 mb-6 leading-relaxed">
                ChainSpark Hackathon was born from a simple but radical belief:
                true innovation shouldn't be strangled by black-box algorithms
                or centralized gatekeepers. In an era of platform monopolies and
                diluted creator value, ChainSpark is rallying builders to forge
                a transparent, platform-agnostic, and verifiable future for data
                governance and the creator economy.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-100">
              <h3 className="text-xl font-semibold mb-6 text-gray-900">Project Quests</h3>
              <div className="space-y-6">
                <QuestItem
                  icon={<Check size={16} className="text-green-600" />}
                  title="Join Telegram Group"
                  linkText="Join Community"
                  href="#"
                  iconBgColor="bg-green-100"
                />
                <QuestItem
                  icon={<Twitter size={16} className="text-blue-600" />}
                  title="Follow Tech Fairness Hackathon on X"
                  linkText="Follow on X"
                  href="#"
                  iconBgColor="bg-blue-100"
                />
                <QuestItem
                  icon={<Globe size={16} className="text-purple-600" />}
                  title="Join Tech Fairness Hackathon on Discord"
                  linkText="Join Discord"
                  href="#"
                  iconBgColor="bg-purple-100"
                />
              </div>
            </div>
          </div>
        );
      case 'prizes':
        return (
          <div className="space-y-8">
            <PrizeBreakdown prizes={hackathon.prizes} totalPrize="50,000 USD" />
            <JudgingCriteria criteria={hackathon.judgingCriteria} />
          </div>
        );
      case 'schedule':
        return <HackathonSchedule schedule={hackathon.schedule} />;
      case 'projects':
        return <SubmittedProjects projects={hackathon.projects} />;
      default:
        return (
          <div className="text-center py-12">
            <p className="text-gray-500">Content not available</p>
          </div>
        );
    }
  };

  return (
    <div className={cn("flex min-h-screen bg-gray-50", className)}>
      {/* Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Header showSearch={false} />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Back button */}
            <button 
              onClick={handleBack} 
              className="flex items-center text-gray-600 hover:text-gray-900 mb-8 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md p-1"
              aria-label="Go back to hackathons list"
            >
              <ChevronLeft size={20} className="mr-2" />
              <span className="font-medium">Back to Hackathons</span>
            </button>
            
            {/* Tabs navigation */}
            <HackathonTabs activeTab={activeTab} setActiveTab={setActiveTab} />
            
            {/* Main content area */}
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left content - Tab content */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                  {renderTabContent()}
                </div>
              </div>
              
              {/* Right sidebar - Registration info */}
              <div className="space-y-6">
                {/* Registration countdown */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-semibold mb-6 text-gray-900">Time Left to Register</h3>
                  <CountdownTimer 
                    days={hackathon.registrationDays} 
                    hours={hackathon.registrationHours} 
                    minutes={hackathon.registrationMinutes} 
                    seconds={hackathon.registrationSeconds} 
                  />
                  <button 
                    onClick={handleRegister} 
                    className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    aria-label="Register for hackathon"
                  >
                    Register to Hackathon
                  </button>
                </div>
                
                {/* Hackathon details */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <h4 className="text-lg font-semibold mb-6 text-gray-900">Hackathon Details</h4>
                  <div className="space-y-1">
                    <DetailRow 
                      label="Registration" 
                      value={`${hackathon.registrationDays} days left`} 
                    />
                    <DetailRow 
                      label="Tech stack" 
                      value={hackathon.techStack} 
                    />
                    <DetailRow 
                      label="Level" 
                      value={hackathon.level} 
                    />
                    <DetailRow 
                      label="Total Prize" 
                      value={hackathon.prizePool} 
                    />
                    <DetailRow 
                      label="Location" 
                      value={hackathon.mode} 
                    />
                  </div>
                  
                  <div className="mt-8">
                    <h5 className="text-sm font-semibold mb-4 text-gray-900">Social Links</h5>
                    <div className="flex gap-3">
                      <SocialLink
                        href="#"
                        icon={<Twitter size={18} />}
                        label="Follow on Twitter"
                      />
                      <SocialLink
                        href="#"
                        icon={<Globe size={18} />}
                        label="Visit website"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Share button */}
                <button 
                  onClick={handleShare}
                  className="flex items-center justify-center gap-3 w-full bg-white border border-gray-300 rounded-xl py-4 px-6 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm"
                  aria-label="Share hackathon"
                >
                  <Share2 size={20} />
                  <span className="font-medium">Share Link</span>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}