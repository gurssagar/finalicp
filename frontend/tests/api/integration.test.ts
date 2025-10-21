import { TestRunner, TestResult, makeApiCall, TEST_CONFIG, assertEqual, assertNotNull, assertTrue, generateMockService, generateMockPackage } from './test-setup';

export async function runIntegrationTests(): Promise<TestResult[]> {
  const runner = new TestRunner();

  // Reset mock data before running tests

  // Integration Test 1: Complete service lifecycle
  await runner.runTest('Complete Service Lifecycle', async () => {
    // Step 1: Create a service
    const serviceData = generateMockService({
      title: 'Integration Test Service',
      main_category: 'Technology',
      sub_category: 'Web Development'
    });

    const createResponse = await makeApiCall('/services', 'POST', {
      userId: TEST_CONFIG.testUserId,
      serviceData
    });

    assertEqual(createResponse.response.ok, true, 'Failed to create service');
    assertEqual(createResponse.data.success, true, 'Service creation failed');
    assertNotNull(createResponse.data.data.service_id, 'Service ID should not be null');

    const serviceId = createResponse.data.data.service_id;

    // Step 2: Get the created service
    const getResponse = await makeApiCall(`/services/${serviceId}`);
    assertEqual(getResponse.response.ok, true, 'Failed to get service');
    assertEqual(getResponse.data.data.service_id, serviceId, 'Service ID mismatch');

    // Step 3: Update the service
    const updateResponse = await makeApiCall(`/services/${serviceId}`, 'PUT', {
      userId: TEST_CONFIG.testUserId,
      updates: { title: 'Updated Integration Test Service' }
    });

    assertEqual(updateResponse.response.ok, true, 'Failed to update service');
    assertEqual(updateResponse.data.data.title, 'Updated Integration Test Service', 'Title not updated');

    // Step 4: Create a package for the service
    const packageData = generateMockPackage({
      service_id: serviceId,
      title: 'Integration Test Package',
      price_e8s: '1000000000' // 10 ICP
    });

    const packageResponse = await makeApiCall('/packages', 'POST', {
      userId: TEST_CONFIG.testUserId,
      packageData
    });

    assertEqual(packageResponse.response.ok, true, 'Failed to create package');
    assertNotNull(packageResponse.data.data.package_id, 'Package ID should not be null');

    const packageId = packageResponse.data.data.package_id;

    // Step 5: Get packages for the service
    const packagesResponse = await makeApiCall(`/services/${serviceId}/packages`);
    assertEqual(packagesResponse.response.ok, true, 'Failed to get packages');
    assertTrue(packagesResponse.data.data.length > 0, 'Should have at least one package');

    // Step 6: Delete the service (cleanup)
    const deleteResponse = await makeApiCall(`/services/${serviceId}`, 'DELETE', {
      userId: TEST_CONFIG.testUserId
    });

    assertEqual(deleteResponse.response.ok, true, 'Failed to delete service');
  });

  // Integration Test 2: Multi-service interaction
  await runner.runTest('Multi-Service Interaction', async () => {
    // Create multiple services
    const services = [];
    for (let i = 0; i < 3; i++) {
      const serviceData = generateMockService({
        title: `Multi-Test Service ${i + 1}`,
        main_category: ['Technology', 'Design', 'Marketing'][i]
      });

      const response = await makeApiCall('/services', 'POST', {
        userId: TEST_CONFIG.testUserId,
        serviceData
      });

      assertEqual(response.response.ok, true, `Failed to create service ${i + 1}`);
      services.push(response.data.data);
    }

    // List all services
    const listResponse = await makeApiCall('/services?limit=10');
    assertEqual(listResponse.response.ok, true, 'Failed to list services');
    assertTrue(listResponse.data.data.length >= 3, 'Should have at least 3 services');

    // Filter by category
    const techResponse = await makeApiCall('/services?category=Technology');
    assertEqual(techResponse.response.ok, true, 'Failed to filter by category');

    // Search services
    const searchResponse = await makeApiCall('/services?search_term=Multi-Test');
    assertEqual(searchResponse.response.ok, true, 'Failed to search services');

    // Cleanup
    for (const service of services) {
      await makeApiCall(`/services/${service.service_id}`, 'DELETE', {
        userId: TEST_CONFIG.testUserId
      });
    }
  });

  // Integration Test 3: Error handling integration
  await runner.runTest('Error Handling Integration', async () => {
    // Test not found error
    const notFoundResponse = await makeApiCall('/services/SV-NONEXISTENT');
    assertEqual(notFoundResponse.response.status, 404, 'Should return 404 for non-existent service');
    assertEqual(notFoundResponse.data.success, false, 'Should return success: false for error');

    // Test validation error
    const validationResponse = await makeApiCall('/services', 'POST', {
      userId: TEST_CONFIG.testUserId
      // Missing serviceData
    });
    assertEqual(validationResponse.response.status, 400, 'Should return 400 for validation error');
    assertEqual(validationResponse.data.success, false, 'Should return success: false for validation error');

    // Test unauthorized error
    const unauthorizedResponse = await makeApiCall('/services', 'POST', {
      // Missing userId
      serviceData: generateMockService()
    });
    assertEqual(unauthorizedResponse.response.status, 400, 'Should return 400 for missing user ID');
  });

  runner.printResults();
  return runner.getResults();
}