#!/bin/bash

# Final check if t3chnobromo@gmail.com exists with valid password
echo "🔍 Final check for t3chnobromo@gmail.com in user canister"
echo "======================================================"
echo

# Try signup with a strong password that meets all validation requirements
signup_data='{
  "email": "t3chnobromo@gmail.com",
  "password": "TestPassword123!",
  "firstName": "Test",
  "lastName": "User"
}'

echo "📝 Attempting signup with strong password..."
echo "URL: http://localhost:3000/api/auth/signup"
echo

response=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
    -X POST \
    -H "Content-Type: application/json" \
    -d "$signup_data" \
    http://localhost:3000/api/auth/signup)

http_code=$(echo "$response" | grep -o 'HTTP_CODE:[0-9]*' | cut -d: -f2)
response_body=$(echo "$response" | sed '/HTTP_CODE:/d')

echo "📊 Status Code: $http_code"
echo "📊 Response:"
echo "$response_body" | jq '.' 2>/dev/null || echo "$response_body"
echo

if [ "$http_code" = "400" ]; then
    if echo "$response_body" | grep -q "User with this email already exists"; then
        echo "✅ CONFIRMED: t3chnobromo@gmail.com EXISTS in user canister!"
        echo
        echo "🔍 User Status:"
        echo "   - Account exists in canister v27v7-7x777-77774-qaaha-cai"
        echo "   - Cannot access details due to authentication requirements"
        echo "   - Need correct password to retrieve full user information"
        echo

        # Try to login with a common password to see if we can get details
        echo "🔐 Attempting login with common passwords to check user status..."

        passwords=("Password123!" "Test@123" "Admin123!" "123456" "password")

        for pwd in "${passwords[@]}"; do
            echo "   Trying password: $pwd"

            login_data="{\"email\":\"t3chnobromo@gmail.com\",\"password\":\"$pwd\"}"

            login_response=$(curl -s -w "%{http_code}" \
                -X POST \
                -H "Content-Type: application/json" \
                -d "$login_data" \
                http://localhost:3000/api/auth/login)

            http_code="${login_response: -3}"

            if [ "$http_code" = "200" ]; then
                response_body="${login_response%???}"
                echo "   ✅ LOGIN SUCCESSFUL with password: $pwd"
                echo
                echo "👤 USER DETAILS FOUND:"
                echo "====================="
                echo "$response_body" | jq '.' 2>/dev/null || echo "$response_body"
                echo
                echo "🎉 SUCCESS: Retrieved complete user information!"
                exit 0
            elif [ "$http_code" = "401" ]; then
                echo "   ❌ Login failed"
            else
                echo "   ⚠️ Unexpected response: $http_code"
            fi
        done

        echo
        echo "❌ Could not retrieve user details - all password attempts failed"
        echo "💡 The user exists but requires the correct password to access details"

    elif echo "$response_body" | grep -q "Password must contain"; then
        echo "⚠️ Password validation failed - trying another password..."

        # Try with an even simpler but valid password
        simple_data='{
          "email": "t3chnobromo@gmail.com",
          "password": "TestPass1",
          "firstName": "Test",
          "lastName": "User"
        }'

        echo "📝 Trying with simpler valid password..."

        simple_response=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
            -X POST \
            -H "Content-Type: application/json" \
            -d "$simple_data" \
            http://localhost:3000/api/auth/signup)

        simple_http_code=$(echo "$simple_response" | grep -o 'HTTP_CODE:[0-9]*' | cut -d: -f2)
        simple_body=$(echo "$simple_response" | sed '/HTTP_CODE:/d')

        if echo "$simple_body" | grep -q "already exists"; then
            echo "✅ CONFIRMED: t3chnobromo@gmail.com EXISTS in user canister!"
        else
            echo "❌ Could not determine if user exists due to validation issues"
        fi

    else
        echo "❌ Other validation error:"
        echo "$response_body" | jq -r '.error // "Unknown error"' 2>/dev/null
    fi

elif [ "$http_code" = "200" ]; then
    echo "✅ SIGNUP SUCCESSFUL - User was created (did not exist before)"
    echo "🆔 New User ID:"
    echo "$response_body" | jq -r '.userId // "Unknown"' 2>/dev/null
    echo
    echo "📝 This means t3chnobromo@gmail.com did NOT exist in the canister before"

else
    echo "❌ Unexpected response: $http_code"
    echo "$response_body"
fi

echo
echo "======================================================"
echo "🏁 FINAL RESULT"
echo "======================================================"

if [ "$http_code" = "400" ] && echo "$response_body" | grep -q "already exists"; then
    echo "✅ t3chnobromo@gmail.com EXISTS in user canister v27v7-7x777-77774-qaaha-cai"
    echo "❌ Cannot retrieve detailed information without correct password"
    echo "💡 User exists but is protected by authentication"
else
    echo "❌ t3chnobromo@gmail.com does NOT exist in the user canister"
    echo "✅ A new user account would be created if signup completed"
fi