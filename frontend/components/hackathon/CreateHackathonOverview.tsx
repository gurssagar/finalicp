'use client'
import React, { useState } from 'react';
import { Calendar, MapPin, Clock, Users, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HackathonOverviewData {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  isVirtual: boolean;
  maxParticipants: number;
  registrationFee: number;
  tags: string[];
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
  const updateField = (field: keyof HackathonOverviewData, value: string | number | boolean | string[]) => {
    onDataChange({ ...data, [field]: value });
  };

  const addTag = (tag: string) => {
    if (tag.trim() && !data.tags.includes(tag)) {
      updateField('tags', [...data.tags, tag.trim()]);
    }
  };

  const removeTag = (tag: string) => {
    updateField('tags', data.tags.filter(t => t !== tag));
  };

  return (
    <div className={cn('space-y-6', className)}>
      <h3 className="text-lg font-semibold text-gray-900">Hackathon Overview</h3>

      <div className="space-y-4">
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

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            value={data.description}
            onChange={(e) => updateField('description', e.target.value)}
            placeholder="Describe your hackathon, its goals, and what participants can expect"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
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

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tags
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {data.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-md flex items-center space-x-1"
              >
                <span>{tag}</span>
                <button
                  onClick={() => removeTag(tag)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Add tag (e.g., AI, Web3, Mobile)"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  addTag(e.currentTarget.value);
                  e.currentTarget.value = '';
                }
              }}
            />
            <button
              onClick={(e) => {
                const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                addTag(input.value);
                input.value = '';
              }}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}