'use client'
import React, { useState } from 'react';
import { Plus, Trash2, Clock, Calendar, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScheduleItem {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  date: string;
  location?: string;
  type: 'opening' | 'workshop' | 'presentation' | 'break' | 'judging' | 'awards' | 'closing' | 'other';
  speakers?: string[];
  isRequired: boolean;
}

interface CreateHackathonScheduleProps {
  schedule: ScheduleItem[];
  onScheduleChange: (schedule: ScheduleItem[]) => void;
  className?: string;
}

export default function CreateHackathonSchedule({
  schedule,
  onScheduleChange,
  className
}: CreateHackathonScheduleProps) {
  const addScheduleItem = () => {
    const newItem: ScheduleItem = {
      id: Date.now().toString(),
      title: '',
      description: '',
      startTime: '',
      endTime: '',
      date: '',
      type: 'other',
      isRequired: false
    };
    onScheduleChange([...schedule, newItem]);
  };

  const updateScheduleItem = (id: string, field: keyof ScheduleItem, value: string | boolean | string[]) => {
    const updatedSchedule = schedule.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    );
    onScheduleChange(updatedSchedule);
  };

  const removeScheduleItem = (id: string) => {
    onScheduleChange(schedule.filter(item => item.id !== id));
  };

  const addSpeaker = (itemId: string, speaker: string) => {
    if (!speaker.trim()) return;
    
    const item = schedule.find(i => i.id === itemId);
    if (item && !item.speakers?.includes(speaker)) {
      updateScheduleItem(itemId, 'speakers', [...(item.speakers || []), speaker.trim()]);
    }
  };

  const removeSpeaker = (itemId: string, speaker: string) => {
    const item = schedule.find(i => i.id === itemId);
    if (item) {
      updateScheduleItem(itemId, 'speakers', item.speakers?.filter(s => s !== speaker) || []);
    }
  };

  const getTypeColor = (type: string) => {
    const colors = {
      opening: 'bg-green-100 text-green-800',
      workshop: 'bg-blue-100 text-blue-800',
      presentation: 'bg-purple-100 text-purple-800',
      break: 'bg-yellow-100 text-yellow-800',
      judging: 'bg-red-100 text-red-800',
      awards: 'bg-orange-100 text-orange-800',
      closing: 'bg-gray-100 text-gray-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[type as keyof typeof colors] || colors.other;
  };

  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Event Schedule</h3>
        <button
          onClick={addScheduleItem}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          <span>Add Event</span>
        </button>
      </div>

      <div className="space-y-4">
        {schedule.map((item, index) => (
          <div key={item.id} className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <h4 className="font-medium text-gray-900">Event #{index + 1}</h4>
                <span className={cn(
                  'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                  getTypeColor(item.type)
                )}>
                  {item.type}
                </span>
              </div>
              <button
                onClick={() => removeScheduleItem(item.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-md"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  value={item.title}
                  onChange={(e) => updateScheduleItem(item.id, 'title', e.target.value)}
                  placeholder="Event title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Type
                </label>
                <select
                  value={item.type}
                  onChange={(e) => updateScheduleItem(item.id, 'type', e.target.value as ScheduleItem['type'])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="opening">Opening Ceremony</option>
                  <option value="workshop">Workshop</option>
                  <option value="presentation">Presentation</option>
                  <option value="break">Break</option>
                  <option value="judging">Judging</option>
                  <option value="awards">Awards Ceremony</option>
                  <option value="closing">Closing Ceremony</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Date *
                </label>
                <input
                  type="date"
                  value={item.date}
                  onChange={(e) => updateScheduleItem(item.id, 'date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Start Time *
                </label>
                <input
                  type="time"
                  value={item.startTime}
                  onChange={(e) => updateScheduleItem(item.id, 'startTime', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Clock className="w-4 h-4 inline mr-1" />
                  End Time *
                </label>
                <input
                  type="time"
                  value={item.endTime}
                  onChange={(e) => updateScheduleItem(item.id, 'endTime', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Location
                </label>
                <input
                  type="text"
                  value={item.location || ''}
                  onChange={(e) => updateScheduleItem(item.id, 'location', e.target.value)}
                  placeholder="Event location"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={item.description}
                  onChange={(e) => updateScheduleItem(item.id, 'description', e.target.value)}
                  placeholder="Event description and details"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Speakers/Presenters
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {item.speakers?.map((speaker, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-md flex items-center space-x-1"
                    >
                      <span>{speaker}</span>
                      <button
                        onClick={() => removeSpeaker(item.id, speaker)}
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
                    placeholder="Add speaker name"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addSpeaker(item.id, e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                  <button
                    onClick={(e) => {
                      const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                      addSpeaker(item.id, input.value);
                      input.value = '';
                    }}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="md:col-span-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`required-${item.id}`}
                    checked={item.isRequired}
                    onChange={(e) => updateScheduleItem(item.id, 'isRequired', e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor={`required-${item.id}`} className="text-sm text-gray-700">
                    Required attendance
                  </label>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {schedule.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No events scheduled yet. Click "Add Event" to get started.</p>
        </div>
      )}
    </div>
  );
}