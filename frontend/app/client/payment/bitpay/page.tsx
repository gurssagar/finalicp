'use client'
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronLeft,
  Bitcoin,
  Clock,
  ExternalLink,
  AlertCircle,
  Copy,
  CheckCircle,
  RefreshCw
} from 'lucide-react';

export default function BitPayPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [paymentData, setPaymentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'expired' | 'completed'>('pending');
  const [timeRemaining, setTimeRemaining] = useState<number>(900); // 15 minutes in seconds
  const [copied, setCopied] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);

  const paymentId = searchParams.get('paymentId');
  const amount = searchParams.get('amount');
  const currency = searchParams.get('currency') || 'USD';

  useEffect(() => {
    if (!paymentId) {
      setError('Payment ID is required');
      setLoading(false);
      return;
    }

    const fetchPaymentData = async () => {
      try {
        // In a real implementation, you would fetch this from your API
        const mockPaymentData = {
          paymentId,
          amount: parseFloat(amount || '100'),
          currency,
          invoiceId: `INV_${Date.now()}`,
          btcAmount: (parseFloat(amount || '100') / 30000).toFixed(8), // Mock BTC conversion
          paymentAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
          expirationTime: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
          paymentUrl: `https://bitpay.com/invoice?id=${paymentId}`,
          status: 'pending'
        };

        setPaymentData(mockPaymentData);
      } catch (err) {
        setError('Failed to load payment details');
        console.error('Error fetching payment data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentData();
  }, [paymentId, amount, currency]);

  // Timer countdown
  useEffect(() => {
    if (paymentStatus !== 'pending' || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setPaymentStatus('expired');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, paymentStatus]);

  // Check payment status periodically
  useEffect(() => {
    if (paymentStatus !== 'pending') return;

    const statusTimer = setInterval(async () => {
      await checkPaymentStatus();
    }, 10000); // Check every 10 seconds

    return () => clearInterval(statusTimer);
  }, [paymentStatus, paymentId]);

  const checkPaymentStatus = async () => {
    if (!paymentId || checkingStatus) return;

    setCheckingStatus(true);
    try {
      // In a real implementation, you would check the status with your API
      const response = await fetch(`/api/payment/bitpay/status?paymentId=${paymentId}`);
      const data = await response.json();

      if (data.success && data.data.status === 'completed') {
        setPaymentStatus('completed');
        setTimeout(() => {
          router.push(`/client/payment/confirm?paymentId=${paymentId}`);
        }, 2000);
      }
    } catch (err) {
      console.error('Error checking payment status:', err);
    } finally {
      setCheckingStatus(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const openBitPay = () => {
    if (paymentData?.paymentUrl) {
      window.open(paymentData.paymentUrl, '_blank');
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={handleBack}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!paymentData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Payment Not Found</h2>
          <p className="text-gray-600 mb-4">We couldn't find your payment details.</p>
          <button
            onClick={handleBack}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'completed') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="mx-auto text-green-500 mb-4" size={48} />
          <h2 className="text-2xl font-bold text-green-900 mb-4">Payment Completed!</h2>
          <p className="text-green-700 mb-6">Redirecting you to the confirmation page...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'expired') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
          <h2 className="text-2xl font-bold text-red-900 mb-4">Payment Expired</h2>
          <p className="text-red-700 mb-6">The payment window has expired. Please try again.</p>
          <button
            onClick={handleBack}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBack}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft size={20} />
              <span>Back to Payment</span>
            </button>

            <div className="flex items-center space-x-2">
              <Bitcoin className="text-orange-600" size={20} />
              <span className="text-sm text-gray-600">BitPay Payment</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Payment Status */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Clock className="text-orange-600" size={24} />
                <div>
                  <h1 className="text-xl font-bold text-orange-900">Payment Pending</h1>
                  <p className="text-orange-700">Please complete your payment</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-orange-900">
                  {formatTime(timeRemaining)}
                </div>
                <div className="text-sm text-orange-700">Time remaining</div>
              </div>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-center">Scan QR Code or Copy Address</h2>

            <div className="flex justify-center mb-6">
              <div className="bg-gray-100 p-4 rounded-lg">
                {/* Mock QR Code - in production, generate actual QR code */}
                <div className="w-48 h-48 bg-white border-2 border-gray-300 flex items-center justify-center">
                  <div className="text-center">
                    <Bitcoin className="mx-auto mb-2 text-orange-600" size={48} />
                    <p className="text-xs text-gray-500">QR Code</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Address */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Address
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={paymentData.paymentAddress}
                  readOnly
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
                />
                <button
                  onClick={() => copyToClipboard(paymentData.paymentAddress)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
                >
                  {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Amount */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount to Pay
              </label>
              <div className="bg-gray-50 px-4 py-3 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  {paymentData.btcAmount} BTC
                </div>
                <div className="text-sm text-gray-500">
                  ≈ ${paymentData.amount.toFixed(2)} {currency}
                </div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="font-medium text-blue-900 mb-3">How to Pay</h3>
            <ol className="space-y-2 text-sm text-blue-800">
              <li>1. Scan the QR code with your Bitcoin wallet app</li>
              <li>2. Or copy the payment address above</li>
              <li>3. Send the exact amount shown</li>
              <li>4. Wait for network confirmation (usually 10-15 minutes)</li>
            </ol>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              onClick={openBitPay}
              className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors"
            >
              <ExternalLink size={20} />
              <span>Open in BitPay</span>
            </button>

            <button
              onClick={checkPaymentStatus}
              disabled={checkingStatus}
              className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`${checkingStatus ? 'animate-spin' : ''}`} size={20} />
              <span>{checkingStatus ? 'Checking...' : 'Check Payment Status'}</span>
            </button>

            <button
              onClick={handleBack}
              className="w-full px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel Payment
            </button>
          </div>

          {/* Support */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-2">Need help with this payment?</p>
            <Link href="/client/support" className="text-purple-600 hover:text-purple-700 font-medium">
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}