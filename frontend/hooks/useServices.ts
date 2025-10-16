'use client'

import { useState, useEffect, useCallback, useMemo } from 'react';

export interface Service {
  service_id: string;
  freelancer_id: string;
  title: string;
  main_category: string;
  sub_category: string;
  description: string;
  whats_included: string;
  cover_image_url?: string;
  portfolio_images: string[];
  status: string;
  rating_avg: number;
  total_orders: number;
  created_at: number;
  updated_at: number;
}

export interface ServiceFilters {
  category?: string;
  freelancer_id?: string;
  freelancer_email?: string;
  search_term?: string;
  limit?: number;
  offset?: number;
}

export interface CreateServiceData {
  title: string;
  main_category: string;
  sub_category: string;
  description: string;
  whats_included: string;
  cover_image_url?: string;
  portfolio_images?: string[];
  status?: string;
}

export interface UpdateServiceData {
  title?: string;
  main_category?: string;
  sub_category?: string;
  description?: string;
  whats_included?: string;
  cover_image_url?: string;
  portfolio_images?: string[];
  status?: string;
}

export function useServices(freelancerId?: string, filters?: ServiceFilters) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memoize filters to prevent infinite re-renders
  const memoizedFilters = useMemo(() => filters, [
    filters?.category,
    filters?.freelancer_id,
    filters?.freelancer_email,
    filters?.search_term,
    filters?.limit,
    filters?.offset
  ]);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams();
      if (memoizedFilters?.category) queryParams.append('category', memoizedFilters.category);
      
      // Only use freelancer_id if we don't have an email filter
      if (!memoizedFilters?.freelancer_email) {
        if (freelancerId) queryParams.append('freelancer_id', freelancerId);
        if (memoizedFilters?.freelancer_id) queryParams.append('freelancer_id', memoizedFilters.freelancer_id);
      }
      
      if (memoizedFilters?.freelancer_email) queryParams.append('freelancer_email', memoizedFilters.freelancer_email);
      if (memoizedFilters?.search_term) queryParams.append('search_term', memoizedFilters.search_term);
      if (memoizedFilters?.limit) queryParams.append('limit', memoizedFilters.limit.toString());
      if (memoizedFilters?.offset) queryParams.append('offset', memoizedFilters.offset.toString());

      const response = await fetch(`/api/marketplace/services?${queryParams.toString()}`);
      const data = await response.json();

      if (data.success) {
        setServices(data.data);
      } else {
        setError(data.error || 'Failed to fetch services');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  }, [freelancerId, memoizedFilters]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  return { services, loading, error, refetch: fetchServices };
}

export function useCreateService() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createService = useCallback(async (userId: string, serviceData: CreateServiceData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/marketplace/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          serviceData,
        }),
      });

      const data = await response.json();

      if (data.success) {
        return { success: true, data: data.data };
      } else {
        setError(data.error || 'Failed to create service');
        return { success: false, error: data.error };
      }
    } catch (err) {
      setError('Network error occurred');
      return { success: false, error: 'Network error occurred' };
    } finally {
      setLoading(false);
    }
  }, []);

  return { createService, loading, error };
}

export function useUpdateService() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateService = useCallback(async (userId: string, serviceId: string, updates: UpdateServiceData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/marketplace/services/${serviceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          updates,
        }),
      });

      const data = await response.json();

      if (data.success) {
        return { success: true, data: data.data };
      } else {
        setError(data.error || 'Failed to update service');
        return { success: false, error: data.error };
      }
    } catch (err) {
      setError('Network error occurred');
      return { success: false, error: 'Network error occurred' };
    } finally {
      setLoading(false);
    }
  }, []);

  return { updateService, loading, error };
}

export function useDeleteService() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteService = useCallback(async (userId: string, serviceId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/marketplace/services/${serviceId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        return { success: true };
      } else {
        setError(data.error || 'Failed to delete service');
        return { success: false, error: data.error };
      }
    } catch (err) {
      setError('Network error occurred');
      return { success: false, error: 'Network error occurred' };
    } finally {
      setLoading(false);
    }
  }, []);

  return { deleteService, loading, error };
}

export function useServicePackages(serviceId?: string) {
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPackages = useCallback(async () => {
    if (!serviceId) {
      setPackages([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/marketplace/services/${serviceId}/packages`);
      const data = await response.json();

      if (data.success) {
        setPackages(data.data);
      } else {
        setError(data.error || 'Failed to fetch packages');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  }, [serviceId]);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  const getMinPrice = useCallback(() => {
    if (packages.length === 0) return 100; // Default fallback
    const minPrice = Math.min(...packages.map(pkg => parseInt(pkg.price_e8s) / 100000000));
    return minPrice;
  }, [packages]);

  return { packages, loading, error, refetch: fetchPackages, getMinPrice };
}

