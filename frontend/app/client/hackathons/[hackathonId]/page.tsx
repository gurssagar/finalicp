'use client'
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Clock,
  Settings,
  AlertCircle,
  CheckCircle,
  Edit,
  Trash2,
  UserPlus,
  Users2,
  Award,
  Target,
  Zap,
  Globe
} from 'lucide-react';
import { HackathonCanister } from '@/lib/hackathon-canister';
import { Hackathon } from '@/lib/hackathon-agent';

// Extended interface to include additional properties
interface ExtendedHackathon extends Hackathon {
  banner_image?: string;
  prizes?: Array<{
    id?: string;
    position: string;
    amount: number;
    title?: string;
    description?: string;
  }>;
  judges?: Array<{
    id?: string;
    name: string;
    bio?: string;
    expertise?: string[];
  }>;
  schedule?: Array<{
    id?: string;
    title: string;
    description?: string;
    date: string;
    startTime?: string;
    endTime?: string;
    location?: string;
    type: string;
    isRequired?: boolean;
  }>;
  social_links?: Array<{
    platform: string;
    url: string;
  }>;
  registration_fee?: number;
  max_participants?: number;
  tags?: string[];
  organizer_email?: string;
}

interface HackathonViewPageProps {
  params: Promise<{
    hackathonId: string;
  }>;
}

export default function HackathonViewPage({ params }: HackathonViewPageProps) {
  const [hackathonId, setHackathonId] = useState<string>('');
  const router = useRouter();

  const [hackathon, setHackathon] = useState<ExtendedHackathon | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);

  // Get user email from session/localStorage
  const [userEmail, setUserEmail] = useState<string>('');
  const [isOwner, setIsOwner] = useState(false);

  // Resolve params
  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      setHackathonId(resolvedParams.hackathonId);
    };
    resolveParams();
  }, [params]);

  useEffect(() => {
    const getUserEmail = () => {
      if (typeof window !== 'undefined') {
        const sessionEmail = sessionStorage.getItem('userEmail');
        if (sessionEmail) return sessionEmail;

        const localEmail = localStorage.getItem('userEmail');
        if (localEmail) return localEmail;

        return 'client@example.com';
      }
      return 'client@example.com';
    };

    const email = getUserEmail();
    setUserEmail(email);
  }, []);

  // Load hackathon data
  const loadHackathon = useCallback(async () => {
    if (!hackathonId) return;

    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Loading hackathon details for ID:', hackathonId);

      // Fetch hackathon data from API
      const response = await fetch(`/api/hackathons/${hackathonId}`);
      const result = await response.json();

      if (!result.success) {
        setError(result.error || 'Failed to load hackathon');
        return;
      }

      const hackathonData = result.data;
      console.log('✅ Hackathon data loaded:', hackathonData);

      setHackathon(hackathonData);

      // Check if current user is the owner
      if (userEmail && hackathonData.organizer_email) {
        setIsOwner(userEmail === hackathonData.organizer_email);
        console.log('👤 User ownership check:', { userEmail, organizerEmail: hackathonData.organizer_email, isOwner: userEmail === hackathonData.organizer_email });
      }

      // Load participants and teams (mock data for now)
      setParticipants([
        { participant_id: 'p1', full_name: 'John Doe', email: 'john@example.com', skills: ['JavaScript', 'React'] },
        { participant_id: 'p2', full_name: 'Jane Smith', email: 'jane@example.com', skills: ['Python', 'Django'] }
      ]);
      setTeams([
        { team_id: 't1', team_name: 'Code Warriors', member_ids: ['p1', 'p2'], project_title: 'AI Assistant' }
      ]);

    } catch (err) {
      console.error('Error loading hackathon:', err);
      setError('Failed to load hackathon details');
    } finally {
      setLoading(false);
    }
  }, [hackathonId, userEmail]);

  // Load hackathon on component mount
  useEffect(() => {
    loadHackathon();
  }, [loadHackathon]);

  // Handle delete
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this hackathon? This action cannot be undone.')) {
      return;
    }

    try {
      await HackathonCanister.deleteHackathon(hackathonId);
      router.push('/client/hackathons');
    } catch (error) {
      console.error('Error deleting hackathon:', error);
      alert('Failed to delete hackathon. Please try again.');
    }
  };

  // Get status display text and color
  const getStatusInfo = (hackathon: Hackathon) => {
    if (hackathon.status.Upcoming !== null) {
      return { text: 'Upcoming', color: 'bg-blue-100 text-blue-800', icon: Calendar };
    } else if (hackathon.status.Ongoing !== null) {
      return { text: 'Ongoing', color: 'bg-green-100 text-green-800', icon: Clock };
    } else if (hackathon.status.Completed !== null) {
      return { text: 'Completed', color: 'bg-gray-100 text-gray-800', icon: CheckCircle };
    } else if (hackathon.status.Cancelled !== null) {
      return { text: 'Cancelled', color: 'bg-red-100 text-red-800', icon: AlertCircle };
    }
    return { text: 'Unknown', color: 'bg-gray-100 text-gray-800', icon: AlertCircle };
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Check if registration is open
  const isRegistrationOpen = () => {
    if (!hackathon) return false;
    const now = new Date();
    const regStart = new Date(hackathon.registration_start);
    const regEnd = new Date(hackathon.registration_end);
    return now >= regStart && now <= regEnd;
  };

  // Check if hackathon is ongoing
  const isHackathonOngoing = () => {
    if (!hackathon) return false;
    const now = new Date();
    const start = new Date(hackathon.start_date);
    const end = new Date(hackathon.end_date);
    return now >= start && now <= end;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <span className="ml-3 text-gray-600">Loading hackathon details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !hackathon) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
              <div>
                <h3 className="text-lg font-medium text-red-800">Error</h3>
                <p className="text-red-700">{error || 'Hackathon not found'}</p>
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

  const statusInfo = getStatusInfo(hackathon);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
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
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                <StatusIcon className="w-4 h-4 mr-1 inline" />
                {statusInfo.text}
              </span>
              {isOwner && (
                <div className="flex items-center space-x-2">
                  <Link
                    href={`/client/hackathons/${hackathonId}/edit`}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Link>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Section */}
            <div className="relative rounded-lg overflow-hidden">
              {hackathon.banner_image && !hackathon.banner_image.startsWith('blob:') ? (
                <div className="relative">
                  <img
                    src={hackathon.banner_image}
                    alt="Hackathon banner"
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                    <h1 className="text-3xl font-bold mb-2">{hackathon.title}</h1>
                    <p className="text-xl text-white/90 mb-4">{hackathon.tagline}</p>
                    <div className="flex items-center space-x-6 text-white/80">
                      <span className="flex items-center">
                        <Calendar className="w-5 h-5 mr-2" />
                        {formatDate(hackathon.start_date)}
                      </span>
                      <span className="flex items-center">
                        <MapPin className="w-5 h-5 mr-2" />
                        {hackathon.location}
                      </span>
                      <span className="flex items-center">
                        <Users className="w-5 h-5 mr-2" />
                        {hackathon.min_team_size}-{hackathon.max_team_size} people/team
                      </span>
                    </div>
                  </div>
                  <div className="absolute top-4 right-4">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">{hackathon.prize_pool}</div>
                      <div className="text-white/80">Prize Pool</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-8 text-white">
                  <div className="flex items-start justify-between">
                    <div>
                      <h1 className="text-3xl font-bold mb-2">{hackathon.title}</h1>
                      <p className="text-xl text-white/90 mb-4">{hackathon.tagline}</p>
                      <div className="flex items-center space-x-6 text-white/80">
                        <span className="flex items-center">
                          <Calendar className="w-5 h-5 mr-2" />
                          {formatDate(hackathon.start_date)}
                        </span>
                        <span className="flex items-center">
                          <MapPin className="w-5 h-5 mr-2" />
                          {hackathon.location}
                        </span>
                        <span className="flex items-center">
                          <Users className="w-5 h-5 mr-2" />
                          {hackathon.min_team_size}-{hackathon.max_team_size} people/team
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{hackathon.prize_pool}</div>
                      <div className="text-white/80">Prize Pool</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About This Hackathon</h2>
              <p className="text-gray-700 leading-relaxed">{hackathon.description}</p>
            </div>

            {/* Important Dates */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Important Dates</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
                  <Calendar className="w-6 h-6 text-blue-600" />
                  <div>
                    <div className="font-medium text-gray-900">Registration Opens</div>
                    <div className="text-sm text-gray-600">{formatDate(hackathon.registration_start)}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-red-50 rounded-lg">
                  <Clock className="w-6 h-6 text-red-600" />
                  <div>
                    <div className="font-medium text-gray-900">Registration Closes</div>
                    <div className="text-sm text-gray-600">{formatDate(hackathon.registration_end)}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
                  <Zap className="w-6 h-6 text-green-600" />
                  <div>
                    <div className="font-medium text-gray-900">Hackathon Starts</div>
                    <div className="text-sm text-gray-600">{formatDate(hackathon.start_date)}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg">
                  <Award className="w-6 h-6 text-purple-600" />
                  <div>
                    <div className="font-medium text-gray-900">Hackathon Ends</div>
                    <div className="text-sm text-gray-600">{formatDate(hackathon.end_date)}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Rules */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Rules & Guidelines</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{hackathon.rules || 'No specific rules provided.'}</p>
              </div>
            </div>

            {/* Prizes */}
            {hackathon.prizes && hackathon.prizes.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Award className="w-6 h-6 mr-2 text-yellow-600" />
                  Prizes
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {hackathon.prizes.map((prize: any, index: number) => (
                    <div key={prize.id || index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{prize.position}</h3>
                        <span className="text-lg font-bold text-green-600">
                          {prize.amount > 0 ? `$${prize.amount}` : 'Trophy'}
                        </span>
                      </div>
                      {prize.title && (
                        <p className="text-sm text-gray-600 mb-2">{prize.title}</p>
                      )}
                      {prize.description && (
                        <p className="text-sm text-gray-700">{prize.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Judges */}
            {hackathon.judges && hackathon.judges.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Users className="w-6 h-6 mr-2 text-blue-600" />
                  Judges
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {hackathon.judges.map((judge: any, index: number) => (
                    <div key={judge.id || index} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-lg font-semibold text-gray-600">
                          {judge.name.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{judge.name}</h3>
                        {judge.bio && (
                          <p className="text-sm text-gray-600 mt-1">{judge.bio}</p>
                        )}
                        {judge.expertise && judge.expertise.length > 0 && (
                          <div className="mt-2">
                            <div className="flex flex-wrap gap-1">
                              {judge.expertise.map((skill: string, skillIndex: number) => (
                                <span key={skillIndex} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Schedule */}
            {hackathon.schedule && hackathon.schedule.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Clock className="w-6 h-6 mr-2 text-green-600" />
                  Schedule
                </h2>
                <div className="space-y-4">
                  {hackathon.schedule.map((event: any, index: number) => (
                    <div key={event.id || index} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg">
                      <div className="flex-shrink-0">
                        <div className={`w-3 h-3 rounded-full mt-2 ${
                          event.type === 'opening' ? 'bg-green-500' :
                          event.type === 'workshop' ? 'bg-blue-500' :
                          event.type === 'break' ? 'bg-yellow-500' :
                          event.type === 'presentation' ? 'bg-purple-500' :
                          event.type === 'judging' ? 'bg-red-500' :
                          event.type === 'awards' ? 'bg-yellow-600' :
                          event.type === 'closing' ? 'bg-gray-500' :
                          'bg-gray-400'
                        }`}></div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-900">{event.title}</h3>
                          {event.isRequired && (
                            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                              Required
                            </span>
                          )}
                        </div>
                        {event.description && (
                          <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                        )}
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {formatDate(event.date)}
                          </span>
                          {event.startTime && event.endTime && (
                            <span className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {event.startTime} - {event.endTime}
                            </span>
                          )}
                          {event.location && (
                            <span className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              {event.location}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Social Links */}
            {hackathon.social_links && hackathon.social_links.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Globe className="w-6 h-6 mr-2 text-purple-600" />
                  Social Links
                </h2>
                <div className="flex flex-wrap gap-3">
                  {hackathon.social_links.map((link: any, index: number) => (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Globe className="w-4 h-4 mr-2" />
                      {link.platform}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center text-gray-600">
                    <Users className="w-4 h-4 mr-2" />
                    Participants
                  </span>
                  <span className="font-semibold">{participants.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center text-gray-600">
                    <Users2 className="w-4 h-4 mr-2" />
                    Teams
                  </span>
                  <span className="font-semibold">{teams.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center text-gray-600">
                    <Target className="w-4 h-4 mr-2" />
                    Theme
                  </span>
                  <span className="font-semibold text-sm">{hackathon.theme}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center text-gray-600">
                    <Settings className="w-4 h-4 mr-2" />
                    Mode
                  </span>
                  <span className="font-semibold">{Object.keys(hackathon.mode)[0]}</span>
                </div>
                {hackathon.registration_fee && hackathon.registration_fee > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="flex items-center text-gray-600">
                      <DollarSign className="w-4 h-4 mr-2" />
                      Registration Fee
                    </span>
                    <span className="font-semibold">${hackathon.registration_fee}</span>
                  </div>
                )}
                {hackathon.max_participants && (
                  <div className="flex items-center justify-between">
                    <span className="flex items-center text-gray-600">
                      <Users className="w-4 h-4 mr-2" />
                      Max Participants
                    </span>
                    <span className="font-semibold">{hackathon.max_participants}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            {hackathon.tags && hackathon.tags.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {hackathon.tags.map((tag: string, index: number) => (
                    <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Registration Status */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Registration Status</h3>
              {isRegistrationOpen() ? (
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="text-green-800 font-medium">Registration is Open!</p>
                  <p className="text-sm text-gray-600 mt-2">
                    Register before {formatDate(hackathon.registration_end)}
                  </p>
                  <button className="mt-4 w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                    Register Now
                  </button>
                </div>
              ) : isHackathonOngoing() ? (
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-blue-600" />
                  </div>
                  <p className="text-blue-800 font-medium">Hackathon is Ongoing!</p>
                  <p className="text-sm text-gray-600 mt-2">
                    Event ends {formatDate(hackathon.end_date)}
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-gray-600" />
                  </div>
                  <p className="text-gray-800 font-medium">Registration Closed</p>
                  <p className="text-sm text-gray-600 mt-2">
                    {new Date(hackathon.registration_end) > new Date()
                      ? `Opens ${formatDate(hackathon.registration_start)}`
                      : 'Registration has ended'
                    }
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            {isOwner && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Manage Hackathon</h3>
                <div className="space-y-3">
                  <Link
                    href={`/client/hackathons/${hackathonId}/edit`}
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Details
                  </Link>
                  <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center">
                    <Users className="w-4 h-4 mr-2" />
                    View Participants
                  </button>
                  <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center">
                    <Users2 className="w-4 h-4 mr-2" />
                    Manage Teams
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}