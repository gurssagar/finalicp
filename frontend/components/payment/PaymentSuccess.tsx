'use client'
import React, { useEffect, useState } from 'react';
import { CheckCircle, MessageCircle, ExternalLink, Calendar, User, Shield } from 'lucide-react';
import Link from 'next/link';

interface PaymentSuccessProps {
  serviceTitle: string;
  freelancerEmail: string;
  bookingId: string;
  totalAmount: number;
}

export function PaymentSuccess({
  serviceTitle,
  freelancerEmail,
  bookingId,
  totalAmount
}: PaymentSuccessProps) {
  const [countdown, setCountdown] = useState(10);
  const [autoRedirect, setAutoRedirect] = useState(true);

  useEffect(() => {
    if (!autoRedirect) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Redirect to chat
          window.location.href = `/client/chat?with=${encodeURIComponent(freelancerEmail)}`;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [autoRedirect, freelancerEmail]);

  const cancelAutoRedirect = () => {
    setAutoRedirect(false);
  };

  const goToChat = () => {
    window.location.href = `/client/chat?with=${encodeURIComponent(freelancerEmail)}`;
  };

  const viewBooking = () => {
    window.location.href = '/client/projects';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-gray-600">
            Your booking has been confirmed and the freelancer has been notified.
          </p>
        </div>

        {/* Booking Details */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-gray-900 mb-3">Booking Details</h3>

          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <span className="text-sm text-gray-600">Service</span>
              <span className="text-sm font-medium text-gray-900 text-right">{serviceTitle}</span>
            </div>

            <div className="flex items-start justify-between">
              <span className="text-sm text-gray-600">Booking ID</span>
              <span className="text-sm font-medium text-gray-900">{bookingId}</span>
            </div>

            <div className="flex items-start justify-between">
              <span className="text-sm text-gray-600">Amount Paid</span>
              <span className="text-sm font-medium text-gray-900">${totalAmount.toFixed(2)}</span>
            </div>

            <div className="flex items-start justify-between">
              <span className="text-sm text-gray-600">Freelancer</span>
              <span className="text-sm font-medium text-gray-900">{freelancerEmail}</span>
            </div>
          </div>
        </div>

        {/* Chat Access */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-3 mb-3">
            <MessageCircle className="text-purple-600" size={20} />
            <h3 className="font-medium text-purple-900">Chat Now Available</h3>
          </div>
          <p className="text-sm text-purple-700 mb-3">
            You can now start chatting with the freelancer to discuss your project details and requirements.
          </p>
          <button
            onClick={goToChat}
            className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center justify-center space-x-2"
          >
            <MessageCircle size={18} />
            <span>Start Chat</span>
          </button>
        </div>

        {/* Auto-redirect Notice */}
        {autoRedirect && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="text-blue-600" size={16} />
                <span className="text-sm text-blue-700">
                  Redirecting to chat in {countdown} seconds...
                </span>
              </div>
              <button
                onClick={cancelAutoRedirect}
                className="text-xs text-blue-600 hover:text-blue-700 underline"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={goToChat}
            className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center justify-center space-x-2"
          >
            <MessageCircle size={18} />
            <span>Go to Chat</span>
          </button>

          <button
            onClick={viewBooking}
            className="w-full py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium flex items-center justify-center space-x-2"
          >
            <ExternalLink size={18} />
            <span>View My Projects</span>
          </button>
        </div>

        {/* Next Steps */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3">What happens next?</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start space-x-2">
              <span className="text-purple-600 mt-0.5">•</span>
              <span>Freelancer will acknowledge your booking and start working</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-purple-600 mt-0.5">•</span>
              <span>You'll receive updates through the chat system</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-purple-600 mt-0.5">•</span>
              <span>Payment is held in escrow until delivery completion</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-purple-600 mt-0.5">•</span>
              <span>You can request revisions if needed</span>
            </li>
          </ul>
        </div>

        {/* Protection Notice */}
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Shield className="text-green-600 mt-1" size={18} />
            <div className="text-sm text-green-700">
              <div className="font-medium mb-1">Purchase Protection</div>
              <p>Your payment is protected until the service is delivered to your satisfaction.</p>
            </div>
          </div>
        </div>

        {/* Contact Support */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 mb-2">
            Need help? <Link href="/support" className="text-purple-600 hover:text-purple-700 underline">Contact Support</Link>
          </p>
          <p className="text-xs text-gray-500">
            You'll also receive a confirmation email at your registered email address.
          </p>
        </div>
      </div>
    </div>
  );
}