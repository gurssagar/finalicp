// Test script to verify canister connectivity and data retrieval
const { Actor, HttpAgent } = require('@dfinity/agent');
const { Principal } = require('@dfinity/principal');

// Environment configuration
const IC_HOST = 'http://localhost:4943';
const USER_CANISTER_ID = 'v27v7-7x777-77774-qaaha-cai';

// Simple IDL for testing (minimal interface)
const idlFactory = ({ IDL }) => {
  const User = IDL.Record({
    'id': IDL.Text,
    'email': IDL.Text,
    'password_hash': IDL.Text,
    'is_verified': IDL.Bool,
    'created_at': IDL.Nat64,
    'last_login_at': IDL.Opt(IDL.Nat64),
    'profile': IDL.Opt(IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text))),
    'otp_data': IDL.Opt(IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text))),
  });

  const QueryResponse = IDL.Variant({
    'Ok': IDL.Text,
    'Err': IDL.Text,
  });

  return IDL.Service({
    'getUserByEmail': IDL.Func([IDL.Text], [IDL.Opt(User)], ['query']),
    'isProfileSubmitted': IDL.Func([IDL.Text], [IDL.Bool], ['query']),
  });
};

async function testCanisterConnection() {
  console.log('🔍 Testing canister connection...');
  console.log('IC_HOST:', IC_HOST);
  console.log('USER_CANISTER_ID:', USER_CANISTER_ID);

  try {
    // Create agent
    console.log('\n📡 Creating HttpAgent...');
    const agent = new HttpAgent({
      host: IC_HOST,
      verifyQuerySignatures: false
    });

    // Fetch root key for localhost development
    await agent.fetchRootKey();
    console.log('✅ HttpAgent created successfully');

    // Create actor
    console.log('\n🎭 Creating actor...');
    const canisterId = Principal.fromText(USER_CANISTER_ID);
    const actor = Actor.createActor(idlFactory, {
      agent,
      canisterId,
    });
    console.log('✅ Actor created successfully');

    // Test getUserByEmail with a sample email
    console.log('\n🔍 Testing getUserByEmail...');
    const testEmail = 'test@example.com';
    console.log('Querying for email:', testEmail);

    try {
      const result = await actor.getUserByEmail(testEmail);
      console.log('📊 getUserByEmail result:', result);

      if (result && result.length > 0) {
        console.log('✅ User data retrieved successfully');
        console.log('User ID:', result[0].id);
        console.log('Email:', result[0].email);
        console.log('Is Verified:', result[0].is_verified);
      } else {
        console.log('ℹ️ No user found for test email (this is expected)');
      }
    } catch (error) {
      console.error('❌ getUserByEmail failed:', error.message);
    }

    // Test isProfileSubmitted (this might fail if user doesn't exist)
    console.log('\n🔍 Testing isProfileSubmitted...');
    try {
      const testUserId = 'test-user-id';
      console.log('Checking profile submission for user ID:', testUserId);

      const isSubmitted = await actor.isProfileSubmitted(testUserId);
      console.log('📊 isProfileSubmitted result:', isSubmitted);
    } catch (error) {
      console.error('❌ isProfileSubmitted failed:', error.message);
      console.log('ℹ️ This is expected if the user ID doesn\'t exist');
    }

    console.log('\n✅ Canister connection test completed successfully!');
    return true;

  } catch (error) {
    console.error('\n❌ Canister connection failed:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });
    return false;
  }
}

async function testAPIEndpoints() {
  console.log('\n🌐 Testing API endpoints...');

  const testEndpoints = [
    {
      url: 'http://localhost:3000/api/profile/check-completeness',
      method: 'GET',
      description: 'Profile completeness check'
    },
    {
      url: 'http://localhost:3000/api/onboarding/complete',
      method: 'GET',
      description: 'Onboarding completion data retrieval'
    }
  ];

  for (const endpoint of testEndpoints) {
    console.log(`\n📡 Testing ${endpoint.description}...`);
    console.log('URL:', endpoint.url);
    console.log('Method:', endpoint.method);

    try {
      const response = await fetch(endpoint.url, {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('📊 Response status:', response.status);
      console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));

      const data = await response.json();
      console.log('📊 Response data:', data);

      if (response.ok) {
        console.log('✅ API endpoint working');
      } else {
        console.log('⚠️ API endpoint returned error:', response.status);
      }

    } catch (error) {
      console.error('❌ API endpoint failed:', error.message);
    }
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting comprehensive canister and API tests...\n');

  // Test 1: Canister connection
  const canisterConnected = await testCanisterConnection();

  if (canisterConnected) {
    console.log('\n✅ Canister connection is working!');
  } else {
    console.log('\n❌ Canister connection failed!');
    console.log('Please check:');
    console.log('1. Local IC replica is running (pocket-ic)');
    console.log('2. Canister IDs are correct');
    console.log('3. Environment variables are set properly');
  }

  // Test 2: API endpoints
  await testAPIEndpoints();

  console.log('\n🏁 All tests completed!');
}

// Run the tests
runTests().catch(console.error);