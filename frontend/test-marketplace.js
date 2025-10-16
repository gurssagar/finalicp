// Simple marketplace canister test script
// Run with: node test-marketplace.js

const BASE_URL = 'http://localhost:3000';

async function testMarketplaceAPI() {
  console.log('🚀 Testing Marketplace Canister Integration...\n');

  try {
    // Test 1: Basic connectivity
    console.log('📡 Testing basic connectivity...');
    const connectivityResponse = await fetch(`${BASE_URL}/api/marketplace/test`);
    const connectivityData = await connectivityResponse.json();

    console.log('✅ Connectivity Test Result:', {
      success: connectivityData.success,
      environment: connectivityData.environment,
      usedRealCanister: connectivityData.usedRealCanister,
      stats: connectivityData.stats
    });
    console.log('');

    // Test 2: Create a service
    console.log('📝 Testing service creation...');
    const createServiceResponse = await fetch(`${BASE_URL}/api/marketplace/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'createService',
        testData: {
          userId: 'test-user-123',
          title: 'Test Service - Web Design',
          main_category: 'Web Designer',
          sub_category: 'UI/UX Design',
          description: 'Professional web design and development services',
          whats_included: 'Custom design, responsive layout, SEO optimization',
          portfolio_images: ['https://example.com/portfolio1.jpg'],
          faqs: [
            {
              id: '1',
              question: 'How long does a typical project take?',
              answer: 'Usually 2-4 weeks depending on complexity.'
            }
          ],
          client_questions: [
            {
              id: '1',
              type: 'text',
              question: 'What is your business type?',
              required: true
            }
          ]
        }
      })
    });

    const createServiceData = await createServiceResponse.json();
    console.log('✅ Service Creation Result:', {
      success: createServiceData.success,
      action: createServiceData.action,
      message: createServiceData.message,
      serviceId: createServiceData.data?.service_id,
      usedRealCanister: createServiceData.usedRealCanister
    });
    console.log('');

    // Test 3: Create a package
    if (createServiceData.success && createServiceData.data?.service_id) {
      console.log('📦 Testing package creation...');
      const createPackageResponse = await fetch(`${BASE_URL}/api/marketplace/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'createPackage',
          testData: {
            userId: 'test-user-123',
            service_id: createServiceData.data.service_id,
            tier: 'Basic',
            title: 'Basic Web Design Package',
            description: 'Perfect for small businesses and startups',
            price_e8s: 500000000, // 5 ICP
            delivery_days: 7,
            features: ['Custom homepage', 'Mobile responsive', 'Basic SEO'],
            revisions_included: 2
          }
        })
      });

      const createPackageData = await createPackageResponse.json();
      console.log('✅ Package Creation Result:', {
        success: createPackageData.success,
        action: createPackageData.action,
        message: createPackageData.message,
        packageId: createPackageData.data?.package_id,
        usedRealCanister: createPackageData.usedRealCanister
      });
      console.log('');
    }

    // Test 4: List services
    console.log('📋 Testing service listing...');
    const listServicesResponse = await fetch(`${BASE_URL}/api/marketplace/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'listServices',
        testData: {
          limit: 5,
          search_term: 'web design'
        }
      })
    });

    const listServicesData = await listServicesResponse.json();
    console.log('✅ Service Listing Result:', {
      success: listServicesData.success,
      action: listServicesData.action,
      message: listServicesData.message,
      count: listServicesData.count,
      usedRealCanister: listServicesData.usedRealCanister
    });
    console.log('');

    // Test 5: Full flow test
    console.log('🔄 Testing full service creation flow...');
    const fullFlowResponse = await fetch(`${BASE_URL}/api/marketplace/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'fullFlowTest'
      })
    });

    const fullFlowData = await fullFlowResponse.json();
    console.log('✅ Full Flow Test Result:', {
      success: fullFlowData.success,
      action: fullFlowData.action,
      message: fullFlowData.message,
      steps: fullFlowData.data?.map(step => ({
        step: step.step,
        success: step.success,
        hasError: !!step.error
      })),
      usedRealCanister: fullFlowData.usedRealCanister
    });
    console.log('');

    // Test 6: Test with real canister (if available)
    console.log('🔗 Testing with real canister...');
    const realCanisterResponse = await fetch(`${BASE_URL}/api/marketplace/test?useRealCanister=true`);
    const realCanisterData = await realCanisterResponse.json();

    console.log('✅ Real Canister Test Result:', {
      success: realCanisterData.success,
      environment: realCanisterData.environment,
      usedRealCanister: realCanisterData.usedRealCanister,
      stats: realCanisterData.stats
    });
    console.log('');

    console.log('🎉 All marketplace tests completed!');
    console.log('\n📊 Summary:');
    console.log('- Basic Connectivity:', connectivityData.success ? '✅' : '❌');
    console.log('- Service Creation:', createServiceData.success ? '✅' : '❌');
    console.log('- Package Creation:', createServiceData.success ? '✅' : '❌');
    console.log('- Service Listing:', listServicesData.success ? '✅' : '❌');
    console.log('- Full Flow Test:', fullFlowData.success ? '✅' : '❌');
    console.log('- Real Canister:', realCanisterData.success ? '✅' : '❌');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the tests
testMarketplaceAPI().catch(console.error);