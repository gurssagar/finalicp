import React, { useState, createContext, useContext, ReactNode, useEffect } from 'react';
import axios from 'axios';
import { useCreateService } from '@/hooks/useServices';
import { useCreatePackage } from '@/hooks/usePackages';
import { uploadImageToTebi, uploadMultipleImagesToTebi, UploadResult } from '@/lib/tebi-s3-upload';

const STORAGE_KEY = 'service_form_data';
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
  clientQuestions: Array<{
    id: string;
    type: string;
    question: string;
    required: boolean;
  }>;
  faqs: Array<{
    id: string;
    question: string;
    answer: string;
  }>;
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
  submitService: (userId: string) => Promise<{ success: boolean; serviceId?: string; error?: string }>;
  isSubmitting: boolean;
  uploadCoverImage: (file: File) => Promise<UploadResult>;
  uploadPortfolioImages: (files: File[]) => Promise<UploadResult[]>;
  uploadingImages: boolean;
  createdServiceId: string | null;
  submissionError: string | null;
  clearFormData: () => void;
  resetForm: () => void;
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
  clientQuestions: [],
  faqs: []
};
export const ServiceFormContext = createContext<ServiceFormContextType>({
  formData: defaultFormData,
  updateFormData: () => {},
  currentStep: 0,
  setCurrentStep: () => {},
  isSaved: {},
  setSaved: () => {},
  submitService: async () => ({ success: false, error: 'Context not initialized' }),
  isSubmitting: false,
  uploadCoverImage: async () => ({ success: false, error: 'Not initialized' }),
  uploadPortfolioImages: async () => [],
  uploadingImages: false,
  createdServiceId: null,
  submissionError: null,
  clearFormData: () => {},
  resetForm: () => {}
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
// Load data from localStorage
const loadFromStorage = (): ServiceFormData => {
  if (typeof window === 'undefined') return defaultFormData;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...defaultFormData, ...parsed };
    }
  } catch (error) {
    console.error('Error loading form data from localStorage:', error);
  }
  return defaultFormData;
};

// Save data to localStorage
const saveToStorage = (data: ServiceFormData) => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving form data to localStorage:', error);
  }
};

// Clear data from localStorage
const clearStorage = () => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing form data from localStorage:', error);
  }
};

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [createdServiceId, setCreatedServiceId] = useState<string | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const { createService } = useCreateService();
  const { createPackage } = useCreatePackage();

  // Load data from localStorage on mount
  useEffect(() => {
    const loadedData = loadFromStorage();
    setFormData(loadedData);
  }, []);

  // Save to localStorage whenever formData changes
  useEffect(() => {
    saveToStorage(formData);
  }, [formData]);

  const updateFormData = (data: Partial<ServiceFormData>) => {
    setFormData(prev => ({
      ...prev,
      ...data
    }));
  };

  const clearFormData = () => {
    setFormData(defaultFormData);
    clearStorage();
    setCreatedServiceId(null);
    setSubmissionError(null);
  };

  const resetForm = () => {
    clearFormData();
    setCurrentStep(0);
    setIsSaved({});
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

  const uploadCoverImage = async (file: File): Promise<UploadResult> => {
    setUploadingImages(true);
    try {
      const result = await uploadImageToTebi(file, 'cover-images');
      if (result.success && result.url) {
        updateFormData({ coverImage: result.url });
        setSaved('coverImage', true);
      }
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    } finally {
      setUploadingImages(false);
    }
  };

  const uploadPortfolioImages = async (files: File[]): Promise<UploadResult[]> => {
    console.log('ServiceFormContext: Starting portfolio image upload...', { filesCount: files.length });
    setUploadingImages(true);
    try {
      const results = await uploadMultipleImagesToTebi(files, 'portfolio');
      console.log('ServiceFormContext: Upload results received:', results);
      
      const successfulUploads = results.filter(r => r.success && r.url);
      const uploadedUrls = successfulUploads.map(r => r.url!);
      console.log('ServiceFormContext: Successful uploads:', uploadedUrls);

      if (uploadedUrls.length > 0) {
        updateFormData({
          portfolioImages: [...formData.portfolioImages, ...uploadedUrls]
        });
        setSaved('portfolioImages', true);
        console.log('ServiceFormContext: Updated form data with new images');
      }

      return results;
    } catch (error) {
      console.error('ServiceFormContext: Upload error:', error);
      return [{
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      }];
    } finally {
      setUploadingImages(false);
    }
  };

  const submitService = async (userId: string) => {
    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      // Validate required fields
      if (!formData.serviceTitle || !formData.mainCategory) {
        const error = 'Service title and category are required';
        setSubmissionError(error);
        return { success: false, error };
      }

      if (!formData.basicTitle || !formData.basicPrice) {
        const error = 'Package title and price are required';
        setSubmissionError(error);
        return { success: false, error };
      }

      // Create service using marketplace canister
      const serviceData = {
        title: formData.serviceTitle,
        main_category: formData.mainCategory,
        sub_category: formData.subCategory || 'General',
        description: formData.description || 'Professional service offering',
        whats_included: formData.whatsIncluded || 'Quality service delivery',
        cover_image_url: formData.coverImage || '',
        portfolio_images: formData.portfolioImages,
        faqs: formData.faqs,
        client_questions: formData.clientQuestions,
        status: 'Active'
      };

      const serviceResult = await createService(userId, serviceData);

      if (!serviceResult.success) {
        const error = serviceResult.error || 'Failed to create service';
        setSubmissionError(error);
        return { success: false, error };
      }

      const serviceId = serviceResult.data?.service_id;
      if (!serviceId) {
        const error = 'Service created but no ID returned';
        setSubmissionError(error);
        return { success: false, error };
      }

      // Create packages based on tier mode using marketplace canister
      const packages = [];

      if (formData.tierMode === '3tier') {
        // Create Basic package
        if (formData.basicTitle && formData.basicPrice) {
          const basicPackage = await createPackage(userId, {
            service_id: serviceId,
            tier: 'Basic',
            title: formData.basicTitle,
            description: formData.basicDescription || 'Basic package service',
            price_e8s: Math.round(parseFloat(formData.basicPrice) * 100000000), // Convert ICP to e8s
            delivery_days: parseInt(formData.basicDeliveryDays) || 1,
            features: [],
            revisions_included: 1,
            status: 'Available'
          });
          if (basicPackage.success) packages.push(basicPackage.data);
        }

        // Create Advanced package
        if (formData.advancedTitle && formData.advancedPrice) {
          const advancedPackage = await createPackage(userId, {
            service_id: serviceId,
            tier: 'Advanced',
            title: formData.advancedTitle,
            description: formData.advancedDescription || 'Advanced package service',
            price_e8s: Math.round(parseFloat(formData.advancedPrice) * 100000000),
            delivery_days: parseInt(formData.advancedDeliveryDays) || 3,
            features: [],
            revisions_included: 2,
            status: 'Available'
          });
          if (advancedPackage.success) packages.push(advancedPackage.data);
        }

        // Create Premium package
        if (formData.premiumTitle && formData.premiumPrice) {
          const premiumPackage = await createPackage(userId, {
            service_id: serviceId,
            tier: 'Premium',
            title: formData.premiumTitle,
            description: formData.premiumDescription || 'Premium package service',
            price_e8s: Math.round(parseFloat(formData.premiumPrice) * 100000000),
            delivery_days: parseInt(formData.premiumDeliveryDays) || 7,
            features: [],
            revisions_included: 3,
            status: 'Available'
          });
          if (premiumPackage.success) packages.push(premiumPackage.data);
        }
      } else {
        // Single tier - create one package
        const singlePackage = await createPackage(userId, {
          service_id: serviceId,
          tier: 'Basic',
          title: formData.basicTitle || 'Service Package',
          description: formData.basicDescription || 'Professional service offering',
          price_e8s: Math.round(parseFloat(formData.basicPrice) * 100000000),
          delivery_days: parseInt(formData.basicDeliveryDays) || 1,
          features: [],
          revisions_included: 1,
          status: 'Available'
        });
        if (singlePackage.success) packages.push(singlePackage.data);
      }

      // Store the created service ID
      setCreatedServiceId(serviceId);

      // Clear form data after successful submission
      // We'll do this in the UI after navigation to avoid losing the serviceId
      
      return {
        success: true,
        serviceId,
        packages: packages.length
      };

    } catch (error) {
      console.error('Error submitting service:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setSubmissionError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsSubmitting(false);
    }
  };

  return <ServiceFormContext.Provider value={{
    formData,
    updateFormData,
    currentStep,
    setCurrentStep,
    isSaved,
    setSaved,
    submitService,
    isSubmitting,
    uploadCoverImage,
    uploadPortfolioImages,
    uploadingImages,
    createdServiceId,
    submissionError,
    clearFormData,
    resetForm
  }}>
      {children}
    </ServiceFormContext.Provider>;
};