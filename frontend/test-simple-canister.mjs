// Simple test for canister functionality using ES modules
import { getUserActor } from './lib/ic-agent.js';

async function testSimpleCanister() {
  console.log('🔍 Testing simple canister connection...\n');

  try {
    const actor = await getUserActor();
    console.log('✅ Actor created successfully');

    // Test getAllUsers
    console.log('📋 Testing getAllUsers...');
    try {
      const allUsers = await actor.getAllUsers();
      console.log(`Found ${allUsers.length} users`);

      if (allUsers.length > 0) {
        console.log('\n📋 First user details:');
        const firstUser = allUsers[0];
        console.log(`Email: ${firstUser.email}`);
        console.log(`ID: ${firstUser.id}`);
        console.log(`Verified: ${firstUser.isVerified}`);
        console.log(`Profile Submitted: ${firstUser.profileSubmitted}`);

        // Test getUserByEmail
        console.log('\n🔍 Testing getUserByEmail...');
        const userByEmail = await actor.getUserByEmail(firstUser.email);
        console.log('✅ getUserByEmail works:', userByEmail ? 'User found' : 'Not found');

        // Test profile operations
        console.log('\n📊 Testing profile operations...');
        const isSubmitted = await actor.isProfileSubmitted(firstUser.id);
        console.log(`Profile submitted: ${isSubmitted}`);

        const profile = await actor.getProfile(firstUser.id);
        console.log('Profile exists:', profile && profile[0] ? 'Yes' : 'No');

        if (profile && profile[0]) {
          const p = profile[0];
          console.log(`Name: ${p.firstName} ${p.lastName}`);
          console.log(`Skills: ${p.skills.length > 0 ? p.skills.join(', ') : 'None'}`);
          console.log(`Bio: ${p.bio && p.bio[0] || 'None'}`);
        }

      } else {
        console.log('❌ No users found in canister');
        console.log('📝 Creating a test user...');

        const testEmail = `test-${Date.now()}@example.com`;
        const testPassword = 'test123';

        try {
          const createUserResult = await actor.createUser(testEmail, testPassword);
          console.log('✅ Test user created:', createUserResult);

          // Test the new user
          const newUser = await actor.getUserByEmail(testEmail);
          if (newUser && newUser[0]) {
            console.log('✅ New user retrieved successfully');
            console.log(`Email: ${newUser[0].email}, ID: ${newUser[0].id}`);
          }
        } catch (error) {
          console.log('❌ User creation failed:', error.message);
        }
      }

    } catch (error) {
      console.log('❌ getAllUsers failed:', error.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testSimpleCanister();