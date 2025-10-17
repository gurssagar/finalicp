// Test with a simple approach using the frontend's existing modules
import { getUserActor } from './frontend/lib/ic-agent.js';

async function testCanisterWithRealMethods() {
  console.log('🔍 Testing canister connection with real methods...');

  try {
    const actor = await getUserActor();
    console.log('✅ Actor created successfully');

    // Test if we can call methods
    console.log('\n🔍 Testing getUserByEmail with potential user emails...');

    const testEmails = [
      'admin@example.com',
      'test@example.com',
      'user@example.com',
      'john.doe@example.com'
    ];

    for (const email of testEmails) {
      try {
        console.log(`Testing email: ${email}`);
        const result = await actor.getUserByEmail(email);
        console.log(`Result:`, result);

        if (result && result.length > 0) {
          console.log(`✅ Found user: ${result[0].email}, ID: ${result[0].id}`);

          // Test isProfileSubmitted with actual user ID
          try {
            const isSubmitted = await actor.isProfileSubmitted(result[0].id);
            console.log(`Profile submitted status: ${isSubmitted}`);
          } catch (error) {
            console.log(`Error checking profile submission: ${error.message}`);
          }

          break; // Stop at first found user
        }
      } catch (error) {
        console.log(`❌ Error with ${email}: ${error.message}`);
      }
    }

    // Test creating a new user (if possible)
    console.log('\n🔍 Testing user creation...');
    try {
      const newUserEmail = `test-${Date.now()}@example.com`;
      console.log(`Attempting to create user: ${newUserEmail}`);

      // This method might not exist, but let's try
      const result = await actor.createUser(newUserEmail, 'testpassword123');
      console.log('User creation result:', result);
    } catch (error) {
      console.log(`User creation failed (expected): ${error.message}`);
    }

  } catch (error) {
    console.error('❌ Canister test failed:', error);
  }
}

testCanisterWithRealMethods();