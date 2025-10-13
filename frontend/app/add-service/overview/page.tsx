'use client'
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ServiceNavigation } from '@/components/ServiceNavigation';
import { useServiceForm } from '@/context/ServiceFormContext';
import { Check, Edit } from 'lucide-react';
export default function AddServiceOverview() {
  const navigate = useRouter();
  const {
    formData,
    updateFormData,
    isSaved,
    setSaved
  } = useServiceForm();
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showSubCategoryDropdown, setShowSubCategoryDropdown] = useState(false);
  const categories = ['Web Designer', 'UI/UX Designer', 'Graphic Designer', 'Frontend Developer', 'Full Stack Developer'];
  const subCategories = ['Web Design', 'Mobile Design', 'Logo Design', 'Branding', 'Illustration'];
  const handleServiceTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFormData({
      serviceTitle: e.target.value
    });
    setSaved('serviceTitle', true);
  };
  const handleCategorySelect = (category: string) => {
    updateFormData({
      mainCategory: category
    });
    setShowCategoryDropdown(false);
  };
  const handleSubCategorySelect = (subCategory: string) => {
    updateFormData({
      subCategory: subCategory
    });
    setShowSubCategoryDropdown(false);
  };
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateFormData({
      description: e.target.value
    });
    setSaved('description', true);
  };
  const handleWhatsIncludedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFormData({
      whatsIncluded: e.target.value
    });
    setSaved('whatsIncluded', true);
  };
  const handleContinue = () => {
    navigate.push('/add-service/projects');
  };
  return <div className="flex flex-col min-h-screen bg-white">
      <header className="flex justify-between items-center p-4 border-b border-gray-200">
        <div className="flex items-center">
          <svg width="40" height="32" viewBox="0 0 40 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20.0001 0L0 11.5556V23.1111L20.0001 11.5556L40.0001 23.1111V11.5556L20.0001 0Z" fill="#FF3B30" />
            <path d="M0 23.1111L20.0001 11.5555V23.1111V34.6667L0 23.1111Z" fill="#34C759" />
            <path d="M40.0001 23.1111L20.0001 11.5555V23.1111V34.6667L40.0001 23.1111Z" fill="#007AFF" />
          </svg>
          <span className="ml-2 font-bold text-xl text-[#161616]">ICPWork</span>
        </div>
        <button className="px-8 py-2 rounded-full border border-gray-300 text-gray-800 hover:bg-gray-50">
          Exit
        </button>
      </header>
      <main className="flex-1 container mx-auto py-6 px-4 max-w-5xl">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[#161616]">
            Add Your Services
          </h1>
          <div className="text-sm text-gray-600">
            Overview Details: <span className="font-medium">3/5 Done</span>
          </div>
        </div>
        <ServiceNavigation activeTab="overview" />
        <div className="mt-12">
          <div className="mb-8">
            <div className="text-xs text-gray-500 uppercase mb-1">
              SERVICE TITLE
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4 relative">
              <input type="text" placeholder="UI UX Designer" value={formData.serviceTitle} onChange={handleServiceTitleChange} className="w-full outline-none text-lg" />
              {isSaved.serviceTitle && <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center text-green-600">
                  <Check size={16} className="mr-1" />
                  <span className="text-sm">Saved</span>
                </div>}
            </div>
          </div>
          <div className="mb-8">
            <div className="text-xs text-gray-500 uppercase mb-1">
              MAIN CATEGORY
            </div>
            <div className="relative">
              <div className="bg-white border border-gray-200 rounded-lg p-4 flex justify-between items-center cursor-pointer" onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}>
                <span className="text-lg">{formData.mainCategory}</span>
                <button className="text-sm text-gray-600 flex items-center">
                  <Edit size={16} className="mr-1" />
                  Edit
                </button>
              </div>
              {showCategoryDropdown && <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                  {categories.map(category => <div key={category} className="p-3 hover:bg-gray-100 cursor-pointer" onClick={() => handleCategorySelect(category)}>
                      {category}
                    </div>)}
                </div>}
            </div>
          </div>
          <div className="mb-8">
            <div className="text-xs text-gray-500 uppercase mb-1">
              SUB-CATEGORY
            </div>
            <div className="relative">
              <div className="bg-white border border-gray-200 rounded-lg p-4 flex justify-between items-center cursor-pointer" onClick={() => setShowSubCategoryDropdown(!showSubCategoryDropdown)}>
                <span className="text-lg">
                  {formData.subCategory || 'Select Sub-Category'}
                </span>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
              {showSubCategoryDropdown && <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                  {subCategories.map(subCategory => <div key={subCategory} className="p-3 hover:bg-gray-100 cursor-pointer" onClick={() => handleSubCategorySelect(subCategory)}>
                      {subCategory}
                    </div>)}
                </div>}
            </div>
          </div>
          <div className="mb-8">
            <div className="text-xs text-gray-500 uppercase mb-1">
              WHAT'S INCLUDED
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4 relative">
              <input type="text" placeholder="Describe the service you're offering in a concise, clear title." value={formData.whatsIncluded} onChange={handleWhatsIncludedChange} className="w-full outline-none text-lg" />
              {isSaved.whatsIncluded && <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center text-green-600">
                  <Check size={16} className="mr-1" />
                  <span className="text-sm">Saved</span>
                </div>}
            </div>
          </div>
          <div className="mb-12">
            <div className="text-xs text-gray-500 uppercase mb-1">
              DESCRIPTION
            </div>
            <div className="border border-gray-200 rounded-lg p-4 relative">
              <textarea value={formData.description} onChange={handleDescriptionChange} className="w-full min-h-[100px] outline-none resize-none" placeholder="Describe your service in detail" />
              {isSaved.description && <div className="absolute right-4 top-4 flex items-center text-green-600">
                  <Check size={16} className="mr-1" />
                  <span className="text-sm">Saved</span>
                </div>}
              <div className="flex justify-between items-center mt-2">
                <div></div>
                <div className="text-xs text-gray-500">
                  {formData.description.length}/240
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-center">
            <button onClick={handleContinue} className="px-12 py-3 bg-[#0B1F36] text-white rounded-full font-medium hover:bg-[#1a3a5f] transition-colors">
              Continue
            </button>
          </div>
        </div>
      </main>
    </div>;
}