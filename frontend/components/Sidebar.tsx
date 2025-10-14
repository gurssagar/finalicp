'use client'
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, Users, FolderOpen, Gift, User, MessageSquare, Code, Wallet, BarChart2, RefreshCw, Coffee, CreditCard } from 'lucide-react';
export function Sidebar() {
  const location = usePathname();
  const isActive = (path: string) => {
    return location === path;
  };
  const navItems = [{
    icon: <LayoutGrid size={20} />,
    label: 'Dashboard',
    path: '/profile/dashboard'
  }, {
    icon: <Users size={20} />,
    label: 'Workers',
    path: '/hire-talent'
  }, {
    icon: <FolderOpen size={20} />,
    label: 'Browse Projects',
    path: '/browse-projects'
  }, {
    icon: <Gift size={20} />,
    label: 'Bounties',
    path: '/bounties'
  }, {
    icon: <User size={20} />,
    label: 'My Projects',
    path: '/my-projects'
  }, {
    icon: <MessageSquare size={20} />,
    label: 'Messages',
    path: '/messages'
  }, {
    icon: <Code size={20} />,
    label: 'Hackathons',
    path: '/hackathons'
  }, {
    icon: <Wallet size={20} />,
    label: 'Pay & Loans',
    path: '/pay-and-loans'
  }, {
    icon: <BarChart2 size={20} />,
    label: 'Analytics',
    path: '/analytics'
  }, {
    icon: <RefreshCw size={20} />,
    label: 'ICP Work Swap',
    path: '/icp-work-swap'
  }, {
    icon: <Coffee size={20} />,
    label: 'Caffeine AI',
    path: '/caffeine-ai'
  }, {
    icon: <CreditCard size={20} />,
    label: 'Crypto Card',
    path: '/crypto-card'
  }];
  return <div className="w-64 border-r border-gray-200 h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <Link href="/profile/dashboard" className="flex items-center">
          <svg width="40" height="32" viewBox="0 0 40 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
            <path d="M20.0001 0L0 11.5556V23.1111L20.0001 11.5556L40.0001 23.1111V11.5556L20.0001 0Z" fill="#FF3B30" />
            <path d="M0 23.1111L20.0001 11.5555V23.1111V34.6667L0 23.1111Z" fill="#34C759" />
            <path d="M40.0001 23.1111L20.0001 11.5555V23.1111V34.6667L40.0001 23.1111Z" fill="#007AFF" />
          </svg>
          <span className="ml-2 font-bold text-xl text-[#161616]">ICPWork</span>
        </Link>
      </div>
      <nav className="p-2 flex-1 overflow-y-auto">
        {navItems.map((item, index) => <Link key={index} href={item.path} className={`flex items-center gap-3 p-4 rounded-lg cursor-pointer transition-colors ${isActive(item.path) ? 'bg-gradient-to-r from-blue-50 to-purple-50' : 'hover:bg-gray-50'}`}>
            <div className={`w-5 h-5 flex items-center justify-center ${isActive(item.path) ? 'text-purple-500' : 'text-gray-600'}`}>
              {item.icon}
            </div>
            <span className={isActive(item.path) ? 'font-medium text-purple-700' : 'text-gray-700'}>
              {item.label}
            </span>
          </Link>)}
      </nav>
    </div>;
}