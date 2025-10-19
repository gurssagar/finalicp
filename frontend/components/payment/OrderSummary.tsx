'use client'
import React from 'react';
import { Shield, AlertCircle, CreditCard, Bitcoin, Wallet } from 'lucide-react';

interface Service {
  service_id: string;
  title: string;
  freelancer_email: string;
}

interface Package {
  package_id: string;
  tier: string;
  title: string;
  price_e8s: number;
  delivery_days: number;
}

interface UpsellItem {
  id: string;
  name: string;
  price: number;
}

interface PromoApplied {
  discount: number;
  code: string;
}

interface OrderSummaryProps {
  service: Service;
  selectedPackage: Package;
  selectedUpsells: UpsellItem[];
  promoApplied: PromoApplied | null;
  totalAmount: number;
  onPayment: () => void;
  bookingError: string | null;
}

export function OrderSummary({
  service,
  selectedPackage,
  selectedUpsells,
  promoApplied,
  totalAmount,
  onPayment,
  bookingError
}: OrderSummaryProps) {
  const basePrice = selectedPackage.price_e8s / 100000000; // Convert from e8s to ICP
  const upsellTotal = selectedUpsells.reduce((sum, upsell) => sum + upsell.price, 0);
  const subtotal = basePrice + upsellTotal;
  const platformFee = subtotal * 0.05; // 5% platform fee
  const discountAmount = promoApplied ? subtotal * (promoApplied.discount / 100) : 0;
  const finalTotal = subtotal + platformFee - discountAmount;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-6">
      <h3 className="font-medium mb-4">Order Summary</h3>

      {/* Service and Package */}
      <div className="space-y-3 mb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="font-medium text-gray-900 text-sm">{service.title}</h4>
            <p className="text-xs text-gray-600">{selectedPackage.tier} Package</p>
            <p className="text-xs text-gray-500">{selectedPackage.delivery_days} days delivery</p>
          </div>
          <div className="text-right">
            <div className="font-medium">${basePrice.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Selected Upsells */}
      {selectedUpsells.length > 0 && (
        <div className="border-t border-gray-200 pt-3 mb-4">
          <h5 className="text-sm font-medium text-gray-900 mb-2">Enhancements</h5>
          <div className="space-y-2">
            {selectedUpsells.map((upsell) => (
              <div key={upsell.id} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{upsell.name}</span>
                <span className="font-medium">${upsell.price.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pricing Breakdown */}
      <div className="border-t border-gray-200 pt-3 mb-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-1">
              <span className="text-gray-600">Platform Fee</span>
              <div className="group relative">
                <div className="w-3 h-3 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-xs text-gray-600">?</span>
                </div>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  5% platform fee for secure payment processing and support
                </div>
              </div>
            </div>
            <span>${platformFee.toFixed(2)}</span>
          </div>

          {promoApplied && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-1">
                <span className="text-green-600">Discount ({promoApplied.code})</span>
                <span className="text-green-600">-{promoApplied.discount}%</span>
              </div>
              <span className="text-green-600 font-medium">-${discountAmount.toFixed(2)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Total */}
      <div className="border-t border-gray-200 pt-3 mb-6">
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">Total</span>
          <div className="text-right">
            <div className="text-lg font-bold text-gray-900">${finalTotal.toFixed(2)}</div>
            <div className="text-xs text-gray-600">≈ {(finalTotal * 4.5).toFixed(2)} ICP</div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {bookingError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertCircle size={16} className="text-red-600 mt-0.5" />
            <p className="text-sm text-red-700">{bookingError}</p>
          </div>
        </div>
      )}

      {/* Payment Button */}
      <button
        onClick={onPayment}
        className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center justify-center space-x-2"
      >
        <CreditCard size={20} />
        <span>Complete Payment ${finalTotal.toFixed(2)}</span>
      </button>

      {/* Payment Security */}
      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-start space-x-2">
          <Shield size={16} className="text-green-600 mt-0.5" />
          <div className="text-xs text-green-700">
            <div className="font-medium mb-1">Secure Payment Protection</div>
            <ul className="space-y-0.5">
              <li>• Payment held in escrow until service completion</li>
              <li>• Full refund if service isn't delivered</li>
              <li>• SSL encryption and secure processing</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Accepted Payment Methods */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-600 mb-2">Accepted payment methods:</div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1">
            <CreditCard size={16} className="text-gray-400" />
            <span className="text-xs text-gray-600">Card</span>
          </div>
          <div className="flex items-center space-x-1">
            <Bitcoin size={16} className="text-gray-400" />
            <span className="text-xs text-gray-600">Crypto</span>
          </div>
          <div className="flex items-center space-x-1">
            <Wallet size={16} className="text-gray-400" />
            <span className="text-xs text-gray-600">ICP</span>
          </div>
        </div>
      </div>

      {/* Terms and Conditions */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          By completing this payment, you agree to our{' '}
          <a href="#" className="text-purple-600 hover:text-purple-700">Terms of Service</a> and{' '}
          <a href="#" className="text-purple-600 hover:text-purple-700">Refund Policy</a>.
          The freelancer will be notified and can start working on your service immediately after payment confirmation.
        </div>
      </div>
    </div>
  );
}