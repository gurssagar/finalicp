#!/usr/bin/env node

/**
 * Test script for ICP Authentication Proxy
 * Tests the backend proxy functionality for ICP canister operations
 */

const { icpAuthProxy } = require('./lib/icp-auth-proxy');

const BASE_URL = 'http://localhost:3002';
const TEST_USERS = {
  client: 'client1@example.com',
  freelancer: 'freelancer1@example.com'
};

const TEST_BOOKING = {
  bookingId: 'PROXY-TEST-001',
  serviceTitle: 'Test Service',
  clientEmail: TEST_USERS.client,
  freelancerEmail: TEST_USERS.freelancer
};

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testAuthentication() {
  console.log('\n🔐 Testing ICP Authentication Proxy');

  try {
    // Test authentication for both users
    const clientAuth = await icpAuthProxy.authenticateUser(TEST_USERS.client, 'Test Client');
    const freelancerAuth = await icpAuthProxy.authenticateUser(TEST_USERS.freelancer, 'Test Freelancer');

    console.log(`   Client auth: ${clientAuth ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   Freelancer auth: ${freelancerAuth ? '✅ PASS' : '❌ FAIL'}`);

    return clientAuth && freelancerAuth;
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}`);
    return false;
  }
}

async function testCanChat(expectedResult) {
  console.log(`\n🔍 Testing canChat via proxy`);

  try {
    const canChat = await icpAuthProxy.canChat(TEST_USERS.client, TEST_USERS.freelancer);
    console.log(`   Can chat result: ${canChat}`);

    if (canChat === expectedResult) {
      console.log(`   ✅ PASS: Expected ${expectedResult}, got ${canChat}`);
      return true;
    } else {
      console.log(`   ❌ FAIL: Expected ${expectedResult}, got ${canChat}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}`);
    return false;
  }
}

async function testCreateRelationship() {
  console.log(`\n🔗 Creating chat relationship via proxy`);

  try {
    const result = await icpAuthProxy.createChatRelationship(
      TEST_BOOKING.clientEmail,
      TEST_BOOKING.freelancerEmail,
      TEST_BOOKING.bookingId,
      TEST_BOOKING.serviceTitle,
      'Active'
    );

    console.log(`   ${result ? '✅ PASS' : '❌ FAIL'}: Relationship creation ${result ? 'succeeded' : 'failed'}`);
    return result;
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}`);
    return false;
  }
}

async function testSaveMessage() {
  console.log(`\n💬 Testing message save via proxy`);

  try {
    const messageId = await icpAuthProxy.saveMessage(
      TEST_USERS.client,
      TEST_USERS.freelancer,
      'Test message via proxy',
      'text',
      new Date().toISOString(),
      'Test Client'
    );

    if (messageId) {
      console.log(`   ✅ PASS: Message saved with ID: ${messageId}`);
      return true;
    } else {
      console.log(`   ❌ FAIL: Failed to save message`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}`);
    return false;
  }
}

async function testGetRelationships() {
  console.log(`\n📋 Testing get relationships via proxy`);

  try {
    const relationships = await icpAuthProxy.getChatRelationships(TEST_USERS.client);
    console.log(`   Found ${relationships.length} relationships`);

    relationships.forEach((rel, index) => {
      console.log(`   ${index + 1}. ${rel.clientEmail} <-> ${rel.freelancerEmail} (${rel.status})`);
    });

    console.log(`   ✅ PASS: Successfully retrieved relationships`);
    return true;
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}`);
    return false;
  }
}

async function testUpdateRelationship() {
  console.log(`\n🔄 Testing relationship status update via proxy`);

  try {
    const result = await icpAuthProxy.updateRelationshipStatus(
      TEST_BOOKING.bookingId,
      'Completed'
    );

    console.log(`   ${result ? '✅ PASS' : '❌ FAIL'}: Status update ${result ? 'succeeded' : 'failed'}`);
    return result;
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}`);
    return false;
  }
}

async function testHealthCheck() {
  console.log(`\n🏥 Testing health check via proxy`);

  try {
    const health = await icpAuthProxy.healthCheck();
    console.log(`   Health status: ${health}`);

    if (health === 'Chat Storage Canister is running' || health.includes('healthy')) {
      console.log(`   ✅ PASS: Health check successful`);
      return true;
    } else {
      console.log(`   ❌ FAIL: Unexpected health status`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}`);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting ICP Authentication Proxy Tests');
  console.log('==========================================');

  const results = [];

  // Test 1: Health check first
  console.log('\n📝 TEST 1: Health Check');
  results.push(await testHealthCheck());

  // Test 2: Authentication
  console.log('\n📝 TEST 2: Authentication');
  results.push(await testAuthentication());

  // Test 3: Check permissions before relationship
  console.log('\n📝 TEST 3: Can Chat (Before Relationship)');
  results.push(await testCanChat(false));

  // Test 4: Create relationship
  console.log('\n📝 TEST 4: Create Relationship');
  results.push(await testCreateRelationship());

  // Wait for relationship to be processed
  await sleep(1000);

  // Test 5: Check permissions after relationship
  console.log('\n📝 TEST 5: Can Chat (After Relationship)');
  results.push(await testCanChat(true));

  // Test 6: Save message
  console.log('\n📝 TEST 6: Save Message');
  results.push(await testSaveMessage());

  // Test 7: Get relationships
  console.log('\n📝 TEST 7: Get Relationships');
  results.push(await testGetRelationships());

  // Test 8: Update relationship status
  console.log('\n📝 TEST 8: Update Relationship Status');
  results.push(await testUpdateRelationship());

  // Wait for status update to process
  await sleep(1000);

  // Test 9: Check permissions after status update
  console.log('\n📝 TEST 9: Can Chat (After Status Update)');
  results.push(await testCanChat(false));

  // Final results
  const passed = results.filter(r => r).length;
  const total = results.length;

  console.log('\n==========================================');
  console.log(`🏁 Test Results: ${passed}/${total} tests passed`);

  if (passed === total) {
    console.log('🎉 All tests passed! ICP Authentication Proxy is working correctly.');
    process.exit(0);
  } else {
    console.log('⚠️ Some tests failed. Please check the implementation.');
    process.exit(1);
  }
}

// Check if the frontend server is running
async function checkServer() {
  try {
    const response = await fetch(`${BASE_URL}/api/chat/health`);
    if (response.ok) {
      runAllTests();
    } else {
      console.error('❌ Server health check failed');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Cannot connect to frontend server. Make sure it\'s running on http://localhost:3002');
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Run the tests
checkServer();