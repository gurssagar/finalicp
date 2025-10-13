"use client"
import React, { useState } from 'react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ProgressStepper } from '@/components/progress-stepper'
import { ProfilePreview } from '@/components/profilePreview'
import { ChevronDown } from 'lucide-react'
import { useRouter } from 'next/navigation'
export function AddressDetails() {
  const navigate = useRouter()
  const [isPrivate, setIsPrivate] = useState(true)
  const [country, setCountry] = useState('USA')
  const [state, setState] = useState('')
  const [city, setCity] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [streetAddress, setStreetAddress] = useState('')
  const handleNext = () => {
    // Save address details and navigate to next step
    navigate.push('/onboarding/profile')
  }
  const handleBack = () => {
    navigate.push('/onboarding/skills')
  }
  return (
    <div className="flex flex-col min-h-screen bg-[#fcfcfc]">
      <Header />
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
                    className={`text-sm ${!isPrivate ? 'text-gray-500' : 'text-[#161616]'}`}
                  >
                    Private
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={!isPrivate}
                      onChange={() => setIsPrivate(!isPrivate)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2ba24c]"></div>
                  </label>
                  <span
                    className={`text-sm ${isPrivate ? 'text-gray-500' : 'text-[#161616]'}`}
                  >
                    Public
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="relative">
                  <label className="block text-xs text-gray-500 mb-1 ml-1">
                    SELECT COUNTRY
                  </label>
                  <div className="relative">
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
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
                      value={state}
                      onChange={(e) => setState(e.target.value)}
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
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
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
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
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
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
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
                  className="px-12 py-3 bg-[#000000] text-white rounded-full font-bold shadow-md hover:bg-gray-800 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
            <div className="hidden md:block">
              <ProfilePreview
                location={
                  state && city ? `${city}, ${state}, ${country}` : undefined
                }
              />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
