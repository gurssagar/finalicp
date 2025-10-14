'use client'
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, MessageSquare, MoreVertical, Download } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
export default function ProjectDetailsPage() {
  const navigate = useRouter();
  const [files, setFiles] = useState<{
    name: string;
    id: number;
  }[]>([{
    name: 'Variation1.pdf',
    id: 1
  }, {
    name: 'Variation1.pdf',
    id: 2
  }]);
  const removeFile = (id: number) => {
    setFiles(files.filter(file => file.id !== id));
  };
  const handleSubmitProject = () => {
    navigate.push('/project-revision');
  };
  return <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>
      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <header className="flex justify-between items-center p-4 border-b border-gray-200">
          <div className="md:hidden">
            <svg width="110" height="32" viewBox="0 0 40 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-8">
              <path d="M20.0001 0L0 11.5556V23.1111L20.0001 11.5556L40.0001 23.1111V11.5556L20.0001 0Z" fill="#FF3B30" />
              <path d="M0 23.1111L20.0001 11.5555V23.1111V34.6667L0 23.1111Z" fill="#34C759" />
              <path d="M40.0001 23.1111L20.0001 11.5555V23.1111V34.6667L40.0001 23.1111Z" fill="#007AFF" />
            </svg>
          </div>
          <div className="flex items-center ml-auto gap-4">
            <div className="relative">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  1
                </div>
              </div>
            </div>
            <div className="flex items-center border rounded-full px-4 py-2 gap-2">
              <span className="text-sm font-medium">Client</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full overflow-hidden">
                <img src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=300&auto=format&fit=crop" alt="Profile" className="w-full h-full object-cover" />
              </div>
              <span className="hidden md:inline">John Doe</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </header>
        {/* Main Content */}
        <div className="p-6">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden mr-4">
              <img src="https://via.placeholder.com/48" alt="Organaise Recruit" className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Organaise Recruit</h2>
              <p className="text-sm text-gray-500">India - Fri 2023</p>
            </div>
            <div className="ml-auto flex gap-2">
              <button className="p-2 rounded-full hover:bg-gray-100">
                <MessageSquare size={20} className="text-gray-500" />
              </button>
              <button className="p-2 rounded-full hover:bg-gray-100">
                <MoreVertical size={20} className="text-gray-500" />
              </button>
            </div>
          </div>
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-4">
              I will do website ui, figma website design, website design figma,
              design website
            </h1>
            {/* Progress Tracker */}
            <div className="relative mb-8 mt-8">
              <div className="h-1 w-full bg-gray-200 rounded-full">
                <div className="h-1 bg-green-500 rounded-full w-[60%]"></div>
              </div>
              <div className="flex justify-between mt-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="text-xs mt-1">Payment In Escrow</span>
                  <span className="text-xs text-gray-500">10 minutes ago</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="text-xs mt-1">Order Placed</span>
                  <span className="text-xs text-gray-500">10 minutes ago</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="text-xs mt-1">Work completion</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                    4
                  </div>
                  <span className="text-xs mt-1">Revision</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                    5
                  </div>
                  <span className="text-xs mt-1">Project completion</span>
                </div>
              </div>
            </div>
            {/* Project Details Card */}
            <div className="border border-gray-200 rounded-lg p-6 mb-6">
              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 bg-gray-100 rounded-full overflow-hidden mr-3">
                    <img src="https://via.placeholder.com/32" alt="Client" className="w-full h-full object-cover" />
                  </div>
                  <p>
                    Client Has Provided you the requirement and i will deliver
                    you the work
                  </p>
                </div>
                <p className="text-sm text-gray-600 mb-2">Due 2 hrs ago</p>
                <p className="text-sm text-gray-600">
                  Your can connect Organaise to get any further details
                </p>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {files.map(file => <div key={file.id} className="flex items-center bg-gray-50 rounded-md px-3 py-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2 text-gray-500">
                      <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-sm">{file.name}</span>
                    <button onClick={() => removeFile(file.id)} className="ml-2 text-gray-400 hover:text-gray-600">
                      <X size={16} />
                    </button>
                  </div>)}
              </div>
              <button onClick={handleSubmitProject} className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-500 to-pink-500 text-white rounded-full font-medium hover:opacity-90 transition-opacity">
                Submit Project
              </button>
            </div>
            {/* Recent Files Section */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-bold mb-6">Recent Files</h3>
                <div className="flex flex-col items-center justify-center py-8">
                  <img src="/Freelancer_Payment_Flow2x-5.png" alt="No files" className="w-32 h-32 object-contain mb-4" />
                  <p className="text-gray-600">No Files Received till now</p>
                </div>
              </div>
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-bold mb-2">Order Details :</h3>
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden mr-3">
                    <img src="/Freelancer_Payment_Flow2x.png" alt="Basic Plan" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="font-medium">
                      Basic Plan: <span className="text-green-500">$10</span>
                    </p>
                    <div className="flex items-center">
                      <span className="text-sm">In escrow</span>
                      <div className="w-2 h-2 bg-green-500 rounded-full ml-2"></div>
                    </div>
                  </div>
                </div>
                <div className="mb-4">
                  <p className="mb-1">
                    Status :{' '}
                    <span className="text-yellow-500">Waiting for crispus</span>
                  </p>
                </div>
                <h3 className="text-lg font-bold mb-2">
                  Submitted Requirements :
                </h3>
                <div className="text-gray-700">
                  <p className="font-medium mb-2">
                    How do I become a part of Organaise'd freelance network?
                  </p>
                  <p className="text-sm text-gray-600">
                    Joining our network starts with an application. We
                    meticulously review your expertise, portfolio, and
                    professional background.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>;
}