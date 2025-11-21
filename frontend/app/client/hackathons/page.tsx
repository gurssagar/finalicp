'use client'
import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Plus, Search, Edit, Trash2, Users, MapPin, Clock, DollarSign, Eye, Settings, AlertCircle, CheckCircle, Trophy, UserCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Actor, HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { IDL } from '@dfinity/candid';

const CANISTER_ID = process.env.NEXT_PUBLIC_HACKATHON_CANISTER_ID ?? '';
const IC_HOST = process.env.NEXT_PUBLIC_IC_HOST ?? ''; // Use testnet directly

const hackquestIdl = ({ IDL }: typeof import('@dfinity/candid')) => {
  const HackathonStatus = IDL.Variant({
    Draft: IDL.Null,
    Upcoming: IDL.Null,
    Ongoing: IDL.Null,
    Judging: IDL.Null,
    Completed: IDL.Null,
    Cancelled: IDL.Null,
  });

  return IDL.Service({
    updateHackathonStatus: IDL.Func(
      [IDL.Text, HackathonStatus],
      [IDL.Variant({ ok: IDL.Record({
        id: IDL.Text,
        organizer: IDL.Principal,
        title: IDL.Text,
        tagline: IDL.Text,
        summary: IDL.Text,
        bannerUrl: IDL.Text,
        heroVideoUrl: IDL.Text,
        location: IDL.Text,
        theme: IDL.Text,
        prizePool: IDL.Nat64,
        faq: IDL.Vec(IDL.Text),
        resources: IDL.Vec(IDL.Text),
        minTeamSize: IDL.Nat,
        maxTeamSize: IDL.Nat,
        maxTeamsPerCategory: IDL.Nat,
        submissionsOpenAt: IDL.Int,
        submissionsCloseAt: IDL.Int,
        startAt: IDL.Int,
        endAt: IDL.Int,
        createdAt: IDL.Int,
        status: HackathonStatus,
        categories: IDL.Vec(IDL.Text),
        rewards: IDL.Vec(IDL.Text),
      }), err: IDL.Variant({
        NotFound: IDL.Text,
        NotAuthorized: IDL.Null,
        ValidationError: IDL.Text,
        InvalidState: IDL.Text,
      })}),
      ],
      []
    ),
  });
};

const createHackquestActor = async () => {
  const agent = new HttpAgent({ host: IC_HOST });
  const actor = Actor.createActor(hackquestIdl as any, {
    agent,
    canisterId: Principal.fromText(CANISTER_ID),
  });
  return actor;
};


interface HackathonWithActions {
  hackathon_id: string;
  id: string;
  title: string;
  tagline: string;
  description: string;
  summary: string;
  theme: string;
  location: string;
  mode: { Online: null } | { Offline: null } | { Hybrid: null };
  bannerUrl: string;
  heroVideoUrl: string;
  prizePool: bigint | string;
  start_date: string;
  end_date: string;
  registration_start: string;
  registration_end: string;
  min_team_size: number;
  max_team_size: number;
  status: { Draft?: null; Upcoming?: null; Ongoing?: null; Judging?: null; Completed?: null; Cancelled?: null };
  created_at: string;
  updated_at: string;
  organizer: string;
  isOwner?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  participantCount?: number;
  teamsCount?: number;
  categories?: string[];
  rewards?: string[];
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
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);

  const router = useRouter();

  // Get user email from session - wait for this to complete before loading hackathons
  useEffect(() => {
    const getUserEmail = async () => {
      try {
        setSessionLoading(true);
        const response = await fetch('/api/auth/session');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.session && data.session.email) {
            setUserEmail(data.session.email);
            console.log('✅ User email retrieved from session:', data.session.email);
          } else {
            console.log('⚠️ No user email found in session');
            setUserEmail(null);
          }
        } else {
          console.log('⚠️ Session check failed');
          setUserEmail(null);
        }
      } catch (error) {
        console.error('Error getting user email:', error);
        setUserEmail(null);
      } finally {
        setSessionLoading(false);
      }
    };
    getUserEmail();
  }, []);

  // Load user's hackathons from API (which uses email to find hackathons)
  const loadUserHackathons = useCallback(async () => {
    // Wait for session check to complete
    if (sessionLoading) {
      return;
    }

    if (!userEmail) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('🚀 Loading hackathons for user email:', userEmail);

      const response = await fetch(`/api/hackquest/user-hackathons?email=${encodeURIComponent(userEmail)}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch hackathons');
      }

      const data = await response.json();
      
      if (data.success) {
        setHackathons(data.hackathons || []);
        setFilteredHackathons(data.hackathons || []);
        console.log(`✅ Loaded ${data.hackathons?.length || 0} hackathons for user ${userEmail}`);
      } else {
        throw new Error(data.error || 'Failed to load hackathons');
      }
    } catch (err) {
      console.error('Error loading hackathons:', err);
      setError(err instanceof Error ? err.message : 'Failed to load hackathons. Please ensure you are logged in.');
    } finally {
      setLoading(false);
    }
  }, [userEmail, sessionLoading]);

  // Load hackathons after session check completes and userEmail is available
  useEffect(() => {
    if (!sessionLoading) {
      loadUserHackathons();
    }
  }, [loadUserHackathons, sessionLoading]);

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
        (statusFilter === 'upcoming' && hackathon.status.Upcoming !== null && hackathon.status.Upcoming !== undefined) ||
        (statusFilter === 'ongoing' && hackathon.status.Ongoing !== null && hackathon.status.Ongoing !== undefined) ||
        (statusFilter === 'completed' && hackathon.status.Completed !== null && hackathon.status.Completed !== undefined) ||
        (statusFilter === 'cancelled' && hackathon.status.Cancelled !== null && hackathon.status.Cancelled !== undefined);

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
      summary: hackathon.summary,
      bannerUrl: hackathon.bannerUrl,
      heroVideoUrl: hackathon.heroVideoUrl,
      location: hackathon.location,
      theme: hackathon.theme,
      prizePool: hackathon.prizePool.toString(),

      // Event Details
      startAt: new Date(hackathon.start_date).getTime() * 1000000,
      endAt: new Date(hackathon.end_date).getTime() * 1000000,
      submissionsOpenAt: new Date(hackathon.registration_start).getTime() * 1000000,
      submissionsCloseAt: new Date(hackathon.registration_end).getTime() * 1000000,

      // Participation Settings
      minTeamSize: hackathon.min_team_size,
      maxTeamSize: hackathon.max_team_size,
      maxTeamsPerCategory: 10, // Default value

      // Content
      faq: [],
      resources: [],
      categories: [],
      rewards: [],

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
      // Note: HackQuest canister doesn't have a delete function yet
      // This would need to be implemented in the canister
      alert('Delete functionality will be available once implemented in the canister.');
    } catch (error) {
      console.error('Error deleting hackathon:', error);
      alert('Failed to delete hackathon. Please try again.');
    }
  };

  const handleToggleStatus = async (hackathonId: string) => {
    try {
      const hackathon = hackathons.find(h => h.hackathon_id === hackathonId);
      if (!hackathon) return;

      // Determine next status based on current status
      let newStatus: { Draft?: null; Upcoming?: null; Ongoing?: null; Judging?: null; Completed?: null; Cancelled?: null };
      if (hackathon.status.Draft !== null && hackathon.status.Draft !== undefined) {
        newStatus = { Upcoming: null };
      } else if (hackathon.status.Upcoming !== null && hackathon.status.Upcoming !== undefined) {
        newStatus = { Ongoing: null };
      } else if (hackathon.status.Ongoing !== null && hackathon.status.Ongoing !== undefined) {
        newStatus = { Judging: null };
      } else if (hackathon.status.Judging !== null && hackathon.status.Judging !== undefined) {
        newStatus = { Completed: null };
      } else {
        newStatus = { Upcoming: null };
      }

      const actor: any = await createHackquestActor();
      const result = await actor.updateHackathonStatus(hackathonId, newStatus);

      if ('err' in result) {
        const error = result.err;
        if ('NotFound' in error) {
          throw new Error(error.NotFound);
        } else if ('NotAuthorized' in error) {
          throw new Error('You are not authorized to update this hackathon');
        } else if ('ValidationError' in error) {
          throw new Error(error.ValidationError);
        } else if ('InvalidState' in error) {
          throw new Error(error.InvalidState);
        } else {
          throw new Error('Unknown error occurred');
        }
      }

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

      alert('Hackathon status updated successfully!');
    } catch (error) {
      console.error('Error updating hackathon status:', error);
      alert('Failed to update hackathon status. Please try again.');
    }
  };

  // Get status display text and color
  const getStatusInfo = (hackathon: HackathonWithActions | null) => {
    if (!hackathon || !hackathon.status) {
      return { text: 'Unknown', color: 'bg-gray-100 text-gray-800', icon: AlertCircle };
    }

    if (hackathon.status.Draft !== null && hackathon.status.Draft !== undefined) {
      return { text: 'Draft', color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle };
    } else if (hackathon.status.Upcoming !== null && hackathon.status.Upcoming !== undefined) {
      return { text: 'Upcoming', color: 'bg-blue-100 text-blue-800', icon: Calendar };
    } else if (hackathon.status.Ongoing !== null && hackathon.status.Ongoing !== undefined) {
      return { text: 'Ongoing', color: 'bg-green-100 text-green-800', icon: Clock };
    } else if (hackathon.status.Judging !== null && hackathon.status.Judging !== undefined) {
      return { text: 'Judging', color: 'bg-purple-100 text-purple-800', icon: Trophy };
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
        {(loading || sessionLoading) && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <span className="ml-3 text-gray-600">
                {sessionLoading ? 'Checking authentication...' : 'Loading hackathons...'}
              </span>
            </div>
          </div>
        )}

        {/* Authentication Required State */}
        {!loading && !sessionLoading && !userEmail && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-yellow-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Login Required</h3>
            <p className="text-gray-500 mb-4">
              Please log in to view and manage your hackathons.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Log In
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
        {!loading && !sessionLoading && !error && userEmail && filteredHackathons.length === 0 && (
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
        {!loading && !sessionLoading && !error && userEmail && filteredHackathons.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHackathons.map((hackathon) => {
              const statusInfo = getStatusInfo(hackathon);
              const StatusIconComponent = statusInfo.icon;

              return (
                <div key={hackathon.hackathon_id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                  {/* Header */}
                  <div className="relative h-48 bg-gradient-to-r from-purple-500 to-pink-500 p-4">
                    {hackathon.bannerUrl && (
                      <img
                        src={hackathon.bannerUrl}
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
                          {Number(hackathon.prizePool).toLocaleString()}
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
                          {hackathon.rewards?.length || 0} rewards
                        </span>
                        <span className="flex items-center">
                          <Settings className="w-3 h-3 mr-1" />
                          {hackathon.categories?.length || 0} categories
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
