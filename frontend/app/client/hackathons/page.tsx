'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Search, Filter, Calendar, Users, Trophy, Clock, Edit, Copy, Trash2, Eye, BarChart3, Settings } from 'lucide-react'
import Link from 'next/link'
import { HackathonCard } from '@/components/hackathon/HackathonCard'
import { HackathonManagementList } from '@/components/hackathon/HackathonManagementList'
import { ManagementSidebar } from '@/components/hackathon/ManagementSidebar'
import { NotificationContainer } from '@/components/ui/Notification'
import { useUserHackathons } from '@/hooks/useUserHackathons'
import { useHackathonActions } from '@/hooks/useHackathonActions'

export default function ClientHackathonsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'upcoming' | 'ended' | 'draft'>('all')
  const [selectedHackathons, setSelectedHackathons] = useState<string[]>([])
  const [showSidebar, setShowSidebar] = useState(true)
  const [notifications, setNotifications] = useState<Array<{
    id: string
    type: 'success' | 'error' | 'warning' | 'info'
    message: string
  }>>([])

  const {
    hackathons,
    isLoading,
    error,
    refetch
  } = useUserHackathons()

  const {
    updateHackathonStatus,
    duplicateHackathon,
    deleteHackathon,
    bulkUpdateStatus,
    bulkDelete,
    bulkDuplicate,
    exportHackathons,
    generateReport,
    state: actionState,
    clearMessages
  } = useHackathonActions()

  // Show notifications when action state changes
  useEffect(() => {
    if (actionState.success) {
      const id = Date.now().toString()
      setNotifications(prev => [...prev, {
        id,
        type: 'success',
        message: actionState.success!
      }])
      clearMessages()
    }
  }, [actionState.success, clearMessages])

  useEffect(() => {
    if (actionState.error) {
      const id = Date.now().toString()
      setNotifications(prev => [...prev, {
        id,
        type: 'error',
        message: actionState.error!
      }])
      clearMessages()
    }
  }, [actionState.error, clearMessages])

  const addNotification = (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    const id = Date.now().toString()
    setNotifications(prev => [...prev, { id, type, message }])
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  // Filter hackathons based on search and status
  const filteredHackathons = hackathons.filter(hackathon => {
    const matchesSearch = !searchQuery ||
      hackathon.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hackathon.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hackathon.techStack.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === 'all' || hackathon.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleCreateHackathon = () => {
    // Navigate to create hackathon page
    window.location.href = '/client/create-hackathon'
  }

  const handleBulkAction = async (action: string, hackathonIds: string[]) => {
    let success = false

    switch (action) {
      case 'publish':
        success = await bulkUpdateStatus(hackathonIds, 'published')
        break
      case 'unpublish':
        success = await bulkUpdateStatus(hackathonIds, 'draft')
        break
      case 'start':
        success = await bulkUpdateStatus(hackathonIds, 'active')
        break
      case 'end':
        success = await bulkUpdateStatus(hackathonIds, 'ended')
        break
      case 'duplicate':
        success = await bulkDuplicate(hackathonIds)
        break
      case 'delete':
        success = await bulkDelete(hackathonIds)
        break
      case 'export':
        success = await exportHackathons(hackathonIds)
        break
      case 'generate-report':
        success = await generateReport(hackathonIds)
        break
      case 'view-analytics':
        // Handle navigation to analytics page
        if (hackathonIds.length === 1) {
          window.location.href = `/client/hackathons/${hackathonIds[0]}/analytics`
        } else {
          addNotification('warning', 'Please select only one hackathon to view analytics')
        }
        return
      default:
        addNotification('warning', `Unknown action: ${action}`)
        return
    }

    if (success) {
      setSelectedHackathons([])
      refetch()
    }
  }

  const getStatusStats = () => {
    const stats = {
      total: hackathons.length,
      active: hackathons.filter(h => h.status === 'active').length,
      upcoming: hackathons.filter(h => h.status === 'draft').length,
      ended: hackathons.filter(h => h.status === 'ended').length,
      draft: hackathons.filter(h => h.status === 'draft').length
    }
    return stats
  }

  const stats = getStatusStats()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Hackathons</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Hackathons</h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage and monitor all your hackathon events
              </p>
            </div>
            <button
              onClick={handleCreateHackathon}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus size={20} />
              <span>Create Hackathon</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Main Content */}
        <div className={`flex-1 ${showSidebar ? 'max-w-6xl' : 'max-w-full'} mx-auto p-6 transition-all duration-300`}>
          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <BarChart3 className="text-gray-400" size={20} />
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                </div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Upcoming</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.upcoming}</p>
                </div>
                <Clock className="text-gray-400" size={20} />
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Ended</p>
                  <p className="text-2xl font-bold text-gray-600">{stats.ended}</p>
                </div>
                <Calendar className="text-gray-400" size={20} />
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Draft</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.draft}</p>
                </div>
                <Settings className="text-gray-400" size={20} />
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search hackathons..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-2">
                <div className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg">
                  <Filter className="text-gray-500" size={16} />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="outline-none bg-transparent text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="ended">Ended</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>

                {selectedHackathons.length > 0 && (
                  <div className="flex items-center space-x-2 px-3 py-2 bg-purple-50 rounded-lg">
                    <span className="text-sm text-purple-600">
                      {selectedHackathons.length} selected
                    </span>
                    <button
                      onClick={() => setSelectedHackathons([])}
                      className="text-purple-600 hover:text-purple-700"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Hackathons List */}
          <div className="space-y-4">
            {filteredHackathons.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Trophy className="text-gray-400" size={32} />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchQuery ? 'No hackathons found' : 'No hackathons yet'}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {searchQuery
                    ? 'Try adjusting your search terms or filters'
                    : 'Create your first hackathon to get started'
                  }
                </p>
                {!searchQuery && (
                  <button
                    onClick={handleCreateHackathon}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Create Your First Hackathon
                  </button>
                )}
              </div>
            ) : (
              <HackathonManagementList
                hackathons={filteredHackathons}
                selectedHackathons={selectedHackathons}
                onSelectionChange={setSelectedHackathons}
                onBulkAction={handleBulkAction}
              />
            )}
          </div>
        </div>

        {/* Management Sidebar */}
        {showSidebar && selectedHackathons.length > 0 && (
          <div className="w-80 border-l border-gray-200 bg-white">
            <ManagementSidebar
              selectedHackathons={selectedHackathons}
              onBulkAction={handleBulkAction}
              onClose={() => setSelectedHackathons([])}
            />
          </div>
        )}
      </div>

      {/* Toggle Sidebar Button */}
      <button
        onClick={() => setShowSidebar(!showSidebar)}
        className="fixed bottom-6 right-6 p-3 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-colors"
      >
        {showSidebar ? '→' : '←'}
      </button>

      {/* Notifications */}
      <NotificationContainer
        notifications={notifications}
        onClose={removeNotification}
      />
    </div>
  )
}
