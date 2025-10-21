'use client'    
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useServiceForm } from '@/context/ServiceFormContext';
import { ArrowLeft, ChevronLeft, ChevronRight, Check } from 'lucide-react';
export default function ServicePreview() {
  const navigate = useRouter();
  const {
    formData
  } = useServiceForm();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  // Get all images for the carousel
  const allImages = formData.coverImage ? [formData.coverImage, ...formData.portfolioImages] : formData.portfolioImages;
  const handleGoBack = () => {
    navigate.push('/freelancer/update-service/[id]/[tab]');
  };
  const handlePublish = () => {
    // In a real app, you would submit the service data to the server
    navigate.push('/clientorfreelancer');
  };
  const goToPreviousImage = () => {
    setCurrentImageIndex(prev => prev === 0 ? allImages.length - 1 : prev - 1);
  };
  const goToNextImage = () => {
    setCurrentImageIndex(prev => prev === allImages.length - 1 ? 0 : prev + 1);
  };
  const selectImage = (index: number) => {
    setCurrentImageIndex(index);
  };
  return <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 py-4 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <svg width="40" height="32" viewBox="0 0 40 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20.0001 0L0 11.5556V23.1111L20.0001 11.5556L40.0001 23.1111V11.5556L20.0001 0Z" fill="#FF3B30" />
              <path d="M0 23.1111L20.0001 11.5555V23.1111V34.6667L0 23.1111Z" fill="#34C759" />
              <path d="M40.0001 23.1111L20.0001 11.5555V23.1111V34.6667L40.0001 23.1111Z" fill="#007AFF" />
            </svg>
            <span className="ml-2 font-bold text-xl">ICPWork</span>
          </div>
          <div className="flex gap-4">
            <button onClick={handleGoBack} className="flex items-center text-gray-700 hover:text-black">
              <ArrowLeft size={16} className="mr-1" />
              <span>Go Back And Edit</span>
            </button>
            <button onClick={handlePublish} className="bg-[#0F1E36] text-white px-4 py-2 rounded-lg hover:bg-[#1a3a5f]">
              Publish
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-center mb-8">Preview Page</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            {/* Image Carousel */}
            <div className="mb-8 relative">
              <div className="relative overflow-hidden rounded-lg border border-gray-200">
                {allImages.length > 0 ? <img src={allImages[currentImageIndex]} alt="Service Preview" className="w-full h-auto" /> : <div className="h-64 bg-gray-100 flex items-center justify-center">
                    <p className="text-gray-500">No images available</p>
                  </div>}
                {/* Navigation arrows */}
                {allImages.length > 1 && <>
                    <button onClick={goToPreviousImage} className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100">
                      <ChevronLeft size={20} />
                    </button>
                    <button onClick={goToNextImage} className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100">
                      <ChevronRight size={20} />
                    </button>
                  </>}
              </div>
              {/* Thumbnail navigation */}
              {allImages.length > 1 && <div className="flex justify-center mt-4 space-x-2 overflow-x-auto">
                  {allImages.map((image, index) => <div key={index} onClick={() => selectImage(index)} className={`w-16 h-16 rounded-md overflow-hidden cursor-pointer border-2 ${index === currentImageIndex ? 'border-blue-500' : 'border-transparent'}`}>
                      <img src={image} alt={`Thumbnail ${index}`} className="w-full h-full object-cover" />
                    </div>)}
                </div>}
            </div>
            {/* Description */}
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4">Description</h2>
              <p className="text-gray-700 mb-4">
                3000+ Projects completed on upwork with client satisfaction.I us
                ui/ux designer-ui web design-ux web design-website ui ux design
                -ui ux web designer-mobile ui ux designer-mobile app ui ux
                designer-user experience-figma -adobe xd-psd design-graphic
                designer.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Modern</li>
                <li>Eye-Catching & elegant designs</li>
                <li>Premium & responsive designs</li>
                <li>user-friendly interface</li>
                <li>
                  Custom Designs, Professional Fonts-Mockup in Figma, Adobe XD,
                  PSD Designs
                </li>
                <li>
                  Layered PSD or AI File-Editable Source file with all the
                  Assets
                </li>
                <li>Guaranteed satisfaction & lifetime support</li>
              </ul>
              <p className="mt-4 text-gray-700">
                I have expertise in designing User Interfaces for websites, web
                apps, and mobile devices. I've worked on designs for both iOS
                and Android.
              </p>
              <p className="mt-4 text-gray-700">
                Designing creative Custom, Modern, and Responsive websites, Blog
                & Magazine, Education, Non-profit, Real Estate, Wedding.
              </p>
            </div>
          </div>
          <div className="md:col-span-1">
            <h2 className="text-xl font-bold mb-4">
              Choose What's Best for you!!
            </h2>
            {/* Basic Package */}
            <div className="mb-6 border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 p-3 border-b border-gray-200">
                <h3 className="font-bold">BASIC</h3>
              </div>
              <div className="p-4">
                <p className="font-medium mb-2">
                  {formData.basicTitle || 'Website ui, figma website design'}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  {formData.basicDescription || '3000+ projects completed on upwork with client satisfaction'}
                </p>
                <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
                  <span>No Of Days</span>
                  <span>{formData.basicDeliveryDays || '7'}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
                  <span>Revisions</span>
                  <span>Unlimited</span>
                </div>
                <div className="text-right mt-4">
                  <p className="text-sm text-gray-500">Starting From</p>
                  <p className="font-bold text-lg">
                    ${formData.basicPrice || '49'}
                  </p>
                </div>
              </div>
            </div>
            {/* Standard Package */}
            <div className="mb-6 border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 p-3 border-b border-gray-200">
                <h3 className="font-bold">STANDARD</h3>
              </div>
              <div className="p-4">
                <p className="font-medium mb-2">
                  {formData.advancedTitle || 'Website ui, figma website design'}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  {formData.advancedDescription || '3000+ projects completed on upwork with client satisfaction'}
                </p>
                <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
                  <span>No Of Days</span>
                  <span>{formData.advancedDeliveryDays || '7'}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
                  <span>Revisions</span>
                  <span>Unlimited</span>
                </div>
                <div className="text-right mt-4">
                  <p className="text-sm text-gray-500">Starting From</p>
                  <p className="font-bold text-lg">
                    ${formData.advancedPrice || '89'}
                  </p>
                </div>
              </div>
            </div>
            {/* Premium Package */}
            <div className="mb-6 border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 p-3 border-b border-gray-200">
                <h3 className="font-bold">PREMIUM</h3>
              </div>
              <div className="p-4">
                <p className="font-medium mb-2">
                  {formData.premiumTitle || 'Website ui, figma website design'}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  {formData.premiumDescription || '3000+ projects completed on upwork with client satisfaction'}
                </p>
                <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
                  <span>No Of Days</span>
                  <span>{formData.premiumDeliveryDays || '7'}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
                  <span>Revisions</span>
                  <span>Unlimited</span>
                </div>
                <div className="text-right mt-4">
                  <p className="text-sm text-gray-500">Starting From</p>
                  <p className="font-bold text-lg">
                    ${formData.premiumPrice || '129'}
                  </p>
                </div>
              </div>
            </div>
            {/* Package Comparison */}
            <div>
              <h3 className="font-bold mb-4">Features include:</h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <Check size={16} className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>50 Placeholder text commonly</span>
                </div>
                <div className="flex items-start">
                  <Check size={16} className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Consectetur adipiscing elit</span>
                </div>
                <div className="flex items-start">
                  <Check size={16} className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Excepteur sint occaecat cupidatat</span>
                </div>
                <div className="flex items-start">
                  <Check size={16} className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Officia deserunt mollit anim</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-xl font-bold mb-4">Basic</h3>
            <div className="mb-2">
              <span className="text-3xl font-bold">
                ${formData.basicPrice || '49'}
              </span>
              <span className="text-gray-500">/mo</span>
            </div>
            <p className="text-gray-700 mb-4">
              Better insights for growing businesses that want more customers.
            </p>
            <h4 className="font-bold mb-2">Features include:</h4>
            <ul className="space-y-2">
              <li className="flex items-start">
                <Check size={16} className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                <span>50 Placeholder text commonly</span>
              </li>
              <li className="flex items-start">
                <Check size={16} className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                <span>Consectetur adipiscing elit</span>
              </li>
              <li className="flex items-start">
                <Check size={16} className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                <span>Excepteur sint occaecat cupidatat</span>
              </li>
              <li className="flex items-start">
                <Check size={16} className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                <span>Officia deserunt mollit anim</span>
              </li>
            </ul>
            <button className="w-full mt-6 py-2 bg-[#0F1E36] text-white rounded-lg hover:bg-[#1a3a5f]">
              Buy Plan
            </button>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Standard</h3>
            <div className="mb-2">
              <span className="text-3xl font-bold">
                ${formData.advancedPrice || '79'}
              </span>
              <span className="text-gray-500">/mo</span>
            </div>
            <p className="text-gray-700 mb-4">
              Better insights for growing businesses that want more customers.
            </p>
            <h4 className="font-bold mb-2">Features include:</h4>
            <ul className="space-y-2">
              <li className="flex items-start">
                <Check size={16} className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                <span>50 Placeholder text commonly</span>
              </li>
              <li className="flex items-start">
                <Check size={16} className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                <span>Consectetur adipiscing elit</span>
              </li>
              <li className="flex items-start">
                <Check size={16} className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                <span>Excepteur sint occaecat cupidatat</span>
              </li>
              <li className="flex items-start">
                <Check size={16} className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                <span>Officia deserunt mollit anim</span>
              </li>
              <li className="flex items-start">
                <Check size={16} className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                <span>Placeholder text commonly used</span>
              </li>
            </ul>
            <button className="w-full mt-6 py-2 bg-[#0F1E36] text-white rounded-lg hover:bg-[#1a3a5f]">
              Buy Plan
            </button>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Premium</h3>
            <div className="mb-2">
              <span className="text-3xl font-bold">
                ${formData.premiumPrice || '129'}
              </span>
              <span className="text-gray-500">/mo</span>
            </div>
            <p className="text-gray-700 mb-4">
              Better insights for growing businesses that want more customers.
            </p>
            <h4 className="font-bold mb-2">Features include:</h4>
            <ul className="space-y-2">
              <li className="flex items-start">
                <Check size={16} className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                <span>50 Placeholder text commonly</span>
              </li>
              <li className="flex items-start">
                <Check size={16} className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                <span>Consectetur adipiscing elit</span>
              </li>
              <li className="flex items-start">
                <Check size={16} className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                <span>Excepteur sint occaecat cupidatat</span>
              </li>
              <li className="flex items-start">
                <Check size={16} className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                <span>Officia deserunt mollit anim</span>
              </li>
              <li className="flex items-start">
                <Check size={16} className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                <span>Voluptate velit esse cillum</span>
              </li>
              <li className="flex items-start">
                <Check size={16} className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                <span>Consectetur adipiscing elit sed</span>
              </li>
            </ul>
            <button className="w-full mt-6 py-2 bg-[#0F1E36] text-white rounded-lg hover:bg-[#1a3a5f]">
              Buy Plan
            </button>
          </div>
        </div>
      </main>
    </div>;
}