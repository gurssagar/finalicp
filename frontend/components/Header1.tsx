'use client'
import React, { useState } from 'react';
import { Bell, ChevronDown, Search, Briefcase, User, Settings, ArrowRight } from 'lucide-react';
import { useUserContext } from '@/contexts/UserContext';
import { useRouter, usePathname } from 'next/navigation';
interface HeaderProps {
  showSearch?: boolean;
}
export function Header1({
  showSearch = true
}: HeaderProps) {
  const { profile, isLoading, currentRole } = useUserContext();
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const displayName = profile.firstName || profile.email?.split('@')[0] || 'User';
  const fullName = profile.firstName && profile.lastName
    ? `${profile.firstName} ${profile.lastName}`
    : displayName;

  // Get role display text and icon based on current role
  const getRoleDisplay = () => {
    switch (currentRole) {
      case 'admin':
        return {
          text: 'Admin',
          icon: <Settings size={16} />,
          bgColor: 'bg-purple-100',
          textColor: 'text-purple-700',
          hoverBg: 'hover:bg-purple-50'
        };
      case 'freelancer':
        return {
          text: 'Freelancer',
          icon: <Briefcase size={16} />,
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-700',
          hoverBg: 'hover:bg-blue-50'
        };
      case 'client':
        return {
          text: 'Client',
          icon: <User size={16} />,
          bgColor: 'bg-green-100',
          textColor: 'text-green-700',
          hoverBg: 'hover:bg-green-50'
        };
      case 'both':
        return {
          text: 'Client & Freelancer',
          icon: <User size={16} />,
          bgColor: 'bg-amber-100',
          textColor: 'text-amber-700',
          hoverBg: 'hover:bg-amber-50'
        };
      default:
        return {
          text: 'Client',
          icon: <User size={16} />,
          bgColor: 'bg-green-100',
          textColor: 'text-green-700',
          hoverBg: 'hover:bg-green-50'
        };
    }
  };

  const roleDisplay = getRoleDisplay();

  // Handle role switching
  const handleRoleSwitch = (role: 'client' | 'freelancer') => {
    setShowRoleDropdown(false);

    // Get the current path without the role prefix
    const currentPathWithoutRole = pathname.replace(/^\/(client|freelancer|admin)/, '');

    // Navigate to the same path but with the new role
    const newPath = `/${role}/dashboard`;
    router.push(newPath);
  };

  // Navigate to dashboard
  const handleDashboardClick = () => {
    setShowProfileDropdown(false);

    if (currentRole === 'freelancer') {
      router.push('/freelancer/dashboard');
    } else {
      router.push('/client/dashboard');
    }
  };

  // Get profile loading state indicator
  const getProfileStatus = () => {
    if (isLoading) return { text: 'Loading...', color: 'text-gray-500' };
    if (profile.firstName && profile.lastName) return { text: 'Complete', color: 'text-green-600' };
    return { text: 'Incomplete', color: 'text-orange-500' };
  };

  const profileStatus = getProfileStatus();

  return (
    <header className="flex justify-between items-center p-4 border-b border-gray-200 bg-white relative">
      {showSearch ? (
        <div className="relative flex-1 max-w-xl">
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="Search your industry here..."
              className="w-full py-2 pl-4 pr-10 rounded-full border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <div className="absolute right-3 bg-green-500 rounded-full p-1">
              <Search size={18} className="text-white" />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1"></div>
      )}

      <div className="flex items-center gap-4 ml-auto">
        {/* Notifications */}
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors">
            <Bell size={20} className="text-gray-600" />
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              1
            </div>
          </div>
        </div>

        {/* User Type/Role Selector */}
        <div className="relative">
          <div
            className={`flex items-center gap-2 px-3 py-1 rounded-full cursor-pointer transition-colors ${roleDisplay.bgColor} ${roleDisplay.hoverBg}`}
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
          >
            <div className="flex items-center justify-center">
              {roleDisplay.icon}
            </div>
            <span className={`text-sm font-medium ${roleDisplay.textColor}`}>
              {isLoading ? 'Loading...' : roleDisplay.text}
            </span>
            <ChevronDown size={16} className={roleDisplay.textColor} />
          </div>

          {/* Role Dropdown */}
          {showRoleDropdown && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <div className="py-2">
                <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100">
                  Switch Role:
                </div>
                <button
                  onClick={() => handleRoleSwitch('client')}
                  className={`w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 ${
                    currentRole === 'client' ? 'bg-green-50 text-green-700' : 'text-gray-700'
                  }`}
                >
                  <User size={16} />
                  <span>Client Dashboard</span>
                  {currentRole === 'client' && <span className="ml-auto text-xs">✓</span>}
                </button>
                <button
                  onClick={() => handleRoleSwitch('freelancer')}
                  className={`w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 ${
                    currentRole === 'freelancer' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                  }`}
                >
                  <Briefcase size={16} />
                  <span>Freelancer Dashboard</span>
                  {currentRole === 'freelancer' && <span className="ml-auto text-xs">✓</span>}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative">
          <div
            className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded-full px-2 py-1 transition-colors"
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
          >
            {isLoading ? (
              // Loading skeleton
              <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
            ) : profile.profileImage ? (
              <img
                src={profile.profileImage}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-semibold text-lg">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="hidden md:flex flex-col items-start">
              {isLoading ? (
                <>
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mb-1"></div>
                  <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
                </>
              ) : (
                <>
                  <span className="font-medium text-gray-900">
                    {fullName}
                  </span>
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${
                      profileStatus.color === 'text-green-600' ? 'bg-green-500' :
                      profileStatus.color === 'text-orange-500' ? 'bg-orange-500' : 'bg-gray-500'
                    }`}></div>
                    <span className="text-xs text-gray-500">
                      {profileStatus.text}
                    </span>
                  </div>
                </>
              )}
            </div>
            {!isLoading && (
              <ChevronDown size={16} className="hidden md:block text-gray-500" />
            )}
          </div>

          {/* Profile Dropdown */}
          {showProfileDropdown && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <div className="py-2">
                {/* Profile Header */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    {isLoading ? (
                      <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
                    ) : profile.profileImage ? (
                      <img
                        src={profile.profileImage}
                        alt="Profile"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {displayName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{fullName}</p>
                      <p className="text-sm text-gray-500">{profile.email}</p>
                    </div>
                  </div>
                </div>

                {/* Profile Status */}
                <div className="px-4 py-2 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Profile Status:</span>
                    <span className={`text-sm font-medium ${profileStatus.color}`}>
                      {profileStatus.text}
                    </span>
                  </div>
                </div>

                {/* Navigation Items */}
                <div className="py-2">
                  <button
                    onClick={handleDashboardClick}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                  >
                    <ArrowRight size={16} />
                    <span>Go to Dashboard</span>
                  </button>
                  <button className="w-full px-4 py-2 text-left hover:bg-gray-50 text-gray-700">
                    Profile Settings
                  </button>
                  <button className="w-full px-4 py-2 text-left hover:bg-gray-50 text-gray-700">
                    Messages
                  </button>
                </div>

                {/* Footer */}
                <div className="px-4 py-2 border-t border-gray-100">
                  <button
                    onClick={async () => {
                      setShowProfileDropdown(false);
                      try {
                        await fetch('/api/logout', { method: 'POST' });
                        router.push('/login');
                      } catch (error) {
                        console.error('Logout error:', error);
                        router.push('/login');
                      }
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 text-red-600"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}