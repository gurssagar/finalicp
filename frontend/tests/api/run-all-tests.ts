#!/usr/bin/env tsx

import { runServicesTests } from './services.test';
import { runPackagesTests } from './packages.test';
import { runBookingsTests } from './bookings.test';
import { runStagesTests } from './stages.test';

async function runAllTests() {
  console.log('🚀 Starting Marketplace API Tests');
  console.log('===================================\n');

  const startTime = Date.now();
  const results = {
    services: { passed: 0, failed: 0, total: 0 },
    packages: { passed: 0, failed: 0, total: 0 },
    bookings: { passed: 0, failed: 0, total: 0 },
    stages: { passed: 0, failed: 0, total: 0 }
  };

  try {
    console.log('📋 Running Services Tests...');
    const servicesResults = await runServicesTests();
    results.services.passed = servicesResults.filter(r => r.passed).length;
    results.services.failed = servicesResults.filter(r => !r.passed).length;
    results.services.total = servicesResults.length;
    console.log(`✅ Services Tests: ${results.services.passed}/${results.services.total} passed\n`);

    console.log('📦 Running Packages Tests...');
    const packagesResults = await runPackagesTests();
    results.packages.passed = packagesResults.filter(r => r.passed).length;
    results.packages.failed = packagesResults.filter(r => !r.passed).length;
    results.packages.total = packagesResults.length;
    console.log(`✅ Packages Tests: ${results.packages.passed}/${results.packages.total} passed\n`);

    console.log('📝 Running Bookings Tests...');
    const bookingsResults = await runBookingsTests();
    results.bookings.passed = bookingsResults.filter(r => r.passed).length;
    results.bookings.failed = bookingsResults.filter(r => !r.passed).length;
    results.bookings.total = bookingsResults.length;
    console.log(`✅ Bookings Tests: ${results.bookings.passed}/${results.bookings.total} passed\n`);

    console.log('🎯 Running Stages Tests...');
    const stagesResults = await runStagesTests();
    results.stages.passed = stagesResults.filter(r => r.passed).length;
    results.stages.failed = stagesResults.filter(r => !r.passed).length;
    results.stages.total = stagesResults.length;
    console.log(`✅ Stages Tests: ${results.stages.passed}/${results.stages.total} passed\n`);

  } catch (error) {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  }

  const endTime = Date.now();
  const duration = endTime - startTime;

  // Print final summary
  console.log('📊 Final Test Results');
  console.log('====================');
  console.log(`Services:  ${results.services.passed}/${results.services.total} passed (${results.services.failed} failed)`);
  console.log(`Packages:  ${results.packages.passed}/${results.packages.total} passed (${results.packages.failed} failed)`);
  console.log(`Bookings:  ${results.bookings.passed}/${results.bookings.total} passed (${results.bookings.failed} failed)`);
  console.log(`Stages:    ${results.stages.passed}/${results.stages.total} passed (${results.stages.failed} failed)`);
  
  const totalPassed = results.services.passed + results.packages.passed + results.bookings.passed + results.stages.passed;
  const totalTests = results.services.total + results.packages.total + results.bookings.total + results.stages.total;
  const totalFailed = totalTests - totalPassed;
  
  console.log(`\n🎯 Overall Results:`);
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${totalPassed}`);
  console.log(`Failed: ${totalFailed}`);
  console.log(`Success Rate: ${((totalPassed / totalTests) * 100).toFixed(1)}%`);
  console.log(`Duration: ${duration}ms`);

  if (totalFailed > 0) {
    console.log('\n❌ Some tests failed. Please check the output above for details.');
    process.exit(1);
  } else {
    console.log('\n🎉 All tests passed!');
    process.exit(0);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

export { runAllTests };
