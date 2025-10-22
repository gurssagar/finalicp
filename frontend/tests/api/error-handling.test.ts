import { TestRunner, makeApiCall, TEST_CONFIG, resetMockData, assertEqual, assertTrue, generateMockService } from './test-setup';

export async function runErrorHandlingTests(): Promise<void> {
  const runner = new TestRunner();

  // Reset mock data before running tests
  resetMockData();

  // Error Test 1: Invalid service data
  await runner.runTest('Invalid Service Data', async () => {
    const invalidServiceData = {
      // Missing required fields
      title: '',
      main_category: '',
      sub_category: '',
      description: '',
      whats_included: ''
    };

    const response = await makeApiCall('/services', 'POST', {
      userId: TEST_CONFIG.testUserId,
      serviceData: invalidServiceData
    });

    // Should return an error (status may be 400 or 500 depending on validation)
    assertTrue(!response.response.ok || response.data.success === false, 'Should return error for invalid data');
  });

  // Error Test 2: Missing user ID
  await runner.runTest('Missing User ID', async () => {
    const response = await makeApiCall('/services', 'POST', {
      serviceData: generateMockService()
      // Missing userId
    });

    assertEqual(response.response.status, 400, 'Should return 400 for missing user ID');
    assertEqual(response.data.success, false, 'Should return success: false');
  });

  // Error Test 3: Non-existent resource access
  await runner.runTest('Non-existent Resource Access', async () => {
    const nonExistentId = 'SV-NONEXISTENT-123';

    // Try to get non-existent service
    const getResponse = await makeApiCall(`/services/${nonExistentId}`);
    assertEqual(getResponse.response.status, 404, 'Should return 404 for non-existent service');
    assertEqual(getResponse.data.success, false, 'Should return success: false');

    // Try to update non-existent service
    const updateResponse = await makeApiCall(`/services/${nonExistentId}`, 'PUT', {
      userId: TEST_CONFIG.testUserId,
      updates: { title: 'Updated Title' }
    });
    assertEqual(updateResponse.response.status, 404, 'Should return 404 for updating non-existent service');
    assertEqual(updateResponse.data.success, false, 'Should return success: false');

    // Try to delete non-existent service
    const deleteResponse = await makeApiCall(`/services/${nonExistentId}`, 'DELETE', {
      userId: TEST_CONFIG.testUserId
    });
    assertEqual(deleteResponse.response.status, 404, 'Should return 404 for deleting non-existent service');
    assertEqual(deleteResponse.data.success, false, 'Should return success: false');
  });

  // Error Test 4: Unauthorized access
  await runner.runTest('Unauthorized Access', async () => {
    // First create a service
    const createResponse = await makeApiCall('/services', 'POST', {
      userId: TEST_CONFIG.testUserId,
      serviceData: generateMockService()
    });

    if (createResponse.data.success) {
      const serviceId = createResponse.data.data.service_id;

      // Try to update with different user ID
      const unauthorizedUpdateResponse = await makeApiCall(`/services/${serviceId}`, 'PUT', {
        userId: 'DIFFERENT_USER_ID',
        updates: { title: 'Hacked Title' }
      });

      // Should return unauthorized error
      assertTrue(!unauthorizedUpdateResponse.response.ok || unauthorizedUpdateResponse.data.success === false,
        'Should prevent unauthorized updates');

      // Try to delete with different user ID
      const unauthorizedDeleteResponse = await makeApiCall(`/services/${serviceId}`, 'DELETE', {
        userId: 'DIFFERENT_USER_ID'
      });

      // Should return unauthorized error
      assertTrue(!unauthorizedDeleteResponse.response.ok || unauthorizedDeleteResponse.data.success === false,
        'Should prevent unauthorized deletion');

      // Cleanup with original user
      await makeApiCall(`/services/${serviceId}`, 'DELETE', {
        userId: TEST_CONFIG.testUserId
      });
    }
  });

  // Error Test 5: Malformed request data
  await runner.runTest('Malformed Request Data', async () => {
    // Test with invalid JSON (this should be handled at the framework level)
    const response = await fetch(`${TEST_CONFIG.baseUrl}${TEST_CONFIG.apiBase}/services`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: '{ invalid json }'
    });

    assertEqual(response.status, 400, 'Should return 400 for malformed JSON');

    const data = await response.json();
    assertEqual(data.success, false, 'Should return success: false for malformed JSON');
  });

  // Error Test 6: Database constraint violations
  await runner.runTest('Database Constraint Violations', async () => {
    // Create a service first
    const serviceData = generateMockService({
      title: 'Constraint Test Service'
    });

    const createResponse = await makeApiCall('/services', 'POST', {
      userId: TEST_CONFIG.testUserId,
      serviceData
    });

    if (createResponse.data.success) {
      const serviceId = createResponse.data.data.service_id;

      // Try to create a package for non-existent service
      const packageResponse = await makeApiCall('/packages', 'POST', {
        userId: TEST_CONFIG.testUserId,
        packageData: {
          service_id: 'SV-NONEXISTENT',
          tier: 'Basic',
          title: 'Test Package',
          description: 'Test description',
          price_e8s: '1000000000',
          delivery_days: 5,
          features: ['Test feature'],
          revisions_included: 1,
          status: 'Available'
        }
      });

      assertTrue(!packageResponse.response.ok || packageResponse.data.success === false,
        'Should prevent package creation for non-existent service');

      // Cleanup
      await makeApiCall(`/services/${serviceId}`, 'DELETE', {
        userId: TEST_CONFIG.testUserId
      });
    }
  });

  // Error Test 7: Large data handling
  await runner.runTest('Large Data Handling', async () => {
    // Test with very large description
    const largeDescription = 'A'.repeat(10000); // 10KB description
    const largeServiceData = generateMockService({
      description: largeDescription
    });

    const response = await makeApiCall('/services', 'POST', {
      userId: TEST_CONFIG.testUserId,
      serviceData: largeServiceData
    });

    // Should either succeed or fail gracefully
    if (response.response.ok) {
      assertEqual(response.data.success, true, 'If successful, should return success: true');
      // Cleanup
      if (response.data.data?.service_id) {
        await makeApiCall(`/services/${response.data.data.service_id}`, 'DELETE', {
          userId: TEST_CONFIG.testUserId
        });
      }
    } else {
      assertTrue(response.response.status >= 400, 'Should return appropriate error status for large data');
    }
  });

  runner.printResults();
  return runner.getResults();
}