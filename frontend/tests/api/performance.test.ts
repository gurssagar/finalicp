import { TestRunner, TestResult, makeApiCall, TEST_CONFIG, assertEqual, assertTrue, generateMockService } from './test-setup';

export async function runPerformanceTests(): Promise<TestResult[]> {
  const runner = new TestRunner();

  // Reset mock data before running tests

  // Performance Test 1: Response time for basic operations
  await runner.runTest('Basic Operations Response Time', async () => {
    // Test list services response time
    const startTime = Date.now();
    const listResponse = await makeApiCall('/services');
    const listDuration = Date.now() - startTime;

    assertEqual(listResponse.response.ok, true, 'List services should succeed');
    assertTrue(listDuration < 2000, `List services should respond within 2 seconds, took ${listDuration}ms`);

    // Test create service response time
    const serviceData = generateMockService({
      title: 'Performance Test Service'
    });

    const createStartTime = Date.now();
    const createResponse = await makeApiCall('/services', 'POST', {
      userId: TEST_CONFIG.testUserId,
      serviceData
    });
    const createDuration = Date.now() - createStartTime;

    assertEqual(createResponse.response.ok, true, 'Create service should succeed');
    assertTrue(createDuration < 3000, `Create service should respond within 3 seconds, took ${createDuration}ms`);

    if (createResponse.data.success) {
      const serviceId = createResponse.data.data.service_id;

      // Test get service response time
      const getStartTime = Date.now();
      const getResponse = await makeApiCall(`/services/${serviceId}`);
      const getDuration = Date.now() - getStartTime;

      assertEqual(getResponse.response.ok, true, 'Get service should succeed');
      assertTrue(getDuration < 1000, `Get service should respond within 1 second, took ${getDuration}ms`);

      // Cleanup
      await makeApiCall(`/services/${serviceId}`, 'DELETE', {
        userId: TEST_CONFIG.testUserId
      });
    }
  });

  // Performance Test 2: Bulk operations
  await runner.runTest('Bulk Operations Performance', async () => {
    const serviceCount = 10;
    const createdServices = [];

    // Test bulk creation
    const bulkCreateStart = Date.now();
    for (let i = 0; i < serviceCount; i++) {
      const serviceData = generateMockService({
        title: `Bulk Test Service ${i + 1}`,
        main_category: ['Technology', 'Design', 'Marketing'][i % 3]
      });

      const response = await makeApiCall('/services', 'POST', {
        userId: TEST_CONFIG.testUserId,
        serviceData
      });

      if (response.data.success) {
        createdServices.push(response.data.data);
      }
    }
    const bulkCreateDuration = Date.now() - bulkCreateStart;

    assertTrue(createdServices.length === serviceCount, 'All services should be created');
    assertTrue(bulkCreateDuration < serviceCount * 3000,
      `Bulk creation should complete within reasonable time, took ${bulkCreateDuration}ms for ${serviceCount} services`);

    // Test bulk listing
    const bulkListStart = Date.now();
    const listResponse = await makeApiCall('/services?limit=50');
    const bulkListDuration = Date.now() - bulkListStart;

    assertEqual(listResponse.response.ok, true, 'Bulk list should succeed');
    assertTrue(bulkListDuration < 5000, `Bulk list should respond within 5 seconds, took ${bulkListDuration}ms`);
    assertTrue(listResponse.data.data.length >= serviceCount, 'Should list all created services');

    // Test bulk deletion (cleanup)
    const bulkDeleteStart = Date.now();
    for (const service of createdServices) {
      await makeApiCall(`/services/${service.service_id}`, 'DELETE', {
        userId: TEST_CONFIG.testUserId
      });
    }
    const bulkDeleteDuration = Date.now() - bulkDeleteStart;

    assertTrue(bulkDeleteDuration < serviceCount * 2000,
      `Bulk deletion should complete within reasonable time, took ${bulkDeleteDuration}ms for ${serviceCount} services`);
  });

  // Performance Test 3: Concurrent requests
  await runner.runTest('Concurrent Requests Performance', async () => {
    const concurrentCount = 5;
    const promises = [];

    // Create multiple services concurrently
    const concurrentStart = Date.now();
    for (let i = 0; i < concurrentCount; i++) {
      const promise = makeApiCall('/services', 'POST', {
        userId: TEST_CONFIG.testUserId,
        serviceData: generateMockService({
          title: `Concurrent Test Service ${i + 1}`
        })
      });
      promises.push(promise);
    }

    const results = await Promise.all(promises);
    const concurrentDuration = Date.now() - concurrentStart;

    const successCount = results.filter(r => r.data.success).length;
    assertTrue(successCount === concurrentCount, 'All concurrent requests should succeed');
    assertTrue(concurrentDuration < 10000,
      `Concurrent requests should complete within 10 seconds, took ${concurrentDuration}ms for ${concurrentCount} requests`);

    // Cleanup
    for (const result of results) {
      if (result.data.success && result.data.data?.service_id) {
        await makeApiCall(`/services/${result.data.data.service_id}`, 'DELETE', {
          userId: TEST_CONFIG.testUserId
        });
      }
    }
  });

  // Performance Test 4: Large response handling
  await runner.runTest('Large Response Handling', async () => {
    // Create enough services to generate a large response
    const largeCount = 20;
    const createdServices = [];

    for (let i = 0; i < largeCount; i++) {
      const serviceData = generateMockService({
        title: `Large Response Test Service ${i + 1}`,
        description: `A`.repeat(1000) // 1KB description per service
      });

      const response = await makeApiCall('/services', 'POST', {
        userId: TEST_CONFIG.testUserId,
        serviceData
      });

      if (response.data.success) {
        createdServices.push(response.data.data);
      }
    }

    // Test listing large dataset
    const largeResponseStart = Date.now();
    const largeResponse = await makeApiCall('/services?limit=100');
    const largeResponseDuration = Date.now() - largeResponseStart;

    assertEqual(largeResponse.response.ok, true, 'Large response should succeed');
    assertTrue(largeResponseDuration < 10000,
      `Large response should handle within 10 seconds, took ${largeResponseDuration}ms`);
    assertTrue(largeResponse.data.data.length >= largeCount, 'Should return all services');

    // Estimate response size
    const responseSize = JSON.stringify(largeResponse.data).length;
    assertTrue(responseSize > 50000, `Response should be substantial (${responseSize} bytes)`);

    // Cleanup
    for (const service of createdServices) {
      await makeApiCall(`/services/${service.service_id}`, 'DELETE', {
        userId: TEST_CONFIG.testUserId
      });
    }
  });

  // Performance Test 5: Search performance
  await runner.runTest('Search Performance', async () => {
    // Create diverse services for search testing
    const searchServices = [
      { title: 'Web Development Service', category: 'Technology' },
      { title: 'Mobile App Development', category: 'Technology' },
      { title: 'UI/UX Design Service', category: 'Design' },
      { title: 'Logo Design Service', category: 'Design' },
      { title: 'Digital Marketing', category: 'Marketing' },
      { title: 'Content Writing Service', category: 'Marketing' },
      { title: 'SEO Optimization', category: 'Marketing' },
      { title: 'Database Design', category: 'Technology' },
      { title: 'Brand Identity Design', category: 'Design' },
      { title: 'Social Media Marketing', category: 'Marketing' }
    ];

    const createdServices = [];

    for (const service of searchServices) {
      const response = await makeApiCall('/services', 'POST', {
        userId: TEST_CONFIG.testUserId,
        serviceData: generateMockService({
          title: service.title,
          main_category: service.category
        })
      });

      if (response.data.success) {
        createdServices.push(response.data.data);
      }
    }

    // Test search performance
    const searchStart = Date.now();
    const searchResponse = await makeApiCall('/services?search_term=Design');
    const searchDuration = Date.now() - searchStart;

    assertEqual(searchResponse.response.ok, true, 'Search should succeed');
    assertTrue(searchDuration < 2000, `Search should respond within 2 seconds, took ${searchDuration}ms`);
    assertTrue(searchResponse.data.data.length >= 3, 'Should find multiple design services');

    // Test category filter performance
    const categoryStart = Date.now();
    const categoryResponse = await makeApiCall('/services?category=Technology');
    const categoryDuration = Date.now() - categoryStart;

    assertEqual(categoryResponse.response.ok, true, 'Category filter should succeed');
    assertTrue(categoryDuration < 2000, `Category filter should respond within 2 seconds, took ${categoryDuration}ms`);
    assertTrue(categoryResponse.data.data.length >= 3, 'Should find multiple technology services');

    // Cleanup
    for (const service of createdServices) {
      await makeApiCall(`/services/${service.service_id}`, 'DELETE', {
        userId: TEST_CONFIG.testUserId
      });
    }
  });

  runner.printResults();
  return runner.getResults();
}