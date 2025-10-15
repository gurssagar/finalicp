'use client';
import React from 'react';
interface TeamMemberProps {
  member: {
    id: number;
    name: string;
    role: string;
    location: string;
    bio: string;
    skills: string[];
    image: string;
  };
}
export function TeamMember({
  member
}: TeamMemberProps) {
  return <div className="border border-gray-200 rounded-lg p-6">
      <div className="flex flex-col items-center mb-4">
        <div className="w-20 h-20 rounded-full overflow-hidden mb-3">
          <img src={member.image} alt={member.name} className="w-full h-full object-cover" onError={e => {
          const target = e.target as HTMLImageElement;
          target.src = 'https://via.placeholder.com/80';
        }} />
        </div>
        <h3 className="text-xl font-bold">{member.name}</h3>
      </div>
      <div className="flex items-center justify-center gap-2 mb-4">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="text-sm text-gray-600">{member.location}</span>
      </div>
      <p className="text-gray-700 text-sm mb-4">{member.bio}</p>
      <div className="flex flex-wrap gap-2">
        {member.skills.map((skill, index) => <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
            {skill}
          </span>)}
      </div>
    </div>;
}