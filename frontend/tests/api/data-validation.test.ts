import { TestRunner, TestResult, makeApiCall, TEST_CONFIG, assertEqual, assertTrue, assertHasProperty, generateMockService, generateMockPackage } from './test-setup';

export async function runDataValidationTests(): Promise<TestResult[]> {
  const runner = new TestRunner();

  // Reset mock data before running tests

  // Validation Test 1: Service field validation
  await runner.runTest('Service Field Validation', async () => {
    // Test empty title
    const emptyTitleResponse = await makeApiCall('/services', 'POST', {
      userId: TEST_CONFIG.testUserId,
      serviceData: generateMockService({ title: '' })
    });
    assertTrue(!emptyTitleResponse.response.ok || emptyTitleResponse.data.success === false,
      'Should reject empty title');

    // Test empty category
    const emptyCategoryResponse = await makeApiCall('/services', 'POST', {
      userId: TEST_CONFIG.testUserId,
      serviceData: generateMockService({ main_category: '' })
    });
    assertTrue(!emptyCategoryResponse.response.ok || emptyCategoryResponse.data.success === false,
      'Should reject empty category');

    // Test empty description
    const emptyDescResponse = await makeApiCall('/services', 'POST', {
      userId: TEST_CONFIG.testUserId,
      serviceData: generateMockService({ description: '' })
    });
    assertTrue(!emptyDescResponse.response.ok || emptyDescResponse.data.success === false,
      'Should reject empty description');

    // Test valid data (should succeed)
    const validResponse = await makeApiCall('/services', 'POST', {
      userId: TEST_CONFIG.testUserId,
      serviceData: generateMockService()
    });
    assertEqual(validResponse.response.ok, true, 'Should accept valid service data');
    assertEqual(validResponse.data.success, true, 'Should return success: true for valid data');

    // Cleanup
    if (validResponse.data.data?.service_id) {
      await makeApiCall(`/services/${validResponse.data.data.service_id}`, 'DELETE', {
        userId: TEST_CONFIG.testUserId
      });
    }
  });

  // Validation Test 2: Package field validation
  await runner.runTest('Package Field Validation', async () => {
    // First create a service to attach packages to
    const serviceResponse = await makeApiCall('/services', 'POST', {
      userId: TEST_CONFIG.testUserId,
      serviceData: generateMockService()
    });

    if (serviceResponse.data.success) {
      const serviceId = serviceResponse.data.data.service_id;

      // Test invalid price (negative)
      const negativePriceResponse = await makeApiCall('/packages', 'POST', {
        userId: TEST_CONFIG.testUserId,
        packageData: generateMockPackage({
          service_id: serviceId,
          price_e8s: '-1000000000'
        })
      });
      assertTrue(!negativePriceResponse.response.ok || negativePriceResponse.data.success === false,
        'Should reject negative price');

      // Test invalid delivery days (negative)
      const negativeDaysResponse = await makeApiCall('/packages', 'POST', {
        userId: TEST_CONFIG.testUserId,
        packageData: generateMockPackage({
          service_id: serviceId,
          delivery_days: -5
        })
      });
      assertTrue(!negativeDaysResponse.response.ok || negativeDaysResponse.data.success === false,
        'Should reject negative delivery days');

      // Test empty tier
      const emptyTierResponse = await makeApiCall('/packages', 'POST', {
        userId: TEST_CONFIG.testUserId,
        packageData: generateMockPackage({
          service_id: serviceId,
          tier: ''
        })
      });
      assertTrue(!emptyTierResponse.response.ok || emptyTierResponse.data.success === false,
        'Should reject empty tier');

      // Test valid package data
      const validPackageResponse = await makeApiCall('/packages', 'POST', {
        userId: TEST_CONFIG.testUserId,
        packageData: generateMockPackage({ service_id: serviceId })
      });
      assertEqual(validPackageResponse.response.ok, true, 'Should accept valid package data');
      assertEqual(validPackageResponse.data.success, true, 'Should return success: true for valid package');

      // Cleanup
      await makeApiCall(`/services/${serviceId}`, 'DELETE', {
        userId: TEST_CONFIG.testUserId
      });
    }
  });

  // Validation Test 3: Update data validation
  await runner.runTest('Update Data Validation', async () => {
    // Create a service first
    const createResponse = await makeApiCall('/services', 'POST', {
      userId: TEST_CONFIG.testUserId,
      serviceData: generateMockService()
    });

    if (createResponse.data.success) {
      const serviceId = createResponse.data.data.service_id;

      // Test empty title update
      const emptyTitleUpdateResponse = await makeApiCall(`/services/${serviceId}`, 'PUT', {
        userId: TEST_CONFIG.testUserId,
        updates: { title: '' }
      });
      assertTrue(!emptyTitleUpdateResponse.response.ok || emptyTitleUpdateResponse.data.success === false,
        'Should reject empty title in update');

      // Test valid update
      const validUpdateResponse = await makeApiCall(`/services/${serviceId}`, 'PUT', {
        userId: TEST_CONFIG.testUserId,
        updates: { title: 'Valid Updated Title' }
      });
      assertEqual(validUpdateResponse.response.ok, true, 'Should accept valid update');
      assertEqual(validUpdateResponse.data.success, true, 'Should return success: true for valid update');

      // Cleanup
      await makeApiCall(`/services/${serviceId}`, 'DELETE', {
        userId: TEST_CONFIG.testUserId
      });
    }
  });

  // Validation Test 4: Query parameter validation
  await runner.runTest('Query Parameter Validation', async () => {
    // Test invalid limit parameter
    const invalidLimitResponse = await makeApiCall('/services?limit=abc');
    assertTrue(invalidLimitResponse.response.ok || invalidLimitResponse.data.success !== false,
      'Should handle invalid limit parameter gracefully');

    // Test negative limit
    const negativeLimitResponse = await makeApiCall('/services?limit=-10');
    assertTrue(negativeLimitResponse.response.ok || negativeLimitResponse.data.success !== false,
      'Should handle negative limit parameter gracefully');

    // Test very large limit
    const largeLimitResponse = await makeApiCall('/services?limit=10000');
    assertTrue(largeLimitResponse.response.ok || largeLimitResponse.data.success !== false,
      'Should handle large limit parameter gracefully');

    // Test valid parameters
    const validParamsResponse = await makeApiCall('/services?limit=10&offset=0&category=Technology');
    assertEqual(validParamsResponse.response.ok, true, 'Should accept valid query parameters');
  });

  // Validation Test 5: Response data structure validation
  await runner.runTest('Response Data Structure Validation', async () => {
    // Test list services response structure
    const listResponse = await makeApiCall('/services');
    assertEqual(listResponse.response.ok, true, 'List services should succeed');
    assertHasProperty(listResponse.data, 'success', 'Response should have success field');
    assertHasProperty(listResponse.data, 'data', 'Response should have data field');
    assertTrue(Array.isArray(listResponse.data.data), 'Data should be an array');

    // Test create service response structure
    const createResponse = await makeApiCall('/services', 'POST', {
      userId: TEST_CONFIG.testUserId,
      serviceData: generateMockService()
    });

    if (createResponse.data.success) {
      assertHasProperty(createResponse.data.data, 'service_id', 'Created service should have service_id');
      assertHasProperty(createResponse.data.data, 'title', 'Created service should have title');
      assertHasProperty(createResponse.data.data, 'status', 'Created service should have status');
      assertHasProperty(createResponse.data.data, 'created_at', 'Created service should have created_at');

      // Test get service response structure
      const getResponse = await makeApiCall(`/services/${createResponse.data.data.service_id}`);
      assertEqual(getResponse.response.ok, true, 'Get service should succeed');
      assertHasProperty(getResponse.data.data, 'service_id', 'Service should have service_id');
      assertHasProperty(getResponse.data.data, 'freelancer_id', 'Service should have freelancer_id');
      assertHasProperty(getResponse.data.data, 'title', 'Service should have title');
      assertHasProperty(getResponse.data.data, 'main_category', 'Service should have main_category');
      assertHasProperty(getResponse.data.data, 'sub_category', 'Service should have sub_category');
      assertHasProperty(getResponse.data.data, 'description', 'Service should have description');
      assertHasProperty(getResponse.data.data, 'whats_included', 'Service should have whats_included');
      assertHasProperty(getResponse.data.data, 'status', 'Service should have status');
      assertHasProperty(getResponse.data.data, 'rating_avg', 'Service should have rating_avg');
      assertHasProperty(getResponse.data.data, 'total_orders', 'Service should have total_orders');

      // Cleanup
      await makeApiCall(`/services/${createResponse.data.data.service_id}`, 'DELETE', {
        userId: TEST_CONFIG.testUserId
      });
    }
  });

  // Validation Test 6: ID format validation
  await runner.runTest('ID Format Validation', async () => {
    // Test with invalid ID formats
    const invalidIds = [
      '',
      'invalid-id',
      '123',
      'SV-',
      'SV-TOO-SHORT',
      'SV-TOO-LONG-ID-FORMAT-THAT-EXCEEDS-REASONABLE-LIMITS',
      '../etc/passwd',
      '<script>alert("xss")</script>',
      'SELECT * FROM services',
      'null',
      'undefined'
    ];

    for (const invalidId of invalidIds) {
      const response = await makeApiCall(`/services/${invalidId}`);
      // Should either return 404 or handle gracefully
      assertTrue(!response.response.ok || response.data.success === false,
        `Should handle invalid ID format: ${invalidId}`);
    }
  });

  runner.printResults();
  return runner.getResults();
}