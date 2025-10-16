'use client'
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Save, Share2, Check, Star, Clock, DollarSign } from 'lucide-react';
import { useServices } from '@/hooks/useServices';
import { usePackages, useBookPackage } from '@/hooks/usePackages';
export default function ServiceDetails() {
  const navigate = useRouter();
  const { id } = useParams<{ id: string }>();
  const [selectedTier, setSelectedTier] = useState('basic');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bookingNotes, setBookingNotes] = useState('');

  // Fetch service data
  useEffect(() => {
    const fetchService = async () => {
      try {
        const response = await fetch(`/api/marketplace/services/${id}`);
        const data = await response.json();
        
        if (data.success) {
          setService(data.data);
        } else {
          console.error('Failed to fetch service:', data.error);
        }
      } catch (error) {
        console.error('Error fetching service:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchService();
    }
  }, [id]);

  // Fetch packages for this service
  const { packages, loading: packagesLoading } = usePackages(id);

  // Book package hook
  const { bookPackage, loading: bookingLoading } = useBookPackage();

  const handleBookPackage = async (packageId: string) => {
    if (!packageId) {
      alert('Please select a package');
      return;
    }

    const userId = 'TEST_USER_123'; // TODO: Get from auth context
    
    const result = await bookPackage(userId, packageId, bookingNotes);
    
    if (result.success) {
      alert('Package booked successfully!');
      navigate.push('/client/projects');
    } else {
      alert('Failed to book package: ' + result.error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Service Not Found</h2>
        <p className="text-gray-600 mb-4">The service you're looking for doesn't exist.</p>
        <Link href="/client/browse-services" className="text-blue-600 hover:text-blue-700">
          Browse other services
        </Link>
      </div>
    );
  }

  // Mock data for UI components that need it
  const mockService = {
    id: service.service_id,
    title: service.title,
    seller: {
      name: `Freelancer ${service.freelancer_id.slice(-4)}`,
      location: 'Remote',
      joinedYear: '2023',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=300&auto=format&fit=crop',
      rating: service.rating_avg,
      reviews: `${service.total_orders}+`
    },
    images: service.portfolio_images.length > 0 ? service.portfolio_images : ["/default-service.jpg"],
    description: service.description,
    features: service.whats_included.split(',').map((item: string) => item.trim()),
    additionalInfo: [service.description],
    tiers: packages.reduce((acc: any, pkg: any) => {
      acc[pkg.tier.toLowerCase()] = {
        name: pkg.tier,
        price: pkg.price_e8s / 100000000, // Convert from e8s to ICP
        description: pkg.description,
        deliveryDays: pkg.delivery_days,
        revisions: pkg.revisions_included
      };
      return acc;
    }, {}),
    tierComparison: {
      headers: ['Service Tiers', 'Basic', 'Advanced', 'Premium'],
      rows: [['Delivery Days', '7 Days', '7 Days', '7 Days'], ['Source Files', '✓', '✓', '✓'], ['Optional Add-ons', '', '', '✓']]
    },
    faqs: [{
      question: "How do I become a part of Organised's freelance network?",
      answer: 'Joining our network starts with an application. We meticulously review your expertise, portfolio, and professional background.'
    }, {
      question: 'What does the vetting process involve?',
      answer: 'Our vetting process includes portfolio review, technical assessment, and an interview with our team to ensure you meet our quality standards.'
    }, {
      question: 'Are there opportunities for professional growth within Organised?',
      answer: 'Yes, we offer ongoing training, mentorship programs, and access to a community of professionals to help you grow your skills and career.'
    }],
    similarServices: [{
      id: 101,
      title: 'It is a long established fact that a reader will be distracted by the readable content',
      image: "/Freelancer_Dashbioard-1.png",
      seller: 'Kenneth Allen',
      rating: 4.8,
      reviews: '1.2K+',
      price: 100
    }, {
      id: 102,
      title: 'It is a long established fact that a reader will be distracted by the readable content',
      image: "/Organaise_Freelancer_Onboarding_-_24.png",
      seller: 'Kenneth Allen',
      rating: 4.8,
      reviews: '1.2K+',
      price: 100
    }, {
      id: 103,
      title: 'It is a long established fact that a reader will be distracted by the readable content',
      image: "/Organaise_Freelancer_Onboarding_-_25.png",
      seller: 'Kenneth Allen',
      rating: 4.8,
      reviews: '1.2K+',
      price: 100
    }],
    comments: [{
      user: 'Jane Doe',
      rating: 5,
      comment: "I really appreciate the insights and perspective shared in this article. It's definitely given me something to think about and has helped me see things from a different angle."
    }, {
      user: 'Jane Doe',
      rating: 5,
      comment: 'I really appreciate the insights and perspective shared in this article.'
    }],
    ratings: {
      average: 4.8,
      total: 2355,
      distribution: [{
        stars: 5,
        percentage: 70
      }, {
        stars: 4,
        percentage: 20
      }, {
        stars: 3,
        percentage: 10
      }, {
        stars: 2,
        percentage: 0
      }, {
        stars: 1,
        percentage: 0
      }]
    }
  };
  const handleContinue = async () => {
    // Find the selected package
    const selectedPackage = packages.find(pkg => pkg.tier.toLowerCase() === selectedTier);
    
    if (!selectedPackage) {
      alert('Please select a package');
      return;
    }

    await handleBookPackage(selectedPackage.package_id);
  };
  const handleBack = () => {
    navigate.push('/client/browse-services');
  };
  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };
  const goToPreviousImage = () => {
    setCurrentImageIndex(prev => prev === 0 ? service.images.length - 1 : prev - 1);
  };
  const goToNextImage = () => {
    setCurrentImageIndex(prev => prev === service.images.length - 1 ? 0 : prev + 1);
  };
  return <div className="min-h-screen bg-white">
      {/* Header */}
     
      <div className="container mx-auto px-4 py-6">
        <button onClick={handleBack} className="flex items-center text-gray-600 mb-4">
          <ChevronLeft size={20} />
          <span>Back</span>
        </button>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h1 className="text-xl md:text-2xl font-semibold mb-4">
              {service.title}
            </h1>
            <div className="flex items-center mb-6">
              <img src={service.seller.avatar} alt={service.seller.name} className="w-10 h-10 rounded-full mr-3" />
              <div>
                <p className="font-medium">{service.seller.name}</p>
                <div className="flex flex-wrap items-center text-sm text-gray-600">
                  <span>
                    {service.seller.location} - {service.seller.joinedYear}
                  </span>
                  <div className="flex items-center ml-2">
                    <span className="text-yellow-500">★</span>
                    <span className="ml-1">{service.seller.rating}</span>
                    <span className="ml-1">({service.seller.reviews})</span>
                  </div>
                  <span className="ml-2">1 contract in queue</span>
                </div>
              </div>
            </div>
            {/* Image gallery */}
            <div className="mb-8">
              <div className="relative rounded-lg overflow-hidden">
                <img src={service.images[currentImageIndex]} alt="Service preview" className="w-full h-64 md:h-96 object-cover" />
                {service.images.length > 1 && <>
                    <button onClick={goToPreviousImage} className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100" aria-label="Previous image">
                      <ChevronLeft size={20} />
                    </button>
                    <button onClick={goToNextImage} className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100" aria-label="Next image">
                      <ChevronRight size={20} />
                    </button>
                    {/* Image pagination dots */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                      {service.images.map((_, index) => <button key={index} onClick={() => setCurrentImageIndex(index)} className={`w-2 h-2 rounded-full ${currentImageIndex === index ? 'bg-white' : 'bg-gray-400/60'}`} aria-label={`Go to image ${index + 1}`} />)}
                    </div>
                  </>}
              </div>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {service.images.map((image, index) => <button key={index} onClick={() => setCurrentImageIndex(index)} className={`rounded-lg overflow-hidden border-2 ${currentImageIndex === index ? 'border-blue-500' : 'border-transparent'}`}>
                    <img src={image} alt={`Thumbnail ${index + 1}`} className="w-full h-16 object-cover" />
                  </button>)}
              </div>
            </div>
            {/* Description */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Description</h2>
              <p className="text-gray-700 mb-4">{service.description}</p>
              <ul className="list-disc pl-5 space-y-1 mb-6">
                {service.features.map((feature, index) => <li key={index} className="text-gray-700">
                    {feature}
                  </li>)}
              </ul>
              {service.additionalInfo.map((info, index) => <p key={index} className="text-gray-700 mb-2">
                  {info}
                </p>)}
            </div>
            {/* Tier Comparison */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Tier Comparison</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr>
                      {service.tierComparison.headers.map((header, index) => <th key={index} className="border border-gray-200 px-4 py-2 text-left bg-gray-50">
                          {header}
                        </th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {service.tierComparison.rows.map((row, rowIndex) => <tr key={rowIndex}>
                        {row.map((cell, cellIndex) => <td key={cellIndex} className="border border-gray-200 px-4 py-2">
                            {cell}
                          </td>)}
                      </tr>)}
                  </tbody>
                </table>
              </div>
            </div>
            {/* FAQ */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">
                Frequently Asked Questions
              </h2>
              <div className="space-y-4">
                {service.faqs.map((faq, index) => <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                    <button className="flex items-center justify-between w-full px-4 py-3 bg-white text-left" onClick={() => toggleFaq(index)}>
                      <span className={`font-medium ${expandedFaq === index ? 'text-green-600' : 'text-gray-800'}`}>
                        {faq.question}
                      </span>
                      {expandedFaq === index ? <ChevronUp size={20} className="text-green-600" /> : <ChevronDown size={20} />}
                    </button>
                    {expandedFaq === index && <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                        <p className="text-gray-700">{faq.answer}</p>
                      </div>}
                  </div>)}
              </div>
            </div>
            {/* Comments and Rating */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">
                Comments And Rating
              </h2>
              <div className="flex items-center mb-4">
                <span className="text-xl font-bold mr-2">
                  {service.ratings.average}
                </span>
                <div className="flex text-yellow-400">
                  {'★★★★★'.split('').map((_, i) => <span key={i} className={i < Math.floor(service.ratings.average) ? 'text-yellow-400' : 'text-gray-300'}>
                      ★
                    </span>)}
                </div>
                <span className="ml-2 text-gray-600">
                  ({service.ratings.total} ratings)
                </span>
              </div>
              {/* Rating distribution */}
              <div className="space-y-2 mb-6">
                {service.ratings.distribution.map(dist => <div key={dist.stars} className="flex items-center">
                    <span className="w-8">{dist.stars} ★</span>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full mx-2">
                      <div className="h-2 bg-green-500 rounded-full" style={{
                    width: `${dist.percentage}%`
                  }}></div>
                    </div>
                    <span className="w-8 text-right text-gray-600">
                      {dist.percentage}%
                    </span>
                  </div>)}
              </div>
              {/* Comments */}
              <div className="space-y-4">
                {service.comments.map((comment, index) => <div key={index} className="border-b border-gray-200 pb-4">
                    <div className="flex items-center mb-2">
                      <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop" alt={comment.user} className="w-10 h-10 rounded-full mr-3" />
                      <div>
                        <p className="font-medium">{comment.user}</p>
                        <div className="flex text-yellow-400">
                          {'★'.repeat(comment.rating)}
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700">{comment.comment}</p>
                  </div>)}
                <button className="text-blue-500 hover:underline">
                  Load More
                </button>
              </div>
            </div>
            {/* Similar Services */}
            <div>
              <h2 className="text-xl font-semibold mb-4">
                Explore Similar Services
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {service.similarServices.map(similar => <div key={similar.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="relative h-48">
                      <img src={similar.image} alt={similar.title} className="w-full h-full object-cover" />
                      <div className="absolute bottom-2 right-2 flex space-x-1">
                        <button className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow">
                          <ChevronLeft size={16} />
                        </button>
                        <button className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center shadow">
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center mb-2">
                        <img src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=100&auto=format&fit=crop" alt={similar.seller} className="w-8 h-8 rounded-full mr-2" />
                        <span>{similar.seller}</span>
                      </div>
                      <p className="text-sm mb-2 line-clamp-2">
                        {similar.title}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-yellow-400">★</span>
                          <span className="ml-1">{similar.rating}</span>
                          <span className="ml-1 text-gray-600">
                            ({similar.reviews})
                          </span>
                        </div>
                        <div className="font-bold">USD ${similar.price}</div>
                      </div>
                      <Link href={`/client/service/${similar.id}`} className="flex items-center text-blue-500 mt-2">
                        <span>View</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-1">
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                          <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                      </Link>
                    </div>
                  </div>)}
              </div>
            </div>
          </div>
          {/* Right sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between mb-4">
                <button className="flex items-center text-gray-600">
                  <Save size={18} className="mr-1" />
                  <span>Save</span>
                </button>
                <button className="flex items-center text-gray-600">
                  <Share2 size={18} className="mr-1" />
                  <span>Share</span>
                </button>
              </div>
              <h3 className="font-medium mb-4">Select service tier</h3>
              <div className="space-y-3 mb-6">
                <button className={`w-full py-2 px-4 rounded-full border ${selectedTier === 'basic' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`} onClick={() => setSelectedTier('basic')}>
                  Basic ($100)
                </button>
                <button className={`w-full py-2 px-4 rounded-full border ${selectedTier === 'advanced' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`} onClick={() => setSelectedTier('advanced')}>
                  Advanced ($180)
                </button>
                <button className={`w-full py-2 px-4 rounded-full border ${selectedTier === 'premium' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`} onClick={() => setSelectedTier('premium')}>
                  Premium ($234)
                </button>
              </div>
              <div className="space-y-4 border-t border-gray-200 pt-4">
                <div className="flex justify-between">
                  <span>Title</span>
                  <span>Website ui, figma website design</span>
                </div>
                <div className="flex justify-between">
                  <span>Description</span>
                  <span className="text-right text-sm text-gray-600 max-w-[60%]">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Suspendisse eu pellentesque turpis. Vivamus a diam augue.
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>No Of Days</span>
                  <span>
                    {service.tiers[selectedTier as keyof typeof service.tiers].deliveryDays}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Revisions</span>
                  <span>
                    {service.tiers[selectedTier as keyof typeof service.tiers].revisions}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Amount</span>
                  <span>
                    $
                    {service.tiers[selectedTier as keyof typeof service.tiers].price}
                  </span>
                </div>
              </div>
              <button 
                onClick={handleContinue} 
                disabled={bookingLoading || packagesLoading}
                className="w-full py-3 bg-purple-600 text-white rounded-lg mt-6 hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {bookingLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                    Booking...
                  </>
                ) : (
                  `Book Now ($${mockService.tiers[selectedTier as keyof typeof mockService.tiers]?.price || 0})`
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>;
}