'use client'
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useUserContext } from '@/contexts/UserContext';
import {
  ChevronLeft,
  Shield,
  Clock,
  Star,
  Check,
  Plus,
  Minus,
  Info,
  Truck,
  RefreshCw,
  Headphones
} from 'lucide-react';
import { PaymentMethodSelector } from '@/components/payment/PaymentMethodSelector';
import { ServiceSummary } from '@/components/payment/ServiceSummary';
import { UpsellSection } from '@/components/payment/UpsellSection';
import { OrderSummary } from '@/components/payment/OrderSummary';
import { PaymentProcessing } from '@/components/payment/PaymentProcessing';
import { PaymentSuccess } from '@/components/payment/PaymentSuccess';
import { createTokenPayment, createUSDPayment, createICPayClient, IcpayError, type SupportedToken, usdToTokenAmount } from '@/lib/icpay-client';
import type { PaymentMode } from '@/components/payment/PaymentModeToggle';

interface Service {
  service_id: string;
  title: string;
  description: string;
  freelancer_email: string;
  freelancer_name: string;
  rating_avg: number;
  total_orders: number;
  cover_image_url: string;
  portfolio_images: string[];
  packages: Package[];
}

interface Package {
  package_id: string;
  tier: string;
  title: string;
  description: string;
  price_e8s: number;
  delivery_days: number;
  features: string[];
  revisions_included: number;
}

interface UpsellItem {
  id: string;
  name: string;
  description: string;
  price: number;
  duration?: string;
  popular?: boolean;
  category: 'delivery' | 'revisions' | 'support' | 'features';
}

interface PaymentResult {
  transactionId: string;
  amount: string;
  symbol: string;
  status: string;
}

export default function PaymentPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { profile } = useUserContext();
  const [service, setService] = useState<Service | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [selectedUpsells, setSelectedUpsells] = useState<UpsellItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentStep, setPaymentStep] = useState<'details' | 'processing' | 'success'>('details');
  const [selectedToken, setSelectedToken] = useState<SupportedToken>('ICP');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('usd');
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState<{ discount: number; code: string } | null>(null);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [walletConnected, setWalletConnected] = useState(false);
  const [connectedWallet, setConnectedWallet] = useState<{ principal: string; accountId?: string } | null>(null);
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);

  // Parse URL parameters
  const [packageId, setPackageId] = useState<string>('');
  const [packageTier, setPackageTier] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      setPackageId(urlParams.get('packageId') || '');
      setPackageTier(urlParams.get('tier') || '');
      setSpecialInstructions(urlParams.get('instructions') || '');
    }
  }, []);

  // Fetch service data
  useEffect(() => {
    const fetchService = async () => {
      if (!id) return;

      try {
        const response = await fetch(`/api/marketplace/services/${id}`);
        const data = await response.json();

        if (data.success) {
          setService(data.data);
          
          if (data.data.packages && packageId) {
            const pkg = data.data.packages.find((p: Package) => p.package_id === packageId);
            setSelectedPackage(pkg || data.data.packages[0]);
          } else if (data.data.packages && packageTier) {
            const pkg = data.data.packages.find((p: Package) => p.tier.toLowerCase() === packageTier.toLowerCase());
            setSelectedPackage(pkg || data.data.packages[0]);
          } else if (data.data.packages) {
            setSelectedPackage(data.data.packages[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching service:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [id, packageId, packageTier]);

  // Setup ICPay event listeners
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const icpay = createICPayClient();

    const handleTransactionCompleted = (event: any) => {
      console.log('Transaction completed:', event);
    };

    const handleTransactionFailed = (event: any) => {
      console.error('Transaction failed:', event);
      setBookingError('Payment transaction failed. Please try again.');
      setPaymentStep('details');
    };

    const handleTransactionMismatched = (event: any) => {
      console.error('Transaction amount mismatch:', event);
      setBookingError(`Payment amount mismatch. Requested: ${event.requestedAmount}, Paid: ${event.paidAmount}`);
      setPaymentStep('details');
    };

    const handleError = (event: any) => {
      console.error('ICPay error:', event);
      if (event.userAction) {
        setBookingError(`${event.message}. ${event.userAction}`);
      } else {
        setBookingError(event.message || 'An error occurred during payment');
      }
    };

    icpay.on('icpay-sdk-transaction-completed', handleTransactionCompleted);
    icpay.on('icpay-sdk-transaction-failed', handleTransactionFailed);
    icpay.on('icpay-sdk-transaction-mismatched', handleTransactionMismatched);
    icpay.on('icpay-sdk-error', handleError);

    return () => {
      // Cleanup event listeners
      icpay.removeEventListener?.('icpay-sdk-transaction-completed', handleTransactionCompleted);
      icpay.removeEventListener?.('icpay-sdk-transaction-failed', handleTransactionFailed);
      icpay.removeEventListener?.('icpay-sdk-transaction-mismatched', handleTransactionMismatched);
      icpay.removeEventListener?.('icpay-sdk-error', handleError);
    };
  }, []);

  const calculateTotal = (): number => {
    if (!selectedPackage) return 0;
    const packagePrice = selectedPackage.price_e8s / 100000000; // Convert from e8s
    const upsellsTotal = selectedUpsells.reduce((sum, item) => sum + item.price, 0);
    const subtotal = packagePrice + upsellsTotal;
    const discount = promoApplied ? subtotal * (promoApplied.discount / 100) : 0;
    return subtotal - discount;
  };

  const handleWalletConnect = (wallet: { principal: string; accountId?: string }) => {
    setConnectedWallet(wallet);
    setWalletConnected(true);
    setBookingError(null);
  };

  const handleWalletDisconnect = () => {
    setConnectedWallet(null);
    setWalletConnected(false);
  };

  const handlePayment = async () => {
    if (!selectedPackage || !service) {
      setBookingError('Please select a package');
      return;
    }

    if (!walletConnected || !connectedWallet) {
      setBookingError('Please connect your wallet to continue');
      return;
    }

    setPaymentStep('processing');
    setBookingError(null);

    try {
      const totalUSD = calculateTotal();
      const metadata = {
        serviceId: service.service_id,
        packageId: selectedPackage.package_id,
        clientId: profile.email,
        freelancerEmail: service.freelancer_email,
        specialInstructions,
        upsells: selectedUpsells.map(u => ({
          id: u.id,
          name: u.name,
          price: u.price
        })),
        promoCode: promoApplied?.code,
      };

      let transaction: any;

      // Create payment based on selected mode
      if (paymentMode === 'usd') {
        transaction = await createUSDPayment({
          symbol: selectedToken,
          usdAmount: totalUSD,
          metadata,
          connectedWallet: { owner: connectedWallet.principal },
        });
      } else {
        // For token mode, calculate the amount based on current price
        const tokenDecimals = selectedToken === 'ICP' ? 8 : selectedToken === 'ckUSDC' ? 6 : selectedToken === 'ckBTC' ? 8 : 18;
        // This would need the current token price - for now using a placeholder
        const tokenAmount = usdToTokenAmount(totalUSD, 10, tokenDecimals); // Replace 10 with actual price
        
        transaction = await createTokenPayment({
          symbol: selectedToken,
          amount: tokenAmount,
          metadata,
          connectedWallet: { owner: connectedWallet.principal },
        });
      }

      // Store payment result
      const result: PaymentResult = {
        transactionId: transaction.transactionId || transaction.id,
        amount: transaction.amount || '',
        symbol: selectedToken,
        status: transaction.status || 'completed',
      };
      setPaymentResult(result);

      // Confirm payment and create booking
      const confirmationResponse = await fetch('/api/payment/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId: result.transactionId,
          amount: totalUSD,
          currency: 'USD',
          tokenSymbol: selectedToken,
          tokenAmount: result.amount,
          paymentStatus: 'succeeded',
          serviceId: service.service_id,
          packageId: selectedPackage.package_id,
          clientId: profile.email,
          freelancerEmail: service.freelancer_email,
          metadata,
        })
      });

      const confirmationData = await confirmationResponse.json();

      if (!confirmationData.success) {
        throw new Error(confirmationData.error || 'Payment confirmation failed');
      }

      // Success! Show success page
      setTimeout(() => {
        setPaymentStep('success');
      }, 1000);

    } catch (error) {
      console.error('Payment error:', error);
      
      if (error instanceof IcpayError) {
        const errorMessage = error.userAction 
          ? `${error.message}. ${error.userAction}`
          : error.message;
        setBookingError(errorMessage);
      } else {
        setBookingError(error instanceof Error ? error.message : 'Payment failed');
      }
      
      setPaymentStep('details');
    }
  };

  const applyPromoCode = () => {
    if (promoCode.toLowerCase() === 'save10') {
      setPromoApplied({ discount: 10, code: promoCode });
    } else if (promoCode.toLowerCase() === 'welcome20') {
      setPromoApplied({ discount: 20, code: promoCode });
    } else {
      alert('Invalid promo code');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-purple-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!service || !selectedPackage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Service Not Found</h2>
          <p className="text-gray-600 mb-4">The service you're trying to book doesn't exist.</p>
          <Link href="/client/browse-services" className="text-purple-600 hover:text-purple-700 font-medium">
            Browse Services
          </Link>
        </div>
      </div>
    );
  }

  if (paymentStep === 'processing') {
    return <PaymentProcessing />;
  }

  if (paymentStep === 'success') {
    const currentTime = Date.now();
    const bookingData = {
      createdAt: currentTime,
      deliveryDeadline: currentTime + (selectedPackage.delivery_days * 24 * 60 * 60 * 1000),
      deliveryDays: selectedPackage.delivery_days,
      paymentCompletedAt: currentTime,
      bookingConfirmedAt: currentTime,
      transactionId: paymentResult?.transactionId,
      tokenSymbol: paymentResult?.symbol,
      tokenAmount: paymentResult?.amount,
    };

    return <PaymentSuccess bookingData={bookingData} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          href={`/client/service/${id}`}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ChevronLeft size={20} />
          <span className="ml-1">Back to Service</span>
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Booking</h1>
          <p className="text-gray-600">Review your order and pay securely with ICPay</p>
        </div>

        {/* Error Message */}
        {bookingError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <Info className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <div className="flex-1">
                <h4 className="font-medium text-red-900">Payment Error</h4>
                <p className="text-sm text-red-700 mt-1">{bookingError}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Payment Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Service Summary */}
            <ServiceSummary
              service={service}
              selectedPackage={selectedPackage}
            />

            {/* Upsells */}
            <UpsellSection
              selectedUpsells={selectedUpsells}
              onUpsellsChange={setSelectedUpsells}
            />

            {/* Special Instructions */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-medium mb-3">Special Instructions (Optional)</h3>
              <textarea
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="Any specific requirements or preferences for your project?"
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Payment Method */}
            <PaymentMethodSelector
              selectedToken={selectedToken}
              onTokenChange={setSelectedToken}
              paymentMode={paymentMode}
              onPaymentModeChange={setPaymentMode}
              usdAmount={calculateTotal()}
              onWalletConnect={handleWalletConnect}
              onWalletDisconnect={handleWalletDisconnect}
            />
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <OrderSummary
                packagePrice={selectedPackage.price_e8s / 100000000}
                upsells={selectedUpsells}
                promoApplied={promoApplied}
                total={calculateTotal()}
              />

              {/* Promo Code */}
              <div className="mt-4 bg-white rounded-lg border border-gray-200 p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Promo Code
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter code"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <button
                    onClick={applyPromoCode}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>

              {/* Pay Button */}
              <button
                onClick={handlePayment}
                disabled={!walletConnected}
                className="w-full mt-6 px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/30"
              >
                {walletConnected ? `Pay $${calculateTotal().toFixed(2)}` : 'Connect Wallet to Pay'}
              </button>

              {/* Trust Badges */}
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className="text-green-600" size={20} />
                  <span className="font-medium text-green-900">Secure Payment</span>
                </div>
                <p className="text-sm text-green-700">
                  Your payment is protected by ICPay escrow until project completion
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
