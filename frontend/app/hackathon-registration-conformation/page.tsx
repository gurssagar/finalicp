'use client'
import React from 'react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { CheckCircle, ChevronLeft, Calendar, Clock, Users, Download } from 'lucide-react';
import Link from 'next/link';
export default function HackathonRegistrationConfirmation() {
  return <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Header showSearch={false} />
        <main className="flex-1 p-6">
          <div className="max-w-3xl mx-auto">
            <div className="mb-6">
              <Link href="/hackathons" className="flex items-center text-gray-600 hover:text-gray-900">
                <ChevronLeft size={16} className="mr-1" />
                <span>Back to Hackathons</span>
              </Link>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={40} className="text-green-500" />
              </div>
              <h1 className="text-2xl font-bold mb-2">
                Registration Successful!
              </h1>
              <p className="text-gray-600 mb-8">
                You have successfully registered for the Web3 Security Challenge
              </p>
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 text-left mb-8">
                <h2 className="font-bold text-lg mb-4">Hackathon Details</h2>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <Calendar size={20} className="text-blue-500 mt-1 mr-3 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Event Dates</p>
                      <p className="text-gray-600">
                        October 15 - November 15, 2023
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Clock size={20} className="text-blue-500 mt-1 mr-3 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Kickoff Meeting</p>
                      <p className="text-gray-600">
                        October 15, 2023 at 10:00 AM UTC
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Users size={20} className="text-blue-500 mt-1 mr-3 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Team Formation</p>
                      <p className="text-gray-600">
                        Team matching will be available starting October 10
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-center gap-4">
                  <Link href="/hackathon-team-formation" className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 font-medium">
                    Find or Create a Team
                  </Link>
                  <button className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center">
                    <Download size={16} className="mr-2" />
                    <span>Save Details</span>
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  A confirmation email has been sent to your registered email
                  address with additional information.
                </p>
              </div>
            </div>
            <div className="mt-8 bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h2 className="font-bold text-lg mb-4">Next Steps</h2>
              <div className="space-y-4">
                <div className="flex">
                  <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold mr-3 flex-shrink-0">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Join the Discord Community</p>
                    <p className="text-gray-600 text-sm">
                      Connect with other participants and get real-time updates
                    </p>
                  </div>
                </div>
                <div className="flex">
                  <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold mr-3 flex-shrink-0">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Form or Join a Team</p>
                    <p className="text-gray-600 text-sm">
                      Teams of up to 5 people are allowed
                    </p>
                  </div>
                </div>
                <div className="flex">
                  <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold mr-3 flex-shrink-0">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Attend the Kickoff Meeting</p>
                    <p className="text-gray-600 text-sm">
                      Get important information and ask questions
                    </p>
                  </div>
                </div>
                <div className="flex">
                  <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold mr-3 flex-shrink-0">
                    4
                  </div>
                  <div>
                    <p className="font-medium">Start Building!</p>
                    <p className="text-gray-600 text-sm">
                      Begin working on your project once the hackathon starts
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>;
}