export interface BookedService {
  id: string
  serviceTitle: string
  serviceId: string
  freelancerName: string
  freelancerEmail: string
  status: 'active' | 'completed' | 'cancelled' | 'pending'
  totalAmount: number
  currency: string
  createdAt: Date
  deliveryDeadline: Date
  packageTitle: string
  packageDescription: string
  lastUpdated: Date
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded'
  specialInstructions?: string
  milestones?: Milestone[]
}

export interface Milestone {
  id: string
  title: string
  description: string
  amount: number
  status: 'pending' | 'in_progress' | 'completed' | 'approved' | 'rejected'
  dueDate: Date
  submittedAt?: Date
  deliverables?: string[]
}

export interface BookingFilter {
  status: string
  dateRange?: {
    start: Date
    end: Date
  }
  priceRange?: {
    min: number
    max: number
  }
}