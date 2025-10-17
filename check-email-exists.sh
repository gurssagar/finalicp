#!/bin/bash

# Check if t3chnobromo@gmail.com is already registered by attempting signup
echo "🔍 Checking if email t3chnobromo@gmail.com is already registered"
echo "============================================================"
echo

# Try to signup with the email to see if it already exists
signup_data='{
  "email": "t3chnobromo@gmail.com",
  "password": "testpassword123",
  "firstName": "Test",
  "lastName": "User"
}'

echo "📝 Attempting signup to check if email exists..."
echo "URL: http://localhost:3000/api/auth/signup"
echo "Data: $signup_data"
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

if [ "$http_code" = "200" ]; then
    if echo "$response_body" | jq -e '.success == true' >/dev/null 2>&1; then
        echo "✅ SIGNUP SUCCESSFUL!"
        echo "📧 Email t3chnobromo@gmail.com was NOT registered before"
        echo "🆔 New user created with ID:"
        echo "$response_body" | jq -r '.userId // "Unknown"' 2>/dev/null
        echo
        echo "📝 OTP Code for verification (check logs):"
        echo "$response_body" | jq -r '.message // "No message"' 2>/dev/null

    else
        echo "❌ Signup failed"
        echo "$response_body" | jq -r '.error // "Unknown error"' 2>/dev/null
    fi

elif [ "$http_code" = "400" ]; then
    if echo "$response_body" | grep -q "User with this email already exists"; then
        echo "✅ EMAIL ALREADY REGISTERED!"
        echo "📧 t3chnobromo@gmail.com exists in the canister"
        echo
        echo "🔍 What this means:"
        echo "   - The user account exists in the user canister"
        echo "   - The login failed because either:"
        echo "     • Password is incorrect"
        echo "     • Email is not verified yet"
        echo "     • Account is locked/suspended"
        echo
        echo "📋 Next steps to check user details:"
        echo "   1. Try password reset if available"
        echo "   2. Check if email is verified"
        echo "   3. Contact user for correct password"

    else
        echo "❌ Other validation error:"
        echo "$response_body" | jq -r '.error // "Unknown error"' 2>/dev/null
    fi

else
    echo "❌ Signup request failed with status: $http_code"
    echo "Response: $response_body"
fi

echo
echo "============================================================"
echo "🏁 CONCLUSION"
echo "============================================================"

if [ "$http_code" = "400" ] && echo "$response_body" | grep -q "already exists"; then
    echo "✅ RESULT: t3chnobromo@gmail.com EXISTS in the user canister"
    echo "❌ Cannot retrieve details without correct password or verification"
else
    echo "❌ RESULT: t3chnobromo@gmail.com does NOT exist in the user canister"
    echo "✅ A new user account was created during this test"
fi