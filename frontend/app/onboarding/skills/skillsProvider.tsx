"use client"
import React, { useState } from 'react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ProgressStepper } from '@/components/progress-stepper'
import { ProfilePreview } from '@/components/profilePreview'
import { SkillTag } from '@/components/skillTag'
import { useRouter } from 'next/navigation'
export function SkillsSelection() {
  const navigate = useRouter()
  const [skillInput, setSkillInput] = useState('')
  const [skills, setSkills] = useState<string[]>([])
  const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault()
      if (!skills.includes(skillInput.trim())) {
        setSkills([...skills, skillInput.trim()])
      }
      setSkillInput('')
    }
  }
  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove))
  }
  const handleNext = () => {
    // Save skills and navigate to next step
    navigate.push('/onboarding/address')
  }
  const handleBack = () => {
    // Navigate back to welcome page
    navigate.push('/onboarding/welcome')
  }
  return (
    <div className="flex flex-col min-h-screen bg-[#fcfcfc]">
      <Header />
      <div className="flex-1">
        <div className="container mx-auto py-8 px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <div className="mb-8">
                <ProgressStepper currentStep={2} totalSteps={5} />
              </div>
              <h1 className="text-3xl font-bold text-[#161616] mb-8">
                What are your skills?
              </h1>
              <div className="mb-8">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="SKILLS"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={handleAddSkill}
                    className="w-full py-3 px-4 border border-[#cacaca] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2ba24c] text-[#7d7d7d]"
                  />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {skills.map((skill, index) => (
                    <SkillTag
                      key={index}
                      skill={skill}
                      onRemove={() => handleRemoveSkill(skill)}
                    />
                  ))}
                </div>
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
              <ProfilePreview skills={skills.length > 0 ? skills : undefined} />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
