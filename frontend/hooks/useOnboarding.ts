'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';

interface ProfileData {
  firstName: string;
  lastName: string;
  bio: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
  github: string;
  twitter: string;
}

interface AddressData {
  isPrivate: boolean;
  country: string;
  state: string;
  city: string;
  zipCode: string;
  streetAddress: string;
}

interface ResumeData {
  fileName: string;
  file: File | null;
  fileUrl?: string;
  hasResume: boolean;
}

interface OnboardingData {
  skills: string[];
  profile: ProfileData;
  address: AddressData;
  resume: ResumeData;
}

const DEFAULT_DATA: OnboardingData = {
  skills: [],
  profile: {
    firstName: '',
    lastName: '',
    bio: '',
    phone: '',
    location: '',
    website: '',
    linkedin: '',
    github: '',
    twitter: '',
  },
  address: {
    isPrivate: true,
    country: 'USA',
    state: '',
    city: '',
    zipCode: '',
    streetAddress: '',
  },
  resume: {
    fileName: '',
    file: null,
    hasResume: false,
  },
};

const STORAGE_KEY = 'onboarding_data';

export function useOnboarding() {
  const router = useRouter();
  const [data, setData] = useState<OnboardingData>(DEFAULT_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setData(prevData => ({ ...prevData, ...parsedData }));
      }
    } catch (err) {
      console.error('Error loading onboarding data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save data to localStorage whenever it changes
  const saveToStorage = useCallback((newData: OnboardingData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    } catch (err) {
      console.error('Error saving onboarding data:', err);
    }
  }, []);

  // Update skills
  const updateSkills = useCallback((skills: string[]) => {
    const newData = { ...data, skills };
    setData(newData);
    saveToStorage(newData);
  }, [data, saveToStorage]);

  // Add a skill
  const addSkill = useCallback((skill: string) => {
    if (!data.skills.includes(skill) && data.skills.length < 20) {
      updateSkills([...data.skills, skill]);
      return true;
    }
    return false;
  }, [data.skills, updateSkills]);

  // Remove a skill
  const removeSkill = useCallback((skill: string) => {
    updateSkills(data.skills.filter(s => s !== skill));
  }, [data.skills, updateSkills]);

  // Update profile
  const updateProfile = useCallback((profile: Partial<ProfileData>) => {
    const newData = {
      ...data,
      profile: { ...data.profile, ...profile }
    };
    setData(newData);
    saveToStorage(newData);
  }, [data, saveToStorage]);

  // Update address
  const updateAddress = useCallback((address: Partial<AddressData>) => {
    const newData = {
      ...data,
      address: { ...data.address, ...address }
    };
    setData(newData);
    saveToStorage(newData);
  }, [data, saveToStorage]);

  // Update resume
  const updateResume = useCallback((resume: Partial<ResumeData>) => {
    const newData = {
      ...data,
      resume: { ...data.resume, ...resume }
    };
    setData(newData);
    saveToStorage(newData);
  }, [data, saveToStorage]);

  // Get full location string for display
  const fullLocation = useMemo(() => {
    const { city, state, country } = data.address;
    if (city && state) {
      return `${city}, ${state}, ${country}`;
    }
    return '';
  }, [data.address]);

  // Get full name for display
  const fullName = useMemo(() => {
    const { firstName, lastName } = data.profile;
    if (firstName || lastName) {
      return `${firstName} ${lastName}`.trim();
    }
    return '';
  }, [data.profile]);

  // Check if step is complete
  const isStepComplete = useCallback((step: number) => {
    switch (step) {
      case 1: // Welcome (always complete)
        return true;
      case 2: // Skills
        return data.skills.length > 0;
      case 3: // Address
        return !!(data.address.city && data.address.state && data.address.zipCode);
      case 4: // Profile
        return !!(data.profile.firstName && data.profile.lastName);
      case 5: // Resume (optional)
        return true;
      default:
        return false;
    }
  }, [data]);

  // Save to API
  const saveToAPI = useCallback(async (step: number) => {
    setError('');
    try {
      let endpoint = '';
      let payload = {};

      switch (step) {
        case 2: // Skills
          endpoint = '/api/onboarding/skills';
          payload = { skills: data.skills };
          break;
        case 3: // Address
          endpoint = '/api/onboarding/address';
          payload = data.address;
          break;
        case 4: // Profile
          endpoint = '/api/profile/complete';
          payload = data.profile;
          break;
        case 5: // Resume - Save complete onboarding data
          endpoint = '/api/onboarding/complete';
          payload = {
            profile: data.profile,
            skills: data.skills,
            resume: data.resume,
            address: data.address,
          };
          break;
        default:
          return true;
      }

      if (endpoint && Object.keys(payload).length > 0) {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const result = await response.json();
          throw new Error(result.error || 'Failed to save data');
        }
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      return false;
    }
  }, [data]);

  // Navigate to next step
  const goToNextStep = useCallback(async (currentStep: number) => {
    if (!isStepComplete(currentStep)) {
      setError('Please complete the current step before proceeding');
      return false;
    }

    const success = await saveToAPI(currentStep);
    if (!success) {
      return false;
    }

    const nextStep = currentStep + 1;
    const routes = ['', 'skills', 'address', 'profile', 'resume'];

    if (nextStep <= 5) {
      router.push(`/onboarding/${routes[nextStep - 1]}`);
    } else {
      router.push('/onboarding/verification-complete');
    }

    return true;
  }, [isStepComplete, saveToAPI, router]);

  // Navigate to previous step
  const goToPreviousStep = useCallback((currentStep: number) => {
    const previousStep = currentStep - 1;
    const routes = ['', 'skills', 'address', 'profile', 'resume'];

    if (previousStep >= 1) {
      router.push(`/onboarding/${routes[previousStep - 1]}`);
    }
  }, [router]);

  // Clear all data
  const clearData = useCallback(() => {
    setData(DEFAULT_DATA);
    localStorage.removeItem(STORAGE_KEY);
    // Don't remove onboarding_completed flag - it should persist
  }, []);

  // Complete onboarding and save all data
  const completeOnboarding = useCallback(async () => {
    setError('');
    setIsLoading(true);

    try {
      // Save complete onboarding data to canister
      const endpoint = '/api/onboarding/complete';
      const payload = {
        profile: data.profile,
        skills: data.skills,
        resume: data.resume,
        address: data.address,
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to complete onboarding');
      }

      const result = await response.json();
      console.log('Onboarding completed successfully:', result);

      // Mark onboarding as completed
      localStorage.setItem('onboarding_completed', 'true');

      // Clear onboarding data from localStorage
      clearData();

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [data, clearData]);

  // Reset onboarding completion (useful for logout)
  const resetOnboardingCompletion = useCallback(() => {
    localStorage.removeItem('onboarding_completed');
  }, []);

  // Memoized data object
  const memoizedData = useMemo(() => data, [data]);

  return {
    data: memoizedData,
    isLoading,
    error,
    setError,
    skills: data.skills,
    profile: data.profile,
    address: data.address,
    resume: data.resume,
    fullLocation,
    fullName,
    updateSkills,
    addSkill,
    removeSkill,
    updateProfile,
    updateAddress,
    updateResume,
    isStepComplete,
    goToNextStep,
    goToPreviousStep,
    clearData,
    completeOnboarding,
    resetOnboardingCompletion,
  };
}