// Test script for the profile completeness check API endpoint
// Run with: node test-profile-completeness.js

const testProfileCompleteness = async () => {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🧪 Testing Profile Completeness Check API');
  console.log('==========================================');
  
  try {
    // Test GET endpoint (check profile completeness)
    console.log('\n1️⃣ Testing GET /api/profile/check-completeness');
    console.log('------------------------------------------------');
    
    const response = await fetch(`${baseUrl}/api/profile/check-completeness`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    console.log('📊 Response Status:', response.status);
    console.log('📊 Response Data:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('✅ Profile completeness check successful');
      console.log('📧 User Email:', data.userEmail);
      console.log('📊 Is Complete:', data.isComplete);
      console.log('📊 Completion Percentage:', data.completionPercentage + '%');
      console.log('📊 Missing Fields:', data.missingFields);
      console.log('📊 Details:', data.details);
      
      if (data.profile) {
        console.log('👤 Profile Data:');
        console.log('  • Name:', `${data.profile.firstName} ${data.profile.lastName}`.trim() || 'Not provided');
        console.log('  • Email:', data.profile.email);
        console.log('  • Phone:', data.profile.phone || 'Not provided');
        console.log('  • Location:', data.profile.location || 'Not provided');
        console.log('  • Skills:', data.profile.skills?.length || 0, 'skills');
        console.log('  • Has Resume:', data.profile.hasResume ? 'Yes' : 'No');
        console.log('  • Bio:', data.profile.bio ? 'Provided' : 'Not provided');
      }
    } else {
      console.log('❌ Profile completeness check failed:', data.error);
    }
    
  } catch (error) {
    console.error('❌ Request error:', error.message);
  }
  
  console.log('\n🏁 Test completed');
};

// Run the test
testProfileCompleteness().catch(console.error);
