'use client'
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Clock,
  Settings,
  AlertCircle,
  CheckCircle,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { HackathonCanister } from '@/lib/hackathon-canister';
import { Hackathon, CreateHackathonRequest } from '@/lib/hackathon-agent';

interface EditHackathonPageProps {
  params: {
    hackathonId: string;
  };
}

export default function EditHackathonPage({ params }: EditHackathonPageProps) {
  const { hackathonId } = params;
  const router = useRouter();

  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<CreateHackathonRequest>({
    title: '',
    tagline: '',
    description: '',
    theme: '',
    mode: { Online: null, Offline: null, Hybrid: null },
    location: '',
    start_date: '',
    end_date: '',
    registration_start: '',
    registration_end: '',
    min_team_size: 1,
    max_team_size: 4,
    prize_pool: '',
    rules: ''
  });

  const [userEmail, setUserEmail] = useState<string>('');

  // Get user email from session
  useEffect(() => {
    const getUserEmail = async () => {
      try {
        // Try to get session from API first
        const sessionResponse = await fetch('/api/auth/session');
        const sessionData = await sessionResponse.json();
        
        if (sessionData.success && sessionData.session) {
          console.log('✅ Got user email from session:', sessionData.session.email);
          return sessionData.session.email;
        } else {
          // Fallback to /api/auth/me
          const meResponse = await fetch('/api/auth/me');
          const meData = await meResponse.json();
          
          if (meData.success && meData.session) {
            console.log('✅ Got user email from /api/auth/me:', meData.session.email);
            return meData.session.email;
          } else {
            throw new Error('No session found');
          }
        }
      } catch (error) {
        console.error('Error getting user session:', error);
        return 'client@example.com'; // Fallback
      }
    };

    getUserEmail().then(email => {
      setUserEmail(email);
    });
  }, []);

  // Load hackathon data
  const loadHackathon = useCallback(async () => {
    if (!hackathonId) return;

    try {
      setLoading(true);
      setError(null);

      const agent = await HackathonCanister;
      const hackathonData = await agent.getHackathonById(hackathonId);

      if (!hackathonData) {
        setError('Hackathon not found');
        return;
      }

      setHackathon(hackathonData);

      // Populate form with existing data
      setFormData({
        title: hackathonData.title,
        tagline: hackathonData.tagline,
        description: hackathonData.description,
        theme: hackathonData.theme,
        mode: hackathonData.mode,
        location: hackathonData.location,
        start_date: new Date(hackathonData.start_date).toISOString().slice(0, 16),
        end_date: new Date(hackathonData.end_date).toISOString().slice(0, 16),
        registration_start: new Date(hackathonData.registration_start).toISOString().slice(0, 16),
        registration_end: new Date(hackathonData.registration_end).toISOString().slice(0, 16),
        min_team_size: hackathonData.min_team_size,
        max_team_size: hackathonData.max_team_size,
        prize_pool: hackathonData.prize_pool,
        rules: hackathonData.rules
      });

    } catch (err) {
      console.error('Error loading hackathon:', err);
      setError('Failed to load hackathon details');
    } finally {
      setLoading(false);
    }
  }, [hackathonId]);

  // Load hackathon on component mount
  useEffect(() => {
    loadHackathon();
  }, [loadHackathon]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: parseInt(value) || 1
      }));
    } else if (name === 'mode') {
      setFormData(prev => ({
        ...prev,
        mode: { [value]: null } as any
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Validate form data
  const validateForm = (): string[] => {
    const errors: string[] = [];

    if (!formData.title.trim()) errors.push('Title is required');
    if (!formData.tagline.trim()) errors.push('Tagline is required');
    if (!formData.description.trim()) errors.push('Description is required');
    if (!formData.theme.trim()) errors.push('Theme is required');
    if (!formData.location.trim()) errors.push('Location is required');
    if (!formData.prize_pool.trim()) errors.push('Prize pool is required');
    if (!formData.rules.trim()) errors.push('Rules are required');

    if (!formData.start_date) errors.push('Start date is required');
    if (!formData.end_date) errors.push('End date is required');
    if (!formData.registration_start) errors.push('Registration start date is required');
    if (!formData.registration_end) errors.push('Registration end date is required');

    if (new Date(formData.start_date) >= new Date(formData.end_date)) {
      errors.push('End date must be after start date');
    }

    if (new Date(formData.registration_start) >= new Date(formData.registration_end)) {
      errors.push('Registration end date must be after registration start date');
    }

    if (new Date(formData.registration_end) >= new Date(formData.start_date)) {
      errors.push('Registration must end before hackathon starts');
    }

    if (formData.min_team_size < 1) errors.push('Minimum team size must be at least 1');
    if (formData.max_team_size < formData.min_team_size) {
      errors.push('Maximum team size must be greater than or equal to minimum team size');
    }

    return errors;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validateForm();
    if (errors.length > 0) {
      setError(errors.join(', '));
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const agent = await HackathonCanister;

      // Convert dates to ISO format
      const updateData = {
        ...formData,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString(),
        registration_start: new Date(formData.registration_start).toISOString(),
        registration_end: new Date(formData.registration_end).toISOString()
      };

      const result = await agent.updateHackathon(hackathonId, updateData as any);

      if (result) {
        setSuccess('Hackathon updated successfully!');

        // Update local state
        setHackathon(prev => prev ? {
          ...prev,
          ...updateData,
          updated_at: new Date().toISOString()
        } : null);

        // Redirect to hackathons page after a delay
        setTimeout(() => {
          router.push('/client/hackathons');
        }, 2000);
      } else {
        setError('Failed to update hackathon');
      }

    } catch (err) {
      console.error('Error updating hackathon:', err);
      setError('An error occurred while updating the hackathon');
    } finally {
      setSaving(false);
    }
  };

  // Get status display text
  const getStatusText = (hackathon: Hackathon) => {
    if (hackathon.status.Upcoming !== null) return 'Upcoming';
    if (hackathon.status.Ongoing !== null) return 'Ongoing';
    if (hackathon.status.Completed !== null) return 'Completed';
    if (hackathon.status.Cancelled !== null) return 'Cancelled';
    return 'Unknown';
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <span className="ml-3 text-gray-600">Loading hackathon details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error && !hackathon) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
              <div>
                <h3 className="text-lg font-medium text-red-800">Error</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
            <div className="mt-4">
              <Link
                href="/client/hackathons"
                className="inline-flex items-center text-purple-600 hover:text-purple-700"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Hackathons
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/client/hackathons"
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to My Hackathons
              </Link>
            </div>
            {hackathon && (
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  hackathon.status.Upcoming ? 'bg-blue-100 text-blue-800' :
                  hackathon.status.Ongoing ? 'bg-green-100 text-green-800' :
                  hackathon.status.Completed ? 'bg-gray-100 text-gray-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {getStatusText(hackathon)}
                </span>
                <span className="text-sm text-gray-500">
                  Last updated: {formatDate(hackathon.updated_at)}
                </span>
              </div>
            )}
          </div>

          <div className="mt-6">
            <h1 className="text-3xl font-bold text-gray-900">Edit Hackathon</h1>
            <p className="mt-2 text-gray-600">
              Update the details and settings for your hackathon event.
            </p>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-green-800">Success!</h3>
                <p className="text-sm text-green-700">{success}</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Edit Form */}
        {hackathon && (
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="md:col-span-2 space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title *
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Enter hackathon title"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tagline *
                      </label>
                      <input
                        type="text"
                        name="tagline"
                        value={formData.tagline}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Enter catchy tagline"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Describe your hackathon event"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Theme *
                      </label>
                      <input
                        type="text"
                        name="theme"
                        value={formData.theme}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="e.g., Web Development, AI, Mobile"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mode *
                      </label>
                      <select
                        name="mode"
                        value={Object.keys(formData.mode)[0]}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="Online">Online</option>
                        <option value="Offline">Offline</option>
                        <option value="Hybrid">Hybrid</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location *
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter location or 'Virtual' for online events"
                    />
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="md:col-span-2">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Dates & Schedule</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Registration Start *
                    </label>
                    <input
                      type="datetime-local"
                      name="registration_start"
                      value={formData.registration_start}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Registration End *
                    </label>
                    <input
                      type="datetime-local"
                      name="registration_end"
                      value={formData.registration_end}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hackathon Start *
                    </label>
                    <input
                      type="datetime-local"
                      name="start_date"
                      value={formData.start_date}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hackathon End *
                    </label>
                    <input
                      type="datetime-local"
                      name="end_date"
                      value={formData.end_date}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Team Settings */}
              <div className="md:col-span-2">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Team Settings</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Team Size *
                    </label>
                    <input
                      type="number"
                      name="min_team_size"
                      value={formData.min_team_size}
                      onChange={handleInputChange}
                      min="1"
                      max="10"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maximum Team Size *
                    </label>
                    <input
                      type="number"
                      name="max_team_size"
                      value={formData.max_team_size}
                      onChange={handleInputChange}
                      min="1"
                      max="10"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prize Pool *
                    </label>
                    <input
                      type="text"
                      name="prize_pool"
                      value={formData.prize_pool}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="e.g., $5,000"
                    />
                  </div>
                </div>
              </div>

              {/* Rules */}
              <div className="md:col-span-2">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Rules & Guidelines</h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rules *
                  </label>
                  <textarea
                    name="rules"
                    value={formData.rules}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter the rules and guidelines for participants..."
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
              <Link
                href="/client/hackathons"
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}