import ResetPasswordForm from '@/components/auth/ResetPasswordForm';
import Header from '../../components/auth/Header';
export default function ResetPasswordPage() {
  return  <div className="flex flex-col min-h-screen bg-white">
  <Header />
  <div className="flex-1 flex items-center justify-center py-12">
    <ResetPasswordForm />
  </div>
</div>
}
