'use client'  
import React, { useState } from 'react';
import { useServiceForm } from '@/context/ServiceFormContext';
import { Check } from 'lucide-react';
interface ServiceTierCardProps {
  title: string;
  color: string;
  tier: 'basic' | 'advanced' | 'premium';
}
export function ServiceTierCard({
  title,
  color,
  tier
}: ServiceTierCardProps) {
  const {
    formData,
    updateFormData,
    isSaved,
    setSaved
  } = useServiceForm();
  const [isEditing, setIsEditing] = useState(false);
  const titleKey = `${tier}Title` as const;
  const descriptionKey = `${tier}Description` as const;
  const deliveryDaysKey = `${tier}DeliveryDays` as const;
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFormData({
      [titleKey]: e.target.value
    });
    setSaved(titleKey, true);
  };
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateFormData({
      [descriptionKey]: e.target.value
    });
    setSaved(descriptionKey, true);
  };
  const handleDeliveryDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFormData({
      [deliveryDaysKey]: e.target.value
    });
    setSaved(deliveryDaysKey, true);
  };
  return <div className="flex flex-col">
      <div className={`${color} p-4 rounded-t-lg text-center font-medium`}>
        {title}
      </div>
      <div className="border border-gray-200 rounded-b-lg p-4 flex-1 flex flex-col gap-4">
        <div className="relative">
          {isEditing ? <input type="text" value={formData[titleKey] || ''} onChange={handleTitleChange} placeholder="Write custom title here" className="w-full p-2 border border-gray-200 rounded outline-none" onBlur={() => setIsEditing(false)} autoFocus /> : <div onClick={() => setIsEditing(true)} className="w-full p-2 min-h-[40px] cursor-text">
              {formData[titleKey] || 'Write custom title here'}
            </div>}
          {isSaved[titleKey] && <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-green-500 flex items-center">
              <Check size={16} />
              <span className="text-xs ml-1">Saved</span>
            </div>}
        </div>
        <div className="relative flex-1">
          <textarea value={formData[descriptionKey] || ''} onChange={handleDescriptionChange} placeholder="Write description here" className="w-full p-2 border border-gray-200 rounded resize-none outline-none min-h-[100px]" />
          {isSaved[descriptionKey] && <div className="absolute right-2 top-2 text-green-500 flex items-center">
              <Check size={16} />
              <span className="text-xs ml-1">Saved</span>
            </div>}
        </div>
        <div className="relative">
          <input type="text" value={formData[deliveryDaysKey] || ''} onChange={handleDeliveryDaysChange} placeholder="Enter Number of days of Delivery" className="w-full p-2 border border-gray-200 rounded outline-none" />
          {isSaved[deliveryDaysKey] && <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-green-500 flex items-center">
              <Check size={16} />
              <span className="text-xs ml-1">Saved</span>
            </div>}
        </div>
      </div>
    </div>;
}