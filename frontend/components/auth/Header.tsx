'use client';
import React from 'react';
import  Link  from 'next/link';
const Header = () => {
  return <header className="w-full flex justify-between items-center px-6 py-4 border-b border-gray-200">
      <div className="flex items-center">
        <img src="https://uploadthingy.s3.us-west-1.amazonaws.com/vjMzkkC8QuLABm1koFUeNQ/Group_1865110117.png" alt="ICPWork Logo" className="h-8" />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-gray-800">Want to Hire ?</span>
        <Link href="/client-signup" className="text-green-600 font-medium">
          Join As Client
        </Link>
      </div>
    </header>;
};
export default Header;