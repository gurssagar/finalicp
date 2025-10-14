'use client'
import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
export default function Hackathons() {
  const [selectedCategory, setSelectedCategory] = useState('Open Registration');
  const categories = ['All Events', 'Open Registration', 'Upcoming', 'Ongoing', 'Completed'];
  const hackathons = [{
    id: 1,
    title: 'Web3 Security Challenge',
    organizer: 'Security First',
    description: 'Focus on building secure, auditable smart contracts and identifying vulnerabilities in existing protocols. Help make Web3 safer for everyone.',
    prizePool: '$75,000',
    timeline: '537 days',
    registrationCloses: '3 days',
    participants: 'Register Now',
    tags: ['Smart', 'Contracts'],
    mode: 'Virtual',
    registrationOpen: true
  }, {
    id: 2,
    title: 'Web3 Security Challenge',
    organizer: 'Security First',
    description: 'Focus on building secure, auditable smart contracts and identifying vulnerabilities in existing protocols. Help make Web3 safer for everyone.',
    prizePool: '$75,000',
    timeline: '537 days',
    registrationCloses: '3 days',
    participants: 'Register Now',
    tags: ['Smart', 'Contracts'],
    mode: 'Virtual',
    registrationOpen: true
  }, {
    id: 3,
    title: 'Web3 Security Challenge',
    organizer: 'Security First',
    description: 'Focus on building secure, auditable smart contracts and identifying vulnerabilities in existing protocols. Help make Web3 safer for everyone.',
    prizePool: '$75,000',
    timeline: '537 days',
    registrationCloses: '3 days',
    participants: 'Register Now',
    tags: ['Smart', 'Contracts'],
    mode: 'Virtual',
    registrationOpen: true
  }, {
    id: 4,
    title: 'Web3 Security Challenge',
    organizer: 'Security First',
    description: 'Focus on building secure, auditable smart contracts and identifying vulnerabilities in existing protocols. Help make Web3 safer for everyone.',
    prizePool: '$75,000',
    timeline: '537 days',
    registrationCloses: '3 days',
    participants: 'Register Now',
    tags: ['Smart', 'Contracts'],
    mode: 'Virtual',
    registrationOpen: true
  }];
  return <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-1">Hackathons</h1>
            <p className="text-gray-600">
              Join Exciting Hackathons and win prizes
            </p>
          </div>
          {/* Categories */}
          <div className="flex overflow-x-auto pb-2 mb-6 gap-2">
            {categories.map(category => <button key={category} onClick={() => setSelectedCategory(category)} className={`px-4 py-2 rounded-full whitespace-nowrap ${selectedCategory === category ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                {category}
              </button>)}
          </div>
          {/* Hackathon Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {hackathons.map(hackathon => <div key={hackathon.id} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold mb-1">
                        {hackathon.title}
                      </h3>
                      <p className="text-sm text-gray-700 mb-1">
                        {hackathon.organizer}
                      </p>
                    </div>
                    {hackathon.registrationOpen && <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                        REGISTRATION OPEN
                      </span>}
                  </div>
                  <div className="flex mb-2">
                    <span className="text-xs text-gray-500">
                      Mode: {hackathon.mode}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {hackathon.tags.map((tag, index) => <span key={index} className={`px-3 py-1 text-sm rounded-md ${index % 2 === 0 ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>
                        {tag}
                      </span>)}
                  </div>
                  <p className="text-sm text-gray-600 mb-6">
                    {hackathon.description}
                  </p>
                  <div className="grid grid-cols-2 gap-y-2 text-sm mb-6">
                    <div className="text-gray-500">Prize Pool</div>
                    <div className="text-right text-green-600">
                      {hackathon.prizePool}
                    </div>
                    <div className="text-gray-500">Timeline</div>
                    <div className="text-right">{hackathon.timeline}</div>
                    <div className="text-gray-500">Registration closes in</div>
                    <div className="text-right">
                      {hackathon.registrationCloses}
                    </div>
                    <div className="text-gray-500">Participants</div>
                    <div className="text-right">{hackathon.participants}</div>
                  </div>
                  <Link href="/hackathon-registration" className="block w-full">
                    <button className="w-full py-2 text-purple-500 rounded-md font-medium hover:bg-purple-50 transition-colors border border-purple-200">
                      Register Now
                    </button>
                  </Link>
                </div>
              </div>)}
          </div>
          {/* Filters */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Job Type</h3>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm">Clear</span>
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded text-blue-500 focus:ring-blue-500" />
                  <span>Full-time</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded text-blue-500 focus:ring-blue-500" />
                  <span>Part-time</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded text-blue-500 focus:ring-blue-500" />
                  <span>Internship</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded text-blue-500 focus:ring-blue-500" />
                  <span>Contract / Freelance</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded text-blue-500 focus:ring-blue-500" />
                  <span>Co-founder</span>
                </label>
              </div>
            </div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Job Roles</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded text-blue-500 focus:ring-blue-500" checked />
                  <span>Programming</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded text-blue-500 focus:ring-blue-500" />
                  <span>Design</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded text-blue-500 focus:ring-blue-500" />
                  <span>Management / Finance</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded text-blue-500 focus:ring-blue-500" />
                  <span>Customer Support</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded text-blue-500 focus:ring-blue-500" />
                  <span>Sales / Marketing</span>
                </label>
              </div>
            </div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Remote Only</h3>
              <div className="relative inline-block w-12 h-6 bg-gray-200 rounded-full cursor-pointer">
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                <span className="absolute right-1 top-1 text-xs text-gray-500">
                  Off
                </span>
              </div>
            </div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Salary Range</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded text-blue-500 focus:ring-blue-500" />
                  <span>$20K - $50K</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded text-blue-500 focus:ring-blue-500" />
                  <span>$50K - $100K</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded text-blue-500 focus:ring-blue-500" />
                  <span>&gt;$100K</span>
                </label>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Location</h3>
              <div className="relative">
                <select className="w-full p-2 border border-gray-300 rounded-md appearance-none pr-8">
                  <option>Anywhere</option>
                  <option>Remote</option>
                  <option>United States</option>
                  <option>Europe</option>
                  <option>Asia</option>
                </select>
                <ChevronDown size={16} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500" />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>;
}