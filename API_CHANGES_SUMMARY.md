# API Changes Summary - View Contact Feature

## 🆕 New API Endpoint

### `POST /api/membership/view-contact/:profileId`

**Purpose:** Premium users can use this API to unlock name and contact details for a specific profile. This consumes 1 contact view from their membership quota.

**Request:**
```http
POST /api/membership/view-contact/PM123ABC
Authorization: Bearer <token>
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Contact unlocked successfully. You can now view name and contact details.",
  "data": {
    "success": true,
    "contactsRemaining": 99,
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
    "contactsRemaining": 100,
    "alreadyViewed": true
  }
}
```

**Response (Quota Exhausted):**
```json
{
  "success": false,
  "status": 403,
  "message": "Contact view limit reached. Please upgrade your membership.",
  "error": {
    "code": "CONTACT_LIMIT_REACHED"
  },
  "contactsUsed": 100,
  "contactsAllowed": 100
}
```

**Response (Not Premium):**
```json
{
  "success": false,
  "status": 403,
  "message": "Premium membership required",
  "error": {
    "code": "PREMIUM_REQUIRED"
  }
}
```

**Important:**
- Requires premium membership
- Consumes 1 contact view from quota (only first time)
- If already viewed, doesn't consume quota again
- After viewing contact, user can see name, phone, all photos, and income regardless of privacy settings

---

## 🔄 Updated API Responses

### 1. `GET /api/profile/:profileId`

**New Field Added:**
- `hasViewedContact`: `boolean` - Indicates if premium user has viewed contact (unlocks everything)

**Privacy Logic:**
- If `hasViewedContact = true`: User can see EVERYTHING (name, phone, all photos, income) regardless of privacy settings
- If `hasViewedContact = false`: Normal privacy rules apply

---

## 🔒 Updated Privacy Rules

### Non-Premium Users:
✅ Can see: Profile ID, age, height, education, occupation, city, state, religion, caste, about me  
✅ Photos: Visible if `photosPrivate=false` OR interest accepted  
✅ Income: Visible if `incomePrivate=false` OR interest accepted  
❌ Cannot see: Name, Phone, Kundali match score

### Premium Users (Not Viewed Contact):
✅ Can see: Everything non-premium can see + **Name**  
✅ Photos: Visible if `photosPrivate=false` OR interest accepted  
✅ Income: Visible if `incomePrivate=false` OR interest accepted  
✅ Phone: Visible if `phonePrivate=false` OR interest accepted  
❌ Cannot see: Private photos/income/phone if privacy enabled AND interest not accepted

### Premium Users (Viewed Contact):
✅ Can see: **EVERYTHING** - Name, Phone, All Photos, Income (bypasses all privacy)  
✅ Photos: ALL visible (privacy bypassed)  
✅ Income: Visible (privacy bypassed)  
✅ Phone: Visible (privacy bypassed)

---

## 📊 Membership Quota Tracking

### Contact View Consumption:
- First time viewing a contact: Consumes 1 contact view
- Already viewed contact: Does NOT consume quota again
- Quota tracked in: `membership.contactsUsed` and `membership.contactsAllowed`

### Membership Summary Response:
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
    "features": { ... }
  }
}
```

---

## 🎯 Use Cases

### Use Case 1: Premium User Views Profile
1. User is premium member
2. Views profile → Sees name but phone/photos/income may be locked
3. Clicks "View Contact" button
4. API called → Consumes 1 contact view
5. Profile refreshed → Now sees EVERYTHING (name, phone, all photos, income)

### Use Case 2: Premium User Views Same Contact Again
1. User already viewed contact before
2. Views profile again
3. Clicks "View Contact" button
4. API called → Returns `alreadyViewed: true`, does NOT consume quota
5. Profile shows all details (already unlocked)

### Use Case 3: Non-Premium User
1. User is not premium
2. Views profile → Sees profile ID, most details (no name/contact)
3. Cannot use "View Contact" API (returns 403)
4. Must upgrade to premium first

### Use Case 4: Photos Privacy (Non-Premium)
1. User is non-premium
2. Profile has `photosPrivate=true`
3. User sends interest → Interest accepted
4. Now can see all photos (even though non-premium)

### Use Case 5: Photos Privacy (Premium + View Contact)
1. User is premium
2. Profile has `photosPrivate=true`
3. User uses "View Contact" API
4. Now can see all photos (privacy bypassed)

---

## 📝 Frontend Integration Checklist

- [ ] Add `viewContact(profileId)` API function
- [ ] Add "View Contact" button component
- [ ] Update profile display to show button when name/contact locked
- [ ] Handle `hasViewedContact` flag in profile responses
- [ ] Update privacy logic for photos/income based on `hasViewedContact`
- [ ] Display contact quota (remaining contacts)
- [ ] Add contact limit modal
- [ ] Handle "already viewed" case (don't show button or show different message)
- [ ] Refresh profile after viewing contact
- [ ] Update membership summary after viewing contact
- [ ] Add success/error toasts
- [ ] Test all scenarios (premium/non-premium, viewed/not viewed, connected/not connected)

---

## 🔑 Key Points

1. **View Contact API** is the key to unlocking everything for premium users
2. **Photos privacy** works differently - even non-premium can see if connected
3. **Income/Phone privacy** - Premium users can bypass by viewing contact
4. **Quota management** - Tracks contact views, doesn't consume if already viewed
5. **Privacy hierarchy**: View Contact > Accepted Interest > Privacy Settings

---

**Last Updated:** 2024-01-15

