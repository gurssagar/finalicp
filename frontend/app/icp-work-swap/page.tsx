'use client'
import React, { useState } from 'react';
import { SwapInterface } from '@/components/swap/SwapInterface';
import { TransactionHistory } from '@/components/swap/TransactionHistory';
import { DashboardLayout } from '@/components/DashboardLayout';
import { ChevronDown } from 'lucide-react';
export default function ICPWorkSwap() {
  const [activeTab, setActiveTab] = useState('swap');
  const [activeHistoryTab, setActiveHistoryTab] = useState('pending');
  return <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">ICP Work Swap</h1>
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button className={`px-6 py-2 rounded-full text-sm font-medium ${activeTab === 'swap' ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`} onClick={() => setActiveTab('swap')}>
            Swap
          </button>
          <button className={`px-6 py-2 rounded-full text-sm font-medium ${activeTab === 'liquidity' ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`} onClick={() => setActiveTab('liquidity')}>
            Liquidity
          </button>
          <button className={`px-6 py-2 rounded-full text-sm font-medium flex items-center ${activeTab === 'earn' ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`} onClick={() => setActiveTab('earn')}>
            Earn <ChevronDown size={16} className="ml-1" />
          </button>
          <button className={`px-6 py-2 rounded-full text-sm font-medium ${activeTab === 'ck-bridge' ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`} onClick={() => setActiveTab('ck-bridge')}>
            ck-bridge
          </button>
          <button className={`px-6 py-2 rounded-full text-sm font-medium ${activeTab === 'info' ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`} onClick={() => setActiveTab('info')}>
            Info
          </button>
          <button className={`px-6 py-2 rounded-full text-sm font-medium flex items-center ${activeTab === 'more' ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`} onClick={() => setActiveTab('more')}>
            More <ChevronDown size={16} className="ml-1" />
          </button>
        </div>
        {/* Main Swap Interface */}
        {activeTab === 'swap' && <SwapInterface />}
        {/* Transaction History Tabs */}
        <div className="mt-8 flex gap-2">
          <button className={`px-6 py-2 rounded-full text-sm font-medium ${activeHistoryTab === 'pending' ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`} onClick={() => setActiveHistoryTab('pending')}>
            Pending
          </button>
          <button className={`px-6 py-2 rounded-full text-sm font-medium ${activeHistoryTab === 'history' ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`} onClick={() => setActiveHistoryTab('history')}>
            History
          </button>
        </div>
        {/* Transaction History */}
        
        <TransactionHistory activeTab={activeHistoryTab} />
      </div>
    </DashboardLayout>;
}