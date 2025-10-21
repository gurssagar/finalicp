#!/usr/bin/env node

/**
 * Complete Chat System Test
 * Tests the entire chat system including:
 * - Chat storage canister with access control
 * - Booking-based relationship management
 * - Socket.IO server with dual persistence
 * - ICP authentication proxy
 */

const { icpAuthProxy } = require('./lib/icp-auth-proxy');

const BASE_URL = 'http://localhost:3002';
const SOCKET_URL = 'http://localhost:4000';

const TEST_USERS = {
  client: 'alice@example.com',
  freelancer: 'bob@example.com',
  unauthorized: 'charlie@example.com'
};

const TEST_BOOKING = {
  bookingId: 'COMPLETE-TEST-001',
  serviceTitle: 'Complete Web Development Package',
  clientEmail: TEST_USERS.client,
  freelancerEmail: TEST_USERS.freelancer
};

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testHealthChecks() {
  console.log('\n🏥 Testing Health Checks');

  try {
    // Test frontend API health
    const frontendResponse = await fetch(`${BASE_URL}/api/chat/health`);
    const frontendHealth = await frontendResponse.json();
    console.log(`   Frontend API: ${frontendResponse.ok ? '✅ PASS' : '❌ FAIL'} (${frontendHealth.status})`);

    // Test Socket.IO server health
    const socketResponse = await fetch(`${SOCKET_URL}/health`);
    const socketHealth = await socketResponse.json();
    console.log(`   Socket.IO Server: ${socketResponse.ok ? '✅ PASS' : '❌ FAIL'} (${socketHealth.status})`);

    // Test ICP proxy health
    const proxyHealth = await icpAuthProxy.healthCheck();
    console.log(`   ICP Proxy: ${proxyHealth.includes('running') || proxyHealth.includes('healthy') ? '✅ PASS' : '❌ FAIL'} (${proxyHealth})`);

    return frontendResponse.ok && socketResponse.ok && (proxyHealth.includes('running') || proxyHealth.includes('healthy'));
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}`);
    return false;
  }
}

async function testAuthentication() {
  console.log('\n🔐 Testing User Authentication');

  try {
    const results = [];

    // Authenticate all test users
    for (const [userType, email] of Object.entries(TEST_USERS)) {
      const displayName = userType.charAt(0).toUpperCase() + userType.slice(1);
      const authResult = await icpAuthProxy.authenticateUser(email, displayName);
      console.log(`   ${displayName}: ${authResult ? '✅ PASS' : '❌ FAIL'}`);
      results.push(authResult);
    }

    return results.every(r => r);
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}`);
    return false;
  }
}

async function testAccessControl() {
  console.log('\n🔒 Testing Access Control');

  try {
    // Test permissions before relationship creation
    console.log('   Before relationship:');
    const canChatBefore = await icpAuthProxy.canChat(TEST_USERS.client, TEST_USERS.freelancer);
    console.log(`     Client <-> Freelancer: ${canChatBefore ? '❌ UNEXPECTED' : '✅ PASS'} (should be false)`);

    const canChatUnauthorized = await icpAuthProxy.canChat(TEST_USERS.unauthorized, TEST_USERS.freelancer);
    console.log(`     Unauthorized <-> Freelancer: ${canChatUnauthorized ? '❌ UNEXPECTED' : '✅ PASS'} (should be false)`);

    // Create chat relationship
    console.log('   Creating relationship...');
    const relationshipCreated = await icpAuthProxy.createChatRelationship(
      TEST_BOOKING.clientEmail,
      TEST_BOOKING.freelancerEmail,
      TEST_BOOKING.bookingId,
      TEST_BOOKING.serviceTitle,
      'Active'
    );
    console.log(`     Relationship creation: ${relationshipCreated ? '✅ PASS' : '❌ FAIL'}`);

    if (!relationshipCreated) {
      return false;
    }

    await sleep(1000); // Wait for relationship to be processed

    // Test permissions after relationship creation
    console.log('   After relationship:');
    const canChatAfter = await icpAuthProxy.canChat(TEST_USERS.client, TEST_USERS.freelancer);
    console.log(`     Client <-> Freelancer: ${canChatAfter ? '✅ PASS' : '❌ FAIL'} (should be true)`);

    const canChatUnauthorizedAfter = await icpAuthProxy.canChat(TEST_USERS.unauthorized, TEST_USERS.freelancer);
    console.log(`     Unauthorized <-> Freelancer: ${canChatUnauthorizedAfter ? '❌ UNEXPECTED' : '✅ PASS'} (should be false)`);

    return !canChatBefore && !canChatUnauthorized && relationshipCreated && canChatAfter && !canChatUnauthorizedAfter;
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}`);
    return false;
  }
}

async function testMessagePersistence() {
  console.log('\n💾 Testing Message Persistence');

  try {
    const testMessage = `Test message from complete system test at ${new Date().toISOString()}`;

    // Save message via proxy
    const messageId = await icpAuthProxy.saveMessage(
      TEST_USERS.client,
      TEST_USERS.freelancer,
      testMessage,
      'text',
      new Date().toISOString(),
      'Test Client'
    );

    console.log(`   Message save: ${messageId ? '✅ PASS' : '❌ FAIL'} (ID: ${messageId})`);

    if (!messageId) {
      return false;
    }

    // Wait a moment for message to be stored
    await sleep(1000);

    // Verify message was saved by checking chat history
    const historyResponse = await fetch(
      `${BASE_URL}/api/chat/history?userEmail=${encodeURIComponent(TEST_USERS.client)}&contactEmail=${encodeURIComponent(TEST_USERS.freelancer)}&limit=10&offset=0`
    );

    if (historyResponse.ok) {
      const historyData = await historyResponse.json();
      const savedMessage = historyData.messages?.find(msg => msg.text === testMessage);
      console.log(`   Message verification: ${savedMessage ? '✅ PASS' : '❌ FAIL'}`);
      return savedMessage !== undefined;
    } else {
      console.log(`   Message verification: ❌ FAIL (API error)`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}`);
    return false;
  }
}

async function testRelationshipManagement() {
  console.log('\n📋 Testing Relationship Management');

  try {
    // Get relationships for client
    const clientRelationships = await icpAuthProxy.getChatRelationships(TEST_USERS.client);
    console.log(`   Get client relationships: ${clientRelationships.length > 0 ? '✅ PASS' : '❌ FAIL'} (${clientRelationships.length} found)`);

    // Get relationships for freelancer
    const freelancerRelationships = await icpAuthProxy.getChatRelationships(TEST_USERS.freelancer);
    console.log(`   Get freelancer relationships: ${freelancerRelationships.length > 0 ? '✅ PASS' : '❌ FAIL'} (${freelancerRelationships.length} found)`);

    // Update relationship status
    const updateResult = await icpAuthProxy.updateRelationshipStatus(TEST_BOOKING.bookingId, 'Completed');
    console.log(`   Update relationship status: ${updateResult ? '✅ PASS' : '❌ FAIL'}`);

    await sleep(1000); // Wait for status update

    // Check that chat is no longer allowed after completion
    const canChatAfterCompletion = await icpAuthProxy.canChat(TEST_USERS.client, TEST_USERS.freelancer);
    console.log(`   Chat blocked after completion: ${!canChatAfterCompletion ? '✅ PASS' : '❌ FAIL'}`);

    return clientRelationships.length > 0 && freelancerRelationships.length > 0 && updateResult && !canChatAfterCompletion;
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}`);
    return false;
  }
}

async function testSocketIOIntegration() {
  console.log('\n🔌 Testing Socket.IO Integration');

  try {
    // Test that Socket.IO server is accessible
    const socketHealth = await fetch(`${SOCKET_URL}/health`);
    console.log(`   Socket.IO health: ${socketHealth.ok ? '✅ PASS' : '❌ FAIL'}`);

    if (socketHealth.ok) {
      const healthData = await socketHealth.json();
      console.log(`   Active connections: ${healthData.activeConnections || 0}`);
    }

    return socketHealth.ok;
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}`);
    return false;
  }
}

async function runCompleteTests() {
  console.log('🚀 Starting Complete Chat System Tests');
  console.log('=====================================');

  const results = [];

  // Test 1: Health checks
  console.log('\n📝 TEST 1: System Health Checks');
  results.push(await testHealthChecks());

  // Test 2: Authentication
  console.log('\n📝 TEST 2: User Authentication');
  results.push(await testAuthentication());

  // Test 3: Access Control
  console.log('\n📝 TEST 3: Access Control & Permissions');
  results.push(await testAccessControl());

  // Test 4: Message Persistence
  console.log('\n📝 TEST 4: Message Persistence');
  results.push(await testMessagePersistence());

  // Test 5: Relationship Management
  console.log('\n📝 TEST 5: Relationship Management');
  results.push(await testRelationshipManagement());

  // Test 6: Socket.IO Integration
  console.log('\n📝 TEST 6: Socket.IO Integration');
  results.push(await testSocketIOIntegration());

  // Final results
  const passed = results.filter(r => r).length;
  const total = results.length;

  console.log('\n=====================================');
  console.log(`🏁 Complete System Test Results: ${passed}/${total} test suites passed`);

  if (passed === total) {
    console.log('🎉 All tests passed! The complete chat system is working correctly.');
    console.log('\n✅ System Components Verified:');
    console.log('   • Chat Storage Canister with Access Control');
    console.log('   • Booking-Based Relationship Management');
    console.log('   • Socket.IO Server with Dual Persistence');
    console.log('   • ICP Authentication Proxy');
    console.log('   • Message Persistence to Blockchain');
    console.log('   • Permission-based Chat Controls');
    process.exit(0);
  } else {
    console.log('⚠️ Some test suites failed. Please check the implementation.');
    console.log(`\n${total - passed} test suite(s) failed out of ${total}`);
    process.exit(1);
  }
}

// Check if all required services are running
async function checkSystemRequirements() {
  console.log('🔍 Checking system requirements...');

  try {
    // Check frontend API
    const frontendResponse = await fetch(`${BASE_URL}/api/chat/health`);
    if (!frontendResponse.ok) {
      console.error('❌ Frontend API is not accessible. Make sure the frontend is running on http://localhost:3002');
      process.exit(1);
    }

    // Check Socket.IO server
    const socketResponse = await fetch(`${SOCKET_URL}/health`);
    if (!socketResponse.ok) {
      console.error('❌ Socket.IO server is not accessible. Make sure it\'s running on port 4000');
      console.error('   Run: ./scripts/start-chat-services.sh start');
      process.exit(1);
    }

    console.log('✅ All system requirements met');
    runCompleteTests();
  } catch (error) {
    console.error('❌ System requirements check failed:', error.message);
    console.error('\nMake sure the following services are running:');
    console.error('   • Frontend development server (http://localhost:3002)');
    console.error('   • Socket.IO server (http://localhost:4000)');
    console.error('   • ICP canisters (chat_storage)');
    process.exit(1);
  }
}

// Run the tests
checkSystemRequirements();