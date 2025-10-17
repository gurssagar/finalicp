#!/bin/bash

# Test what the dashboard will now display for the user
echo "🖥️ TESTING DASHBOARD PROFILE DISPLAY"
echo "==================================="
echo

echo "🔐 Logging in as t3chnobromo@gmail.com..."

# Login to get session cookies
login_data='{
  "email": "t3chnobromo@gmail.com",
  "password": "Sagar2003@"
}'

response=$(curl -s -w "%{http_code}" \
    -X POST \
    -H "Content-Type: application/json" \
    -c cookies.txt \
    -d "$login_data" \
    http://localhost:3000/api/auth/login)

if [[ "$response" == *"200"* ]]; then
    echo "✅ Login successful"
else
    echo "❌ Login failed"
    exit 1
fi

echo
echo "📋 Checking profile status (what dashboard sees)..."
echo

# Get profile status (same as ProfileStatus component does)
profile_response=$(curl -s -b cookies.txt \
    http://localhost:3000/api/profile/check-completeness)

echo "📊 Dashboard Profile Status Response:"
echo "$profile_response" | jq '.' 2>/dev/null

if echo "$profile_response" | jq -e '.success == true' >/dev/null 2>&1; then
    echo
    echo "🎨 DASHBOARD UI WILL DISPLAY:"
    echo "=========================="

    is_complete=$(echo "$profile_response" | jq -r '.isComplete // false')
    profile_submitted=$(echo "$profile_response" | jq -r '.profileSubmitted // false')
    completion_percentage=$(echo "$profile_response" | jq -r '.completionPercentage // 0')
    message=$(echo "$profile_response" | jq -r '.message // "No message"')
    missing_fields=$(echo "$profile_response" | jq -r '.missingFields | join(", ") // "None"')

    # Status icon and text (based on ProfileStatus component logic)
    if [ "$profile_submitted" = "true" ]; then
        status_icon="✅"
        status_text="Profile Active"
        status_color="Green background"
        status_description="Your profile is active and ready to use! You can now apply for opportunities and participate in the platform."
    elif [ "$is_complete" = "true" ]; then
        status_icon="⚠️"
        status_text="Profile Complete"
        status_color="Yellow background"
        status_description="Your profile is complete and will be automatically activated."
    else
        status_icon="⏰"
        status_text="Profile Incomplete"
        status_color="Gray background"
        status_description="Complete your profile to unlock all features and opportunities."
    fi

    echo "Status Icon: $status_icon"
    echo "Status Text: $status_text"
    echo "Status Color: $status_color"
    echo "Status Description: $status_description"
    echo
    echo "📊 Progress Details:"
    echo "Completion Percentage: $completion_percentage%"
    echo "Message: $message"
    echo "Missing Fields: $missing_fields"
    echo

    # Show detailed status checks
    echo "🔍 Detailed Status Checks:"
    echo "$profile_response" | jq -r '
      if .details then
        "✅ Basic Info: " + (.details.hasBasicInfo | tostring),
        "✅ Contact Info: " + (.details.hasContactInfo | tostring),
        "✅ Location: " + (.details.hasLocation | tostring),
        "✅ Skills: " + (.details.hasSkills | tostring),
        "✅ Resume: " + (.details.hasResume | tostring),
        "✅ Bio: " + (.details.hasBio | tostring)
      else
        "No detailed status available"
      end
    ' 2>/dev/null

    echo
    echo "👤 User Profile Summary:"
    echo "$profile_response" | jq -r '
      if .profile then
        "Name: " + .profile.firstName + " " + .profile.lastName,
        "Email: " + .profile.email,
        "Bio: " + (.profile.bio // "Not provided"),
        "Phone: " + (.profile.phone // "Not provided"),
        "Location: " + (.profile.location // "Not provided"),
        "Skills: " + (.profile.skills | join(", ") // "None"),
        "Has Resume: " + (.profile.hasResume | tostring)
      else
        "No profile data available"
      end
    ' 2>/dev/null

    echo
    echo "🎯 RESULT:"
    echo "========="
    if [ "$profile_submitted" = "true" ]; then
        echo "✅ Dashboard will show 'Profile Active' with green status"
        echo "✅ No more 'Backend connection issue' errors"
        echo "✅ User can see all their profile details"
        echo "✅ Progress bar shows $completion_percentage% complete"
        echo "✅ Ready to apply for opportunities!"
    elif [ "$is_complete" = "true" ]; then
        echo "🔄 Dashboard will show 'Profile Complete' with yellow status"
        echo "✅ Profile data is visible"
        echo "⏳ Awaiting auto-activation"
    else
        echo "❌ Dashboard will show incomplete profile"
        echo "📝 User needs to complete missing fields"
    fi
else
    echo "❌ Profile status API failed"
fi

echo
echo "==================================="
echo "🏁 DASHBOARD TEST COMPLETE"
echo "==================================="

# Cleanup
rm -f cookies.txt