'use client'
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

import { LayoutGrid, Users, FolderOpen, Gift, User, MessageSquare, Code, Wallet, BarChart2, RefreshCw, Coffee, CreditCard } from 'lucide-react';
export function Sidebar() {
  const location = usePathname();
  const isActive = (path: string) => {
    return location === path;
  };
  const navItems = [{
    icon: <LayoutGrid size={20} />,
    label: 'Dashboard',
    path: '/freelancer/dashboard'
  }, {
    icon: <FolderOpen size={20} />,
    label: 'Browse Projects',
    path: '/freelancer/browse-projects'
  }, {
    icon: <Gift size={20} />,
    label: 'Bounties',
    path: '/freelancer/bounties'
  },
  {
    icon: <User size={20} />,
    label: 'My Services',
    path: '/freelancer/my-services'
  },  
  {
    icon: <User size={20} />,
    label: 'My Projects',
    path: '/freelancer/my-projects'
  }, {
    icon: <MessageSquare size={20} />,
    label: 'Messages',
    path: '/freelancer/messages'
  }, {
    icon: <Code size={20} />,
    label: 'Hackathons',
    path: '/freelancer/hackathons'
  }, {
    icon: <Wallet size={20} />,
    label: 'Pay & Loans',
    path: '/freelancer/pay-and-loans'
  }, {
    icon: <BarChart2 size={20} />,
    label: 'Analytics',
    path: '/freelancer/analytics'
  }, {
    icon: <RefreshCw size={20} />,
    label: 'ICP Work Swap',
    path: '/freelancer/swap'
  }, {
    icon: <Coffee size={20} />,
    label: 'Caffeine AI',
    path: '/freelancer/caffeine-ai'
  }, {
    icon: <CreditCard size={20} />,
    label: 'Crypto Card',
    path: '/freelancer/crypto-card'
  }];
  return <div className="w-64 border-r border-gray-200 h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <Link href="/profile/dashboard" className="flex items-center">
         <Image src="https://uploadthingy.s3.us-west-1.amazonaws.com/vjMzkkC8QuLABm1koFUeNQ/Group_1865110117.png" alt="ICPWork Logo" width={100} height={100} />
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