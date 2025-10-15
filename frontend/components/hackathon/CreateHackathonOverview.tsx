'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Upload, Calendar, X } from 'lucide-react';
import { RichTextEditor } from './RichTextEditor';
import { cn } from '@/lib/utils';

// TypeScript interfaces
interface DateRange {
  start: string;
  end: string;
}

interface SocialLink {
  platform: 'x.com' | 'discord.com' | 'telegram.org' | 'github.com';
  url: string;
}

interface HackathonData {
  name: string;
  image?: string;
  shortDescription: string;
  registrationDuration: DateRange;
  hackathonDuration: DateRange;
  votingDuration: DateRange;
  techStack: string;
  experienceLevel: string;
  location: string;
  socialLinks: SocialLink[];
  fullDescription: string;
}

interface CreateHackathonOverviewProps {
  hackathonData: HackathonData;
  updateHackathonData: (updates: Partial<HackathonData>) => void;
}

interface DatePickerState {
  registration: boolean;
  hackathon: boolean;
  voting: boolean;
}

// Static data moved outside component for performance
const TECH_STACK_OPTIONS = [
  { value: '', label: 'Select tech stack' },
  { value: 'All tech stacks', label: 'All tech stacks' },
  { value: 'Web Development', label: 'Web Development' },
  { value: 'Blockchain', label: 'Blockchain' },
  { value: 'AI/ML', label: 'AI/ML' },
  { value: 'Mobile', label: 'Mobile' },
] as const;

const EXPERIENCE_LEVEL_OPTIONS = [
  { value: '', label: 'Select experience level' },
  { value: 'All levels accepted', label: 'All levels accepted' },
  { value: 'Beginner friendly', label: 'Beginner friendly' },
  { value: 'Intermediate', label: 'Intermediate' },
  { value: 'Advanced', label: 'Advanced' },
] as const;

const SOCIAL_PLATFORMS = [
  { value: 'x.com', label: 'x.com' },
  { value: 'discord.com', label: 'discord.com' },
  { value: 'telegram.org', label: 'telegram.org' },
  { value: 'github.com', label: 'github.com' },
] as const;

export function CreateHackathonOverview({
  hackathonData,
  updateHackathonData
}: CreateHackathonOverviewProps) {
  const [showDatePickers, setShowDatePickers] = useState<DatePickerState>({
    registration: false,
    hackathon: false,
    voting: false
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    updateHackathonData({ [name]: value });
  }, [updateHackathonData]);

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setUploadError('Image size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      // In a real app, you would upload this to a server and get a URL
      const imageUrl = URL.createObjectURL(file);
      updateHackathonData({ image: imageUrl });
    } catch (error) {
      setUploadError('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }, [updateHackathonData]);

  const handleDateChange = useCallback((type: keyof Pick<HackathonData, 'registrationDuration' | 'hackathonDuration' | 'votingDuration'>, field: keyof DateRange, value: string) => {
    updateHackathonData({
      [type]: {
        ...hackathonData[type],
        [field]: value
      }
    });
  }, [hackathonData, updateHackathonData]);

  const handleAddSocialLink = useCallback(() => {
    const newLink: SocialLink = { platform: 'x.com', url: '' };
    updateHackathonData({
      socialLinks: [...hackathonData.socialLinks, newLink]
    });
  }, [hackathonData.socialLinks, updateHackathonData]);

  const handleSocialLinkChange = useCallback((index: number, field: keyof SocialLink, value: string) => {
    const updatedLinks = hackathonData.socialLinks.map((link, i) => 
      i === index ? { ...link, [field]: value } : link
    );
    updateHackathonData({ socialLinks: updatedLinks });
  }, [hackathonData.socialLinks, updateHackathonData]);

  const handleRemoveSocialLink = useCallback((index: number) => {
    const updatedLinks = hackathonData.socialLinks.filter((_, i) => i !== index);
    updateHackathonData({ socialLinks: updatedLinks });
  }, [hackathonData.socialLinks, updateHackathonData]);

  const handleDescriptionChange = useCallback((content: string) => {
    updateHackathonData({ fullDescription: content });
  }, [updateHackathonData]);

  const toggleDatePicker = useCallback((type: keyof DatePickerState) => {
    setShowDatePickers(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  }, []);

  const formatDateRange = useMemo(() => (duration: DateRange) => {
    const start = duration.start || 'From';
    const end = duration.end || 'to dates';
    return `${start} — ${end}`;
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8" role="main" aria-label="Hackathon Overview Form">
      {/* Hackathon Name */}
      <div className="space-y-2">
        <label htmlFor="hackathonName" className="block text-sm font-medium text-gray-700">
          Hackathon Name <span className="text-red-500" aria-label="required">*</span>
        </label>
        <input
          type="text"
          id="hackathonName"
          name="name"
          value={hackathonData.name}
          onChange={handleInputChange}
          placeholder="Enter hackathon name"
          required
          aria-describedby="hackathonName-help"
          className={cn(
            "w-full p-3 bg-white border rounded-lg text-gray-800 transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            "hover:border-gray-400",
            hackathonData.name ? "border-gray-300" : "border-red-300"
          )}
        />
        <p id="hackathonName-help" className="text-xs text-gray-500">
          Choose a memorable name for your hackathon
        </p>
      </div>

      {/* Hackathon Banner */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Hackathon Banner
        </label>
        <div className={cn(
          "border-2 border-dashed rounded-lg bg-white h-64 flex items-center justify-center relative overflow-hidden transition-all duration-200",
          "hover:border-blue-400 hover:bg-blue-50",
          isUploading && "opacity-50 cursor-not-allowed"
        )}>
          {hackathonData.image ? (
            <div className="relative w-full h-full group">
              <img 
                src={hackathonData.image} 
                alt="Hackathon banner" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                <button
                  onClick={() => updateHackathonData({ image: undefined })}
                  className="opacity-0 group-hover:opacity-100 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-all duration-200"
                  aria-label="Remove banner image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center p-6">
              <div className="flex flex-col items-center justify-center">
                <Upload className={cn(
                  "w-8 h-8 mb-3 transition-colors duration-200",
                  isUploading ? "text-blue-500 animate-pulse" : "text-gray-400"
                )} />
                <p className="text-gray-600 text-sm mb-1 font-medium">
                  {isUploading ? 'Uploading...' : 'Drag & drop a hackathon banner'}
                </p>
                <p className="text-gray-500 text-sm mb-3">or</p>
                <button
                  onClick={() => document.getElementById('hackathonImage')?.click()}
                  disabled={isUploading}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-md transition-all duration-200",
                    "text-blue-600 hover:text-blue-700 hover:bg-blue-50",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                    isUploading && "opacity-50 cursor-not-allowed"
                  )}
                >
                  Click to browse
                </button>
              </div>
            </div>
          )}
          <input
            type="file"
            id="hackathonImage"
            className="hidden"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={isUploading}
            aria-label="Upload hackathon banner image"
          />
        </div>
        {uploadError && (
          <p className="text-sm text-red-600 flex items-center gap-1" role="alert">
            <X className="w-4 h-4" />
            {uploadError}
          </p>
        )}
      </div>

      {/* Short Description */}
      <div className="space-y-2">
        <label htmlFor="shortDescription" className="block text-sm font-medium text-gray-700">
          Short Description <span className="text-red-500" aria-label="required">*</span>
        </label>
        <textarea
          id="shortDescription"
          name="shortDescription"
          value={hackathonData.shortDescription}
          onChange={handleInputChange}
          placeholder="Short description that goes under key visual"
          required
          rows={4}
          maxLength={200}
          aria-describedby="shortDescription-help shortDescription-count"
          className={cn(
            "w-full p-3 bg-white border rounded-lg text-gray-800 transition-all duration-200 resize-none",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            "hover:border-gray-400"
          )}
        />
        <div className="flex justify-between text-xs text-gray-500">
          <p id="shortDescription-help">Brief overview of your hackathon</p>
          <p id="shortDescription-count" aria-live="polite">
            {hackathonData.shortDescription.length}/200
          </p>
        </div>
      </div>

      {/* Date Ranges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Registration Duration */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Registration Duration <span className="text-red-500" aria-label="required">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={formatDateRange(hackathonData.registrationDuration)}
              readOnly
              onClick={() => toggleDatePicker('registration')}
              className={cn(
                "w-full p-3 bg-white border rounded-lg text-gray-800 cursor-pointer pr-10 transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                "hover:border-gray-400"
              )}
              aria-expanded={showDatePickers.registration}
              aria-haspopup="true"
              aria-label="Select registration duration"
            />
            <Calendar className="absolute right-3 top-3 text-gray-500 pointer-events-none" />
            {showDatePickers.registration && (
              <div className="absolute top-full left-0 mt-2 bg-white border border-gray-300 rounded-lg p-4 z-20 w-full shadow-lg">
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={hackathonData.registrationDuration.start}
                      onChange={(e) => handleDateChange('registrationDuration', 'start', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={hackathonData.registrationDuration.end}
                      onChange={(e) => handleDateChange('registrationDuration', 'end', e.target.value)}
                      min={hackathonData.registrationDuration.start}
                      className="w-full p-2 border border-gray-300 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Hackathon Duration */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Hackathon Duration <span className="text-red-500" aria-label="required">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={formatDateRange(hackathonData.hackathonDuration)}
              readOnly
              onClick={() => toggleDatePicker('hackathon')}
              className={cn(
                "w-full p-3 bg-white border rounded-lg text-gray-800 cursor-pointer pr-10 transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                "hover:border-gray-400"
              )}
              aria-expanded={showDatePickers.hackathon}
              aria-haspopup="true"
              aria-label="Select hackathon duration"
            />
            <Calendar className="absolute right-3 top-3 text-gray-500 pointer-events-none" />
            {showDatePickers.hackathon && (
              <div className="absolute top-full left-0 mt-2 bg-white border border-gray-300 rounded-lg p-4 z-20 w-full shadow-lg">
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={hackathonData.hackathonDuration.start}
                      onChange={(e) => handleDateChange('hackathonDuration', 'start', e.target.value)}
                      min={hackathonData.registrationDuration.end}
                      className="w-full p-2 border border-gray-300 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={hackathonData.hackathonDuration.end}
                      onChange={(e) => handleDateChange('hackathonDuration', 'end', e.target.value)}
                      min={hackathonData.hackathonDuration.start}
                      className="w-full p-2 border border-gray-300 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Voting Duration */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Voting Duration <span className="text-red-500" aria-label="required">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            value={formatDateRange(hackathonData.votingDuration)}
            readOnly
            onClick={() => toggleDatePicker('voting')}
            className={cn(
              "w-full p-3 bg-white border rounded-lg text-gray-800 cursor-pointer pr-10 transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
              "hover:border-gray-400"
            )}
            aria-expanded={showDatePickers.voting}
            aria-haspopup="true"
            aria-label="Select voting duration"
          />
          <Calendar className="absolute right-3 top-3 text-gray-500 pointer-events-none" />
          {showDatePickers.voting && (
            <div className="absolute top-full left-0 mt-2 bg-white border border-gray-300 rounded-lg p-4 z-20 w-full shadow-lg">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={hackathonData.votingDuration.start}
                    onChange={(e) => handleDateChange('votingDuration', 'start', e.target.value)}
                    min={hackathonData.hackathonDuration.end}
                    className="w-full p-2 border border-gray-300 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={hackathonData.votingDuration.end}
                    onChange={(e) => handleDateChange('votingDuration', 'end', e.target.value)}
                    min={hackathonData.votingDuration.start}
                    className="w-full p-2 border border-gray-300 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tech Stack */}
      <div className="space-y-2">
        <label htmlFor="techStack" className="block text-sm font-medium text-gray-700">
          Tech Stack <span className="text-red-500" aria-label="required">*</span>
        </label>
        <div className="relative">
          <select
            id="techStack"
            name="techStack"
            value={hackathonData.techStack}
            onChange={handleInputChange}
            required
            className={cn(
              "w-full p-3 bg-white border rounded-lg text-gray-800 appearance-none transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
              "hover:border-gray-400"
            )}
          >
            {TECH_STACK_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Experience Level */}
      <div className="space-y-2">
        <label htmlFor="experienceLevel" className="block text-sm font-medium text-gray-700">
          Experience Level <span className="text-red-500" aria-label="required">*</span>
        </label>
        <div className="relative">
          <select
            id="experienceLevel"
            name="experienceLevel"
            value={hackathonData.experienceLevel}
            onChange={handleInputChange}
            required
            className={cn(
              "w-full p-3 bg-white border rounded-lg text-gray-800 appearance-none transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
              "hover:border-gray-400"
            )}
          >
            {EXPERIENCE_LEVEL_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="space-y-2">
        <label htmlFor="location" className="block text-sm font-medium text-gray-700">
          Hackathon Location <span className="text-red-500" aria-label="required">*</span>
        </label>
        <input
          type="text"
          id="location"
          name="location"
          value={hackathonData.location}
          onChange={handleInputChange}
          placeholder="Enter hackathon location (e.g., San Francisco, CA or Virtual)"
          required
          className={cn(
            "w-full p-3 bg-white border rounded-lg text-gray-800 transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            "hover:border-gray-400"
          )}
        />
      </div>

      {/* Social Links */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          Social Links
        </label>
        <div className="space-y-3" role="group" aria-label="Social media links">
          {hackathonData.socialLinks.map((link, index) => (
            <div key={index} className="flex gap-3 items-start">
              <div className="relative w-1/4 min-w-[120px]">
                <select
                  value={link.platform}
                  onChange={(e) => handleSocialLinkChange(index, 'platform', e.target.value)}
                  className={cn(
                    "w-full p-3 bg-white border rounded-lg text-gray-800 appearance-none transition-all duration-200",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                    "hover:border-gray-400"
                  )}
                  aria-label={`Social platform for link ${index + 1}`}
                >
                  {SOCIAL_PLATFORMS.map((platform) => (
                    <option key={platform.value} value={platform.value}>
                      {platform.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <input
                type="url"
                value={link.url}
                onChange={(e) => handleSocialLinkChange(index, 'url', e.target.value)}
                placeholder={`Enter link to ${link.platform}`}
                className={cn(
                  "flex-1 p-3 bg-white border rounded-lg text-gray-800 transition-all duration-200",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                  "hover:border-gray-400"
                )}
                aria-label={`URL for ${link.platform} link ${index + 1}`}
              />
              {hackathonData.socialLinks.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveSocialLink(index)}
                  className={cn(
                    "p-3 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200",
                    "focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  )}
                  aria-label={`Remove ${link.platform} link`}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={handleAddSocialLink}
          className={cn(
            "text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1 transition-colors duration-200",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md p-1"
          )}
          aria-label="Add another social media link"
        >
          <span className="text-lg leading-none">+</span>
          Add another link
        </button>
      </div>

      {/* Full Description */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Full Description <span className="text-red-500" aria-label="required">*</span>
        </label>
        <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all duration-200">
          <RichTextEditor
            value={hackathonData.fullDescription}
            onChange={handleDescriptionChange}
          />
        </div>
        <p className="text-xs text-gray-500">
          Provide detailed information about your hackathon, including rules, themes, and expectations
        </p>
      </div>
    </div>
  );
}