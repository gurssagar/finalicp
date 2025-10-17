#!/bin/bash

# Test the fixed profile completeness API
echo "🧪 TESTING FIXED PROFILE COMPLETENESS API"
echo "=========================================="
echo

# Login first to get session
echo "🔐 Step 1: Logging in..."
login_data='{
  "email": "t3chnobromo@gmail.com",
  "password": "Sagar2003@"
}'

response=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
    -X POST \
    -H "Content-Type: application/json" \
    -c cookies.txt \
    -d "$login_data" \
    http://localhost:3000/api/auth/login)

http_code=$(echo "$response" | grep -o 'HTTP_CODE:[0-9]*' | cut -d: -f2)

if [ "$http_code" = "200" ]; then
    echo "✅ Login successful"
else
    echo "❌ Login failed"
    exit 1
fi

echo
echo "----------------------------------------"
echo

# Test the fixed profile completeness API
echo "📋 Step 2: Testing fixed profile completeness API"
echo "URL: http://localhost:3000/api/profile/check-completeness"

profile_response=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
    -H "Content-Type: application/json" \
    -b cookies.txt \
    http://localhost:3000/api/profile/check-completeness)

profile_http_code=$(echo "$profile_response" | grep -o 'HTTP_CODE:[0-9]*' | cut -d: -f2)
profile_body=$(echo "$profile_response" | sed '/HTTP_CODE:/d')

echo "📊 Profile Status Response: $profile_http_code"
echo "$profile_body" | jq '.' 2>/dev/null || echo "$profile_body"
echo

if [ "$profile_http_code" = "200" ]; then
    success=$(echo "$profile_body" | jq -r '.success // false')
    is_complete=$(echo "$profile_body" | jq -r '.isComplete // false')
    profile_submitted=$(echo "$profile_body" | jq -r '.profileSubmitted // false')
    completion_percentage=$(echo "$profile_body" | jq -r '.completionPercentage // 0')
    message=$(echo "$profile_body" | jq -r '.message // "No message"')
    backend_error=$(echo "$profile_body" | jq -r '.backendError // false')

    echo "📈 API Results:"
    echo "   Success: $success"
    echo "   Is Complete: $is_complete"
    echo "   Profile Submitted: $profile_submitted"
    echo "   Completion: $completion_percentage%"
    echo "   Message: $message"
    echo "   Backend Error: $backend_error"

    if [ "$backend_error" = "true" ]; then
        echo "❌ Still has backend connection issues"
    else
        echo "✅ Backend connection issue resolved!"
    fi

    echo
    echo "👤 Profile Data:"
    first_name=$(echo "$profile_body" | jq -r '.profile.firstName // "Not provided"')
    last_name=$(echo "$profile_body" | jq -r '.profile.lastName // "Not provided"')
    email=$(echo "$profile_body" | jq -r '.profile.email // "Not provided"')
    bio=$(echo "$profile_body" | jq -r '.profile.bio // "Not provided"')
    phone=$(echo "$profile_body" | jq -r '.profile.phone // "Not provided"')
    location=$(echo "$profile_body" | jq -r '.profile.location // "Not provided"')
    skills=$(echo "$profile_body" | jq -r '.profile.skills | join(", ") // "None"')

    echo "   Name: $first_name $last_name"
    echo "   Email: $email"
    echo "   Bio: $bio"
    echo "   Phone: $phone"
    echo "   Location: $location"
    echo "   Skills: $skills"

else
    echo "❌ Profile API failed with status: $profile_http_code"
fi

echo
echo "=========================================="
echo "🏁 TEST RESULT"
echo "=========================================="

if [ "$profile_http_code" = "200" ]; then
    backend_error=$(echo "$profile_body" | jq -r '.backendError // false')
    if [ "$backend_error" = "false" ]; then
        echo "✅ SUCCESS: Profile completeness API is now working!"
        echo "📊 Dashboard should now show correct profile status"
        echo "🔄 No more 'Backend connection issue' errors"
    else
        echo "⚠️ PARTIAL: API responds but still has backend issues"
    fi
else
    echo "❌ FAILED: Profile API still has issues"
fi

# Cleanup
rm -f cookies.txt