import { TestRunner, makeApiCall, TEST_CONFIG, MOCK_DATA } from './test-setup';

export async function runStagesTests(): Promise<void> {
  const runner = new TestRunner();

  // Setup: Create service, package, and booking for stage tests
  let serviceId: string;
  let packageId: string;
  let bookingId: string;
  
  await runner.runTest('Setup - Create Service for Stage Tests', async () => {
    const { response, data } = await makeApiCall('/services', 'POST', {
      userId: TEST_CONFIG.testFreelancerId,
      serviceData: MOCK_DATA.service
    });
    
    if (!response.ok || !data.success) {
      throw new Error('Failed to create service for stage tests');
    }
    
    serviceId = data.data.service_id;
  });

  await runner.runTest('Setup - Create Package for Stage Tests', async () => {
    const packageData = {
      ...MOCK_DATA.package,
      service_id: serviceId
    };
    
    const { response, data } = await makeApiCall('/packages', 'POST', {
      userId: TEST_CONFIG.testFreelancerId,
      packageData
    });
    
    if (!response.ok || !data.success) {
      throw new Error('Failed to create package for stage tests');
    }
    
    packageId = data.data.package_id;
  });

  await runner.runTest('Setup - Create Booking for Stage Tests', async () => {
    const { response, data } = await makeApiCall('/bookings', 'POST', {
      clientId: TEST_CONFIG.testUserId,
      packageId: packageId,
      specialInstructions: MOCK_DATA.booking.specialInstructions
    });
    
    if (!response.ok || !data.success) {
      throw new Error('Failed to create booking for stage tests');
    }
    
    bookingId = data.data.booking_id;
    TEST_CONFIG.testBookingId = bookingId;
  });

  // Test 1: Create stages for booking
  await runner.runTest('Create Stages for Booking', async () => {
    const stageDefinitions = [
      {
        title: 'Wireframes',
        description: 'Create wireframes for all pages',
        amount_e8s: '2500000000' // 25 ICP
      },
      {
        title: 'Design Mockups',
        description: 'High-fidelity design mockups',
        amount_e8s: '2500000000' // 25 ICP
      }
    ];
    
    const { response, data } = await makeApiCall('/stages', 'POST', {
      freelancerId: TEST_CONFIG.testFreelancerId,
      bookingId: bookingId,
      stageDefinitions
    });
    
    if (!response.ok) {
      throw new Error(`Expected 200, got ${response.status}: ${JSON.stringify(data)}`);
    }
    
    if (!data.success) {
      throw new Error(`Expected success: true, got: ${JSON.stringify(data)}`);
    }
    
    if (!Array.isArray(data.data) || data.data.length === 0) {
      throw new Error(`Expected array of stages, got: ${JSON.stringify(data.data)}`);
    }
    
    // Store the first stage ID for other tests
    TEST_CONFIG.testStageId = data.data[0].stage_id;
  });

  // Test 2: List stages for booking
  await runner.runTest('List Stages for Booking', async () => {
    const { response, data } = await makeApiCall(`/stages?booking_id=${bookingId}`);
    
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
      throw new Error('Expected at least one stage, got empty array');
    }
  });

  // Test 3: Get stage by ID
  await runner.runTest('Get Stage by ID', async () => {
    const { response, data } = await makeApiCall(`/stages/${TEST_CONFIG.testStageId}`);
    
    if (!response.ok) {
      throw new Error(`Expected 200, got ${response.status}: ${JSON.stringify(data)}`);
    }
    
    if (!data.success) {
      throw new Error(`Expected success: true, got: ${JSON.stringify(data)}`);
    }
    
    if (data.data.stage_id !== TEST_CONFIG.testStageId) {
      throw new Error(`Expected stage_id ${TEST_CONFIG.testStageId}, got: ${data.data.stage_id}`);
    }
  });

  // Test 4: Submit stage work
  await runner.runTest('Submit Stage Work', async () => {
    const { response, data } = await makeApiCall(`/stages/${TEST_CONFIG.testStageId}`, 'PUT', {
      action: 'submit',
      userId: TEST_CONFIG.testFreelancerId,
      notes: 'Wireframes completed for all pages with mobile responsiveness',
      artifacts: ['https://example.com/wireframes.pdf', 'https://example.com/mobile-wireframes.pdf']
    });
    
    if (!response.ok) {
      throw new Error(`Expected 200, got ${response.status}: ${JSON.stringify(data)}`);
    }
    
    if (!data.success) {
      throw new Error(`Expected success: true, got: ${JSON.stringify(data)}`);
    }
    
    if (data.action !== 'submit') {
      throw new Error(`Expected action 'submit', got: ${data.action}`);
    }
  });

  // Test 5: Approve stage
  await runner.runTest('Approve Stage', async () => {
    const { response, data } = await makeApiCall(`/stages/${TEST_CONFIG.testStageId}`, 'PUT', {
      action: 'approve',
      userId: TEST_CONFIG.testUserId
    });
    
    if (!response.ok) {
      throw new Error(`Expected 200, got ${response.status}: ${JSON.stringify(data)}`);
    }
    
    if (!data.success) {
      throw new Error(`Expected success: true, got: ${JSON.stringify(data)}`);
    }
    
    if (data.action !== 'approve') {
      throw new Error(`Expected action 'approve', got: ${data.action}`);
    }
  });

  // Test 6: Submit second stage
  await runner.runTest('Submit Second Stage', async () => {
    // Get the second stage ID
    const { response: listResponse, data: listData } = await makeApiCall(`/stages?booking_id=${bookingId}`);
    
    if (!listResponse.ok || !listData.success || listData.data.length < 2) {
      throw new Error('Failed to get second stage for testing');
    }
    
    const secondStageId = listData.data[1].stage_id;
    
    const { response, data } = await makeApiCall(`/stages/${secondStageId}`, 'PUT', {
      action: 'submit',
      userId: TEST_CONFIG.testFreelancerId,
      notes: 'Design mockups completed with all requested features',
      artifacts: ['https://example.com/mockups.pdf']
    });
    
    if (!response.ok) {
      throw new Error(`Expected 200, got ${response.status}: ${JSON.stringify(data)}`);
    }
    
    if (!data.success) {
      throw new Error(`Expected success: true, got: ${JSON.stringify(data)}`);
    }
  });

  // Test 7: Reject stage
  await runner.runTest('Reject Stage', async () => {
    // Get the second stage ID
    const { response: listResponse, data: listData } = await makeApiCall(`/stages?booking_id=${bookingId}`);
    
    if (!listResponse.ok || !listData.success || listData.data.length < 2) {
      throw new Error('Failed to get second stage for testing');
    }
    
    const secondStageId = listData.data[1].stage_id;
    
    const { response, data } = await makeApiCall(`/stages/${secondStageId}`, 'PUT', {
      action: 'reject',
      userId: TEST_CONFIG.testUserId,
      reason: 'The mockups don\'t match the wireframes. Please revise the design to match the approved wireframes.'
    });
    
    if (!response.ok) {
      throw new Error(`Expected 200, got ${response.status}: ${JSON.stringify(data)}`);
    }
    
    if (!data.success) {
      throw new Error(`Expected success: true, got: ${JSON.stringify(data)}`);
    }
    
    if (data.action !== 'reject') {
      throw new Error(`Expected action 'reject', got: ${data.action}`);
    }
  });

  // Test 8: Create stages without freelancerId (should fail)
  await runner.runTest('Create Stages without Freelancer ID', async () => {
    const { response, data } = await makeApiCall('/stages', 'POST', {
      bookingId: bookingId,
      stageDefinitions: [MOCK_DATA.stage]
    });
    
    if (response.status !== 400) {
      throw new Error(`Expected 400, got ${response.status}: ${JSON.stringify(data)}`);
    }
    
    if (data.success) {
      throw new Error(`Expected success: false for missing freelancer ID`);
    }
  });

  // Test 9: Create stages without bookingId (should fail)
  await runner.runTest('Create Stages without Booking ID', async () => {
    const { response, data } = await makeApiCall('/stages', 'POST', {
      freelancerId: TEST_CONFIG.testFreelancerId,
      stageDefinitions: [MOCK_DATA.stage]
    });
    
    if (response.status !== 400) {
      throw new Error(`Expected 400, got ${response.status}: ${JSON.stringify(data)}`);
    }
    
    if (data.success) {
      throw new Error(`Expected success: false for missing booking ID`);
    }
  });

  // Test 10: Submit stage without notes (should fail)
  await runner.runTest('Submit Stage without Notes', async () => {
    const { response, data } = await makeApiCall(`/stages/${TEST_CONFIG.testStageId}`, 'PUT', {
      action: 'submit',
      userId: TEST_CONFIG.testFreelancerId,
      artifacts: ['https://example.com/work.pdf']
    });
    
    if (response.status !== 400) {
      throw new Error(`Expected 400, got ${response.status}: ${JSON.stringify(data)}`);
    }
    
    if (data.success) {
      throw new Error(`Expected success: false for missing submission notes`);
    }
  });

  // Test 11: Reject stage without reason (should fail)
  await runner.runTest('Reject Stage without Reason', async () => {
    const { response, data } = await makeApiCall(`/stages/${TEST_CONFIG.testStageId}`, 'PUT', {
      action: 'reject',
      userId: TEST_CONFIG.testUserId
    });
    
    if (response.status !== 400) {
      throw new Error(`Expected 400, got ${response.status}: ${JSON.stringify(data)}`);
    }
    
    if (data.success) {
      throw new Error(`Expected success: false for missing rejection reason`);
    }
  });

  // Test 12: Invalid action (should fail)
  await runner.runTest('Invalid Stage Action', async () => {
    const { response, data } = await makeApiCall(`/stages/${TEST_CONFIG.testStageId}`, 'PUT', {
      action: 'invalid',
      userId: TEST_CONFIG.testUserId
    });
    
    if (response.status !== 400) {
      throw new Error(`Expected 400, got ${response.status}: ${JSON.stringify(data)}`);
    }
    
    if (data.success) {
      throw new Error(`Expected success: false for invalid action`);
    }
  });

  // Test 13: Get non-existent stage (should return 404)
  await runner.runTest('Get Non-existent Stage', async () => {
    const { response, data } = await makeApiCall('/stages/ST-NONEXISTENT');
    
    if (response.status !== 404) {
      throw new Error(`Expected 404, got ${response.status}: ${JSON.stringify(data)}`);
    }
    
    if (data.success) {
      throw new Error(`Expected success: false for non-existent stage`);
    }
  });

  runner.printResults();
  return runner.getResults();
}
