'use client';

import React from 'react';
import { Shield, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

export interface EscrowStatusProps {
  status: 'created' | 'funded' | 'released' | 'refunded';
  balance?: string;
  expectedAmount?: string;
  createdAt?: string;
  className?: string;
}

export function EscrowStatus({ status, balance, expectedAmount, createdAt, className = '' }: EscrowStatusProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'created':
        return {
          icon: Clock,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          label: 'Escrow Created',
          description: 'Waiting for funds'
        };
      case 'funded':
        return {
          icon: Shield,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          label: 'Funds Secured',
          description: 'Payment held in escrow'
        };
      case 'released':
        return {
          icon: CheckCircle,
          color: 'text-emerald-600',
          bgColor: 'bg-emerald-50',
          borderColor: 'border-emerald-200',
          label: 'Released',
          description: 'Funds transferred to freelancer'
        };
      case 'refunded':
        return {
          icon: RefreshCw,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          label: 'Refunded',
          description: 'Funds returned to client'
        };
      default:
        return {
          icon: XCircle,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          label: 'Unknown',
          description: 'Status unknown'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className={`border ${config.borderColor} ${config.bgColor} rounded-lg p-4 ${className}`}>
      <div className="flex items-start space-x-3">
        <div className={`${config.color} mt-1`}>
          <Icon size={24} />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className={`font-semibold ${config.color}`}>{config.label}</h3>
            {status === 'funded' && (
              <Shield className="text-green-600" size={16} />
            )}
          </div>
          <p className="text-sm text-gray-600 mt-1">{config.description}</p>
          
          {balance && expectedAmount && (
            <div className="mt-3 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Expected:</span>
                <span className="font-medium">{parseFloat(expectedAmount).toFixed(2)} ICP</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Current Balance:</span>
                <span className="font-medium">{parseFloat(balance).toFixed(2)} ICP</span>
              </div>
            </div>
          )}
          
          {createdAt && (
            <div className="mt-2 text-xs text-gray-500">
              Created: {new Date(parseInt(createdAt) / 1000000).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


