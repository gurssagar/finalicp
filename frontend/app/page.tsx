import Link from 'next/link';
import { getCurrentSession } from '@/lib/actions/auth';
import { redirect } from 'next/navigation';

export default async function Home() {
  const session = await getCurrentSession();
  
  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to Our Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            A comprehensive user management system with authentication, profile management, 
            and secure file uploads powered by Next.js and Internet Computer.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold border border-indigo-600 hover:bg-indigo-50 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
        
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">Secure Authentication</h3>
            <p className="text-gray-600">
              JWT-based sessions, OTP email verification, and secure password reset functionality.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">Profile Management</h3>
            <p className="text-gray-600">
              Complete CRUD operations for user profiles with experience and education tracking.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">File Uploads</h3>
            <p className="text-gray-600">
              Secure profile image and resume uploads with AWS S3 integration.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
