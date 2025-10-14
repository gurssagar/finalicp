"use client"
import React, { useState } from 'react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ProgressStepper } from '@/components/progress-stepper'
import { ProfilePreview } from '@/components/profilePreview'
import { useRouter } from 'next/navigation'
import { File } from 'lucide-react'
import { useOnboarding } from '@/hooks/useOnboarding'
export function ResumeUpload() {
  const navigate = useRouter()
  const [linkedinProfile, setLinkedinProfile] = useState('')

  const {
    resume,
    profile,
    skills,
    error,
    updateResume,
    goToNextStep,
    goToPreviousStep,
    isLoading
  } = useOnboarding()

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      updateResume({
        fileName: file.name,
        file: file,
        hasResume: true
      })
    }
  }

  const handleBack = () => {
    goToPreviousStep(5)
  }

  const handleComplete = async () => {
    const success = await goToNextStep(5)
    if (success) {
      navigate.push('/onboarding/verification-complete')
    }
  }
  return (
    <div>
      <div>
        <div className="flex flex-col min-h-screen bg-white">
          <Header />
          <div className="flex-1">
            <div className="container mx-auto py-8 px-4">
              <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                  <div className="mb-8">
                    <ProgressStepper currentStep={5} totalSteps={5} />
                  </div>
                  </div>
                  <h1 className="text-3xl font-bold text-[#161616] mb-8">
                    Almost Done! Add your Resume
                  </h1>

                  {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg">
                      {error}
                    </div>
                  )}
                  <div className="mb-8">
                    <div className="uppercase text-sm text-gray-500 mb-2">
                      ADD YOUR RESUME
                    </div>
                    <div className="border border-[#cacaca] rounded-md p-4">
                      <label className="flex items-center cursor-pointer">
                        <File className="mr-2 text-gray-500" size={24} />
                        <span className="text-gray-600 hover:underline">
                          {resume.fileName || 'Click here to upload Your Resume'}
                        </span>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          className="hidden"
                          onChange={handleResumeChange}
                        />
                      </label>
                    </div>
                  </div>
                  <div className="mb-8">
                    <div className="uppercase text-sm text-gray-500 mb-2">
                      ADD LINKEDIN PROFILE
                    </div>
                    <input
                      type="text"
                      placeholder="Add your profile Link Here"
                      value={linkedinProfile}
                      onChange={(e) => setLinkedinProfile(e.target.value)}
                      className="w-full py-3 px-4 border border-[#cacaca] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2ba24c] text-[#7d7d7d]"
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
                      onClick={handleComplete}
                      disabled={isLoading}
                      className="px-12 py-3 bg-[#000000] text-white rounded-full font-bold shadow-md hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Completing...' : 'Yay! Let\'s Go To Workspace'}
                    </button>
                  </div>
                </div>
                <div className="hidden md:block">
                  <ProfilePreview
                    firstName={profile.firstName}
                    lastName={profile.lastName}
                    bio={profile.bio}
                    phone={profile.phone}
                    location={profile.location}
                    website={profile.website}
                    linkedin={profile.linkedin}
                    github={profile.github}
                    twitter={profile.twitter}
                    skills={skills.length > 0 ? skills : []}
                    hasResume={resume.hasResume}
                  />
                    <div className="absolute inset-0 bg-gradient-to-b from-orange-50 via-white to-blue-50 opacity-20"></div>
                    <div className="relative z-10">
                      {/* Profile Image */}
                      <div className="flex justify-center mb-6">
                        <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden">
                          <img
                            src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=300&auto=format&fit=crop"
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                      {/* Name */}
                      <h2 className="text-3xl font-bold text-center text-[#161616] mb-4">
                        Cyrus Roshan
                      </h2>
                      {/* Availability */}
                      <div className="flex justify-center mb-8">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 relative">
                            <div className="w-full h-full rounded-full bg-[#2ba24c]"></div>
                          </div>
                          <span className="text-gray-700">Available for work</span>
                        </div>
                      </div>
                      {/* Skills */}
                      <div className="mb-6">
                        <h3 className="uppercase text-gray-500 text-xs font-medium mb-3">
                          SKILLS
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {['Prototyping', 'Development', 'Wireframing'].map(
                            (skill, index) => (
                              <div
                                key={index}
                                className="inline-flex items-center px-3 py-1 rounded-full border border-dashed border-gray-300 text-sm bg-white"
                              >
                                <span>{skill}</span>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                      {/* Location */}
                      <div className="mb-6">
                        <h3 className="uppercase text-gray-500 text-xs font-medium mb-3">
                          LOCATION
                        </h3>
                        <div className="flex items-center gap-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-gray-400"
                          >
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                          </svg>
                          <span>California, CA, USA</span>
                        </div>
                      </div>
                      {/* Resume */}
                      <div>
                        <h3 className="uppercase text-gray-500 text-xs font-medium mb-3">
                          RESUME
                        </h3>
                        <div className="flex items-center gap-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-gray-400"
                          >
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="16" y1="13" x2="8" y2="13"></line>
                            <line x1="16" y1="17" x2="8" y2="17"></line>
                            <polyline points="10 9 9 9 8 9"></polyline>
                          </svg>
                          <span className="text-gray-700">
                            {resume.fileName || 'resume.pdf'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
