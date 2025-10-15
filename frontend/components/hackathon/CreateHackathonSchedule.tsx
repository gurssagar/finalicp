'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// TypeScript interfaces
interface Speaker {
  picture: string | null;
  username: string;
  profileUrl: string;
  realName: string;
  position: string;
}

interface ScheduleEvent {
  id: string;
  dateRange: string;
  name: string;
  description: string;
  expanded: boolean;
  includesSpeaker: boolean;
  speaker: Speaker;
}

interface HackathonData {
  schedule: ScheduleEvent[];
}

interface CreateHackathonScheduleProps {
  hackathonData: HackathonData;
  updateHackathonData: (updates: Partial<HackathonData>) => void;
}

export default function CreateHackathonSchedule({
  hackathonData,
  updateHackathonData
}: CreateHackathonScheduleProps) {
  // State for validation and UX enhancements
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [showValidation, setShowValidation] = useState(false);

  const handleEventChange = useCallback((eventId: string, field: keyof ScheduleEvent, value: string) => {
    const updatedSchedule = hackathonData.schedule.map(event => {
      if (event.id === eventId) {
        return {
          ...event,
          [field]: value
        };
      }
      return event;
    });
    updateHackathonData({
      schedule: updatedSchedule
    });
    
    // Clear validation errors for this field
    if (validationErrors[`${eventId}-${field}`]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`${eventId}-${field}`];
        return newErrors;
      });
    }
  }, [hackathonData.schedule, updateHackathonData, validationErrors]);

  const toggleEventExpansion = useCallback((eventId: string) => {
    const updatedSchedule = hackathonData.schedule.map(event => {
      if (event.id === eventId) {
        return {
          ...event,
          expanded: !event.expanded
        };
      }
      return event;
    });
    updateHackathonData({
      schedule: updatedSchedule
    });
  }, [hackathonData.schedule, updateHackathonData]);

  const handleSpeakerChange = useCallback((eventId: string, field: keyof Speaker, value: string) => {
    const updatedSchedule = hackathonData.schedule.map(event => {
      if (event.id === eventId) {
        return {
          ...event,
          speaker: {
            ...event.speaker,
            [field]: value
          }
        };
      }
      return event;
    });
    updateHackathonData({
      schedule: updatedSchedule
    });
  }, [hackathonData.schedule, updateHackathonData]);

  const handleSpeakerToggle = useCallback((eventId: string) => {
    const updatedSchedule = hackathonData.schedule.map(event => {
      if (event.id === eventId) {
        return {
          ...event,
          includesSpeaker: !event.includesSpeaker
        };
      }
      return event;
    });
    updateHackathonData({
      schedule: updatedSchedule
    });
  }, [hackathonData.schedule, updateHackathonData]);

  const handleSpeakerImageUpload = useCallback(async (eventId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsLoading(true);
      try {
        // In a real app, you would upload this to a server and get a URL
        const imageUrl = URL.createObjectURL(file);
        const updatedSchedule = hackathonData.schedule.map(event => {
          if (event.id === eventId) {
            return {
              ...event,
              speaker: {
                ...event.speaker,
                picture: imageUrl
              }
            };
          }
          return event;
        });
        updateHackathonData({
          schedule: updatedSchedule
        });
        setSuccessMessage('Speaker image uploaded successfully');
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (error) {
        setValidationErrors(prev => ({
          ...prev,
          [`${eventId}-image`]: 'Failed to upload image. Please try again.'
        }));
      } finally {
        setIsLoading(false);
      }
    }
  }, [hackathonData.schedule, updateHackathonData]);

  const addTimeSlot = useCallback(() => {
    const newEvent: ScheduleEvent = {
      id: `event-${hackathonData.schedule.length + 1}-${Date.now()}`,
      dateRange: 'New Date',
      name: '',
      description: '',
      expanded: true,
      includesSpeaker: false,
      speaker: {
        picture: null,
        username: '',
        profileUrl: '',
        realName: '',
        position: ''
      }
    };
    updateHackathonData({
      schedule: [...hackathonData.schedule, newEvent]
    });
  }, [hackathonData.schedule, updateHackathonData]);

  // Validation functions
  const validateEvent = useCallback((event: ScheduleEvent): Record<string, string> => {
    const errors: Record<string, string> = {};
    
    if (!event.name.trim()) {
      errors[`${event.id}-name`] = 'Event name is required';
    }
    
    if (!event.description.trim()) {
      errors[`${event.id}-description`] = 'Event description is required';
    }
    
    if (event.includesSpeaker) {
      if (!event.speaker.realName.trim()) {
        errors[`${event.id}-speaker-realName`] = 'Speaker real name is required';
      }
      if (!event.speaker.position.trim()) {
        errors[`${event.id}-speaker-position`] = 'Speaker position is required';
      }
    }
    
    return errors;
  }, []);

  const validateAllEvents = useCallback(() => {
    let allErrors: Record<string, string> = {};
    
    hackathonData.schedule.forEach(event => {
      const eventErrors = validateEvent(event);
      allErrors = { ...allErrors, ...eventErrors };
    });
    
    setValidationErrors(allErrors);
    setShowValidation(true);
    return Object.keys(allErrors).length === 0;
  }, [hackathonData.schedule, validateEvent]);

  // Computed values with useMemo
  const totalEvents = useMemo(() => hackathonData.schedule.length, [hackathonData.schedule]);
  
  const eventsWithSpeakers = useMemo(() => 
    hackathonData.schedule.filter(event => event.includesSpeaker).length, 
    [hackathonData.schedule]
  );
  
  const expandedEvents = useMemo(() => 
    hackathonData.schedule.filter(event => event.expanded).length, 
    [hackathonData.schedule]
  );

  const hasValidationErrors = useMemo(() => 
    Object.keys(validationErrors).length > 0, 
    [validationErrors]
  );

  return <div className="max-w-4xl mx-auto space-y-8">
      {/* Success Message */}
      {successMessage && (
        <div className={cn(
          "flex items-center gap-2 p-4 rounded-lg border",
          "bg-green-50 border-green-200 text-green-800"
        )}>
          <CheckCircle className="w-5 h-5" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Schedule Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{totalEvents}</div>
          <div className="text-sm text-gray-600">Total Events</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{eventsWithSpeakers}</div>
          <div className="text-sm text-gray-600">With Speakers</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{expandedEvents}</div>
          <div className="text-sm text-gray-600">Expanded</div>
        </div>
      </div>

      {/* Validation Summary */}
      {showValidation && hasValidationErrors && (
        <div className={cn(
          "flex items-start gap-2 p-4 rounded-lg border",
          "bg-red-50 border-red-200 text-red-800"
        )}>
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>
            <div className="font-medium">Please fix the following errors:</div>
            <ul className="mt-1 text-sm list-disc list-inside">
              {Object.values(validationErrors).map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {hackathonData.schedule.map(event => (
        <div 
          key={event.id} 
          className={cn(
            "space-y-6 bg-white border rounded-lg p-6 shadow-sm transition-all duration-200",
            "hover:shadow-md",
            validationErrors[`${event.id}-name`] || validationErrors[`${event.id}-description`] 
              ? "border-red-300" 
              : "border-gray-200"
          )}
          role="region"
          aria-labelledby={`event-title-${event.id}`}
        >
          <div 
            id={`event-title-${event.id}`}
            className="text-lg font-medium text-gray-800"
          >
            {event.dateRange}
          </div>
          
          {event.expanded ? (
            <div className="space-y-6">
              <div>
                <label 
                  htmlFor={`event-name-${event.id}`}
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Event Name *
                </label>
                <input 
                  id={`event-name-${event.id}`}
                  type="text" 
                  value={event.name} 
                  onChange={e => handleEventChange(event.id, 'name', e.target.value)} 
                  placeholder="Enter event name" 
                  className={cn(
                    "w-full p-3 bg-white border rounded-md text-gray-800 transition-colors",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500",
                    validationErrors[`${event.id}-name`] 
                      ? "border-red-300 focus:ring-red-500" 
                      : "border-gray-300"
                  )}
                  aria-describedby={validationErrors[`${event.id}-name`] ? `error-${event.id}-name` : undefined}
                  aria-invalid={!!validationErrors[`${event.id}-name`]}
                />
                {validationErrors[`${event.id}-name`] && (
                  <p 
                    id={`error-${event.id}-name`}
                    className="mt-1 text-sm text-red-600"
                    role="alert"
                  >
                    {validationErrors[`${event.id}-name`]}
                  </p>
                )}
              </div>
              
              <div>
                <label 
                  htmlFor={`event-description-${event.id}`}
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Event Description *
                </label>
                <textarea 
                  id={`event-description-${event.id}`}
                  value={event.description} 
                  onChange={e => handleEventChange(event.id, 'description', e.target.value)} 
                  placeholder="Describe the event" 
                  className={cn(
                    "w-full p-3 bg-white border rounded-md text-gray-800 h-32 resize-none transition-colors",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500",
                    validationErrors[`${event.id}-description`] 
                      ? "border-red-300 focus:ring-red-500" 
                      : "border-gray-300"
                  )}
                  aria-describedby={validationErrors[`${event.id}-description`] ? `error-${event.id}-description` : undefined}
                  aria-invalid={!!validationErrors[`${event.id}-description`]}
                />
                {validationErrors[`${event.id}-description`] && (
                  <p 
                    id={`error-${event.id}-description`}
                    className="mt-1 text-sm text-red-600"
                    role="alert"
                  >
                    {validationErrors[`${event.id}-description`]}
                  </p>
                )}
              </div>
              
              <div className="flex items-center mb-4">
                <input 
                  type="checkbox" 
                  id={`include-speaker-${event.id}`} 
                  checked={event.includesSpeaker} 
                  onChange={() => handleSpeakerToggle(event.id)} 
                  className="mr-2 h-4 w-4 rounded bg-white border-gray-300 text-blue-600 focus:ring-blue-500" 
                />
                <label 
                  htmlFor={`include-speaker-${event.id}`} 
                  className="text-sm font-medium text-gray-700"
                >
                  Include Speaker
                </label>
              </div>
              
              {event.includesSpeaker && (
                <div 
                  className="space-y-6 bg-gray-50 p-4 rounded-md"
                  role="group"
                  aria-labelledby={`speaker-section-${event.id}`}
                >
                  <h4 
                    id={`speaker-section-${event.id}`}
                    className="text-lg font-medium text-gray-800 mb-4"
                  >
                    Speaker Information
                  </h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Speaker Picture
                    </label>
                    <div className={cn(
                      "border border-gray-300 rounded-md bg-white h-32 w-32 flex items-center justify-center relative overflow-hidden",
                      "transition-colors hover:border-gray-400",
                      validationErrors[`${event.id}-image`] && "border-red-300"
                    )}>
                      {event.speaker.picture ? (
                        <img 
                          src={event.speaker.picture} 
                          alt="Speaker" 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <div className="text-center">
                          <div className="flex flex-col items-center justify-center">
                            <Upload className="w-5 h-5 text-gray-400 mb-1" />
                            <p className="text-gray-500 text-xs mb-1">
                              Upload speaker
                            </p>
                            <p className="text-gray-500 text-xs mb-1">
                              photo or
                            </p>
                            <button 
                              type="button"
                              onClick={() => document.getElementById(`speaker-image-${event.id}`)?.click()} 
                              className="text-blue-600 text-xs hover:text-blue-700 focus:outline-none focus:underline"
                              disabled={isLoading}
                            >
                              {isLoading ? 'Uploading...' : 'Click to browse'}
                            </button>
                          </div>
                        </div>
                      )}
                      <input 
                        type="file" 
                        id={`speaker-image-${event.id}`} 
                        className="hidden" 
                        accept="image/*" 
                        onChange={e => handleSpeakerImageUpload(event.id, e)}
                        disabled={isLoading}
                      />
                    </div>
                    {validationErrors[`${event.id}-image`] && (
                      <p className="mt-1 text-sm text-red-600" role="alert">
                        {validationErrors[`${event.id}-image`]}
                      </p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label 
                        htmlFor={`speaker-username-${event.id}`}
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Speaker x.com name
                      </label>
                      <input 
                        id={`speaker-username-${event.id}`}
                        type="text" 
                        value={event.speaker.username} 
                        onChange={e => handleSpeakerChange(event.id, 'username', e.target.value)} 
                        placeholder="Enter speaker x.com name" 
                        className="w-full p-3 bg-white border border-gray-300 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      />
                    </div>
                    <div>
                      <label 
                        htmlFor={`speaker-profile-${event.id}`}
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Speaker x.com link
                      </label>
                      <input 
                        id={`speaker-profile-${event.id}`}
                        type="url" 
                        value={event.speaker.profileUrl} 
                        onChange={e => handleSpeakerChange(event.id, 'profileUrl', e.target.value)} 
                        placeholder="Enter speaker x.com link" 
                        className="w-full p-3 bg-white border border-gray-300 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label 
                        htmlFor={`speaker-realname-${event.id}`}
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Speaker real name *
                      </label>
                      <input 
                        id={`speaker-realname-${event.id}`}
                        type="text" 
                        value={event.speaker.realName} 
                        onChange={e => handleSpeakerChange(event.id, 'realName', e.target.value)} 
                        placeholder="Enter speaker real name" 
                        className={cn(
                          "w-full p-3 bg-white border rounded-md text-gray-800 transition-colors",
                          "focus:outline-none focus:ring-2 focus:ring-blue-500",
                          validationErrors[`${event.id}-speaker-realName`] 
                            ? "border-red-300 focus:ring-red-500" 
                            : "border-gray-300"
                        )}
                        aria-describedby={validationErrors[`${event.id}-speaker-realName`] ? `error-${event.id}-speaker-realName` : undefined}
                        aria-invalid={!!validationErrors[`${event.id}-speaker-realName`]}
                      />
                      {validationErrors[`${event.id}-speaker-realName`] && (
                        <p 
                          id={`error-${event.id}-speaker-realName`}
                          className="mt-1 text-sm text-red-600"
                          role="alert"
                        >
                          {validationErrors[`${event.id}-speaker-realName`]}
                        </p>
                      )}
                    </div>
                    <div>
                      <label 
                        htmlFor={`speaker-position-${event.id}`}
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Speaker work place & position *
                      </label>
                      <input 
                        id={`speaker-position-${event.id}`}
                        type="text" 
                        value={event.speaker.position} 
                        onChange={e => handleSpeakerChange(event.id, 'position', e.target.value)} 
                        placeholder="Enter speaker details" 
                        className={cn(
                          "w-full p-3 bg-white border rounded-md text-gray-800 transition-colors",
                          "focus:outline-none focus:ring-2 focus:ring-blue-500",
                          validationErrors[`${event.id}-speaker-position`] 
                            ? "border-red-300 focus:ring-red-500" 
                            : "border-gray-300"
                        )}
                        aria-describedby={validationErrors[`${event.id}-speaker-position`] ? `error-${event.id}-speaker-position` : undefined}
                        aria-invalid={!!validationErrors[`${event.id}-speaker-position`]}
                      />
                      {validationErrors[`${event.id}-speaker-position`] && (
                        <p 
                          id={`error-${event.id}-speaker-position`}
                          className="mt-1 text-sm text-red-600"
                          role="alert"
                        >
                          {validationErrors[`${event.id}-speaker-position`]}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              <div>
                <button 
                  type="button" 
                  onClick={() => toggleEventExpansion(event.id)} 
                  className={cn(
                    "text-gray-600 hover:text-gray-800 flex items-center transition-colors",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
                  )}
                  aria-expanded="true"
                  aria-controls={`event-details-${event.id}`}
                >
                  <ChevronUp size={16} className="mr-1" />
                  <span>collapse</span>
                </button>
              </div>
            </div>
          ) : (
            <div>
              <button 
                type="button" 
                onClick={() => toggleEventExpansion(event.id)} 
                className={cn(
                  "text-blue-600 hover:text-blue-700 flex items-center transition-colors",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
                )}
                aria-expanded="false"
                aria-controls={`event-details-${event.id}`}
              >
                <ChevronDown size={16} className="mr-1" />
                <span>details</span>
              </button>
            </div>
          )}
        </div>
      ))}
      
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <button 
          type="button" 
          onClick={addTimeSlot} 
          className={cn(
            "text-blue-600 hover:text-blue-700 text-sm flex items-center transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
          )}
          disabled={isLoading}
        >
          <span className="mr-1">+</span> 
          add another time slot
        </button>
        
        <button
          type="button"
          onClick={validateAllEvents}
          className={cn(
            "px-4 py-2 rounded-md text-sm font-medium transition-colors",
            "bg-blue-600 text-white hover:bg-blue-700",
            "focus:outline-none focus:ring-2 focus:ring-blue-500",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
          disabled={isLoading}
        >
          Validate Schedule
        </button>
      </div>
    </div>;
}