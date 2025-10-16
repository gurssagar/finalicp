'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreateHackathonNav } from '../../components/hackathon/CreateHackathonNav';
import { CreateHackathonOverview } from '../../components/hackathon/CreateHackathonOverview';
import CreateHackathonPrizes from '../../components/hackathon/CreateHackathonPrizes';
import CreateHackathonJudges from '../../components/hackathon/CreateHackathonJudges';
import CreateHackathonSchedule from '../../components/hackathon/CreateHackathonSchedule';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

// TypeScript interfaces
interface SocialLink {
  platform: string;
  url: string;
}

interface DateRange {
  start: string;
  end: string;
}

interface Criteria {
  id: string;
  name: string;
  description: string;
  points: number;
}

interface Prize {
  id: string;
  name: string;
  description: string;
  winners: number;
  amount: string;
  expanded: boolean;
  criteria: Criteria[];
}

interface Speaker {
  picture: File | null;
  username: string;
  profileUrl: string;
  realName: string;
  position: string;
}

interface ScheduleEvent {
  id: string;
  dateRange: string;
  name: string;
  description: string;
  expanded: boolean;
  includesSpeaker: boolean;
  speaker: Speaker;
}

interface Judge {
  id: string;
  name: string;
  email: string;
  expertise: string[];
}

interface HackathonData {
  name: string;
  shortDescription: string;
  fullDescription: string;
  image: File | null;
  techStack: string;
  experienceLevel: string;
  location: string;
  socialLinks: SocialLink[];
  registrationDuration: DateRange;
  hackathonDuration: DateRange;
  votingDuration: DateRange;
  prizes: Prize[];
  judgingMode: string;
  votingMode: string;
  maxVotesPerJudge: number;
  judges: Judge[];
  pendingJudges: Judge[];
  schedule: ScheduleEvent[];
}

interface CreateHackathonPageProps {}

// Static data moved outside component for performance
const initialHackathonData: HackathonData = {
  name: '',
  shortDescription: '',
  fullDescription: '',
  image: null,
  techStack: '',
  experienceLevel: '',
  location: '',
  socialLinks: [{
    platform: 'x.com',
    url: ''
  }],
  registrationDuration: {
    start: '',
    end: ''
  },
  hackathonDuration: {
    start: '',
    end: ''
  },
  votingDuration: {
    start: '',
    end: ''
  },
  prizes: [{
    id: 'prize-1',
    name: '',
    description: '',
    winners: 1,
    amount: '',
    expanded: false,
    criteria: [{
      id: 'criteria-1',
      name: '',
      description: '',
      points: 0
    }]
  }],
  judgingMode: 'Judges Only',
  votingMode: 'Project Scoring',
  maxVotesPerJudge: 100,
  judges: [],
  pendingJudges: [],
  schedule: [{
    id: 'event-1',
    dateRange: 'Jun 17, 2025 19:00 - Jul 19, 2025 19:00',
    name: 'Registration Period',
    description: '',
    expanded: false,
    includesSpeaker: false,
    speaker: {
      picture: null,
      username: '',
      profileUrl: '',
      realName: '',
      position: ''
    }
  }, {
    id: 'event-2',
    dateRange: 'June 21, 2025 16:00',
    name: '',
    description: '',
    expanded: true,
    includesSpeaker: false,
    speaker: {
      picture: null,
      username: '',
      profileUrl: '',
      realName: '',
      position: ''
    }
  }]
};

export default function CreateHackathonPage({}: CreateHackathonPageProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [hackathonData, setHackathonData] = useState<HackathonData>(initialHackathonData);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSaveDraft = async (): Promise<void> => {
    try {
      setIsLoading(true);
      console.log('Saving draft:', hackathonData);
      // Add actual save logic here
      router.push('/hackathons');
    } catch (error) {
      console.error('Error saving draft:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreviewPublication = (): void => {
    console.log('Preview publication:', hackathonData);
    // In a real app, this would show a preview modal or navigate to preview page
  };

  const handlePublishHackathon = async (): Promise<void> => {
    try {
      setIsLoading(true);
      console.log('Publishing hackathon:', hackathonData);
      // Add actual publish logic here
      router.push('/hackathons');
    } catch (error) {
      console.error('Error publishing hackathon:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateHackathonData = (newData: Partial<HackathonData>): void => {
    setHackathonData(prev => ({
      ...prev,
      ...newData
    }));
  };

  const renderTabContent = (): React.ReactNode => {
    switch (activeTab) {
      case 'overview':
        return (
          <CreateHackathonOverview 
            hackathonData={hackathonData as any}
            updateHackathonData={updateHackathonData}
          />
        );
      case 'prizes':
        return (
          <CreateHackathonPrizes 
            hackathonData={hackathonData} 
            updateHackathonData={updateHackathonData} 
          />
        );
      case 'judges':
        return (
          <CreateHackathonJudges 
            hackathonData={hackathonData as any}
            updateHackathonData={updateHackathonData} 
          />
        );
      case 'schedule':
        return (
          <CreateHackathonSchedule 
            hackathonData={hackathonData as any}
            updateHackathonData={updateHackathonData} 
          />
        );
      default:
        return (
          <CreateHackathonOverview 
            hackathonData={hackathonData as any}
            updateHackathonData={updateHackathonData} 
          />
        );
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-800">
      {/* Header */}
      <header className="flex justify-between items-center p-4 border-b border-gray-200 shadow-sm">
        <button 
          onClick={handleSaveDraft}
          disabled={isLoading}
          className={cn(
            "flex items-center text-gray-600 hover:text-gray-800 transition-colors duration-200",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md px-2 py-1",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
          aria-label="Save hackathon draft and quit"
        >
          <X size={18} className="mr-2" />
          <span>Save hackathon draft & quit</span>
        </button>
        
        <h1 className="text-xl font-medium text-gray-900">Add hackathon info</h1>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handlePreviewPublication}
            disabled={isLoading}
            className={cn(
              "text-blue-600 hover:text-blue-700 transition-colors duration-200",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md px-3 py-2",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
            aria-label="Preview hackathon publication"
          >
            Preview publication
          </button>
          
          <button 
            onClick={handlePublishHackathon}
            disabled={isLoading}
            className={cn(
              "bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-white transition-colors duration-200",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
              "disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
            )}
            aria-label="Publish hackathon"
          >
            {isLoading ? 'Publishing...' : 'Publish Hackathon'}
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <CreateHackathonNav 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
        />
        
        {/* Main content */}
        <main 
          className="flex-1 overflow-y-auto p-6 bg-gray-50"
          role="main"
          aria-label="Hackathon creation form"
        >
          {renderTabContent()}
        </main>
      </div>
    </div>
  );
}