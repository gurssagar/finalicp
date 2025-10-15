import React from 'react'
import { SkillTag } from './skillTag'
interface ProfilePreviewProps {
  name?: string
  skills?: string[]
  location?: string
  hasResume?: boolean
}
export function ProfilePreview({
  name = 'Cyrus Roshan',
  skills = ['Prototyping', 'Development', 'Wireframing'],
  location,
  hasResume = false,
}: ProfilePreviewProps) {
  return (
    <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 relative overflow-hidden">
      {/* Gradient background effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-orange-50 via-white to-blue-50 opacity-20"></div>
      <div className="relative z-10">
        {/* Profile Image */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-400"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
        </div>
        {/* Name */}
        <h2 className="text-3xl font-bold text-center text-[#161616] mb-4">
          {name}
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
            {skills.map((skill, index) => (
              <SkillTag
                key={index}
                skill={skill}
                removable={false}
                className="bg-white"
              />
            ))}
          </div>
        </div>
        {/* Location */}
        {location && (
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
              <span>{location}</span>
            </div>
          </div>
        )}
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
            {hasResume ? (
              <span className="text-gray-700">Resume.pdf</span>
            ) : (
              <span className="text-gray-400">No resume uploaded</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
