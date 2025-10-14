'use client'
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { JobPostingTabs } from '@/components/client/JobPostingTabs';
import { JobDetailsStep } from '@/components/client/JobPostSteps/JobDetailsStep';
import { OverviewStep } from '@/components/client/JobPostSteps/OverviewStep';
import { ContractLocationStep } from '@/components/client/JobPostSteps/ContractLocationStep';
import { BudgetStep } from '@/components/client/JobPostSteps/BudgetStep';
import { ApplicationStep } from '@/components/client/JobPostSteps/ApplicationStep';
export interface JobPostingFormData {
  // Overview tab
  jobType: string;
  category: string;
  subCategory: string;
  // Job Details tab
  jobTitle: string;
  rolesResponsibilities: string;
  skillsRequired: string;
  benefits: string;
  // Contract tab
  jobRole: string;
  contractDuration: string;
  experienceLevel: string;
  isContractToHire: string;
  workplaceType: string;
  location: string;
  // Budget tab
  budget: string;
  paymentPeriod: string;
  minBudget: string;
  maxBudget: string;
  isUnpaidInternship: boolean;
  isVolunteering: boolean;
  // Application tab
  applicationCategory: string;
  applicationQuestions: string[];
}
export default function CreateJobPost() {
  const navigate = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [formData, setFormData] = useState<JobPostingFormData>({
    // Overview tab
    jobType: 'Full time or Direct Hire',
    category: '',
    subCategory: '',
    // Job Details tab
    jobTitle: '',
    rolesResponsibilities: '',
    skillsRequired: '',
    benefits: '',
    // Contract tab
    jobRole: 'Internship',
    contractDuration: '3 months',
    experienceLevel: '',
    isContractToHire: 'Yes',
    workplaceType: '',
    location: '',
    // Budget tab
    budget: '24',
    paymentPeriod: 'Per Hour',
    minBudget: '24',
    maxBudget: '24',
    isUnpaidInternship: false,
    isVolunteering: false,
    // Application tab
    applicationCategory: '',
    applicationQuestions: []
  });
  const handleUpdateFormData = (data: Partial<JobPostingFormData>) => {
    setFormData(prev => ({
      ...prev,
      ...data
    }));
  };
  const handleContinue = () => {
    switch (activeTab) {
      case 'overview':
        setActiveTab('jobdetails');
        break;
      case 'jobdetails':
        setActiveTab('contract');
        break;
      case 'contract':
        setActiveTab('budget');
        break;
      case 'budget':
        setActiveTab('application');
        break;
      case 'application':
        // Submit the form and navigate to review page
        navigate.push('/profile/dashboard');
        break;
    }
  };
  return <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-200 py-4 px-6">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center">
            <svg width="110" height="32" viewBox="0 0 40 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-8">
              <path d="M20.0001 0L0 11.5556V23.1111L20.0001 11.5556L40.0001 23.1111V11.5556L20.0001 0Z" fill="#FF3B30" />
              <path d="M0 23.1111L20.0001 11.5555V23.1111V34.6667L0 23.1111Z" fill="#34C759" />
              <path d="M40.0001 23.1111L20.0001 11.5555V23.1111V34.6667L40.0001 23.1111Z" fill="#007AFF" />
            </svg>
            <span className="ml-2 font-bold text-xl">ICPWork</span>
          </div>
          <button onClick={() => navigate.push('/profile/dashboard')} className="px-8 py-2 rounded-full border border-gray-300 text-gray-800 hover:bg-gray-50">
            Exit
          </button>
        </div>
      </header>
      <div className="flex-1 flex flex-col p-6">
        <div className="max-w-4xl mx-auto w-full">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Tell us about the job role</h1>
            <div className="text-sm text-gray-600">
              {activeTab === 'overview' ? 'Overview' : 'Projects'} Details:{' '}
              <span className="font-medium">1/5 Done</span>
            </div>
          </div>
          <JobPostingTabs activeTab={activeTab} setActiveTab={setActiveTab} />
          <div className="mt-8">
            {activeTab === 'overview' && <OverviewStep formData={formData} updateFormData={handleUpdateFormData} />}
            {activeTab === 'jobdetails' && <JobDetailsStep formData={formData} updateFormData={handleUpdateFormData} />}
            {activeTab === 'contract' && <ContractLocationStep formData={formData} updateFormData={handleUpdateFormData} />}
            {activeTab === 'budget' && <BudgetStep formData={formData} updateFormData={handleUpdateFormData} />}
            {activeTab === 'application' && <ApplicationStep formData={formData} updateFormData={handleUpdateFormData} />}
            <div className="flex justify-center mt-12">
              <button onClick={handleContinue} className="px-12 py-3 bg-[#001F3F] text-white rounded-full hover:bg-[#003366] transition-colors">
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>;
}