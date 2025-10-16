'use client'
import React, { useState } from 'react';
import { Header1 } from '@/components/Header1';
import { Sidebar } from '@/components/Sidebar';
import { Check, ChevronDown } from 'lucide-react';
export default function BrowseProjects() {
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const categories = ['All Categories', 'ICP Development', 'Web Development', 'Blockchain', 'Design', 'AI/ML'];
  const projects = [{
    id: 1,
    title: 'ICP Dapp Frontend Development',
    category: 'ICP Development',
    description: "Great entry point into Web3 dev. It's all about plugging into an existing canister and building clean UI. Less competition too.",
    timeline: '3-4 weeks',
    level: '$75K - $100K',
    proposals: 5,
    experience: 'Engineering Manager Developer Experience',
    tags: ['TypeScript', 'DFINITY', 'ICP'],
    designTag: true
  }, {
    id: 2,
    title: 'ICP Dapp Frontend Development',
    category: 'ICP Development',
    description: "Great entry point into Web3 dev. It's all about plugging into an existing canister and building clean UI. Less competition too.",
    timeline: '3-4 weeks',
    level: '$75K - $100K',
    proposals: 5,
    experience: 'Engineering Manager Developer Experience',
    tags: ['TypeScript', 'DFINITY', 'ICP'],
    designTag: true
  }, {
    id: 3,
    title: 'ICP Dapp Frontend Development',
    category: 'ICP Development',
    description: "Great entry point into Web3 dev. It's all about plugging into an existing canister and building clean UI. Less competition too.",
    timeline: '3-4 weeks',
    level: '$75K - $100K',
    proposals: 5,
    experience: 'Engineering Manager Developer Experience',
    tags: ['TypeScript', 'DFINITY', 'ICP'],
    designTag: true
  }, {
    id: 4,
    title: 'ICP Dapp Frontend Development',
    category: 'ICP Development',
    description: "Great entry point into Web3 dev. It's all about plugging into an existing canister and building clean UI. Less competition too.",
    timeline: '3-4 weeks',
    level: '$75K - $100K',
    proposals: 5,
    experience: 'Engineering Manager Developer Experience',
    tags: ['TypeScript', 'DFINITY', 'ICP'],
    designTag: true
  }];
  return <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
     
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
       
        <main className="flex-1 p-6">
          <div className="flex flex-col md:flex-row justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold mb-1">Browse Projects</h1>
              <p className="text-gray-600">
                Join Exciting Hackathons and win prizes
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded-md">
                Available
              </div>
            </div>
          </div>
          {/* Categories */}
          <div className="flex overflow-x-auto pb-2 mb-6 gap-2">
            {categories.map(category => <button key={category} onClick={() => setSelectedCategory(category)} className={`px-4 py-2 rounded-full whitespace-nowrap ${selectedCategory === category ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                {category}
              </button>)}
          </div>
          {/* Project Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {projects.map(project => <div key={project.id} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold mb-1">
                        {project.title}
                      </h3>
                      <p className="text-sm text-gray-700 mb-1">
                        {project.experience}
                      </p>
                    </div>
                    {project.designTag && <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                        Design
                      </span>}
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tags.map((tag, index) => <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-md">
                        {tag}
                      </span>)}
                  </div>
                  <p className="text-sm text-gray-600 mb-6">
                    {project.description}
                  </p>
                  <div className="grid grid-cols-2 gap-y-2 text-sm mb-6">
                    <div className="text-gray-500">Category</div>
                    <div className="text-right">{project.category}</div>
                    <div className="text-gray-500">Timeline</div>
                    <div className="text-right">{project.timeline}</div>
                    <div className="text-gray-500">Level</div>
                    <div className="text-right text-green-600">
                      {project.level}
                    </div>
                    <div className="text-gray-500">Proposals</div>
                    <div className="text-right">{project.proposals}</div>
                  </div>
                  <button className="w-full py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-md font-medium hover:opacity-90 transition-opacity">
                    Register Now
                  </button>
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