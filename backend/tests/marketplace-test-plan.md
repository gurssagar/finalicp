# Marketplace Test Plan

## Overview
Comprehensive test plan for the ICP Ledger Freelance Marketplace canister, covering unit tests, integration tests, and canister upgrade scenarios.

## Test Environment Setup

### Prerequisites
- Internet Computer SDK (dfx) installed
- Node.js 18+ for frontend tests
- Test ICP tokens for ledger operations

### Test Data
- Test users: USER123, USER456, USER789
- Test services: Web Design, UI/UX, Frontend Development
- Test packages: Basic, Advanced, Premium tiers
- Test bookings with various statuses

## Unit Tests

### TC001: Service Creation
**Test Case**: Create service with valid data
**Input**: 
```motoko
let serviceData = {
  title = "Test Service";
  main_category = "Web Design";
  sub_category = "UI/UX";
  description = "Test service description";
  whats_included = "Test deliverables";
  cover_image_url = null;
  portfolio_images = [];
  status = #Active;
};
```
**Expected Result**: 
- Service created with ID format "SV-XXXXXXXX"
- Service stored in stable storage
- Service status = #Active
- Created_at timestamp set

**Test Steps**:
1. Call `createService("USER123", serviceData)`
2. Verify return type is `#ok(Service)`
3. Verify service ID format matches `/^SV-[A-F0-9]{8}$/`
4. Verify service stored in canister state
5. Verify authorization check passed

### TC002: Package Creation
**Test Case**: Create package linked to service
**Input**:
```motoko
let packageData = {
  service_id = "SV-12345678";
  tier = #Basic;
  title = "Basic Package";
  description = "Basic service package";
  price_e8s = 50_000_000; // 0.5 ICP
  delivery_days = 7;
  features = ["Feature 1", "Feature 2"];
  revisions_included = 2;
  status = #Available;
};
```
**Expected Result**:
- Package created with ID format "PK-XXXXXXXX"
- Package linked to service
- Price validation passed
- Package stored in stable storage

### TC003: Booking Creation with Mock Ledger
**Test Case**: Book package with mock ledger transfer
**Input**:
```motoko
let clientId = "USER123";
let packageId = "PK-12345678";
let idempotencyKey = "test-key-123";
let specialInstructions = "Test instructions";
```
**Expected Result**:
- Booking created with ID format "BK-XXXXXXXX"
- Mock ledger transfer returns block index
- Payment status = #Funded
- Booking status = #InProgress
- Escrow amount calculated correctly
- Platform fee calculated (5%)

**Test Steps**:
1. Set `USE_MOCK_LEDGER = true`
2. Call `bookPackage(clientId, packageId, idempotencyKey, specialInstructions)`
3. Verify booking created successfully
4. Verify mock ledger transfer called
5. Verify payment status updated
6. Verify idempotency key stored

### TC004: Stage Creation and Submission
**Test Case**: Create stages and submit work
**Input**:
```motoko
let stageDefinitions = [
  {
    title = "Stage 1";
    description = "First stage";
    amount_e8s = 25_000_000; // 0.25 ICP
  },
  {
    title = "Stage 2";
    description = "Second stage";
    amount_e8s = 25_000_000; // 0.25 ICP
  }
];
```
**Expected Result**:
- Stages created with IDs "ST-XXXXXXXX"
- Stage amounts sum equals booking amount
- Stages linked to booking
- Submission updates stage status

### TC005: Stage Approval and Fund Release
**Test Case**: Approve stage and release funds
**Input**: Stage ID of submitted stage
**Expected Result**:
- Stage status = #Approved
- Mock ledger transfer to freelancer
- Mock ledger transfer to platform (5% fee)
- Stage status = #Released
- Transaction records created

### TC006: Refund Processing
**Test Case**: Admin refund to client
**Input**:
```motoko
let adminId = "ADMIN123";
let bookingId = "BK-12345678";
let amount_e8s = 50_000_000; // 0.5 ICP
let reason = "Client requested refund";
```
**Expected Result**:
- Refund transaction created
- Mock ledger transfer to client
- Booking status = #Cancelled
- Payment status = #Refunded

## Integration Tests

### IT001: Complete Booking Flow
**Test Case**: End-to-end booking process
**Steps**:
1. Create service
2. Create package for service
3. Book package (with real ledger in testnet)
4. Create stages
5. Submit stage
6. Approve stage
7. Verify fund release
8. Complete project

**Expected Result**: All operations succeed with real ledger integration

### IT002: Ledger Reconciliation
**Test Case**: Reconcile ledger transactions
**Input**: Start and end block numbers
**Expected Result**:
- Reconciliation report generated
- Unmatched transactions identified
- Internal records match ledger data

### IT003: Error Handling
**Test Case**: Test various error scenarios
**Scenarios**:
- Invalid user ID
- Non-existent package
- Insufficient funds
- Duplicate booking
- Invalid stage amounts

**Expected Result**: Appropriate error messages returned

## Canister Upgrade Tests

### UT001: Data Persistence
**Test Case**: Verify data survives canister upgrade
**Steps**:
1. Create test data (services, packages, bookings, stages)
2. Perform canister upgrade
3. Verify all data persists
4. Verify stable storage migration

**Expected Result**: All data intact after upgrade

### UT002: State Migration
**Test Case**: Test preupgrade/postupgrade hooks
**Steps**:
1. Populate canister with test data
2. Trigger preupgrade
3. Upgrade canister
4. Trigger postupgrade
5. Verify state reconstruction

**Expected Result**: State correctly migrated

## Performance Tests

### PT001: Large Dataset Handling
**Test Case**: Test with large number of records
**Input**: 1000 services, 3000 packages, 500 bookings
**Expected Result**: 
- All operations complete within reasonable time
- Memory usage within limits
- No data corruption

### PT002: Concurrent Operations
**Test Case**: Multiple simultaneous operations
**Input**: 10 concurrent booking requests
**Expected Result**:
- All operations complete successfully
- No race conditions
- Data consistency maintained

## Security Tests

### ST001: Authorization
**Test Case**: Verify authorization checks
**Scenarios**:
- Unauthorized user tries to update service
- User tries to access other user's data
- Invalid caller principal

**Expected Result**: All unauthorized access blocked

### ST002: Input Validation
**Test Case**: Test input validation
**Scenarios**:
- Invalid service title length
- Negative package price
- Invalid email format
- Malicious input strings

**Expected Result**: Invalid inputs rejected

### ST003: Rate Limiting
**Test Case**: Test rate limiting
**Input**: Multiple rapid booking attempts
**Expected Result**: Rate limiting prevents abuse

## Frontend Integration Tests

### FT001: React Hooks
**Test Case**: Test all React hooks
**Hooks to test**:
- `useServices`
- `usePackages`
- `useBookings`
- `useStages`
- `useBookPackage`

**Expected Result**: All hooks work correctly with canister

### FT002: UI Components
**Test Case**: Test UI components
**Components to test**:
- Service management forms
- Booking flow
- Stage approval interface
- Payment status display

**Expected Result**: All components render and function correctly

## Test Execution

### Running Unit Tests
```bash
# Deploy test canister
dfx deploy marketplace --mode=test

# Run specific test
dfx canister call marketplace test_createService

# Run all tests
dfx canister call marketplace runAllTests
```

### Running Integration Tests
```bash
# Deploy with test ledger
dfx deploy marketplace --argument '(variant { test_mode = true })'

# Run booking flow test
dfx canister call marketplace test_bookingFlow

# Run reconciliation test
dfx canister call marketplace test_reconciliation
```

### Running Frontend Tests
```bash
cd frontend
npm test
npm run test:integration
```

## Test Data Cleanup

### After Each Test
```bash
# Clear test data
dfx canister call marketplace clearTestData

# Reset canister state
dfx canister call marketplace reset
```

### Before Each Test
```bash
# Initialize test environment
dfx canister call marketplace initTestEnvironment
```

## Expected Results Summary

| Test Category | Test Cases | Expected Pass Rate |
|---------------|------------|-------------------|
| Unit Tests | 6 | 100% |
| Integration Tests | 3 | 100% |
| Upgrade Tests | 2 | 100% |
| Performance Tests | 2 | 100% |
| Security Tests | 3 | 100% |
| Frontend Tests | 2 | 100% |

**Total Expected Pass Rate: 100%**

## Test Reporting

### Test Results Format
```json
{
  "testSuite": "Marketplace Tests",
  "timestamp": "2024-01-15T10:30:00Z",
  "totalTests": 18,
  "passed": 18,
  "failed": 0,
  "results": [
    {
      "testCase": "TC001",
      "status": "PASS",
      "duration": "150ms",
      "details": "Service creation successful"
    }
  ]
}
```

### Continuous Integration
- Tests run on every commit
- Results reported to CI dashboard
- Failed tests block deployment
- Performance regression detection

## Troubleshooting

### Common Issues
1. **Ledger Connection Failed**: Check ledger canister ID
2. **Authorization Failed**: Verify user authentication
3. **Data Not Persisting**: Check stable storage configuration
4. **Performance Issues**: Monitor canister memory usage

### Debug Commands
```bash
# Check canister status
dfx canister status marketplace

# View canister logs
dfx canister call marketplace getEventLog

# Check canister stats
dfx canister call marketplace getStats
```

---

**Note**: This test plan ensures the marketplace canister is production-ready with comprehensive coverage of all functionality, error scenarios, and edge cases.
