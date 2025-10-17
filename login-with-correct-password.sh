#!/bin/bash

# Check t3chnobromo@gmail.com with the correct password Sagar2003@
echo "🔍 Checking t3chnobromo@gmail.com with correct password"
echo "======================================================"
echo

# Attempt login with the provided password
login_data='{
  "email": "t3chnobromo@gmail.com",
  "password": "Sagar2003@"
}'

echo "🔐 Attempting login with password: Sagar2003@"
echo "URL: http://localhost:3000/api/auth/login"
echo

response=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
    -X POST \
    -H "Content-Type: application/json" \
    -d "$login_data" \
    http://localhost:3000/api/auth/login)

http_code=$(echo "$response" | grep -o 'HTTP_CODE:[0-9]*' | cut -d: -f2)
response_body=$(echo "$response" | sed '/HTTP_CODE:/d')

echo "📊 Status Code: $http_code"
echo "📊 Response:"
echo "$response_body" | jq '.' 2>/dev/null || echo "$response_body"
echo

if [ "$http_code" = "200" ]; then
    if echo "$response_body" | jq -e '.success == true' >/dev/null 2>&1; then
        echo "✅ LOGIN SUCCESSFUL!"
        echo
        echo "👤 COMPLETE USER DETAILS:"
        echo "========================"

        # Extract all user information from the response
        user_id=$(echo "$response_body" | jq -r '.user.id // "Not found"')
        user_email=$(echo "$response_body" | jq -r '.user.email // "Not found"')
        is_verified=$(echo "$response_body" | jq -r '.user.isVerified // false')
        profile_submitted=$(echo "$response_body" | jq -r '.user.profileSubmitted // false')
        first_name=$(echo "$response_body" | jq -r '.user.profile.firstName // "Not provided"')
        last_name=$(echo "$response_body" | jq -r '.user.profile.lastName // "Not provided"')
        bio=$(echo "$response_body" | jq -r '.user.profile.bio // "Not provided"')
        phone=$(echo "$response_body" | jq -r '.user.profile.phone // "Not provided"')
        location=$(echo "$response_body" | jq -r '.user.profile.location // "Not provided"')
        website=$(echo "$response_body" | jq -r '.user.profile.website // "Not provided"')
        linkedin=$(echo "$response_body" | jq -r '.user.profile.linkedin // "Not provided"')
        github=$(echo "$response_body" | jq -r '.user.profile.github // "Not provided"')
        twitter=$(echo "$response_body" | jq -r '.user.profile.twitter // "Not provided"')
        skills_count=$(echo "$response_body" | jq -r '.user.profile.skills | length // 0')
        has_resume=$(echo "$response_body" | jq -r '.user.profile.hasResume // false')

        echo "📋 BASIC INFORMATION:"
        echo "   🆔 User ID: $user_id"
        echo "   📧 Email: $user_email"
        echo "   ✅ Email Verified: $is_verified"
        echo "   📋 Profile Submitted: $profile_submitted"
        echo
        echo "👤 PROFILE DETAILS:"
        echo "   👨‍💼 Name: $first_name $last_name"
        echo "   📝 Bio: $bio"
        echo "   📱 Phone: $phone"
        echo "   📍 Location: $location"
        echo "   🌐 Website: $website"
        echo "   💼 LinkedIn: $linkedin"
        echo "   💻 GitHub: $github"
        echo "   🐦 Twitter: $twitter"
        echo "   🛠️ Skills Count: $skills_count"
        echo "   📄 Has Resume: $has_resume"

        # Get skills array if it exists
        skills=$(echo "$response_body" | jq -r '.user.profile.skills[]? // empty' | tr '\n' ', ' | sed 's/,$//')
        if [ -n "$skills" ]; then
            echo "   🛠️ Skills: $skills"
        fi

        echo
        echo "🔍 DETAILED PROFILE DATA:"
        echo "$response_body" | jq '.user.profile // "No profile data"' 2>/dev/null

        echo
        echo "📊 USER STATUS SUMMARY:"
        echo "   ✅ Account Exists: Yes"
        echo "   🔐 Login Successful: Yes"
        echo "   📧 Email Verified: $is_verified"
        echo "   📋 Profile Complete: $([ "$first_name" != "Not provided" ] && echo "Yes" || echo "No")"
        echo "   📤 Profile Submitted: $profile_submitted"
        echo "   🎯 Ready for Onboarding: $([ "$profile_submitted" = "false" ] && echo "Yes" || echo "No")"

    else
        echo "❌ Login failed - API returned success=false"
        echo "$response_body" | jq -r '.error // "Unknown error"' 2>/dev/null
    fi

elif [ "$http_code" = "401" ]; then
    echo "❌ LOGIN FAILED - Invalid credentials"
    echo "📊 Response: $response_body"
    echo
    echo "🔍 Possible reasons:"
    echo "   • Email does not exist in canister"
    echo "   • Password is incorrect"
    echo "   • Email is not verified yet"
    echo "   • Account is locked or suspended"

else
    echo "❌ Unexpected response: $http_code"
    echo "$response_body"
fi

echo
echo "======================================================"
echo "🏁 FINAL RESULT"
echo "======================================================"

if [ "$http_code" = "200" ] && echo "$response_body" | jq -e '.success == true' >/dev/null 2>&1; then
    echo "✅ USER FOUND AND ACCESSIBLE!"
    echo "📧 t3chnobromo@gmail.com exists in canister v27v7-7x777-77774-qaaha-cai"
    echo "🔐 Successfully authenticated and retrieved all user details"
    echo "📊 See above for complete user information"
else
    echo "❌ Could not access user details"
    echo "📧 t3chnobromo@gmail.com status: Unknown"
    echo "🔐 Authentication failed with provided credentials"
fi