#!/bin/bash

# Check if t3chnobromo@gmail.com exists using API endpoints
echo "🔍 Checking for user: t3chnobromo@gmail.com"
echo "=========================================="
echo

# Function to make API request and display results
check_user_api() {
    local endpoint="$1"
    local description="$2"

    echo "📡 Testing: $description"
    echo "URL: $endpoint"
    echo

    response=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
        -H "Content-Type: application/json" \
        "$endpoint")

    http_code=$(echo "$response" | grep -o 'HTTP_CODE:[0-9]*' | cut -d: -f2)
    response_body=$(echo "$response" | sed '/HTTP_CODE:/d')

    echo "📊 Status Code: $http_code"
    echo "📊 Response:"
    echo "$response_body" | jq '.' 2>/dev/null || echo "$response_body"
    echo

    if [ "$http_code" = "200" ]; then
        # Check if user data is returned
        if echo "$response_body" | jq -e '.success == true' >/dev/null 2>&1; then
            if echo "$response_body" | jq -e '.userEmail == "t3chnobromo@gmail.com"' >/dev/null 2>&1; then
                echo "✅ USER FOUND in this endpoint!"
                echo
                echo "👤 USER DETAILS FROM THIS ENDPOINT:"
                echo "---------------------------------"

                # Extract and display user details
                echo "$response_body" | jq -r '
                    if .userEmail then "📧 Email: " + .userEmail else "" end,
                    if .user?.id then "🆔 ID: " + .user.id else "" end,
                    if .user?.isVerified then "✅ Verified: " + (.user.isVerified|tostring) else "" end,
                    if .user?.profileSubmitted then "📋 Profile Submitted: " + (.user.profileSubmitted|tostring) else "" end,
                    if .profile?.firstName then "👤 Name: " + .profile.firstName + " " + .profile.lastName else "" end,
                    if .profile?.bio then "📝 Bio: " + .profile.bio else "" end,
                    if .profile?.skills then "🛠️ Skills: " + (.profile.skills|join(", ")) else "" end,
                    if .completionPercentage then "📊 Completion: " + (.completionPercentage|tostring) + "%" else "" end,
                    if .message then "💬 Message: " + .message else "" end
                ' | grep -v '^$'

                echo
                echo "🔍 Full Profile Data:"
                echo "$response_body" | jq '.profile // empty' 2>/dev/null
                echo
                return 0
            else
                echo "ℹ️ API working but user not found in this endpoint"
            fi
        else
            echo "⚠️ API returned success=false"
        fi
    else
        echo "❌ API request failed with status: $http_code"
    fi

    echo "----------------------------------------"
    echo
    return 1
}

# Test 1: Try to check profile completeness (this might work if user is logged in)
echo "🔐 Method 1: Profile Completeness Check (requires session)"
check_user_api "http://localhost:3000/api/profile/check-completeness" "Profile completeness endpoint"

# Test 2: Try the onboarding completion GET endpoint
echo "🔐 Method 2: Onboarding Data Check (requires session)"
check_user_api "http://localhost:3000/api/onboarding/complete" "Onboarding completion endpoint"

# Test 3: Create a test session by logging in (if possible)
echo "🔐 Method 3: Attempt Login to Check User"
echo "URL: http://localhost:3000/api/auth/login"
echo

login_data='{
  "email": "t3chnobromo@gmail.com",
  "password": "testpassword123"
}'

response=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
    -X POST \
    -H "Content-Type: application/json" \
    -d "$login_data" \
    http://localhost:3000/api/auth/login)

http_code=$(echo "$response" | grep -o 'HTTP_CODE:[0-9]*' | cut -d: -f2)
response_body=$(echo "$response" | sed '/HTTP_CODE:/d')

echo "📊 Login Status Code: $http_code"
echo "📊 Login Response:"
echo "$response_body" | jq '.' 2>/dev/null || echo "$response_body"
echo

if [ "$http_code" = "200" ]; then
    if echo "$response_body" | jq -e '.success == true' >/dev/null 2>&1; then
        echo "✅ LOGIN SUCCESSFUL! User exists in canister."
        echo
        echo "👤 USER DETAILS FROM LOGIN:"
        echo "--------------------------"
        echo "$response_body" | jq -r '
            if .user?.id then "🆔 User ID: " + .user.id else "" end,
            if .user?.email then "📧 Email: " + .user.email else "" end,
            if .user?.isVerified then "✅ Email Verified: " + (.user.isVerified|tostring) else "" end,
            if .user?.profileSubmitted then "📋 Profile Submitted: " + (.user.profileSubmitted|tostring) else "" end,
            if .user?.profile?.firstName then "👤 Name: " + .user.profile.firstName + " " + .user.profile.lastName else "" end,
            if .user?.profile?.bio then "📝 Bio: " + .user.profile.bio else "" end,
            if .user?.profile?.skills then "🛠️ Skills: " + (.user.profile.skills|join(", ")) else "" end
        ' | grep -v '^$'

        echo
        echo "🔍 Full User Object:"
        echo "$response_body" | jq '.user' 2>/dev/null

    else
        echo "❌ Login failed - user may not exist or password incorrect"
        echo "$response_body" | jq -r '.error // "Unknown error"' 2>/dev/null
    fi
else
    echo "❌ Login request failed with status: $http_code"
    if [ "$http_code" = "401" ]; then
        echo "💡 This likely means:"
        echo "   - User does not exist in canister, OR"
        echo "   - Password is incorrect, OR"
        echo "   - User exists but email is not verified"
    fi
fi

echo
echo "=========================================="
echo "🏁 SUMMARY"
echo "=========================================="
echo "If any of the above methods showed user data, then t3chnobromo@gmail.com exists in the canister."
echo "If all methods failed with 401/user not found errors, the user does not exist."