# Missing APIs List

This document lists APIs that are referenced in the frontend but may not be implemented in the backend yet.

## 1. Change Password API

**Status:** ❌ Missing

**Required Endpoint:**
```
PUT /api/auth/change-password
Authorization: Bearer <token>

Request Body:
{
  "currentPassword": "string",
  "newPassword": "string"
}

Response:
{
  "success": true,
  "status": 200,
  "message": "Password changed successfully",
  "data": null
}
```

**Used In:**
- `src/features/settings/pages/SettingsPage.tsx` - Security tab

**Current Implementation:**
- Shows "Coming Soon" toast notification
- Form validation is implemented
- Needs API integration

---

## 2. Get Shortlist Status API

**Status:** ⚠️ May be missing

**Required Endpoint:**
```
GET /api/activity/shortlist/check/:profileId
Authorization: Bearer <token>

Response:
{
  "success": true,
  "status": 200,
  "data": {
    "isShortlisted": boolean
  }
}
```

**Used In:**
- `src/features/profile/pages/ViewProfilePage.tsx` - Currently uses local state

**Current Implementation:**
- Uses local state `localShortlisted`
- Should fetch actual shortlist status from API

---

## 3. Get Total Match Count API (Optional)

**Status:** ⚠️ Optional Enhancement

**Current Implementation:**
- Dashboard shows match count from `new_matches` category pagination
- If you want a separate "Total Matches" count, you may need:
```
GET /api/matches/total-count
Authorization: Bearer <token>

Response:
{
  "success": true,
  "status": 200,
  "data": {
    "totalMatches": number
  }
}
```

**Note:** This is optional - current implementation uses pagination total which works fine.

---

## Summary

### Critical (Required for full functionality):
1. ✅ Change Password API - Needed for Settings page

### Nice to Have (Enhancements):
2. ⚠️ Get Shortlist Status API - Better UX for ViewProfilePage
3. ⚠️ Total Match Count API - Optional enhancement

---

## All Other APIs Are Integrated ✅

All other pages and features are fully integrated with APIs:
- ✅ Profile Management (View, Edit, Complete)
- ✅ Photo Management (Upload, Delete, Reorder, Privacy)
- ✅ Search & Filters
- ✅ Match Categories
- ✅ Activity Center (Interests, Shortlist, Block)
- ✅ Chat & Messaging
- ✅ Notifications
- ✅ Membership
- ✅ Privacy Settings
- ✅ Partner Preferences
- ✅ Profile Views
- ✅ Change Phone Number (already in authApi.ts)

