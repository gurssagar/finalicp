'use client'

import React, { useState } from 'react'
import {
  Calendar,
  Users,
  Clock,
  Trophy,
  Edit,
  Copy,
  Trash2,
  Eye,
  BarChart3,
  MoreVertical,
  CheckSquare,
  Square
} from 'lucide-react'
import Link from 'next/link'
import { Hackathon } from '@/hooks/useUserHackathons'

interface HackathonManagementListProps {
  hackathons: Hackathon[]
  selectedHackathons: string[]
  onSelectionChange: (hackathonIds: string[]) => void
  onBulkAction: (action: string, hackathonIds: string[]) => void
}

export function HackathonManagementList({
  hackathons,
  selectedHackathons,
  onSelectionChange,
  onBulkAction
}: HackathonManagementListProps) {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

  const handleSelectHackathon = (hackathonId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedHackathons, hackathonId])
    } else {
      onSelectionChange(selectedHackathons.filter(id => id !== hackathonId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(hackathons.map(h => h.id))
    } else {
      onSelectionChange([])
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'upcoming':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'ended':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'draft':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'published':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <div className="w-2 h-2 bg-green-500 rounded-full"></div>
      case 'upcoming':
        return <Clock size={12} className="text-blue-500" />
      case 'ended':
        return <Calendar size={12} className="text-gray-500" />
      case 'draft':
        return <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
      default:
        return <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleAction = (action: string, hackathonId: string) => {
    setActiveDropdown(null)

    switch (action) {
      case 'view':
        window.location.href = `/hackathon/${hackathonId}`
        break
      case 'edit':
        window.location.href = `/client/hackathons/${hackathonId}/edit`
        break
      case 'duplicate':
        onBulkAction('duplicate', [hackathonId])
        break
      case 'publish':
        onBulkAction('publish', [hackathonId])
        break
      case 'unpublish':
        onBulkAction('unpublish', [hackathonId])
        break
      case 'delete':
        if (confirm('Are you sure you want to delete this hackathon?')) {
          onBulkAction('delete', [hackathonId])
        }
        break
      case 'analytics':
        window.location.href = `/client/hackathons/${hackathonId}/analytics`
        break
    }
  }

  const isAllSelected = hackathons.length > 0 && selectedHackathons.length === hackathons.length
  const isSomeSelected = selectedHackathons.length > 0 && selectedHackathons.length < hackathons.length

  return (
    <div className="space-y-4">
      {/* Header with bulk actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => handleSelectAll(!isAllSelected)}
              className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900"
            >
              {isAllSelected ? (
                <CheckSquare size={18} className="text-purple-600" />
              ) : isSomeSelected ? (
                <div className="relative">
                  <Square size={18} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-2 bg-purple-600 rounded-sm"></div>
                  </div>
                </div>
              ) : (
                <Square size={18} />
              )}
              <span>
                {isAllSelected ? 'Deselect All' : 'Select All'}
              </span>
            </button>

            {selectedHackathons.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">
                  {selectedHackathons.length} selected
                </span>
                <div className="h-4 w-px bg-gray-300"></div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => onBulkAction('publish', selectedHackathons)}
                    className="px-3 py-1 text-xs bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors"
                  >
                    Publish
                  </button>
                  <button
                    onClick={() => onBulkAction('unpublish', selectedHackathons)}
                    className="px-3 py-1 text-xs bg-orange-50 text-orange-700 rounded hover:bg-orange-100 transition-colors"
                  >
                    Unpublish
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete ${selectedHackathons.length} hackathons?`)) {
                        onBulkAction('delete', selectedHackathons)
                      }
                    }}
                    className="px-3 py-1 text-xs bg-red-50 text-red-700 rounded hover:bg-red-100 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>{hackathons.length} hackathons</span>
          </div>
        </div>
      </div>

      {/* Hackathon Cards Grid */}
      <div className="grid gap-4">
        {hackathons.map((hackathon) => (
          <div
            key={hackathon.id}
            className={`bg-white rounded-lg border transition-all duration-200 ${
              selectedHackathons.includes(hackathon.id)
                ? 'border-purple-300 shadow-md'
                : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
            }`}
          >
            <div className="p-6">
              {/* Header Row */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4">
                  {/* Checkbox */}
                  <button
                    onClick={() => handleSelectHackathon(hackathon.id, !selectedHackathons.includes(hackathon.id))}
                    className="mt-1 flex-shrink-0"
                  >
                    {selectedHackathons.includes(hackathon.id) ? (
                      <CheckSquare size={18} className="text-purple-600" />
                    ) : (
                      <Square size={18} className="text-gray-400 hover:text-gray-600" />
                    )}
                  </button>

                  {/* Main Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {hackathon.title}
                      </h3>
                      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(hackathon.status)}`}>
                        {getStatusIcon(hackathon.status)}
                        <span className="capitalize">{hackathon.status}</span>
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {hackathon.description}
                    </p>

                    <div className="flex items-center space-x-1 text-xs text-purple-600 font-medium mb-3">
                      <Trophy size={14} />
                      <span>{hackathon.tagline}</span>
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Calendar size={16} className="text-gray-400" />
                        <div>
                          <div className="font-medium text-gray-900">
                            {formatDate(hackathon.startDate)}
                          </div>
                          <div className="text-xs text-gray-500">Start Date</div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Users size={16} className="text-gray-400" />
                        <div>
                          <div className="font-medium text-gray-900">
                            {hackathon.participantCount || 0}
                          </div>
                          <div className="text-xs text-gray-500">Participants</div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Trophy size={16} className="text-gray-400" />
                        <div>
                          <div className="font-medium text-gray-900">
                            {hackathon.prizePool}
                          </div>
                          <div className="text-xs text-gray-500">Prize Pool</div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <BarChart3 size={16} className="text-gray-400" />
                        <div>
                          <div className="font-medium text-gray-900">
                            {hackathon.submissionCount || 0}
                          </div>
                          <div className="text-xs text-gray-500">Submissions</div>
                        </div>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                        {hackathon.theme}
                      </span>
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                        {hackathon.mode}
                      </span>
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                        {hackathon.experienceLevel}
                      </span>
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                        📍 {hackathon.location}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setActiveDropdown(activeDropdown === hackathon.id ? null : hackathon.id)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <MoreVertical size={18} />
                  </button>

                  {activeDropdown === hackathon.id && (
                    <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg border border-gray-200 shadow-lg z-10">
                      <div className="py-1">
                        <button
                          onClick={() => handleAction('view', hackathon.id)}
                          className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Eye size={16} />
                          <span>View</span>
                        </button>
                        <button
                          onClick={() => handleAction('edit', hackathon.id)}
                          className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Edit size={16} />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleAction('duplicate', hackathon.id)}
                          className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Copy size={16} />
                          <span>Duplicate</span>
                        </button>
                        <button
                          onClick={() => handleAction('analytics', hackathon.id)}
                          className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <BarChart3 size={16} />
                          <span>Analytics</span>
                        </button>
                        <div className="border-t border-gray-100 my-1"></div>
                        {hackathon.status === 'draft' ? (
                          <button
                            onClick={() => handleAction('publish', hackathon.id)}
                            className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-green-700 hover:bg-green-50"
                          >
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span>Publish</span>
                          </button>
                        ) : hackathon.status === 'published' || hackathon.status === 'active' ? (
                          <button
                            onClick={() => handleAction('unpublish', hackathon.id)}
                            className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-orange-700 hover:bg-orange-50"
                          >
                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                            <span>Unpublish</span>
                          </button>
                        ) : null}
                        <button
                          onClick={() => handleAction('delete', hackathon.id)}
                          className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                        >
                          <Trash2 size={16} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Progress Bar for Active Hackathons */}
              {hackathon.status === 'active' && (
                <div className="border-t border-gray-100 pt-4">
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                    <span>Progress</span>
                    <span>{Math.round(((Date.now() - new Date(hackathon.startDate).getTime()) / (new Date(hackathon.endDate).getTime() - new Date(hackathon.startDate).getTime())) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(100, Math.round(((Date.now() - new Date(hackathon.startDate).getTime()) / (new Date(hackathon.endDate).getTime() - new Date(hackathon.startDate).getTime())) * 100))}%`
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}