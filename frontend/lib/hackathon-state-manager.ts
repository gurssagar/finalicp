import { safeLocalStorage, safeJsonStorage } from './browser-storage';

// Define HackathonData interface locally since it's not exported from CreateHackathonOverview
interface HackathonData {
  name: string;
  shortDescription: string;
  fullDescription: string;
  image: File | null;
  bannerImage: string | null;
  bannerImageFile: File | null;
  galleryImages: string[];
  tagline: string;
  theme: string;
  rules: string;
  techStack: string;
  experienceLevel: string;
  location: string;
  socialLinks: any[];
  registrationDuration: any;
  hackathonDuration: any;
  votingDuration: any;
  prizes: any[];
  judgingMode: string;
  votingMode: string;
  maxVotesPerJudge: number;
  judges: any[];
  pendingJudges: any[];
  schedule: any[];
}

export interface HackathonDraft extends HackathonData {
  id: string;
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
  lastActiveTab: string;
  userId?: string;
}

export interface HackathonStateContext {
  currentDraft: HackathonDraft | null;
  allDrafts: HackathonDraft[];
  isSaving: boolean;
  lastSaved: string | null;
  hasUnsavedChanges: boolean;
}

class HackathonStateManager {
  private static instance: HackathonStateManager;
  private storageKey = 'hackathon_drafts';
  private currentDraftId: string | null = null;
  private listeners: ((context: HackathonStateContext) => void)[] = [];
  private autoSaveTimer: NodeJS.Timeout | null = null;
  private saveInterval = 30000; // 30 seconds

  private constructor() {
    this.initializeFromStorage();
    this.setupAutoSave();
    this.setupTabSync();
  }

  public static getInstance(): HackathonStateManager {
    if (!HackathonStateManager.instance) {
      HackathonStateManager.instance = new HackathonStateManager();
    }
    return HackathonStateManager.instance;
  }

  private initializeFromStorage(): void {
    if (typeof window !== 'undefined') {
      try {
        const stored = safeLocalStorage.getItem(this.storageKey);
        if (stored) {
          const drafts = JSON.parse(stored);
          this.setCurrentDraft(drafts.currentDraftId || null);
        }
      } catch (error) {
        console.error('Failed to load hackathon drafts from storage:', error);
      }
    }
  }

  private setupAutoSave(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
    }

    this.autoSaveTimer = setInterval(() => {
      if (this.getCurrentDraft() && this.hasUnsavedChanges()) {
        this.saveDraft('auto');
      }
    }, this.saveInterval);
  }

  private setupTabSync(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === this.storageKey) {
          this.initializeFromStorage();
          this.notifyListeners();
        }
      });

      // Handle tab visibility changes
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden && this.getCurrentDraft()) {
          this.saveDraft('tab-switch');
        }
      });

      // Save before tab closes
      window.addEventListener('beforeunload', () => {
        if (this.getCurrentDraft() && this.hasUnsavedChanges()) {
          this.saveDraft('tab-close');
        }
      });
    }
  }

  public createNewDraft(userId?: string): HackathonDraft {
    const draft: HackathonDraft = {
      id: this.generateId(),
      name: '',
      shortDescription: '',
      fullDescription: '',
      image: null,
      bannerImage: null,
      bannerImageFile: null,
      galleryImages: [],
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
      }],
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastActiveTab: 'overview',
      userId
    };

    this.setCurrentDraft(draft);
    return draft;
  }

  public getCurrentDraft(): HackathonDraft | null {
    if (!this.currentDraftId) return null;

    try {
      const stored = safeLocalStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        return data.drafts?.find((d: HackathonDraft) => d.id === this.currentDraftId) || null;
      }
    } catch (error) {
      console.error('Failed to get current draft:', error);
    }
    return null;
  }

  public setCurrentDraft(draft: HackathonDraft | null): void {
    this.currentDraftId = draft?.id || null;

    try {
      const stored = safeLocalStorage.getItem(this.storageKey);
      const data = stored ? JSON.parse(stored) : { drafts: [], currentDraftId: null };

      if (draft) {
        const existingIndex = data.drafts.findIndex((d: HackathonDraft) => d.id === draft.id);
        if (existingIndex >= 0) {
          data.drafts[existingIndex] = draft;
        } else {
          data.drafts.push(draft);
        }
        data.currentDraftId = draft.id;
      } else {
        data.currentDraftId = null;
      }

      safeLocalStorage.setItem(this.storageKey, JSON.stringify(data));
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to set current draft:', error);
    }
  }

  public updateCurrentDraft(updates: Partial<HackathonDraft>): void {
    const current = this.getCurrentDraft();
    if (!current) return;

    const updated: HackathonDraft = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.setCurrentDraft(updated);
  }

  public updateActiveTab(tab: string): void {
    this.updateCurrentDraft({ lastActiveTab: tab });
  }

  public async saveDraft(source: 'manual' | 'auto' | 'tab-switch' | 'tab-close' = 'manual'): Promise<boolean> {
    const draft = this.getCurrentDraft();
    if (!draft) return false;

    try {
      // Update the draft with save metadata
      const updatedDraft = {
        ...draft,
        updatedAt: new Date().toISOString(),
        status: (draft.status === 'published' ? 'published' : 'draft') as 'draft' | 'published'
      };

      // Save to localStorage first for immediate feedback
      this.setCurrentDraft(updatedDraft);

      // If userId is available, also save to backend API
      if (draft.userId && source !== 'auto') {
        try {
          const response = await fetch('/api/hackathons/drafts', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              draft: updatedDraft,
              source
            })
          });

          if (!response.ok) {
            console.warn('Failed to save draft to backend:', await response.text());
          }
        } catch (error) {
          console.warn('Failed to save draft to backend:', error);
        }
      }

      console.log(`Hackathon draft saved (${source}):`, draft.id);
      return true;
    } catch (error) {
      console.error('Failed to save draft:', error);
      return false;
    }
  }

  public async publishDraft(): Promise<{ success: boolean; hackathon?: any; error?: string }> {
    const draft = this.getCurrentDraft();
    if (!draft) {
      return { success: false, error: 'No draft to publish' };
    }

    try {
      // Transform draft data to match API expectations
      const hackathonData = {
        title: draft.name,
        tagline: draft.tagline || '',
        short_description: draft.shortDescription,
        full_description: draft.fullDescription,
        theme: draft.theme || '',
        banner_image_url: draft.bannerImage || '',
        gallery_images: draft.galleryImages || [],
        mode: this.getModeValue(draft.location),
        location: draft.location,
        start_date: draft.hackathonDuration.start,
        end_date: draft.hackathonDuration.end,
        registration_start: draft.registrationDuration.start,
        registration_end: draft.registrationDuration.end,
        min_team_size: 1,
        max_team_size: 5,
        max_participants: 100,
        registration_fee: 0.0,
        prize_pool: draft.prizes[0]?.amount || '0 ICP',
        rules: draft.rules || '',
        tech_stack: draft.techStack || '',
        experience_level: draft.experienceLevel || ''
      };

      const response = await fetch('/api/hackathon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(hackathonData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || 'Failed to publish hackathon'
        };
      }

      const result = await response.json();

      // Update draft status to published
      this.updateCurrentDraft({ status: 'published' });

      // Remove from drafts after successful publish
      this.removeDraft(draft.id);

      return {
        success: true,
        hackathon: result.data
      };
    } catch (error) {
      console.error('Failed to publish hackathon:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to publish hackathon'
      };
    }
  }

  public removeDraft(draftId: string): void {
    try {
      const stored = safeLocalStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        data.drafts = data.drafts.filter((d: HackathonDraft) => d.id !== draftId);

        if (data.currentDraftId === draftId) {
          data.currentDraftId = null;
          this.currentDraftId = null;
        }

        safeLocalStorage.setItem(this.storageKey, JSON.stringify(data));
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Failed to remove draft:', error);
    }
  }

  public getAllDrafts(): HackathonDraft[] {
    try {
      const stored = safeLocalStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        return data.drafts || [];
      }
    } catch (error) {
      console.error('Failed to get all drafts:', error);
    }
    return [];
  }

  public getDraftsForUser(userId: string): HackathonDraft[] {
    return this.getAllDrafts().filter(draft => draft.userId === userId);
  }

  public hasUnsavedChanges(): boolean {
    const current = this.getCurrentDraft();
    if (!current) return false;

    // Check if there are meaningful changes
    return !!(
      current.name ||
      current.shortDescription ||
      current.fullDescription ||
      current.location ||
      current.techStack ||
      current.experienceLevel ||
      current.registrationDuration.start ||
      current.registrationDuration.end ||
      current.hackathonDuration.start ||
      current.hackathonDuration.end
    );
  }

  public getStateContext(): HackathonStateContext {
    const current = this.getCurrentDraft();
    return {
      currentDraft: current,
      allDrafts: this.getAllDrafts(),
      isSaving: false, // You might want to track this more precisely
      lastSaved: current?.updatedAt || null,
      hasUnsavedChanges: this.hasUnsavedChanges()
    };
  }

  public subscribe(listener: (context: HackathonStateContext) => void): () => void {
    this.listeners.push(listener);

    // Immediately call listener with current state
    listener(this.getStateContext());

    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    const context = this.getStateContext();
    this.listeners.forEach(listener => {
      try {
        listener(context);
      } catch (error) {
        console.error('Error in state listener:', error);
      }
    });
  }

  private getModeValue(location: string): 'Online' | 'Offline' | 'Hybrid' {
    const lowerLocation = location.toLowerCase();
    if (lowerLocation.includes('online') || lowerLocation.includes('virtual')) {
      return 'Online';
    } else if (lowerLocation.includes('offline') || lowerLocation.includes('in-person')) {
      return 'Offline';
    }
    return 'Hybrid';
  }

  private generateId(): string {
    return 'draft_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  public cleanup(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
    }
  }
}

// Export singleton instance
export const hackathonStateManager = HackathonStateManager.getInstance();

// Export hook for React components
export function useHackathonState() {
  const [state, setState] = React.useState<HackathonStateContext>(
    hackathonStateManager.getStateContext()
  );

  React.useEffect(() => {
    const unsubscribe = hackathonStateManager.subscribe(setState);
    return unsubscribe;
  }, []);

  return {
    ...state,
    createNewDraft: (userId?: string) => hackathonStateManager.createNewDraft(userId),
    updateDraft: (updates: Partial<HackathonDraft>) => hackathonStateManager.updateCurrentDraft(updates),
    saveDraft: (source?: 'manual' | 'auto' | 'tab-switch' | 'tab-close') => hackathonStateManager.saveDraft(source),
    publishDraft: () => hackathonStateManager.publishDraft(),
    setActiveTab: (tab: string) => hackathonStateManager.updateActiveTab(tab),
    removeDraft: (id: string) => hackathonStateManager.removeDraft(id)
  };
}

// React import for the hook
import React from 'react';