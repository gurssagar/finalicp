'use client'
import React from 'react';
import { useRouter } from 'next/navigation';
export default function JobPostingOverview() {
    const navigate = useRouter();
  const handleGetStarted = () => {
    navigate.push('/client/create-job-post');
  };
  return <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-200 py-4 px-6">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center">
            <svg width="110" height="32" viewBox="0 0 40 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-8">
              <path d="M20.0001 0L0 11.5556V23.1111L20.0001 11.5556L40.0001 23.1111V11.5556L20.0001 0Z" fill="#FF3B30" />
              <path d="M0 23.1111L20.0001 11.5555V23.1111V34.6667L0 23.1111Z" fill="#34C759" />
              <path d="M40.0001 23.1111L20.0001 11.5555V23.1111V34.6667L40.0001 23.1111Z" fill="#007AFF" />
            </svg>
            <span className="ml-2 font-bold text-xl">ICPWork</span>
          </div>
          <button onClick={() => navigate.push('/profile/dashboard')} className="px-8 py-2 rounded-full border border-gray-300 text-gray-800 hover:bg-gray-50">
            Exit
          </button>
        </div>
      </header>
      <div className="flex-1 flex p-6">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="flex flex-col justify-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-6">
              Its easy to post a job on Organaise
            </h1>
            <p className="text-gray-600 mb-8">
              Follow our simple process to post your job and find the perfect
              candidate
            </p>
            <div>
              <button onClick={handleGetStarted} className="px-8 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition-colors">
                Get Started
              </button>
            </div>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 flex items-center justify-center bg-blue-100 rounded-lg">
                    <img src="https://cdn-icons-png.flaticon.com/512/1642/1642611.png" alt="Step 1" className="w-8 h-8" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    1. Tell us about your Job role
                  </h3>
                  <p className="text-gray-600">
                    Unlock the full potential of your freelance career with
                    Organaise.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 flex items-center justify-center bg-green-100 rounded-lg">
                    <img src="https://cdn-icons-png.flaticon.com/512/3721/3721901.png" alt="Step 2" className="w-8 h-8" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    2. Review the job post
                  </h3>
                  <p className="text-gray-600">
                    Unlock the full potential of your freelance career with
                    Organaise.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 flex items-center justify-center bg-yellow-100 rounded-lg">
                    <img src="https://cdn-icons-png.flaticon.com/512/2331/2331941.png" alt="Step 3" className="w-8 h-8" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    3. Pay and confirm
                  </h3>
                  <p className="text-gray-600">
                    Unlock the full potential of your freelance career with
                    Organaise.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 flex items-center justify-center bg-purple-100 rounded-lg">
                    <img src="https://cdn-icons-png.flaticon.com/512/4221/4221836.png" alt="Step 4" className="w-8 h-8" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    4. Post your job
                  </h3>
                  <p className="text-gray-600">
                    Unlock the full potential of your freelance career with
                    Organaise.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>;
}