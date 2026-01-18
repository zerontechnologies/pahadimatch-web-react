# Frontend Profile Updates - Complete Guide

## 📋 Summary of Changes

This document outlines all profile-related changes that need to be implemented in the frontend.

---

## 🔧 1. S3 URL Format Change

### Before:
```
https://files.pahadimatch.com.s3.ap-south-1.amazonaws.com/users/xxx/photos/xxx.jpg
```

### After:
```
https://s3.ap-south-1.amazonaws.com/files.pahadimatch.com/users/xxx/photos/xxx.jpg
```

**Action Required:**
- ✅ No changes needed - URLs are generated on backend
- ✅ All existing photo URLs will work (backward compatible)
- ✅ New uploads will use the new format automatically

---

## 🆔 2. Profile ID Format Change

### Before:
- Format: `PMMKGPF9QF3KXQ` (PM + timestamp + random)
- Length: Variable (13-15 characters)

### After:
- Format: `PMXXXXXX` (PM + 6 alphanumeric)
- Length: 8 characters
- Example: `PMA1B2C3`, `PMXYZ12`, `PM9K8L7`

**Action Required:**
- ✅ Update profile ID validation regex: `/^PM[A-Z0-9]{6}$/`
- ✅ Update display components to show 8-character IDs
- ✅ Update any hardcoded length checks

**API Response:**
```json
{
  "profileId": "PMA1B2C3"
}
```

---

## 🏘️ 3. Origin → Community Field Rename

### Change:
- Field renamed from `origin` to `community`
- `origin` field still exists for backward compatibility

### Enum Values (unchanged):
```typescript
enum Community {
  GARHWALI = 'garhwali',
  KUMAONI = 'kumaoni',
  JONSARI = 'jonsari',
  OTHER = 'other'
}
```

**Action Required:**
- ✅ Update form fields: Use `community` instead of `origin`
- ✅ Update API requests: Send `community` field
- ✅ Update display components: Show `community` value
- ✅ Keep `origin` handling for backward compatibility (read-only)

**API Request:**
```json
{
  "community": "garhwali"  // Use this
  // "origin": "garhwali"  // Legacy - still accepted
}
```

**API Response:**
```json
{
  "community": "garhwali",
  "origin": "garhwali"  // Legacy field, same value
}
```

---

## 👤 4. Account Created By Field

### New Field:
```typescript
accountCreatedBy?: 'self' | 'parent' | 'sibling'
```

**Action Required:**
- ✅ Add dropdown/radio in profile creation form
- ✅ Options: "Self", "Parent", "Sibling"
- ✅ Optional field (can be null)

**Form Field:**
```html
<select name="accountCreatedBy">
  <option value="">Select...</option>
  <option value="self">Self</option>
  <option value="parent">Parent</option>
  <option value="sibling">Sibling</option>
</select>
```

**API Request:**
```json
{
  "accountCreatedBy": "parent"
}
```

---

## 🏛️ 5. Caste Field - Now Enum

### Before:
- Free text field

### After:
- Enum field with 3 options

### Enum Values:
```typescript
enum Caste {
  BRAHMIN = 'brahmin',
  RAJPUT = 'rajput',
  OTHER = 'others'
}
```

**Action Required:**
- ✅ Replace text input with dropdown
- ✅ Options: "Brahmin", "Rajput", "Others"
- ✅ Update validation to accept only enum values

**Form Field:**
```html
<select name="caste">
  <option value="">Select Caste</option>
  <option value="brahmin">Brahmin</option>
  <option value="rajput">Rajput</option>
  <option value="others">Others</option>
</select>
```

**API Request:**
```json
{
  "caste": "brahmin"  // Must be one of: brahmin, rajput, others
}
```

---

## 👨‍👩‍👧 6. Father/Mother Details - Enhanced

### New Fields Added:

#### Father Details:
- `fatherOccupation` (existing)
- `fatherAlive` (NEW) - `'alive' | 'deceased'`
- `fatherEmploymentStatus` (NEW) - `'working' | 'retired' | 'not_working'`

#### Mother Details:
- `motherOccupation` (existing)
- `motherAlive` (NEW) - `'alive' | 'deceased'`
- `motherEmploymentStatus` (NEW) - `'working' | 'retired' | 'not_working'`

**Action Required:**
- ✅ Add "Alive Status" dropdown for father
- ✅ Add "Employment Status" dropdown for father
- ✅ Add "Alive Status" dropdown for mother
- ✅ Add "Employment Status" dropdown for mother
- ✅ Show/hide employment status based on alive status

**Form Fields:**
```html
<!-- Father Section -->
<input name="fatherName" placeholder="Father's Name" />
<input name="fatherOccupation" placeholder="Father's Occupation" />
<select name="fatherAlive">
  <option value="">Select...</option>
  <option value="alive">Alive</option>
  <option value="deceased">Deceased</option>
</select>
<select name="fatherEmploymentStatus">
  <option value="">Select...</option>
  <option value="working">Working</option>
  <option value="retired">Retired</option>
  <option value="not_working">Not Working</option>
</select>

<!-- Mother Section -->
<input name="motherName" placeholder="Mother's Name" />
<input name="motherOccupation" placeholder="Mother's Occupation" />
<select name="motherAlive">
  <option value="">Select...</option>
  <option value="alive">Alive</option>
  <option value="deceased">Deceased</option>
</select>
<select name="motherEmploymentStatus">
  <option value="">Select...</option>
  <option value="working">Working</option>
  <option value="retired">Retired</option>
  <option value="not_working">Not Working</option>
</select>
```

**API Request:**
```json
{
  "fatherName": "John Doe",
  "fatherOccupation": "Engineer",
  "fatherAlive": "alive",
  "fatherEmploymentStatus": "working",
  "motherName": "Jane Doe",
  "motherOccupation": "Teacher",
  "motherAlive": "alive",
  "motherEmploymentStatus": "retired"
}
```

**UI Logic:**
- If `fatherAlive === 'deceased'`, disable or hide `fatherEmploymentStatus`
- If `motherAlive === 'deceased'`, disable or hide `motherEmploymentStatus`

---

## 🍷 7. Alcohol & Smoking Status

### Note:
These fields already exist and use the `Habit` enum:
- `smoking` - `'yes' | 'no' | 'occasionally'`
- `drinking` - `'yes' | 'no' | 'occasionally'`

**No changes needed** - fields are already implemented correctly.

**Current API:**
```json
{
  "smoking": "no",
  "drinking": "occasionally"
}
```

---

## 📝 Complete Profile Update API Request

### Full Example:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "gender": "male",
  "dateOfBirth": "1995-01-15",
  "height": 175,
  "maritalStatus": "never_married",
  "religion": "hindu",
  "caste": "brahmin",
  "gothra": "Bharadwaj",
  "education": "bachelors",
  "occupation": "engineer",
  "income": 500000,
  "city": "Delhi",
  "state": "Delhi",
  "community": "garhwali",
  "accountCreatedBy": "self",
  "fatherName": "Father Name",
  "fatherOccupation": "Engineer",
  "fatherAlive": "alive",
  "fatherEmploymentStatus": "working",
  "motherName": "Mother Name",
  "motherOccupation": "Teacher",
  "motherAlive": "alive",
  "motherEmploymentStatus": "retired",
  "smoking": "no",
  "drinking": "occasionally"
}
```

---

## 🔄 API Endpoints - No Changes

All existing endpoints work the same:
- `POST /api/profile` - Create/Update profile
- `GET /api/profile` - Get own profile
- `GET /api/profile/:profileId` - View profile
- `PUT /api/profile/privacy` - Update privacy
- `PUT /api/profile/notifications` - Update notifications
- `PUT /api/profile/preferences` - Update preferences

---

## 📊 Response Format Updates

### Profile Response (GET /api/profile/:profileId):
```json
{
  "success": true,
  "data": {
    "profileId": "PMA1B2C3",
    "firstName": "John",
    "lastName": "Doe",
    "community": "garhwali",
    "origin": "garhwali",
    "caste": "brahmin",
    "accountCreatedBy": "self",
    "fatherAlive": "alive",
    "fatherEmploymentStatus": "working",
    "motherAlive": "alive",
    "motherEmploymentStatus": "retired",
    "smoking": "no",
    "drinking": "occasionally",
    "photos": [
      {
        "url": "https://s3.ap-south-1.amazonaws.com/files.pahadimatch.com/users/xxx/photos/xxx.jpg",
        "isProfilePhoto": true,
        "isPrivate": false
      }
    ]
  }
}
```

---

## ✅ Migration Checklist

### Frontend Updates Required:

- [ ] Update profile ID validation (8 chars, format: PM + 6 alphanumeric)
- [ ] Replace `origin` field with `community` in forms
- [ ] Add `accountCreatedBy` dropdown
- [ ] Change `caste` from text input to dropdown (brahmin, rajput, others)
- [ ] Add `fatherAlive` dropdown
- [ ] Add `fatherEmploymentStatus` dropdown
- [ ] Add `motherAlive` dropdown
- [ ] Add `motherEmploymentStatus` dropdown
- [ ] Update photo URL display (new S3 format - automatic)
- [ ] Test all profile creation/update flows
- [ ] Update profile display components
- [ ] Update search/filter components (caste, community)

---

## 🧪 Testing

### Test Cases:

1. **Profile Creation:**
   - Create profile with all new fields
   - Verify enum values are accepted
   - Verify validation works

2. **Profile Update:**
   - Update existing profile with new fields
   - Verify backward compatibility (origin field)

3. **Profile Display:**
   - View profile with new fields
   - Verify all fields display correctly

4. **Search/Filter:**
   - Filter by caste (brahmin, rajput, others)
   - Filter by community (garhwali, kumaoni, jonsari, other)

---

## 📚 TypeScript Types

### Updated Types:
```typescript
enum Community {
  GARHWALI = 'garhwali',
  KUMAONI = 'kumaoni',
  JONSARI = 'jonsari',
  OTHER = 'other'
}

enum Caste {
  BRAHMIN = 'brahmin',
  RAJPUT = 'rajput',
  OTHER = 'others'
}

enum AccountCreatedBy {
  SELF = 'self',
  PARENT = 'parent',
  SIBLING = 'sibling'
}

enum ParentStatus {
  ALIVE = 'alive',
  DECEASED = 'deceased'
}

enum EmploymentStatus {
  WORKING = 'working',
  RETIRED = 'retired',
  NOT_WORKING = 'not_working'
}

interface Profile {
  profileId: string; // Format: PM + 6 alphanumeric
  community?: Community;
  origin?: Community; // Legacy
  caste?: Caste;
  accountCreatedBy?: AccountCreatedBy;
  fatherAlive?: ParentStatus;
  fatherEmploymentStatus?: EmploymentStatus;
  motherAlive?: ParentStatus;
  motherEmploymentStatus?: EmploymentStatus;
  smoking?: Habit; // 'yes' | 'no' | 'occasionally'
  drinking?: Habit; // 'yes' | 'no' | 'occasionally'
}
```

---

## 🚀 Deployment Notes

1. **Backward Compatibility:**
   - Old profiles with `origin` field will work
   - New profiles will use `community` field
   - Both fields are synced automatically

2. **Profile ID Migration:**
   - Existing profile IDs remain unchanged
   - New profiles will use new format (PM + 6 alphanumeric)

3. **Photo URLs:**
   - Old URLs continue to work
   - New uploads use new URL format
   - No migration needed

---

## ❓ Questions?

If you have any questions about these changes, please refer to:
- Backend API documentation
- Swagger/OpenAPI docs (if available)
- Backend team for clarification

---

**Last Updated:** 2026-01-16
**Version:** 2.0

