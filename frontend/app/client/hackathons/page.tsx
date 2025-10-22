'use client'
import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Plus, Search, Edit, Trash2, Users, MapPin, Clock, DollarSign, Eye, Settings, AlertCircle, CheckCircle } from 'lucide-react';
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

  // Get user email from session/localStorage
  useEffect(() => {
    const getUserEmail = () => {
      if (typeof window !== 'undefined') {
        const sessionEmail = sessionStorage.getItem('userEmail');
        if (sessionEmail) return sessionEmail;

        const localEmail = localStorage.getItem('userEmail');
        if (localEmail) return localEmail;

        // For development - in production, this should come from auth system
        return 'client@example.com';
      }
      return 'client@example.com';
    };

    const email = getUserEmail();
    setUserEmail(email);
  }, []);

  // Load user's hackathons
  const loadUserHackathons = useCallback(async () => {
    if (!userEmail) return;

    try {
      setLoading(true);
      setError(null);

      // Get all hackathons first (this would normally be filtered by user in the canister)
      // HackathonCanister.listHackathons() is available but for now we use mock data below

      // Since we don't have a direct method to get hackathons by creator in the canister,
      // we'll need to create an API route for this. For now, we'll simulate with mock data
      const mockUserHackathons = await fetchUserHackathonsFromApi(email);

      setHackathons(mockUserHackathons);
      setFilteredHackathons(mockUserHackathons);
    } catch (err) {
      console.error('Error loading hackathons:', err);
      setError('Failed to load hackathons');
    } finally {
      setLoading(false);
    }
  }, [userEmail]);

  // Mock function to fetch user hackathons from API (replace with actual API call)
  const fetchUserHackathonsFromApi = async (email: string): Promise<HackathonWithActions[]> => {
    try {
      // Create a mock API call since we don't have the actual endpoint
      const response = await fetch('/api/hackathons/user');
      if (response.ok) {
        const data = await response.json();
        return data.hackathons || [];
      }

      // Return mock data for development
      return [
        {
          hackathon_id: "hack_1",
          title: "Web Innovation Challenge 2025",
          tagline: "Build the Future of Web",
          description: "Join us for an exciting web development challenge where creativity meets technology. Build innovative web applications using modern frameworks and tools.",
          theme: "Technology",
          mode: { Online: null },
          location: "Virtual",
          start_date: "2025-02-01T09:00:00Z",
          end_date: "2025-02-03T21:00:00Z",
          registration_start: "2025-01-15T00:00:00Z",
          registration_end: "2025-01-31T23:59:59Z",
          min_team_size: 2,
          max_team_size: 4,
          prize_pool: "$5,000",
          rules: "Teams must use modern web technologies. Projects will be judged on innovation, technical complexity, and presentation.",
          status: { Upcoming: null },
          created_at: "2025-01-10T10:00:00Z",
          updated_at: "2025-01-10T10:00:00Z",
          isOwner: true,
          canEdit: true,
          canDelete: true,
          participantCount: 0,
          teamsCount: 0
        },
        {
          hackathon_id: "hack_2",
          title: "Mobile App Development Sprint",
          tagline: "Create Amazing Mobile Experiences",
          description: "Design and develop mobile applications that solve real-world problems. Focus on user experience and innovative features.",
          theme: "Mobile",
          mode: { Hybrid: null },
          location: "San Francisco, CA",
          start_date: "2025-03-15T10:00:00Z",
          end_date: "2025-03-16T18:00:00Z",
          registration_start: "2025-02-01T00:00:00Z",
          registration_end: "2025-03-10T23:59:59Z",
          min_team_size: 1,
          max_team_size: 3,
          prize_pool: "$3,000",
          rules: "Individual and team participation allowed. Apps must be functional and demonstrate technical skills.",
          status: { Ongoing: null },
          created_at: "2025-01-05T14:30:00Z",
          updated_at: "2025-01-05T14:30:00Z",
          isOwner: true,
          canEdit: true,
          canDelete: true,
          participantCount: 8,
          teamsCount: 3
        }
      ];
    } catch (error) {
      console.error('API error:', error);
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
    router.push(`/client/hackathons/${hackathonId}/edit`);
  };

  const handleViewHackathon = (hackathonId: string) => {
    router.push(`/client/hackathons/${hackathonId}`);
  };

  const handleDeleteHackathon = async (hackathonId: string) => {
    if (!confirm('Are you sure you want to delete this hackathon? This action cannot be undone.')) {
      return;
    }

    try {
      await HackathonCanister.deleteHackathon(hackathonId);

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

      await HackathonCanister.updateHackathon(hackathonId, {
        ...hackathon,
        status: { [nextStatus]: null },
        updated_at: new Date().toISOString()
      });

      // Update local state
      setHackathons(prev => prev.map(h =>
        h.hackathon_id === hackathonId
          ? { ...h, status: { [nextStatus]: null }, updated_at: new Date().toISOString() }
          : h
      ));
      setFilteredHackathons(prev => prev.map(h =>
        h.hackathon_id === hackathonId
          ? { ...h, status: { [nextStatus]: null }, updated_at: new Date().toISOString() }
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

        {/* Error State */}
        {error && (
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

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <span className="ml-3 text-gray-600">Loading hackathons...</span>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredHackathons.length === 0 && (
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
        {!loading && !error && filteredHackathons.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHackathons.map((hackathon) => {
              const statusInfo = getStatusInfo(hackathon);
              const StatusIconComponent = statusInfo.icon;

              return (
                <div key={hackathon.hackathon_id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                  {/* Header */}
                  <div className="relative h-48 bg-gradient-to-r from-purple-500 to-pink-500 p-4">
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
                        <p className="text-white/80 text-sm line-clamp-2 mt-1">
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

                    {/* Participants and Teams */}
                    <div className="flex items-center justify-between text-sm text-gray-600 pt-2 border-t border-gray-200">
                      <div className="flex items-center space-x-4">
                        <span>{hackathon.participantCount || 0} participants</span>
                        <span>•</span>
                        <span>{hackathon.teamsCount || 0} teams</span>
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
