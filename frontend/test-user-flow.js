// Test user flow using frontend environment
import { getUserActor } from './lib/ic-agent.js';

async function testUserFlow() {
  console.log('🔍 Testing complete user flow...\n');

  try {
    const actor = await getUserActor();
    console.log('✅ Actor created successfully');

    // 1. Get all users to see what exists
    console.log('📋 Getting all users...');
    try {
      const allUsers = await actor.getAllUsers();
      console.log(`Found ${allUsers.length} users in the canister:`);

      if (allUsers.length === 0) {
        console.log('❌ No users found in canister');
        console.log('📝 Creating a test user...');

        // Create a test user
        const testEmail = `test-user-${Date.now()}@example.com`;
        const testPassword = 'testpassword123';

        try {
          const createUserResult = await actor.createUser(testEmail, testPassword);
          console.log('✅ Test user created:', createUserResult);

          // Test getting the newly created user
          console.log('\n🔍 Testing getUserByEmail with new user...');
          const newUser = await actor.getUserByEmail(testEmail);
          console.log('✅ Retrieved new user:', newUser);

          if (newUser && newUser[0]) {
            const userId = newUser[0].id;

            // Test profile update
            console.log('\n📝 Testing profile update...');
            const profileData = {
              firstName: 'Test',
              lastName: 'User',
              bio: ['Test bio'],
              phone: ['1234567890'],
              location: ['Test Location'],
              website: [],
              linkedin: [],
              github: [],
              twitter: [],
              education: [],
              experience: [],
              skills: ['JavaScript', 'TypeScript', 'React'],
              profileImageUrl: [],
              resumeUrl: []
            };

            try {
              const updateResult = await actor.updateProfile(userId, profileData);
              console.log('✅ Profile updated:', updateResult);
            } catch (error) {
              console.log('❌ Profile update failed:', error.message);
            }

            // Test profile submission status
            console.log('\n📊 Testing profile submission status...');
            try {
              const isSubmitted = await actor.isProfileSubmitted(userId);
              console.log(`Profile submitted: ${isSubmitted}`);

              if (!isSubmitted) {
                console.log('📝 Marking profile as submitted...');
                const markResult = await actor.markProfileAsSubmitted(userId);
                console.log('✅ Profile marked as submitted:', markResult);
              }
            } catch (error) {
              console.log('❌ Profile submission check failed:', error.message);
            }
          }

        } catch (error) {
          console.log('❌ User creation failed:', error.message);
        }
      } else {
        // Display existing users
        allUsers.forEach((user, index) => {
          console.log(`${index + 1}. Email: ${user.email}, ID: ${user.id}, Verified: ${user.isVerified}, Profile Submitted: ${user.profileSubmitted}`);

          if (user.profile && user.profile[0]) {
            const profile = user.profile[0];
            console.log(`   Name: ${profile.firstName} ${profile.lastName}`);
            console.log(`   Skills: ${profile.skills.join(', ')}`);
          }
        });

        // Test with first existing user
        if (allUsers.length > 0) {
          const testUser = allUsers[0];
          console.log(`\n🔍 Testing with user: ${testUser.email}`);

          // Test getUserByEmail
          try {
            const retrievedUser = await actor.getUserByEmail(testUser.email);
            console.log('✅ getUserByEmail works:', retrievedUser ? 'User found' : 'User not found');
          } catch (error) {
            console.log('❌ getUserByEmail failed:', error.message);
          }

          // Test profile operations
          try {
            const profile = await actor.getProfile(testUser.id);
            console.log('✅ getProfile works:', profile && profile[0] ? 'Profile found' : 'No profile');
          } catch (error) {
            console.log('❌ getProfile failed:', error.message);
          }

          try {
            const isSubmitted = await actor.isProfileSubmitted(testUser.id);
            console.log(`✅ isProfileSubmitted works: ${isSubmitted}`);
          } catch (error) {
            console.log('❌ isProfileSubmitted failed:', error.message);
          }
        }
      }

    } catch (error) {
      console.log('❌ getAllUsers failed:', error.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testUserFlow();