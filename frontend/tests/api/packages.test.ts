import { TestRunner, makeApiCall, TEST_CONFIG, MOCK_DATA } from './test-setup';

export async function runPackagesTests(): Promise<void> {
  const runner = new TestRunner();

  // First, create a service to test packages with
  let serviceId: string;
  
  await runner.runTest('Setup - Create Service for Package Tests', async () => {
    const { response, data } = await makeApiCall('/services', 'POST', {
      userId: TEST_CONFIG.testUserId,
      serviceData: MOCK_DATA.service
    });
    
    if (!response.ok || !data.success) {
      throw new Error('Failed to create service for package tests');
    }
    
    serviceId = data.data.service_id;
    TEST_CONFIG.testServiceId = serviceId;
  });

  // Test 1: Create package
  await runner.runTest('Create Package', async () => {
    const packageData = {
      ...MOCK_DATA.package,
      service_id: serviceId
    };
    
    const { response, data } = await makeApiCall('/packages', 'POST', {
      userId: TEST_CONFIG.testUserId,
      packageData
    });
    
    if (!response.ok) {
      throw new Error(`Expected 200, got ${response.status}: ${JSON.stringify(data)}`);
    }
    
    if (!data.success) {
      throw new Error(`Expected success: true, got: ${JSON.stringify(data)}`);
    }
    
    if (!data.data.package_id) {
      throw new Error(`Expected package_id in response, got: ${JSON.stringify(data.data)}`);
    }
    
    // Store the package ID for other tests
    TEST_CONFIG.testPackageId = data.data.package_id;
  });

  // Test 2: Get packages by service
  await runner.runTest('Get Packages by Service', async () => {
    const { response, data } = await makeApiCall(`/packages?service_id=${serviceId}`);
    
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
      throw new Error('Expected at least one package, got empty array');
    }
  });

  // Test 3: Get package by ID
  await runner.runTest('Get Package by ID', async () => {
    const { response, data } = await makeApiCall(`/packages/${TEST_CONFIG.testPackageId}`);
    
    if (!response.ok) {
      throw new Error(`Expected 200, got ${response.status}: ${JSON.stringify(data)}`);
    }
    
    if (!data.success) {
      throw new Error(`Expected success: true, got: ${JSON.stringify(data)}`);
    }
    
    if (data.data.package_id !== TEST_CONFIG.testPackageId) {
      throw new Error(`Expected package_id ${TEST_CONFIG.testPackageId}, got: ${data.data.package_id}`);
    }
  });

  // Test 4: Update package
  await runner.runTest('Update Package', async () => {
    const updatedPackage = {
      ...MOCK_DATA.package,
      service_id: serviceId,
      title: 'Updated Test Package',
      description: 'Updated description for testing',
      price_e8s: '6000000000' // 60 ICP
    };
    
    const { response, data } = await makeApiCall(`/packages/${TEST_CONFIG.testPackageId}`, 'PUT', {
      userId: TEST_CONFIG.testUserId,
      updates: updatedPackage
    });
    
    if (!response.ok) {
      throw new Error(`Expected 200, got ${response.status}: ${JSON.stringify(data)}`);
    }
    
    if (!data.success) {
      throw new Error(`Expected success: true, got: ${JSON.stringify(data)}`);
    }
    
    if (data.data.title !== 'Updated Test Package') {
      throw new Error(`Expected updated title, got: ${data.data.title}`);
    }
  });

  // Test 5: Get packages without service_id (should fail)
  await runner.runTest('Get Packages without Service ID', async () => {
    const { response, data } = await makeApiCall('/packages');
    
    if (response.status !== 400) {
      throw new Error(`Expected 400, got ${response.status}: ${JSON.stringify(data)}`);
    }
    
    if (data.success) {
      throw new Error(`Expected success: false for missing service_id`);
    }
  });

  // Test 6: Create package without userId (should fail)
  await runner.runTest('Create Package without User ID', async () => {
    const { response, data } = await makeApiCall('/packages', 'POST', {
      packageData: MOCK_DATA.package
    });
    
    if (response.status !== 400) {
      throw new Error(`Expected 400, got ${response.status}: ${JSON.stringify(data)}`);
    }
    
    if (data.success) {
      throw new Error(`Expected success: false for missing user ID`);
    }
  });

  // Test 7: Get non-existent package (should return 404)
  await runner.runTest('Get Non-existent Package', async () => {
    const { response, data } = await makeApiCall('/packages/PK-NONEXISTENT');
    
    if (response.status !== 404) {
      throw new Error(`Expected 404, got ${response.status}: ${JSON.stringify(data)}`);
    }
    
    if (data.success) {
      throw new Error(`Expected success: false for non-existent package`);
    }
  });

  // Test 8: Delete package
  await runner.runTest('Delete Package', async () => {
    const { response, data } = await makeApiCall(`/packages/${TEST_CONFIG.testPackageId}`, 'DELETE', {
      userId: TEST_CONFIG.testUserId
    });
    
    if (!response.ok) {
      throw new Error(`Expected 200, got ${response.status}: ${JSON.stringify(data)}`);
    }
    
    if (!data.success) {
      throw new Error(`Expected success: true, got: ${JSON.stringify(data)}`);
    }
  });

  runner.printResults();
  return runner.getResults();
}
