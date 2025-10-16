'use client'
import React, { useState } from 'react';
import { Plus, Trash2, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Judge {
  id: string;
  name: string;
  email: string;
  bio: string;
  expertise: string[];
  avatar?: string;
}

interface CreateHackathonJudgesProps {
  judges: Judge[];
  onJudgesChange: (judges: Judge[]) => void;
  className?: string;
}

export default function CreateHackathonJudges({
  judges,
  onJudgesChange,
  className
}: CreateHackathonJudgesProps) {
  const addJudge = () => {
    const newJudge: Judge = {
      id: Date.now().toString(),
      name: '',
      email: '',
      bio: '',
      expertise: []
    };
    onJudgesChange([...judges, newJudge]);
  };

  const updateJudge = (id: string, field: keyof Judge, value: string | string[]) => {
    const updatedJudges = judges.map(judge =>
      judge.id === id ? { ...judge, [field]: value } : judge
    );
    onJudgesChange(updatedJudges);
  };

  const removeJudge = (id: string) => {
    onJudgesChange(judges.filter(judge => judge.id !== id));
  };

  const addExpertise = (judgeId: string, expertise: string) => {
    if (!expertise.trim()) return;
    
    const judge = judges.find(j => j.id === judgeId);
    if (judge && !judge.expertise.includes(expertise)) {
      updateJudge(judgeId, 'expertise', [...judge.expertise, expertise]);
    }
  };

  const removeExpertise = (judgeId: string, expertise: string) => {
    const judge = judges.find(j => j.id === judgeId);
    if (judge) {
      updateJudge(judgeId, 'expertise', judge.expertise.filter(e => e !== expertise));
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Judges</h3>
        <button
          onClick={addJudge}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          <span>Add Judge</span>
        </button>
      </div>

      <div className="space-y-4">
        {judges.map((judge, index) => (
          <div key={judge.id} className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-500" />
                <h4 className="font-medium text-gray-900">Judge #{index + 1}</h4>
              </div>
              <button
                onClick={() => removeJudge(judge.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-md"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={judge.name}
                  onChange={(e) => updateJudge(judge.id, 'name', e.target.value)}
                  placeholder="Judge name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={judge.email}
                  onChange={(e) => updateJudge(judge.id, 'email', e.target.value)}
                  placeholder="judge@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  value={judge.bio}
                  onChange={(e) => updateJudge(judge.id, 'bio', e.target.value)}
                  placeholder="Judge bio and background"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expertise
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {judge.expertise.map((exp, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-md flex items-center space-x-1"
                    >
                      <span>{exp}</span>
                      <button
                        onClick={() => removeExpertise(judge.id, exp)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Add expertise area"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addExpertise(judge.id, e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                  <button
                    onClick={(e) => {
                      const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                      addExpertise(judge.id, input.value);
                      input.value = '';
                    }}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {judges.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No judges added yet. Click "Add Judge" to get started.</p>
        </div>
      )}
    </div>
  );
}