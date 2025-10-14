import React, { useState, createContext, useContext } from 'react';
import axios from 'axios';
interface ServiceFormData {
  // Overview
  serviceTitle: string;
  mainCategory: string;
  subCategory: string;
  description: string;
  whatsIncluded: string;
  // Projects
  tierMode: '1tier' | '3tier';
  basicTitle: string;
  basicDescription: string;
  basicDeliveryDays: string;
  advancedTitle: string;
  advancedDescription: string;
  advancedDeliveryDays: string;
  premiumTitle: string;
  premiumDescription: string;
  premiumDeliveryDays: string;
  // Pricing
  basicPrice: string;
  advancedPrice: string;
  premiumPrice: string;
  // Portfolio
  coverImage: string;
  portfolioImages: string[];
  // Others
  clientQuestions: string[];
}
interface ServiceFormContextType {
  formData: ServiceFormData;
  updateFormData: (data: Partial<ServiceFormData>) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  isSaved: {
    [key: string]: boolean;
  };
  setSaved: (field: string, value: boolean) => void;
}
const defaultFormData: ServiceFormData = {
  serviceTitle: '',
  mainCategory: 'Web Designer',
  subCategory: '',
  description: '',
  whatsIncluded: '',
  tierMode: '3tier',
  basicTitle: '',
  basicDescription: '',
  basicDeliveryDays: '',
  advancedTitle: '',
  advancedDescription: '',
  advancedDeliveryDays: '',
  premiumTitle: '',
  premiumDescription: '',
  premiumDeliveryDays: '',
  basicPrice: '',
  advancedPrice: '',
  premiumPrice: '',
  coverImage: '',
  portfolioImages: [],
  clientQuestions: []
};
export const ServiceFormContext = createContext<ServiceFormContextType>({
  formData: defaultFormData,
  updateFormData: () => {},
  currentStep: 0,
  setCurrentStep: () => {},
  isSaved: {},
  setSaved: () => {}
});
export const useServiceForm = () => useContext(ServiceFormContext);
// Configure axios with reasonable defaults
axios.defaults.timeout = 30000; // 30 seconds timeout
axios.defaults.maxRedirects = 5;
axios.interceptors.response.use(response => response, error => {
  // Log error details for debugging
  console.error('API Request Error:', {
    url: error.config?.url,
    method: error.config?.method,
    status: error.response?.status,
    data: error.response?.data,
    message: error.message
  });
  // For 502 errors specifically, we might want to handle differently
  if (error.response?.status === 502) {
    console.warn('Server gateway error. The server might be down or restarting.');
    // Return a resolved promise with null to prevent the error from propagating
    // This allows the UI to continue functioning even if the backend is temporarily unavailable
    return Promise.resolve({
      data: null
    });
  }
  return Promise.reject(error);
});
export const ServiceFormProvider: React.FC<{
  children: ReactNode;
}> = ({
  children
}) => {
  const [formData, setFormData] = useState<ServiceFormData>(defaultFormData);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSaved, setIsSaved] = useState<{
    [key: string]: boolean;
  }>({});
  const updateFormData = (data: Partial<ServiceFormData>) => {
    setFormData(prev => ({
      ...prev,
      ...data
    }));
  };
  const setSaved = (field: string, value: boolean) => {
    setIsSaved(prev => ({
      ...prev,
      [field]: value
    }));
    // Auto clear saved indicator after 2 seconds
    if (value) {
      setTimeout(() => {
        setIsSaved(prev => ({
          ...prev,
          [field]: false
        }));
      }, 2000);
    }
  };
  return <ServiceFormContext.Provider value={{
    formData,
    updateFormData,
    currentStep,
    setCurrentStep,
    isSaved,
    setSaved
  }}>
      {children}
    </ServiceFormContext.Provider>;
};