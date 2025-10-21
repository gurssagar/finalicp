'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CreateHackathonNav } from '@/components/hackathon/CreateHackathonNav';
import { CreateHackathonOverview } from '@/components/hackathon/CreateHackathonOverview';
import CreateHackathonPrizes from '@/components/hackathon/CreateHackathonPrizes';
import CreateHackathonJudges from '@/components/hackathon/CreateHackathonJudges';
import CreateHackathonSchedule from '@/components/hackathon/CreateHackathonSchedule';
import { X, Save, Eye, Send } from 'lucide-react';
import { HackathonDraft } from '@/lib/hackathon-state-manager';
import { cn } from '@/lib/utils';
import { useHackathonState } from '@/lib/hackathon-state-manager';
import { getSession } from '@/lib/auth-client';

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
  position: string;
  title: string;
  description: string;
  amount: number;
  currency: string;
  type: 'cash' | 'non-cash';
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
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  date: string;
  location?: string;
  type: 'opening' | 'workshop' | 'presentation' | 'break' | 'judging' | 'awards' | 'closing' | 'other';
  speakers?: string[];
  isRequired: boolean;
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
  bannerImage: string | null;
  bannerImageFile: File | null;
  tagline: string;
  theme: string;
  rules: string;
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
  bannerImage: null,
  bannerImageFile: null,
  tagline: '',
  theme: '',
  rules: '',
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
    position: '1st Place',
    title: '',
    description: '',
    amount: 0,
    currency: 'USD',
    type: 'cash' as const
  }],
  judgingMode: 'Judges Only',
  votingMode: 'Project Scoring',
  maxVotesPerJudge: 100,
  judges: [],
  pendingJudges: [],
  schedule: [{
    id: 'event-1',
    title: 'Registration Period',
    description: '',
    startTime: '19:00',
    endTime: '19:00',
    date: '2025-06-17',
    type: 'opening' as const,
    isRequired: true
  }, {
    id: 'event-2',
    title: '',
    description: '',
    startTime: '16:00',
    endTime: '18:00',
    date: '2025-06-21',
    type: 'workshop' as const,
    isRequired: false
  }]
};

export default function CreateHackathonPage({}: CreateHackathonPageProps) {
  const router = useRouter();
  const [activeTab, setActiveTabLocal] = useState<string>('overview');
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
  }>>([]);

  // Use the new state management system
  const {
    currentDraft,
    isSaving,
    lastSaved,
    hasUnsavedChanges,
    createNewDraft,
    updateDraft,
    saveDraft,
    publishDraft
  } = useHackathonState();

  // Initialize draft and user session
  useEffect(() => {
    const initializeDraft = async () => {
      try {
        const session = await getSession();
        const userId = session?.email;

        if (!currentDraft) {
          createNewDraft(userId);
        }
      } catch (error) {
        console.error('Failed to initialize hackathon draft:', error);
        addNotification('error', 'Failed to initialize hackathon creation');
      }
    };

    initializeDraft();
  }, []);

  // Handle tab changes with state preservation
  const handleTabChange = (tab: string) => {
    setActiveTabLocal(tab);
    if (hasUnsavedChanges) {
      saveDraft('tab-switch');
    }
  };

  // Update hackathon data and sync with state manager
  const updateHackathonData = (newData: Partial<HackathonData>): void => {
    if (currentDraft) {
      updateDraft(newData as Partial<HackathonDraft>);
    }
  };

  // Add notification helper
  const addNotification = (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, type, message }]);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Save draft functionality
  const handleSaveDraft = async (): Promise<void> => {
    if (!currentDraft) {
      addNotification('error', 'No hackathon data to save');
      return;
    }

    try {
      const success = await saveDraft('manual');
      if (success) {
        addNotification('success', 'Hackathon draft saved successfully');
      } else {
        addNotification('error', 'Failed to save hackathon draft');
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      addNotification('error', 'Failed to save hackathon draft');
    }
  };

  // Preview functionality
  const handlePreviewPublication = (): void => {
    if (!currentDraft) {
      addNotification('warning', 'No hackathon data to preview');
      return;
    }

    // Save current state before previewing
    saveDraft('manual');

    // Open preview in new tab
    const previewData = btoa(JSON.stringify(currentDraft));
    window.open(`/client/hackathon/preview?data=${previewData}`, '_blank');
  };

  // Publish hackathon functionality
  const handlePublishHackathon = async (): Promise<void> => {
    if (!currentDraft) {
      addNotification('error', 'No hackathon data to publish');
      return;
    }

    // Validate required fields
    const requiredFields = ['name', 'shortDescription', 'fullDescription', 'location', 'techStack'];
    const missingFields = requiredFields.filter(field => !currentDraft[field as keyof HackathonData]);

    if (missingFields.length > 0) {
      addNotification('error', `Please fill in required fields: ${missingFields.join(', ')}`);
      return;
    }

    try {
      addNotification('info', 'Publishing hackathon...');
      const result = await publishDraft();

      if (result.success) {
        addNotification('success', 'Hackathon published successfully!');
        setTimeout(() => {
          router.push('/client/hackathons');
        }, 1500);
      } else {
        addNotification('error', result.error || 'Failed to publish hackathon');
      }
    } catch (error) {
      console.error('Error publishing hackathon:', error);
      addNotification('error', 'Failed to publish hackathon');
    }
  };

  // Handle browser close/tab change
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const renderTabContent = (): React.ReactNode => {
    if (!currentDraft) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      );
    }

    switch (activeTab) {
      case 'overview':
        return (
          <CreateHackathonOverview
            data={{
              title: currentDraft.name,
              shortDescription: currentDraft.shortDescription,
              fullDescription: currentDraft.fullDescription,
              bannerImage: currentDraft.bannerImage,
              bannerImageFile: currentDraft.bannerImageFile,
              tagline: currentDraft.tagline,
              theme: currentDraft.theme,
              rules: currentDraft.rules,
              startDate: currentDraft.registrationDuration.start,
              endDate: currentDraft.hackathonDuration.end,
              location: currentDraft.location,
              isVirtual: currentDraft.location.toLowerCase().includes('online'),
              maxParticipants: 100,
              registrationFee: 0,
              techStack: currentDraft.techStack,
              experienceLevel: currentDraft.experienceLevel
            }}
            onDataChange={(overviewData) => updateHackathonData({
              name: overviewData.title,
              shortDescription: overviewData.shortDescription,
              fullDescription: overviewData.fullDescription,
              bannerImage: overviewData.bannerImage,
              bannerImageFile: overviewData.bannerImageFile,
              tagline: overviewData.tagline,
              theme: overviewData.theme,
              rules: overviewData.rules,
              registrationDuration: {
                ...currentDraft.registrationDuration,
                start: overviewData.startDate
              },
              hackathonDuration: {
                ...currentDraft.hackathonDuration,
                end: overviewData.endDate
              },
              location: overviewData.location,
              techStack: overviewData.techStack || '',
              experienceLevel: overviewData.experienceLevel || ''
            })}
          />
        );
      case 'prizes':
        return (
          <CreateHackathonPrizes
            prizes={currentDraft.prizes}
            onPrizesChange={(prizes) => updateHackathonData({ prizes })}
          />
        );
      case 'judges':
        return (
          <CreateHackathonJudges
            judges={currentDraft.judges}
            onJudgesChange={(judges) => updateHackathonData({ judges })}
          />
        );
      case 'schedule':
        return (
          <CreateHackathonSchedule
            schedule={currentDraft.schedule}
            onScheduleChange={(schedule) => updateHackathonData({ schedule })}
          />
        );
      default:
        return (
          <CreateHackathonOverview
            data={{
              title: currentDraft.name,
              shortDescription: currentDraft.shortDescription,
              fullDescription: currentDraft.fullDescription,
              bannerImage: currentDraft.bannerImage,
              bannerImageFile: currentDraft.bannerImageFile,
              tagline: currentDraft.tagline,
              theme: currentDraft.theme,
              rules: currentDraft.rules,
              startDate: currentDraft.registrationDuration.start,
              endDate: currentDraft.hackathonDuration.end,
              location: currentDraft.location,
              isVirtual: currentDraft.location.toLowerCase().includes('online'),
              maxParticipants: 100,
              registrationFee: 0,
              techStack: currentDraft.techStack,
              experienceLevel: currentDraft.experienceLevel
            }}
            onDataChange={(overviewData) => updateHackathonData({
              name: overviewData.title,
              shortDescription: overviewData.shortDescription,
              fullDescription: overviewData.fullDescription,
              bannerImage: overviewData.bannerImage,
              bannerImageFile: overviewData.bannerImageFile,
              tagline: overviewData.tagline,
              theme: overviewData.theme,
              rules: overviewData.rules,
              registrationDuration: {
                ...currentDraft.registrationDuration,
                start: overviewData.startDate
              },
              hackathonDuration: {
                ...currentDraft.hackathonDuration,
                end: overviewData.endDate
              },
              location: overviewData.location,
              techStack: overviewData.techStack || '',
              experienceLevel: overviewData.experienceLevel || ''
            })}
          />
        );
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-800">
      {/* Header */}
      <header className="flex justify-between items-center p-4 border-b border-gray-200 shadow-sm">
        <button
          onClick={() => {
            if (hasUnsavedChanges) {
              if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
                handleSaveDraft();
                setTimeout(() => router.push('/client/hackathons'), 500);
              }
            } else {
              router.push('/client/hackathons');
            }
          }}
          className={cn(
            "flex items-center text-gray-600 hover:text-gray-800 transition-colors duration-200",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md px-2 py-1"
          )}
          aria-label="Go back to hackathons"
        >
          <X size={18} className="mr-2" />
          <span>Back to Hackathons</span>
        </button>

        <div className="flex items-center gap-4">
          <div className="text-center">
            <h1 className="text-xl font-medium text-gray-900">Create Hackathon</h1>
            {lastSaved && (
              <p className="text-xs text-gray-500">
                Last saved: {new Date(lastSaved).toLocaleTimeString()}
                {hasUnsavedChanges && (
                  <span className="text-orange-500 ml-1">• Unsaved changes</span>
                )}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveDraft}
            disabled={isSaving}
            className={cn(
              "flex items-center px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
            aria-label="Save hackathon draft"
          >
            <Save size={16} className="mr-2" />
            {isSaving ? 'Saving...' : 'Save Draft'}
          </button>

          <button
            onClick={handlePreviewPublication}
            disabled={!currentDraft || isSaving}
            className={cn(
              "flex items-center px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
            aria-label="Preview hackathon publication"
          >
            <Eye size={16} className="mr-2" />
            Preview
          </button>

          <button
            onClick={handlePublishHackathon}
            disabled={!currentDraft || isSaving || !hasUnsavedChanges}
            className={cn(
              "flex items-center px-4 py-2 text-sm bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-md hover:from-purple-700 hover:to-blue-700 transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2",
              "disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
            )}
            aria-label="Publish hackathon"
          >
            <Send size={16} className="mr-2" />
            Publish Hackathon
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <CreateHackathonNav
          activeTab={activeTab}
          setActiveTab={handleTabChange}
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

      {/* Notifications */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={cn(
              "flex items-center justify-between p-3 rounded-lg shadow-lg max-w-sm",
              "animate-in slide-in-from-bottom duration-300",
              notification.type === 'success' && "bg-green-50 text-green-800 border border-green-200",
              notification.type === 'error' && "bg-red-50 text-red-800 border border-red-200",
              notification.type === 'warning' && "bg-yellow-50 text-yellow-800 border border-yellow-200",
              notification.type === 'info' && "bg-blue-50 text-blue-800 border border-blue-200"
            )}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0 mr-2">
                {notification.type === 'success' && (
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                )}
                {notification.type === 'error' && (
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                )}
                {notification.type === 'warning' && (
                  <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                )}
                {notification.type === 'info' && (
                  <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                )}
              </div>
              <p className="text-sm font-medium">{notification.message}</p>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Auto-save indicator */}
      {isSaving && (
        <div className="fixed bottom-4 left-4 z-50">
          <div className="flex items-center px-3 py-2 bg-gray-800 text-white rounded-lg shadow-lg">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            <span className="text-sm">Auto-saving...</span>
          </div>
        </div>
      )}
    </div>
  );
}