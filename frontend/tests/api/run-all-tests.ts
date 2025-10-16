#!/usr/bin/env npx ts-node

/**
 * Main test runner for ICPWork API tests
 *
 * Usage:
 *   npx ts-node tests/api/run-all-tests.ts                    # Run all tests
 *   npx ts-node tests/api/run-all-tests.ts --services      # Run only services tests
 *   npx ts-node tests/api/run-all-tests.ts --integration   # Run only integration tests
 *   npx ts-node tests/api/run-all-tests.ts --performance   # Run only performance tests
 */

import { runServicesTests } from './services.test';
import { runIntegrationTests } from './integration.test';
import { runErrorHandlingTests } from './error-handling.test';
import { runDataValidationTests } from './data-validation.test';
import { runPerformanceTests } from './performance.test';

interface TestSuite {
  name: string;
  run: () => Promise<any>;
  enabled: boolean;
}

const availableTestSuites: TestSuite[] = [
  {
    name: 'Services API Tests',
    run: runServicesTests,
    enabled: true
  },
  {
    name: 'Integration Tests',
    run: runIntegrationTests,
    enabled: true
  },
  {
    name: 'Error Handling Tests',
    run: runErrorHandlingTests,
    enabled: true
  },
  {
    name: 'Data Validation Tests',
    run: runDataValidationTests,
    enabled: true
  },
  {
    name: 'Performance Tests',
    run: runPerformanceTests,
    enabled: true
  }
];

class TestOrchestrator {
  private results: Array<{
    suite: string;
    results: any;
    success: boolean;
    error?: string;
    duration: number;
  }> = [];

  private startTime: number = 0;
  private endTime: number = 0;

  async runTests(filter?: string): Promise<void> {
    this.startTime = Date.now();

    console.log('🚀 ICPWork API Test Runner');
    console.log('============================');
    console.log(`Starting tests at ${new Date().toISOString()}`);
    console.log('');

    const testSuites = this.getTestSuitesToRun(filter);

    if (testSuites.length === 0) {
      console.log('❌ No test suites found matching the filter');
      console.log(`Available test suites: ${availableTestSuites.map(s => s.name).join(', ')}`);
      process.exit(1);
    }

    console.log(`Running ${testSuites.length} test suite(s):`);
    testSuites.forEach(suite => {
      console.log(`  • ${suite.name}`);
    });
    console.log('');

    for (const testSuite of testSuites) {
      await this.runTestSuite(testSuite);
    }

    this.endTime = Date.now();
    this.printFinalResults();
  }

  private getTestSuitesToRun(filter?: string): TestSuite[] {
    if (!filter) {
      return availableTestSuites.filter(suite => suite.enabled);
    }

    const filterLower = filter.toLowerCase();
    return availableTestSuites.filter(suite =>
      suite.enabled &&
      suite.name.toLowerCase().includes(filterLower)
    );
  }

  private async runTestSuite(testSuite: TestSuite): Promise<void> {
    console.log(`📋 Running: ${testSuite.name}`);
    console.log('─'.repeat(50));

    const suiteStartTime = Date.now();
    let success = true;
    let error: string | undefined;
    let results: any;

    try {
      results = await testSuite.run();
      console.log('');
    } catch (err) {
      success = false;
      error = err instanceof Error ? err.message : String(err);
      console.log(`❌ ${testSuite.name} failed: ${error}`);
      console.log('');
    }

    const suiteDuration = Date.now() - suiteStartTime;

    this.results.push({
      suite: testSuite.name,
      results,
      success,
      error,
      duration: suiteDuration
    });
  }

  private printFinalResults(): void {
    const totalDuration = this.endTime - this.startTime;
    const totalSuites = this.results.length;
    const successfulSuites = this.results.filter(r => r.success).length;
    const failedSuites = totalSuites - successfulSuites;

    console.log('🏁 Final Results');
    console.log('================');

    this.results.forEach(result => {
      const status = result.success ? '✅' : '❌';
      const duration = `(${result.duration}ms)`;
      console.log(`${status} ${result.suite} ${duration}`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
    });

    console.log('');
    console.log('📊 Summary');
    console.log('==========');
    console.log(`Total Test Suites: ${totalSuites}`);
    console.log(`Successful: ${successfulSuites}`);
    console.log(`Failed: ${failedSuites}`);
    console.log(`Success Rate: ${totalSuites > 0 ? ((successfulSuites / totalSuites) * 100).toFixed(1) : 0}%`);
    console.log(`Total Duration: ${totalDuration}ms`);

    this.printTestStatistics();

    if (failedSuites > 0) {
      console.log('');
      console.log('❌ Some tests failed. Please check the errors above.');
      process.exit(1);
    } else {
      console.log('');
      console.log('🎉 All tests passed successfully!');
      process.exit(0);
    }
  }

  private printTestStatistics(): void {
    let totalTests = 0;
    let totalPassed = 0;
    let totalFailed = 0;

    console.log('');
    console.log('📈 Individual Test Statistics');
    console.log('-------------------------------');

    this.results.forEach(result => {
      if (result.results && result.results.getSummary) {
        const summary = result.results.getSummary();
        totalTests += summary.total;
        totalPassed += summary.passed;
        totalFailed += summary.failed;

        console.log(`${result.suite}:`);
        console.log(`  Tests: ${summary.total}, Passed: ${summary.passed}, Failed: ${summary.failed}`);
        if (summary.totalDuration) {
          console.log(`  Duration: ${summary.totalDuration}ms`);
        }
      }
    });

    console.log('-------------------------------');
    console.log(`Overall: ${totalTests} tests, ${totalPassed} passed, ${totalFailed} failed`);
  }
}

function parseArguments(): { filter?: string; help: boolean } {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    return { help: true };
  }

  const filterArg = args.find(arg => arg.startsWith('--'));
  const filter = filterArg ? filterArg.substring(2) : undefined;

  return { filter, help: false };
}

function showHelp(): void {
  console.log('ICPWork API Test Runner');
  console.log('======================');
  console.log('');
  console.log('Usage:');
  console.log('  npx ts-node tests/api/run-all-tests.ts [options]');
  console.log('');
  console.log('Options:');
  console.log('  --help, -h              Show this help message');
  console.log('  --filter <name>        Run only test suites matching the filter');
  console.log('');
  console.log('Examples:');
  console.log('  npx ts-node tests/api/run-all-tests.ts                    # Run all tests');
  console.log('  npx ts-node tests/api/run-all-tests.ts --services         # Run only services tests');
  console.log('  npx ts-node tests/api/run-all-tests.ts --integration      # Run only integration tests');
  console.log('  npx ts-node tests/api/run-all-tests.ts --performance      # Run only performance tests');
  console.log('  npx ts-node tests/api/run-all-tests.ts --error           # Run only error handling tests');
  console.log('');
  console.log('Available test suites:');
  availableTestSuites.forEach(suite => {
    console.log(`  • ${suite.name.toLowerCase().replace(/\s+/g, '-')}`);
  });
}

async function main(): Promise<void> {
  const { filter, help } = parseArguments();

  if (help) {
    showHelp();
    return;
  }

  const orchestrator = new TestOrchestrator();
  await orchestrator.runTests(filter);
}

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error.message);
  console.error(error.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Test runner failed:', error.message);
    process.exit(1);
  });
}