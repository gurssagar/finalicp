'use client';
import React from 'react';
interface ProjectTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}
export function ProjectTabs({
  activeTab,
  setActiveTab
}: ProjectTabsProps) {
  const tabs = [{
    id: 'overview',
    label: 'Overview'
  }, {
    id: 'hackathon',
    label: 'Hackathon'
  }, {
    id: 'team',
    label: 'Team'
  }];
  return <div className="border-b border-gray-200 overflow-x-auto">
      <div className="flex min-w-max">
        {tabs.map(tab => <button key={tab.id} className={`flex items-center py-3 px-4 md:px-6 relative ${activeTab === tab.id ? 'text-blue-500 font-medium' : 'text-gray-500'}`} onClick={() => setActiveTab(tab.id)}>
            <span>{tab.label}</span>
            {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-500"></div>}
          </button>)}
      </div>
    </div>;
}