# Marketplace API Tests

Comprehensive test suite for the ICP Ledger Freelance Marketplace API endpoints.

## 🧪 Test Coverage

### Services API (8 tests)
- ✅ List services (empty result)
- ✅ Create service
- ✅ Get service by ID
- ✅ Update service
- ✅ List services with filters
- ✅ Delete service
- ✅ Get non-existent service (404)
- ✅ Create service without user ID (400)

### Packages API (8 tests)
- ✅ Create package
- ✅ Get packages by service
- ✅ Get package by ID
- ✅ Update package
- ✅ Get packages without service ID (400)
- ✅ Create package without user ID (400)
- ✅ Get non-existent package (404)
- ✅ Delete package

### Bookings API (11 tests)
- ✅ Book package
- ✅ Get booking by ID
- ✅ List bookings for client
- ✅ List bookings for freelancer
- ✅ List bookings with status filter
- ✅ Cancel booking
- ✅ Book package without client ID (400)
- ✅ Book package without package ID (400)
- ✅ List bookings without user ID (400)
- ✅ List bookings without user type (400)
- ✅ Get non-existent booking (404)

### Stages API (13 tests)
- ✅ Create stages for booking
- ✅ List stages for booking
- ✅ Get stage by ID
- ✅ Submit stage work
- ✅ Approve stage
- ✅ Submit second stage
- ✅ Reject stage
- ✅ Create stages without freelancer ID (400)
- ✅ Create stages without booking ID (400)
- ✅ Submit stage without notes (400)
- ✅ Reject stage without reason (400)
- ✅ Invalid action (400)
- ✅ Get non-existent stage (404)

**Total: 40 comprehensive API tests**

## 🚀 Running Tests

### Prerequisites
1. Start the Next.js development server:
```bash
cd /home/neoweave/Documents/github/finalicp/frontend
npm run dev
```

2. Install test dependencies:
```bash
cd tests/api
npm install
```

### Run All Tests
```bash
npm test
```

### Run Individual Test Suites
```bash
npm run test:services
npm run test:packages
npm run test:bookings
npm run test:stages
```

### Watch Mode
```bash
npm run test:watch
```

## 📊 Test Results

The test suite provides detailed results including:
- ✅ Pass/fail status for each test
- ⏱️ Execution time for each test
- 📈 Success rate percentage
- 🔍 Detailed error messages for failed tests
- 📋 Summary statistics

## 🛠️ Test Structure

```
tests/api/
├── test-setup.ts           # Test configuration and utilities
├── services.test.ts        # Services API tests
├── packages.test.ts        # Packages API tests
├── bookings.test.ts        # Bookings API tests
├── stages.test.ts          # Stages API tests
├── run-all-tests.ts       # Test runner
├── package.json           # Test dependencies
└── README.md              # This file
```

## 🔧 Test Configuration

The tests use the following configuration:
- **Base URL**: `http://localhost:3000`
- **API Base**: `/api/marketplace`
- **Test Users**: Predefined test user IDs
- **Mock Data**: Realistic test data for all entities

## 🎯 Test Features

### Comprehensive Coverage
- **CRUD Operations**: All create, read, update, delete operations
- **Error Handling**: Invalid input and missing data scenarios
- **Authentication**: User ID validation
- **Authorization**: Resource ownership verification
- **Edge Cases**: Non-existent resources, invalid parameters

### Realistic Test Data
- **Services**: Complete service data with categories and descriptions
- **Packages**: Tier-based pricing with features and delivery times
- **Bookings**: Full booking flow with special instructions
- **Stages**: Multi-stage project execution with submissions and approvals

### Production-Ready Testing
- **Type Safety**: Full TypeScript support
- **Error Validation**: Proper HTTP status codes
- **Response Validation**: Data structure verification
- **Performance**: Execution time tracking

## 🚨 Common Issues and Fixes

### Test Failures
1. **Server Not Running**: Ensure Next.js dev server is running on port 3000
2. **Network Issues**: Check localhost connectivity
3. **API Errors**: Verify API route implementations
4. **Data Issues**: Check mock data consistency

### Debugging
- Check console output for detailed error messages
- Verify API endpoint responses manually
- Ensure all required fields are provided
- Check for TypeScript compilation errors

## 📈 Success Metrics

- **Target Success Rate**: 100%
- **Expected Duration**: < 30 seconds for all tests
- **Coverage**: All API endpoints and error scenarios
- **Reliability**: Consistent results across runs

## 🔄 Continuous Testing

The test suite is designed for:
- **Development**: Run during API development
- **CI/CD**: Integrate with automated pipelines
- **Regression**: Catch breaking changes
- **Documentation**: Verify API behavior

---

**Note**: These tests validate the API routes implementation. For full marketplace functionality, ensure the Motoko canister is deployed and the IC agent is properly configured.
