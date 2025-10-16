'use client'    
import React, { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Save, Eye, X } from 'lucide-react'
import { ServiceNavigation } from '@/components/ServiceNavigation'
import { ServiceTierCard } from '@/components/ServiceTierCard'
import { useServiceForm } from '@/context/ServiceFormContext'
// Demo service data
const demoServiceData = {
  id: '123',
  serviceTitle: 'I will design modern UI/UX for your website or mobile app',
  mainCategory: 'Web Designer',
  subCategory: 'UI/UX Design',
  description:
    'Professional UI/UX design services with a focus on user-centered design principles. I create intuitive and visually appealing interfaces that enhance user experience and drive engagement.',
  whatsIncluded:
    'Wireframes, mockups, prototypes, and final design files in Figma or Adobe XD.',
  tierMode: '3tier' as const,
  basicTitle: 'Basic UI Design',
  basicDescription:
    'Get a clean, modern UI design for your website or app with basic interactions and up to 3 screens.',
  basicDeliveryDays: '3',
  basicPrice: '99',
  advancedTitle: 'Standard UI/UX Design',
  advancedDescription:
    'Complete UI/UX design with user flows, wireframes, and up to 5 screens with interactive prototypes.',
  advancedDeliveryDays: '5',
  advancedPrice: '199',
  premiumTitle: 'Premium UI/UX Design',
  premiumDescription:
    'Comprehensive UI/UX design package with user research, detailed flows, wireframes, and up to 10 screens with advanced interactions.',
  premiumDeliveryDays: '10',
  premiumPrice: '349',
  coverImage:
    'https://uploadthingy.s3.us-west-1.amazonaws.com/eNyRxVLVobM83YpzCrHjfv/Freelancer_Dashbioard-1.png',
  portfolioImages: [
    'https://uploadthingy.s3.us-west-1.amazonaws.com/kZfeCnW7QuCmCVUkX2pPwh/Organaise_Freelancer_Onboarding_-_24.png',
    'https://uploadthingy.s3.us-west-1.amazonaws.com/qp3tESwnTVaoBnfmEwow3E/Organaise_Freelancer_Onboarding_-_23.png',
    'https://uploadthingy.s3.us-west-1.amazonaws.com/ss8cKCzaCgwtXzPN1kWDWy/Freelancer_Dashbioard.png',
  ],
  clientQuestions: [
    'What is the primary goal of your website/app?',
    'Who is your target audience?',
  ],
}
export default function UpdateService() {
  const navigate = useRouter()
  const { id, tab = 'overview' } = useParams<{
    id: string
    tab?: string
  }>()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const { formData, updateFormData, setSaved } = useServiceForm()
  const [newQuestion, setNewQuestion] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Get current user data
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        const data = await response.json()

        if (data.success && data.session) {
          setUserId(data.session.userId)
        } else {
          setUserId(null)
          setError('Please log in to update services')
          setIsLoading(false)
        }
      } catch (error) {
        console.error('Error checking authentication:', error)
        setUserId(null)
        setError('Failed to authenticate')
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  // Fetch service data from API
  useEffect(() => {
    if (!userId || !id) return

    const fetchServiceData = async () => {
      try {
        const response = await fetch(`/api/marketplace/services/${id}`)
        const data = await response.json()

        if (data.success && data.data) {
          const service = data.data

          // Transform API data to form format
          const transformedData = {
            id: service.service_id,
            serviceTitle: service.title,
            mainCategory: service.main_category,
            subCategory: service.sub_category,
            description: service.description,
            whatsIncluded: service.whats_included,
            coverImage: service.cover_image_url || '/default-service.svg',
            portfolioImages: service.portfolio_images || [],
            tierMode: '3tier' as const,
            basicTitle: 'Basic Package',
            basicDescription: service.whats_included,
            basicDeliveryDays: '3',
            basicPrice: '99',
            advancedTitle: 'Standard Package',
            advancedDescription: 'Enhanced service with additional features',
            advancedDeliveryDays: '5',
            advancedPrice: '199',
            premiumTitle: 'Premium Package',
            premiumDescription: 'Complete service with all features and priority support',
            premiumDeliveryDays: '7',
            premiumPrice: '349',
            clientQuestions: [
              { id: '1', type: 'text', question: 'What is the primary goal of your project?', required: true },
              { id: '2', type: 'text', question: 'Do you have any specific requirements or preferences?', required: false },
            ],
            faqs: []
          }

          updateFormData(transformedData)
        } else {
          setError(data.error || 'Failed to load service data')
        }
      } catch (error) {
        console.error('Error fetching service data:', error)
        setError('Failed to load service data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchServiceData()
  }, [id, userId, updateFormData])
  const handleBack = () => {
    navigate.push('/freelancer/my-services')
  }
  const handlePreview = () => {
    navigate.push(`/freelancer/update-service/${id}/service-preview`)
  }
  const handleSave = async () => {
    if (!userId || !id) {
      setError('User authentication required')
      return
    }

    try {
      // Transform form data to API format
      const serviceUpdates = {
        title: formData.serviceTitle,
        main_category: formData.mainCategory,
        sub_category: formData.subCategory,
        description: formData.description,
        whats_included: formData.whatsIncluded,
        cover_image_url: formData.coverImage,
        portfolio_images: formData.portfolioImages,
        status: 'Active'
      }

      const response = await fetch(`/api/marketplace/services/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          updates: serviceUpdates
        })
      })

      const result = await response.json()

      if (result.success) {
        setSuccessMessage('Changes saved successfully!')
        setTimeout(() => setSuccessMessage(null), 3000)
      } else {
        setError(result.error || 'Failed to save changes')
      }
    } catch (error) {
      console.error('Error saving service:', error)
      setError('Failed to save changes. Please try again.')
    }
  }
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target
    updateFormData({
      [name]: value,
    })
    setSaved(name, true)
  }
  const handleAddQuestion = () => {
    if (newQuestion.trim()) {
      const updatedQuestions = [
        ...(formData.clientQuestions || []),
        {
          id: Date.now().toString(),
          type: 'text',
          question: newQuestion.trim(),
          required: false
        },
      ]
      updateFormData({
        clientQuestions: updatedQuestions,
      })
      setSaved('clientQuestions', true)
      setNewQuestion('')
    }
  }
  const handleRemoveQuestion = (index: number) => {
    const updatedQuestions = [...(formData.clientQuestions || [])]
    updatedQuestions.splice(index, 1)
    updateFormData({
      clientQuestions: updatedQuestions,
    })
    setSaved('clientQuestions', true)
  }
  const handleAddImage = () => {
    if (imageUrl.trim()) {
      const updatedImages = [
        ...(formData.portfolioImages || []),
        imageUrl.trim(),
      ]
      updateFormData({
        portfolioImages: updatedImages,
      })
      setSaved('portfolioImages', true)
      setImageUrl('')
    }
  }
  const handleRemoveImage = (index: number) => {
    const updatedImages = [...(formData.portfolioImages || [])]
    updatedImages.splice(index, 1)
    updateFormData({
      portfolioImages: updatedImages,
    })
    setSaved('portfolioImages', true)
  }
  const handleSetCoverImage = (url: string) => {
    updateFormData({
      coverImage: url,
    })
    setSaved('coverImage', true)
  }
  // Render loading state
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <header className="flex justify-between items-center p-4 border-b border-gray-200">
          <div className="flex items-center">
            <svg
              width="40"
              height="32"
              viewBox="0 0 40 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20.0001 0L0 11.5556V23.1111L20.0001 11.5556L40.0001 23.1111V11.5556L20.0001 0Z"
                fill="#FF3B30"
              />
              <path
                d="M0 23.1111L20.0001 11.5555V23.1111V34.6667L0 23.1111Z"
                fill="#34C759"
              />
              <path
                d="M40.0001 23.1111L20.0001 11.5555V23.1111V34.6667L40.0001 23.1111Z"
                fill="#007AFF"
              />
            </svg>
            <span className="ml-2 font-bold text-xl text-[#161616]">
              ICPWork
            </span>
          </div>
          <button
            onClick={handleBack}
            className="px-8 py-2 rounded-full border border-gray-300 text-gray-800 hover:bg-gray-50"
          >
            Back
          </button>
        </header>
        <main className="flex-1 container mx-auto py-6 px-4 max-w-5xl">
          <div className="mb-6">
            <button
              onClick={handleBack}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft size={18} className="mr-1" />
              <span>Back to My Services</span>
            </button>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h1 className="text-2xl font-bold text-[#161616]">
                Update Your Service
              </h1>
              <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                Service ID: #{id}
              </div>
            </div>
          </div>
          <div className="flex justify-center items-center h-[60vh]">
            <div className="animate-pulse flex flex-col items-center">
              <div className="w-16 h-16 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin mb-6"></div>
              <p className="text-lg text-gray-600 mb-2">
                Loading service data...
              </p>
              <p className="text-sm text-gray-500">
                Please wait while we retrieve your service information
              </p>
            </div>
          </div>
        </main>
      </div>
    )
  }
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <header className="flex justify-between items-center p-4 border-b border-gray-200">
        <div className="flex items-center">
          <svg
            width="40"
            height="32"
            viewBox="0 0 40 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M20.0001 0L0 11.5556V23.1111L20.0001 11.5556L40.0001 23.1111V11.5556L20.0001 0Z"
              fill="#FF3B30"
            />
            <path
              d="M0 23.1111L20.0001 11.5555V23.1111V34.6667L0 23.1111Z"
              fill="#34C759"
            />
            <path
              d="M40.0001 23.1111L20.0001 11.5555V23.1111V34.6667L40.0001 23.1111Z"
              fill="#007AFF"
            />
          </svg>
          <span className="ml-2 font-bold text-xl text-[#161616]">ICPWork</span>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handlePreview}
            className="hidden md:flex items-center px-4 py-2 rounded-full border border-gray-300 text-gray-800 hover:bg-gray-50"
          >
            <Eye size={16} className="mr-1" />
            <span>Preview</span>
          </button>
          <button
            onClick={handleSave}
            className="flex items-center px-4 md:px-8 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700"
          >
            <Save size={16} className="mr-1" />
            <span>Save</span>
          </button>
          <button
            onClick={handleBack}
            className="px-4 md:px-8 py-2 rounded-full border border-gray-300 text-gray-800 hover:bg-gray-50"
          >
            Back
          </button>
        </div>
      </header>
      <main className="flex-1 container mx-auto py-6 px-4 max-w-5xl">
        <div className="mb-6">
          <button
            onClick={handleBack}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={18} className="mr-1" />
            <span>Back to My Services</span>
          </button>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h1 className="text-2xl font-bold text-[#161616]">
              Update Your Service
            </h1>
            <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
              Service ID: #{id}
            </div>
          </div>
        </div>
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex justify-between items-center">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              {successMessage}
            </div>
            <button
              onClick={() => setSuccessMessage(null)}
              className="text-green-700"
            >
              <X size={18} />
            </button>
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex justify-between items-center">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              {error}
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-700"
            >
              <X size={18} />
            </button>
          </div>
        )}
        <ServiceNavigation activeTab={tab as any} />
        <div className="mt-6">
          {tab === 'overview' && (
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="serviceTitle"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Service Title
                </label>
                <input
                  type="text"
                  id="serviceTitle"
                  name="serviceTitle"
                  value={formData.serviceTitle || ''}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter a catchy title for your service"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="mainCategory"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Main Category
                  </label>
                  <select
                    id="mainCategory"
                    name="mainCategory"
                    value={formData.mainCategory || ''}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Category</option>
                    <option value="Web Designer">Web Designer</option>
                    <option value="Mobile Developer">Mobile Developer</option>
                    <option value="UI/UX Designer">UI/UX Designer</option>
                    <option value="Graphic Designer">Graphic Designer</option>
                    <option value="Content Writer">Content Writer</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="subCategory"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Sub Category
                  </label>
                  <select
                    id="subCategory"
                    name="subCategory"
                    value={formData.subCategory || ''}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Sub-Category</option>
                    <option value="UI/UX Design">UI/UX Design</option>
                    <option value="Website Design">Website Design</option>
                    <option value="Landing Page">Landing Page</option>
                    <option value="Wireframing">Wireframing</option>
                    <option value="Prototyping">Prototyping</option>
                  </select>
                </div>
              </div>
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description || ''}
                  onChange={handleInputChange}
                  rows={6}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 resize-none"
                  placeholder="Describe your service in detail"
                ></textarea>
              </div>
              <div>
                <label
                  htmlFor="whatsIncluded"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  What's Included
                </label>
                <textarea
                  id="whatsIncluded"
                  name="whatsIncluded"
                  value={formData.whatsIncluded || ''}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 resize-none"
                  placeholder="List what's included in your service"
                ></textarea>
              </div>
            </div>
          )}
          {tab === 'projects' && (
            <div>
              <div className="mb-6">
                <h2 className="text-lg font-medium mb-4">Service Tier Mode</h2>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="tierMode"
                      value="1tier"
                      checked={formData.tierMode === '1tier'}
                      onChange={() => {
                        updateFormData({
                          tierMode: '1tier',
                        })
                        setSaved('tierMode', true)
                      }}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span>Single Tier</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="tierMode"
                      value="3tier"
                      checked={formData.tierMode === '3tier'}
                      onChange={() => {
                        updateFormData({
                          tierMode: '3tier',
                        })
                        setSaved('tierMode', true)
                      }}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span>Three Tiers</span>
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ServiceTierCard
                  title="Basic"
                  color="bg-gray-100 text-gray-800"
                  tier="basic"
                />
                {formData.tierMode === '3tier' && (
                  <>
                    <ServiceTierCard
                      title="Advanced"
                      color="bg-blue-100 text-blue-800"
                      tier="advanced"
                    />
                    <ServiceTierCard
                      title="Premium"
                      color="bg-purple-100 text-purple-800"
                      tier="premium"
                    />
                  </>
                )}
              </div>
            </div>
          )}
          {tab === 'pricing' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-medium mb-4">Set Your Pricing</h2>
                <p className="text-gray-600 mb-6">
                  Define the pricing for each tier of your service.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label
                      htmlFor="basicPrice"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Basic Price ($)
                    </label>
                    <input
                      type="number"
                      id="basicPrice"
                      name="basicPrice"
                      value={formData.basicPrice || ''}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g. 50"
                    />
                  </div>
                  {formData.tierMode === '3tier' && (
                    <>
                      <div>
                        <label
                          htmlFor="advancedPrice"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Advanced Price ($)
                        </label>
                        <input
                          type="number"
                          id="advancedPrice"
                          name="advancedPrice"
                          value={formData.advancedPrice || ''}
                          onChange={handleInputChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                          placeholder="e.g. 100"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="premiumPrice"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Premium Price ($)
                        </label>
                        <input
                          type="number"
                          id="premiumPrice"
                          name="premiumPrice"
                          value={formData.premiumPrice || ''}
                          onChange={handleInputChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                          placeholder="e.g. 200"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <h3 className="text-blue-800 font-medium mb-2">Pricing Tips</h3>
                <ul className="list-disc pl-5 text-blue-700 space-y-1">
                  <li>Research competitor pricing for similar services</li>
                  <li>Consider your experience level and expertise</li>
                  <li>Factor in the time it will take to complete the work</li>
                  <li>Add a premium for rush jobs or specialized skills</li>
                </ul>
              </div>
            </div>
          )}
          {tab === 'portfolio' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-medium mb-2">Cover Image</h2>
                <p className="text-gray-600 mb-4">
                  This is the main image that will be shown for your service.
                </p>
                <div className="mb-4">
                  {formData.coverImage ? (
                    <div className="relative">
                      <img
                        src={formData.coverImage}
                        alt="Cover"
                        className="w-full h-64 object-cover rounded-lg"
                      />
                      <button
                        onClick={() =>
                          updateFormData({
                            coverImage: '',
                          })
                        }
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <p className="text-gray-500">No cover image set</p>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter image URL"
                  />
                  <button
                    onClick={() => {
                      if (imageUrl.trim()) {
                        updateFormData({
                          coverImage: imageUrl.trim(),
                        })
                        setSaved('coverImage', true)
                        setImageUrl('')
                      }
                    }}
                    className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Set Cover
                  </button>
                </div>
              </div>
              <div>
                <h2 className="text-lg font-medium mb-2">Portfolio Images</h2>
                <p className="text-gray-600 mb-4">
                  Add additional images to showcase your work.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  {formData.portfolioImages?.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Portfolio ${index + 1}`}
                        className="w-full h-40 object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2 rounded-lg">
                        <button
                          onClick={() => handleSetCoverImage(image)}
                          className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
                          title="Set as cover"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                            <polyline points="16 6 12 2 8 6"></polyline>
                            <line x1="12" y1="2" x2="12" y2="15"></line>
                          </svg>
                        </button>
                        <button
                          onClick={() => handleRemoveImage(index)}
                          className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                          title="Remove"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {(!formData.portfolioImages ||
                    formData.portfolioImages.length === 0) && (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center col-span-full">
                      <p className="text-gray-500">No portfolio images added</p>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter image URL"
                  />
                  <button
                    onClick={handleAddImage}
                    className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add Image
                  </button>
                </div>
              </div>
            </div>
          )}
          {tab === 'others' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-medium mb-2">Client Questions</h2>
                <p className="text-gray-600 mb-4">
                  Add questions that clients should answer when ordering your
                  service.
                </p>
                <div className="space-y-3 mb-4">
                  {formData.clientQuestions?.map((question: any, index: number) => (
                    <div
                      key={question.id || index}
                      className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                    >
                      <span>{question.question}</span>
                      <button
                        onClick={() => handleRemoveQuestion(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ))}
                  {(!formData.clientQuestions ||
                    formData.clientQuestions.length === 0) && (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <p className="text-gray-500">No questions added</p>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter a question for your clients"
                  />
                  <button
                    onClick={handleAddQuestion}
                    className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add Question
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="mt-8 flex justify-between">
          <button
            onClick={handleBack}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <div className="flex space-x-3">
            <button
              onClick={handlePreview}
              className="px-6 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50"
            >
              Preview
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
