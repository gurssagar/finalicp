'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface Tab {
  id: string;
  label: string;
}

interface CreateHackathonNavProps {
  activeTab: string;
  setActiveTab: (tabId: string) => void;
  className?: string;
}

const tabs: readonly Tab[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'prizes', label: 'Prizes' },
  { id: 'judges', label: 'Judges' },
  { id: 'schedule', label: 'Schedule' }
] as const;

export const CreateHackathonNav: React.FC<CreateHackathonNavProps> = ({
  activeTab,
  setActiveTab,
  className
}) => {
  return (
    <nav className={cn("w-56 border-r border-gray-200 py-6 bg-white", className)}>
      <ul className="space-y-1" role="tablist">
        {tabs.map((tab) => (
          <li key={tab.id}>
            <button
              type="button"
              onClick={() => setActiveTab(tab.id)}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`${tab.id}-panel`}
              className={cn(
                "w-full text-left py-3 px-6 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset",
                activeTab === tab.id
                  ? "text-blue-600 bg-blue-50 border-l-2 border-blue-600 font-medium"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-800 border-l-2 border-transparent"
              )}
            >
              {tab.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};