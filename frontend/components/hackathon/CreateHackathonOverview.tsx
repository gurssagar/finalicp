'use client'
import React, { useState } from 'react';
import { Calendar, MapPin, Clock, Users, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { HackathonImageUpload } from './HackathonImageUpload';

interface HackathonOverviewData {
  title: string;
  shortDescription: string;
  fullDescription: string;
  bannerImage: string | null;
  bannerImageFile: File | null;
  startDate: string;
  endDate: string;
  location: string;
  isVirtual: boolean;
  maxParticipants: number;
  registrationFee: number;
  techStack: string;
  experienceLevel: string;
  theme: string;
  tagline: string;
  rules: string;
}

interface CreateHackathonOverviewProps {
  data: HackathonOverviewData;
  onDataChange: (data: HackathonOverviewData) => void;
  className?: string;
}

export function CreateHackathonOverview({
  data,
  onDataChange,
  className
}: CreateHackathonOverviewProps) {
  const updateField = (field: keyof HackathonOverviewData, value: string | number | boolean | File | null) => {
    onDataChange({ ...data, [field]: value });
  };

  const handleImageSelect = (file: File | null, url?: string) => {
    onDataChange({
      ...data,
      bannerImageFile: file,
      bannerImage: url || null
    });
  };

  return (
    <div className={cn('space-y-6', className)}>
      <h3 className="text-lg font-semibold text-gray-900">Hackathon Overview</h3>

      <div className="space-y-6">
        {/* Banner Image */}
        <HackathonImageUpload
          onImageSelect={handleImageSelect}
          currentImage={data.bannerImage}
        />

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hackathon Title *
          </label>
          <input
            type="text"
            value={data.title}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder="Enter hackathon title"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Tagline */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tagline
            <span className="text-gray-400 font-normal ml-1">(Optional)</span>
          </label>
          <input
            type="text"
            value={data.tagline}
            onChange={(e) => updateField('tagline', e.target.value)}
            placeholder="A catchy phrase to attract participants (e.g., 'Code the Future')"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Keep it short and memorable - max 100 characters
          </p>
        </div>

        {/* Short Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Short Description *
          </label>
          <textarea
            value={data.shortDescription}
            onChange={(e) => updateField('shortDescription', e.target.value)}
            placeholder="Brief description of your hackathon (1-2 sentences)"
            rows={2}
            maxLength={200}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            This will be shown in hackathon listings and search results
          </p>
        </div>

        {/* Full Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Description *
          </label>
          <textarea
            value={data.fullDescription}
            onChange={(e) => updateField('fullDescription', e.target.value)}
            placeholder="Detailed description of your hackathon, including goals, target audience, challenges, and what participants will learn..."
            rows={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Be comprehensive - include hackathon goals, expected outcomes, and any specific requirements
          </p>
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Calendar className="w-4 h-4 inline mr-1" />
              Start Date & Time *
            </label>
            <input
              type="datetime-local"
              value={data.startDate}
              onChange={(e) => updateField('startDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Calendar className="w-4 h-4 inline mr-1" />
              End Date & Time *
            </label>
            <input
              type="datetime-local"
              value={data.endDate}
              onChange={(e) => updateField('endDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <MapPin className="w-4 h-4 inline mr-1" />
            Location
          </label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isVirtual"
                checked={data.isVirtual}
                onChange={(e) => updateField('isVirtual', e.target.checked)}
                className="rounded"
              />
              <label htmlFor="isVirtual" className="text-sm text-gray-700">
                Virtual Event
              </label>
            </div>
            <input
              type="text"
              value={data.location}
              onChange={(e) => updateField('location', e.target.value)}
              placeholder={data.isVirtual ? "Online platform (e.g., Zoom, Discord)" : "Physical address"}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Participants and Fee */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Users className="w-4 h-4 inline mr-1" />
              Max Participants
            </label>
            <input
              type="number"
              value={data.maxParticipants}
              onChange={(e) => updateField('maxParticipants', Number(e.target.value))}
              placeholder="100"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <DollarSign className="w-4 h-4 inline mr-1" />
              Registration Fee ($)
            </label>
            <input
              type="number"
              value={data.registrationFee}
              onChange={(e) => updateField('registrationFee', Number(e.target.value))}
              placeholder="0"
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Tech Stack */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tech Stack *
          </label>
          <input
            type="text"
            value={data.techStack}
            onChange={(e) => updateField('techStack', e.target.value)}
            placeholder="e.g., React, Node.js, Web3, AI/ML"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Specify the main technologies participants should know or will work with
          </p>
        </div>

        {/* Experience Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Experience Level
          </label>
          <select
            value={data.experienceLevel}
            onChange={(e) => updateField('experienceLevel', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select experience level</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
            <option value="All Levels">All Levels</option>
          </select>
        </div>

        {/* Theme */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Theme
            <span className="text-gray-400 font-normal ml-1">(Optional)</span>
          </label>
          <input
            type="text"
            value={data.theme}
            onChange={(e) => updateField('theme', e.target.value)}
            placeholder="e.g., AI/ML, Web3, Sustainability, Healthcare"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            The main theme or focus area of your hackathon
          </p>
        </div>

        {/* Rules */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rules & Guidelines
            <span className="text-gray-400 font-normal ml-1">(Optional)</span>
          </label>
          <textarea
            value={data.rules}
            onChange={(e) => updateField('rules', e.target.value)}
            placeholder="Outline the rules, judging criteria, submission requirements, and any important guidelines..."
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Include participation rules, submission guidelines, judging criteria, and important deadlines
          </p>
        </div>
      </div>
    </div>
  );
}