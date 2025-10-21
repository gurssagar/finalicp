#!/usr/bin/env node

/**
 * Test script for chat access control system
 * Tests booking-based chat permissions and relationship management
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3002';
const TEST_USERS = {
  client: 'client1@example.com',
  freelancer: 'freelancer1@example.com',
  unauthorizedClient: 'client2@example.com'
};

const TEST_BOOKING = {
  bookingId: 'TEST-BOOKING-001',
  serviceTitle: 'Web Development Service',
  clientEmail: TEST_USERS.client,
  freelancerEmail: TEST_USERS.freelancer
};

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testCanChat(userEmail, otherUserEmail, expectedResult) {
  console.log(`\n🔍 Testing canChat: ${userEmail} -> ${otherUserEmail}`);

  try {
    const response = await fetch(`${BASE_URL}/api/chat/can-chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userEmail, otherUserEmail })
    });

    const data = await response.json();
    console.log(`   Status: ${response.status}`);
    console.log(`   Response:`, data);

    if (data.success && data.canChat === expectedResult) {
      console.log(`   ✅ PASS: Permission check returned expected result: ${expectedResult}`);
      return true;
    } else {
      console.log(`   ❌ FAIL: Expected ${expectedResult}, got ${data.canChat}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}`);
    return false;
  }
}

async function testCreateRelationship() {
  console.log(`\n🔗 Creating chat relationship for booking: ${TEST_BOOKING.bookingId}`);

  try {
    const response = await fetch(`${BASE_URL}/api/chat/create-relationship`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientEmail: TEST_BOOKING.clientEmail,
        freelancerEmail: TEST_BOOKING.freelancerEmail,
        bookingId: TEST_BOOKING.bookingId,
        serviceTitle: TEST_BOOKING.serviceTitle,
        status: 'Active'
      })
    });

    const data = await response.json();
    console.log(`   Status: ${response.status}`);
    console.log(`   Response:`, data);

    if (data.success) {
      console.log(`   ✅ PASS: Chat relationship created successfully`);
      return true;
    } else {
      console.log(`   ❌ FAIL: Failed to create chat relationship`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}`);
    return false;
  }
}

async function testGetRelationships(userEmail) {
  console.log(`\n📋 Getting chat relationships for: ${userEmail}`);

  try {
    const response = await fetch(`${BASE_URL}/api/chat/relationships?userEmail=${encodeURIComponent(userEmail)}`);
    const data = await response.json();

    console.log(`   Status: ${response.status}`);
    console.log(`   Relationships found:`, data.relationships?.length || 0);

    if (data.success) {
      data.relationships?.forEach((rel, index) => {
        console.log(`   ${index + 1}. ${rel.clientEmail} <-> ${rel.freelancerEmail} (${rel.status})`);
      });
      return true;
    } else {
      console.log(`   ❌ FAIL: Failed to get relationships`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}`);
    return false;
  }
}

async function testSendMessage(from, to, shouldSucceed) {
  console.log(`\n💬 Testing message send: ${from} -> ${to}`);

  try {
    const response = await fetch(`${BASE_URL}/api/chat/messages/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to,
        text: `Test message from ${from} to ${to}`,
        messageType: 'text',
        timestamp: new Date().toISOString()
      })
    });

    const data = await response.json();
    console.log(`   Status: ${response.status}`);
    console.log(`   Response:`, data);

    if (shouldSucceed && response.ok && data.success) {
      console.log(`   ✅ PASS: Message sent successfully`);
      return true;
    } else if (!shouldSucceed && response.status === 403) {
      console.log(`   ✅ PASS: Message correctly blocked due to permissions`);
      return true;
    } else {
      console.log(`   ❌ FAIL: Unexpected result`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}`);
    return false;
  }
}

async function testUpdateRelationshipStatus() {
  console.log(`\n🔄 Updating relationship status to Completed`);

  try {
    const response = await fetch(`${BASE_URL}/api/chat/update-relationship`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bookingId: TEST_BOOKING.bookingId,
        newStatus: 'Completed'
      })
    });

    const data = await response.json();
    console.log(`   Status: ${response.status}`);
    console.log(`   Response:`, data);

    if (data.success) {
      console.log(`   ✅ PASS: Relationship status updated successfully`);
      return true;
    } else {
      console.log(`   ❌ FAIL: Failed to update relationship status`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}`);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting Chat Access Control Tests');
  console.log('=====================================');

  const results = [];

  // Test 1: Check permissions before creating relationship
  console.log('\n📝 TEST 1: Permissions BEFORE relationship creation');
  results.push(await testCanChat(TEST_USERS.client, TEST_USERS.freelancer, false));
  results.push(await testCanChat(TEST_USERS.unauthorizedClient, TEST_USERS.freelancer, false));

  // Test 2: Create chat relationship
  console.log('\n📝 TEST 2: Create chat relationship');
  results.push(await testCreateRelationship());

  // Wait a moment for relationship to be processed
  await sleep(1000);

  // Test 3: Check permissions after creating relationship
  console.log('\n📝 TEST 3: Permissions AFTER relationship creation');
  results.push(await testCanChat(TEST_USERS.client, TEST_USERS.freelancer, true));
  results.push(await testCanChat(TEST_USERS.unauthorizedClient, TEST_USERS.freelancer, false));

  // Test 4: Get relationships for both users
  console.log('\n📝 TEST 4: Get user relationships');
  results.push(await testGetRelationships(TEST_USERS.client));
  results.push(await testGetRelationships(TEST_USERS.freelancer));

  // Test 5: Test message sending with permissions
  console.log('\n📝 TEST 5: Message sending with permissions');
  results.push(await testSendMessage(TEST_USERS.client, TEST_USERS.freelancer, true));
  results.push(await testSendMessage(TEST_USERS.freelancer, TEST_USERS.client, true));
  results.push(await testSendMessage(TEST_USERS.unauthorizedClient, TEST_USERS.freelancer, false));

  // Test 6: Update relationship status
  console.log('\n📝 TEST 6: Update relationship status');
  results.push(await testUpdateRelationshipStatus());

  // Wait for status update to process
  await sleep(1000);

  // Test 7: Check permissions after status update
  console.log('\n📝 TEST 7: Permissions AFTER status update (Completed)');
  results.push(await testCanChat(TEST_USERS.client, TEST_USERS.freelancer, false));

  // Final results
  const passed = results.filter(r => r).length;
  const total = results.length;

  console.log('\n=====================================');
  console.log(`🏁 Test Results: ${passed}/${total} tests passed`);

  if (passed === total) {
    console.log('🎉 All tests passed! Chat access control is working correctly.');
    process.exit(0);
  } else {
    console.log('⚠️ Some tests failed. Please check the implementation.');
    process.exit(1);
  }
}

// Check if the server is running before starting tests
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
    console.error('❌ Cannot connect to server. Make sure the frontend is running on http://localhost:3002');
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Run the tests
checkServer();