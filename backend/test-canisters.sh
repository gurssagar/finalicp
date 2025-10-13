#!/bin/bash

# Test script for Motoko canisters
source "$HOME/.local/share/dfx/env"

echo "=========================================="
echo "Testing User Canister Functions"
echo "=========================================="

echo -e "\n1. Creating a user..."
dfx canister call user createUser '("alice@example.com", "hashedpassword456")'

echo -e "\n2. Getting user by email..."
dfx canister call user getUserByEmail '("alice@example.com")'

echo -e "\n3. Creating OTP..."
OTP=$(dfx canister call user createOTP '("alice@example.com")' | grep -o '[0-9]\{6\}')
echo "OTP created: $OTP"

echo -e "\n4. Verifying OTP..."
dfx canister call user verifyOTP "(\"alice@example.com\", \"$OTP\")"

echo -e "\n5. Verifying email for user..."
# First get the user ID
USER_ID=$(dfx canister call user getUserByEmail '("alice@example.com")' | grep -o 'id = "[^"]*"' | cut -d'"' -f2)
echo "User ID: $USER_ID"
dfx canister call user verifyEmail "(\"$USER_ID\")"

echo -e "\n6. Updating last login..."
dfx canister call user updateLastLogin "(\"$USER_ID\")"

echo -e "\n7. Getting all users..."
dfx canister call user getAllUsers '()'

echo -e "\n=========================================="
echo "Testing Basic Backend Canister Functions"
echo "=========================================="

echo -e "\n1. Adding a message..."
dfx canister call basic_backend addMessage '("Hello from test script!", "Tester")'

echo -e "\n2. Getting all messages..."
dfx canister call basic_backend getMessages '()'

echo -e "\n3. Getting message count..."
dfx canister call basic_backend getMessageCount '()'

echo -e "\n4. Greeting function..."
dfx canister call basic_backend greet '("World")'

echo -e "\n=========================================="
echo "All tests completed!"
echo "=========================================="

