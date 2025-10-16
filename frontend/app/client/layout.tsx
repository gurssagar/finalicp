
import React from 'react'
import { ClientSidebar } from '@/components/client/ClientSidebar'
import { ClientHeader } from '@/components/client/ClientHeader'
import { Header1 } from '@/components/Header1'
interface ClientLayoutProps {
  children: React.ReactNode
  title?: string
  showSearch?: boolean
  showCreateButton?: boolean
  onSearch?: (query: string) => void
  onCreateClick?: () => void
}

export default function ClientLayout({
  children,
  title,
  showSearch = false,
  showCreateButton = false,
  onSearch,
  onCreateClick,
}: ClientLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <ClientSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header1 />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}