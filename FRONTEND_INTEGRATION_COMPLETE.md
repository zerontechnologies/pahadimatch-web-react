# Pahadimatch - Frontend Integration Guide (Complete)

## 📋 Table of Contents

1. [Authentication Flow](#1-authentication-flow)
2. [Profile Management](#2-profile-management)
3. [Search & Discovery](#3-search--discovery)
4. [Match Categories](#4-match-categories)
5. [Activity Center](#5-activity-center)
6. [Connections & Messaging](#6-connections--messaging)
7. [Membership & Subscriptions](#7-membership--subscriptions)
8. [Privacy & Settings](#8-privacy--settings)
9. [Notifications](#9-notifications)
10. [Photo Management](#10-photo-management)
11. [Kundali](#11-kundali)
12. [Error Handling](#12-error-handling)

---

## 1. Authentication Flow

### 1.1 Send OTP for Signup/Login
**Endpoint:** `POST /api/auth/send-otp`

**UI Flow:**
1. User enters phone number (10 digits)
2. Click "Send OTP" button
3. Show loading state
4. On success → Navigate to OTP verification screen
5. On error → Show error message

**Request:**
```json
{
  "phone": "+919876543210",
  "type": "signup" // or "login"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "data": {
    "otpId": "otp_123abc",
    "expiresIn": 300
  }
}
```

### 1.2 Verify OTP
**Endpoint:** `POST /api/auth/verify-otp`

**UI Flow:**
1. User enters 6-digit OTP
2. Auto-submit when 6 digits entered OR click "Verify" button
3. On success for NEW user → Navigate to profile creation
4. On success for EXISTING user → Navigate to dashboard
5. On error → Show error, allow resend after cooldown

**Request:**
```json
{
  "phone": "+919876543210",
  "otp": "123456",
  "otpId": "otp_123abc"
}
```

**Response (New User):**
```json
{
  "success": true,
  "message": "Signup successful",
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": "user_id",
      "profileId": "PM123ABC",
      "phone": "+919876543210",
      "isProfileComplete": false
    },
    "isNewUser": true
  }
}
```

**Response (Existing User):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": "user_id",
      "profileId": "PM123ABC",
      "phone": "+919876543210",
      "isProfileComplete": true
    },
    "isNewUser": false
  }
}
```

### 1.3 Refresh Token
**Endpoint:** `POST /api/auth/refresh-token`

**UI Flow:**
- Automatically called when token is about to expire
- Store new token and continue session

---

## 2. Profile Management

### 2.1 Create/Update Profile
**Endpoint:** `POST /api/profile` or `PUT /api/profile`

**UI Flow:**
1. Multi-step profile creation form
2. Step 1: Basic Info (name, DOB, gender, height)
3. Step 2: Personal (marital status, religion, caste, origin)
4. Step 3: Education & Career (education, occupation, income)
5. Step 4: Family Background
6. Step 5: Location
7. Step 6: Partner Preferences
8. Progress bar showing completion %
9. Allow save at each step (partial save)

**Request:**
```json
{
  "firstName": "Rahul",
  "lastName": "Sharma",
  "gender": "male",
  "dateOfBirth": "1995-05-15",
  "height": 175,
  "maritalStatus": "never_married",
  "religion": "hindu",
  "caste": "Brahmin",
  "origin": "garhwali", // NEW FIELD: garhwali, kumaoni, jonsari, other
  "education": "masters",
  "occupation": "engineer",
  "income": 1500000,
  "city": "Dehradun",
  "state": "Uttarakhand",
  "country": "India",
  "aboutMe": "Looking for a life partner...",
  "familyType": "nuclear",
  "familyStatus": "middle_class",
  "preferences": {
    "ageMin": 23,
    "ageMax": 28,
    "heightMin": 155,
    "heightMax": 170,
    "religion": ["hindu"],
    "education": ["bachelors", "masters"],
    "occupation": ["engineer", "doctor", "teacher"]
  }
}
```

**Origin Options:**
- `garhwali` - Garhwali
- `kumaoni` - Kumaoni
- `jonsari` - Jonsari
- `other` - Other

### 2.2 Get Own Profile
**Endpoint:** `GET /api/profile`

**UI Flow:**
- Dashboard → Profile section
- Show complete profile with edit buttons
- Show profile completion percentage
- Show privacy and notification settings

### 2.3 View Other Profile
**Endpoint:** `GET /api/profile/:profileId`

**UI Flow:**
1. Show profile based on privacy rules
2. For non-premium: Show lastName only (no firstName, no contact)
3. For premium (not viewed contact): Show name, but contact locked
4. For premium (viewed contact): Show everything
5. Show "View Contact" button for premium users
6. Track profile view (triggers notification to profile owner if enabled)

**Important Privacy Rules:**
| Field | Non-Premium | Premium (No View) | Premium (Viewed) |
|-------|-------------|-------------------|------------------|
| Profile ID | ✅ | ✅ | ✅ |
| Last Name | ❌ | ✅ | ✅ |
| First Name | ❌ | ✅ | ✅ |
| Phone | ❌ | ❌* | ✅ |
| Photos (not private) | ✅ | ✅ | ✅ |
| Photos (private) | Only if connected | Only if connected | ✅ |
| Income (not private) | ✅ | ✅ | ✅ |
| Income (private) | Only if connected | Only if connected | ✅ |

*Phone visible if `phonePrivate=false` OR interest accepted

### 2.4 Update Privacy Settings
**Endpoint:** `PUT /api/profile/privacy`

**UI Flow:**
- Settings → Privacy section
- Toggle switches for each privacy option
- Auto-save on toggle

**Request:**
```json
{
  "phonePrivate": true,
  "photosPrivate": true,
  "incomePrivate": false
}
```

### 2.5 Update Notification Settings
**Endpoint:** `PUT /api/profile/notifications`

**UI Flow:**
- Settings → Notifications section
- Toggle switches for each notification type
- Auto-save on toggle

**Request:**
```json
{
  "email": true,
  "matches": true,
  "interests": true,
  "messages": true,
  "profileViews": true,
  "shortlist": true
}
```

### 2.6 Get Profile Views (Premium Only)
**Endpoint:** `GET /api/profile/views`

**UI Flow:**
1. Only for premium users
2. Show list of profiles who viewed
3. For non-premium → Show upgrade prompt

**Response (Premium):**
```json
{
  "success": true,
  "data": [
    {
      "profileId": "PM456DEF",
      "lastName": "Verma", // Only lastName
      "age": 26,
      "city": "Delhi",
      "education": "bachelors",
      "occupation": "engineer",
      "profilePhoto": "https://...",
      "viewCount": 3,
      "lastViewedAt": "2024-01-15T10:00:00.000Z"
    }
  ],
  "pagination": { ... }
}
```

**Response (Non-Premium):**
```json
{
  "success": false,
  "message": "Premium membership required to see who viewed your profile",
  "code": "PREMIUM_REQUIRED"
}
```

---

## 3. Search & Discovery

### 3.1 Search Profiles
**Endpoint:** `GET /api/search`

**UI Flow:**
1. Search filters panel
2. Results grid/list with pagination
3. Quick actions: Send Interest, Shortlist, View Profile
4. Show limited info for non-premium

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 20)
- `ageMin`, `ageMax` - Age range
- `heightMin`, `heightMax` - Height range
- `religion` - Religion filter
- `caste` - Caste filter
- `education` - Education filter
- `occupation` - Occupation filter
- `city` - City filter
- `state` - State filter
- `origin` - Origin filter (garhwali, kumaoni, jonsari, other)
- `manglik` - Manglik status
- `incomeMin`, `incomeMax` - Income range

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "profileId": "PM123ABC",
      "lastName": "Sharma", // Only lastName for all users in search
      "age": 28,
      "height": 175,
      "city": "Dehradun",
      "state": "Uttarakhand",
      "education": "masters",
      "occupation": "engineer",
      "religion": "hindu",
      "caste": "Brahmin",
      "origin": "garhwali",
      "profilePhoto": "https://cloudinary.../photo.jpg", // Profile photo URL
      "photoLocked": false, // true if photos private AND not connected
      "isConnected": false, // true if interest accepted
      "isVerified": true,
      "lastActive": "2024-01-15T10:00:00.000Z",
      "profileCompleteness": 85,
      "requiresPremiumForName": true // true for non-premium users
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

**Photo Logic in Lists:**
- `photoLocked: false` + `profilePhoto: "url"` → Show photo
- `photoLocked: false` + `profilePhoto: null` → User has no photo
- `photoLocked: true` + `profilePhoto: null` → Photo is private, show placeholder/lock icon

### 3.2 Save Search Preferences
**Endpoint:** `PUT /api/profile/preferences`

**UI Flow:**
- Save current filter as preference
- Apply saved preference on search

---

## 4. Match Categories

### 4.1 Get Matches by Category
**Endpoint:** `GET /api/matches/:category`

**UI Flow:**
1. Horizontal scrollable tabs for categories
2. Category-specific results
3. Same response format as search

**Categories:**
- `new_matches` - Newly joined profiles
- `preferred_matches` - Matches your preferences
- `location_matches` - Same city/state
- `education_matches` - Similar education
- `occupation_matches` - Same occupation
- `salary_matches` - Similar income range
- `religion_matches` - Same religion
- `family_origin_matches` - Same family origin
- `govt_matches` - Government employees
- `army_officer_matches` - Army officers
- `premium_matches` - Premium profiles
- `shortlisted_profiles` - Your shortlisted profiles

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "profileId": "PM123ABC",
      "lastName": "Sharma", // Only lastName
      "age": 28,
      "height": 175,
      "city": "Dehradun",
      "state": "Uttarakhand",
      "education": "masters",
      "occupation": "engineer",
      "religion": "hindu",
      "caste": "Brahmin",
      "origin": "garhwali",
      "profilePhoto": "https://cloudinary.../photo.jpg",
      "photoLocked": false, // true if private AND not connected
      "isConnected": false,
      "isVerified": true,
      "lastActive": "2024-01-15T10:00:00.000Z",
      "requiresPremiumForName": true
    }
  ],
  "pagination": { ... }
}
```

---

## 5. Activity Center

### 5.1 Send Interest
**Endpoint:** `POST /api/activity/interest`

**UI Flow:**
1. Click "Send Interest" button on profile
2. Optional: Add message
3. Check daily limit before sending
4. Show remaining interests for the day
5. On success → Update button to "Interest Sent"

**Daily Interest Limits:**
- **Free:** 10 interests/day
- **Silver:** 50 interests/day
- **Gold:** Unlimited
- **Platinum:** Unlimited

**Request:**
```json
{
  "profileId": "PM123ABC",
  "message": "Hi, I liked your profile!"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Interest sent successfully",
  "data": {
    "interest": { ... },
    "dailyInterestRemaining": 9
  }
}
```

**Response (Limit Reached):**
```json
{
  "success": false,
  "message": "Daily interest limit reached (10/day). Please try again tomorrow or upgrade your plan.",
  "code": "DAILY_LIMIT_REACHED"
}
```

### 5.2 Get Interest Limit Status
**Endpoint:** `GET /api/activity/interest-limit`

**UI Flow:**
- Show remaining interests badge
- Update after each interest sent

**Response:**
```json
{
  "success": true,
  "data": {
    "dailyInterestRemaining": 9,
    "dailyInterestLimit": 10,
    "canSendInterest": true
  }
}
```

### 5.3 Accept/Decline Interest
**Endpoint:** `PUT /api/activity/interest/:interestId/accept`
**Endpoint:** `PUT /api/activity/interest/:interestId/decline`

**UI Flow:**
1. Show received interests list
2. Accept/Decline buttons on each
3. On accept → Move to connections, enable messaging
4. On decline → Remove from list

### 5.4 Get Received Interests
**Endpoint:** `GET /api/activity/interests/received`

**UI Flow:**
- Tab: Pending, Accepted, Declined
- Show sender profile (lastName only)
- Show profile photo if not private or connected

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "interest_123",
      "status": "pending",
      "message": "Hi!",
      "createdAt": "2024-01-15T10:00:00.000Z",
      "profile": {
        "profileId": "PM456DEF",
        "lastName": "Verma", // Only lastName
        "age": 26,
        "city": "Delhi",
        "profilePhoto": "https://..." // Based on privacy
      }
    }
  ],
  "pagination": { ... }
}
```

### 5.5 Get Sent Interests
**Endpoint:** `GET /api/activity/interests/sent`

**UI Flow:**
- Similar to received interests
- Show status: Pending, Accepted, Declined

### 5.6 Shortlist Profile
**Endpoint:** `POST /api/activity/shortlist`

**UI Flow:**
- Heart/Star icon on profile
- Toggle shortlist status

**Request:**
```json
{
  "profileId": "PM123ABC"
}
```

### 5.7 Get Shortlisted Profiles
**Endpoint:** `GET /api/activity/shortlist`

### 5.8 Block Profile
**Endpoint:** `POST /api/activity/block`

**UI Flow:**
- Report/Block option in profile menu
- Confirm dialog before blocking

**Request:**
```json
{
  "profileId": "PM123ABC",
  "reason": "Inappropriate behavior"
}
```

### 5.9 Get Blocked Profiles
**Endpoint:** `GET /api/activity/blocked`

---

## 6. Connections & Messaging

### 6.1 Get Connected Users (NEW)
**Endpoint:** `GET /api/activity/connections`

**UI Flow:**
1. Connections tab in activity center
2. List of users with accepted interests
3. Each connection shows:
   - Profile photo (always visible for connections)
   - Last name only
   - Basic info (age, city)
   - "Message" button
4. Click to open chat

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "profileId": "PM456DEF",
      "lastName": "Verma", // Only lastName
      "age": 26,
      "city": "Delhi",
      "state": "Delhi",
      "education": "bachelors",
      "occupation": "engineer",
      "religion": "hindu",
      "profilePhoto": "https://...", // Connected users can see photos
      "connectedAt": "2024-01-15T10:00:00.000Z",
      "canMessage": true,
      "canSendPredefinedMessages": true
    }
  ],
  "pagination": { ... }
}
```

**Important:** Connected users can:
- See each other's photos (even if private)
- Send messages (if premium) or predefined messages (if free)
- See lastName only (not full name unless "View Contact" used)

### 6.2 Chat Flow

**UI Flow:**
1. Open chat from connections list
2. For premium users: Free-form messaging
3. For free users: Predefined messages only

**WebSocket Events:**
- `connect` - Connect to chat server
- `join_conversation` - Join a conversation
- `send_message` - Send a message
- `receive_message` - Receive a message
- `message_delivered` - Message delivered
- `message_read` - Message read

**Predefined Messages (Free Users):**
- "Hi, I liked your profile!"
- "Would you like to connect?"
- "I'm interested in knowing more about you."
- "Hello, how are you?"
- "Your profile seems interesting."

---

## 7. Membership & Subscriptions

### 7.1 Get Membership Plans
**Endpoint:** `GET /api/membership/plans`

**UI Flow:**
- Membership page with plan comparison
- Highlight current plan
- Show upgrade benefits

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "silver",
      "name": "Silver Membership",
      "price": 2500,
      "discountedPrice": 2300,
      "contactsAllowed": 40,
      "validityDays": 180,
      "dailyInterestLimit": 50,
      "features": {
        "viewContacts": true,
        "unlimitedInterests": false,
        "messaging": true,
        "viewPrivatePhotos": true,
        "priorityListing": false,
        "canSeeProfileViewers": true
      }
    },
    {
      "id": "gold",
      "name": "Gold Membership",
      "price": 4000,
      "discountedPrice": 2500,
      "contactsAllowed": 100,
      "validityDays": 270,
      "dailyInterestLimit": -1, // Unlimited
      "features": { ... }
    },
    {
      "id": "platinum",
      "name": "Platinum Membership",
      "price": 5000,
      "discountedPrice": 3000,
      "contactsAllowed": 150,
      "validityDays": 365,
      "dailyInterestLimit": -1, // Unlimited
      "features": { ... }
    }
  ]
}
```

### 7.2 Get Membership Summary
**Endpoint:** `GET /api/membership/summary`

**UI Flow:**
- Dashboard widget showing current plan
- Show usage: contacts used/allowed, interests remaining
- Show expiry date

**Response:**
```json
{
  "success": true,
  "data": {
    "currentPlan": "gold",
    "isActive": true,
    "isPremium": true,
    "expiresAt": "2024-10-15T00:00:00.000Z",
    "contactsUsed": 45,
    "contactsAllowed": 100,
    "contactsRemaining": 55,
    "dailyInterestCount": 5,
    "dailyInterestLimit": -1, // -1 means unlimited
    "dailyInterestRemaining": -1,
    "features": { ... }
  }
}
```

### 7.3 View Contact (NEW)
**Endpoint:** `POST /api/membership/view-contact/:profileId`

**UI Flow:**
1. Click "View Contact" button on profile
2. Confirm dialog: "This will use 1 contact view (X remaining). Continue?"
3. On success → Refresh profile to show full details
4. Update contacts remaining counter

**What happens after viewing contact:**
- Can see firstName + lastName
- Can see phone number
- Can see all photos (bypasses privacy)
- Can see income (bypasses privacy)
- Does NOT consume quota if already viewed

**Response (First Time):**
```json
{
  "success": true,
  "message": "Contact unlocked successfully. You can now view name and contact details.",
  "data": {
    "success": true,
    "contactsRemaining": 54,
    "alreadyViewed": false
  }
}
```

**Response (Already Viewed):**
```json
{
  "success": true,
  "message": "Contact already viewed",
  "data": {
    "success": true,
    "contactsRemaining": 55,
    "alreadyViewed": true
  }
}
```

**Response (Limit Reached):**
```json
{
  "success": false,
  "message": "Contact view limit reached. Please renew or upgrade your plan.",
  "code": "CONTACT_LIMIT_REACHED",
  "contactsUsed": 100,
  "contactsAllowed": 100
}
```

### 7.4 Purchase Membership
**Endpoint:** `POST /api/membership/purchase`

**UI Flow:**
1. Select plan
2. Payment gateway integration
3. On success → Refresh membership status

**Request:**
```json
{
  "plan": "gold",
  "paymentId": "pay_123abc",
  "paymentMethod": "razorpay"
}
```

---

## 8. Privacy & Settings

### 8.1 Privacy Settings

**UI Components:**
```
┌─────────────────────────────────────────┐
│ Privacy Settings                        │
├─────────────────────────────────────────┤
│ Phone Number                    [Toggle]│
│ Hide from non-connected users           │
├─────────────────────────────────────────┤
│ Photos                          [Toggle]│
│ Only connected users can see photos     │
├─────────────────────────────────────────┤
│ Income                          [Toggle]│
│ Only connected users can see income     │
└─────────────────────────────────────────┘
```

### 8.2 Notification Settings

**UI Components:**
```
┌─────────────────────────────────────────┐
│ Notification Settings                   │
├─────────────────────────────────────────┤
│ Email Notifications             [Toggle]│
├─────────────────────────────────────────┤
│ New Matches                     [Toggle]│
├─────────────────────────────────────────┤
│ Interests Received/Accepted     [Toggle]│
├─────────────────────────────────────────┤
│ Messages                        [Toggle]│
├─────────────────────────────────────────┤
│ Profile Views                   [Toggle]│
├─────────────────────────────────────────┤
│ Shortlisted                     [Toggle]│
└─────────────────────────────────────────┘
```

---

## 9. Notifications

### 9.1 Get Notifications
**Endpoint:** `GET /api/notifications`

**UI Flow:**
- Notification bell icon with badge
- Dropdown/page with notification list
- Mark as read on click

**Notification Types:**
- `interest_received` - Someone sent interest
- `interest_accepted` - Interest was accepted
- `interest_declined` - Interest was declined
- `profile_view` - Someone viewed profile (Premium only can see)
- `shortlisted` - Someone shortlisted you
- `message_received` - New message
- `match_found` - New match found

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "notif_123",
      "type": "interest_received",
      "title": "New Interest",
      "message": "Someone expressed interest in your profile",
      "data": {
        "profileId": "PM456DEF"
      },
      "isRead": false,
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  ],
  "pagination": { ... }
}
```

### 9.2 Mark as Read
**Endpoint:** `PUT /api/notifications/:notificationId/read`

### 9.3 Mark All as Read
**Endpoint:** `PUT /api/notifications/read-all`

---

## 10. Photo Management

### 10.1 Upload Photo
**Endpoint:** `POST /api/photos/upload`

**UI Flow:**
1. Select photo (camera or gallery)
2. Crop/edit
3. Set as profile photo option
4. Upload with progress
5. Min 5, Max 10 photos
6. File size < 8MB
7. Format: jpg, jpeg, png

**Request:** `multipart/form-data`
- `photo` - File
- `isProfilePhoto` - boolean

### 10.2 Get My Photos
**Endpoint:** `GET /api/photos`

### 10.3 Delete Photo
**Endpoint:** `DELETE /api/photos/:photoId`

### 10.4 Reorder Photos
**Endpoint:** `PUT /api/photos/reorder`

**Request:**
```json
{
  "photoIds": ["photo_1", "photo_2", "photo_3"]
}
```

---

## 11. Kundali

### 11.1 Generate Kundali
**Endpoint:** `POST /api/kundali/generate`

**UI Flow:**
1. Enter birth details (date, time, place)
2. Generate kundali
3. Store for matching

**Request:**
```json
{
  "dateOfBirth": "1995-05-15",
  "timeOfBirth": "10:30",
  "placeOfBirth": "Dehradun, Uttarakhand"
}
```

### 11.2 Kundali Match (Premium Only)
**Endpoint:** `GET /api/kundali/match/:profileId`

**UI Flow:**
1. Premium feature only
2. Show match score
3. Detailed analysis

**Response (Premium):**
```json
{
  "success": true,
  "data": {
    "totalScore": 28,
    "maxScore": 36,
    "percentage": 77.78,
    "varnaScore": { "score": 1, "max": 1 },
    "vasyaScore": { "score": 2, "max": 2 },
    "taraScore": { "score": 3, "max": 3 },
    "yoniScore": { "score": 4, "max": 4 },
    "grahaScore": { "score": 5, "max": 5 },
    "ganScore": { "score": 6, "max": 6 },
    "bhakootScore": { "score": 7, "max": 7 },
    "nadiScore": { "score": 0, "max": 8 }
  }
}
```

**Response (Non-Premium):**
```json
{
  "success": false,
  "message": "Premium membership required for Kundali matching",
  "code": "PREMIUM_REQUIRED"
}
```

---

## 12. Error Handling

### Error Codes

| Code | Description | UI Action |
|------|-------------|-----------|
| `AUTH_REQUIRED` | Not authenticated | Redirect to login |
| `PREMIUM_REQUIRED` | Premium feature | Show upgrade modal |
| `CONTACT_LIMIT_REACHED` | Contact quota exhausted | Show renew/upgrade modal |
| `DAILY_LIMIT_REACHED` | Daily interest limit | Show message + upgrade option |
| `ALREADY_SENT` | Interest already sent | Update button state |
| `BLOCKED` | Profile blocked | Show message |
| `PROFILE_NOT_FOUND` | Profile doesn't exist | Show 404 |
| `VALIDATION_ERROR` | Invalid input | Highlight field errors |

### Example Error Response
```json
{
  "success": false,
  "status": 403,
  "message": "Contact view limit reached. Please renew or upgrade your plan.",
  "error": {
    "code": "CONTACT_LIMIT_REACHED",
    "details": {
      "contactsUsed": 100,
      "contactsAllowed": 100
    }
  }
}
```

---

## 📱 UI Component Checklist

### Authentication
- [ ] Phone input with country code
- [ ] OTP input (6 digits, auto-submit)
- [ ] Loading states
- [ ] Error messages
- [ ] Resend OTP button with cooldown

### Profile
- [ ] Multi-step form
- [ ] Progress indicator
- [ ] Photo upload with preview
- [ ] Privacy toggles
- [ ] Notification toggles
- [ ] Origin dropdown (Garhwali, Kumaoni, Jonsari, Other)

### Search
- [ ] Filter panel (collapsible on mobile)
- [ ] Results grid/list toggle
- [ ] Pagination
- [ ] Quick action buttons

### Matches
- [ ] Category tabs
- [ ] Card/list view
- [ ] "Send Interest" button with remaining count
- [ ] "View Contact" button (premium)
- [ ] Shortlist heart icon

### Activity
- [ ] Tab navigation (Received, Sent, Connections)
- [ ] Accept/Decline buttons
- [ ] Daily interest remaining badge
- [ ] Connection list with message button

### Membership
- [ ] Plan comparison cards
- [ ] Current plan status
- [ ] Contact quota progress bar
- [ ] Upgrade CTAs
- [ ] Payment integration

### Notifications
- [ ] Bell icon with badge
- [ ] Notification list
- [ ] Mark as read
- [ ] Click to navigate

### Chat
- [ ] Chat list
- [ ] Message input (free text or predefined)
- [ ] Online status
- [ ] Message status (sent, delivered, read)

---

## 🔐 Security Reminders

1. **Never show contact info without "View Contact" API call**
2. **Always check `hasViewedContact` flag before showing phone**
3. **Respect privacy settings for photos and income**
4. **Check daily interest limit before enabling "Send Interest"**
5. **Only show profile viewers to premium users**
6. **Block interactions with blocked profiles**

---

## 🚀 Quick Start

1. Install API client library
2. Set up authentication interceptor
3. Implement token refresh logic
4. Build screens following the flows above
5. Handle all error codes
6. Test with different membership levels

**Last Updated:** 2024-01-15
**API Version:** 1.0.0

