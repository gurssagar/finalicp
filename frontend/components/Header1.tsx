'use client'
import React from 'react';
import { Bell, ChevronDown, Search } from 'lucide-react';
interface HeaderProps {
  showSearch?: boolean;
}
export function Header({
  showSearch = true
}: HeaderProps) {
  return <header className="flex justify-between items-center p-4 border-b border-gray-200 bg-white">
      {showSearch ? <div className="relative flex-1 max-w-xl">
          <div className="relative flex items-center">
            <input type="text" placeholder="Search your industry here..." className="w-full py-2 pl-4 pr-10 rounded-full border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500" />
            <div className="absolute right-3 bg-green-500 rounded-full p-1">
              <Search size={18} className="text-white" />
            </div>
          </div>
        </div> : <div className="flex-1"></div>}
      <div className="flex items-center gap-4 ml-auto">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer">
            <Bell size={20} className="text-gray-600" />
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              1
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 border border-gray-200 rounded-full cursor-pointer">
          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 12H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 2C14.5013 4.73835 15.9228 8.29203 16 12C15.9228 15.708 14.5013 19.2616 12 22C9.49872 19.2616 8.07725 15.708 8 12C8.07725 8.29203 9.49872 4.73835 12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="text-sm">Client</span>
          <ChevronDown size={16} />
        </div>
        <div className="flex items-center gap-2 cursor-pointer">
          <img src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=300&auto=format&fit=crop" alt="Profile" className="w-10 h-10 rounded-full object-cover" />
          <div className="hidden md:flex items-center gap-1">
            <span>Darshana</span>
            <ChevronDown size={16} />
          </div>
        </div>
      </div>
    </header>;
}