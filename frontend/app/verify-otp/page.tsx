import { Suspense } from 'react';
import OTPVerificationForm from '@/components/auth1/OTPVerificationForm';
import VerifyCodeForm from '../../components/auth/VerifyCodeForm';
import Header from '../../components/auth/Header';

function VerifyOTPContent() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <div className="flex-1 flex items-center justify-center py-12">
        <VerifyCodeForm />
      </div>
    </div>
  );
}

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <VerifyOTPContent />
    </Suspense>
  );
}