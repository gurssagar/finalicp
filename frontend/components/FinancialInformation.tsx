'use client'
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DollarSign, TrendingUp, Clock, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';

interface FinancialInformationProps {
  project: any;
  onViewTransaction?: () => void;
}

// Helper function to convert status object to string
const getStatusString = (status: any): string => {
  if (typeof status === 'string') {
    return status;
  } else if (typeof status === 'object' && status !== null) {
    const statusKey = Object.keys(status)[0];
    return statusKey || 'Pending';
  }
  return 'Pending';
};

// Helper function to get payment status icon
const getPaymentStatusIcon = (status: string) => {
  switch (status) {
    case 'Completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'Pending': return <Clock className="w-4 h-4 text-yellow-500" />;
    case 'Failed': return <AlertCircle className="w-4 h-4 text-red-500" />;
    default: return <Clock className="w-4 h-4 text-gray-500" />;
  }
};

export default function FinancialInformation({
  project,
  onViewTransaction
}: FinancialInformationProps) {
  const paymentStatus = getStatusString(project.payment_status);
  const projectStatus = getStatusString(project.status);
  const totalAmount = BigInt(project.total_amount_e8s || 0);
  const escrowAmount = BigInt(project.escrow_amount_e8s || 0);
  const releasedAmount = totalAmount - escrowAmount;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Financial Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Amount Display */}
        <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <div className="text-sm text-blue-600 font-medium mb-1">Total Project Value</div>
          {project.total_amount_usd && (
            <div className="text-2xl font-bold text-blue-900">
              ${project.total_amount_usd.toFixed(2)} USD
            </div>
          )}
          <div className="text-xs text-blue-600 mt-1">
            {paymentStatus === 'Completed' ? 'Fully Paid' : 'Payment in Escrow'}
          </div>
        </div>

        {/* Financial Breakdown */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Total Amount</span>
              <div className="text-right">
                {project.total_amount_usd && (
                  <div className="text-sm font-medium">${project.total_amount_usd.toFixed(2)} USD</div>
                )}
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: '100%' }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">In Escrow</span>
              <div className="text-right">
                {project.escrow_amount_usd && (
                  <div className="text-sm font-medium">${project.escrow_amount_usd.toFixed(2)} USD</div>
                )}
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                style={{
                  width: totalAmount > 0 ? `${(Number(escrowAmount) / Number(totalAmount)) * 100}%` : '0%'
                }}
              ></div>
            </div>
          </div>

          {releasedAmount > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Released to Freelancer</span>
                <div className="text-right">
                  {project.total_amount_usd && project.escrow_amount_usd && (
                    <div className="text-sm font-medium text-green-600">
                      ${(project.total_amount_usd - project.escrow_amount_usd).toFixed(2)} USD
                    </div>
                  )}
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: totalAmount > 0 ? `${(Number(releasedAmount) / Number(totalAmount)) * 100}%` : '0%'
                  }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Payment Details */}
        <div className="space-y-3 pt-4 border-t border-gray-200">
          <div>
            <div className="text-sm text-gray-500 mb-1">Payment Status</div>
            <div className="flex items-center gap-2">
              {getPaymentStatusIcon(paymentStatus)}
              <Badge
                variant={paymentStatus === 'Completed' ? 'default' : 'outline'}
                className={paymentStatus === 'Completed' ? 'bg-green-100 text-green-800' : ''}
              >
                {paymentStatus}
              </Badge>
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-500 mb-1">Payment Method</div>
            <Badge variant="outline" className="text-xs">
              {project.payment_method ? project.payment_method.replace('-', ' ').toUpperCase() : 'ICP'}
            </Badge>
          </div>

          {project.payment_id && (
            <div>
              <div className="text-sm text-gray-500 mb-1">Payment ID</div>
              <div className="flex items-center gap-2">
                <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                  {project.payment_id.slice(-12)}...
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => navigator.clipboard.writeText(project.payment_id)}
                >
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
            </div>
          )}

          {project.ledger_deposit_block && (
            <div>
              <div className="text-sm text-gray-500 mb-1">Transaction Block</div>
              <div className="flex items-center gap-2">
                <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                  #{project.ledger_deposit_block.toString()}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => navigator.clipboard.writeText(project.ledger_deposit_block.toString())}
                >
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Financial Actions */}
        {projectStatus !== 'Completed' && paymentStatus !== 'Completed' && (
          <div className="pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              className="w-full"
              onClick={onViewTransaction}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              View Transaction Details
            </Button>
          </div>
        )}

        {/* Financial Summary */}
        <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600">
          <div className="flex items-center gap-1 mb-1">
            <DollarSign className="w-3 h-3" />
            <span className="font-medium">Financial Summary</span>
          </div>
          <ul className="space-y-1 ml-4">
            <li>• Funds are held in secure escrow until project milestones are completed</li>
            <li>• Payments are released to the freelancer upon stage approval</li>
            <li>• All transactions are recorded on the blockchain for transparency</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}