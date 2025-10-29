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
  CreditCard,
  Wallet,
  Bitcoin,
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

export default function PaymentPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { profile } = useUserContext();
  const [service, setService] = useState<Service | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [selectedUpsells, setSelectedUpsells] = useState<UpsellItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentStep, setPaymentStep] = useState<'details' | 'processing' | 'success'>('details');
  const [paymentMethod, setPaymentMethod] = useState<'credit-card' | 'bitpay' | 'icp'>('credit-card');
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState<{ discount: number; code: string } | null>(null);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [bookingError, setBookingError] = useState<string | null>(null);

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

          // Find and select the specified package
          if (data.data.packages) {
            let pkg: Package | null = null;

            if (packageId) {
              pkg = data.data.packages.find((p: Package) => p.package_id === packageId);
            } else if (packageTier) {
              pkg = data.data.packages.find((p: Package) => p.tier.toLowerCase() === packageTier.toLowerCase());
            } else {
              // Default to first package
              pkg = data.data.packages[0];
            }

            setSelectedPackage(pkg);
          }
        } else {
          console.error('Failed to fetch service:', data.error);
          setBookingError(data.error);
        }
      } catch (error) {
        console.error('Error fetching service:', error);
        setBookingError('Failed to load service details');
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [id, packageId, packageTier]);

  // Available upsell items
  const availableUpsells: UpsellItem[] = [
    {
      id: 'express-delivery',
      name: 'Express Delivery',
      description: 'Get your service delivered in half the time',
      price: 25,
      duration: '50% faster',
      category: 'delivery',
      popular: true
    },
    {
      id: 'extra-revisions',
      name: 'Extra Revisions',
      description: 'Add 3 more revision rounds to ensure perfection',
      price: 35,
      category: 'revisions'
    },
    {
      id: 'priority-support',
      name: 'Priority Support',
      description: '24/7 direct chat support with freelancer',
      price: 50,
      duration: '24/7 access',
      category: 'support'
    },
    {
      id: 'commercial-license',
      name: 'Commercial License',
      description: 'Full commercial usage rights for the deliverable',
      price: 100,
      category: 'features'
    },
    {
      id: 'source-files',
      name: 'Source Files',
      description: 'Get all original source files and working documents',
      price: 75,
      category: 'features'
    },
    {
      id: 'extended-support',
      name: 'Extended Support (30 days)',
      description: 'Get 30 days of post-delivery support and updates',
      price: 40,
      duration: '30 days',
      category: 'support'
    }
  ];

  const handleUpsellToggle = (upsell: UpsellItem) => {
    setSelectedUpsells(prev => {
      const exists = prev.find(item => item.id === upsell.id);
      if (exists) {
        return prev.filter(item => item.id !== upsell.id);
      } else {
        return [...prev, upsell];
      }
    });
  };

  const calculateTotal = () => {
    if (!selectedPackage) return 0;

    const basePrice = selectedPackage.price_e8s / 100000000; // Convert from e8s to ICP
    const upsellTotal = selectedUpsells.reduce((sum, upsell) => sum + upsell.price, 0);
    const subtotal = basePrice + upsellTotal;

    // Apply promo code discount
    if (promoApplied) {
      return subtotal * (1 - promoApplied.discount / 100);
    }

    return subtotal;
  };

  const applyPromoCode = () => {
    if (!promoCode.trim()) return;

    // Mock promo codes for demonstration
    const promoCodes: Record<string, number> = {
      'WELCOME10': 10,
      'SAVE20': 20,
      'FLASH30': 30,
      'FIRST15': 15
    };

    const discount = promoCodes[promoCode.toUpperCase()];
    if (discount) {
      setPromoApplied({ discount, code: promoCode.toUpperCase() });
    } else {
      alert('Invalid promo code');
    }
  };

  // Timeout utility for API calls
  const fetchWithTimeout = async (url: string, options: RequestInit, timeoutMs: number = 60000) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timed out. Please check your connection and try again.');
      }
      throw error;
    }
  };

  const handlePayment = async () => {
    if (!selectedPackage || !service) {
      setBookingError('Please select a package');
      return;
    }

    setPaymentStep('processing');
    setBookingError(null);

    try {
      // Step 1: Create payment session with timeout
      const paymentResponse = await fetchWithTimeout('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: selectedPackage.package_id,
          clientId: profile.email,
          paymentMethod,
          totalAmount: calculateTotal(),
          upsells: selectedUpsells.map(u => ({
            id: u.id,
            name: u.name,
            price: u.price
          })),
          promoCode: promoApplied?.code,
          specialInstructions,
          serviceData: {
            serviceId: service?.service_id,
            freelancerEmail: service?.freelancer_email,
            title: service?.title,
            mainCategory: (service as any)?.main_category,
            subCategory: (service as any)?.sub_category,
            description: service?.description,
            whatsIncluded: (service as any)?.whats_included
          },
          packageData: {
            title: selectedPackage.title,
            description: selectedPackage.description,
            deliveryDays: selectedPackage.delivery_days,
            deliveryTimeline: (selectedPackage as any).delivery_timeline,
            revisionsIncluded: selectedPackage.revisions_included,
            features: selectedPackage.features
          }
        })
      });

      const paymentData = await paymentResponse.json();

      if (!paymentData.success) {
        throw new Error(paymentData.error || 'Failed to create payment session');
      }

      // Step 2: Process payment based on method
      let paymentConfirmed = false;
      let transactionId = null;

      switch (paymentMethod) {
        case 'credit-card':
          // Simulate credit card processing
          await new Promise(resolve => setTimeout(resolve, 2000));
          paymentConfirmed = true;
          transactionId = `txn_${Date.now()}`;
          break;

        case 'bitpay':
          // In real implementation, redirect to BitPay
          await new Promise(resolve => setTimeout(resolve, 3000));
          paymentConfirmed = true;
          transactionId = `btc_${Date.now()}`;
          break;

        case 'icp':
          // Simulate ICP wallet payment
          await new Promise(resolve => setTimeout(resolve, 1500));
          paymentConfirmed = true;
          transactionId = `icp_${Date.now()}`;
          break;
      }

      if (!paymentConfirmed) {
        throw new Error('Payment was not confirmed');
      }

      // Step 3: Confirm payment and create booking with timeout
      const confirmationResponse = await fetchWithTimeout('/api/payment/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId: paymentData.data.paymentId,
          paymentMethod,
          transactionId,
          paymentStatus: 'succeeded',
          amount: calculateTotal(),
          currency: 'USD'
        })
      });

      const confirmationData = await confirmationResponse.json();

      if (!confirmationData.success) {
        throw new Error(confirmationData.error || 'Payment confirmation failed');
      }

      // Success! Show success page with booking details
      setTimeout(() => {
        setPaymentStep('success');
      }, 1000);

    } catch (error) {
      console.error('Payment error:', error);
      setBookingError(error instanceof Error ? error.message : 'Payment failed');
      setPaymentStep('details');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!service || !selectedPackage) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Service Not Found</h2>
          <p className="text-gray-600 mb-4">The service you're trying to book doesn't exist.</p>
          <Link href="/client/browse-services" className="text-purple-600 hover:text-purple-700">
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
      bookingConfirmedAt: currentTime
    };

    return (
      <PaymentSuccess
        serviceTitle={service.title}
        freelancerEmail={service.freelancer_email}
        bookingId={`BK_${Date.now()}`}
        totalAmount={calculateTotal()}
        bookingData={bookingData}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href={`/client/service/${id}`} className="flex items-center text-gray-600 hover:text-gray-900">
              <ChevronLeft size={20} />
              <span>Back to Service</span>
            </Link>

            <div className="flex items-center space-x-2">
              <Shield className="text-green-600" size={20} />
              <span className="text-sm text-gray-600">Secure Payment</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Service Summary */}
            <ServiceSummary
              service={service}
              selectedPackage={selectedPackage}
              specialInstructions={specialInstructions}
              onInstructionsChange={setSpecialInstructions}
            />

            {/* Upsell Section */}
            <UpsellSection
              upsells={availableUpsells}
              selectedUpsells={selectedUpsells}
              onToggle={handleUpsellToggle}
            />

            {/* Payment Method Selection */}
            <PaymentMethodSelector
              selectedMethod={paymentMethod}
              onMethodChange={setPaymentMethod}
            />

            {/* Promo Code */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-medium mb-4">Promo Code</h3>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Enter promo code"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <button
                  onClick={applyPromoCode}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Apply
                </button>
              </div>
              {promoApplied && (
                <div className="mt-2 text-sm text-green-600">
                  Promo code {promoApplied.code} applied! {promoApplied.discount}% discount
                </div>
              )}
            </div>

            {/* Trust Badges */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-medium mb-4">Why Trust Us?</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3">
                  <Shield className="text-green-600" size={24} />
                  <div>
                    <div className="font-medium">Payment Protection</div>
                    <div className="text-sm text-gray-600">Your money is safe</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <RefreshCw className="text-blue-600" size={24} />
                  <div>
                    <div className="font-medium">Quality Guarantee</div>
                    <div className="text-sm text-gray-600">Satisfaction guaranteed</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Headphones className="text-purple-600" size={24} />
                  <div>
                    <div className="font-medium">24/7 Support</div>
                    <div className="text-sm text-gray-600">Always here to help</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <OrderSummary
              service={service}
              selectedPackage={selectedPackage}
              selectedUpsells={selectedUpsells}
              promoApplied={promoApplied}
              totalAmount={calculateTotal()}
              onPayment={handlePayment}
              bookingError={bookingError}
            />
          </div>
        </div>
      </div>
    </div>
  );
}