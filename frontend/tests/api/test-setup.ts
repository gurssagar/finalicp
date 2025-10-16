import { NextRequest } from 'next/server';

// Test configuration
export const TEST_CONFIG = {
  baseUrl: 'http://localhost:3000',
  apiBase: '/api/marketplace',
  testUserId: 'TEST_USER_123',
  testFreelancerId: 'TEST_FREELANCER_456',
  testAdminId: 'TEST_ADMIN_789',
  testServiceId: 'SV-TEST1234',
  testPackageId: 'PK-TEST1234',
  testBookingId: 'BK-TEST1234',
  testStageId: 'ST-TEST1234'
};

// Mock data for testing
export const MOCK_DATA = {
  service: {
    title: 'Test UI/UX Design Service',
    main_category: 'Web Design',
    sub_category: 'UI/UX',
    description: 'Professional UI/UX design services for web and mobile applications',
    whats_included: 'Wireframes, mockups, prototypes, style guide',
    cover_image_url: 'https://example.com/test-image.jpg',
    portfolio_images: ['https://example.com/portfolio1.jpg', 'https://example.com/portfolio2.jpg'],
    status: 'Active' as const
  },
  package: {
    service_id: 'SV-TEST1234',
    tier: 'Basic' as const,
    title: 'Basic Website Design Package',
    description: 'Simple website design with 3 pages',
    price_e8s: '5000000000', // 50 ICP
    delivery_days: 7,
    features: ['3 pages', 'Mobile responsive', 'Basic SEO'],
    revisions_included: 2,
    status: 'Available' as const
  },
  booking: {
    clientId: 'TEST_USER_123',
    packageId: 'PK-TEST1234',
    specialInstructions: 'Please focus on mobile-first design and ensure accessibility compliance'
  },
  stage: {
    title: 'Wireframes',
    description: 'Create wireframes for all pages',
    amount_e8s: '2500000000' // 25 ICP
  }
};

// Helper function to create test request
export function createTestRequest(method: string, url: string, body?: any): NextRequest {
  const request = new NextRequest(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return request;
}

// Helper function to make API calls
export async function makeApiCall(endpoint: string, method: string = 'GET', body?: any) {
  const url = `${TEST_CONFIG.baseUrl}${TEST_CONFIG.apiBase}${endpoint}`;
  
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();
  return { response, data };
}

// Test result interface
export interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  response?: any;
  duration: number;
}

// Test runner
export class TestRunner {
  private results: TestResult[] = [];

  async runTest(name: string, testFn: () => Promise<void>): Promise<TestResult> {
    const startTime = Date.now();
    let passed = false;
    let error: string | undefined;

    try {
      await testFn();
      passed = true;
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
    }

    const duration = Date.now() - startTime;
    const result: TestResult = { name, passed, error, duration };
    this.results.push(result);
    return result;
  }

  getResults(): TestResult[] {
    return this.results;
  }

  getSummary() {
    const total = this.results.length;
    const passed = this.results.filter(r => r.passed).length;
    const failed = total - passed;
    
    return {
      total,
      passed,
      failed,
      successRate: total > 0 ? (passed / total) * 100 : 0
    };
  }

  printResults() {
    console.log('\n🧪 API Test Results');
    console.log('==================');
    
    this.results.forEach(result => {
      const status = result.passed ? '✅' : '❌';
      const duration = `${result.duration}ms`;
      console.log(`${status} ${result.name} (${duration})`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
    });

    const summary = this.getSummary();
    console.log('\n📊 Summary');
    console.log('==========');
    console.log(`Total Tests: ${summary.total}`);
    console.log(`Passed: ${summary.passed}`);
    console.log(`Failed: ${summary.failed}`);
    console.log(`Success Rate: ${summary.successRate.toFixed(1)}%`);
  }
}
