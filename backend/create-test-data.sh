#!/bin/bash

# Script to create test data for the marketplace canister

echo "🚀 Creating test data for marketplace canister..."

# Check if dfx is available
if ! command -v dfx &> /dev/null; then
    echo "❌ dfx command not found. Please install dfx."
    exit 1
fi

# Check if canister is running
if ! dfx canister status marketplace &> /dev/null; then
    echo "❌ Marketplace canister is not running. Please start it first."
    exit 1
fi

echo "✅ Marketplace canister is running"

# Create a test service
echo "📝 Creating test service..."
SERVICE_RESULT=$(dfx canister call marketplace createService '(
    "Web Development Services",
    "Web Development",
    "Frontend Development",
    "I will create modern, responsive web applications using React, Next.js, and TypeScript. Includes clean code, responsive design, and basic SEO optimization.",
    "✓ Responsive design ✓ Modern React/Next.js ✓ TypeScript ✓ Basic SEO ✓ Clean architecture ✓ Performance optimization",
    7,
    500000000 : nat64,
    vec{"react"; "nextjs"; "typescript"; "responsive"; "modern"}
)' 2>&1)

if echo "$SERVICE_RESULT" | grep -q "ok ="; then
    SERVICE_ID=$(echo "$SERVICE_RESULT" | grep -o 'SVC_[A-Z0-9]*' | head -1)
    echo "✅ Service created with ID: $SERVICE_ID"
else
    echo "❌ Failed to create service: $SERVICE_RESULT"
    exit 1
fi

# Create packages for the service
echo "📦 Creating test packages..."

# Need to create packages by calling the canister directly since createPackage is not exposed
# For now, let's create a simple booking without packages using createBooking
echo "🎯 Creating test booking directly..."

BOOKING_RESULT=$(dfx canister call marketplace createBooking '(
    "'$SERVICE_ID'",
    "PKG-BASIC-001",
    "Test Web Development Project",
    "Create a responsive landing page with contact form and basic SEO",
    vec{"Must be mobile responsive"; "Include contact form"; "Basic SEO optimization"},
    '"'"$(date -d '+7 days' +%s)"000000000'"'
)' 2>&1)

if echo "$BOOKING_RESULT" | grep -q "record"; then
    BOOKING_ID=$(echo "$BOOKING_RESULT" | grep -o '"BK_[^"]*"' | tr -d '"')
    echo "✅ Test booking created with ID: $BOOKING_ID"
else
    echo "⚠️ Could not create booking: $BOOKING_RESULT"
    echo "This might be expected if the canister interface is different"
fi

# Get marketplace stats
echo "📊 Getting marketplace stats..."
STATS=$(dfx canister call marketplace getMarketplaceStats 2>&1)
echo "Current stats: $STATS"

echo ""
echo "🎉 Test data creation completed!"
echo "📋 Summary:"
echo "   • Service ID: $SERVICE_ID"
echo "   • Can now test booking with real service data"
echo ""
echo "💡 To test booking, you can use the service ID: $SERVICE_ID"
echo "   Note: You'll need to create packages or use createBooking directly"