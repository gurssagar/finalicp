'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useServiceForm } from '@/context/ServiceFormContext'
import { AddProjectNav } from '@/components/freelancer/AddProjectNav'
import { HelpCircle } from 'lucide-react'
export default function AddServiceProjects() {
  const router = useRouter()
  const { formData, updateFormData } = useServiceForm()
  const handleTierModeToggle = () => {
    updateFormData({
      tierMode: formData.tierMode === '1tier' ? '3tier' : '1tier',
    })
  }
  const handleTitleChange = (tier: string, value: string) => {
    updateFormData({
      [`${tier}Title`]: value,
    })
  }

  const handleDescriptionChange = (tier: string, value: string) => {
    updateFormData({
      [`${tier}Description`]: value,
    })
  }
  const handleContinue = () => {
    router.push('/freelancer/add-service/pricing')
  }
  return (
    <div className="flex flex-col min-h-screen bg-white">
     
      <main className="flex-1 container mx-auto py-6 px-4 max-w-5xl">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[#161616]">
            Add Your Services
          </h1>
          <div className="text-sm text-gray-600">
            Projects Details: <span className="font-medium">2/5 Done</span>
          </div>
        </div>
        <AddProjectNav />
        <div className="mt-12">
          <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-xl font-semibold text-[#161616]">
                Client Requirements
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                Add your questions and requirements here.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">1 Tier</span>
              <div
                className={`w-12 h-6 rounded-full flex items-center p-0.5 cursor-pointer ${formData.tierMode === '3tier' ? 'bg-green-500' : 'bg-gray-200'}`}
                onClick={handleTierModeToggle}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200 ${formData.tierMode === '3tier' ? 'transform translate-x-6' : ''}`}
                ></div>
              </div>
              <span className="text-sm font-medium">3 Tiers</span>
            </div>
          </div>
          {formData.tierMode === '1tier' ? (
            <div className="max-w-md mx-auto">
              <div className="mb-8">
                <div className="bg-[#FFF8D6] p-4 rounded-t-lg text-center font-medium">
                  Basic Package
                </div>
                <div className="border border-gray-200 rounded-b-lg p-6">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Package Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Complete Website Design Package"
                      value={formData.basicTitle}
                      onChange={(e) => handleTitleChange('basic', e.target.value)}
                      className="w-full p-3 border border-gray-200 rounded-lg outline-none"
                    />
                    <div className="flex justify-end text-xs text-gray-500 mt-1">
                      {formData.basicTitle.length}/240
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      What's Included
                    </label>
                    <textarea
                      placeholder="Describe what this package includes, deliverables, and scope of work..."
                      value={formData.basicDescription}
                      onChange={(e) => handleDescriptionChange('basic', e.target.value)}
                      className="w-full p-3 border border-gray-200 rounded-lg outline-none resize-none"
                      rows={4}
                    />
                    <div className="flex justify-end text-xs text-gray-500 mt-1">
                      {formData.basicDescription.length}/1000
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="mb-8">
                <div className="bg-[#FFF8D6] p-4 rounded-t-lg text-center font-medium">
                  Basic
                </div>
                <div className="border border-gray-200 rounded-b-lg p-6">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Package Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Starter Website Package"
                      value={formData.basicTitle}
                      onChange={(e) => handleTitleChange('basic', e.target.value)}
                      className="w-full p-3 border border-gray-200 rounded-lg outline-none"
                    />
                    <div className="flex justify-end text-xs text-gray-500 mt-1">
                      {formData.basicTitle.length}/240
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      What's Included
                    </label>
                    <textarea
                      placeholder="Describe what this basic package includes..."
                      value={formData.basicDescription}
                      onChange={(e) => handleDescriptionChange('basic', e.target.value)}
                      className="w-full p-3 border border-gray-200 rounded-lg outline-none resize-none"
                      rows={3}
                    />
                    <div className="flex justify-between items-center mt-1">
                      <button className="text-xs text-blue-500 flex items-center">
                        <HelpCircle size={12} className="mr-1" />
                        Help?
                      </button>
                      <div className="text-xs text-gray-500">
                        {formData.basicDescription.length}/1000
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mb-8">
                <div className="bg-[#DFFCE9] p-4 rounded-t-lg text-center font-medium">
                  Advanced
                </div>
                <div className="border border-gray-200 rounded-b-lg p-6">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Package Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Professional Website Package"
                      value={formData.advancedTitle}
                      onChange={(e) =>
                        handleTitleChange('advanced', e.target.value)
                      }
                      className="w-full p-3 border border-gray-200 rounded-lg outline-none"
                    />
                    <div className="flex justify-end text-xs text-gray-500 mt-1">
                      {formData.advancedTitle.length}/240
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      What's Included
                    </label>
                    <textarea
                      placeholder="Describe what this advanced package includes..."
                      value={formData.advancedDescription}
                      onChange={(e) => handleDescriptionChange('advanced', e.target.value)}
                      className="w-full p-3 border border-gray-200 rounded-lg outline-none resize-none"
                      rows={3}
                    />
                    <div className="flex justify-between items-center mt-1">
                      <button className="text-xs text-blue-500 flex items-center">
                        <HelpCircle size={12} className="mr-1" />
                        Help?
                      </button>
                      <div className="text-xs text-gray-500">
                        {formData.advancedDescription.length}/1000
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mb-8">
                <div className="bg-[#E9D8FF] p-4 rounded-t-lg text-center font-medium">
                  Premium
                </div>
                <div className="border border-gray-200 rounded-b-lg p-6">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Package Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Enterprise Website Package"
                      value={formData.premiumTitle}
                      onChange={(e) =>
                        handleTitleChange('premium', e.target.value)
                      }
                      className="w-full p-3 border border-gray-200 rounded-lg outline-none"
                    />
                    <div className="flex justify-end text-xs text-gray-500 mt-1">
                      {formData.premiumTitle.length}/240
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      What's Included
                    </label>
                    <textarea
                      placeholder="Describe what this premium package includes..."
                      value={formData.premiumDescription}
                      onChange={(e) => handleDescriptionChange('premium', e.target.value)}
                      className="w-full p-3 border border-gray-200 rounded-lg outline-none resize-none"
                      rows={3}
                    />
                    <div className="flex justify-between items-center mt-1">
                      <button className="text-xs text-blue-500 flex items-center">
                        <HelpCircle size={12} className="mr-1" />
                        Help?
                      </button>
                      <div className="text-xs text-gray-500">
                        {formData.premiumDescription.length}/1000
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-center mt-12">
            <button
              onClick={handleContinue}
              className="px-12 py-3 bg-rainbow-gradient text-white rounded-full font-medium hover:opacity-90 transition-opacity"
            >
              Continue
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}