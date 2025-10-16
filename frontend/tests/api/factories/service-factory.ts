// Factory for creating test service data

export interface ServiceData {
  title: string;
  main_category: string;
  sub_category: string;
  description: string;
  whats_included: string;
  cover_image_url?: string;
  portfolio_images: string[];
  status: string;
}

export class ServiceFactory {
  private static categories = [
    'Technology', 'Design', 'Marketing', 'Business', 'Writing', 'Video', 'Audio', 'Photography'
  ];

  private static subCategories = {
    'Technology': ['Web Development', 'Mobile Apps', 'Software Development', 'DevOps', 'Data Science', 'AI/ML'],
    'Design': ['UI/UX Design', 'Graphic Design', 'Logo Design', 'Web Design', 'Brand Identity', 'Illustration'],
    'Marketing': ['Digital Marketing', 'SEO', 'Content Marketing', 'Social Media Marketing', 'Email Marketing', 'PPC'],
    'Business': ['Business Strategy', 'Market Research', 'Business Plans', 'Financial Analysis', 'Consulting'],
    'Writing': ['Content Writing', 'Copywriting', 'Technical Writing', 'Creative Writing', 'Resume Writing'],
    'Video': ['Video Editing', 'Video Production', 'Motion Graphics', 'Animation', 'Video Marketing'],
    'Audio': ['Music Production', 'Audio Editing', 'Podcast Production', 'Voice Over', 'Sound Design'],
    'Photography': ['Product Photography', 'Portrait Photography', 'Event Photography', 'Photo Editing']
  };

  private static titles = {
    'Web Development': [
      'Custom Website Development',
      'E-commerce Website Setup',
      'Landing Page Design',
      'Full Stack Web Application',
      'Responsive Website Redesign'
    ],
    'UI/UX Design': [
      'Mobile App UI Design',
      'Website UX Audit',
      'Design System Creation',
      'User Research & Testing',
      'Interactive Prototype Design'
    ],
    'Digital Marketing': [
      'Social Media Marketing Campaign',
      'SEO Optimization Package',
      'Content Marketing Strategy',
      'Email Marketing Setup',
      'PPC Campaign Management'
    ],
    'Business Strategy': [
      'Business Plan Development',
      'Market Research Analysis',
      'Growth Strategy Consulting',
      'Competitive Analysis',
      'Business Model Design'
    ]
  };

  private static descriptions = [
    'Professional service with high-quality deliverables and timely communication.',
    'Expert solution tailored to your specific needs and requirements.',
    'Comprehensive service with attention to detail and customer satisfaction.',
    'Premium service with proven results and client testimonials.',
    'Reliable service with extensive experience in the industry.'
  ];

  private static inclusions = [
    'Initial consultation and requirements gathering',
    'Regular progress updates and communication',
    'Final delivery with source files',
    '30 days of post-completion support',
    'Unlimited revisions until satisfaction'
  ];

  static create(overrides: Partial<ServiceData> = {}): ServiceData {
    const category = overrides.main_category || this.randomItem(this.categories);
    const subCategories = this.subCategories[category as keyof typeof this.subCategories] || [];
    const subCategory = overrides.sub_category || this.randomItem(subCategories);

    const titles = this.titles[subCategory as keyof typeof this.titles] || [];
    const title = overrides.title || this.randomItem(titles) || `Professional ${subCategory} Service`;

    return {
      title,
      main_category: category,
      sub_category: subCategory,
      description: overrides.description || this.randomItem(this.descriptions),
      whats_included: overrides.whats_included || this.randomItem(this.inclusions),
      cover_image_url: overrides.cover_image_url || `https://example.com/test-image-${Math.random().toString(36).substr(2, 9)}.jpg`,
      portfolio_images: overrides.portfolio_images || [
        `https://example.com/portfolio-${Math.random().toString(36).substr(2, 9)}-1.jpg`,
        `https://example.com/portfolio-${Math.random().toString(36).substr(2, 9)}-2.jpg`
      ],
      status: overrides.status || 'Active',
      ...overrides
    };
  }

  static createMany(count: number, overrides: Partial<ServiceData> = {}): ServiceData[] {
    return Array.from({ length: count }, (_, index) =>
      this.create({ ...overrides, title: `${overrides.title || 'Test Service'} ${index + 1}` })
    );
  }

  static createWithCategory(category: string, overrides: Partial<ServiceData> = {}): ServiceData {
    return this.create({ main_category: category, ...overrides });
  }

  static createMinimal(overrides: Partial<ServiceData> = {}): ServiceData {
    return this.create({
      title: 'Minimal Test Service',
      main_category: 'Technology',
      sub_category: 'Web Development',
      description: 'Minimal test service description',
      whats_included: 'Basic inclusions',
      portfolio_images: [],
      ...overrides
    });
  }

  static createWithLargeData(overrides: Partial<ServiceData> = {}): ServiceData {
    return this.create({
      title: 'Large Data Test Service',
      description: 'A'.repeat(5000), // 5KB description
      whats_included: 'B'.repeat(2000), // 2KB inclusions
      portfolio_images: Array.from({ length: 10 }, (_, i) =>
        `https://example.com/large-portfolio-${i + 1}.jpg`
      ),
      ...overrides
    });
  }

  static createInvalid(overrideType: 'missing-title' | 'missing-category' | 'missing-description' | 'empty-fields' = 'empty-fields'): ServiceData {
    const baseService = this.create();

    switch (overrideType) {
      case 'missing-title':
        return { ...baseService, title: '' };
      case 'missing-category':
        return { ...baseService, main_category: '' };
      case 'missing-description':
        return { ...baseService, description: '' };
      case 'empty-fields':
        return {
          title: '',
          main_category: '',
          sub_category: '',
          description: '',
          whats_included: '',
          cover_image_url: '',
          portfolio_images: [],
          status: ''
        };
      default:
        return baseService;
    }
  }

  private static randomItem<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  // Static method to get all available categories
  static getCategories(): string[] {
    return [...this.categories];
  }

  // Static method to get subcategories for a category
  static getSubCategories(category: string): string[] {
    return this.subCategories[category as keyof typeof this.subCategories] || [];
  }

  // Static method to get example titles for a subcategory
  static getExampleTitles(subCategory: string): string[] {
    return this.titles[subCategory as keyof typeof this.titles] || [];
  }
}