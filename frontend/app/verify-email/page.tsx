'use client';

import { useSearchParams } from 'next/navigation';
import OTPVerification from '@/components/auth/OTPVerification';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Invalid Verification Link
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Please check your email for the correct verification link.
          </p>
          <div className="mt-6">
            <a 
              href="/signup" 
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Back to signup
            </a>
          </div>
        </div>
      </div>
    );
  }

  return <OTPVerification email={email} />;
}
