'use client'
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { ServiceFilter } from '@/components/client/ServiceFilter';
import { ServiceCard } from '@/components/client/ServiceCard';
import { Button } from '@/components/ui/button';
export default function BrowseServices() {
  const navigate = useRouter();
  const [activeCategory, setActiveCategory] = useState('Business');
  const [filters, setFilters] = useState({
    topRated: false,
    bestSeller: false
  });
  // Sample service data
  const services = [{
    id: 1,
    title: 'It is a long established fact that a reader will be distracted by the readable content',
    image: "/Freelancer_Dashbioard-1.png",
    seller: 'Kenneth Allen',
    rating: 4.8,
    reviews: '1.2K+',
    price: 100
  }, {
    id: 2,
    title: 'It is a long established fact that a reader will be distracted by the readable content',
    image: "/Organaise_Freelancer_Onboarding_-_24.png",
    seller: 'Kenneth Allen',
    rating: 4.8,
    reviews: '1.2K+',
    price: 100
  }, {
    id: 3,
    title: 'It is a long established fact that a reader will be distracted by the readable content',
    image: "/Organaise_Freelancer_Onboarding_-_25.png",
    seller: 'Kenneth Allen',
    rating: 4.8,
    reviews: '1.2K+',
    price: 100
  }, {
    id: 4,
    title: 'It is a long established fact that a reader will be distracted by the readable content',
    image: "/Organaise_Freelancer_Onboarding_-_23.png",
    seller: 'Kenneth Allen',
    rating: 4.8,
    reviews: '1.2K+',
    price: 100
  }, {
    id: 5,
    title: 'It is a long established fact that a reader will be distracted by the readable content',
    image: "/Freelancer_Dashbioard.png",
    seller: 'Kenneth Allen',
    rating: 4.8,
    reviews: '1.2K+',
    price: 100
  }, {
    id: 6,
    title: 'It is a long established fact that a reader will be distracted by the readable content',
    image: "/Freelancer_Dashbioard-1.png",
    seller: 'Kenneth Allen',
    rating: 4.8,
    reviews: '1.2K+',
    price: 100
  }];
  const categories = ['Marketing', 'Business', 'Admin', 'Portfolio', 'Technology', 'User Experience'];
  const handleServiceClick = (serviceId: number) => {
    navigate.push(`/client/service/${serviceId}`);
  };
  return <div className="flex flex-col min-h-screen bg-white">
      <Header showSearch={true} />
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="overflow-x-auto pb-4">
          <div className="flex space-x-4 min-w-max">
            {categories.map(category => <Button key={category} variant={activeCategory === category ? 'default' : 'secondary'} size="sm" className={`text-sm ${activeCategory === category ? '' : 'bg-gray-100 text-gray-600'}`} onClick={() => setActiveCategory(category)}>
                {category}
              </Button>)}
          </div>
        </div>
        <ServiceFilter filters={filters} setFilters={setFilters} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {services.map(service => <ServiceCard key={service.id} service={service} onClick={() => handleServiceClick(service.id)} />)}
        </div>
      </main>
    </div>;
}