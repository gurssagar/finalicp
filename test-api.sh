#!/bin/bash

# Test script to verify API endpoints functionality
echo "🚀 Testing API endpoints for onboarding data..."
echo

# Test profile completeness endpoint
echo "📡 Testing Profile Completeness Endpoint..."
echo "URL: http://localhost:3000/api/profile/check-completeness"
echo "Method: GET"
echo

response=$(curl -s -w "\nHTTP_CODE:%{http_code}\n" \
  -H "Content-Type: application/json" \
  http://localhost:3000/api/profile/check-completeness)

http_code=$(echo "$response" | grep -o 'HTTP_CODE:[0-9]*' | cut -d: -f2)
response_body=$(echo "$response" | sed '/HTTP_CODE:/d')

echo "📊 Response Status: $http_code"
echo "📊 Response Body:"
echo "$response_body" | jq '.' 2>/dev/null || echo "$response_body"
echo

if [ "$http_code" = "200" ]; then
    echo "✅ Profile completeness endpoint working"

    # Check if backend connection issue is present
    if echo "$response_body" | grep -q "Backend connection issue"; then
        echo "⚠️ Backend connection issue detected!"
        echo "❌ The API cannot connect to the canister"
    elif echo "$response_body" | grep -q "Authentication required"; then
        echo "ℹ️ Authentication required (expected for unauthenticated request)"
    else
        echo "✅ Backend connection appears to be working"
    fi
else
    echo "❌ Profile completeness endpoint failed with status: $http_code"
fi

echo
echo "----------------------------------------"
echo

# Test onboarding completion endpoint
echo "📡 Testing Onboarding Completion Endpoint..."
echo "URL: http://localhost:3000/api/onboarding/complete"
echo "Method: GET"
echo

response=$(curl -s -w "\nHTTP_CODE:%{http_code}\n" \
  -H "Content-Type: application/json" \
  http://localhost:3000/api/onboarding/complete)

http_code=$(echo "$response" | grep -o 'HTTP_CODE:[0-9]*' | cut -d: -f2)
response_body=$(echo "$response" | sed '/HTTP_CODE:/d')

echo "📊 Response Status: $http_code"
echo "📊 Response Body:"
echo "$response_body" | jq '.' 2>/dev/null || echo "$response_body"
echo

if [ "$http_code" = "200" ]; then
    echo "✅ Onboarding completion endpoint working"

    # Check if backend connection issue is present
    if echo "$response_body" | grep -q "Backend connection issue"; then
        echo "⚠️ Backend connection issue detected!"
        echo "❌ The API cannot connect to the canister"
    elif echo "$response_body" | grep -q "Not authenticated"; then
        echo "ℹ️ Authentication required (expected for unauthenticated request)"
    else
        echo "✅ Backend connection appears to be working"
    fi
else
    echo "❌ Onboarding completion endpoint failed with status: $http_code"
fi

echo
echo "----------------------------------------"
echo

# Test POST to onboarding completion with sample data
echo "📡 Testing Onboarding POST Endpoint..."
echo "URL: http://localhost:3000/api/onboarding/complete"
echo "Method: POST"
echo

sample_data='{
  "userEmail": "test@example.com",
  "profile": {
    "firstName": "Test",
    "lastName": "User",
    "bio": "Test bio",
    "phone": "1234567890",
    "location": "Test Location"
  },
  "skills": ["JavaScript", "TypeScript", "React"],
  "resume": {
    "hasResume": false
  }
}'

response=$(curl -s -w "\nHTTP_CODE:%{http_code}\n" \
  -X POST \
  -H "Content-Type: application/json" \
  -d "$sample_data" \
  http://localhost:3000/api/onboarding/complete)

http_code=$(echo "$response" | grep -o 'HTTP_CODE:[0-9]*' | cut -d: -f2)
response_body=$(echo "$response" | sed '/HTTP_CODE:/d')

echo "📊 Response Status: $http_code"
echo "📊 Response Body:"
echo "$response_body" | jq '.' 2>/dev/null || echo "$response_body"
echo

if [ "$http_code" = "200" ]; then
    echo "✅ Onboarding POST endpoint working"
    if echo "$response_body" | grep -q "success.*true"; then
        echo "✅ Data appears to be saved successfully"
    else
        echo "⚠️ Request completed but may have issues"
    fi
elif [ "$http_code" = "500" ]; then
    echo "❌ Internal server error - likely backend connection issue"
else
    echo "❌ Onboarding POST failed with status: $http_code"
fi

echo
echo "🏁 API Testing completed!"
echo
echo "Summary:"
echo "- If you see 'Backend connection issue' errors, the frontend cannot connect to the canister"
echo "- If you see 'Authentication required', the APIs are working but need user login"
echo "- If requests succeed, the system is working properly"