import OTPVerificationForm from '@/components/auth1/OTPVerificationForm';
import VerifyCodeForm from '../../components/auth/VerifyCodeForm';
import Header from '../../components/auth/Header';
export default function VerifyOTPPage() {
  return <div className="flex flex-col min-h-screen bg-white">
  <Header />
  <div className="flex-1 flex items-center justify-center py-12">
    <VerifyCodeForm />
  </div>
</div>;
}