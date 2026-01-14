# PahadiMatch - Frontend Integration Guide

Complete API integration guide for building web or mobile applications.

---

## 📋 Table of Contents

1. [Getting Started](#getting-started)
2. [Authentication Flow](#authentication-flow)
3. [Profile Management](#profile-management)
4. [Photo Management](#photo-management)
5. [Membership & Subscription](#membership--subscription)
6. [Search & Discovery](#search--discovery)
7. [Matchmaking](#matchmaking)
8. [Activity Center](#activity-center)
9. [Chat & Messaging](#chat--messaging)
10. [Kundali Matching](#kundali-matching)
11. [Notifications](#notifications)
12. [Error Handling](#error-handling)
13. [WebSocket Events](#websocket-events)

---

## Getting Started

### Base Configuration

```javascript
// API Configuration
const API_BASE_URL = 'http://localhost:3000/api';
const WS_URL = 'http://localhost:3000';

// Axios instance with interceptors
import axios from 'axios';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error);
  }
);
```

### Standard Response Format

All API responses follow this structure:

```typescript
interface ApiResponse<T> {
  success: boolean;
  status: number;
  message: string;
  data?: T;
  error?: {
    code?: string;
    details?: any;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  meta?: {
    timestamp: string;
  };
}
```

---

## Authentication Flow

### Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        NEW USER FLOW                            │
├─────────────────────────────────────────────────────────────────┤
│  Enter Phone → Send OTP → Verify OTP → Complete Profile → Home  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     EXISTING USER FLOW                          │
├─────────────────────────────────────────────────────────────────┤
│  Enter Phone → Send OTP → Verify OTP → Dashboard                │
└─────────────────────────────────────────────────────────────────┘
```

### 1. Send OTP

**Request:**
```http
POST /api/auth/send-otp
Content-Type: application/json

{
  "phone": "9876543210",
  "purpose": "signup" | "login"
}
```

**Response (Success):**
```json
{
  "success": true,
  "status": 200,
  "message": "OTP sent successfully",
  "data": null,
  "meta": {
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

**Response (Error - Already Registered):**
```json
{
  "success": false,
  "status": 400,
  "message": "Phone number already registered. Please login.",
  "error": {
    "code": "BAD_REQUEST"
  }
}
```

**Frontend Code:**
```typescript
async function sendOtp(phone: string, purpose: 'signup' | 'login') {
  try {
    const response = await api.post('/auth/send-otp', { phone, purpose });
    return { success: true, message: response.message };
  } catch (error) {
    return { success: false, message: error.message };
  }
}
```

### 2. Verify OTP

**Request:**
```http
POST /api/auth/verify-otp
Content-Type: application/json

{
  "phone": "9876543210",
  "otp": "123456",
  "purpose": "signup" | "login"
}
```

**Response (Signup Success):**
```json
{
  "success": true,
  "status": 201,
  "message": "Signup successful",
  "data": {
    "user": {
      "id": "65a1b2c3d4e5f6789012345",
      "profileId": "PM7K8L9M0N",
      "phone": "+919876543210",
      "isPhoneVerified": true,
      "isProfileComplete": false
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "isNewUser": true
  }
}
```

**Response (Login Success):**
```json
{
  "success": true,
  "status": 200,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "65a1b2c3d4e5f6789012345",
      "profileId": "PM7K8L9M0N",
      "phone": "+919876543210",
      "isPhoneVerified": true,
      "isProfileComplete": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "isProfileComplete": true
  }
}
```

**Frontend Code:**
```typescript
interface AuthResponse {
  user: {
    id: string;
    profileId: string;
    phone: string;
    isProfileComplete: boolean;
  };
  token: string;
  isNewUser?: boolean;
  isProfileComplete?: boolean;
}

async function verifyOtp(phone: string, otp: string, purpose: 'signup' | 'login'): Promise<AuthResponse> {
  const response = await api.post('/auth/verify-otp', { phone, otp, purpose });
  
  // Store token
  localStorage.setItem('authToken', response.data.token);
  localStorage.setItem('user', JSON.stringify(response.data.user));
  
  return response.data;
}

// After verification, check where to redirect
function handlePostAuth(authData: AuthResponse) {
  if (authData.isNewUser || !authData.isProfileComplete) {
    // Redirect to profile completion
    navigate('/complete-profile');
  } else {
    // Redirect to dashboard
    navigate('/dashboard');
  }
}
```

### 3. Get Current User

**Request:**
```http
GET /api/auth/me
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "status": 200,
  "message": "Success",
  "data": {
    "id": "65a1b2c3d4e5f6789012345",
    "profileId": "PM7K8L9M0N",
    "phone": "+919876543210",
    "isPhoneVerified": true,
    "isProfileComplete": true,
    "lastLogin": "2024-01-15T10:30:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 4. Change Phone Number

**Step 1 - Initiate Change:**
```http
POST /api/auth/change-phone
Authorization: Bearer <token>

{
  "newPhone": "9876543211"
}
```

**Step 2 - Verify New Phone:**
```http
POST /api/auth/verify-phone-change
Authorization: Bearer <token>

{
  "newPhone": "9876543211",
  "otp": "123456"
}
```

---

## Profile Management

### Profile Data Model

```typescript
interface Profile {
  // Basic Info
  firstName: string;
  lastName: string;
  gender: 'male' | 'female';
  dateOfBirth: string; // YYYY-MM-DD
  age: number; // Calculated
  
  // Physical
  height: number; // cm
  weight?: number;
  bodyType?: string;
  complexion?: string;
  
  // Personal
  maritalStatus: 'never_married' | 'divorced' | 'widowed' | 'awaiting_divorce';
  motherTongue?: string;
  religion: 'hindu' | 'muslim' | 'christian' | 'sikh' | 'buddhist' | 'jain' | 'other';
  caste?: string;
  subCaste?: string;
  gothra?: string;
  manglik?: 'yes' | 'no' | 'partial' | 'dont_know';
  
  // Education & Career
  education: 'high_school' | 'diploma' | 'bachelors' | 'masters' | 'phd' | 'professional';
  educationDetail?: string;
  college?: string;
  occupation: 'government' | 'private' | 'business' | 'self_employed' | 'army' | 'doctor' | 'engineer' | 'teacher' | 'lawyer' | 'other';
  occupationDetail?: string;
  company?: string;
  income: number; // Annual in INR
  
  // Location
  city: string;
  state: string;
  country: string;
  
  // Family
  familyType?: 'joint' | 'nuclear';
  familyStatus?: 'middle_class' | 'upper_middle_class' | 'rich' | 'affluent';
  fatherOccupation?: string;
  motherOccupation?: string;
  siblings?: number;
  
  // Lifestyle
  diet?: 'vegetarian' | 'non_vegetarian' | 'eggetarian' | 'vegan';
  smoking?: 'yes' | 'no' | 'occasionally';
  drinking?: 'yes' | 'no' | 'occasionally';
  
  // About
  aboutMe?: string;
  hobbies?: string[];
}
```

### 1. Create/Update Profile

**Request:**
```http
POST /api/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "gender": "male",
  "dateOfBirth": "1995-05-15",
  "height": 175,
  "weight": 70,
  "maritalStatus": "never_married",
  "religion": "hindu",
  "caste": "Brahmin",
  "manglik": "no",
  "education": "bachelors",
  "educationDetail": "B.Tech Computer Science",
  "college": "IIT Delhi",
  "occupation": "engineer",
  "occupationDetail": "Software Engineer",
  "company": "Google",
  "income": 2500000,
  "city": "Bangalore",
  "state": "Karnataka",
  "country": "India",
  "familyType": "nuclear",
  "familyStatus": "upper_middle_class",
  "fatherOccupation": "Retired Government",
  "motherOccupation": "Homemaker",
  "siblings": 1,
  "diet": "vegetarian",
  "smoking": "no",
  "drinking": "occasionally",
  "aboutMe": "Looking for a life partner who values family and career equally.",
  "hobbies": ["reading", "traveling", "photography"]
}
```

**Response:**
```json
{
  "success": true,
  "status": 200,
  "message": "Profile updated successfully",
  "data": {
    "profileId": "PM7K8L9M0N",
    "firstName": "John",
    "lastName": "Doe",
    "gender": "male",
    "age": 28,
    "profileCompleteness": 85,
    // ... all profile fields
  }
}
```

**Frontend Code:**
```typescript
async function createProfile(profileData: Partial<Profile>) {
  const response = await api.post('/profile', profileData);
  return response.data;
}

// Profile completion form component
function ProfileCompletionForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});
  
  const steps = [
    { title: 'Basic Info', fields: ['firstName', 'lastName', 'gender', 'dateOfBirth'] },
    { title: 'Education & Career', fields: ['education', 'occupation', 'income'] },
    { title: 'Location', fields: ['city', 'state'] },
    { title: 'Family', fields: ['familyType', 'fatherOccupation'] },
    { title: 'About You', fields: ['aboutMe', 'hobbies'] },
  ];
  
  async function handleSubmit() {
    await createProfile(formData);
    navigate('/dashboard');
  }
}
```

### 2. Get Own Profile

**Request:**
```http
GET /api/profile
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "status": 200,
  "message": "Success",
  "data": {
    "userId": "65a1b2c3d4e5f6789012345",
    "firstName": "John",
    "lastName": "Doe",
    "gender": "male",
    "age": 28,
    "height": 175,
    "maritalStatus": "never_married",
    "religion": "hindu",
    "education": "bachelors",
    "occupation": "engineer",
    "income": 2500000,
    "city": "Bangalore",
    "state": "Karnataka",
    "profileCompleteness": 85,
    "isVerified": false,
    "lastActive": "2024-01-15T10:30:00.000Z",
    "privacySettings": {
      "phonePrivate": true,
      "photosPrivate": false,
      "incomePrivate": false
    },
    "preferences": {
      "ageMin": 24,
      "ageMax": 30,
      "religion": ["hindu"],
      "education": ["bachelors", "masters"]
    }
  }
}
```

### 3. View Another Profile

**Request:**
```http
GET /api/profile/PM7K8L9M0N
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "status": 200,
  "message": "Success",
  "data": {
    "profileId": "PM7K8L9M0N",
    "firstName": "Jane",
    "lastName": "D",
    "gender": "female",
    "age": 26,
    "height": 165,
    "maritalStatus": "never_married",
    "religion": "hindu",
    "caste": "Brahmin",
    "education": "masters",
    "occupation": "doctor",
    "city": "Mumbai",
    "state": "Maharashtra",
    "aboutMe": "A doctor by profession...",
    "phone": "98******10",
    "phoneLocked": true,
    "income": null,
    "incomeLocked": true,
    "photos": [
      { "url": "https://cloudinary.com/...", "isProfilePhoto": true }
    ],
    "photosLocked": false,
    "profileCompleteness": 90,
    "isVerified": true,
    "lastActive": "2024-01-15T09:00:00.000Z"
  }
}
```

### 4. Update Privacy Settings

**Request:**
```http
PUT /api/profile/privacy
Authorization: Bearer <token>

{
  "phonePrivate": true,
  "photosPrivate": false,
  "incomePrivate": true
}
```

### 5. Update Partner Preferences

**Request:**
```http
PUT /api/profile/preferences
Authorization: Bearer <token>

{
  "ageMin": 24,
  "ageMax": 30,
  "heightMin": 155,
  "heightMax": 175,
  "religion": ["hindu"],
  "caste": ["Brahmin", "Kshatriya"],
  "education": ["bachelors", "masters", "phd"],
  "occupation": ["engineer", "doctor", "government"],
  "incomeMin": 1000000,
  "locations": ["Karnataka", "Tamil Nadu", "Maharashtra"]
}
```

### 6. Get Profile Views (Who Viewed Me)

**Request:**
```http
GET /api/profile/views?page=1&limit=20
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "status": 200,
  "message": "Success",
  "data": [
    {
      "profileId": "PM1A2B3C4D",
      "firstName": "Jane",
      "lastName": "D",
      "age": 26,
      "city": "Mumbai",
      "viewCount": 3,
      "lastViewedAt": "2024-01-15T10:00:00.000Z"
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

## Photo Management

### Photo Constraints

```typescript
const PHOTO_CONSTRAINTS = {
  maxFileSize: 8 * 1024 * 1024, // 8MB
  allowedTypes: ['image/jpeg', 'image/jpg', 'image/png'],
  minPhotos: 5,
  maxPhotos: 10,
};
```

### 1. Upload Photo

**Request:**
```http
POST /api/photos/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

photo: <binary file>
isProfilePhoto: "true" | "false"
isPrivate: "true" | "false"
```

**Response:**
```json
{
  "success": true,
  "status": 201,
  "message": "Photo uploaded successfully",
  "data": {
    "id": "65b1c2d3e4f5678901234567",
    "url": "https://res.cloudinary.com/pahadimatch/image/upload/...",
    "isProfilePhoto": true,
    "isPrivate": false,
    "order": 0,
    "isApproved": true,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Frontend Code:**
```typescript
async function uploadPhoto(file: File, isProfilePhoto = false, isPrivate = false) {
  const formData = new FormData();
  formData.append('photo', file);
  formData.append('isProfilePhoto', String(isProfilePhoto));
  formData.append('isPrivate', String(isPrivate));
  
  const response = await api.post('/photos/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  
  return response.data;
}

// React component
function PhotoUpload() {
  const [photos, setPhotos] = useState([]);
  
  async function handleFileSelect(e) {
    const file = e.target.files[0];
    
    // Validate
    if (file.size > PHOTO_CONSTRAINTS.maxFileSize) {
      alert('File size must be less than 8MB');
      return;
    }
    
    if (!PHOTO_CONSTRAINTS.allowedTypes.includes(file.type)) {
      alert('Only JPG and PNG files allowed');
      return;
    }
    
    const uploaded = await uploadPhoto(file);
    setPhotos([...photos, uploaded]);
  }
}
```

### 2. Get My Photos

**Request:**
```http
GET /api/photos
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "status": 200,
  "message": "Success",
  "data": [
    {
      "id": "65b1c2d3e4f5678901234567",
      "url": "https://res.cloudinary.com/...",
      "isProfilePhoto": true,
      "isPrivate": false,
      "order": 0,
      "isApproved": true,
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### 3. Check Photo Requirements

**Request:**
```http
GET /api/photos/requirements
Authorization: Bearer <token>
```

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
    "remaining": 7
  }
}
```

### 4. Set Profile Photo

**Request:**
```http
PUT /api/photos/:photoId/profile
Authorization: Bearer <token>
```

### 5. Toggle Photo Privacy

**Request:**
```http
PUT /api/photos/:photoId/privacy
Authorization: Bearer <token>
```

### 6. Reorder Photos

**Request:**
```http
PUT /api/photos/reorder
Authorization: Bearer <token>

{
  "photoOrder": ["photoId1", "photoId2", "photoId3"]
}
```

### 7. Delete Photo

**Request:**
```http
DELETE /api/photos/:photoId
Authorization: Bearer <token>
```

---

## Membership & Subscription

### Plans Data

```typescript
const MEMBERSHIP_PLANS = {
  free: {
    name: 'Free',
    price: 0,
    discountedPrice: 0,
    contactsAllowed: 5,
    validityDays: 365,
    features: {
      viewContacts: false,
      unlimitedInterests: false,
      messaging: false,
      viewPrivatePhotos: false,
      priorityListing: false,
    },
  },
  silver: {
    name: 'Silver Membership',
    price: 2500,
    discountedPrice: 2300,
    contactsAllowed: 40,
    validityDays: 180,
    features: {
      viewContacts: true,
      unlimitedInterests: false,
      messaging: true,
      viewPrivatePhotos: true,
      priorityListing: false,
    },
  },
  gold: {
    name: 'Gold Membership',
    price: 4000,
    discountedPrice: 2500,
    contactsAllowed: 100,
    validityDays: 270,
    features: {
      viewContacts: true,
      unlimitedInterests: true,
      messaging: true,
      viewPrivatePhotos: true,
      priorityListing: false,
    },
  },
  platinum: {
    name: 'Platinum Membership',
    price: 5000,
    discountedPrice: 3000,
    contactsAllowed: 150,
    validityDays: 365,
    features: {
      viewContacts: true,
      unlimitedInterests: true,
      messaging: true,
      viewPrivatePhotos: true,
      priorityListing: true,
    },
  },
};
```

### 1. Get Available Plans

**Request:**
```http
GET /api/membership/plans
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "status": 200,
  "message": "Success",
  "data": [
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

### 2. Get Membership Summary

**Request:**
```http
GET /api/membership/summary
Authorization: Bearer <token>
```

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
    "expiresAt": "2024-10-15T00:00:00.000Z",
    "contactsUsed": 45,
    "contactsAllowed": 100,
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

### 3. Purchase Membership

**Request:**
```http
POST /api/membership/purchase
Authorization: Bearer <token>

{
  "plan": "gold",
  "paymentId": "pay_OBKz1234567890",
  "paymentMethod": "razorpay"
}
```

**Response:**
```json
{
  "success": true,
  "status": 201,
  "message": "Membership purchased successfully",
  "data": {
    "id": "65c1d2e3f4a5678901234567",
    "plan": "gold",
    "startDate": "2024-01-15T00:00:00.000Z",
    "endDate": "2024-10-15T00:00:00.000Z",
    "isActive": true,
    "contactsUsed": 0,
    "contactsAllowed": 100,
    "amount": 4000,
    "discountedAmount": 2500
  }
}
```

**Frontend Code (Razorpay Integration):**
```typescript
async function purchaseMembership(plan: string) {
  // 1. Create Razorpay order (you'd need a backend endpoint for this)
  const order = await api.post('/payment/create-order', { plan });
  
  // 2. Open Razorpay checkout
  const options = {
    key: 'your_razorpay_key',
    amount: order.amount,
    currency: 'INR',
    order_id: order.id,
    handler: async function (response) {
      // 3. Verify payment and activate membership
      await api.post('/membership/purchase', {
        plan,
        paymentId: response.razorpay_payment_id,
        paymentMethod: 'razorpay',
      });
      
      // 4. Refresh membership status
      await fetchMembershipSummary();
    },
  };
  
  const razorpay = new window.Razorpay(options);
  razorpay.open();
}
```

### 4. View Contact (Uses Contact Quota)

**Request:**
```http
POST /api/membership/view-contact
Authorization: Bearer <token>

{
  "profileId": "PM7K8L9M0N"
}
```

**Response (Success):**
```json
{
  "success": true,
  "status": 200,
  "message": "Contact viewed",
  "data": {
    "success": true,
    "contactsRemaining": 54
  }
}
```

**Response (Limit Reached):**
```json
{
  "success": false,
  "status": 403,
  "message": "Contact view limit reached. Please upgrade your membership.",
  "error": {
    "code": "CONTACT_LIMIT_REACHED"
  }
}
```

---

## Search & Discovery

### 1. Search Profiles

**Request:**
```http
GET /api/search?gender=female&ageMin=24&ageMax=30&religion=hindu&education=bachelors,masters&city=Bangalore&page=1&limit=20&sortBy=relevance
Authorization: Bearer <token>
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| gender | string | male, female |
| ageMin | number | Minimum age |
| ageMax | number | Maximum age |
| heightMin | number | Min height (cm) |
| heightMax | number | Max height (cm) |
| maritalStatus | string | Comma-separated: never_married,divorced |
| religion | string | Comma-separated values |
| caste | string | Comma-separated values |
| manglik | string | yes,no,partial,dont_know |
| education | string | Comma-separated values |
| occupation | string | Comma-separated values |
| incomeMin | number | Minimum income |
| incomeMax | number | Maximum income |
| locations | string | Comma-separated states |
| city | string | City name |
| state | string | State name |
| motherTongue | string | Comma-separated values |
| isVerified | boolean | Only verified profiles |
| hasPhotos | boolean | Only with photos |
| isPremium | boolean | Only premium members |
| page | number | Page number (default: 1) |
| limit | number | Items per page (max: 50) |
| sortBy | string | relevance, newest, lastActive |

**Response:**
```json
{
  "success": true,
  "status": 200,
  "message": "Success",
  "data": [
    {
      "profileId": "PM1A2B3C4D",
      "firstName": "Jane",
      "lastName": "D",
      "age": 26,
      "height": 165,
      "city": "Mumbai",
      "state": "Maharashtra",
      "education": "masters",
      "occupation": "doctor",
      "religion": "hindu",
      "caste": "Brahmin",
      "isVerified": true,
      "lastActive": "2024-01-15T10:00:00.000Z"
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

**Frontend Code:**
```typescript
interface SearchFilters {
  gender?: string;
  ageMin?: number;
  ageMax?: number;
  religion?: string[];
  education?: string[];
  // ... etc
}

async function searchProfiles(filters: SearchFilters, page = 1, limit = 20) {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined) {
      if (Array.isArray(value)) {
        params.append(key, value.join(','));
      } else {
        params.append(key, String(value));
      }
    }
  });
  
  params.append('page', String(page));
  params.append('limit', String(limit));
  
  const response = await api.get(`/search?${params.toString()}`);
  return response;
}
```

### 2. Save Search Preferences

**Request:**
```http
POST /api/search/save-preferences
Authorization: Bearer <token>

{
  "ageMin": 24,
  "ageMax": 30,
  "religion": ["hindu"],
  "education": ["bachelors", "masters"]
}
```

---

## Matchmaking

### Match Categories

```typescript
const MATCH_CATEGORIES = [
  { id: 'new_matches', name: 'New Matches', description: 'Profiles joined in last 30 days' },
  { id: 'preferred_matches', name: 'Preferred Matches', description: 'Based on your preferences' },
  { id: 'broader_matches', name: 'Broader Matches', description: 'Relaxed criteria matches' },
  { id: 'similar_matches', name: 'Similar Matches', description: 'Same education/occupation' },
  { id: 'govt_matches', name: 'Government Job', description: 'Government employees' },
  { id: 'army_officer_matches', name: 'Army Officers', description: 'Defense personnel' },
  { id: 'occupation_matches', name: 'Same Occupation', description: 'Your occupation category' },
  { id: 'salary_matches', name: 'Salary Matches', description: 'Income range matches' },
  { id: 'location_matches', name: 'Nearby', description: 'Same city/state' },
  { id: 'education_matches', name: 'Education', description: 'Same education level' },
  { id: 'manglik_matches', name: 'Manglik', description: 'Compatible manglik status' },
  { id: 'shortlisted_profiles', name: 'Shortlisted', description: 'Profiles you shortlisted' },
  { id: 'premium_matches', name: 'Premium', description: 'Premium members only' },
  { id: 'nadi_matches', name: 'Nadi Match', description: 'Compatible Nadi (Kundali)' },
];
```

### 1. Get Match Categories

**Request:**
```http
GET /api/matches/categories
Authorization: Bearer <token>
```

### 2. Get Matches by Category

**Request:**
```http
GET /api/matches/preferred_matches?page=1&limit=20
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "status": 200,
  "message": "Success",
  "data": [
    {
      "profileId": "PM1A2B3C4D",
      "firstName": "Jane",
      "lastName": "D",
      "age": 26,
      "height": 165,
      "city": "Mumbai",
      "state": "Maharashtra",
      "education": "masters",
      "occupation": "doctor",
      "religion": "hindu",
      "isVerified": true,
      "lastActive": "2024-01-15T10:00:00.000Z"
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

### 3. Get Match Score

**Request:**
```http
GET /api/matches/score/PM1A2B3C4D
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "status": 200,
  "message": "Success",
  "data": {
    "profileId": "PM1A2B3C4D",
    "userId": "65a1b2c3d4e5f6789012345",
    "totalScore": 78.5,
    "breakdown": {
      "ageScore": 1.0,
      "heightScore": 0.8,
      "educationScore": 1.0,
      "occupationScore": 0.7,
      "incomeScore": 0.9,
      "locationScore": 0.6,
      "religionScore": 1.0,
      "casteScore": 1.0,
      "manglikScore": 0.7,
      "familyScore": 0.8,
      "preferenceMatchScore": 0.85
    },
    "profile": {
      "firstName": "Jane",
      "lastName": "D",
      "age": 26,
      "height": 165,
      "city": "Mumbai",
      "education": "masters",
      "occupation": "doctor",
      "religion": "hindu"
    }
  }
}
```

---

## Activity Center

### 1. Send Interest

**Request:**
```http
POST /api/activity/interest
Authorization: Bearer <token>

{
  "profileId": "PM1A2B3C4D",
  "message": "Hi! I found your profile interesting."
}
```

**Response:**
```json
{
  "success": true,
  "status": 201,
  "message": "Interest sent successfully",
  "data": {
    "id": "65d1e2f3a4b5678901234567",
    "status": "pending",
    "message": "Hi! I found your profile interesting.",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 2. Accept/Decline Interest

**Accept:**
```http
PUT /api/activity/interest/:interestId/accept
Authorization: Bearer <token>
```

**Decline:**
```http
PUT /api/activity/interest/:interestId/decline
Authorization: Bearer <token>
```

### 3. Get Received Interests

**Request:**
```http
GET /api/activity/interests/received?status=pending&page=1&limit=20
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "status": 200,
  "message": "Success",
  "data": [
    {
      "id": "65d1e2f3a4b5678901234567",
      "status": "pending",
      "message": "Hi! I found your profile interesting.",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "profile": {
        "profileId": "PM5E6F7G8H",
        "firstName": "John",
        "lastName": "D",
        "age": 28,
        "city": "Bangalore"
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

### 4. Get Sent Interests

**Request:**
```http
GET /api/activity/interests/sent?status=accepted&page=1&limit=20
Authorization: Bearer <token>
```

### 5. Shortlist Profile

**Request:**
```http
POST /api/activity/shortlist
Authorization: Bearer <token>

{
  "profileId": "PM1A2B3C4D",
  "note": "Good match, doctor in Mumbai"
}
```

### 6. Remove from Shortlist

**Request:**
```http
DELETE /api/activity/shortlist/PM1A2B3C4D
Authorization: Bearer <token>
```

### 7. Get Shortlisted Profiles

**Request:**
```http
GET /api/activity/shortlist?page=1&limit=20
Authorization: Bearer <token>
```

### 8. Block Profile

**Request:**
```http
POST /api/activity/block
Authorization: Bearer <token>

{
  "profileId": "PM1A2B3C4D",
  "reason": "Inappropriate messages"
}
```

### 9. Unblock Profile

**Request:**
```http
DELETE /api/activity/block/PM1A2B3C4D
Authorization: Bearer <token>
```

### 10. Get Blocked Profiles

**Request:**
```http
GET /api/activity/blocked?page=1&limit=20
Authorization: Bearer <token>
```

---

## Chat & Messaging

### Chat Permission Rules

1. Both users must have **accepted interest** (mutual connection)
2. At least one user must have **premium membership**
3. Neither user should be **blocked**

### 1. Check If Can Chat

**Request:**
```http
GET /api/chat/can-chat/PM1A2B3C4D
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "status": 200,
  "message": "Success",
  "data": {
    "allowed": true
  }
}
```

**OR**
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

### 2. Get Chat List

**Request:**
```http
GET /api/chat
Authorization: Bearer <token>
```

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
        "profileId": "PM1A2B3C4D",
        "firstName": "Jane",
        "lastName": "D"
      },
      "lastMessage": {
        "content": "Hi! How are you?",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "status": "read"
      },
      "lastMessageAt": "2024-01-15T10:30:00.000Z",
      "unreadCount": 0
    }
  ]
}
```

### 3. Send Message

**Request:**
```http
POST /api/chat/PM1A2B3C4D/message
Authorization: Bearer <token>

{
  "content": "Hi! How are you?"
}
```

**Response:**
```json
{
  "success": true,
  "status": 201,
  "message": "Message sent",
  "data": {
    "id": "65f1a2b3c4d5678901234567",
    "chatId": "65e1f2a3b4c5678901234567",
    "senderId": "65a1b2c3d4e5f6789012345",
    "receiverId": "65b2c3d4e5f6789012345678",
    "content": "Hi! How are you?",
    "status": "sent",
    "createdAt": "2024-01-15T10:35:00.000Z"
  }
}
```

### 4. Get Chat Messages

**Request:**
```http
GET /api/chat/:chatId/messages?page=1&limit=50
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "status": 200,
  "message": "Success",
  "data": [
    {
      "id": "65f1a2b3c4d5678901234567",
      "chatId": "65e1f2a3b4c5678901234567",
      "senderId": "65a1b2c3d4e5f6789012345",
      "receiverId": "65b2c3d4e5f6789012345678",
      "content": "Hi! How are you?",
      "status": "read",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 100,
    "totalPages": 2,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### 5. Mark Messages as Read

**Request:**
```http
PUT /api/chat/:chatId/read
Authorization: Bearer <token>
```

### 6. Delete Message

**Request:**
```http
DELETE /api/chat/message/:messageId
Authorization: Bearer <token>
```

### 7. Get Unread Count

**Request:**
```http
GET /api/chat/unread
Authorization: Bearer <token>
```

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

## Kundali Matching

### 1. Create Kundali

**Request:**
```http
POST /api/kundali
Authorization: Bearer <token>

{
  "dateOfBirth": "1995-05-15",
  "timeOfBirth": "10:30",
  "placeOfBirth": "Delhi",
  "latitude": 28.6139,
  "longitude": 77.2090,
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
    "id": "65g1h2i3j4k5678901234567",
    "userId": "65a1b2c3d4e5f6789012345",
    "dateOfBirth": "1995-05-15",
    "timeOfBirth": "10:30",
    "placeOfBirth": "Delhi",
    "rashi": "Taurus",
    "nakshatra": "Rohini",
    "nadi": "Aadi",
    "gana": "Manushya",
    "manglikStatus": "No",
    "manglikPercentage": 0
  }
}
```

### 2. Get Kundali

**Request:**
```http
GET /api/kundali
Authorization: Bearer <token>
```

### 3. Get Kundali Match (Premium Only)

**Request:**
```http
GET /api/kundali/match/PM1A2B3C4D
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "status": 200,
  "message": "Success",
  "data": {
    "totalScore": 28,
    "maxScore": 36,
    "percentage": 77.78,
    "varnaScore": { "score": 1, "max": 1, "description": "Compatible" },
    "vasyaScore": { "score": 2, "max": 2, "description": "Good control" },
    "taraScore": { "score": 3, "max": 3, "description": "Auspicious" },
    "yoniScore": { "score": 4, "max": 4, "description": "Compatible" },
    "grahaScore": { "score": 4, "max": 5, "description": "Good mental compatibility" },
    "ganaScore": { "score": 6, "max": 6, "description": "Same temperament" },
    "bhakootScore": { "score": 5, "max": 7, "description": "Good love compatibility" },
    "nadiScore": { "score": 8, "max": 8, "description": "Different Nadi - Excellent" },
    "manglikCompatibility": {
      "compatible": true,
      "description": "Neither is Manglik - Compatible"
    },
    "conclusion": "Good Match - Recommended",
    "recommendations": [
      "Auspicious match - Can proceed with marriage"
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

## Notifications

### 1. Get Notifications

**Request:**
```http
GET /api/notifications?page=1&limit=20&unreadOnly=false
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "status": 200,
  "message": "Success",
  "data": [
    {
      "id": "65h1i2j3k4l5678901234567",
      "type": "interest_received",
      "title": "New Interest",
      "message": "Jane expressed interest in your profile",
      "data": {
        "fromUserId": "65b2c3d4e5f6789012345678",
        "profileId": "PM1A2B3C4D"
      },
      "isRead": false,
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    {
      "id": "65h1i2j3k4l5678901234568",
      "type": "profile_view",
      "title": "Profile Viewed",
      "message": "Someone viewed your profile",
      "data": {
        "fromUserId": "65c3d4e5f6789012345678ab",
        "profileId": "PM5E6F7G8H"
      },
      "isRead": true,
      "readAt": "2024-01-15T11:00:00.000Z",
      "createdAt": "2024-01-15T10:00:00.000Z"
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

### Notification Types

```typescript
type NotificationType = 
  | 'profile_view'      // Someone viewed your profile
  | 'interest_received' // Someone sent you interest
  | 'interest_accepted' // Your interest was accepted
  | 'interest_declined' // Your interest was declined
  | 'new_message'       // New chat message
  | 'shortlisted'       // Someone shortlisted you
  | 'photo_request'     // Someone requested photo access
  | 'membership_expiring' // Membership about to expire
  | 'membership_expired'  // Membership expired
  | 'new_match'         // New profile matching preferences
  | 'profile_verified'  // Your profile was verified
  | 'system';           // System announcement
```

### 2. Get Unread Count

**Request:**
```http
GET /api/notifications/unread-count
Authorization: Bearer <token>
```

### 3. Mark as Read

**Request:**
```http
PUT /api/notifications/:notificationId/read
Authorization: Bearer <token>
```

### 4. Mark All as Read

**Request:**
```http
PUT /api/notifications/read-all
Authorization: Bearer <token>
```

### 5. Delete Notification

**Request:**
```http
DELETE /api/notifications/:notificationId
Authorization: Bearer <token>
```

---

## Error Handling

### Error Response Format

```typescript
interface ErrorResponse {
  success: false;
  status: number;
  message: string;
  error: {
    code: string;
    details?: any;
  };
  meta: {
    timestamp: string;
  };
}
```

### Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `BAD_REQUEST` | 400 | Invalid request data |
| `VALIDATION_ERROR` | 422 | Input validation failed |
| `UNAUTHORIZED` | 401 | Authentication required |
| `AUTH_ERROR` | 401 | Invalid/expired token |
| `FORBIDDEN` | 403 | Access denied |
| `PREMIUM_REQUIRED` | 403 | Requires premium membership |
| `INTEREST_REQUIRED` | 403 | Interest must be accepted |
| `CONTACT_LIMIT_REACHED` | 403 | Contact view limit reached |
| `FEATURE_REQUIRED` | 403 | Feature not available |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource already exists |
| `DUPLICATE_KEY` | 409 | Duplicate entry |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `OTP_RATE_LIMIT` | 429 | Too many OTP requests |
| `SERVER_ERROR` | 500 | Internal server error |

### Frontend Error Handling

```typescript
function handleApiError(error: any) {
  const errorCode = error.error?.code;
  
  switch (errorCode) {
    case 'UNAUTHORIZED':
    case 'AUTH_ERROR':
      // Redirect to login
      localStorage.removeItem('authToken');
      navigate('/login');
      break;
      
    case 'PREMIUM_REQUIRED':
      // Show upgrade modal
      showUpgradeModal();
      break;
      
    case 'CONTACT_LIMIT_REACHED':
      // Show upgrade or contact limit message
      showContactLimitModal();
      break;
      
    case 'INTEREST_REQUIRED':
      // Show interest required message
      showToast('You need to connect with this profile first');
      break;
      
    case 'RATE_LIMIT_EXCEEDED':
    case 'OTP_RATE_LIMIT':
      // Show rate limit message
      showToast('Too many requests. Please wait.');
      break;
      
    case 'VALIDATION_ERROR':
      // Show validation errors
      const details = error.error?.details;
      showValidationErrors(details);
      break;
      
    default:
      // Generic error
      showToast(error.message || 'Something went wrong');
  }
}
```

---

## WebSocket Events

### Connection Setup

```typescript
import { io, Socket } from 'socket.io-client';

const socket: Socket = io('http://localhost:3000', {
  auth: {
    token: localStorage.getItem('authToken'),
  },
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

// Connection events
socket.on('connect', () => {
  console.log('Connected to WebSocket');
});

socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
});

socket.on('error', (error) => {
  console.error('Socket error:', error);
});
```

### Chat Events

```typescript
// Join a chat room
socket.emit('join_chat', chatId);

// Leave a chat room
socket.emit('leave_chat', chatId);

// Send a message
socket.emit('send_message', {
  receiverProfileId: 'PM1A2B3C4D',
  content: 'Hello!',
});

// Typing indicator
socket.emit('typing', {
  chatId: 'chat_id',
  receiverProfileId: 'PM1A2B3C4D',
});

// Stop typing
socket.emit('stop_typing', {
  chatId: 'chat_id',
  receiverProfileId: 'PM1A2B3C4D',
});

// Mark as read
socket.emit('mark_read', chatId);

// Delete message
socket.emit('delete_message', messageId);
```

### Listening to Events

```typescript
// New message received
socket.on('new_message', (data) => {
  // data: { messageId, chatId, senderId, senderProfileId, content, createdAt }
  addMessageToChat(data);
});

// Message sent confirmation
socket.on('message_sent', (data) => {
  // data: { messageId, chatId, status }
  updateMessageStatus(data.messageId, data.status);
});

// Chat room message
socket.on('chat_message', (data) => {
  // data: { messageId, senderId, senderProfileId, content, createdAt }
  addMessageToChat(data);
});

// User typing
socket.on('user_typing', (data) => {
  // data: { profileId, chatId }
  showTypingIndicator(data.profileId);
});

// User stopped typing
socket.on('user_stopped_typing', (data) => {
  hideTypingIndicator(data.profileId);
});

// Messages read
socket.on('messages_read', (data) => {
  // data: { chatId, readBy }
  markMessagesAsRead(data.chatId);
});

// Messages delivered
socket.on('messages_delivered', (data) => {
  // data: { chatId, deliveredTo }
  markMessagesAsDelivered(data.chatId);
});

// Message deleted
socket.on('message_deleted', (data) => {
  // data: { messageId, deletedBy }
  removeMessageFromChat(data.messageId);
});
```

### Complete Chat Component Example

```typescript
import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

function ChatComponent({ chatId, receiverProfileId }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Initialize socket
    socketRef.current = io('http://localhost:3000', {
      auth: { token: localStorage.getItem('authToken') },
    });

    const socket = socketRef.current;

    // Join chat room
    socket.emit('join_chat', chatId);

    // Listen for messages
    socket.on('new_message', (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on('user_typing', () => setIsTyping(true));
    socket.on('user_stopped_typing', () => setIsTyping(false));

    // Cleanup
    return () => {
      socket.emit('leave_chat', chatId);
      socket.disconnect();
    };
  }, [chatId]);

  function handleSend() {
    if (!newMessage.trim()) return;

    socketRef.current?.emit('send_message', {
      receiverProfileId,
      content: newMessage,
    });

    setNewMessage('');
  }

  function handleTyping() {
    socketRef.current?.emit('typing', { chatId, receiverProfileId });

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit('stop_typing', { chatId, receiverProfileId });
    }, 2000);
  }

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((msg) => (
          <div key={msg.messageId} className="message">
            {msg.content}
          </div>
        ))}
        {isTyping && <div className="typing-indicator">Typing...</div>}
      </div>
      <div className="input-area">
        <input
          value={newMessage}
          onChange={(e) => {
            setNewMessage(e.target.value);
            handleTyping();
          }}
          placeholder="Type a message..."
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}
```

---

## Rate Limiting

| Endpoint Type | Limit | Window |
|--------------|-------|--------|
| General API | 100 requests | 15 minutes |
| OTP endpoints | 3 requests | 1 minute |
| Interest sending | 50 requests | 1 hour |
| Search | 30 requests | 1 minute |
| Photo upload | 20 requests | 1 hour |

When rate limited, you'll receive:

```json
{
  "success": false,
  "status": 429,
  "message": "Too many requests. Please try again later.",
  "error": {
    "code": "RATE_LIMIT_EXCEEDED"
  }
}
```

---

## Best Practices

### 1. Token Management
```typescript
// Store token securely
localStorage.setItem('authToken', token);

// Add to all requests
api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

// Handle expiry
api.interceptors.response.use(null, (error) => {
  if (error.response?.status === 401) {
    localStorage.removeItem('authToken');
    window.location.href = '/login';
  }
  return Promise.reject(error);
});
```

### 2. Pagination
```typescript
function usePagination(fetchFn, initialPage = 1, limit = 20) {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(initialPage);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  async function loadMore() {
    if (loading || !hasMore) return;
    
    setLoading(true);
    const response = await fetchFn(page, limit);
    
    setData((prev) => [...prev, ...response.data]);
    setHasMore(response.pagination.hasNext);
    setPage((p) => p + 1);
    setLoading(false);
  }

  return { data, loadMore, hasMore, loading };
}
```

### 3. Real-time Updates
```typescript
// Combine REST API with WebSocket for real-time
function ChatProvider({ children }) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Initial load from REST API
    api.get('/chat/unread').then((res) => {
      setUnreadCount(res.data.unreadCount);
    });

    // Real-time updates
    socket.on('new_message', () => {
      setUnreadCount((c) => c + 1);
    });
  }, []);

  return (
    <ChatContext.Provider value={{ unreadCount }}>
      {children}
    </ChatContext.Provider>
  );
}
```

### 4. Offline Support
```typescript
// Queue messages when offline
const messageQueue = [];

function sendMessage(content, receiverProfileId) {
  if (!navigator.onLine) {
    messageQueue.push({ content, receiverProfileId, timestamp: Date.now() });
    return;
  }
  
  socket.emit('send_message', { content, receiverProfileId });
}

// Send queued messages when back online
window.addEventListener('online', () => {
  messageQueue.forEach((msg) => {
    socket.emit('send_message', msg);
  });
  messageQueue.length = 0;
});
```

---

## Quick Reference

### Essential Endpoints

| Action | Method | Endpoint |
|--------|--------|----------|
| Send OTP | POST | `/api/auth/send-otp` |
| Verify OTP | POST | `/api/auth/verify-otp` |
| Get Profile | GET | `/api/profile` |
| Update Profile | POST | `/api/profile` |
| Search | GET | `/api/search` |
| Get Matches | GET | `/api/matches/:category` |
| Send Interest | POST | `/api/activity/interest` |
| Get Chats | GET | `/api/chat` |
| Send Message | POST | `/api/chat/:profileId/message` |
| Get Plans | GET | `/api/membership/plans` |
| Purchase | POST | `/api/membership/purchase` |

### WebSocket Events Summary

| Event | Direction | Purpose |
|-------|-----------|---------|
| `join_chat` | → Server | Join chat room |
| `send_message` | → Server | Send message |
| `typing` | → Server | Typing indicator |
| `new_message` | ← Server | Receive message |
| `message_sent` | ← Server | Send confirmation |
| `user_typing` | ← Server | Typing status |

