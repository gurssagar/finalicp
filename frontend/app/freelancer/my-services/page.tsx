'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit, Trash2, Eye, Plus, MoreHorizontal } from 'lucide-react'
export default function MyServices() {
  const navigate = useRouter()
  const [services, setServices] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  useEffect(() => {
    // In a real app, you would fetch the user's services from an API
    const fetchServices = async () => {
      setIsLoading(true)
      try {
        // Simulate API call with setTimeout
        await new Promise((resolve) => setTimeout(resolve, 800))
        // Mock data
        const mockServices = [
          {
            id: '1',
            title: 'Professional UI/UX Design Service',
            category: 'UI/UX Designer',
            subCategory: 'Web Design',
            price: 99,
            coverImage:
              'https://uploadthingy.s3.us-west-1.amazonaws.com/oLif2vH2YehKcDNd9oQLsk/Freelancer_Dashbioard_-_Add_Your_Services-6.png',
            status: 'active',
            views: 245,
            orders: 12,
            rating: 4.8,
            createdAt: '2023-10-15',
          },
          {
            id: '2',
            title: 'Mobile App Development',
            category: 'Full Stack Developer',
            subCategory: 'Mobile Development',
            price: 299,
            coverImage:
              'https://uploadthingy.s3.us-west-1.amazonaws.com/u9zWd7mJKkhJzBD1YvXaos/Freelancer_Dashbioard_-_Add_Your_Services-13.png',
            status: 'active',
            views: 187,
            orders: 8,
            rating: 4.6,
            createdAt: '2023-11-02',
          },
          {
            id: '3',
            title: 'Logo Design and Branding Package',
            category: 'Graphic Designer',
            subCategory: 'Logo Design',
            price: 149,
            coverImage:
              'https://uploadthingy.s3.us-west-1.amazonaws.com/7UdrtzWkTg7Fs3cVikZCv1/Freelancer_Dashbioard_-_Add_Your_Services-19.png',
            status: 'paused',
            views: 120,
            orders: 5,
            rating: 5.0,
            createdAt: '2023-12-10',
          },
        ]
        setServices(mockServices)
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching services:', error)
        setIsLoading(false)
      }
    }
    fetchServices()
  }, [])
  const handleAddService = () => {
    navigate.push('/freelancer/add-service/overview')
  }
  const handleEditService = (serviceId: string) => {
    navigate.push(`/freelancer/update-service/${serviceId}/overview`)
  }
  const handleViewService = (serviceId: string) => {
    navigate.push(`/service-preview/${serviceId}`)
  }
  const handleDeleteService = (serviceId: string) => {
    if (
      confirm(
        'Are you sure you want to delete this service? This action cannot be undone.',
      )
    ) {
      // In a real app, you would call an API to delete the service
      setServices(services.filter((service) => service.id !== serviceId))
    }
  }
  const handleToggleStatus = (serviceId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active'
    setServices(
      services.map((service) =>
        service.id === serviceId
          ? {
              ...service,
              status: newStatus,
            }
          : service,
      ),
    )
  }
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      
      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Services</h1>
              <p className="text-gray-600">
                Manage and update your service offerings
              </p>
            </div>
            <Button onClick={handleAddService} className="flex items-center">
              <Plus size={18} className="mr-2" />
              Add New Service
            </Button>
          </div>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-pulse flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin mb-4"></div>
                <p className="text-gray-600">Loading your services...</p>
              </div>
            </div>
          ) : services.length === 0 ? (
            <Card className="text-center p-8">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                    <line x1="12" y1="22.08" x2="12" y2="12"></line>
                  </svg>
                </div>
                <h2 className="text-xl font-semibold">No services yet</h2>
                <p className="text-gray-600 max-w-md">
                  You haven't created any services yet. Add your first service
                  to start selling your skills.
                </p>
                <Button onClick={handleAddService} className="mt-2">
                  <Plus size={18} className="mr-2" />
                  Add Your First Service
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {services.map((service) => (
                <Card key={service.id} className="overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    <div className="w-full md:w-1/3 h-48 md:h-auto">
                      <img
                        src={service.coverImage}
                        alt={service.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 p-5">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg mb-1 line-clamp-2">
                            {service.title}
                          </h3>
                          <div className="flex items-center text-sm text-gray-600 mb-2">
                            <span>{service.category}</span>
                            <span className="mx-2">•</span>
                            <span>${service.price}</span>
                          </div>
                          <Badge
                            variant={
                              service.status === 'active'
                                ? 'default'
                                : 'secondary'
                            }
                            className="mb-4"
                          >
                            {service.status === 'active' ? 'Active' : 'Paused'}
                          </Badge>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() =>
                              handleToggleStatus(service.id, service.status)
                            }
                          >
                            {service.status === 'active' ? (
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <rect x="6" y="4" width="4" height="16"></rect>
                                <rect x="14" y="4" width="4" height="16"></rect>
                              </svg>
                            ) : (
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <polygon points="5 3 19 12 5 21 5 3"></polygon>
                              </svg>
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleViewService(service.id)}
                          >
                            <Eye size={16} />
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm mb-4">
                        <div>
                          <p className="text-gray-500">Views</p>
                          <p className="font-medium">{service.views}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Orders</p>
                          <p className="font-medium">{service.orders}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Rating</p>
                          <p className="font-medium flex items-center">
                            {service.rating}
                            <span className="text-yellow-400 ml-1">★</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <div className="text-xs text-gray-500">
                          Created on{' '}
                          {new Date(service.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => handleDeleteService(service.id)}
                          >
                            <Trash2 size={14} className="mr-1" />
                            Delete
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleEditService(service.id)}
                          >
                            <Edit size={14} className="mr-1" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
