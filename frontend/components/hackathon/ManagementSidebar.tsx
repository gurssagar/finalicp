'use client'

import React, { useState } from 'react'
import {
  X,
  Edit3,
  Copy,
  Trash2,
  Eye,
  BarChart3,
  Calendar,
  Users,
  Trophy,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

interface ManagementSidebarProps {
  selectedHackathons: string[]
  onBulkAction: (action: string, hackathonIds: string[]) => void
  onClose: () => void
}

export function ManagementSidebar({
  selectedHackathons,
  onBulkAction,
  onClose
}: ManagementSidebarProps) {
  const [expandedSection, setExpandedSection] = useState<string>('actions')

  const handleBulkAction = (action: string) => {
    onBulkAction(action, selectedHackathons)
  }

  const actionCategories = [
    {
      id: 'status',
      title: 'Status Management',
      icon: CheckCircle,
      actions: [
        {
          id: 'publish',
          label: 'Publish',
          description: 'Make selected hackathons live',
          color: 'green',
          icon: CheckCircle
        },
        {
          id: 'unpublish',
          label: 'Unpublish',
          description: 'Set selected hackathons to draft',
          color: 'orange',
          icon: AlertCircle
        },
        {
          id: 'start',
          label: 'Start Now',
          description: 'Immediately begin selected hackathons',
          color: 'blue',
          icon: Clock
        },
        {
          id: 'end',
          label: 'End Now',
          description: 'Immediately end selected hackathons',
          color: 'red',
          icon: X
        }
      ]
    },
    {
      id: 'content',
      title: 'Content Management',
      icon: Edit3,
      actions: [
        {
          id: 'duplicate',
          label: 'Duplicate',
          description: 'Create copies of selected hackathons',
          color: 'purple',
          icon: Copy
        },
        {
          id: 'export',
          label: 'Export Data',
          description: 'Download hackathon data as CSV',
          color: 'blue',
          icon: BarChart3
        }
      ]
    },
    {
      id: 'analytics',
      title: 'Analytics & Reports',
      icon: BarChart3,
      actions: [
        {
          id: 'view-analytics',
          label: 'View Analytics',
          description: 'See detailed performance metrics',
          color: 'indigo',
          icon: BarChart3
        },
        {
          id: 'generate-report',
          label: 'Generate Report',
          description: 'Create comprehensive report',
          color: 'cyan',
          icon: Trophy
        }
      ]
    },
    {
      id: 'dangerous',
      title: 'Dangerous Actions',
      icon: AlertCircle,
      actions: [
        {
          id: 'delete',
          label: 'Delete',
          description: 'Permanently remove selected hackathons',
          color: 'red',
          icon: Trash2,
          requiresConfirmation: true
        }
      ]
    }
  ]

  const getActionButtonStyles = (color: string, isDangerous: boolean = false) => {
    const baseStyles = 'w-full text-left p-3 rounded-lg border transition-all duration-200 flex items-center space-x-3'

    if (isDangerous) {
      return `${baseStyles} border-red-200 bg-red-50 hover:bg-red-100 hover:border-red-300 text-red-700`
    }

    const colorStyles = {
      green: `${baseStyles} border-green-200 bg-green-50 hover:bg-green-100 hover:border-green-300 text-green-700`,
      blue: `${baseStyles} border-blue-200 bg-blue-50 hover:bg-blue-100 hover:border-blue-300 text-blue-700`,
      purple: `${baseStyles} border-purple-200 bg-purple-50 hover:bg-purple-100 hover:border-purple-300 text-purple-700`,
      orange: `${baseStyles} border-orange-200 bg-orange-50 hover:bg-orange-100 hover:border-orange-300 text-orange-700`,
      indigo: `${baseStyles} border-indigo-200 bg-indigo-50 hover:bg-indigo-100 hover:border-indigo-300 text-indigo-700`,
      cyan: `${baseStyles} border-cyan-200 bg-cyan-50 hover:bg-cyan-100 hover:border-cyan-300 text-cyan-700`,
      red: `${baseStyles} border-red-200 bg-red-50 hover:bg-red-100 hover:border-red-300 text-red-700`,
    }

    return colorStyles[color as keyof typeof colorStyles] || baseStyles
  }

  const handleActionClick = (action: any) => {
    if (action.requiresConfirmation) {
      const confirmed = window.confirm(
        `Are you sure you want to ${action.label.toLowerCase()} ${selectedHackathons.length} hackathon${selectedHackathons.length > 1 ? 's' : ''}? This action cannot be undone.`
      )
      if (confirmed) {
        handleBulkAction(action.id)
      }
    } else {
      handleBulkAction(action.id)
    }
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Bulk Actions</h2>
          <p className="text-sm text-gray-600 mt-1">
            {selectedHackathons.length} hackathon{selectedHackathons.length > 1 ? 's' : ''} selected
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Quick Stats */}
      <div className="p-6 border-b border-gray-200 bg-gray-50">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{selectedHackathons.length}</div>
            <div className="text-xs text-gray-600">Selected</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">4</div>
            <div className="text-xs text-gray-600">Categories</div>
          </div>
        </div>
      </div>

      {/* Action Categories */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {actionCategories.map((category) => (
          <div key={category.id} className="border border-gray-200 rounded-lg">
            <button
              onClick={() => setExpandedSection(expandedSection === category.id ? '' : category.id)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <category.icon size={18} className="text-gray-600" />
                <h3 className="font-medium text-gray-900">{category.title}</h3>
              </div>
              {expandedSection === category.id ? (
                <ChevronUp size={18} className="text-gray-400" />
              ) : (
                <ChevronDown size={18} className="text-gray-400" />
              )}
            </button>

            {expandedSection === category.id && (
              <div className="px-4 pb-4 space-y-2">
                {category.actions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => handleActionClick(action)}
                    className={getActionButtonStyles(action.color, (action as any).requiresConfirmation)}
                  >
                    <action.icon size={18} />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{action.label}</div>
                      <div className="text-xs opacity-75">{action.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-gray-200 bg-gray-50">
        <div className="space-y-3">
          <button
            onClick={() => setExpandedSection('')}
            className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Clear Selection
          </button>
          <div className="text-xs text-gray-500 text-center">
            Select hackathons to perform bulk operations
          </div>
        </div>
      </div>
    </div>
  )
}