// Factory for creating test package data

export interface PackageData {
  service_id: string;
  tier: string;
  title: string;
  description: string;
  price_e8s: string;
  delivery_days: number;
  features: string[];
  revisions_included: number;
  status: string;
}

export class PackageFactory {
  private static tiers = ['Basic', 'Standard', 'Premium', 'Enterprise'];
  private static statuses = ['Available', 'Unavailable'];

  private static tierFeatures = {
    'Basic': ['1 concept design', '2 revisions', 'JPG & PNG files', 'Basic support'],
    'Standard': ['3 concept designs', '5 revisions', 'Source files', 'Brand guidelines', 'Priority support'],
    'Premium': ['Unlimited concepts', 'Unlimited revisions', 'Complete brand package', 'Exclusive rights', 'Dedicated support'],
    'Enterprise': ['Custom solutions', 'Unlimited revisions', 'Complete brand identity', 'Exclusive rights', 'Dedicated team', 'Ongoing consultation']
  };

  private static tierPricing = {
    'Basic': { min: 500000000, max: 2000000000 }, // 5-20 ICP
    'Standard': { min: 2000000000, max: 5000000000 }, // 20-50 ICP
    'Premium': { min: 5000000000, max: 15000000000 }, // 50-150 ICP
    'Enterprise': { min: 15000000000, max: 50000000000 } // 150-500 ICP
  };

  private static tierDelivery = {
    'Basic': { min: 3, max: 7 },
    'Standard': { min: 5, max: 14 },
    'Premium': { min: 7, max: 21 },
    'Enterprise': { min: 14, max: 30 }
  };

  private static tierRevisions = {
    'Basic': 2,
    'Standard': 5,
    'Premium': 999, // Unlimited
    'Enterprise': 999 // Unlimited
  };

  static create(overrides: Partial<PackageData> = {}): PackageData {
    const tier = overrides.tier || this.randomItem(this.tiers);
    const pricing = this.tierPricing[tier as keyof typeof this.tierPricing];
    const delivery = this.tierDelivery[tier as keyof typeof this.tierDelivery];
    const features = this.tierFeatures[tier as keyof typeof this.tierFeatures] || [];

    const price = overrides.price_e8s || this.randomPrice(pricing.min, pricing.max).toString();
    const deliveryDays = overrides.delivery_days || this.randomInt(delivery.min, delivery.max);

    return {
      service_id: overrides.service_id || 'SV-TEST-SERVICE-ID',
      tier,
      title: overrides.title || `${tier} Package`,
      description: overrides.description || `Professional ${tier.toLowerCase()} service with comprehensive features and deliverables.`,
      price_e8s: price,
      delivery_days: deliveryDays,
      features: overrides.features || [...features],
      revisions_included: overrides.revisions_included !== undefined ? overrides.revisions_included : this.tierRevisions[tier as keyof typeof this.tierRevisions],
      status: overrides.status || this.randomItem(this.statuses),
      ...overrides
    };
  }

  static createMany(count: number, serviceId: string, overrides: Partial<PackageData> = {}): PackageData[] {
    const packages = [];
    for (let i = 0; i < count; i++) {
      packages.push(this.create({
        service_id,
        title: `Package ${i + 1}`,
        ...overrides
      }));
    }
    return packages;
  }

  static createPackageSet(serviceId: string, overrides: Partial<PackageData> = {}): PackageData[] {
    return this.tiers.map(tier => this.create({
      service_id,
      tier,
      ...overrides
    }));
  }

  static createWithTier(tier: string, serviceId: string, overrides: Partial<PackageData> = {}): PackageData {
    return this.create({ service_id: serviceId, tier, ...overrides });
  }

  static createWithCustomPrice(priceInICP: number, serviceId: string, overrides: Partial<PackageData> = {}): PackageData {
    return this.create({
      service_id: serviceId,
      price_e8s: (priceInICP * 100000000).toString(),
      ...overrides
    });
  }

  static createWithFastDelivery(serviceId: string, overrides: Partial<PackageData> = {}): PackageData {
    return this.create({
      service_id: serviceId,
      delivery_days: 1,
      tier: 'Express',
      price_e8s: '3000000000', // 30 ICP premium
      ...overrides
    });
  }

  static createInvalid(overrideType: 'negative-price' | 'zero-price' | 'negative-days' | 'missing-fields' = 'missing-fields'): PackageData {
    const basePackage = this.create();

    switch (overrideType) {
      case 'negative-price':
        return { ...basePackage, price_e8s: '-1000000000' };
      case 'zero-price':
        return { ...basePackage, price_e8s: '0' };
      case 'negative-days':
        return { ...basePackage, delivery_days: -5 };
      case 'missing-fields':
        return {
          service_id: '',
          tier: '',
          title: '',
          description: '',
          price_e8s: '',
          delivery_days: 0,
          features: [],
          revisions_included: 0,
          status: ''
        };
      default:
        return basePackage;
    }
  }

  static createWithLargeFeatures(serviceId: string, overrides: Partial<PackageData> = {}): PackageData {
    const largeFeatures = Array.from({ length: 50 }, (_, i) =>
      `Extra feature ${i + 1}: ${'A'.repeat(100)}`
    );

    return this.create({
      service_id: serviceId,
      features: largeFeatures,
      description: 'A'.repeat(2000), // 2KB description
      ...overrides
    });
  }

  // Utility method to convert ICP to e8s
  static icpToE8s(icp: number): string {
    return (icp * 100000000).toString();
  }

  // Utility method to convert e8s to ICP
  static e8sToIcp(e8s: string | number): number {
    return Number(e8s) / 100000000;
  }

  private static randomItem<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  private static randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private static randomPrice(min: number, max: number): number {
    // Generate price in increments of 100 million e8s (1 ICP)
    const increment = 100000000;
    const minIncr = Math.floor(min / increment);
    const maxIncr = Math.floor(max / increment);
    const randomIncr = this.randomInt(minIncr, maxIncr);
    return randomIncr * increment;
  }

  // Static method to get all available tiers
  static getTiers(): string[] {
    return [...this.tiers];
  }

  // Static method to get pricing range for a tier
  static getPricingRange(tier: string): { min: number; max: number } {
    return this.tierPricing[tier as keyof typeof this.tierPricing] || { min: 0, max: 0 };
  }

  // Static method to get delivery range for a tier
  static getDeliveryRange(tier: string): { min: number; max: number } {
    return this.tierDelivery[tier as keyof typeof this.tierDelivery] || { min: 1, max: 1 };
  }
}