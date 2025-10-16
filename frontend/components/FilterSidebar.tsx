import React from 'react'
import { Search, ChevronDown } from 'lucide-react'
export function FilterSidebar() {
  return (
    <div className="w-full lg:w-72 bg-white rounded-lg border border-gray-200 p-5">
      <h2 className="font-semibold text-lg mb-4">Filters</h2>
      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search bounties..."
            className="w-full px-4 py-2 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
          <Search
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
        </div>
      </div>
      {/* Job Type */}
      <div className="mb-6">
        <h3 className="font-medium text-sm mb-3 flex justify-between items-center">
          <span>Job Type</span>
          <span className="text-blue-500 text-xs cursor-pointer">Clear</span>
        </h3>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="form-checkbox h-4 w-4 text-purple-600 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Full-time</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              className="form-checkbox h-4 w-4 text-purple-600 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Part-time</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              className="form-checkbox h-4 w-4 text-purple-600 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Intership</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              className="form-checkbox h-4 w-4 text-purple-600 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">
              Contract / Freelance
            </span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              className="form-checkbox h-4 w-4 text-purple-600 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Co-founder</span>
          </label>
        </div>
      </div>
      {/* Job Roles */}
      <div className="mb-6">
        <h3 className="font-medium text-sm mb-3">Job Roles</h3>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="form-checkbox h-4 w-4 text-purple-600 rounded"
              checked
            />
            <span className="ml-2 text-sm text-gray-700">Programming</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              className="form-checkbox h-4 w-4 text-purple-600 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Design</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              className="form-checkbox h-4 w-4 text-purple-600 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">
              Management / Finance
            </span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              className="form-checkbox h-4 w-4 text-purple-600 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Customer Support</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              className="form-checkbox h-4 w-4 text-purple-600 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">
              Sales / Marketing
            </span>
          </label>
        </div>
      </div>
      {/* Remote Only */}
      <div className="mb-6">
        <h3 className="font-medium text-sm mb-3">Remote Only</h3>
        <div className="flex items-center">
          <div className="relative inline-block w-10 mr-2 align-middle">
            <input
              type="checkbox"
              id="remote-toggle"
              className="opacity-0 absolute h-0 w-0"
            />
            <div className="bg-gray-200 rounded-full h-6 w-11 cursor-pointer flex items-center">
              <div className="bg-white rounded-full h-5 w-5 ml-0.5 shadow-md transform transition-transform duration-200"></div>
            </div>
          </div>
          <label htmlFor="remote-toggle" className="text-sm text-gray-700">
            Off
          </label>
        </div>
      </div>
      {/* Salary Range */}
      <div className="mb-6">
        <h3 className="font-medium text-sm mb-3">Salary Range</h3>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="form-checkbox h-4 w-4 text-purple-600 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">$20K - $50K</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              className="form-checkbox h-4 w-4 text-purple-600 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">$50K - $100K</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              className="form-checkbox h-4 w-4 text-purple-600 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">›$100K</span>
          </label>
        </div>
      </div>
      {/* Location */}
      <div>
        <h3 className="font-medium text-sm mb-3">Location</h3>
        <div className="relative">
          <select className="w-full px-4 py-2 border border-gray-200 rounded-lg appearance-none focus:outline-none focus:ring-1 focus:ring-purple-500">
            <option>Anywhere</option>
            <option>Remote</option>
            <option>United States</option>
            <option>Europe</option>
            <option>Asia</option>
          </select>
          <ChevronDown
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={16}
          />
        </div>
      </div>
    </div>
  )
}
