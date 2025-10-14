'use client'  
import React from 'react';
import { Clock, CheckCircle, AlertTriangle, ArrowUpRight } from 'lucide-react';
interface TransactionHistoryProps {
  activeTab: string;
}
export function TransactionHistory({
  activeTab
}: TransactionHistoryProps) {
  // Mock transaction data
  const pendingTransactions = [{
    id: 'tx1',
    type: 'Swap',
    from: 'ETH',
    fromAmount: '0.5',
    to: 'EOS',
    toAmount: '1635.21',
    status: 'pending',
    timestamp: new Date().getTime() - 5 * 60 * 1000 // 5 minutes ago
  }];
  const completedTransactions = [{
    id: 'tx2',
    type: 'Swap',
    from: 'ETH',
    fromAmount: '1.2',
    to: 'EOS',
    toAmount: '3924.50',
    status: 'completed',
    timestamp: new Date().getTime() - 2 * 60 * 60 * 1000 // 2 hours ago
  }, {
    id: 'tx3',
    type: 'Swap',
    from: 'EOS',
    fromAmount: '200',
    to: 'ETH',
    toAmount: '0.061',
    status: 'completed',
    timestamp: new Date().getTime() - 1 * 24 * 60 * 60 * 1000 // 1 day ago
  }, {
    id: 'tx4',
    type: 'Swap',
    from: 'ETH',
    fromAmount: '0.3',
    to: 'ICP',
    toAmount: '5.43',
    status: 'failed',
    timestamp: new Date().getTime() - 3 * 24 * 60 * 60 * 1000 // 3 days ago
  }];
  // Format timestamp
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffMins > 0) {
      return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };
  return <div className="mt-4">
      {activeTab === 'pending' && <div>
          {pendingTransactions.length === 0 ? <div className="text-center py-8">
              <p className="text-gray-500">No pending transactions</p>
            </div> : <div className="space-y-4">
              {pendingTransactions.map(tx => <div key={tx.id} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <Clock size={18} className="text-yellow-500" />
                      <span className="font-medium">{tx.type}</span>
                    </div>
                    <div className="text-yellow-500 text-sm flex items-center">
                      <span>Pending</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">
                        {tx.fromAmount} {tx.from} → {tx.toAmount} {tx.to}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatTime(tx.timestamp)}
                      </p>
                    </div>
                    <button className="text-blue-600 hover:underline text-sm flex items-center gap-1">
                      <span>View</span>
                      <ArrowUpRight size={14} />
                    </button>
                  </div>
                </div>)}
            </div>}
        </div>}
      {activeTab === 'history' && <div>
          {completedTransactions.length === 0 ? <div className="text-center py-8">
              <p className="text-gray-500">No transaction history</p>
            </div> : <div className="space-y-4">
              {completedTransactions.map(tx => <div key={tx.id} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      {tx.status === 'completed' ? <CheckCircle size={18} className="text-green-500" /> : <AlertTriangle size={18} className="text-red-500" />}
                      <span className="font-medium">{tx.type}</span>
                    </div>
                    <div className={`text-sm flex items-center ${tx.status === 'completed' ? 'text-green-500' : 'text-red-500'}`}>
                      <span>
                        {tx.status === 'completed' ? 'Completed' : 'Failed'}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">
                        {tx.fromAmount} {tx.from} → {tx.toAmount} {tx.to}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatTime(tx.timestamp)}
                      </p>
                    </div>
                    <button className="text-blue-600 hover:underline text-sm flex items-center gap-1">
                      <span>View</span>
                      <ArrowUpRight size={14} />
                    </button>
                  </div>
                </div>)}
            </div>}
        </div>}
    </div>;
}