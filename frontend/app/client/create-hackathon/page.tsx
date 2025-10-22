'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreateHackathonNav } from '@/components/hackathon/CreateHackathonNav';
import { CreateHackathonOverview } from '@/components/hackathon/CreateHackathonOverview';
import CreateHackathonPrizes from '@/components/hackathon/CreateHackathonPrizes';
import CreateHackathonJudges from '@/components/hackathon/CreateHackathonJudges';
import CreateHackathonSchedule from '@/components/hackathon/CreateHackathonSchedule';
import { X, Save, Eye, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHackathonForm } from '@/context/HackathonFormContext';
import { HackathonFormProvider } from '@/context/HackathonFormContext';

function CreateHackathonContent() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [activeToast, setActiveToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const {
    formData,
    submitHackathon,
    isSubmitting,
    submissionError,
    isAutoSaving,
    lastSavedAt,
    saveDraft
  } = useHackathonForm();

  const handleSaveDraft = async () => {
    try {
      const success = await saveDraft();
      if (success) {
        showToast('Draft saved successfully!', 'success');
      } else {
        showToast('Failed to save draft', 'error');
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      showToast('Error saving draft', 'error');
    }
  };

  const handlePreviewPublication = () => {
    setShowPreviewModal(true);
  };

  const handlePublishHackathon = async () => {
    try {
      // Get user email from session or localStorage
      const userEmail = localStorage.getItem('userEmail') || 'test@example.com';

      if (!userEmail) {
        showToast('Please log in to publish a hackathon', 'error');
        return;
      }

      const result = await submitHackathon(userEmail);

      if (result.success) {
        showToast('Hackathon published successfully!', 'success');
        setShowPublishModal(false);

        // Navigate to hackathon page after short delay
        setTimeout(() => {
          router.push(`/client/hackathons/${result.hackathonId}`);
        }, 2000);
      } else {
        showToast(result.error || 'Failed to publish hackathon', 'error');
      }
    } catch (error) {
      console.error('Error publishing hackathon:', error);
      showToast('Error publishing hackathon', 'error');
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setActiveToast({ message, type });
    setTimeout(() => setActiveToast(null), 3000);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <CreateHackathonOverview />;
      case 'prizes':
        return <CreateHackathonPrizes />;
      case 'judges':
        return <CreateHackathonJudges />;
      case 'schedule':
        return <CreateHackathonSchedule />;
      default:
        return <CreateHackathonOverview />;
    }
  };

  const getCompletionPercentage = () => {
    let completed = 0;
    let total = 100;

    // Basic Info (30%)
    if (formData.title.trim()) completed += 10;
    if (formData.description.trim()) completed += 10;
    if (formData.startDate && formData.endDate) completed += 10;

    // Event Details (30%)
    if (formData.mode && formData.location) completed += 10;
    if (formData.registrationStart && formData.registrationEnd) completed += 10;
    if (formData.maxParticipants > 0) completed += 10;

    // Content (40%)
    if (formData.prizes.length > 0) completed += 15;
    if (formData.judges.length > 0) completed += 15;
    if (formData.schedule.length > 0) completed += 10;

    return Math.round((completed / total) * 100);
  };

  const completionPercentage = getCompletionPercentage();

  const renderPreview = () => (
    <div className="bg-white rounded-lg max-w-2xl mx-auto p-6">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{formData.title || 'Untitled Hackathon'}</h2>
          {formData.tagline && <p className="text-lg text-gray-600 mb-4">{formData.tagline}</p>}
          {formData.bannerImage && (
            <img src={formData.bannerImage} alt="Hackathon banner" className="w-full h-48 object-cover rounded-lg" />
          )}
        </div>

        {/* Key Details */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <h4 className="font-semibold text-gray-900">Mode</h4>
            <p className="text-gray-600">{formData.mode}</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">Location</h4>
            <p className="text-gray-600">{formData.location || 'TBD'}</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">Participants</h4>
            <p className="text-gray-600">Max {formData.maxParticipants}</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">Team Size</h4>
            <p className="text-gray-600">{formData.minTeamSize}-{formData.maxTeamSize}</p>
          </div>
        </div>

        {/* Dates */}
        <div className="border-t pt-4">
          <h4 className="font-semibold text-gray-900 mb-2">Timeline</h4>
          <div className="space-y-2 text-sm">
            <p><strong>Registration:</strong> {formData.registrationStart} to {formData.registrationEnd}</p>
            <p><strong>Hackathon:</strong> {formData.startDate} to {formData.endDate}</p>
          </div>
        </div>

        {/* Prizes */}
        {formData.prizes.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="font-semibold text-gray-900 mb-2">Prizes</h4>
            <div className="space-y-2">
              {formData.prizes.slice(0, 3).map((prize, index) => (
                <div key={index} className="flex justify-between">
                  <span>{prize.position || prize.title}</span>
                  <span>{prize.type === 'cash' ? `$${prize.amount}` : 'Non-cash'}</span>
                </div>
              ))}
              {formData.prizes.length > 3 && (
                <p className="text-sm text-gray-500">+{formData.prizes.length - 3} more prizes</p>
              )}
            </div>
          </div>
        )}

        {/* Judges */}
        {formData.judges.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="font-semibold text-gray-900 mb-2">Judges</h4>
            <div className="flex flex-wrap gap-2">
              {formData.judges.slice(0, 5).map((judge, index) => (
                <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                  {judge.name || 'Judge ' + (index + 1)}
                </span>
              ))}
              {formData.judges.length > 5 && (
                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                  +{formData.judges.length - 5} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Description */}
        <div className="border-t pt-4">
          <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
          <p className="text-gray-600 whitespace-pre-wrap">
            {formData.description || 'No description provided.'}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Toast Notification */}
      {activeToast && (
        <div className={cn(
          'fixed top-4 right-4 z-50 flex items-center space-x-2 px-4 py-3 rounded-lg shadow-lg transition-all',
          activeToast.type === 'success'
            ? 'bg-green-500 text-white'
            : 'bg-red-500 text-white'
        )}>
          {activeToast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span>{activeToast.message}</span>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left: Save & Quit */}
            <button
              onClick={handleSaveDraft}
              disabled={isAutoSaving}
              className={cn(
                "flex items-center text-gray-600 hover:text-gray-800 transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md px-3 py-2",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
              aria-label="Save hackathon draft and quit"
            >
              <X size={18} className="mr-2" />
              <span>{isAutoSaving ? 'Saving...' : 'Save & Quit'}</span>
            </button>

            {/* Center: Title & Progress */}
            <div className="flex items-center space-x-4">
              <h1 className="text-lg font-semibold text-gray-900">Create Hackathon</h1>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600">{completionPercentage}%</span>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center space-x-3">
              {/* Auto-save indicator */}
              {lastSavedAt && (
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  <Save size={14} className={isAutoSaving ? 'animate-pulse' : ''} />
                  <span>{isAutoSaving ? 'Saving...' : 'Saved'}</span>
                </div>
              )}

              <button
                onClick={handlePreviewPublication}
                className="flex items-center px-3 py-2 text-blue-600 hover:text-blue-700 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                aria-label="Preview hackathon publication"
              >
                <Eye size={16} className="mr-2" />
                Preview
              </button>

              <button
                onClick={() => setShowPublishModal(true)}
                disabled={completionPercentage < 70 || isSubmitting}
                className={cn(
                  "px-4 py-2 rounded-md text-white transition-colors flex items-center",
                  completionPercentage >= 70
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-gray-400 cursor-not-allowed",
                  isSubmitting && "opacity-50 cursor-not-allowed"
                )}
                aria-label="Publish hackathon"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Upload size={16} className="mr-2" />
                    Publish
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <CreateHackathonNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        {/* Main content */}
        <main
          className="flex-1 overflow-y-auto"
          role="main"
          aria-label="Hackathon creation form"
        >
          <div className="p-6">
            {renderTabContent()}

            {/* Error Display */}
            {submissionError && (
              <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <h4 className="font-semibold text-red-800">Error</h4>
                </div>
                <p className="text-red-700 mt-1">{submissionError}</p>
              </div>
            )}

            {/* Completion Tips */}
            {completionPercentage < 70 && (
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">Almost there!</h4>
                <p className="text-blue-700">
                  Complete more sections to enable publishing. Add basic information, dates, prizes, judges, and schedule to reach 70% completion.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold">Hackathon Preview</h3>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              {renderPreview()}
            </div>
            <div className="sticky bottom-0 bg-white border-t p-4 flex justify-end space-x-3">
              <button
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowPreviewModal(false);
                  setShowPublishModal(true);
                }}
                disabled={completionPercentage < 70}
                className={cn(
                  "px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700",
                  completionPercentage < 70 && "bg-gray-400 cursor-not-allowed"
                )}
              >
                Publish Hackathon
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Publish Confirmation Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Publish Hackathon</h3>

              <div className="space-y-4">
                {/* Summary */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">{formData.title || 'Untitled Hackathon'}</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>📅 {formData.startDate} - {formData.endDate}</p>
                    <p>📍 {formData.mode} • {formData.location}</p>
                    <p>👥 Max {formData.maxParticipants} participants</p>
                    <p>🏆 {formData.prizes.length} prize{formData.prizes.length !== 1 ? 's' : ''}</p>
                    <p>⚖️ {formData.judges.length} judge{formData.judges.length !== 1 ? 's' : ''}</p>
                    <p>📅 {formData.schedule.length} scheduled event{formData.schedule.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>

                {/* Completion Status */}
                <div className="flex items-center space-x-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${completionPercentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{completionPercentage}%</span>
                </div>

                {/* Warning if not complete */}
                {completionPercentage < 70 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                      <span className="text-yellow-800 text-sm">
                        Your hackathon is {100 - completionPercentage}% incomplete. Consider adding more details before publishing.
                      </span>
                    </div>
                  </div>
                )}

                {/* Terms */}
                <div className="text-xs text-gray-500">
                  By publishing, you confirm that all information is accurate and you have the rights to organize this hackathon.
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowPublishModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePublishHackathon}
                  disabled={isSubmitting || completionPercentage < 70}
                  className={cn(
                    "px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center",
                    (isSubmitting || completionPercentage < 70) && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Publishing...
                    </>
                  ) : (
                    'Publish Hackathon'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CreateHackathonPage() {
  return (
    <HackathonFormProvider>
      <CreateHackathonContent />
    </HackathonFormProvider>
  );
}