'use client'
import React, { useState } from 'react'
import { TransactionHistory } from '@/components/swap/TransactionHistory'
import { DashboardLayout } from '@/components/DashboardLayout'
import { ChevronDown } from 'lucide-react'
export default function ICPWorkSwap() {
  const [activeTab, setActiveTab] = useState('swap')
  const [activeHistoryTab, setActiveHistoryTab] = useState('pending')
  return (
    
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">ICP Work Swap</h1>
        
        {/* Main Swap Interface */}
        {activeTab === 'swap' && (
          <div className="w-full rounded-lg overflow-hidden border border-gray-200 shadow-lg">
            <iframe
              src="https://kongswap.io/"
              className="w-full h-[800px] border-0"
              title="RocketX Exchange Swap"
              allow="clipboard-read; clipboard-write"
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            />
          </div>
        )}
      </div>

  )
}
