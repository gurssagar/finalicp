'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Share, Download, Clock, Calendar, Users, Trophy, MapPin, Globe, Edit } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// Types for the preview data
interface PreviewHackathonData {
  id: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  techStack: string;
  experienceLevel: string;
  location: string;
  registrationDuration: {
    start: string;
    end: string;
  };
  hackathonDuration: {
    start: string;
    end: string;
  };
  votingDuration: {
    start: string;
    end: string;
  };
  prizes: Array<{
    id: string;
    name: string;
    description: string;
    winners: number;
    amount: string;
  }>;
  judges: Array<{
    id: string;
    name: string;
    email: string;
    expertise: string[];
  }>;
  schedule: Array<{
    id: string;
    dateRange: string;
    name: string;
    description: string;
  }>;
  status: string;
  createdAt: string;
  updatedAt: string;
}

function HackathonPreviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [hackathonData, setHackathonData] = useState<PreviewHackathonData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const dataParam = searchParams.get('data');
    if (dataParam) {
      try {
        const decodedData = JSON.parse(atob(dataParam));
        setHackathonData(decodedData);
      } catch (error) {
        console.error('Failed to decode preview data:', error);
        setError('Invalid preview data');
      } finally {
        setIsLoading(false);
      }
    } else {
      setError('No preview data provided');
      setIsLoading(false);
    }
  }, [searchParams]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: hackathonData?.name || 'Hackathon Preview',
          text: hackathonData?.shortDescription || '',
          url: window.location.href
        });
      } catch (error) {
        console.error('Failed to share:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Preview link copied to clipboard!');
    }
  };

  const handleDownload = () => {
    if (!hackathonData) return;

    const dataStr = JSON.stringify(hackathonData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    const exportFileDefaultName = `hackathon-preview-${hackathonData.name.replace(/\s+/g, '-').toLowerCase()}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'TBD';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const isVirtual = hackathonData?.location.toLowerCase().includes('online') ||
                    hackathonData?.location.toLowerCase().includes('virtual');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error || !hackathonData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Preview Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link
            href="/client/create-hackathon"
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Back to Hackathon Creation
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/client/create-hackathon"
                className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft size={20} className="mr-2" />
                Back to Editing
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">Preview Mode</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleShare}
                className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                <Share size={16} className="mr-2" />
                Share
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                <Download size={16} className="mr-2" />
                Export
              </button>
              <Link
                href="/client/create-hackathon"
                className="flex items-center px-4 py-2 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                <Edit size={16} className="mr-2" />
                Continue Editing
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-6">
        {/* Hackathon Overview Card */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{hackathonData.name}</h1>
                <p className="text-lg text-gray-600 mb-4">{hackathonData.shortDescription}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                    {hackathonData.techStack}
                  </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    {hackathonData.experienceLevel}
                  </span>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                    {hackathonData.status}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-gray-700 leading-relaxed mb-6">{hackathonData.fullDescription}</p>

            {/* Key Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-6 border-t border-gray-200">
              <div className="flex items-center">
                <Calendar className="text-gray-400 mr-3" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Registration</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(hackathonData.registrationDuration.start)} - {formatDate(hackathonData.registrationDuration.end)}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <Clock className="text-gray-400 mr-3" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Event Duration</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(hackathonData.hackathonDuration.start)} - {formatDate(hackathonData.hackathonDuration.end)}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                {isVirtual ? (
                  <Globe className="text-gray-400 mr-3" size={20} />
                ) : (
                  <MapPin className="text-gray-400 mr-3" size={20} />
                )}
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium text-gray-900">{hackathonData.location}</p>
                </div>
              </div>

              <div className="flex items-center">
                <Trophy className="text-gray-400 mr-3" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Prize Pool</p>
                  <p className="font-medium text-gray-900">{hackathonData.prizes[0]?.amount || 'TBD'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Prizes Section */}
        {hackathonData.prizes && hackathonData.prizes.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Prizes & Rewards</h2>
              <div className="space-y-4">
                {hackathonData.prizes.map((prize, index) => (
                  <div key={prize.id} className="flex items-start justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{prize.name}</h3>
                      <p className="text-gray-600 text-sm mt-1">{prize.description}</p>
                      <p className="text-sm text-gray-500 mt-2">{prize.winners} winner(s)</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">{prize.amount}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Judges Section */}
        {hackathonData.judges && hackathonData.judges.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Judging Panel</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {hackathonData.judges.map((judge) => (
                  <div key={judge.id} className="p-4 border border-gray-200 rounded-lg">
                    <h3 className="font-semibold text-gray-900">{judge.name}</h3>
                    <p className="text-gray-600 text-sm mt-1">{judge.email}</p>
                    <div className="mt-2">
                      <div className="flex flex-wrap gap-1">
                        {judge.expertise.map((skill, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Schedule Section */}
        {hackathonData.schedule && hackathonData.schedule.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Event Schedule</h2>
              <div className="space-y-4">
                {hackathonData.schedule.map((event) => (
                  <div key={event.id} className="flex items-start">
                    <div className="flex-shrink-0 mr-4">
                      <div className="w-3 h-3 bg-purple-600 rounded-full mt-2"></div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{event.name}</h3>
                        <p className="text-sm text-gray-500">{event.dateRange}</p>
                      </div>
                      <p className="text-gray-600">{event.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Preview Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Preview ID</p>
                <p className="font-medium text-gray-900">{hackathonData.id}</p>
              </div>
              <div>
                <p className="text-gray-500">Last Updated</p>
                <p className="font-medium text-gray-900">
                  {new Date(hackathonData.updatedAt).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Created</p>
                <p className="font-medium text-gray-900">
                  {new Date(hackathonData.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Status</p>
                <p className="font-medium text-gray-900 capitalize">{hackathonData.status}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function HackathonPreviewPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <HackathonPreviewContent />
    </Suspense>
  );
}