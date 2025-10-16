# ICPWork API Tests

This directory contains comprehensive test suites for the ICPWork API endpoints. The tests are designed to validate the functionality, reliability, and performance of the marketplace canister integration.

## 📁 Directory Structure

```
tests/api/
├── README.md                    # This file
├── test-setup.ts               # Core test configuration and utilities
├── run-all-tests.ts            # Main test runner
├── factories/                  # Test data factories
│   ├── service-factory.ts     # Service data generation
│   ├── package-factory.ts     # Package data generation
│   └── booking-factory.ts     # Booking data generation
├── utils/                      # Test utilities and helpers
│   ├── test-helpers.ts        # General test utilities
│   └── api-client.ts          # Enhanced API client
├── services.test.ts            # Services API tests
├── integration.test.ts         # Integration tests
├── error-handling.test.ts      # Error handling tests
├── data-validation.test.ts     # Data validation tests
├── performance.test.ts         # Performance and load tests
├── packages.test.ts            # Packages API tests
├── bookings.test.ts            # Bookings API tests
└── stages.test.ts              # Stages API tests
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm installed
- Development server running (`npm run dev`)
- Environment variables configured (see `.env.example`)

### Running Tests

#### Run All Tests
```bash
npx ts-node tests/api/run-all-tests.ts
```

#### Run Individual Test Suites
```bash
# Run only services tests
npx ts-node tests/api/services.test.ts

# Run integration tests
npx ts-node tests/api/integration.test.ts

# Run error handling tests
npx ts-node tests/api/error-handling.test.ts

# Run performance tests
npx ts-node tests/api/performance.test.ts
```

#### Run Tests from Package.json (if configured)
```bash
npm run test:api
npm run test:integration
npm run test:performance
```

## 🧪 Test Categories

### 1. **Services API Tests** (`services.test.ts`)
- ✅ List services with filters
- ✅ Create new services
- ✅ Get service by ID
- ✅ Update services
- ✅ Delete services
- ✅ Authorization checks
- ✅ Data validation

### 2. **Integration Tests** (`integration.test.ts`)
- ✅ Complete service lifecycle
- ✅ Multi-service interactions
- ✅ Cross-resource dependencies
- ✅ End-to-end workflows
- ✅ Error recovery scenarios

### 3. **Error Handling Tests** (`error-handling.test.ts`)
- ✅ Invalid request data
- ✅ Missing required fields
- ✅ Non-existent resources
- ✅ Unauthorized access
- ✅ Malformed requests
- ✅ Database constraint violations

### 4. **Data Validation Tests** (`data-validation.test.ts`)
- ✅ Input field validation
- ✅ Query parameter validation
- ✅ Response structure validation
- ✅ ID format validation
- ✅ Type checking

### 5. **Performance Tests** (`performance.test.ts`)
- ✅ Response time benchmarks
- ✅ Bulk operations performance
- ✅ Concurrent request handling
- ✅ Large response handling
- ✅ Search performance

## 🏭 Test Data Factories

The `factories/` directory contains classes for generating realistic test data:

### ServiceFactory
```typescript
import { ServiceFactory } from './factories/service-factory';

// Create a basic service
const service = ServiceFactory.create();

// Create multiple services
const services = ServiceFactory.createMany(10);

// Create service with specific category
const techService = ServiceFactory.createWithCategory('Technology');

// Create invalid service for error testing
const invalidService = ServiceFactory.createInvalid('missing-title');
```

### PackageFactory
```typescript
import { PackageFactory } from './factories/package-factory';

// Create a basic package
const package = PackageFactory.create();

// Create package set for a service
const packages = PackageFactory.createPackageSet('SERVICE-ID');

// Create package with custom pricing
const customPackage = PackageFactory.createWithCustomPrice(50, 'SERVICE-ID');
```

### BookingFactory
```typescript
import { BookingFactory } from './factories/booking-factory';

// Create a booking
const booking = BookingFactory.create();

// Create stages for a project
const stages = BookingFactory.createStages(3, '5000000000');
```

## 🛠️ Test Utilities

### TestHelpers
```typescript
import { TestHelpers } from './utils/test-helpers';

// Measure execution time
const { result, duration } = await TestHelpers.measureTime(async () => {
  return await someAsyncOperation();
});

// Generate random test data
const email = TestHelpers.randomEmail();
const id = TestHelpers.randomId('TEST');
const timestamp = TestHelpers.formatDate(new Date());

// Cleanup utilities
await TestHelpers.cleanupCreated(createdServices, deleteService);
```

### ApiClient
```typescript
import { apiClient } from './utils/api-client';

// Enhanced API calls with timing and error handling
const response = await apiClient.get('/services');
console.log(`Request took ${response.duration}ms`);

// Batch requests
const responses = await apiClient.makeBatchRequests([
  { endpoint: '/services' },
  { endpoint: '/stats' }
]);

// Performance measurement
const stats = await apiClient.measureEndpointPerformance('/services', 10);
```

## 📊 Test Results

### Output Format
```
🧪 API Test Results
==================
✅ List Services - Empty Result (234ms)
✅ Create Service (1256ms)
✅ Get Service by ID (89ms)
✅ Update Service (567ms)
✅ Delete Service (234ms)

📊 Summary
==========
Total Tests: 5
Passed: 5
Failed: 0
Success Rate: 100.0%
Total Duration: 2380ms
Average Duration: 476.0ms
```

### Performance Benchmarks
- **List Services**: < 2 seconds
- **Create Service**: < 3 seconds
- **Get Service**: < 1 second
- **Update Service**: < 2 seconds
- **Delete Service**: < 1 second

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file with:
```env
# API Configuration
API_BASE_URL=http://localhost:3000
API_BASE_PATH=/api/marketplace

# Test Configuration
TEST_TIMEOUT=30000
TEST_RETRIES=3
TEST_BATCH_SIZE=10

# Test Configuration
USE_REAL_CANISTER=true
```

### Test Configuration
Edit `test-setup.ts` to modify:
- Base URLs and endpoints
- Test user credentials
- Default timeouts and retry counts
- Mock data settings

## 🐛 Troubleshooting

### Common Issues

#### 1. **Server Not Running**
```bash
Error: connect ECONNREFUSED
Solution: Make sure the development server is running with `npm run dev`
```

#### 2. **Test Timeouts**
```bash
Error: Request timeout
Solution: Increase timeout in test-setup.ts or check server performance
```

#### 3. **Test Data Conflicts**
```bash
Error: Test data conflicts
Solution: Ensure proper cleanup between test runs
```

#### 4. **ICP Configuration**
```bash
Error: Marketplace service not configured
Solution: Set MARKETPLACE_CANISTER_ID in your environment
```

### Debug Mode

Enable debug logging by setting:
```bash
DEBUG=true npx ts-node tests/api/run-all-tests.ts
```

## 📈 Test Coverage

The test suite covers:

### ✅ API Endpoints
- `GET /api/marketplace/services`
- `POST /api/marketplace/services`
- `GET /api/marketplace/services/[id]`
- `PUT /api/marketplace/services/[id]`
- `DELETE /api/marketplace/services/[id]`
- `GET /api/marketplace/services/[id]/packages`
- `POST /api/marketplace/packages`
- `GET /api/marketplace/bookings`
- `POST /api/marketplace/bookings`

### ✅ Functional Areas
- ✅ CRUD operations
- ✅ Authentication & authorization
- ✅ Data validation
- ✅ Error handling
- ✅ Performance benchmarks
- ✅ Integration scenarios

### ✅ Edge Cases
- ✅ Invalid input data
- ✅ Missing required fields
- ✅ Non-existent resources
- ✅ Concurrent access
- ✅ Large data handling

## 🔄 Continuous Integration

### GitHub Actions (Example)
```yaml
name: API Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run dev &
      - run: sleep 10
      - run: npm run test:api
```

## 📝 Writing New Tests

### Test Template
```typescript
import { TestRunner, assertEqual, ServiceFactory } from './test-setup';

export async function runNewFeatureTests(): Promise<void> {
  const runner = new TestRunner();

  await runner.runTest('Test Case Name', async () => {
    // Arrange
    const testData = ServiceFactory.create();

    // Act
    const response = await makeApiCall('/endpoint', 'POST', testData);

    // Assert
    assertEqual(response.response.ok, true);
    assertEqual(response.data.success, true);
  });

  runner.printResults();
  return runner.getResults();
}
```

### Best Practices
1. **Use factories** for generating test data
2. **Clean up** created resources after tests
3. **Test both happy paths and edge cases**
4. **Include performance assertions** where relevant
5. **Use descriptive test names**
6. **Clean up test data** after each test suite

## 🤝 Contributing

1. Add new tests to the appropriate test file
2. Update factories if new data types are needed
3. Add utilities to `utils/` if they're generally useful
4. Update this README when adding new test categories
5. Ensure all tests pass before submitting

## 📞 Support

For test-related issues:
1. Check the troubleshooting section above
2. Review the test output for specific error messages
3. Verify the development server is running properly
4. Check environment configuration
5. Create an issue with detailed error information

---

**Note**: These tests are designed to work with the real ICP canister for integration testing. Ensure your marketplace canister is deployed and accessible.