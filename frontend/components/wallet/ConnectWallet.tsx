'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface ConnectWalletProps {
  onConnect?: (data: { principal: string; accountId: string }) => void;
  className?: string;
}

export default function ConnectWallet({ onConnect, className = '' }: ConnectWalletProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const connectWallet = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      // Check if Plug wallet is available
      if (!(window as any).ic?.plug) {
        setError('Plug wallet not found. Please install Plug wallet extension.');
        setIsConnecting(false);
        return;
      }

      // Request connection to Plug
      await (window as any).ic.plug.requestConnect({
        whitelist: [process.env.NEXT_PUBLIC_ESCROW_CANISTER_ID!],
        host: process.env.NEXT_PUBLIC_IC_HOST || 'https://icp0.io',
      });

      // Get principal
      const principal = await (window as any).ic.plug.getPrincipal();
      const principalString = principal.toString();

      // Get account ID
      const accountId = await (window as any).ic.plug.getAccountId();

      // Save to backend
      const response = await fetch('/api/user/wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          principal: principalString,
          accountId: accountId,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to save wallet information');
      }

      setIsConnected(true);

      // Call onConnect callback if provided
      if (onConnect) {
        onConnect({
          principal: principalString,
          accountId: accountId,
        });
      }

    } catch (err: any) {
      console.error('Wallet connection error:', err);
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = async () => {
    try {
      await (window as any).ic.plug.disconnect();
      setIsConnected(false);
      setError(null);
    } catch (err) {
      console.error('Wallet disconnect error:', err);
    }
  };

  if (isConnected) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="flex items-center gap-2 text-green-600">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm font-medium">Wallet Connected</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={disconnectWallet}
          className="text-xs"
        >
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-start gap-2 ${className}`}>
      <Button
        onClick={connectWallet}
        disabled={isConnecting}
        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
      >
        {isConnecting ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            Connecting...
          </>
        ) : (
          <>
            🔌 Connect Plug Wallet
          </>
        )}
      </Button>

      {error && (
        <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded px-3 py-2 w-full">
          {error}
        </div>
      )}

      <div className="text-xs text-gray-500">
        Connect your Plug wallet to enable escrow payments and receive funds securely.
      </div>
    </div>
  );
}

