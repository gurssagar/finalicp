'use client'
import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Plus, Search, Edit, Trash2, Users, MapPin, Clock, DollarSign, Eye, Settings, AlertCircle, CheckCircle, Trophy, UserCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { HackathonCanister } from '@/lib/hackathon-canister';
import { Hackathon } from '@/lib/hackathon-agent';

interface HackathonWithActions extends Hackathon {
  isOwner?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  participantCount?: number;
  teamsCount?: number;
  // Additional properties from storage
  banner_image?: string;
  registration_fee?: number;
  max_participants?: number;
  prizes?: Array<{
    id: string;
    position: string;
    title: string;
    description: string;
    amount: number;
    currency: string;
    type: 'cash' | 'non-cash';
  }>;
  judges?: Array<{
    id: string;
    name: string;
    email: string;
    bio: string;
    expertise: string[];
    avatar?: string;
    status?: 'pending' | 'accepted' | 'declined';
  }>;
  schedule?: Array<{
    id: string;
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    date: string;
    location?: string;
    type: 'opening' | 'workshop' | 'presentation' | 'break' | 'judging' | 'awards' | 'closing' | 'other';
    speakers?: string[];
    isRequired: boolean;
  }>;
  tags?: string[];
  social_links?: Array<{ platform: string; url: string }>;
}

export default function ClientHackathonsPage() {
  const [hackathons, setHackathons] = useState<HackathonWithActions[]>([]);
  const [filteredHackathons, setFilteredHackathons] = useState<HackathonWithActions[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled'>('all');
  const [sortBy, setSortBy] = useState<'created_at' | 'start_date' | 'title' | 'registration_end'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [userEmail, setUserEmail] = useState<string>('');

  const router = useRouter();

  // Get user email from authentication system
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Try the session endpoint first
        const response = await fetch('/api/auth/session')
        const data = await response.json()

        console.log('🔐 Session Response Received:', data);

        if (data.success && data.session) {
          console.log('✅ Session successful - Setting user email:', data.session.email);
          setUserEmail(data.session.email);
        } else {
          // Fallback to /api/auth/me
          console.log('🔄 Session failed, trying /api/auth/me...');
          const meResponse = await fetch('/api/auth/me')
          const meData = await meResponse.json()

          console.log('🔐 Me Response Received:', meData);

          if (meData.success && meData.session) {
            console.log('✅ Me successful - Setting user email:', meData.session.email);
            setUserEmail(meData.session.email);
          } else {
            // Fallback to localStorage like in preview page
            console.log('🔄 Both auth methods failed, trying localStorage...');
            const localEmail = localStorage.getItem('userEmail') || 'test@example.com';
            console.log('✅ Using localStorage email:', localEmail);
            setUserEmail(localEmail);
          }
        }
      } catch (error) {
        console.error('Error checking authentication:', error)
        // Fallback to localStorage like in preview page
        const localEmail = localStorage.getItem('userEmail') || 'test@example.com';
        console.log('✅ Using localStorage fallback email:', localEmail);
        setUserEmail(localEmail);
      }
    }

    checkAuth()
  }, []);

  // Load user's hackathons
  const loadUserHackathons = useCallback(async () => {
    if (!userEmail) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('🚀 Loading hackathons for user:', userEmail);

      const userHackathons = await fetchUserHackathonsFromApi(userEmail);

      setHackathons(userHackathons);
      setFilteredHackathons(userHackathons);
      console.log(`✅ Loaded ${userHackathons.length} hackathons for ${userEmail}`);
    } catch (err) {
      console.error('Error loading hackathons:', err);
      setError('Failed to load hackathons');
    } finally {
      setLoading(false);
    }
  }, [userEmail]);

  // Function to fetch user hackathons from API
  const fetchUserHackathonsFromApi = async (email: string): Promise<HackathonWithActions[]> => {
    try {
      console.log('🔍 Fetching hackathons for user:', email);

      const response = await fetch(`/api/hackathons/user?userEmail=${encodeURIComponent(email)}`);

      if (!response.ok) {
        console.error('❌ API response not ok:', response.status, response.statusText);
        return [];
      }

      const data = await response.json();
      console.log('📊 Hackathons API response:', data);

      if (data.success && data.hackathons) {
        console.log(`✅ Found ${data.hackathons.length} hackathons for user ${email}`);

        // Transform API data to match frontend interface
        const transformedHackathons = data.hackathons.map((hackathon: any) => {
          const additionalData = hackathon.additional_data || hackathon;

          return {
            hackathon_id: hackathon.hackathon_id,
            title: hackathon.title || 'Untitled Hackathon',
            tagline: hackathon.tagline || 'Created hackathon',
            description: hackathon.description || 'Hackathon created through the platform',
            theme: hackathon.theme || additionalData?.tags?.[0] || 'General',
            mode: hackathon.mode || { Online: null },
            location: hackathon.location || additionalData?.location || 'Virtual',
            start_date: hackathon.start_date || new Date().toISOString(),
            end_date: hackathon.end_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            registration_start: hackathon.registration_start || new Date().toISOString(),
            registration_end: hackathon.registration_end || new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
            min_team_size: hackathon.min_team_size || additionalData?.minTeamSize || 1,
            max_team_size: hackathon.max_team_size || additionalData?.maxTeamSize || 4,
            prize_pool: hackathon.prize_pool || additionalData?.prizes?.reduce((total: number, prize: any) => {
              return total + (prize.type === 'cash' ? prize.amount : 0);
            }, 0).toString() || '0',
            rules: hackathon.rules || '',
            status: hackathon.status || { Upcoming: null },
            created_at: new Date(hackathon.created_at / 1000000).toISOString(),
            updated_at: new Date(hackathon.updated_at / 1000000).toISOString(),

            // Additional data from API response
            banner_image: additionalData?.banner_image || '',
            registration_fee: additionalData?.registration_fee || 0,
            max_participants: additionalData?.max_participants || 100,
            prizes: additionalData?.prizes || [],
            judges: additionalData?.judges || [],
            schedule: additionalData?.schedule || [],
            tags: additionalData?.tags || [],
            social_links: additionalData?.social_links || [],
            organizer_email: additionalData?.organizer_email || email,

            // UI-specific fields
            isOwner: true,
            canEdit: true,
            canDelete: true,
            participantCount: 0, // This would need to be implemented in the API
            teamsCount: 0 // This would need to be implemented in the API
          };
        });

        return transformedHackathons;
      } else {
        console.warn('⚠️ No hackathons found or API returned error:', data.error);
        return [];
      }
    } catch (error) {
      console.error('❌ Error fetching hackathons from API:', error);
      return [];
    }
  };

  // Load hackathons on component mount
  useEffect(() => {
    loadUserHackathons();
  }, [loadUserHackathons]);

  // Filter and sort hackathons
  useEffect(() => {
    let filtered = hackathons.filter(hackathon => {
      // Search filter
      const matchesSearch = searchTerm === '' ||
        hackathon.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hackathon.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hackathon.theme.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      const matchesStatus = statusFilter === 'all' ||
        (statusFilter === 'upcoming' && hackathon.status.Upcoming !== null) ||
        (statusFilter === 'ongoing' && hackathon.status.Ongoing !== null) ||
        (statusFilter === 'completed' && hackathon.status.Completed !== null) ||
        (statusFilter === 'cancelled' && hackathon.status.Cancelled !== null);

      return matchesSearch && matchesStatus;
    });

    // Sort hackathons
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'created_at':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'start_date':
          comparison = new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'registration_end':
          comparison = new Date(a.registration_end).getTime() - new Date(b.registration_end).getTime();
          break;
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });

    setFilteredHackathons(filtered);
  }, [hackathons, searchTerm, statusFilter, sortBy, sortOrder]);

  // Handle hackathon actions
  const handleEditHackathon = (hackathonId: string) => {
    // Find the hackathon data
    const hackathon = hackathons.find(h => h.hackathon_id === hackathonId);
    if (!hackathon) {
      console.error('Hackathon not found:', hackathonId);
      alert('Hackathon not found');
      return;
    }

    // Navigate to create-hackathon page with pre-filled data
    const editData = {
      // Basic Information
      title: hackathon.title,
      tagline: hackathon.tagline,
      description: hackathon.description,
      theme: hackathon.theme,
      bannerImage: hackathon.banner_image,

      // Event Details
      mode: Object.keys(hackathon.mode)[0] as 'Online' | 'Offline' | 'Hybrid',
      location: hackathon.location,
      startDate: hackathon.start_date,
      endDate: hackathon.end_date,
      registrationStart: hackathon.registration_start,
      registrationEnd: hackathon.registration_end,

      // Participation Settings
      maxParticipants: hackathon.max_participants,
      minTeamSize: hackathon.min_team_size,
      maxTeamSize: hackathon.max_team_size,
      registrationFee: hackathon.registration_fee,

      // Content
      prizes: hackathon.prizes || [],
      judges: hackathon.judges || [],
      schedule: hackathon.schedule || [],
      rules: hackathon.rules,

      // Additional Details
      tags: hackathon.tags || [],
      socialLinks: hackathon.social_links || [{ platform: 'x.com', url: '' }],

      // Status & Metadata
      status: 'published' as const,
      publishedAt: new Date(hackathon.created_at).toISOString(),
      createdAt: Date.now() * 1000000,
      updatedAt: Date.now() * 1000000
    };

    // Encode the data and navigate to edit page
    const encodedData = encodeURIComponent(JSON.stringify(editData));
    router.push(`/client/create-hackathon?edit=${hackathonId}&data=${encodedData}`);
  };

  const handleViewHackathon = (hackathonId: string) => {
    router.push(`/client/hackathons/${hackathonId}`);
  };

  const handleDeleteHackathon = async (hackathonId: string) => {
    if (!confirm('Are you sure you want to delete this hackathon? This action cannot be undone.')) {
      return;
    }

    try {
      console.log('🗑️ Deleting hackathon:', hackathonId);

      // Call the API to delete the hackathon
      const response = await fetch(`/api/hackathons/${hackathonId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete hackathon');
      }

      const result = await response.json();
      console.log('✅ Hackathon deleted successfully:', result);

      // Update local state
      setHackathons(prev => prev.filter(h => h.hackathon_id !== hackathonId));
      setFilteredHackathons(prev => prev.filter(h => h.hackathon_id !== hackathonId));

      // Show success message
      alert('Hackathon deleted successfully!');
    } catch (error) {
      console.error('Error deleting hackathon:', error);
      alert('Failed to delete hackathon. Please try again.');
    }
  };

  const handleToggleStatus = async (hackathonId: string) => {
    try {
      const hackathon = hackathons.find(h => h.hackathon_id === hackathonId);
      if (!hackathon) return;

      // Determine next status
      let nextStatus: string;
      if (hackathon.status.Upcoming !== null) {
        nextStatus = 'ongoing';
      } else if (hackathon.status.Ongoing !== null) {
        nextStatus = 'completed';
      } else if (hackathon.status.Completed !== null) {
        nextStatus = 'cancelled';
      } else {
        nextStatus = 'upcoming';
      }

      const newStatus = nextStatus === 'upcoming' ? { Upcoming: null, Ongoing: null, Completed: null, Cancelled: null } :
                       nextStatus === 'ongoing' ? { Upcoming: null, Ongoing: null, Completed: null, Cancelled: null } :
                       nextStatus === 'completed' ? { Upcoming: null, Ongoing: null, Completed: null, Cancelled: null } :
                       { Upcoming: null, Ongoing: null, Completed: null, Cancelled: null };

      await HackathonCanister.updateHackathon(hackathonId, {
        ...hackathon,
        status: newStatus,
        updated_at: new Date().toISOString()
      });

      // Update local state
      setHackathons(prev => prev.map(h =>
        h.hackathon_id === hackathonId
          ? { ...h, status: newStatus, updated_at: new Date().toISOString() }
          : h
      ));
      setFilteredHackathons(prev => prev.map(h =>
        h.hackathon_id === hackathonId
          ? { ...h, status: newStatus, updated_at: new Date().toISOString() }
          : h
      ));

    } catch (error) {
      console.error('Error updating hackathon status:', error);
      alert('Failed to update hackathon status. Please try again.');
    }
  };

  // Get status display text and color
  const getStatusInfo = (hackathon: Hackathon | null) => {
    if (!hackathon || !hackathon.status) {
      return { text: 'Unknown', color: 'bg-gray-100 text-gray-800', icon: AlertCircle };
    }

    if (hackathon.status.Upcoming !== null && hackathon.status.Upcoming !== undefined) {
      return { text: 'Upcoming', color: 'bg-blue-100 text-blue-800', icon: Calendar };
    } else if (hackathon.status.Ongoing !== null && hackathon.status.Ongoing !== undefined) {
      return { text: 'Ongoing', color: 'bg-green-100 text-green-800', icon: Clock };
    } else if (hackathon.status.Completed !== null && hackathon.status.Completed !== undefined) {
      return { text: 'Completed', color: 'bg-gray-100 text-gray-800', icon: CheckCircle };
    } else if (hackathon.status.Cancelled !== null && hackathon.status.Cancelled !== undefined) {
      return { text: 'Cancelled', color: 'bg-red-100 text-red-800', icon: AlertCircle };
    }
    return { text: 'Unknown', color: 'bg-gray-100 text-gray-800', icon: AlertCircle };
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format time for display
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const StatusIcon = AlertCircle;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Hackathons</h1>
              <p className="mt-2 text-gray-600">
                Manage and track your hackathon events. Create, edit, and monitor all your hackathon activities.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                href="/client/create-hackathon"
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Hackathon
              </Link>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search hackathons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="created_at">Date Created</option>
                <option value="start_date">Start Date</option>
                <option value="title">Title</option>
                <option value="registration_end">Registration End</option>
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <span className="ml-3 text-gray-600">Loading hackathons...</span>
            </div>
          </div>
        )}

        {/* Authentication Required State */}
        {!loading && !userEmail && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-yellow-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Authentication Required</h3>
            <p className="text-gray-500 mb-4">
              Please log in to view and manage your hackathons.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Log In to Continue
            </Link>
          </div>
        )}

        {/* Error State */}
        {error && userEmail && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Error loading hackathons</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && userEmail && filteredHackathons.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hackathons found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm ? 'Try adjusting your search terms' : 'Create your first hackathon to get started'}
            </p>
            {!searchTerm && (
              <Link
                href="/client/create-hackathon"
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Hackathon
              </Link>
            )}
          </div>
        )}

        {/* Hackathons Grid */}
        {!loading && !error && userEmail && filteredHackathons.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHackathons.map((hackathon) => {
              const statusInfo = getStatusInfo(hackathon);
              const StatusIconComponent = statusInfo.icon;

              return (
                <div key={hackathon.hackathon_id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                  {/* Header */}
                  <div className="relative h-48 bg-gradient-to-r from-purple-500 to-pink-500 p-4">
                    {hackathon.banner_image && (
                      <img
                        src={hackathon.banner_image}
                        alt={hackathon.title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    )}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                            <StatusIconComponent className="w-3 h-3 mr-1" />
                            {statusInfo.text}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-white line-clamp-2">
                          {hackathon.title}
                        </h3>
                        <p className="text-white/80 text-sm line-clamp-1 mt-1">
                          {hackathon.tagline}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewHackathon(hackathon.hackathon_id)}
                          className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        {hackathon.canEdit && (
                          <button
                            onClick={() => handleEditHackathon(hackathon.hackathon_id)}
                            className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                            title="Edit Hackathon"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                        )}
                        {hackathon.canDelete && (
                          <button
                            onClick={() => handleDeleteHackathon(hackathon.hackathon_id)}
                            className="p-2 text-white hover:bg-red-600/80 rounded-lg transition-colors"
                            title="Delete Hackathon"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-4">
                    {/* Theme and Location */}
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center">
                          <Settings className="w-4 h-4 mr-1" />
                          {hackathon.theme}
                        </span>
                        <span className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {hackathon.location}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center">
                          <DollarSign className="w-4 h-4 mr-1" />
                          {hackathon.prize_pool}
                        </span>
                        <span className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {hackathon.min_team_size}-{hackathon.max_team_size} people
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                      {hackathon.description}
                    </p>

                    {/* Dates */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between text-gray-600">
                        <span>Registration:</span>
                        <span>{formatDate(hackathon.registration_start)} - {formatDate(hackathon.registration_end)}</span>
                      </div>
                      <div className="flex items-center justify-between text-gray-600">
                        <span>Event:</span>
                        <span>{formatDate(hackathon.start_date)} - {formatDate(hackathon.end_date)}</span>
                      </div>
                    </div>

                    {/* Event Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-600 pt-2 border-t border-gray-200">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center">
                          <Trophy className="w-3 h-3 mr-1" />
                          {hackathon.prizes?.length || 0} prizes
                        </span>
                        <span className="flex items-center">
                          <UserCheck className="w-3 h-3 mr-1" />
                          {hackathon.judges?.length || 0} judges
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {hackathon.schedule?.length || 0} events
                        </span>
                      </div>
                    </div>

                    {/* Status Actions */}
                    <div className="flex items-center justify-end space-x-2 pt-2 border-t border-gray-200">
                      <button
                        onClick={() => handleToggleStatus(hackathon.hackathon_id)}
                        className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                      >
                        {statusInfo.text === 'Upcoming' ? 'Start Hackathon' : statusInfo.text === 'Completed' ? 'Archive' : 'End Hackathon'}
                      </button>
                      <button
                        onClick={() => handleViewHackathon(hackathon.hackathon_id)}
                        className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
                      >
                        Manage
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
