import { TestRunner, makeApiCall, TEST_CONFIG, MOCK_DATA } from './test-setup';

export async function runServicesTests(): Promise<void> {
  const runner = new TestRunner();

  // Test 1: List services (should work even with empty result)
  await runner.runTest('List Services - Empty Result', async () => {
    const { response, data } = await makeApiCall('/services');
    
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

  // Test 2: Create service
  await runner.runTest('Create Service', async () => {
    const { response, data } = await makeApiCall('/services', 'POST', {
      userId: TEST_CONFIG.testUserId,
      serviceData: MOCK_DATA.service
    });
    
    if (!response.ok) {
      throw new Error(`Expected 200, got ${response.status}: ${JSON.stringify(data)}`);
    }
    
    if (!data.success) {
      throw new Error(`Expected success: true, got: ${JSON.stringify(data)}`);
    }
    
    if (!data.data.service_id) {
      throw new Error(`Expected service_id in response, got: ${JSON.stringify(data.data)}`);
    }
    
    // Store the service ID for other tests
    TEST_CONFIG.testServiceId = data.data.service_id;
  });

  // Test 3: Get service by ID
  await runner.runTest('Get Service by ID', async () => {
    const { response, data } = await makeApiCall(`/services/${TEST_CONFIG.testServiceId}`);
    
    if (!response.ok) {
      throw new Error(`Expected 200, got ${response.status}: ${JSON.stringify(data)}`);
    }
    
    if (!data.success) {
      throw new Error(`Expected success: true, got: ${JSON.stringify(data)}`);
    }
    
    if (data.data.service_id !== TEST_CONFIG.testServiceId) {
      throw new Error(`Expected service_id ${TEST_CONFIG.testServiceId}, got: ${data.data.service_id}`);
    }
  });

  // Test 4: Update service
  await runner.runTest('Update Service', async () => {
    const updatedService = {
      ...MOCK_DATA.service,
      title: 'Updated Test Service',
      description: 'Updated description for testing'
    };
    
    const { response, data } = await makeApiCall(`/services/${TEST_CONFIG.testServiceId}`, 'PUT', {
      userId: TEST_CONFIG.testUserId,
      updates: updatedService
    });
    
    if (!response.ok) {
      throw new Error(`Expected 200, got ${response.status}: ${JSON.stringify(data)}`);
    }
    
    if (!data.success) {
      throw new Error(`Expected success: true, got: ${JSON.stringify(data)}`);
    }
    
    if (data.data.title !== 'Updated Test Service') {
      throw new Error(`Expected updated title, got: ${data.data.title}`);
    }
  });

  // Test 5: List services with filters
  await runner.runTest('List Services with Filters', async () => {
    const { response, data } = await makeApiCall('/services?category=Web%20Design&search_term=Test&limit=10&offset=0');
    
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

  // Test 6: Delete service
  await runner.runTest('Delete Service', async () => {
    const { response, data } = await makeApiCall(`/services/${TEST_CONFIG.testServiceId}`, 'DELETE', {
      userId: TEST_CONFIG.testUserId
    });
    
    if (!response.ok) {
      throw new Error(`Expected 200, got ${response.status}: ${JSON.stringify(data)}`);
    }
    
    if (!data.success) {
      throw new Error(`Expected success: true, got: ${JSON.stringify(data)}`);
    }
  });

  // Test 7: Get non-existent service (should return 404)
  await runner.runTest('Get Non-existent Service', async () => {
    const { response, data } = await makeApiCall('/services/SV-NONEXISTENT');
    
    if (response.status !== 404) {
      throw new Error(`Expected 404, got ${response.status}: ${JSON.stringify(data)}`);
    }
    
    if (data.success) {
      throw new Error(`Expected success: false for non-existent service`);
    }
  });

  // Test 8: Create service without userId (should fail)
  await runner.runTest('Create Service without User ID', async () => {
    const { response, data } = await makeApiCall('/services', 'POST', {
      serviceData: MOCK_DATA.service
    });
    
    if (response.status !== 400) {
      throw new Error(`Expected 400, got ${response.status}: ${JSON.stringify(data)}`);
    }
    
    if (data.success) {
      throw new Error(`Expected success: false for missing user ID`);
    }
  });

  runner.printResults();
  return runner.getResults();
}
