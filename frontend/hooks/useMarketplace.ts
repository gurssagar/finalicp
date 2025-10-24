'use client'

import { useState, useEffect, useCallback } from 'react';

// Types
export interface Service {
  service_id: string;
  freelancer_email: string;
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

export interface Package {
  package_id: string;
  service_id: string;
  tier: string;
  title: string;
  description: string;
  price_e8s: number;
  delivery_days: number;
  features: string[];
  revisions_included: number;
  status: string;
  created_at: number;
  updated_at: number;
}

export interface Booking {
  booking_id: string;
  client_id: string;
  freelancer_id: string;
  package_id: string;
  service_id?: string;
  status: string;
  total_amount_e8s: number;
  total_amount_dollars?: number;
  escrow_amount_e8s: number;
  escrow_amount_dollars?: number;
  payment_status: string;
  client_notes?: string;
  created_at: number;
  updated_at: number;

  // Enhanced fields from payment confirmations
  service_title?: string;
  freelancer_name?: string;
  package_title?: string;
  package_tier?: string;
  payment_method?: string;
  payment_id?: string;
  transaction_id?: string;
  ledger_deposit_block?: bigint | null;
  delivery_deadline?: number;
  special_instructions?: string;
  upsells?: Array<{
    id: string;
    name: string;
    price: number;
    description: string;
    category: string;
  }>;
  promo_code?: string;
}

export interface Stage {
  stage_id: string;
  booking_id: string;
  stage_number: number;
  title: string;
  description: string;
  amount_e8s: number;
  status: 'Pending' | 'InProgress' | 'Submitted' | 'Approved' | 'Rejected' | 'Released';
  created_at: number;
  updated_at: number;
  submitted_at?: number;
  approved_at?: number;
  rejected_at?: number;
  released_at?: number;
  submission_notes?: string;
  submission_artifacts?: string[];
  rejection_reason?: string;
}

// Service Hooks
export function useServices(filters?: any) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams();
      if (filters?.category) queryParams.append('category', filters.category);
      if (filters?.freelancer_email) queryParams.append('freelancer_email', filters.freelancer_email);
      if (filters?.search_term) queryParams.append('search_term', filters.search_term);
      if (filters?.limit) queryParams.append('limit', filters.limit.toString());
      if (filters?.offset) queryParams.append('offset', filters.offset.toString());

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
  }, [filters]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  return { services, loading, error, refetch: fetchServices };
}

export function useCreateService() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createService = useCallback(async (userEmail: string, serviceData: any) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/marketplace/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail, serviceData }),
      });

      const data = await response.json();
      return data.success ? { success: true, data: data.data } : { success: false, error: data.error };
    } catch (err) {
      return { success: false, error: 'Network error occurred' };
    } finally {
      setLoading(false);
    }
  }, []);

  return { createService, loading, error };
}

// Package Hooks
export function usePackages(serviceId?: string) {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPackages = useCallback(async () => {
    if (!serviceId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/marketplace/packages?service_id=${serviceId}`);
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

  return { packages, loading, error, refetch: fetchPackages };
}

export function useCreatePackage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPackage = useCallback(async (userId: string, packageData: any) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/marketplace/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, packageData }),
      });

      const data = await response.json();
      return data.success ? { success: true, data: data.data } : { success: false, error: data.error };
    } catch (err) {
      return { success: false, error: 'Network error occurred' };
    } finally {
      setLoading(false);
    }
  }, []);

  return { createPackage, loading, error };
}

export function useBookPackage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bookPackage = useCallback(async (userId: string, packageId: string, clientNotes?: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/marketplace/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, packageId, clientNotes }),
      });

      const data = await response.json();
      return data.success ? { success: true, data: data.data } : { success: false, error: data.error };
    } catch (err) {
      return { success: false, error: 'Network error occurred' };
    } finally {
      setLoading(false);
    }
  }, []);

  return { bookPackage, loading, error };
}

// Booking Hooks
export function useBookings(userId: string, userType: 'client' | 'freelancer', statusFilter?: string) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('user_id', userId);
      queryParams.append('user_type', userType);
      if (statusFilter) queryParams.append('status', statusFilter);

      const response = await fetch(`/api/marketplace/bookings?${queryParams.toString()}`);
      const data = await response.json();

      if (data.success) {
        setBookings(data.data);
      } else {
        setError(data.error || 'Failed to fetch bookings');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  }, [userId, userType, statusFilter]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return { bookings, loading, error, fetchBookings };
}

// Stage Hooks
export function useStages(bookingId?: string) {
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStages = useCallback(async () => {
    if (!bookingId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/marketplace/stages?booking_id=${bookingId}`);
      const data = await response.json();

      if (data.success) {
        setStages(data.data);
      } else {
        setError(data.error || 'Failed to fetch stages');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    fetchStages();
  }, [fetchStages]);

  const createStages = useCallback(async (stageData: any) => {
    try {
      const response = await fetch('/api/marketplace/stages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stageData),
      });

      const data = await response.json();
      if (data.success) {
        fetchStages(); // Refresh stages
        return { success: true, data: data.data };
      } else {
        return { success: false, error: data.error };
      }
    } catch (err) {
      return { success: false, error: 'Network error occurred' };
    }
  }, [fetchStages]);

  const submitStage = useCallback(async (userId: string, stageId: string, notes: string, artifacts: string[]) => {
    try {
      const response = await fetch(`/api/marketplace/stages/${stageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: 'submit', notes, artifacts }),
      });

      const data = await response.json();
      if (data.success) {
        fetchStages(); // Refresh stages
        return { success: true, data: data.data };
      } else {
        return { success: false, error: data.error };
      }
    } catch (err) {
      return { success: false, error: 'Network error occurred' };
    }
  }, [fetchStages]);

  const approveStage = useCallback(async (userId: string, stageId: string) => {
    try {
      const response = await fetch(`/api/marketplace/stages/${stageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: 'approve' }),
      });

      const data = await response.json();
      if (data.success) {
        fetchStages(); // Refresh stages
        return { success: true, data: data.data };
      } else {
        return { success: false, error: data.error };
      }
    } catch (err) {
      return { success: false, error: 'Network error occurred' };
    }
  }, [fetchStages]);

  const rejectStage = useCallback(async (userId: string, stageId: string, reason: string) => {
    try {
      const response = await fetch(`/api/marketplace/stages/${stageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: 'reject', reason }),
      });

      const data = await response.json();
      if (data.success) {
        fetchStages(); // Refresh stages
        return { success: true, data: data.data };
      } else {
        return { success: false, error: data.error };
      }
    } catch (err) {
      return { success: false, error: 'Network error occurred' };
    }
  }, [fetchStages]);

  return { 
    stages, 
    loading, 
    error, 
    fetchStages,
    createStages,
    submitStage,
    approveStage,
    rejectStage
  };
}

// Project Completion Hook
export function useProjectCompletion() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const completeProject = useCallback(async (userId: string, bookingId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/marketplace/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, bookingId, action: 'complete' }),
      });

      const data = await response.json();
      return data.success ? { success: true, data: data.data } : { success: false, error: data.error };
    } catch (err) {
      return { success: false, error: 'Network error occurred' };
    } finally {
      setLoading(false);
    }
  }, []);

  return { completeProject, loading, error };
}

// Stats Hook
export function useMarketplaceStats() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/marketplace/stats');
      const data = await response.json();

      if (data.success) {
        setStats(data.data);
      } else {
        setError(data.error || 'Failed to fetch stats');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
}