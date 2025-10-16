'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/Header'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit, Trash2, Eye, Plus, MoreHorizontal } from 'lucide-react'
import { useServices, useDeleteService, useUpdateService } from '@/hooks/useServices'
import { usePackages } from '@/hooks/usePackages'
export default function MyServices() {
  const navigate = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  // Get current user data from session
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        const data = await response.json()
        
        if (data.success && data.session) {
          setUserId(data.session.userId)
          setUserEmail(data.session.email)
        } else {
          setUserId(null)
          setUserEmail(null)
        }
      } catch (error) {
        console.error('Error checking authentication:', error)
        setUserId(null)
        setUserEmail(null)
      } finally {
        setIsCheckingAuth(false)
      }
    }

    checkAuth()
  }, [])

  // Fetch services using the hook with email filter only when userEmail is available
  const { services: fetchedServices, loading, error, refetch } = useServices(userEmail || undefined, {
    freelancer_email: userEmail || undefined,
    limit: 50
  })

  // Delete and update service hooks
  const { deleteService } = useDeleteService()
  const { updateService } = useUpdateService()

  // Transform services data for UI display
  const transformServiceData = (service: any) => {
    // Robust date handling for different timestamp formats
    let createdDate: string;

    if (!service.created_at) {
      // Fallback to current date for missing timestamps
      createdDate = new Date().toISOString().split('T')[0];
    } else if (typeof service.created_at === 'bigint') {
      // Handle bigint timestamps (nanoseconds since epoch)
      try {
        createdDate = new Date(Number(service.created_at) / 1000000).toISOString().split('T')[0];
      } catch (error) {
        console.warn('Invalid bigint timestamp:', service.created_at, error);
        createdDate = new Date().toISOString().split('T')[0];
      }
    } else if (typeof service.created_at === 'number') {
      // Handle number timestamps (nanoseconds since epoch)
      try {
        createdDate = new Date(service.created_at / 1000000).toISOString().split('T')[0];
      } catch (error) {
        console.warn('Invalid number timestamp:', service.created_at, error);
        createdDate = new Date().toISOString().split('T')[0];
      }
    } else {
      // Handle string timestamps or other formats
      try {
        createdDate = new Date(service.created_at).toISOString().split('T')[0];
      } catch (error) {
        console.warn('Invalid timestamp format:', service.created_at, error);
        createdDate = new Date().toISOString().split('T')[0];
      }
    }

    return {
      id: service.service_id,
      title: service.title,
      category: service.main_category,
      subCategory: service.sub_category,
      price: '0.00', // Will be updated when we fetch packages
      coverImage: service.cover_image_url || '/placeholder-service.jpg',
      status: service.status?.toLowerCase() || 'active',
      views: 0, // Mock data doesn't include view count
      orders: service.total_orders || 0,
      rating: service.rating_avg || 0,
      createdAt: createdDate,
      description: service.description
    }
  }

  const [services, setServices] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch packages for services to get pricing using the optimized API endpoint
  const fetchServicePackages = async (servicesData: any[]) => {
    const servicesWithPricing = await Promise.all(
      servicesData.map(async (service) => {
        try {
          const response = await fetch(`/api/marketplace/services/${service.service_id}/packages`)
          const data = await response.json()

          if (data.success && data.data.length > 0) {
            // Find the minimum price from packages
            const packages = data.data
            const minPrice = packages.reduce((min: number, pkg: any) => {
              const price = typeof pkg.price_e8s === 'string'
                ? parseFloat(pkg.price_e8s) / 100000000
                : Number(pkg.price_e8s) / 100000000
              return min === 0 || price < min ? price : min
            }, 0)

            return {
              ...transformServiceData(service),
              price: minPrice.toFixed(2)
            }
          } else {
            return transformServiceData(service)
          }
        } catch (error) {
          console.error(`Error fetching packages for service ${service.service_id}:`, error)
          return transformServiceData(service)
        }
      })
    )

    return servicesWithPricing
  }

  // Update services when fetched data changes
  useEffect(() => {
    if (loading) {
      setIsLoading(true)
    } else if (error) {
      console.error('Error fetching services:', error)
      setServices([])
      setIsLoading(false)
    } else {
      if (fetchedServices.length > 0) {
        const transformedServices = fetchedServices.map(transformServiceData)
        setServices(transformedServices)
        setIsLoading(false)

        // Try to fetch packages in the background for pricing (only if not already fetched)
        fetchServicePackages(fetchedServices).then(servicesWithPricing => {
          setServices(servicesWithPricing)
        }).catch(error => {
          console.error('Error fetching service packages:', error)
          // Keep using transformed services without package pricing
        })
      } else {
        setServices([])
        setIsLoading(false)
      }
    }
  }, [fetchedServices, loading, error])

  // Only set loading to false when userId is null and auth check is complete
  useEffect(() => {
    if (!isCheckingAuth && !userId) {
      setIsLoading(false)
    }
  }, [userId, isCheckingAuth])
  const handleAddService = () => {
    navigate.push('/freelancer/add-service/overview')
  }
  const handleEditService = (serviceId: string) => {
    navigate.push(`/freelancer/update-service/${serviceId}/overview`)
  }
  const handleViewService = (serviceId: string) => {
    navigate.push(`/service-preview/${serviceId}`)
  }
  const handleDeleteService = async (serviceId: string) => {
    if (
      confirm(
        'Are you sure you want to delete this service? This action cannot be undone.',
      )
    ) {
      if (!userId) return

      try {
        // Make actual API call to delete from canister
        const response = await fetch(`/api/marketplace/services/${serviceId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: userId
          })
        })

        const result = await response.json()

        if (result.success) {
          // Remove from local state
          setServices(services.filter((service) => service.id !== serviceId))
          // Refresh the data from server
          refetch()
          alert('Service deleted successfully!')
        } else {
          alert('Failed to delete service: ' + (result.error || 'Unknown error'))
        }
      } catch (error) {
        console.error('Error deleting service:', error)
        alert('Failed to delete service. Please try again.')
      }
    }
  }

  const handleToggleStatus = async (serviceId: string, currentStatus: string) => {
    if (!userId) return

    const newStatus = currentStatus === 'active' ? 'Paused' : 'Active'

    try {
      const result = await updateService(userId, serviceId, { status: newStatus })
      if (result.success) {
        setServices(
          services.map((service) =>
            service.id === serviceId
              ? {
                  ...service,
                  status: newStatus.toLowerCase(),
                }
              : service,
          ),
        )
      } else {
        alert('Failed to update service status: ' + (result.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error updating service status:', error)
      alert('Failed to update service status. Please try again.')
    }
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
          {isCheckingAuth || isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-pulse flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin mb-4"></div>
                <p className="text-gray-600">
                  {isCheckingAuth ? 'Checking authentication...' : 'Loading your services...'}
                </p>
              </div>
            </div>
          ) : !userId ? (
            <Card className="text-center p-8">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-yellow-600"
                  >
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                    <polyline points="10 17 15 12 10 7"></polyline>
                    <line x1="15" y1="12" x2="3" y2="12"></line>
                  </svg>
                </div>
                <h2 className="text-xl font-semibold">Please Log In</h2>
                <p className="text-gray-600 max-w-md">
                  You need to be logged in to view and manage your services.
                </p>
                <Button onClick={() => navigate.push('/login')} className="mt-2">
                  Log In to Continue
                </Button>
              </div>
            </Card>
          ) : error ? (
            <Card className="text-center p-8">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-red-600"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                </div>
                <h2 className="text-xl font-semibold">Error Loading Services</h2>
                <p className="text-gray-600 max-w-md">
                  {error}
                </p>
                <Button onClick={() => refetch()} className="mt-2" variant="outline">
                  Try Again
                </Button>
              </div>
            </Card>
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
