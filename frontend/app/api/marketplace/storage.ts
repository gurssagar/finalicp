// Simple file-based storage for marketplace data
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const STORAGE_DIR = '/tmp/marketplace-storage';
const SERVICES_FILE = join(STORAGE_DIR, 'services.json');
const PACKAGES_FILE = join(STORAGE_DIR, 'packages.json');

// Ensure storage directory exists
try {
  if (!existsSync(STORAGE_DIR)) {
    mkdirSync(STORAGE_DIR, { recursive: true });
  }
} catch (error) {
  console.error('Could not create storage directory:', error);
}

export interface Service {
  service_id: string;
  freelancer_email: string; // Primary identifier for service owner
  title: string;
  main_category: string;
  sub_category: string;
  description: string;
  description_format: 'plain' | 'markdown'; // Format type for description
  whats_included: string;
  cover_image_url: string;
  portfolio_images: string[];
  status: string;
  rating_avg: number;
  total_orders: number;
  created_at: string;
  updated_at: string;

  // NEW FIELDS FROM ADD-SERVICE FORMS
  tier_mode: '1tier' | '3tier';
  client_questions: Array<{
    id: string;
    type: string;
    question: string;
    required: boolean;
  }>;
  faqs: Array<{
    id: string;
    question: string;
    answer: string;
  }>;

  // Package details (embedded for easier access)
  packages: Array<{
    package_id: string;
    tier: string;
    title: string;
    description: string;
    price_e8s: number;
    delivery_days: number;
    features: string[];
    revisions_included: number;
    status: string;
  }>;
}

export interface Package {
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
  created_at: string;
  updated_at: string;
}

// Service storage functions
export function getServices(): Service[] {
  try {
    if (existsSync(SERVICES_FILE)) {
      const data = readFileSync(SERVICES_FILE, 'utf8');
      const services = JSON.parse(data);
      // Ensure backward compatibility for description_format
      return services.map((service: any) => ({
        ...service,
        description_format: service.description_format || 'markdown'
      }));
    }
    return [];
  } catch (error) {
    console.error('Error reading services:', error);
    return [];
  }
}

export function saveServices(services: Service[]): void {
  try {
    writeFileSync(SERVICES_FILE, JSON.stringify(services, null, 2));
  } catch (error) {
    console.error('Error saving services:', error);
  }
}

export function addService(service: Service): void {
  const services = getServices();
  // Ensure description_format is set for backward compatibility
  const serviceWithFormat = {
    ...service,
    description_format: service.description_format || 'markdown'
  };
  services.push(serviceWithFormat);
  saveServices(services);
}

export function getServiceById(serviceId: string): Service | null {
  try {
    const services = getServices();
    return services.find(service => service.service_id === serviceId) || null;
  } catch (error) {
    console.error('Error finding service by ID:', error);
    return null;
  }
}

export function getSimilarServices(category: string, limit: number = 3): Service[] {
  try {
    const services = getServices();
    return services
      .filter(service => service.main_category === category)
      .slice(0, limit);
  } catch (error) {
    console.error('Error finding similar services:', error);
    return [];
  }
}

// Package storage functions
export function getPackages(): Package[] {
  try {
    if (existsSync(PACKAGES_FILE)) {
      const data = readFileSync(PACKAGES_FILE, 'utf8');
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('Error reading packages:', error);
    return [];
  }
}

export function savePackages(packages: Package[]): void {
  try {
    writeFileSync(PACKAGES_FILE, JSON.stringify(packages, null, 2));
  } catch (error) {
    console.error('Error saving packages:', error);
  }
}

export function addPackage(pkg: Package): void {
  const packages = getPackages();
  packages.push(pkg);
  savePackages(packages);
}

export function getPackagesByServiceId(serviceId: string): Package[] {
  const packages = getPackages();
  return packages.filter(pkg => pkg.service_id === serviceId);
}

export function getPackageById(packageId: string): Package | null {
  try {
    // First try standalone packages in packages.json
    const packages = getPackages();
    const standalonePackage = packages.find(pkg => pkg.package_id === packageId);
    if (standalonePackage) {
      return standalonePackage;
    }

    // If not found, search embedded packages in all services
    const services = getServices();
    for (const service of services) {
      if (service.packages && service.packages.length > 0) {
        const embeddedPackage = service.packages.find(pkg => pkg.package_id === packageId);
        if (embeddedPackage) {
          // Convert embedded package to Package interface format
          return {
            package_id: embeddedPackage.package_id,
            service_id: service.service_id,
            tier: embeddedPackage.tier,
            title: embeddedPackage.title,
            description: embeddedPackage.description,
            price_e8s: String(embeddedPackage.price_e8s), // Convert to string to match interface
            delivery_days: embeddedPackage.delivery_days,
            features: embeddedPackage.features,
            revisions_included: embeddedPackage.revisions_included,
            status: embeddedPackage.status,
            created_at: service.created_at,
            updated_at: service.updated_at
          };
        }
      }
    }

    // Package not found in either location
    console.warn(`Package not found: ${packageId}. Searched ${packages.length} standalone packages and ${services.length} services.`);
    return null;
  } catch (error) {
    console.error('Error finding package by ID:', error);
    return null;
  }
}