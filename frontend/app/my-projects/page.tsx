'use client'
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
export default function MyProjectsPage() {
  const navigate = useRouter();
  const [activeTab, setActiveTab] = useState('completed');
  const handleViewProject = () => {
    navigate.push('/project-details');
  };
  return <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>
      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <header className="flex justify-between items-center p-4 border-b border-gray-200">
          <div className="md:hidden">
            <svg width="110" height="32" viewBox="0 0 40 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-8">
              <path d="M20.0001 0L0 11.5556V23.1111L20.0001 11.5556L40.0001 23.1111V11.5556L20.0001 0Z" fill="#FF3B30" />
              <path d="M0 23.1111L20.0001 11.5555V23.1111V34.6667L0 23.1111Z" fill="#34C759" />
              <path d="M40.0001 23.1111L20.0001 11.5555V23.1111V34.6667L40.0001 23.1111Z" fill="#007AFF" />
            </svg>
          </div>
          <div className="flex items-center ml-auto gap-4">
            <div className="relative">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  1
                </div>
              </div>
            </div>
            <div className="flex items-center border rounded-full px-4 py-2 gap-2">
              <span className="text-sm font-medium">Client</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full overflow-hidden">
                <img src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=300&auto=format&fit=crop" alt="Profile" className="w-full h-full object-cover" />
              </div>
              <span className="hidden md:inline">John Doe</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </header>
        {/* Main Content */}
        <div className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h1 className="text-2xl font-bold">My Projects</h1>
              <p className="text-gray-600">
                Manage your projects and proposals
              </p>
            </div>
            <div className="flex gap-4">
              <button className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-pink-500 text-white rounded-full font-medium hover:opacity-90 transition-opacity">
                <Plus size={18} />
                Post New Project
              </button>
              <button className="flex items-center gap-2 px-6 py-2 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M2 12h20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 2v20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Analytics
              </button>
            </div>
          </div>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <polyline points="9 22 9 12 15 12 15 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-gray-600 text-sm uppercase">
                  Active Projects
                </span>
              </div>
              <h2 className="text-3xl font-bold">2333</h2>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-gray-600 text-sm uppercase">
                  Pending Proposals
                </span>
              </div>
              <h2 className="text-3xl font-bold">21</h2>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <polyline points="22 4 12 14.01 9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-gray-600 text-sm uppercase">
                  Completed
                </span>
              </div>
              <h2 className="text-3xl font-bold">2312</h2>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <line x1="12" y1="1" x2="12" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-gray-600 text-sm uppercase">
                  Total Value
                </span>
              </div>
              <h2 className="text-3xl font-bold">222</h2>
            </div>
          </div>
          {/* Tabs */}
          <div className="mb-4">
            <div className="flex border-b border-gray-200 mb-4">
              <button onClick={() => setActiveTab('posted')} className={`py-2 px-4 ${activeTab === 'posted' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-600'}`}>
                My Posted Projects
              </button>
              <button onClick={() => setActiveTab('proposals')} className={`py-2 px-4 ${activeTab === 'proposals' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-600'}`}>
                My Proposals
              </button>
            </div>
            <div className="flex border-b border-gray-200">
              <button onClick={() => setActiveTab('new')} className={`py-2 px-4 ${activeTab === 'new' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-600'}`}>
                New Orders
              </button>
              <button onClick={() => setActiveTab('completed')} className={`py-2 px-4 ${activeTab === 'completed' ? 'border-b-2 border-green-500 text-green-500' : 'text-gray-600'}`}>
                Completed
              </button>
              <button onClick={() => setActiveTab('cancelled')} className={`py-2 px-4 ${activeTab === 'cancelled' ? 'border-b-2 border-red-500 text-red-500' : 'text-gray-600'}`}>
                Cancelled
              </button>
            </div>
          </div>
          {/* Project List */}
          <div className="space-y-6">
            {[1, 2].map(item => <div key={item} className="border border-gray-200 rounded-lg overflow-hidden flex flex-col md:flex-row cursor-pointer hover:shadow-md transition-shadow" onClick={handleViewProject}>
                <div className="w-full md:w-48 h-48 md:h-auto">
                  <img src={`https://uploadthingy.s3.us-west-1.amazonaws.com/${item === 1 ? '8rhjUNYMguHLnGx62HXxMk/Freelancer_Payment_Flow2x-1.png' : '26vH76m42e5tG2oCDsENpm/Freelancer_Payment_Flow2x-2.png'}`} alt="Project thumbnail" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 p-4 flex flex-col md:flex-row justify-between">
                  <div>
                    <h3 className="text-lg font-bold mb-2">
                      I will do website ui, figma website design, website design
                      figma, figma design website
                    </h3>
                    <div className="mb-2">
                      <p className="text-sm text-gray-600">Basic Tier: $10</p>
                    </div>
                    <p className="text-sm text-gray-600">
                      Ordered On: 20 Nov 2023, 12:20 PM
                    </p>
                  </div>
                  <div className="flex flex-col items-end mt-4 md:mt-0 justify-between">
                    <div className="text-xl font-bold">$ 70</div>
                    <div className="mt-auto">
                      <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs">
                        Pending
                      </span>
                    </div>
                  </div>
                </div>
              </div>)}
          </div>
        </div>
      </div>
    </div>;
}