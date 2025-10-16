import React from 'react'

import { Sidebar } from '@/components/Sidebar'
import { Header1 } from '@/components/Header1'
interface FreelancerLayoutProps {
  children: React.ReactNode
  title?: string
  showSearch?: boolean
  showCreateButton?: boolean
  onSearch?: (query: string) => void
  onCreateClick?: () => void
}

export default function FreelancerLayout({
  children,
  title,
  showSearch = false,
  showCreateButton = false,
  onSearch,
  onCreateClick,
}: FreelancerLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
 
      <Sidebar />
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header1 showSearch={false} />
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

