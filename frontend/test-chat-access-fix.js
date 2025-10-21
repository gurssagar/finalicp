#!/usr/bin/env node

/**
 * Test script to verify chat access fix for completed bookings
 * This tests the updated chat permission logic
 */

// Use built-in fetch (Node.js 18+)

const BASE_URL = 'http://localhost:3002';

// Test cases for different booking scenarios
const testCases = [
  {
    name: 'Active Booking - Should Allow Chat',
    userEmail: 'client@example.com',
    freelancerEmail: 'freelancer@example.com',
    expectedCanChat: true
  },
  {
    name: 'Completed Booking - Should Allow Chat (FIXED)',
    userEmail: 'client@example.com',
    freelancerEmail: 'freelancer2@example.com',
    expectedCanChat: true
  },
  {
    name: 'No Booking - Should Deny Chat',
    userEmail: 'client@example.com',
    freelancerEmail: 'unknown@example.com',
    expectedCanChat: false
  },
  {
    name: 'Freelancer with Completed Booking - Should Allow Chat',
    userEmail: 'client3@example.com',
    freelancerEmail: 'freelancer@example.com',
    expectedCanChat: true
  }
];

async function testChatPermission(testCase) {
  console.log(`\n🧪 Testing: ${testCase.name}`);
  console.log(`   Client: ${testCase.userEmail}`);
  console.log(`   Freelancer: ${testCase.freelancerEmail}`);

  try {
    const response = await fetch(`${BASE_URL}/api/chat/can-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userEmail: testCase.userEmail,
        otherUserEmail: testCase.freelancerEmail
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const canChat = data.canChat;

    console.log(`   ✅ Response: ${canChat ? 'CAN CHAT' : 'CANNOT CHAT'}`);
    console.log(`   📊 Expected: ${testCase.expectedCanChat ? 'CAN CHAT' : 'CANNOT CHAT'}`);

    if (canChat === testCase.expectedCanChat) {
      console.log(`   ✅ TEST PASSED`);
      return true;
    } else {
      console.log(`   ❌ TEST FAILED - Chat permission doesn't match expectation`);
      console.log(`   📋 Debug info:`, data.debug);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ TEST ERROR: ${error.message}`);
    return false;
  }
}

async function testBookingContactsAPI() {
  console.log('\n🧪 Testing Booking Contacts API');

  const testUsers = [
    { email: 'client@example.com', userType: 'client' },
    { email: 'freelancer@example.com', userType: 'freelancer' }
  ];

  for (const user of testUsers) {
    console.log(`\n   Testing ${user.userType}: ${user.email}`);

    try {
      const url = `${BASE_URL}/api/chat/booking-contacts?userEmail=${encodeURIComponent(user.email)}&userType=${user.userType}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`   ✅ Found ${data.contacts?.length || 0} booking contacts`);

      if (data.contacts && data.contacts.length > 0) {
        data.contacts.forEach((contact, index) => {
          console.log(`      ${index + 1}. ${contact.email} (${contact.status})`);
        });
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }
}

async function main() {
  console.log('🚀 Testing Chat Access Fix for Completed Bookings');
  console.log('==================================================');

  // Test the booking contacts API first
  await testBookingContactsAPI();

  // Test chat permission for each scenario
  let passedTests = 0;
  let totalTests = testCases.length;

  for (const testCase of testCases) {
    const passed = await testChatPermission(testCase);
    if (passed) passedTests++;
  }

  console.log('\n📊 Test Results Summary');
  console.log('========================');
  console.log(`✅ Passed: ${passedTests}/${totalTests}`);
  console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`);

  if (passedTests === totalTests) {
    console.log('\n🎉 All tests passed! Chat access fix is working correctly.');
    console.log('✅ Users can now chat with freelancers they have completed bookings with.');
  } else {
    console.log('\n⚠️ Some tests failed. Please check the implementation.');
  }

  console.log('\n💡 Key Fix: Chat access now works for both ACTIVE and COMPLETED bookings');
  console.log('   - Updated booking-contacts API to include completed bookings');
  console.log('   - Modified chat storage agent with fallback booking check');
  console.log('   - Added booked services page for users to see their booking history');
}

if (require.main === module) {
  main().catch(console.error);
}