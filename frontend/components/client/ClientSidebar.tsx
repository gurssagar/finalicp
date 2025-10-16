'use client'
import React from 'react'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutGrid,
  Trophy,
  Users,
  PlusCircle,
  Calendar,
  Settings,
  User,
  LogOut,
  MessageSquare,
} from 'lucide-react'

export function ClientSidebar() {
  const pathname = usePathname()
  const isActive = (path: string) => pathname === path

  const navItems = [
    {
      icon: <LayoutGrid size={20} />,
      label: 'Dashboard',
      path: '/client/dashboard',
    },
    {
      icon: <Trophy size={20} />,
      label: 'Manage Hackathons',
      path: '/client/hackathons',
    },
    {
      icon: <MessageSquare size={20} />,
      label: 'Messages',
      path: '/client/chat',
    },
    {
      icon: <Calendar size={20} />,
      label: 'Browse Services',
      path: '/client/browse-services',
    },
    {
      icon: <Calendar size={20} />,
      label: 'My Projects',
      path: '/client/projects',
    },
    {
      icon: <PlusCircle size={20} />,
      label: 'Post a Job',
      path: '/client/post-job',
    },
    {
      icon: <Calendar size={20} />,
      label: 'My Job Posts',
      path: '/client/my-job-posts',
    },
    {
      icon: <User size={20} />,
      label: 'Profile',
      path: '/client/profile',
    },
    {
      icon: <Settings size={20} />,
      label: 'Settings',
      path: '/client/settings',
    },
  ]

  const handleLogout = async () => {
    try {
      // Add logout logic here
      await fetch('/api/logout', { method: 'POST' })
      window.location.href = '/'
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <div className="w-64 border-r border-gray-200 h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <Link href="/client/dashboard" className="flex items-center">
          <div className="relative">
            <svg
              width="40"
              height="32"
              viewBox="0 0 40 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="flex-shrink-0"
            >
              <path
                d="M20.0001 0L0 11.5556V23.1111L20.0001 11.5556L40.0001 23.1111V11.5556L20.0001 0Z"
                fill="#FF3B30"
              />
              <path
                d="M0 23.1111L20.0001 11.5555V23.1111V34.6667L0 23.1111Z"
                fill="#34C759"
              />
              <path
                d="M40.0001 23.1111L20.0001 11.5555V23.1111V34.6667L40.0001 23.1111Z"
                fill="#007AFF"
              />
            </svg>
          </div>
          <span className="ml-2 font-bold text-xl text-[#161616]">ICPWork</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="p-2 flex-1 overflow-y-auto">
        {navItems.map((item, index) => (
          <Link
            key={index}
            href={item.path}
            className={`flex items-center gap-3 p-4 rounded-lg cursor-pointer transition-colors ${
              isActive(item.path)
                ? 'bg-gradient-to-r from-blue-50 to-purple-50'
                : 'hover:bg-gray-50'
            }`}
          >
            <div
              className={`w-5 h-5 flex items-center justify-center ${
                isActive(item.path) ? 'text-purple-500' : 'text-gray-600'
              }`}
            >
              {item.icon}
            </div>
            <span
              className={
                isActive(item.path)
                  ? 'font-medium text-purple-700'
                  : 'text-gray-700'
              }
            >
              {item.label}
            </span>
          </Link>
        ))}
      </nav>

      {/* User Actions */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-red-50 text-gray-700 hover:text-red-600"
        >
          <div className="w-5 h-5 flex items-center justify-center">
            <LogOut size={20} />
          </div>
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  )
}