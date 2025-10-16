// Factory for creating test booking data

export interface BookingData {
  package_id: string;
  client_id: string;
  special_instructions?: string;
}

export interface StageData {
  title: string;
  description: string;
  amount_e8s: string;
}

export class BookingFactory {
  private static instructions = [
    'Please focus on mobile-first design and ensure accessibility compliance',
    'I need this for a startup launch, so please include modern design trends',
    'Make it compatible with both desktop and mobile devices',
    'Include SEO optimization and performance optimization',
    'Target audience is young professionals (25-35 years old)',
    'Brand colors are #3B82F6 (blue) and #10B981 (green)',
    'Please provide source files and documentation',
    'Need this completed within the specified timeline',
    'Include responsive design for all screen sizes',
    'Focus on user experience and conversion optimization'
  ];

  private static stageTitles = [
    'Research and Planning',
    'Design Concept',
    'Initial Design',
    'Design Refinement',
    'Final Design',
    'Development',
    'Testing',
    'Delivery',
    'Review',
    'Revisions'
  ];

  private static stageDescriptions = [
    'Initial research and requirement gathering phase',
    'Create design concepts and mockups',
    'Develop the initial version of the project',
    'Refine based on feedback and requirements',
    'Finalize the design and prepare for delivery',
    'Complete development of all features',
    'Thorough testing and quality assurance',
    'Prepare final deliverables and documentation',
    'Client review and approval',
    'Implement requested changes and improvements'
  ];

  static create(overrides: Partial<BookingData> = {}): BookingData {
    return {
      package_id: overrides.package_id || 'PK-TEST-PACKAGE-ID',
      client_id: overrides.client_id || 'CLIENT-TEST-USER-ID',
      special_instructions: overrides.special_instructions || this.randomItem(this.instructions),
      ...overrides
    };
  }

  static createStage(overrides: Partial<StageData> = {}): StageData {
    const title = overrides.title || this.randomItem(this.stageTitles);
    const amountE8s = overrides.amount_e8s || (Math.floor(Math.random() * 5) + 1) * 1000000000; // 1-5 ICP

    return {
      title,
      description: overrides.description || this.randomItem(this.stageDescriptions),
      amount_e8s: amountE8s.toString(),
      ...overrides
    };
  }

  static createStages(count: number, totalAmountE8s: string, overrides: Partial<StageData> = {}): StageData[] {
    const stages = [];
    const stageAmount = Math.floor(Number(totalAmountE8s) / count);

    for (let i = 0; i < count; i++) {
      stages.push(this.createStage({
        title: `Stage ${i + 1}: ${this.stageTitles[i % this.stageTitles.length]}`,
        amount_e8s: stageAmount.toString(),
        ...overrides
      }));
    }

    return stages;
  }

  static createWithUrgentInstructions(overrides: Partial<BookingData> = {}): BookingData {
    return this.create({
      special_instructions: 'URGENT: This is a time-sensitive project. Please prioritize and expedite delivery.',
      ...overrides
    });
  }

  static createWithComplexRequirements(overrides: Partial<BookingData> = {}): BookingData {
    return this.create({
      special_instructions: 'This project has complex requirements including multi-platform compatibility, API integration, and custom functionality. Please ensure all technical specifications are met.',
      ...overrides
    });
  }

  static createInvalid(overrideType: 'missing-package-id' | 'missing-client-id' | 'empty-fields' = 'empty-fields'): BookingData {
    const baseBooking = this.create();

    switch (overrideType) {
      case 'missing-package-id':
        return { ...baseBooking, package_id: '' };
      case 'missing-client-id':
        return { ...baseBooking, client_id: '' };
      case 'empty-fields':
        return {
          package_id: '',
          client_id: '',
          special_instructions: ''
        };
      default:
        return baseBooking;
    }
  }

  static createWithSpecialCharacters(overrides: Partial<BookingData> = {}): BookingData {
    return this.create({
      special_instructions: 'Special requirements: émojis! 🎨🚀, unicode: 中文测试, accents: café résumé, symbols: @#$%^&*()',
      ...overrides
    });
  }

  static createWithLongInstructions(overrides: Partial<BookingData> = {}): BookingData {
    const longInstructions = 'A'.repeat(2000); // 2KB of instructions

    return this.create({
      special_instructions: longInstructions,
      ...overrides
    });
  }

  private static randomItem<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  // Static method to get all available instructions
  static getInstructions(): string[] {
    return [...this.instructions];
  }

  // Static method to get all available stage titles
  static getStageTitles(): string[] {
    return [...this.stageTitles];
  }

  // Static method to get all available stage descriptions
  static getStageDescriptions(): string[] {
    return [...this.stageDescriptions];
  }

  // Utility method to calculate stage amounts
  static calculateStageAmounts(totalAmountE8s: string, stageCount: number): string[] {
    const total = Number(totalAmountE8s);
    const baseAmount = Math.floor(total / stageCount);
    const remainder = total % stageCount;

    const amounts = [];
    for (let i = 0; i < stageCount; i++) {
      // Add remainder to first stage
      const amount = i === 0 ? baseAmount + remainder : baseAmount;
      amounts.push(amount.toString());
    }

    return amounts;
  }

  // Utility method to validate stage amounts sum
  static validateStageAmounts(stageAmounts: string[], expectedTotal: string): boolean {
    const actualTotal = stageAmounts.reduce((sum, amount) => sum + Number(amount), 0);
    return actualTotal === Number(expectedTotal);
  }
}