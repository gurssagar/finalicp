'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Clock, Wallet, RefreshCw } from 'lucide-react';

interface EscrowData {
  escrowId: string;
  depositAccount: {
    owner: string;
    subaccount: number[] | null;
  };
}

interface FundingStatus {
  funded: boolean;
  balanceE8s: number;
}

interface EscrowManagerProps {
  projectId: string;
  freelancerUserId: string;
  expectedAmountICP: number; // Amount in ICP (not e8s)
  isClient?: boolean; // Whether current user is the client
  onEscrowCreated?: (escrowData: EscrowData) => void;
  onEscrowReleased?: () => void;
}

export default function EscrowManager({
  projectId,
  freelancerUserId,
  expectedAmountICP,
  isClient = true,
  onEscrowCreated,
  onEscrowReleased,
}: EscrowManagerProps) {
  const [escrowData, setEscrowData] = useState<EscrowData | null>(null);
  const [fundingStatus, setFundingStatus] = useState<FundingStatus | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isReleasing, setIsReleasing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const expectedAmountE8s = Math.floor(expectedAmountICP * 100000000); // Convert ICP to e8s

  // Create escrow
  const createEscrow = async () => {
    setIsCreating(true);
    setError(null);

    try {
      const response = await fetch('/api/escrow/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          freelancerUserId,
          amountE8s: expectedAmountE8s,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to create escrow');
      }

      setEscrowData(result.data);
      onEscrowCreated?.(result.data);

      // Auto-refresh funding status
      await refreshFundingStatus(result.data.escrowId);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsCreating(false);
    }
  };

  // Refresh funding status
  const refreshFundingStatus = async (escrowId?: string) => {
    const id = escrowId || escrowData?.escrowId;
    if (!id) return;

    setIsRefreshing(true);
    setError(null);

    try {
      const response = await fetch(`/api/escrow/${id}/refresh`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to refresh funding status');
      }

      setFundingStatus(result.data);
      setLastRefresh(new Date());

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Release escrow
  const releaseEscrow = async () => {
    if (!escrowData) return;

    setIsReleasing(true);
    setError(null);

    try {
      const response = await fetch(`/api/escrow/${escrowData.escrowId}/release`, {
        method: 'POST',
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to release escrow');
      }

      onEscrowReleased?.();
      setEscrowData(null);
      setFundingStatus(null);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsReleasing(false);
    }
  };

  // Auto-refresh funding status every 30 seconds if escrow exists and not funded
  useEffect(() => {
    if (escrowData && (!fundingStatus || !fundingStatus.funded)) {
      const interval = setInterval(() => {
        refreshFundingStatus();
      }, 30000); // 30 seconds

      return () => clearInterval(interval);
    }
  }, [escrowData, fundingStatus]);

  // Format account for display
  const formatAccount = (account: { owner: string; subaccount: number[] | null }) => {
    const principal = account.owner;
    const subaccount = account.subaccount
      ? '0x' + Array.from(account.subaccount).map(b => b.toString(16).padStart(2, '0')).join('')
      : 'default';

    return `${principal}:${subaccount}`;
  };

  // Format ICP amount
  const formatICP = (e8s: number) => {
    return (e8s / 100000000).toFixed(4);
  };

  if (!isClient) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet size={20} />
            Escrow Payment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Clock className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-gray-600">
              Waiting for client to create escrow payment of {expectedAmountICP} ICP
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet size={20} />
          Escrow Payment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!escrowData ? (
          // Create escrow state
          <div className="text-center py-6">
            <div className="mb-4">
              <div className="text-2xl font-bold text-gray-900">
                {expectedAmountICP} ICP
              </div>
              <div className="text-sm text-gray-600">
                Escrow amount for this project
              </div>
            </div>

            <Button
              onClick={createEscrow}
              disabled={isCreating}
              className="w-full"
            >
              {isCreating ? (
                <>
                  <RefreshCw className="mr-2 animate-spin" size={16} />
                  Creating Escrow...
                </>
              ) : (
                'Create Escrow Payment'
              )}
            </Button>

            <div className="mt-4 text-xs text-gray-500">
              Funds will be held securely until project completion
            </div>
          </div>
        ) : (
          // Escrow created state
          <div className="space-y-4">
            {/* Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {fundingStatus?.funded ? (
                  <CheckCircle className="text-green-500" size={20} />
                ) : (
                  <Clock className="text-yellow-500" size={20} />
                )}
                <span className="font-medium">
                  {fundingStatus?.funded ? 'Funded' : 'Waiting for Payment'}
                </span>
              </div>

              <Badge variant={fundingStatus?.funded ? 'default' : 'secondary'}>
                {fundingStatus ? formatICP(fundingStatus.balanceE8s) : '0'} / {expectedAmountICP} ICP
              </Badge>
            </div>

            {/* Deposit Address */}
            {!fundingStatus?.funded && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm font-medium mb-2">Deposit Address:</div>
                <div className="font-mono text-xs bg-white p-2 rounded border break-all">
                  {formatAccount(escrowData.depositAccount)}
                </div>
                <div className="mt-2 text-xs text-gray-600">
                  Send exactly {expectedAmountICP} ICP to this address using Plug wallet or any ICP-compatible wallet
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => refreshFundingStatus()}
                disabled={isRefreshing}
                className="flex-1"
              >
                {isRefreshing ? (
                  <>
                    <RefreshCw className="mr-2 animate-spin" size={16} />
                    Checking...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2" size={16} />
                    Refresh Status
                  </>
                )}
              </Button>

              {fundingStatus?.funded && (
                <Button
                  onClick={releaseEscrow}
                  disabled={isReleasing}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {isReleasing ? (
                    <>
                      <RefreshCw className="mr-2 animate-spin" size={16} />
                      Releasing...
                    </>
                  ) : (
                    'Mark Complete & Release'
                  )}
                </Button>
              )}
            </div>

            {lastRefresh && (
              <div className="text-xs text-gray-500 text-center">
                Last checked: {lastRefresh.toLocaleTimeString()}
              </div>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="text-red-500" size={16} />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
