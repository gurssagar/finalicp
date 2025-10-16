// Mock marketplace agent for testing API routes
// This simulates the marketplace canister responses for testing

export interface MockService {
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
  created_at: bigint;
  updated_at: bigint;
}

export interface MockPackage {
  package_id: string;
  service_id: string;
  tier: string;
  title: string;
  description: string;
  price_e8s: string;
  delivery_days: number;
  features: string[];
  revisions_included: number;
  status: string;
  created_at: bigint;
  updated_at: bigint;
}

export interface MockBooking {
  booking_id: string;
  package_id: string;
  client_id: string;
  freelancer_id: string;
  total_price_e8s: string;
  escrow_amount_e8s: string;
  platform_fee_e8s: string;
  payment_status: string;
  booking_status: string;
  special_instructions: string;
  ledger_deposit_block?: string;
  created_at: bigint;
}

export interface MockJobPost {
  job_id: string;
  client_id: string;
  title: string;
  description: string;
  budget: number;
  deadline: string;
  category: string;
  skills: string[];
  experience_level: string;
  project_type: string;
  timeline: string;
  status: string;
  applications_count: number;
  created_at: number;
  updated_at: number;
}

export interface MockStage {
  stage_id: string;
  booking_id: string;
  stage_number: number;
  title: string;
  description: string;
  amount_e8s: string;
  status: string;
  submission_notes?: string;
  submission_artifacts: string[];
  submitted_at?: bigint;
  approved_at?: bigint;
  rejected_at?: bigint;
  rejection_reason?: string;
  created_at: bigint;
}

// Mock data storage
let mockServices: MockService[] = [];
let mockPackages: MockPackage[] = [];
let mockBookings: MockBooking[] = [];
let mockStages: MockStage[] = [];
let mockJobPosts: MockJobPost[] = [];
let nextServiceId = 1;
let nextPackageId = 1;
let nextBookingId = 1;
let nextStageId = 1;
let nextJobId = 1;

// Mock marketplace agent
export class MockMarketplaceAgent {
  // Services
  async listServices(filter: any) {
    return { ok: mockServices.filter(service => {
      if (filter.category && service.main_category !== filter.category) return false;
      if (filter.freelancer_id && service.freelancer_id !== filter.freelancer_id) return false;
      if (filter.search_term && !service.title.toLowerCase().includes(filter.search_term.toLowerCase())) return false;
      return true;
    }) };
  }

  async createService(userId: string, serviceData: any) {
    try {
      const service: MockService = {
        service_id: `SV-${String(nextServiceId++).padStart(8, '0')}`,
        freelancer_id: userId,
        title: serviceData.title,
        main_category: serviceData.main_category,
        sub_category: serviceData.sub_category,
        description: serviceData.description,
        whats_included: serviceData.whats_included,
        cover_image_url: serviceData.cover_image_url,
        portfolio_images: serviceData.portfolio_images || [],
        status: serviceData.status,
        rating_avg: 0,
        total_orders: 0,
        created_at: Date.now() * 1000000,
        updated_at: Date.now() * 1000000
      };
      mockServices.push(service);
      return { ok: service };
    } catch (error) {
      console.error('Error in createService:', error);
      return { err: 'Failed to create service' };
    }
  }

  async getServiceById(serviceId: string) {
    const service = mockServices.find(s => s.service_id === serviceId);
    if (!service) return { err: 'Service not found' };
    return { ok: service };
  }

  async updateService(userId: string, serviceId: string, updates: any) {
    const serviceIndex = mockServices.findIndex(s => s.service_id === serviceId);
    if (serviceIndex === -1) return { err: 'Service not found' };
    
    const service = mockServices[serviceIndex];
    if (service.freelancer_id !== userId) return { err: 'Unauthorized' };
    
    // Update service
    if (updates.title) service.title = updates.title;
    if (updates.description) service.description = updates.description;
    if (updates.status) service.status = updates.status;
    service.updated_at = Date.now() * 1000000;
    
    return { ok: service };
  }

  async deleteService(userId: string, serviceId: string) {
    const serviceIndex = mockServices.findIndex(s => s.service_id === serviceId);
    if (serviceIndex === -1) return { err: 'Service not found' };
    
    const service = mockServices[serviceIndex];
    if (service.freelancer_id !== userId) return { err: 'Unauthorized' };
    
    mockServices.splice(serviceIndex, 1);
    return { ok: null };
  }

  // Packages
  async getPackagesByService(serviceId: string) {
    const packages = mockPackages.filter(p => p.service_id === serviceId);
    return { ok: packages };
  }

  async createPackage(userId: string, packageData: any) {
    try {
      const package_: MockPackage = {
        package_id: `PK-${String(nextPackageId++).padStart(8, '0')}`,
        service_id: packageData.service_id,
        tier: packageData.tier,
        title: packageData.title,
        description: packageData.description,
        price_e8s: packageData.price_e8s,
        delivery_days: packageData.delivery_days,
        features: packageData.features || [],
        revisions_included: packageData.revisions_included || 0,
        status: packageData.status,
        created_at: Date.now() * 1000000,
        updated_at: Date.now() * 1000000
      };
      mockPackages.push(package_);
      return { ok: package_ };
    } catch (error) {
      console.error('Error in createPackage:', error);
      return { err: 'Failed to create package' };
    }
  }

  async getPackageById(packageId: string) {
    const package_ = mockPackages.find(p => p.package_id === packageId);
    if (!package_) return { err: 'Package not found' };
    return { ok: package_ };
  }

  async updatePackage(userId: string, packageId: string, updates: any) {
    const packageIndex = mockPackages.findIndex(p => p.package_id === packageId);
    if (packageIndex === -1) return { err: 'Package not found' };
    
    const package_ = mockPackages[packageIndex];
    // Check if user owns the service
    const service = mockServices.find(s => s.service_id === package_.service_id);
    if (!service || service.freelancer_id !== userId) return { err: 'Unauthorized' };
    
    // Update package
    if (updates.title) package_.title = updates.title;
    if (updates.description) package_.description = updates.description;
    if (updates.price_e8s) package_.price_e8s = updates.price_e8s;
    if (updates.status) package_.status = updates.status;
    package_.updated_at = Date.now() * 1000000;
    
    return { ok: package_ };
  }

  async deletePackage(userId: string, packageId: string) {
    const packageIndex = mockPackages.findIndex(p => p.package_id === packageId);
    if (packageIndex === -1) return { err: 'Package not found' };
    
    const package_ = mockPackages[packageIndex];
    // Check if user owns the service
    const service = mockServices.find(s => s.service_id === package_.service_id);
    if (!service || service.freelancer_id !== userId) return { err: 'Unauthorized' };
    
    mockPackages.splice(packageIndex, 1);
    return { ok: null };
  }

  // Bookings
  async bookPackage(clientId: string, packageId: string, idempotencyKey: string, specialInstructions: string) {
    const package_ = mockPackages.find(p => p.package_id === packageId);
    if (!package_) return { err: 'Package not found' };
    
    const service = mockServices.find(s => s.service_id === package_.service_id);
    if (!service) return { err: 'Service not found' };
    
    const booking: MockBooking = {
      booking_id: `BK-${String(nextBookingId++).padStart(8, '0')}`,
      package_id: packageId,
      client_id: clientId,
      freelancer_id: service.freelancer_id,
      total_price_e8s: package_.price_e8s,
      escrow_amount_e8s: package_.price_e8s,
      platform_fee_e8s: '0',
      payment_status: 'Funded',
      booking_status: 'InProgress',
      special_instructions: specialInstructions,
      ledger_deposit_block: '12345',
      created_at: Date.now() * 1000000
    };
    mockBookings.push(booking);
    return { ok: booking };
  }

  async getBookingById(bookingId: string) {
    const booking = mockBookings.find(b => b.booking_id === bookingId);
    if (!booking) return { err: 'Booking not found' };
    return { ok: booking };
  }

  async listBookingsForClient(clientId: string, status?: string, limit: number = 50, offset: number = 0) {
    let bookings = mockBookings.filter(b => b.client_id === clientId);
    if (status) {
      bookings = bookings.filter(b => b.booking_status === status);
    }
    return { ok: bookings.slice(offset, offset + limit) };
  }

  async listBookingsForFreelancer(freelancerId: string, status?: string, limit: number = 50, offset: number = 0) {
    let bookings = mockBookings.filter(b => b.freelancer_id === freelancerId);
    if (status) {
      bookings = bookings.filter(b => b.booking_status === status);
    }
    return { ok: bookings.slice(offset, offset + limit) };
  }

  async cancelBooking(userId: string, bookingId: string, reason: string) {
    const booking = mockBookings.find(b => b.booking_id === bookingId);
    if (!booking) return { err: 'Booking not found' };
    
    if (booking.client_id !== userId) return { err: 'Unauthorized' };
    
    booking.booking_status = 'Cancelled';
    return { ok: null };
  }

  // Stages
  async createStages(freelancerId: string, bookingId: string, stageDefinitions: any[]) {
    const booking = mockBookings.find(b => b.booking_id === bookingId);
    if (!booking) return { err: 'Booking not found' };
    
    if (booking.freelancer_id !== freelancerId) return { err: 'Unauthorized' };
    
    const stages: MockStage[] = stageDefinitions.map((def, index) => ({
      stage_id: `ST-${String(nextStageId++).padStart(8, '0')}`,
      booking_id: bookingId,
      stage_number: index + 1,
      title: def.title,
      description: def.description,
      amount_e8s: def.amount_e8s,
      status: 'Pending',
      submission_artifacts: [],
      created_at: Date.now() * 1000000
    }));
    
    mockStages.push(...stages);
    return { ok: stages };
  }

  async listStagesForBooking(bookingId: string) {
    const stages = mockStages.filter(s => s.booking_id === bookingId);
    return { ok: stages };
  }

  async getStageById(stageId: string) {
    const stage = mockStages.find(s => s.stage_id === stageId);
    if (!stage) return { err: 'Stage not found' };
    return { ok: stage };
  }

  async submitStage(userId: string, stageId: string, notes: string, artifacts: string[]) {
    const stage = mockStages.find(s => s.stage_id === stageId);
    if (!stage) return { err: 'Stage not found' };
    
    const booking = mockBookings.find(b => b.booking_id === stage.booking_id);
    if (!booking || booking.freelancer_id !== userId) return { err: 'Unauthorized' };
    
    stage.status = 'Submitted';
    stage.submission_notes = notes;
    stage.submission_artifacts = artifacts;
    stage.submitted_at = Date.now() * 1000000;
    
    return { ok: stage };
  }

  async approveStage(userId: string, stageId: string) {
    const stage = mockStages.find(s => s.stage_id === stageId);
    if (!stage) return { err: 'Stage not found' };
    
    const booking = mockBookings.find(b => b.booking_id === stage.booking_id);
    if (!booking || booking.client_id !== userId) return { err: 'Unauthorized' };
    
    stage.status = 'Approved';
    stage.approved_at = Date.now() * 1000000;
    
    return { ok: stage };
  }

  async rejectStage(userId: string, stageId: string, reason: string) {
    const stage = mockStages.find(s => s.stage_id === stageId);
    if (!stage) return { err: 'Stage not found' };
    
    const booking = mockBookings.find(b => b.booking_id === stage.booking_id);
    if (!booking || booking.client_id !== userId) return { err: 'Unauthorized' };
    
    stage.status = 'Rejected';
    stage.rejection_reason = reason;
    stage.rejected_at = Date.now() * 1000000;
    
    return { ok: stage };
  }

  // Projects
  async completeProject(freelancerId: string, bookingId: string) {
    const booking = mockBookings.find(b => b.booking_id === bookingId);
    if (!booking) return { err: 'Booking not found' };
    
    if (booking.freelancer_id !== freelancerId) return { err: 'Unauthorized' };
    
    booking.booking_status = 'Completed';
    return { ok: booking };
  }

  // Escrow
  async getEscrowBalance(bookingId: string) {
    const booking = mockBookings.find(b => b.booking_id === bookingId);
    if (!booking) return { err: 'Booking not found' };
    
    // Mock escrow balance
    return { ok: parseInt(booking.escrow_amount_e8s) };
  }

  // Admin
  async refundToClient(adminId: string, bookingId: string, amount_e8s: bigint, reason: string) {
    const booking = mockBookings.find(b => b.booking_id === bookingId);
    if (!booking) return { err: 'Booking not found' };
    
    return { ok: { transaction_id: 'TX-REFUND-123', amount_e8s } };
  }

  async reconcileLedger(adminId: string, startBlock: bigint, endBlock: bigint) {
    return { ok: { reconciled_transactions: 0, total_amount_e8s: 0 } };
  }

  // Stats
  async getStats() {
    return {
      total_services: mockServices.length,
      total_packages: mockPackages.length,
      total_bookings: mockBookings.length,
      total_stages: mockStages.length,
      total_transactions: mockBookings.length
    };
  }

  async getEventLog() {
    return [
      `[${Date.now()}] Mock event log entry 1`,
      `[${Date.now()}] Mock event log entry 2`,
      `[${Date.now()}] Mock event log entry 3`
    ];
  }

  // Job Posts
  async listJobPosts(filter: any) {
    return { ok: mockJobPosts.filter(job => {
      if (filter.category && job.category !== filter.category) return false;
      if (filter.client_id && job.client_id !== filter.client_id) return false;
      if (filter.search_term && !job.title.toLowerCase().includes(filter.search_term.toLowerCase())) return false;
      return true;
    }) };
  }

  async createJobPost(userId: string, jobData: any) {
    try {
      const job: MockJobPost = {
        job_id: `JP-${String(nextJobId++).padStart(8, '0')}`,
        client_id: userId,
        title: jobData.title,
        description: jobData.description,
        budget: jobData.budget,
        deadline: jobData.deadline,
        category: jobData.category,
        skills: jobData.skills || [],
        experience_level: jobData.experience_level,
        project_type: jobData.project_type,
        timeline: jobData.timeline,
        status: 'Open',
        applications_count: 0,
        created_at: Date.now(),
        updated_at: Date.now()
      };
      mockJobPosts.push(job);
      return { ok: job };
    } catch (error) {
      console.error('Error in createJobPost:', error);
      return { err: 'Failed to create job post' };
    }
  }

  async getJobPostById(jobId: string) {
    const job = mockJobPosts.find(j => j.job_id === jobId);
    if (!job) return { err: 'Job post not found' };
    return { ok: job };
  }

  async updateJobPost(userId: string, jobId: string, updates: any) {
    const jobIndex = mockJobPosts.findIndex(j => j.job_id === jobId);
    if (jobIndex === -1) return { err: 'Job post not found' };
    
    const job = mockJobPosts[jobIndex];
    if (job.client_id !== userId) return { err: 'Unauthorized' };
    
    // Update job post
    if (updates.title) job.title = updates.title;
    if (updates.description) job.description = updates.description;
    if (updates.budget) job.budget = updates.budget;
    if (updates.status) job.status = updates.status;
    job.updated_at = Date.now();
    
    return { ok: job };
  }

  async deleteJobPost(userId: string, jobId: string) {
    const jobIndex = mockJobPosts.findIndex(j => j.job_id === jobId);
    if (jobIndex === -1) return { err: 'Job post not found' };
    
    const job = mockJobPosts[jobIndex];
    if (job.client_id !== userId) return { err: 'Unauthorized' };
    
    mockJobPosts.splice(jobIndex, 1);
    return { ok: 'Job post deleted successfully' };
  }

  // Reset mock data
  reset() {
    mockServices = [];
    mockPackages = [];
    mockBookings = [];
    mockStages = [];
    mockJobPosts = [];
    nextServiceId = 1;
    nextPackageId = 1;
    nextBookingId = 1;
    nextStageId = 1;
    nextJobId = 1;
  }
}

// Export singleton instance
export const mockMarketplaceAgent = new MockMarketplaceAgent();
