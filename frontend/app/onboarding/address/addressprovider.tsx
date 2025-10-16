"use client"
import React from 'react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ProgressStepper } from '@/components/progress-stepper'
import { ProfilePreview } from '@/components/profilePreview'
import { ChevronDown } from 'lucide-react'
import { useOnboarding } from '@/hooks/useOnboarding'
export function AddressDetails() {
  const {
    address,
    profile,
    skills,
    error,
    setError,
    updateAddress,
    goToNextStep,
    goToPreviousStep,
    isLoading,
    fullLocation
  } = useOnboarding()

  const handleFieldChange = (field: string, value: string | boolean) => {
    updateAddress({ [field]: value })
  }

  const handleNext = async () => {
    // Validate required fields
    if (!address.state || !address.city || !address.zipCode) {
      setError('Please fill in all required fields')
      return
    }

    await goToNextStep(3)
  }

  const handleBack = () => {
    goToPreviousStep(3)
  }
  return (
    <div className="flex flex-col min-h-screen bg-[#fcfcfc]">
     
      <div className="flex-1">
        <div className="container mx-auto py-8 px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <div className="mb-8">
                <ProgressStepper currentStep={3} totalSteps={5} />
              </div>
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-[#161616]">
                  Your Address Details
                </h1>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm ${!address.isPrivate ? 'text-gray-500' : 'text-[#161616]'}`}
                  >
                    Private
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={!address.isPrivate}
                      onChange={() => handleFieldChange('isPrivate', !address.isPrivate)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2ba24c]"></div>
                  </label>
                  <span
                    className={`text-sm ${address.isPrivate ? 'text-gray-500' : 'text-[#161616]'}`}
                  >
                    Public
                  </span>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="relative">
                  <label className="block text-xs text-gray-500 mb-1 ml-1">
                    SELECT COUNTRY
                  </label>
                  <div className="relative">
                    <select
                      value={address.country}
                      onChange={(e) => handleFieldChange('country', e.target.value)}
                      className="w-full py-3 px-4 border border-[#cacaca] rounded-md shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#2ba24c] text-[#161616]"
                    >
                      <option value="USA">USA</option>
                      <option value="Canada">Canada</option>
                      <option value="UK">UK</option>
                    </select>
                    <ChevronDown
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={20}
                    />
                  </div>
                </div>
                <div className="relative">
                  <label className="block text-xs text-gray-500 mb-1 ml-1">
                    STATE
                  </label>
                  <div className="relative">
                    <select
                      value={address.state}
                      onChange={(e) => handleFieldChange('state', e.target.value)}
                      className="w-full py-3 px-4 border border-[#cacaca] rounded-md shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#2ba24c] text-[#161616]"
                    >
                      <option value="">Select State</option>
                      <option value="CA">California</option>
                      <option value="NY">New York</option>
                      <option value="TX">Texas</option>
                    </select>
                    <ChevronDown
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={20}
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="relative">
                  <label className="block text-xs text-gray-500 mb-1 ml-1">
                    CITY
                  </label>
                  <div className="relative">
                    <select
                      value={address.city}
                      onChange={(e) => handleFieldChange('city', e.target.value)}
                      className="w-full py-3 px-4 border border-[#cacaca] rounded-md shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#2ba24c] text-[#161616]"
                    >
                      <option value="">Select City</option>
                      <option value="Los Angeles">Los Angeles</option>
                      <option value="San Francisco">San Francisco</option>
                      <option value="San Diego">San Diego</option>
                    </select>
                    <ChevronDown
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={20}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1 ml-1">
                    ZIP POSTAL CODE
                  </label>
                  <input
                    type="text"
                    placeholder="121341"
                    value={address.zipCode}
                    onChange={(e) => handleFieldChange('zipCode', e.target.value)}
                    className="w-full py-3 px-4 border border-[#cacaca] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2ba24c] text-[#161616]"
                  />
                </div>
              </div>
              <div className="mb-8">
                <label className="block text-xs text-gray-500 mb-1 ml-1">
                  STREET ADDRESS
                </label>
                <input
                  type="text"
                  placeholder="Enter Address Line 1"
                  value={address.streetAddress}
                  onChange={(e) => handleFieldChange('streetAddress', e.target.value)}
                  className="w-full py-3 px-4 border border-[#cacaca] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2ba24c] text-[#161616]"
                />
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handleBack}
                  className="px-12 py-3 border border-[#000000] rounded-full font-bold text-[#161616] hover:bg-gray-100 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleNext}
                  disabled={isLoading}
                  className="px-12 py-3 bg-[#000000] text-white rounded-full font-bold shadow-md hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Saving...' : 'Next'}
                </button>
              </div>
            </div>
            <div className="hidden md:block">
              <ProfilePreview
                firstName={profile.firstName}
                lastName={profile.lastName}
                bio={profile.bio}
                phone={profile.phone}
                location={fullLocation}
                website={profile.website}
                linkedin={profile.linkedin}
                github={profile.github}
                twitter={profile.twitter}
                skills={skills.length > 0 ? skills : []}
                profileImage={profile.profileImage}
              />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
