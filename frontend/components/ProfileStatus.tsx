'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Clock, User } from 'lucide-react';

interface ProfileStatusData {
  isComplete: boolean;
  profileSubmitted: boolean;
  message: string;
}

export default function ProfileStatus() {
  const [profileStatus, setProfileStatus] = useState<ProfileStatusData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileStatus = async () => {
      try {
        const response = await fetch('/api/profile/check-completeness');
        const result = await response.json();

        if (result.success) {
          setProfileStatus({
            isComplete: result.isComplete,
            profileSubmitted: result.profileSubmitted || false,
            message: result.message,
          });
        }
      } catch (error) {
        console.error('Error fetching profile status:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileStatus();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!profileStatus) {
    return null;
  }

  const { isComplete, profileSubmitted, message } = profileStatus;

  const getStatusIcon = () => {
    if (profileSubmitted) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    } else if (isComplete) {
      return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    } else {
      return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    if (profileSubmitted) {
      return 'border-green-200 bg-green-50';
    } else if (isComplete) {
      return 'border-yellow-200 bg-yellow-50';
    } else {
      return 'border-gray-200 bg-white';
    }
  };

  const getStatusText = () => {
    if (profileSubmitted) {
      return 'Profile Submitted';
    } else if (isComplete) {
      return 'Profile Complete - Ready to Submit';
    } else {
      return 'Profile Incomplete';
    }
  };

  const getStatusDescription = () => {
    if (profileSubmitted) {
      return 'Your profile has been successfully submitted and is being reviewed.';
    } else if (isComplete) {
      return 'Your profile is complete. Submit it to start applying for opportunities.';
    } else {
      return 'Complete your profile to unlock all features and opportunities.';
    }
  };

  return (
    <div className={`rounded-lg border p-4 transition-colors ${getStatusColor()}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getStatusIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <User className="w-4 h-4 text-gray-500" />
            <h3 className="text-sm font-medium text-gray-900">
              {getStatusText()}
            </h3>
          </div>
          <p className="text-sm text-gray-600 mb-2">
            {getStatusDescription()}
          </p>
          <p className="text-xs text-gray-500">
            {message}
          </p>

          {!profileSubmitted && isComplete && (
            <div className="mt-3">
              <button
                onClick={() => window.location.href = '/onboarding'}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
              >
                Submit Profile Now
                <CheckCircle className="w-4 h-4" />
              </button>
            </div>
          )}

          {!isComplete && (
            <div className="mt-3">
              <button
                onClick={() => window.location.href = '/onboarding'}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
              >
                Complete Profile
                <User className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}