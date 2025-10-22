import { TestRunner, makeApiCall, TEST_CONFIG, MOCK_DATA } from './test-setup';

export async function runBookingsTests(): Promise<void> {
  const runner = new TestRunner();

  // Setup: Create service and package for booking tests
  let serviceId: string;
  let packageId: string;
  
  await runner.runTest('Setup - Create Service for Booking Tests', async () => {
    const { response, data } = await makeApiCall('/services', 'POST', {
      userId: TEST_CONFIG.testFreelancerId,
      serviceData: MOCK_DATA.service
    });
    
    if (!response.ok || !data.success) {
      throw new Error('Failed to create service for booking tests');
    }
    
    serviceId = data.data.service_id;
  });

  await runner.runTest('Setup - Create Package for Booking Tests', async () => {
    const packageData = {
      ...MOCK_DATA.package,
      service_id: serviceId
    };
    
    const { response, data } = await makeApiCall('/packages', 'POST', {
      userId: TEST_CONFIG.testFreelancerId,
      packageData
    });
    
    if (!response.ok || !data.success) {
      throw new Error('Failed to create package for booking tests');
    }
    
    packageId = data.data.package_id;
    TEST_CONFIG.testPackageId = packageId;
  });

  // Test 1: Book package
  await runner.runTest('Book Package', async () => {
    const { response, data } = await makeApiCall('/bookings', 'POST', {
      clientId: TEST_CONFIG.testUserId,
      packageId: packageId,
      specialInstructions: MOCK_DATA.booking.specialInstructions
    });
    
    if (!response.ok) {
      throw new Error(`Expected 200, got ${response.status}: ${JSON.stringify(data)}`);
    }
    
    if (!data.success) {
      throw new Error(`Expected success: true, got: ${JSON.stringify(data)}`);
    }
    
    if (!data.data.booking_id) {
      throw new Error(`Expected booking_id in response, got: ${JSON.stringify(data.data)}`);
    }
    
    // Store the booking ID for other tests
    TEST_CONFIG.testBookingId = data.data.booking_id;
  });

  // Test 2: Get booking by ID
  await runner.runTest('Get Booking by ID', async () => {
    const { response, data } = await makeApiCall(`/bookings/${TEST_CONFIG.testBookingId}`);
    
    if (!response.ok) {
      throw new Error(`Expected 200, got ${response.status}: ${JSON.stringify(data)}`);
    }
    
    if (!data.success) {
      throw new Error(`Expected success: true, got: ${JSON.stringify(data)}`);
    }
    
    if (data.data.booking_id !== TEST_CONFIG.testBookingId) {
      throw new Error(`Expected booking_id ${TEST_CONFIG.testBookingId}, got: ${data.data.booking_id}`);
    }
  });

  // Test 3: List bookings for client
  await runner.runTest('List Bookings for Client', async () => {
    const { response, data } = await makeApiCall(`/bookings?user_id=${TEST_CONFIG.testUserId}&user_type=client`);
    
    if (!response.ok) {
      throw new Error(`Expected 200, got ${response.status}: ${JSON.stringify(data)}`);
    }
    
    if (!data.success) {
      throw new Error(`Expected success: true, got: ${JSON.stringify(data)}`);
    }
    
    if (!Array.isArray(data.data)) {
      throw new Error(`Expected data to be array, got: ${typeof data.data}`);
    }
    
    if (data.data.length === 0) {
      throw new Error('Expected at least one booking, got empty array');
    }
  });

  // Test 4: List bookings for freelancer
  await runner.runTest('List Bookings for Freelancer', async () => {
    const { response, data } = await makeApiCall(`/bookings?user_id=${TEST_CONFIG.testFreelancerId}&user_type=freelancer`);
    
    if (!response.ok) {
      throw new Error(`Expected 200, got ${response.status}: ${JSON.stringify(data)}`);
    }
    
    if (!data.success) {
      throw new Error(`Expected success: true, got: ${JSON.stringify(data)}`);
    }
    
    if (!Array.isArray(data.data)) {
      throw new Error(`Expected data to be array, got: ${typeof data.data}`);
    }
    
    if (data.data.length === 0) {
      throw new Error('Expected at least one booking, got empty array');
    }
  });

  // Test 5: List bookings with status filter
  await runner.runTest('List Bookings with Status Filter', async () => {
    const { response, data } = await makeApiCall(`/bookings?user_id=${TEST_CONFIG.testUserId}&user_type=client&status=InProgress`);
    
    if (!response.ok) {
      throw new Error(`Expected 200, got ${response.status}: ${JSON.stringify(data)}`);
    }
    
    if (!data.success) {
      throw new Error(`Expected success: true, got: ${JSON.stringify(data)}`);
    }
    
    if (!Array.isArray(data.data)) {
      throw new Error(`Expected data to be array, got: ${typeof data.data}`);
    }
  });

  // Test 6: Cancel booking
  await runner.runTest('Cancel Booking', async () => {
    const { response, data } = await makeApiCall(`/bookings/${TEST_CONFIG.testBookingId}`, 'PUT', {
      userId: TEST_CONFIG.testUserId,
      reason: 'Project requirements changed'
    });
    
    if (!response.ok) {
      throw new Error(`Expected 200, got ${response.status}: ${JSON.stringify(data)}`);
    }
    
    if (!data.success) {
      throw new Error(`Expected success: true, got: ${JSON.stringify(data)}`);
    }
  });

  // Test 7: Book package without clientId (should fail)
  await runner.runTest('Book Package without Client ID', async () => {
    const { response, data } = await makeApiCall('/bookings', 'POST', {
      packageId: packageId,
      specialInstructions: MOCK_DATA.booking.specialInstructions
    });
    
    if (response.status !== 400) {
      throw new Error(`Expected 400, got ${response.status}: ${JSON.stringify(data)}`);
    }
    
    if (data.success) {
      throw new Error(`Expected success: false for missing client ID`);
    }
  });

  // Test 8: Book package without packageId (should fail)
  await runner.runTest('Book Package without Package ID', async () => {
    const { response, data } = await makeApiCall('/bookings', 'POST', {
      clientId: TEST_CONFIG.testUserId,
      specialInstructions: MOCK_DATA.booking.specialInstructions
    });
    
    if (response.status !== 400) {
      throw new Error(`Expected 400, got ${response.status}: ${JSON.stringify(data)}`);
    }
    
    if (data.success) {
      throw new Error(`Expected success: false for missing package ID`);
    }
  });

  // Test 9: List bookings without user_id (should fail)
  await runner.runTest('List Bookings without User ID', async () => {
    const { response, data } = await makeApiCall('/bookings?user_type=client');
    
    if (response.status !== 400) {
      throw new Error(`Expected 400, got ${response.status}: ${JSON.stringify(data)}`);
    }
    
    if (data.success) {
      throw new Error(`Expected success: false for missing user ID`);
    }
  });

  // Test 10: List bookings without user_type (should fail)
  await runner.runTest('List Bookings without User Type', async () => {
    const { response, data } = await makeApiCall(`/bookings?user_id=${TEST_CONFIG.testUserId}`);
    
    if (response.status !== 400) {
      throw new Error(`Expected 400, got ${response.status}: ${JSON.stringify(data)}`);
    }
    
    if (data.success) {
      throw new Error(`Expected success: false for missing user type`);
    }
  });

  // Test 11: Get non-existent booking (should return 404)
  await runner.runTest('Get Non-existent Booking', async () => {
    const { response, data } = await makeApiCall('/bookings/BK-NONEXISTENT');
    
    if (response.status !== 404) {
      throw new Error(`Expected 404, got ${response.status}: ${JSON.stringify(data)}`);
    }
    
    if (data.success) {
      throw new Error(`Expected success: false for non-existent booking`);
    }
  });

  runner.printResults();
  return runner.getResults();
}
