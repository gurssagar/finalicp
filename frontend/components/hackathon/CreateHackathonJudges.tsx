'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { ChevronDown, User, Copy, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// TypeScript interfaces
interface Judge {
  id: string;
  email: string;
  role: 'Judge' | 'Admin';
  status: 'active' | 'inactive';
  name?: string;
  avatar?: string;
}

interface PendingJudge {
  id: string;
  email: string;
  status: 'pending' | 'sent' | 'expired';
  invitedAt?: Date;
}

interface HackathonData {
  judges: Judge[];
  pendingJudges: PendingJudge[];
}

interface CreateHackathonJudgesProps {
  hackathonData: HackathonData;
  updateHackathonData: (updates: Partial<HackathonData>) => void;
}

// Static data moved outside component for performance
const JUDGE_ROLES = [
  { value: 'Judge', label: 'Judge' },
  { value: 'Admin', label: 'Admin' }
] as const;

const SAMPLE_JUDGES = [
  { email: 'user@example.com', role: 'Judge' as const },
  { email: 'judgemail@exmpl.com', role: 'Judge' as const }
];

export default function CreateHackathonJudges({
  hackathonData,
  updateHackathonData
}: CreateHackathonJudgesProps) {
  const [inviteEmail, setInviteEmail] = useState<string>('');
  const [inviteLink] = useState<string>('https://hackx.com/invite/aoiudh...123fhf');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [emailError, setEmailError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Email validation
  const validateEmail = useCallback((email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  const handleAddJudge = useCallback((email: string) => {
    const newJudge: Judge = {
      id: `judge-${Date.now()}`,
      email,
      role: 'Judge',
      status: 'active'
    };
    updateHackathonData({
      judges: [...hackathonData.judges, newJudge]
    });
    setSuccessMessage(`Judge ${email} added successfully!`);
    setTimeout(() => setSuccessMessage(''), 3000);
  }, [hackathonData.judges, updateHackathonData]);

  const handleAddPendingJudge = useCallback(async (email: string) => {
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    // Check if email already exists
    const emailExists = [...hackathonData.judges, ...hackathonData.pendingJudges]
      .some(judge => judge.email.toLowerCase() === email.toLowerCase());
    
    if (emailExists) {
      setEmailError('This email has already been invited');
      return;
    }

    setIsLoading(true);
    setEmailError('');

    try {
      const newPendingJudge: PendingJudge = {
        id: `pending-${Date.now()}`,
        email,
        status: 'pending',
        invitedAt: new Date()
      };
      
      updateHackathonData({
        pendingJudges: [...hackathonData.pendingJudges, newPendingJudge]
      });
      
      setInviteEmail('');
      setSuccessMessage(`Invitation sent to ${email}!`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setEmailError('Failed to send invitation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [hackathonData.judges, hackathonData.pendingJudges, updateHackathonData, validateEmail]);

  const handleRoleChange = useCallback((judgeId: string, role: 'Judge' | 'Admin') => {
    const updatedJudges = hackathonData.judges.map(judge => {
      if (judge.id === judgeId) {
        return { ...judge, role };
      }
      return judge;
    });
    updateHackathonData({ judges: updatedJudges });
  }, [hackathonData.judges, updateHackathonData]);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy link: ', err);
      setEmailError('Failed to copy link to clipboard');
    }
  }, [inviteLink]);

  const handleSendInvite = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inviteEmail.trim()) {
      await handleAddPendingJudge(inviteEmail.trim());
    }
  }, [inviteEmail, handleAddPendingJudge]);

  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInviteEmail(value);
    if (emailError) {
      setEmailError('');
    }
  }, [emailError]);

  // Memoized computed values
  const totalJudges = useMemo(() => 
    hackathonData.judges.length + hackathonData.pendingJudges.length, 
    [hackathonData.judges.length, hackathonData.pendingJudges.length]
  );

  const hasActiveJudges = useMemo(() => 
    hackathonData.judges.length > 0, 
    [hackathonData.judges.length]
  );

  const hasPendingJudges = useMemo(() => 
    hackathonData.pendingJudges.length > 0, 
    [hackathonData.pendingJudges.length]
  );
  return (
    <div className="max-w-4xl mx-auto space-y-8" role="main" aria-label="Hackathon judges management">
      {/* Success/Error Messages */}
      {successMessage && (
        <div 
          className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800"
          role="alert"
          aria-live="polite"
        >
          <CheckCircle size={20} />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Judge Statistics */}
      <div className="bg-gray-50 p-4 rounded-lg border">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Judge Overview</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">{hackathonData.judges.length}</div>
            <div className="text-sm text-gray-600">Active Judges</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-600">{hackathonData.pendingJudges.length}</div>
            <div className="text-sm text-gray-600">Pending Invites</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-600">{totalJudges}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          {/* Active Judges Section */}
          {hasActiveJudges && (
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Active Judges</h3>
              <div className="space-y-2">
                {hackathonData.judges.map(judge => (
                  <div 
                    key={judge.id} 
                    className={cn(
                      "flex items-center justify-between py-4 px-3 border border-gray-200 rounded-lg",
                      "hover:bg-gray-50 transition-colors duration-200"
                    )}
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center mr-4">
                        <User size={20} className="text-white" />
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">{judge.email}</span>
                        <div className="text-sm text-gray-500">Active Judge</div>
                      </div>
                    </div>
                    <div className="relative">
                      <select 
                        value={judge.role} 
                        onChange={(e) => handleRoleChange(judge.id, e.target.value as 'Judge' | 'Admin')}
                        className={cn(
                          "appearance-none bg-white border border-gray-300 rounded-md",
                          "pr-8 pl-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500",
                          "hover:border-gray-400 transition-colors"
                        )}
                        aria-label={`Change role for ${judge.email}`}
                      >
                        {JUDGE_ROLES.map(role => (
                          <option key={role.value} value={role.value}>
                            {role.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown 
                        size={16} 
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pending Judges Section */}
          {hasPendingJudges && (
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Pending Invitations</h3>
              <div className="space-y-2">
                {hackathonData.pendingJudges.map(judge => (
                  <div 
                    key={judge.id} 
                    className={cn(
                      "flex items-center justify-between py-4 px-3 border border-gray-200 rounded-lg",
                      "bg-yellow-50 border-yellow-200"
                    )}
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center mr-4">
                        <Mail size={20} className="text-yellow-600" />
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">{judge.email}</span>
                        <div className="text-sm text-yellow-600">Invitation pending</div>
                      </div>
                    </div>
                    <span className="text-sm text-yellow-600 font-medium">Pending</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sample Judges Section */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Suggested Judges</h3>
            {SAMPLE_JUDGES.map((sampleJudge, index) => (
              <button 
                key={index}
                type="button" 
                onClick={() => handleAddJudge(sampleJudge.email)}
                className={cn(
                  "w-full flex items-center justify-between py-4 px-3 border border-gray-200 rounded-lg",
                  "hover:bg-blue-50 hover:border-blue-300 transition-all duration-200",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                )}
                aria-label={`Add ${sampleJudge.email} as judge`}
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center mr-4">
                    <User size={20} className="text-white" />
                  </div>
                  <span className="font-medium text-gray-900">{sampleJudge.email}</span>
                </div>
                <span className="text-sm text-blue-600 font-medium">{sampleJudge.role}</span>
              </button>
            ))}
          </div>

          {/* Empty State */}
          {!hasActiveJudges && !hasPendingJudges && (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <User size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No judges yet</h3>
              <p className="text-gray-600 mb-4">Start by inviting judges to your hackathon</p>
            </div>
          )}
        </div>
        {/* Invitation Panel */}
        <div className={cn(
          "bg-white border border-gray-300 rounded-lg p-6 shadow-sm",
          "hover:shadow-md transition-shadow duration-200"
        )}>
          <h2 className="text-xl font-medium mb-2 text-gray-900">
            Invite to judge hackathon
          </h2>
          <p className="text-gray-600 mb-6">
            Invite judges via invite link or email
          </p>

          {/* Invite Link Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Invitation Link
            </label>
            <div className="relative">
              <input 
                type="text" 
                value={inviteLink} 
                readOnly 
                className={cn(
                  "w-full p-3 pr-24 bg-gray-50 border border-gray-300 rounded-md",
                  "text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500",
                  "select-all"
                )}
                aria-label="Invitation link"
              />
              <button 
                onClick={handleCopyLink}
                className={cn(
                  "absolute right-2 top-1/2 transform -translate-y-1/2",
                  "flex items-center gap-1 px-3 py-1 rounded text-sm font-medium",
                  "transition-colors duration-200",
                  copySuccess 
                    ? "text-green-600 bg-green-50" 
                    : "text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                )}
                aria-label="Copy invitation link"
              >
                {copySuccess ? (
                  <>
                    <CheckCircle size={16} />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center mb-6">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="px-4 text-gray-500 text-sm">or</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Email Invitation Form */}
          <form onSubmit={handleSendInvite} className="space-y-4">
            <div>
              <label htmlFor="inviteEmail" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <input 
                  id="inviteEmail"
                  type="email" 
                  value={inviteEmail} 
                  onChange={handleEmailChange}
                  placeholder="Enter judge's email address" 
                  className={cn(
                    "w-full p-3 bg-white border rounded-md text-gray-800",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors",
                    emailError 
                      ? "border-red-300 focus:ring-red-500" 
                      : "border-gray-300 hover:border-gray-400"
                  )}
                  aria-describedby={emailError ? "email-error" : undefined}
                  disabled={isLoading}
                />
                {isLoading && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  </div>
                )}
              </div>
              {emailError && (
                <div 
                  id="email-error"
                  className="flex items-center gap-2 mt-2 text-red-600 text-sm"
                  role="alert"
                  aria-live="polite"
                >
                  <AlertCircle size={16} />
                  <span>{emailError}</span>
                </div>
              )}
            </div>

            <button 
              type="submit" 
              disabled={isLoading || !inviteEmail.trim()}
              className={cn(
                "w-full p-3 rounded-md font-medium transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                isLoading || !inviteEmail.trim()
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md"
              )}
              aria-label="Send invitation email"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Sending...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Mail size={18} />
                  Send Invite
                </div>
              )}
            </button>
          </form>

          {/* Help Text */}
          <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Tip:</strong> Judges will receive an email with instructions to join your hackathon. 
              They can also use the invitation link above.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}