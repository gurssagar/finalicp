import { getCurrentSession } from '@/lib/actions/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { User, Settings, FileText, Upload, LogOut } from 'lucide-react';
import ProfileChecker from '@/components/ProfileChecker';

export default async function DashboardPage() {
  const session = await getCurrentSession();
  
  if (!session) {
    redirect('/login');
  }

  return (
    <ProfileChecker>
      <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {session.email}</span>
              <form action="/api/logout" method="post">
                <button
                  type="submit"
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            href="/profile"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center">
              <User className="h-8 w-8 text-indigo-600" />
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Profile</h3>
                <p className="text-gray-600">Manage your personal information</p>
              </div>
            </div>
          </Link>

          <Link
            href="/profile/experience"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Experience</h3>
                <p className="text-gray-600">Add and manage work experience</p>
              </div>
            </div>
          </Link>

          <Link
            href="/profile/education"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Education</h3>
                <p className="text-gray-600">Manage your education history</p>
              </div>
            </div>
          </Link>

          <Link
            href="/profile/files"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center">
              <Upload className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Files</h3>
                <p className="text-gray-600">Upload profile image and resume</p>
              </div>
            </div>
          </Link>

          <Link
            href="/profile/settings"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center">
              <Settings className="h-8 w-8 text-gray-600" />
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Settings</h3>
                <p className="text-gray-600">Account and security settings</p>
              </div>
            </div>
          </Link>
        </div>

        <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">1</div>
              <div className="text-sm text-gray-600">Profile Complete</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">0</div>
              <div className="text-sm text-gray-600">Experience Entries</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">0</div>
              <div className="text-sm text-gray-600">Education Entries</div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </ProfileChecker>
  );
}
