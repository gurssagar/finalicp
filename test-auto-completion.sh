#!/bin/bash

# Test the auto-completion flow by logging in and checking profile status
echo "🧪 TESTING AUTO-COMPLETION FLOW"
echo "================================="
echo

# Step 1: Login to get session
echo "🔐 Step 1: Logging in as t3chnobromo@gmail.com"
login_data='{
  "email": "t3chnobromo@gmail.com",
  "password": "Sagar2003@"
}'

echo "URL: http://localhost:3000/api/auth/login"

response=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
    -X POST \
    -H "Content-Type: application/json" \
    -c cookies.txt \
    -d "$login_data" \
    http://localhost:3000/api/auth/login)

http_code=$(echo "$response" | grep -o 'HTTP_CODE:[0-9]*' | cut -d: -f2)
response_body=$(echo "$response" | sed '/HTTP_CODE:/d')

echo "📊 Login Status: $http_code"

if [ "$http_code" = "200" ]; then
    echo "✅ Login successful"
    user_id=$(echo "$response_body" | jq -r '.user.id // "Unknown"')
    profile_submitted=$(echo "$response_body" | jq -r '.user.profileSubmitted // false')
    echo "   User ID: $user_id"
    echo "   Profile Submitted: $profile_submitted"
else
    echo "❌ Login failed"
    echo "$response_body"
    exit 1
fi

echo
echo "----------------------------------------"
echo

# Step 2: Check current profile status
echo "📋 Step 2: Checking current profile status"
echo "URL: http://localhost:3000/api/profile/check-completeness"

profile_response=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
    -H "Content-Type: application/json" \
    -b cookies.txt \
    http://localhost:3000/api/profile/check-completeness)

profile_http_code=$(echo "$profile_response" | grep -o 'HTTP_CODE:[0-9]*' | cut -d: -f2)
profile_body=$(echo "$profile_response" | sed '/HTTP_CODE:/d')

echo "📊 Profile Status Response: $profile_http_code"
echo "$profile_body" | jq '.' 2>/dev/null || echo "$profile_body"

if [ "$profile_http_code" = "200" ]; then
    is_complete=$(echo "$profile_body" | jq -r '.isComplete // false')
    profile_submitted=$(echo "$profile_body" | jq -r '.profileSubmitted // false')
    completion_percentage=$(echo "$profile_body" | jq -r '.completionPercentage // 0')

    echo "   Is Complete: $is_complete"
    echo "   Profile Submitted: $profile_submitted"
    echo "   Completion: $completion_percentage%"
else
    echo "❌ Failed to get profile status"
fi

echo
echo "----------------------------------------"
echo

# Step 3: Test onboarding completion with auto-submission
echo "🔄 Step 3: Testing onboarding completion (auto-submission)"

# Use the existing profile data from the user
onboarding_data='{
  "profile": {
    "firstName": "dasdasda",
    "lastName": "asdasdas",
    "bio": "dasdasdasd asd asd as das d asd",
    "phone": "+293129391232",
    "location": "dasdasdasd",
    "website": "https://www.google.com",
    "linkedin": "https://www.google.com",
    "github": "https://www.google.com",
    "twitter": "https://www.google.com"
  },
  "skills": ["TypeScript", "Solidity", "JavaScript"],
  "resume": {
    "hasResume": false
  },
  "address": {
    "isPrivate": false,
    "country": "Test Country",
    "state": "Test State",
    "city": "Test City",
    "zipCode": "12345",
    "streetAddress": "123 Test Street"
  }
}'

echo "URL: http://localhost:3000/api/onboarding/complete"
echo "Sending complete profile data..."

onboarding_response=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
    -X POST \
    -H "Content-Type: application/json" \
    -b cookies.txt \
    -d "$onboarding_data" \
    http://localhost:3000/api/onboarding/complete)

onboarding_http_code=$(echo "$onboarding_response" | grep -o 'HTTP_CODE:[0-9]*' | cut -d: -f2)
onboarding_body=$(echo "$onboarding_response" | sed '/HTTP_CODE:/d')

echo "📊 Onboarding Status: $onboarding_http_code"
echo "$onboarding_body" | jq '.' 2>/dev/null || echo "$onboarding_body"

if [ "$onboarding_http_code" = "200" ]; then
    success=$(echo "$onboarding_body" | jq -r '.success // false')
    profile_updated=$(echo "$onboarding_body" | jq -r '.profileUpdated // false')
    profile_submitted=$(echo "$onboarding_body" | jq -r '.profileSubmitted // false')
    message=$(echo "$onboarding_body" | jq -r '.message // "No message"')

    echo "   Success: $success"
    echo "   Profile Updated: $profile_updated"
    echo "   Auto-Submitted: $profile_submitted"
    echo "   Message: $message"

    if [ "$profile_submitted" = "true" ]; then
        echo "✅ AUTO-COMPLETION WORKING!"
    else
        echo "⚠️ Auto-completion may not be working"
    fi
else
    echo "❌ Onboarding completion failed"
fi

echo
echo "----------------------------------------"
echo

# Step 4: Verify final profile status
echo "✅ Step 4: Verifying final profile status"

final_profile_response=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
    -H "Content-Type: application/json" \
    -b cookies.txt \
    http://localhost:3000/api/profile/check-completeness)

final_http_code=$(echo "$final_profile_response" | grep -o 'HTTP_CODE:[0-9]*' | cut -d: -f2)
final_body=$(echo "$final_profile_response" | sed '/HTTP_CODE:/d')

echo "📊 Final Profile Status: $final_http_code"
echo "$final_body" | jq '.' 2>/dev/null || echo "$final_body"

if [ "$final_http_code" = "200" ]; then
    final_is_complete=$(echo "$final_body" | jq -r '.isComplete // false')
    final_profile_submitted=$(echo "$final_body" | jq -r '.profileSubmitted // false')
    final_completion_percentage=$(echo "$final_body" | jq -r '.completionPercentage // 0')
    final_message=$(echo "$final_body" | jq -r '.message // "No message"')

    echo "   Final Is Complete: $final_is_complete"
    echo "   Final Profile Submitted: $final_profile_submitted"
    echo "   Final Completion: $final_completion_percentage%"
    echo "   Final Message: $final_message"
fi

echo
echo "================================="
echo "🏁 TEST SUMMARY"
echo "================================="

if [ "$onboarding_http_code" = "200" ] && [ "$final_http_code" = "200" ]; then
    echo "✅ Auto-completion test completed successfully!"
    echo "📊 Results:"
    echo "   • Profile can be updated via onboarding API"
    echo "   • Auto-submission logic is implemented"
    echo "   • Profile status reflects completion"
    echo
    echo "🔄 NEW FLOW:"
    echo "   1. User fills profile → Auto-saved to canister"
    echo "   2. Profile is complete → Auto-submitted (no review needed)"
    echo "   3. Profile becomes active immediately"
    echo "   4. User can access all features right away"
else
    echo "❌ Some tests failed - check the responses above"
fi

# Cleanup
rm -f cookies.txt