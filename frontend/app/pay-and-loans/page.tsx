'use client'
import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { ArrowUpRight, Check, Download, Plus } from 'lucide-react';
export default function PayAndLoans() {
  const [activeTab, setActiveTab] = useState('payments');
  const [activeSubTab, setActiveSubTab] = useState('overview');
  const transactions = [{
    id: 1,
    title: 'Payment for DeFi Dashboard project',
    amount: '+1250 ICP',
    status: 'Completed',
    from: 'client@example.com',
    date: 'Jan 15, 2024 16:00',
    type: 'incoming'
  }, {
    id: 2,
    title: 'Payment for DeFi Dashboard project',
    amount: '-120 ICP',
    status: 'Completed',
    from: 'client@example.com',
    date: 'Jan 15, 2024 16:00',
    type: 'outgoing'
  }, {
    id: 3,
    title: 'Payment for DeFi Dashboard project',
    amount: '+1250 ICP',
    status: 'Pending',
    from: 'client@example.com',
    date: 'Jan 15, 2024 16:00',
    type: 'incoming'
  }];
  return <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Header showSearch={false} />
        <main className="flex-1 p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold mb-1">Payments & Loans</h1>
            </div>
            <div className="mt-4 md:mt-0 flex items-center gap-4">
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50">
                <Download size={16} />
                <span>Export</span>
              </button>
              <button className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg">
                <Plus size={16} />
                <span>Add Funds</span>
              </button>
            </div>
          </div>
          {/* Tabs */}
          <div className="mb-6 border-b border-gray-200">
            <div className="flex">
              <button onClick={() => setActiveTab('payments')} className={`py-2 px-4 relative ${activeTab === 'payments' ? 'text-black font-medium' : 'text-gray-500'}`}>
                Payments
                {activeTab === 'payments' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500"></div>}
              </button>
              <button onClick={() => setActiveTab('loans')} className={`py-2 px-4 relative ${activeTab === 'loans' ? 'text-black font-medium' : 'text-gray-500'}`}>
                Loans
                {activeTab === 'loans' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500"></div>}
              </button>
            </div>
          </div>
          {/* Balances */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm">
              <div className="text-sm text-gray-500 mb-2">Total Earnings</div>
              <div className="flex items-center gap-2 mb-1">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 1V23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <h3 className="text-xl font-bold">$17,500.90</h3>
              </div>
              <div className="text-xs text-gray-500">USD EQUIVALENT</div>
            </div>
            <div className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm">
              <div className="text-sm text-gray-500 mb-2">ICP Balance</div>
              <div className="flex items-center gap-2 mb-1">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M2 12H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 2C14.5013 4.73835 15.9228 8.29203 16 12C15.9228 15.708 14.5013 19.2616 12 22C9.49872 19.2616 8.07725 15.708 8 12C8.07725 8.29203 9.49872 4.73835 12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <h3 className="text-xl font-bold">2.45 ICP</h3>
              </div>
              <div className="text-xs text-gray-500">≈$2,205 USD</div>
            </div>
            <div className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm">
              <div className="text-sm text-gray-500 mb-2">CkBTC Balance</div>
              <div className="flex items-center gap-2 mb-1">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 12H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 9V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <h3 className="text-xl font-bold">0.025 ckBTC</h3>
              </div>
              <div className="text-xs text-gray-500">≈$1,085 USD</div>
            </div>
          </div>
          {/* Transactions section */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-8">
            {/* Sub tabs */}
            <div className="border-b border-gray-200 px-4">
              <div className="flex">
                <button onClick={() => setActiveSubTab('overview')} className={`py-3 px-4 relative text-sm ${activeSubTab === 'overview' ? 'text-black font-medium' : 'text-gray-500'}`}>
                  Overview
                  {activeSubTab === 'overview' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500"></div>}
                </button>
                <button onClick={() => setActiveSubTab('transactions')} className={`py-3 px-4 relative text-sm ${activeSubTab === 'transactions' ? 'text-black font-medium' : 'text-gray-500'}`}>
                  Transactions
                  {activeSubTab === 'transactions' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500"></div>}
                </button>
                <button onClick={() => setActiveSubTab('escrow')} className={`py-3 px-4 relative text-sm ${activeSubTab === 'escrow' ? 'text-black font-medium' : 'text-gray-500'}`}>
                  Escrow
                  {activeSubTab === 'escrow' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500"></div>}
                </button>
                <button onClick={() => setActiveSubTab('settings')} className={`py-3 px-4 relative text-sm ${activeSubTab === 'settings' ? 'text-black font-medium' : 'text-gray-500'}`}>
                  Settings
                  {activeSubTab === 'settings' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500"></div>}
                </button>
              </div>
            </div>
            {/* Recent Activity */}
            <div className="p-6">
              <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {transactions.map(transaction => <div key={transaction.id} className="flex items-center border-b border-gray-100 pb-4">
                    <div className={`mr-4 rounded-lg w-12 h-12 flex items-center justify-center text-white ${transaction.type === 'incoming' ? 'bg-green-500' : 'bg-orange-500'}`}>
                      {transaction.type === 'incoming' ? <Check size={20} /> : <ArrowUpRight size={20} />}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{transaction.title}</h4>
                      <div className="text-xs text-gray-500">
                        From: {transaction.from}
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className={`flex items-center ${transaction.type === 'incoming' ? 'text-green-500' : 'text-orange-500'}`}>
                        <span>{transaction.amount}</span>
                        <div className={`ml-2 text-xs px-2 py-0.5 rounded ${transaction.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {transaction.status}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {transaction.date}
                      </div>
                    </div>
                  </div>)}
              </div>
            </div>
          </div>
          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white mr-2">
                  <Check size={16} />
                </div>
                <h3 className="text-lg font-bold">This Month</h3>
              </div>
              <div className="text-2xl font-bold mb-1">$3,250</div>
              <div className="text-xs text-green-500">+15% FROM LAST MONTH</div>
            </div>
            <div className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white mr-2">
                  <ArrowUpRight size={16} />
                </div>
                <h3 className="text-lg font-bold">ICP Platform Fees</h3>
              </div>
              <div className="text-2xl font-bold mb-1">$32.50</div>
              <div className="text-xs text-gray-500">ONLY 1% FEE</div>
            </div>
            <div className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white mr-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 12H16L14 15H10L8 12H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M5.45 5.11L2 12V18C2 18.5304 2.21071 19.0391 2.58579 19.4142C2.96086 19.7893 3.46957 20 4 20H20C20.5304 20 21.0391 19.7893 21.4142 19.4142C21.7893 19.0391 22 18.5304 22 18V12L18.55 5.11C18.3844 4.77679 18.1292 4.49637 17.813 4.30028C17.4967 4.10419 17.1321 4.0002 16.76 4H7.24C6.86792 4.0002 6.50326 4.10419 6.18704 4.30028C5.87083 4.49637 5.61558 4.77679 5.45 5.11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold">Pending</h3>
              </div>
              <div className="text-2xl font-bold mb-1">$750</div>
              <div className="text-xs text-gray-500">IN ESCROW</div>
            </div>
          </div>
        </main>
      </div>
    </div>;
}