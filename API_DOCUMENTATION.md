# Pahadimatch API Documentation

Complete API documentation with request/response payloads organized by modules.

**Base URL:** `/api`  
**Authentication:** Bearer Token (required for all endpoints except auth)

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Profile](#2-profile)
3. [Photos](#3-photos)
4. [Membership](#4-membership)
5. [Search](#5-search)
6. [Matches](#6-matches)
7. [Activity](#7-activity)
8. [Chat & Messaging](#8-chat--messaging)
9. [Notifications](#9-notifications)
10. [Kundali](#10-kundali)

---

## 1. Authentication

### 1.1 Send OTP

**Endpoint:** `POST /auth/send-otp`

**Request:**
```json
{
  "phone": "+919876543210",
  "purpose": "signup" // or "login"
}
```

**Response:**
```json
{
  "success": true,
  "status": 200,
  "message": "OTP sent successfully",
  "data": null
}
```

**Error Response:**
```json
{
  "success": false,
  "status": 429,
  "message": "Too many OTP requests. Please try again later.",
  "error": {
    "code": "OTP_RATE_LIMIT"
  }
}
```

---

### 1.2 Verify OTP

**Endpoint:** `POST /auth/verify-otp`

**Request:**
```json
{
  "phone": "+919876543210",
  "otp": "123456",
  "purpose": "signup", // or "login"
  "dailyInterestLimit": 5 // Required for signup, optional for login
}
```

**Response:**
```json
{
  "success": true,
  "status": 200,
  "message": "OTP verified successfully",
  "data": {
    "user": {
      "id": "65e1f2a3b4c5678901234567",
      "profileId": "PMMKFF6PNPFBZZ",
      "phone": "+919876543210",
      "isPhoneVerified": true,
      "isProfileComplete": false,
      "lastLogin": "2026-01-17T10:00:00.000Z",
      "createdAt": "2026-01-15T12:22:37.094Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "isNewUser": true,
    "isProfileComplete": false
  }
}
```

---

### 1.3 Get Current User

**Endpoint:** `GET /auth/me`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "status": 200,
  "message": "Success",
  "data": {
    "id": "65e1f2a3b4c5678901234567",
    "profileId": "PMMKFF6PNPFBZZ",
    "phone": "+919876543210",
    "isPhoneVerified": true,
    "isProfileComplete": true,
    "lastLogin": "2026-01-17T10:00:00.000Z",
    "createdAt": "2026-01-15T12:22:37.094Z"
  }
}
```

---

### 1.4 Change Phone Number (Step 1)

**Endpoint:** `POST /auth/change-phone`

**Request:**
```json
{
  "newPhone": "+919876543211"
}
```

**Response:**
```json
{
  "success": true,
  "status": 200,
  "message": "OTP sent to new phone number",
  "data": null
}
```

---

### 1.5 Verify Phone Change (Step 2)

**Endpoint:** `POST /auth/verify-phone-change`

**Request:**
```json
{
  "newPhone": "+919876543211",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "status": 200,
  "message": "Phone number updated successfully",
  "data": {
    "id": "65e1f2a3b4c5678901234567",
    "profileId": "PMMKFF6PNPFBZZ",
    "phone": "+919876543211",
    "isPhoneVerified": true,
    "isProfileComplete": true,
    "lastLogin": "2026-01-17T10:00:00.000Z",
    "createdAt": "2026-01-15T12:22:37.094Z"
  }
}
```

---

## 2. Profile

### 2.1 Get Own Profile

**Endpoint:** `GET /profile`

**Response:**
```json
{
  "success": true,
  "status": 200,
  "message": "Success",
  "data": {
    "_id": "6968dc0d5f164ed3c07a3374",
    "userId": {
      "_id": "6968dc0c5f164ed3c07a3370",
      "phone": "+918090972513",
      "isPhoneVerified": true,
      "profileId": "PMMKFF6PNPFBZZ"
    },
    "firstName": "Rajesh",
    "lastName": "Sharma",
    "gender": "male",
    "dateOfBirth": "1996-06-26T18:30:00.000Z",
    "age": 29,
    "height": 177,
    "weight": 74,
    "physicalStatus": "Normal",
    "maritalStatus": "never_married",
    "religion": "sikh",
    "manglik": "partial",
    "education": "masters",
    "educationDetail": "M.Tech Electrical",
    "college": "AFMC",
    "occupation": "engineer",
    "occupationDetail": "Software Engineer",
    "company": "Tata",
    "income": 2334162,
    "city": "Bangalore",
    "state": "Karnataka",
    "country": "India",
    "location": {
      "type": "Point",
      "coordinates": [0, 0]
    },
    "familyType": "nuclear",
    "familyStatus": "rich",
    "fatherOccupation": "Retired",
    "motherOccupation": "Homemaker",
    "siblings": 0,
    "diet": "non_vegetarian",
    "smoking": "no",
    "drinking": "occasionally",
    "aboutMe": "Looking for a life partner...",
    "hobbies": ["Swimming", "Painting", "Meditation"],
    "preferences": {
      "ageMin": 22,
      "ageMax": 30,
      "heightMin": 150,
      "heightMax": 170,
      "maritalStatus": ["never_married"],
      "religion": ["hindu", "sikh", "jain"],
      "education": ["bachelors", "masters", "phd"],
      "occupation": ["engineer", "doctor", "government", "private"],
      "incomeMin": 500000,
      "incomeMax": 10000000,
      "locations": ["Maharashtra", "Delhi", "Karnataka"],
      "caste": [],
      "manglik": [],
      "motherTongue": []
    },
    "privacySettings": {
      "phonePrivate": false,
      "photosPrivate": true,
      "incomePrivate": true
    },
    "notificationSettings": {
      "email": true,
      "matches": true,
      "interests": true,
      "messages": true,
      "profileViews": false,
      "shortlist": true
    },
    "origin": "garhwali",
    "community": "garhwali",
    "caste": "brahmin",
    "accountCreatedBy": "self",
    "fatherName": "Ram Sharma",
    "fatherAlive": "alive",
    "fatherEmploymentStatus": "retired",
    "motherName": "Sita Sharma",
    "motherAlive": "alive",
    "motherEmploymentStatus": "not_working",
    "birthTime": "16:06",
    "birthPlace": "Bangalore",
    "hasKundali": false,
    "profileCompleteness": 95,
    "isVerified": true,
    "lastActive": "2026-01-10T11:31:25.033Z",
    "createdAt": "2026-01-15T12:22:37.094Z",
    "updatedAt": "2026-01-15T12:22:37.094Z"
  }
}
```

---

### 2.2 Create/Update Profile

**Endpoint:** `POST /profile`

**Request:**
```json
{
  "firstName": "Rajesh",
  "lastName": "Sharma",
  "gender": "male",
  "dateOfBirth": "1996-06-26",
  "height": 177,
  "weight": 74,
  "bodyType": "athletic",
  "complexion": "wheatish",
  "maritalStatus": "never_married",
  "religion": "sikh",
  "caste": "brahmin",
  "subCaste": "Kashyap",
  "gothra": "Kashyap",
  "motherTongue": "Hindi",
  "manglik": "partial",
  "origin": "garhwali",
  "community": "garhwali",
  "accountCreatedBy": "self",
  "education": "masters",
  "educationDetail": "M.Tech Electrical",
  "college": "AFMC",
  "occupation": "engineer",
  "occupationDetail": "Software Engineer",
  "company": "Tata",
  "income": 2334162,
  "city": "Bangalore",
  "state": "Karnataka",
  "country": "India",
  "familyType": "nuclear",
  "familyStatus": "rich",
  "fatherName": "Ram Sharma",
  "fatherAlive": "alive",
  "fatherEmploymentStatus": "retired",
  "motherName": "Sita Sharma",
  "motherAlive": "alive",
  "motherEmploymentStatus": "not_working",
  "fatherOccupation": "Retired",
  "motherOccupation": "Homemaker",
  "siblings": 0,
  "diet": "non_vegetarian",
  "smoking": "no",
  "drinking": "occasionally",
  "aboutMe": "Looking for a life partner...",
  "hobbies": ["Swimming", "Painting", "Meditation"]
}
```

**Response:**
```json
{
  "success": true,
  "status": 200,
  "message": "Profile updated successfully",
  "data": {
    // Same structure as Get Own Profile
  }
}
```

---

### 2.3 View Another Profile

**Endpoint:** `GET /profile/:profileId`

**Response (Premium Required):**
```json
{
  "success": true,
  "status": 200,
  "message": "Success",
  "data": {
    "profileId": "PM123ABC",
    "isPremiumRequired": true,
    "message": "Upgrade to premium to view this profile",
    "requiresPremiumForName": true,
    "requiresPremiumForContact": true
  }
}
```

**Response (No Premium Required):**
```json
{
  "success": true,
  "status": 200,
  "message": "Success",
  "data": {
    "profileId": "PM123ABC",
    "isPremiumRequired": false,
    "userId": "65e1f2a3b4c5678901234567",
    "firstName": "Priya",
    "lastName": "Singh",
    "gender": "female",
    "dateOfBirth": "1998-05-15",
    "age": 25,
    "height": 165,
    "weight": 58,
    "bodyType": "slim",
    "complexion": "fair",
    "maritalStatus": "never_married",
    "religion": "hindu",
    "caste": "brahmin",
    "education": "masters",
    "occupation": "doctor",
    "city": "Delhi",
    "state": "Delhi",
    "country": "India",
    "profileCompleteness": 90,
    "isVerified": true,
    "lastActive": "2026-01-17T10:00:00.000Z",
    "phone": null,
    "phoneLocked": true,
    "income": null,
    "incomeLocked": true,
    "photos": [
      {
        "id": "photo123",
        "url": "https://bucket.s3.amazonaws.com/users/abc/photos/xyz.jpg",
        "isProfilePhoto": true,
        "isPrivate": false,
        "order": 0
      }
    ],
    "photosLocked": false,
    "isShortlisted": false
  }
}
```

---

### 2.4 Update Privacy Settings

**Endpoint:** `PUT /profile/privacy`

**Request:**
```json
{
  "phonePrivate": false,
  "photosPrivate": true,
  "incomePrivate": true
}
```

**Response:**
```json
{
  "success": true,
  "status": 200,
  "message": "Privacy settings updated",
  "data": {
    "phonePrivate": false,
    "photosPrivate": true,
    "incomePrivate": true
  }
}
```

---

### 2.5 Update Partner Preferences

**Endpoint:** `PUT /profile/preferences`

**Request:**
```json
{
  "ageMin": 22,
  "ageMax": 30,
  "heightMin": 150,
  "heightMax": 170,
  "maritalStatus": ["never_married"],
  "religion": ["hindu", "sikh", "jain"],
  "education": ["bachelors", "masters", "phd"],
  "occupation": ["engineer", "doctor", "government", "private"],
  "incomeMin": 500000,
  "incomeMax": 10000000,
  "locations": ["Maharashtra", "Delhi", "Karnataka"],
  "caste": ["brahmin", "rajput"],
  "manglik": ["no", "partial"],
  "motherTongue": ["Hindi", "English"]
}
```

**Response:**
```json
{
  "success": true,
  "status": 200,
  "message": "Preferences updated",
  "data": {
    // Same as request
  }
}
```

---

### 2.6 Get Profile Views

**Endpoint:** `GET /profile/views?page=1&limit=20`

**Response:**
```json
{
  "success": true,
  "status": 200,
  "message": "Success",
  "data": [
    {
      "profileId": "PM123ABC",
      "lastName": "Singh",
      "age": 25,
      "city": "Delhi",
      "education": "masters",
      "occupation": "doctor",
      "profilePhoto": "https://bucket.s3.amazonaws.com/...",
      "viewCount": 3,
      "lastViewedAt": "2026-01-17T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

### 2.7 Update Notification Settings

**Endpoint:** `PUT /profile/notifications`

**Request:**
```json
{
  "email": true,
  "matches": true,
  "interests": true,
  "messages": true,
  "profileViews": false,
  "shortlist": true
}
```

**Response:**
```json
{
  "success": true,
  "status": 200,
  "message": "Notification settings updated",
  "data": {
    // Same as request
  }
}
```

---

## 3. Photos

### 3.1 Get My Photos

**Endpoint:** `GET /photos`

**Response:**
```json
{
  "success": true,
  "status": 200,
  "message": "Success",
  "data": [
    {
      "id": "4b813782-71d8-492c-8073-4c69a97af5f4",
      "_id": "65e1f2a3b4c5678901234567",
      "url": "https://bucket-name.s3.ap-south-1.amazonaws.com/users/{userId}/photos/{uuid}.jpg",
      "isProfilePhoto": true,
      "isPrivate": false,
      "order": 0,
      "isApproved": true,
      "createdAt": "2026-01-15T12:22:37.094Z"
    }
  ]
}
```

---

### 3.2 Upload Photo

**Endpoint:** `POST /photos/upload`

**Content-Type:** `multipart/form-data`

**Form Data:**
```
photo: (file) Image file (max 8MB, JPEG/PNG)
isProfilePhoto: "true" or "false"
isPrivate: "true" or "false"
```

**Response:**
```json
{
  "success": true,
  "status": 201,
  "message": "Photo uploaded successfully",
  "data": {
    "id": "4b813782-71d8-492c-8073-4c69a97af5f4",
    "url": "https://bucket-name.s3.ap-south-1.amazonaws.com/users/{userId}/photos/{uuid}.jpg",
    "isProfilePhoto": true,
    "isPrivate": false,
    "order": 0,
    "isApproved": true,
    "createdAt": "2026-01-15T12:22:37.094Z"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "status": 400,
  "message": "Invalid file type. Only JPEG and PNG are allowed.",
  "error": {
    "code": "VALIDATION_ERROR"
  }
}
```

---

### 3.3 Get Photo Requirements

**Endpoint:** `GET /photos/requirements`

**Response:**
```json
{
  "success": true,
  "status": 200,
  "message": "Success",
  "data": {
    "count": 3,
    "hasMinimum": false,
    "hasProfilePhoto": true,
    "remaining": 2
  }
}
```

---

### 3.4 Set Profile Photo

**Endpoint:** `PUT /photos/:photoId/profile`

**Response:**
```json
{
  "success": true,
  "status": 200,
  "message": "Profile photo updated",
  "data": null
}
```

---

### 3.5 Toggle Photo Privacy

**Endpoint:** `PUT /photos/:photoId/privacy`

**Response:**
```json
{
  "success": true,
  "status": 200,
  "message": "Photo privacy updated",
  "data": null
}
```

---

### 3.6 Reorder Photos

**Endpoint:** `PUT /photos/reorder`

**Request:**
```json
{
  "photoOrder": [
    "photo-id-1",
    "photo-id-2",
    "photo-id-3"
  ]
}
```

**Response:**
```json
{
  "success": true,
  "status": 200,
  "message": "Photos reordered",
  "data": null
}
```

---

### 3.7 Delete Photo

**Endpoint:** `DELETE /photos/:photoId`

**Response:**
```json
{
  "success": true,
  "status": 200,
  "message": "Photo deleted",
  "data": null
}
```

---

## 4. Membership

### 4.1 Get Available Plans

**Endpoint:** `GET /membership/plans`

**Response:**
```json
{
  "success": true,
  "status": 200,
  "message": "Success",
  "data": [
    {
      "id": "free",
      "name": "Free",
      "price": 0,
      "discountedPrice": 0,
      "contactsAllowed": 5,
      "validityDays": 365,
      "features": {
        "viewContacts": false,
        "unlimitedInterests": false,
        "messaging": false,
        "viewPrivatePhotos": false,
        "priorityListing": false
      }
    },
    {
      "id": "silver",
      "name": "Silver Membership",
      "price": 2500,
      "discountedPrice": 2300,
      "contactsAllowed": 40,
      "validityDays": 180,
      "features": {
        "viewContacts": true,
        "unlimitedInterests": false,
        "messaging": true,
        "viewPrivatePhotos": true,
        "priorityListing": false
      }
    },
    {
      "id": "gold",
      "name": "Gold Membership",
      "price": 4000,
      "discountedPrice": 2500,
      "contactsAllowed": 100,
      "validityDays": 270,
      "features": {
        "viewContacts": true,
        "unlimitedInterests": true,
        "messaging": true,
        "viewPrivatePhotos": true,
        "priorityListing": false
      }
    },
    {
      "id": "platinum",
      "name": "Platinum Membership",
      "price": 5000,
      "discountedPrice": 3000,
      "contactsAllowed": 150,
      "validityDays": 365,
      "features": {
        "viewContacts": true,
        "unlimitedInterests": true,
        "messaging": true,
        "viewPrivatePhotos": true,
        "priorityListing": true
      }
    }
  ]
}
```

---

### 4.2 Get Membership Summary

**Endpoint:** `GET /membership/summary`

**Response:**
```json
{
  "success": true,
  "status": 200,
  "message": "Success",
  "data": {
    "currentPlan": "gold",
    "isActive": true,
    "isPremium": true,
    "expiresAt": "2026-07-15T12:00:00.000Z",
    "contactsUsed": 25,
    "contactsAllowed": 100,
    "contactsRemaining": 75,
    "dailyInterestCount": 3,
    "dailyInterestLimit": 10,
    "dailyInterestRemaining": 7,
    "features": {
      "viewContacts": true,
      "unlimitedInterests": true,
      "messaging": true,
      "viewPrivatePhotos": true,
      "priorityListing": false
    }
  }
}
```

---

### 4.3 Purchase Membership

**Endpoint:** `POST /membership/purchase`

**Request:**
```json
{
  "plan": "gold",
  "paymentId": "pay_1234567890",
  "paymentMethod": "razorpay"
}
```

**Response:**
```json
{
  "success": true,
  "status": 200,
  "message": "Membership purchased successfully",
  "data": {
    "id": "65e1f2a3b4c5678901234567",
    "plan": "gold",
    "startDate": "2026-01-17T10:00:00.000Z",
    "endDate": "2026-10-17T10:00:00.000Z",
    "isActive": true,
    "contactsUsed": 0,
    "contactsAllowed": 100,
    "amount": 4000,
    "discountedAmount": 2500
  }
}
```

---

### 4.4 View Contact (Uses Contact Quota)

**Endpoint:** `POST /membership/view-contact/:profileId`

**Response:**
```json
{
  "success": true,
  "status": 200,
  "message": "Contact viewed successfully",
  "data": {
    "success": true,
    "contactsRemaining": 74,
    "alreadyViewed": false
  }
}
```

**Error Response (Limit Reached):**
```json
{
  "success": false,
  "status": 403,
  "message": "Contact viewing limit reached. Upgrade your plan.",
  "error": {
    "code": "CONTACT_LIMIT_REACHED"
  }
}
```

---

### 4.5 Get Membership History

**Endpoint:** `GET /membership/history`

**Response:**
```json
{
  "success": true,
  "status": 200,
  "message": "Success",
  "data": [
    {
      "id": "65e1f2a3b4c5678901234567",
      "plan": "gold",
      "startDate": "2026-01-17T10:00:00.000Z",
      "endDate": "2026-10-17T10:00:00.000Z",
      "isActive": true,
      "contactsUsed": 25,
      "contactsAllowed": 100,
      "amount": 4000,
      "discountedAmount": 2500
    }
  ]
}
```

---

## 5. Search

### 5.1 Search Profiles

**Endpoint:** `GET /search?gender=female&ageMin=22&ageMax=30&page=1&limit=20`

**Query Parameters:**
- `gender`: `male` | `female`
- `ageMin`: number
- `ageMax`: number
- `heightMin`: number
- `heightMax`: number
- `maritalStatus`: comma-separated array (e.g., `never_married,divorced`)
- `religion`: comma-separated array (e.g., `hindu,sikh`)
- `caste`: comma-separated array
- `manglik`: comma-separated array
- `education`: comma-separated array
- `occupation`: comma-separated array
- `incomeMin`: number
- `incomeMax`: number
- `locations`: comma-separated array (states)
- `city`: string
- `state`: string
- `motherTongue`: comma-separated array
- `isVerified`: boolean
- `hasPhotos`: boolean
- `isPremium`: boolean
- `sortBy`: `relevance` | `newest` | `lastActive`
- `page`: number (default: 1)
- `limit`: number (default: 20)

**Response:**
```json
{
  "success": true,
  "status": 200,
  "message": "Success",
  "data": [
    {
      "profileId": "PM123ABC",
      "isPremiumRequired": false,
      "firstName": "Priya",
      "lastName": "Singh",
      "age": 25,
      "height": 165,
      "city": "Delhi",
      "state": "Delhi",
      "education": "masters",
      "occupation": "doctor",
      "religion": "hindu",
      "caste": "brahmin",
      "isVerified": true,
      "lastActive": "2026-01-17T10:00:00.000Z",
      "profilePhoto": "https://bucket.s3.amazonaws.com/...",
      "photos": [
        {
          "url": "https://bucket.s3.amazonaws.com/...",
          "isProfilePhoto": true
        }
      ],
      "photosLocked": false,
      "matchScore": 85,
      "alreadySentInterest": false,
      "isConnected": false,
      "hasViewedContact": false
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

### 5.2 Save Search Preferences

**Endpoint:** `POST /search/save-preferences`

**Request:**
```json
{
  "gender": "female",
  "ageMin": 22,
  "ageMax": 30,
  "heightMin": 150,
  "heightMax": 170,
  "maritalStatus": ["never_married"],
  "religion": ["hindu", "sikh"],
  "education": ["masters", "phd"],
  "occupation": ["doctor", "engineer"],
  "incomeMin": 500000,
  "locations": ["Delhi", "Mumbai"],
  "sortBy": "relevance"
}
```

**Response:**
```json
{
  "success": true,
  "status": 200,
  "message": "Search preferences saved",
  "data": null
}
```

---

## 6. Matches

### 6.1 Get Match Categories

**Endpoint:** `GET /matches/categories`

**Response:**
```json
{
  "success": true,
  "status": 200,
  "message": "Success",
  "data": [
    {
      "id": "new_matches",
      "name": "New Matches",
      "description": "Profiles joined in last 30 days",
      "icon": "Sparkles",
      "isPremium": false
    },
    {
      "id": "preferred_matches",
      "name": "Preferred Matches",
      "description": "Based on your preferences",
      "icon": "Heart",
      "isPremium": false
    },
    {
      "id": "nadi_matches",
      "name": "Nadi Match",
      "description": "Compatible Nadi (Kundali)",
      "icon": "Moon",
      "isPremium": true
    }
  ]
}
```

---

### 6.2 Get Matches by Category

**Endpoint:** `GET /matches/:category?page=1&limit=20`

**Categories:**
- `new_matches`
- `preferred_matches`
- `broader_matches`
- `similar_matches`
- `govt_matches`
- `army_officer_matches`
- `occupation_matches`
- `salary_matches`
- `location_matches`
- `education_matches`
- `manglik_matches`
- `shortlisted_profiles`
- `premium_matches`
- `nadi_matches`
- `highlighter_matches`
- `parent_settled_matches`
- `family_origin_matches`

**Response:**
```json
{
  "success": true,
  "status": 200,
  "message": "Success",
  "data": [
    {
      "profileId": "PM123ABC",
      "isPremiumRequired": false,
      "firstName": "Priya",
      "lastName": "Singh",
      "age": 25,
      "height": 165,
      "city": "Delhi",
      "education": "masters",
      "occupation": "doctor",
      "profilePhoto": "https://bucket.s3.amazonaws.com/...",
      "matchScore": 92
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

### 6.3 Get Match Score

**Endpoint:** `GET /matches/score/:profileId`

**Response:**
```json
{
  "success": true,
  "status": 200,
  "message": "Success",
  "data": {
    "profileId": "PM123ABC",
    "userId": "65e1f2a3b4c5678901234567",
    "totalScore": 85,
    "breakdown": {
      "ageScore": 10,
      "heightScore": 8,
      "educationScore": 10,
      "occupationScore": 9,
      "incomeScore": 8,
      "locationScore": 7,
      "religionScore": 10,
      "casteScore": 8,
      "manglikScore": 7,
      "familyScore": 8,
      "preferenceMatchScore": 10
    },
    "profile": {
      "firstName": "Priya",
      "lastName": "Singh",
      "age": 25,
      "height": 165,
      "city": "Delhi",
      "education": "masters",
      "occupation": "doctor",
      "religion": "hindu"
    }
  }
}
```

---

## 7. Activity

### 7.1 Send Interest

**Endpoint:** `POST /activity/interest`

**Request:**
```json
{
  "profileId": "PM123ABC",
  "message": "Hi, I liked your profile!"
}
```

**Response:**
```json
{
  "success": true,
  "status": 201,
  "message": "Interest sent successfully",
  "data": {
    "id": "65e1f2a3b4c5678901234567",
    "status": "pending",
    "message": "Hi, I liked your profile!",
    "createdAt": "2026-01-17T10:00:00.000Z",
    "dailyInterestRemaining": 7
  }
}
```

**Error Response (Daily Limit Reached):**
```json
{
  "success": false,
  "status": 403,
  "message": "Daily interest limit reached. Upgrade to premium for unlimited interests.",
  "error": {
    "code": "RATE_LIMIT_EXCEEDED"
  }
}
```

---

### 7.2 Accept Interest

**Endpoint:** `PUT /activity/interest/:interestId/accept`

**Response:**
```json
{
  "success": true,
  "status": 200,
  "message": "Interest accepted",
  "data": null
}
```

---

### 7.3 Decline Interest

**Endpoint:** `PUT /activity/interest/:interestId/decline`

**Response:**
```json
{
  "success": true,
  "status": 200,
  "message": "Interest declined",
  "data": null
}
```

---

### 7.4 Get Received Interests

**Endpoint:** `GET /activity/interests/received?status=pending&page=1&limit=20`

**Query Parameters:**
- `status`: `pending` | `accepted` | `declined` (optional)
- `page`: number (default: 1)
- `limit`: number (default: 20)

**Response:**
```json
{
  "success": true,
  "status": 200,
  "message": "Success",
  "data": [
    {
      "id": "65e1f2a3b4c5678901234567",
      "status": "pending",
      "message": "Hi, I liked your profile!",
      "createdAt": "2026-01-17T10:00:00.000Z",
      "profile": {
        "profileId": "PM123ABC",
        "lastName": "Sharma",
        "age": 29,
        "city": "Bangalore",
        "profilePhoto": "https://bucket.s3.amazonaws.com/..."
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 15,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

---

### 7.5 Get Sent Interests

**Endpoint:** `GET /activity/interests/sent?status=pending&page=1&limit=20`

**Response:** Same structure as Get Received Interests

---

### 7.6 Get Interest Limit Status

**Endpoint:** `GET /activity/interest-limit`

**Response:**
```json
{
  "success": true,
  "status": 200,
  "message": "Success",
  "data": {
    "dailyInterestRemaining": 7,
    "dailyInterestLimit": 10,
    "canSendInterest": true
  }
}
```

---

### 7.7 Shortlist Profile

**Endpoint:** `POST /activity/shortlist`

**Request:**
```json
{
  "profileId": "PM123ABC",
  "note": "Interested in this profile"
}
```

**Response:**
```json
{
  "success": true,
  "status": 201,
  "message": "Profile shortlisted",
  "data": null
}
```

---

### 7.8 Remove from Shortlist

**Endpoint:** `DELETE /activity/shortlist/:profileId`

**Response:**
```json
{
  "success": true,
  "status": 200,
  "message": "Profile removed from shortlist",
  "data": null
}
```

---

### 7.9 Get Shortlisted Profiles

**Endpoint:** `GET /activity/shortlist?page=1&limit=20`

**Response:**
```json
{
  "success": true,
  "status": 200,
  "message": "Success",
  "data": [
    {
      "id": "65e1f2a3b4c5678901234567",
      "profileId": "PM123ABC",
      "lastName": "Singh",
      "age": 25,
      "city": "Delhi",
      "profilePhoto": "https://bucket.s3.amazonaws.com/...",
      "note": "Interested in this profile",
      "shortlistedAt": "2026-01-17T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 8,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

---

### 7.10 Block Profile

**Endpoint:** `POST /activity/block`

**Request:**
```json
{
  "profileId": "PM123ABC",
  "reason": "Inappropriate messages"
}
```

**Response:**
```json
{
  "success": true,
  "status": 201,
  "message": "Profile blocked",
  "data": null
}
```

---

### 7.11 Unblock Profile

**Endpoint:** `DELETE /activity/block/:profileId`

**Response:**
```json
{
  "success": true,
  "status": 200,
  "message": "Profile unblocked",
  "data": null
}
```

---

### 7.12 Get Blocked Profiles

**Endpoint:** `GET /activity/blocked?page=1&limit=20`

**Response:**
```json
{
  "success": true,
  "status": 200,
  "message": "Success",
  "data": [
    {
      "profileId": "PM123ABC",
      "lastName": "Singh",
      "blockedAt": "2026-01-17T10:00:00.000Z",
      "reason": "Inappropriate messages"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 2,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

---

### 7.13 Get Connections

**Endpoint:** `GET /activity/connections?page=1&limit=20`

**Response:**
```json
{
  "success": true,
  "status": 200,
  "message": "Success",
  "data": [
    {
      "profileId": "PM123ABC",
      "lastName": "Singh",
      "age": 25,
      "city": "Delhi",
      "state": "Delhi",
      "education": "masters",
      "occupation": "doctor",
      "religion": "hindu",
      "profilePhoto": "https://bucket.s3.amazonaws.com/...",
      "connectedAt": "2026-01-17T10:00:00.000Z",
      "canMessage": true,
      "canSendPredefinedMessages": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 12,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

---

## 8. Chat & Messaging

### 8.1 Check If Can Chat

**Endpoint:** `GET /chat/can-chat/:profileId?messageType=predefined`

**Query Parameters:**
- `messageType`: `predefined` | `custom` (optional, default: `custom`)

**Response:**
```json
{
  "success": true,
  "status": 200,
  "message": "Success",
  "data": {
    "allowed": true,
    "reason": null
  }
}
```

**Error Response:**
```json
{
  "success": true,
  "status": 200,
  "message": "Success",
  "data": {
    "allowed": false,
    "reason": "Both users must accept interest before chatting"
  }
}
```

---

### 8.2 Get Predefined Messages

**Endpoint:** `GET /chat/predefined-messages`

**Response:**
```json
{
  "success": true,
  "status": 200,
  "message": "Success",
  "data": [
    "Hi, I liked your profile!",
    "Would you like to connect?",
    "I'm interested in knowing more about you.",
    "Hello, how are you?",
    "Your profile seems interesting.",
    "I would like to know you better.",
    "Hello, nice to meet you!",
    "I find your profile very appealing."
  ]
}
```

---

### 8.3 Get Chat List

**Endpoint:** `GET /chat`

**Response:**
```json
{
  "success": true,
  "status": 200,
  "message": "Success",
  "data": [
    {
      "id": "65e1f2a3b4c5678901234567",
      "participant": {
        "profileId": "PM123ABC",
        "firstName": "Priya",
        "lastName": "Singh",
        "profilePhoto": "https://bucket.s3.amazonaws.com/...",
        "isOnline": true,
        "hasViewedContact": true,
        "isConnected": true
      },
      "lastMessage": {
        "content": "Hi! How are you?",
        "createdAt": "2026-01-17T10:00:00.000Z",
        "status": "read"
      },
      "lastMessageAt": "2026-01-17T10:00:00.000Z",
      "unreadCount": 0
    }
  ]
}
```

---

### 8.4 Send Message

**Endpoint:** `POST /chat/:profileId/message`

**Request:**
```json
{
  "content": "Hi! How are you?",
  "messageType": "custom" // or "predefined"
}
```

**Response:**
```json
{
  "success": true,
  "status": 201,
  "message": "Message sent",
  "data": {
    "_id": "65e1f2a3b4c5678901234567",
    "chatId": "65e1f2a3b4c5678901234568",
    "senderId": "65e1f2a3b4c5678901234569",
    "receiverId": "65e1f2a3b4c5678901234570",
    "content": "Hi! How are you?",
    "messageType": "custom",
    "status": "sent",
    "createdAt": "2026-01-17T10:00:00.000Z"
  }
}
```

**Error Response (Premium Required):**
```json
{
  "success": false,
  "status": 403,
  "message": "Premium membership required for custom messages. You can send predefined messages instead.",
  "error": {
    "code": "PREMIUM_REQUIRED"
  }
}
```

**Error Response (Not Connected):**
```json
{
  "success": false,
  "status": 403,
  "message": "Both users must accept interest before chatting",
  "error": {
    "code": "INTEREST_REQUIRED"
  }
}
```

---

### 8.5 Get Chat Messages

**Endpoint:** `GET /chat/:chatId/messages?page=1&limit=50`

**Response:**
```json
{
  "success": true,
  "status": 200,
  "message": "Success",
  "data": [
    {
      "id": "65e1f2a3b4c5678901234567",
      "chatId": "65e1f2a3b4c5678901234568",
      "senderId": "65e1f2a3b4c5678901234569",
      "receiverId": "65e1f2a3b4c5678901234570",
      "content": "Hi! How are you?",
      "messageType": "custom",
      "status": "read",
      "createdAt": "2026-01-17T10:00:00.000Z",
      "isOwn": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 25,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

---

### 8.6 Mark Messages as Read

**Endpoint:** `PUT /chat/:chatId/read`

**Response:**
```json
{
  "success": true,
  "status": 200,
  "message": "Messages marked as read",
  "data": null
}
```

---

### 8.7 Delete Message

**Endpoint:** `DELETE /chat/message/:messageId`

**Response:**
```json
{
  "success": true,
  "status": 200,
  "message": "Message deleted",
  "data": null
}
```

---

### 8.8 Get Unread Count

**Endpoint:** `GET /chat/unread`

**Response:**
```json
{
  "success": true,
  "status": 200,
  "message": "Success",
  "data": {
    "unreadCount": 5
  }
}
```

---

## 9. Notifications

### 9.1 Get Notifications

**Endpoint:** `GET /notifications?page=1&limit=20&unreadOnly=false`

**Query Parameters:**
- `page`: number (default: 1)
- `limit`: number (default: 20)
- `unreadOnly`: boolean (default: false)

**Response:**
```json
{
  "success": true,
  "status": 200,
  "message": "Success",
  "data": [
    {
      "id": "65e1f2a3b4c5678901234567",
      "type": "interest_received",
      "title": "New Interest Received",
      "message": "Priya Singh sent you an interest",
      "data": {
        "fromUserId": "65e1f2a3b4c5678901234569",
        "profileId": "PM123ABC"
      },
      "isRead": false,
      "readAt": null,
      "createdAt": "2026-01-17T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  },
  "unreadCount": 12
}
```

**Notification Types:**
- `profile_view`
- `interest_received`
- `interest_accepted`
- `interest_declined`
- `new_message`
- `shortlisted`
- `photo_request`
- `membership_expiring`
- `membership_expired`
- `new_match`
- `profile_verified`
- `system`

---

### 9.2 Get Unread Count

**Endpoint:** `GET /notifications/unread-count`

**Response:**
```json
{
  "success": true,
  "status": 200,
  "message": "Success",
  "data": {
    "unreadCount": 12
  }
}
```

---

### 9.3 Mark Notification as Read

**Endpoint:** `PUT /notifications/:notificationId/read`

**Response:**
```json
{
  "success": true,
  "status": 200,
  "message": "Notification marked as read",
  "data": null
}
```

---

### 9.4 Mark All Notifications as Read

**Endpoint:** `PUT /notifications/read-all`

**Response:**
```json
{
  "success": true,
  "status": 200,
  "message": "All notifications marked as read",
  "data": null
}
```

---

### 9.5 Delete Notification

**Endpoint:** `DELETE /notifications/:notificationId`

**Response:**
```json
{
  "success": true,
  "status": 200,
  "message": "Notification deleted",
  "data": null
}
```

---

## 10. Kundali

### 10.1 Create Kundali

**Endpoint:** `POST /kundali`

**Request:**
```json
{
  "dateOfBirth": "1996-06-26",
  "timeOfBirth": "16:06",
  "placeOfBirth": "Bangalore",
  "latitude": 12.9716,
  "longitude": 77.5946,
  "timezone": 5.5
}
```

**Response:**
```json
{
  "success": true,
  "status": 201,
  "message": "Kundali created successfully",
  "data": {
    "id": "65e1f2a3b4c5678901234567",
    "userId": "65e1f2a3b4c5678901234569",
    "dateOfBirth": "1996-06-26",
    "timeOfBirth": "16:06",
    "placeOfBirth": "Bangalore",
    "rashi": "Kanya",
    "nakshatra": "Uttara Phalguni",
    "nadi": "Adi",
    "gana": "Manushya",
    "manglikStatus": "Partial Manglik",
    "manglikPercentage": 45
  }
}
```

---

### 10.2 Get Own Kundali

**Endpoint:** `GET /kundali`

**Response:**
```json
{
  "success": true,
  "status": 200,
  "message": "Success",
  "data": {
    "id": "65e1f2a3b4c5678901234567",
    "userId": "65e1f2a3b4c5678901234569",
    "dateOfBirth": "1996-06-26",
    "timeOfBirth": "16:06",
    "placeOfBirth": "Bangalore",
    "rashi": "Kanya",
    "nakshatra": "Uttara Phalguni",
    "nadi": "Adi",
    "gana": "Manushya",
    "manglikStatus": "Partial Manglik",
    "manglikPercentage": 45
  }
}
```

---

### 10.3 Get Kundali Match (Premium Only)

**Endpoint:** `GET /kundali/match/:profileId`

**Response:**
```json
{
  "success": true,
  "status": 200,
  "message": "Success",
  "data": {
    "totalScore": 32,
    "maxScore": 36,
    "percentage": 88.89,
    "varnaScore": {
      "score": 1,
      "max": 1,
      "description": "Varna compatibility is excellent"
    },
    "vasyaScore": {
      "score": 2,
      "max": 2,
      "description": "Vasya compatibility is perfect"
    },
    "taraScore": {
      "score": 3,
      "max": 3,
      "description": "Tara compatibility is excellent"
    },
    "yoniScore": {
      "score": 4,
      "max": 4,
      "description": "Yoni compatibility is perfect"
    },
    "grahaScore": {
      "score": 5,
      "max": 5,
      "description": "Graha compatibility is excellent"
    },
    "ganaScore": {
      "score": 6,
      "max": 6,
      "description": "Gana compatibility is perfect"
    },
    "bhakootScore": {
      "score": 7,
      "max": 7,
      "description": "Bhakoot compatibility is excellent"
    },
    "nadiScore": {
      "score": 8,
      "max": 8,
      "description": "Nadi compatibility is perfect"
    },
    "manglikCompatibility": {
      "compatible": true,
      "description": "Manglik compatibility is good"
    },
    "conclusion": "Excellent match with high compatibility",
    "recommendations": [
      "Both partners have compatible nadi",
      "Manglik status is compatible",
      "Overall match score is excellent"
    ]
  }
}
```

**Error Response (Premium Required):**
```json
{
  "success": false,
  "status": 403,
  "message": "Premium membership required for Kundali matching",
  "error": {
    "code": "PREMIUM_REQUIRED"
  }
}
```

---

## Error Codes

All error responses follow this structure:

```json
{
  "success": false,
  "status": 400,
  "message": "Error message",
  "error": {
    "code": "ERROR_CODE",
    "details": {
      "field": ["Error message for field"]
    }
  }
}
```

**Common Error Codes:**
- `BAD_REQUEST` - Invalid request
- `VALIDATION_ERROR` - Validation failed
- `UNAUTHORIZED` - Authentication required
- `AUTH_ERROR` - Authentication failed
- `FORBIDDEN` - Access denied
- `PREMIUM_REQUIRED` - Premium membership required
- `INTEREST_REQUIRED` - Interest must be accepted
- `CONTACT_LIMIT_REACHED` - Contact viewing limit reached
- `FEATURE_REQUIRED` - Feature not available
- `NOT_FOUND` - Resource not found
- `CONFLICT` - Resource conflict
- `DUPLICATE_KEY` - Duplicate entry
- `RATE_LIMIT_EXCEEDED` - Rate limit exceeded
- `OTP_RATE_LIMIT` - OTP rate limit exceeded
- `SERVER_ERROR` - Internal server error
- `INVALID_PREDEFINED_MESSAGE` - Invalid predefined message

---

## Authentication

All endpoints (except auth endpoints) require Bearer token authentication:

```
Authorization: Bearer <token>
```

Tokens are obtained from the `/auth/verify-otp` endpoint.

---

## Pagination

List endpoints support pagination with these query parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

Response includes pagination metadata:
```json
{
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## Image URLs

All image URLs are returned from AWS S3:
```
https://bucket-name.s3.ap-south-1.amazonaws.com/users/{userId}/photos/{uuid}.jpg
```

Always use the `url` field from API responses. Do not construct URLs manually.

---

**Last Updated:** 2026-01-17  
**Version:** 1.0

