'use client'

import { useState, useEffect, useCallback } from 'react'
import { useUserContext } from '@/contexts/UserContext'

export interface Hackathon {
  id: string
  title: string
  description: string
  tagline: string
  theme: string
  mode: string
  location: string
  startDate: string
  endDate: string
  registrationStart: string
  registrationEnd: string
  minTeamSize: number
  maxTeamSize: number
  prizePool: string
  rules: string
  image: string
  status: 'draft' | 'published' | 'active' | 'ended'
  techStack: string
  experienceLevel: string
  organizerId: string
  createdAt: string
  updatedAt: string
  participantCount?: number
  teamCount?: number
  submissionCount?: number
}

interface UserHackathonsHook {
  hackathons: Hackathon[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useUserHackathons(): UserHackathonsHook {
  const [hackathons, setHackathons] = useState<Hackathon[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { profile, isLoading: isProfileLoading } = useUserContext()

  const fetchUserHackathons = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    // Wait for profile to load
    if (isProfileLoading) {
      return
    }

    try {
      // Get user ID from profile - use email as primary identifier
      const userId = profile.email

      if (!userId) {
        console.warn('No user ID found in profile, using fallback')
        // Fallback to mock data if no user is logged in
        setHackathons(getMockHackathons())
        setIsLoading(false)
        return
      }

      console.log(`Fetching hackathons for user: ${userId}`)

      const response = await fetch(`/api/hackathons/user/${encodeURIComponent(userId)}?limit=100&offset=0`)

      if (!response.ok) {
        if (response.status === 401) {
          // User is not authenticated
          console.warn('User not authenticated, using mock data')
          setHackathons(getMockHackathons())
          setIsLoading(false)
          return
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.success) {
        console.log(`Successfully fetched ${data.data?.length || 0} hackathons`)

        // Transform API data to match Hackathon interface if needed
        const transformedHackathons = (data.data || []).map((hackathon: any) => ({
          id: hackathon.id || hackathon.hackathon_id,
          title: hackathon.title,
          description: hackathon.description,
          tagline: hackathon.tagline,
          theme: hackathon.theme,
          mode: hackathon.mode,
          location: hackathon.location,
          startDate: hackathon.start_date || hackathon.startDate,
          endDate: hackathon.end_date || hackathon.endDate,
          registrationStart: hackathon.registration_start || hackathon.registrationStart,
          registrationEnd: hackathon.registration_end || hackathon.registrationEnd,
          minTeamSize: hackathon.min_team_size || hackathon.minTeamSize,
          maxTeamSize: hackathon.max_team_size || hackathon.maxTeamSize,
          prizePool: hackathon.prize_pool || hackathon.prizePool,
          rules: hackathon.rules,
          image: hackathon.image || '/api/placeholder/hackathon-default.jpg',
          status: hackathon.status,
          techStack: hackathon.tech_stack || hackathon.techStack,
          experienceLevel: hackathon.experience_level || hackathon.experienceLevel,
          organizerId: hackathon.organizer_id || hackathon.organizerId,
          createdAt: hackathon.created_at || hackathon.createdAt,
          updatedAt: hackathon.updated_at || hackathon.updatedAt,
          participantCount: hackathon.participant_count || hackathon.participantCount || 0,
          teamCount: hackathon.team_count || hackathon.teamCount || 0,
          submissionCount: hackathon.submission_count || hackathon.submissionCount || 0
        }))

        setHackathons(transformedHackathons)
      } else {
        throw new Error(data.error || 'Failed to load hackathons')
      }
    } catch (err) {
      console.error('Error fetching user hackathons:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to load hackathons'
      setError(errorMessage)

      // Fallback to mock data for development or on error
      console.log('Using mock data due to error')
      setHackathons(getMockHackathons())
    } finally {
      setIsLoading(false)
    }
  }, [profile, isProfileLoading])

  useEffect(() => {
    // Only fetch when profile is loaded
    if (!isProfileLoading) {
      fetchUserHackathons()
    }
  }, [fetchUserHackathons, isProfileLoading])

  return {
    hackathons,
    isLoading: isLoading || isProfileLoading,
    error,
    refetch: fetchUserHackathons
  }
}

// Mock data for development
function getMockHackathons(): Hackathon[] {
  return [
    {
      id: '1',
      title: 'AI Innovation Challenge 2024',
      description: 'Join us for an exciting hackathon focused on artificial intelligence and machine learning. Build innovative solutions that could change the world.',
      tagline: 'Build the Future with AI',
      theme: 'Artificial Intelligence',
      mode: 'online',
      location: 'Global',
      startDate: '2024-03-15T09:00:00Z',
      endDate: '2024-03-17T18:00:00Z',
      registrationStart: '2024-02-15T00:00:00Z',
      registrationEnd: '2024-03-14T23:59:59Z',
      minTeamSize: 2,
      maxTeamSize: 4,
      prizePool: '$10,000',
      rules: 'Teams must build an AI-powered solution that addresses a real-world problem. Projects will be judged on innovation, technical implementation, and impact.',
      image: '/api/placeholder/hackathon-1.jpg',
      status: 'active',
      techStack: 'Python, TensorFlow, React',
      experienceLevel: 'intermediate',
      organizerId: 'user-123',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
      participantCount: 245,
      teamCount: 62,
      submissionCount: 18
    },
    {
      id: '2',
      title: 'Web3 Gaming Jam',
      description: 'Create innovative web3 games and dApps using blockchain technology. This 48-hour hackathon challenges developers to push the boundaries of decentralized gaming.',
      tagline: 'Game the Future',
      theme: 'Blockchain & Gaming',
      mode: 'hybrid',
      location: 'San Francisco, CA',
      startDate: '2024-04-01T10:00:00Z',
      endDate: '2024-04-03T10:00:00Z',
      registrationStart: '2024-03-01T00:00:00Z',
      registrationEnd: '2024-03-31T23:59:59Z',
      minTeamSize: 1,
      maxTeamSize: 3,
      prizePool: '$15,000',
      rules: 'Create a blockchain-based game or dApp. Projects should demonstrate technical innovation and gameplay design.',
      image: '/api/placeholder/hackathon-2.jpg',
      status: 'published',
      techStack: 'Solidity, React, Ethers.js',
      experienceLevel: 'beginner',
      organizerId: 'user-123',
      createdAt: '2024-02-01T10:00:00Z',
      updatedAt: '2024-02-01T10:00:00Z',
      participantCount: 156,
      teamCount: 45,
      submissionCount: 8
    },
    {
      id: '3',
      title: 'Mobile App Development Sprint',
      description: 'Design and build a mobile application that solves a real-world problem. Focus on user experience and innovative features.',
      tagline: 'App-solutely Mobile',
      theme: 'Mobile Development',
      mode: 'online',
      location: 'Global',
      startDate: '2024-02-01T09:00:00Z',
      endDate: '2024-02-03T18:00:00Z',
      registrationStart: '2024-01-15T00:00:00Z',
      registrationEnd: '2024-01-31T23:59:59Z',
      minTeamSize: 2,
      maxTeamSize: 4,
      prizePool: '$8,000',
      rules: 'Build a mobile app that addresses a specific need. Apps will be judged on user experience, design, and technical execution.',
      image: '/api/placeholder/hackathon-3.jpg',
      status: 'ended',
      techStack: 'React Native, Flutter, Swift',
      experienceLevel: 'intermediate',
      organizerId: 'user-123',
      createdAt: '2023-12-01T10:00:00Z',
      updatedAt: '2023-12-01T10:00:00Z',
      participantCount: 189,
      teamCount: 48,
      submissionCount: 12
    },
    {
      id: '4',
      title: 'Sustainable Tech Solutions',
      description: 'Develop technology solutions that address environmental challenges and promote sustainability.',
      tagline: 'Code for Climate',
      theme: 'Sustainability',
      mode: 'online',
      location: 'Global',
      startDate: '2024-05-15T09:00:00Z',
      endDate: '2024-05-17T18:00:00Z',
      registrationStart: '2024-04-15T00:00:00Z',
      registrationEnd: '2024-05-14T23:59:59Z',
      minTeamSize: 2,
      maxTeamSize: 5,
      prizePool: '$12,000',
      rules: 'Create technology solutions that address environmental challenges. Focus on impact and innovation.',
      image: '/api/placeholder/hackathon-4.jpg',
      status: 'draft',
      techStack: 'JavaScript, React, Node.js',
      experienceLevel: 'all',
      organizerId: 'user-123',
      createdAt: '2024-03-15T10:00:00Z',
      updatedAt: '2024-03-15T10:00:00Z',
      participantCount: 0,
      teamCount: 0,
      submissionCount: 0
    }
  ]
}