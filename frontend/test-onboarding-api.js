// Test script for the onboarding complete API endpoint
// Run with: node test-onboarding-api.js

const testOnboardingAPI = async () => {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🧪 Testing Onboarding Complete API');
  console.log('=====================================');
  
  try {
    // Test GET endpoint (retrieve user data)
    console.log('\n1️⃣ Testing GET /api/onboarding/complete');
    console.log('----------------------------------------');
    
    const getResponse = await fetch(`${baseUrl}/api/onboarding/complete`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const getData = await getResponse.json();
    console.log('📊 GET Response Status:', getResponse.status);
    console.log('📊 GET Response Data:', JSON.stringify(getData, null, 2));
    
    if (getResponse.ok) {
      console.log('✅ GET request successful');
      console.log('📧 User Email:', getData.userEmail);
      console.log('👤 User Data:', getData.userData);
    } else {
      console.log('❌ GET request failed:', getData.error);
    }
    
  } catch (error) {
    console.error('❌ GET request error:', error.message);
  }
  
  try {
    // Test POST endpoint (complete onboarding)
    console.log('\n2️⃣ Testing POST /api/onboarding/complete');
    console.log('------------------------------------------');
    
    const testPayload = {
      profile: {
        firstName: "John",
        lastName: "Doe",
        bio: "Experienced developer",
        phone: "+1234567890",
        location: "New York, NY",
        website: "https://johndoe.com",
        linkedin: "https://linkedin.com/in/johndoe",
        github: "https://github.com/johndoe",
        twitter: "https://twitter.com/johndoe"
      },
      skills: ["React", "TypeScript", "Node.js"],
      resume: {
        fileName: "resume.pdf",
        fileUrl: "https://example.com/resume.pdf",
        hasResume: true
      },
      address: {
        isPrivate: true,
        country: "US",
        state: "NY",
        city: "New York",
        zipCode: "10001",
        streetAddress: "123 Main St"
      }
    };
    
    console.log('📤 Sending test payload:', JSON.stringify(testPayload, null, 2));
    
    const postResponse = await fetch(`${baseUrl}/api/onboarding/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload),
    });
    
    const postData = await postResponse.json();
    console.log('📊 POST Response Status:', postResponse.status);
    console.log('📊 POST Response Data:', JSON.stringify(postData, null, 2));
    
    if (postResponse.ok) {
      console.log('✅ POST request successful');
      console.log('📧 User Email:', postData.userEmail);
      console.log('👤 Existing User Data:', postData.existingUserData);
      console.log('🔄 Updated Profile:', postData.updatedProfile);
      console.log('📝 New Data:', postData.newData);
    } else {
      console.log('❌ POST request failed:', postData.error);
    }
    
  } catch (error) {
    console.error('❌ POST request error:', error.message);
  }
  
  console.log('\n🏁 Test completed');
};

// Run the test
testOnboardingAPI().catch(console.error);
