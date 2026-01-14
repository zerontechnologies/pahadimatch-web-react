# Frontend Update Guide - Privacy & Subscription Changes

## 🔒 Overview

**Updated Privacy Rules:**
- **Non-premium users** can see most profile details EXCEPT:
  - Name (firstName, lastName)
  - Contact (phone number)
  - Kundali match score
  
- **Premium users** can see everything including name and contact

- **Special Privacy Rules:**
  - If profile has `photosPrivate = true`: Photos only visible if interest is accepted
  - If profile has `incomePrivate = true`: Income only visible if interest is accepted

---

## 📋 API Response Changes

### 1. **View Profile** - `GET /api/profile/:profileId`

#### ✅ Response (Non-Premium User)
```json
{
  "success": true,
  "data": {
    "profileId": "PM123ABC",
    "gender": "male",
    "age": 28,
    "height": 175,
    "maritalStatus": "never_married",
    "religion": "hindu",
    "caste": "Brahmin",
    "education": "bachelors",
    "occupation": "engineer",
    "city": "Bangalore",
    "state": "Karnataka",
    "aboutMe": "Looking for a life partner...",
    "profileCompleteness": 85,
    "isVerified": true,
    "lastActive": "2024-01-15T10:00:00.000Z",
    "nameLocked": true,
    "requiresPremiumForName": true,
    "requiresPremiumForContact": true,
    "phone": "98******10",
    "phoneLocked": true,
    "photos": [...], // Only if photosPrivate=false OR interest accepted
    "photosLocked": false, // true if photosPrivate=true AND interest not accepted
    "income": 2500000, // Only if incomePrivate=false OR interest accepted
    "incomeLocked": false, // true if incomePrivate=true AND interest not accepted
    "isPremiumRequired": false
  }
}
```

#### ✅ Response (Premium User)
```json
{
  "success": true,
  "data": {
    "profileId": "PM123ABC",
    "firstName": "John",
    "lastName": "Doe",
    "gender": "male",
    "age": 28,
    "height": 175,
    "maritalStatus": "never_married",
    "religion": "hindu",
    "caste": "Brahmin",
    "education": "bachelors",
    "occupation": "engineer",
    "income": 2500000,
    "city": "Bangalore",
    "state": "Karnataka",
    "aboutMe": "Looking for a life partner...",
    "photos": [...],
    "phone": "+919876543210",
    "phoneLocked": false,
    "incomeLocked": false,
    "photosLocked": false,
    "requiresPremiumForName": false,
    "requiresPremiumForContact": false,
    "isPremiumRequired": false
  }
}
```

**Key Fields:**
- `nameLocked`: `true` for non-premium users
- `requiresPremiumForName`: `true` if name is locked
- `requiresPremiumForContact`: `true` if contact is locked
- `photosLocked`: `true` if photos are private AND interest not accepted
- `incomeLocked`: `true` if income is private AND interest not accepted

---

### 2. **Search Profiles** - `GET /api/search`

#### ✅ Response (Non-Premium User)
```json
{
  "success": true,
  "data": [
    {
      "profileId": "PM123ABC",
      "age": 28,
      "height": 175,
      "city": "Bangalore",
      "state": "Karnataka",
      "education": "bachelors",
      "occupation": "engineer",
      "religion": "hindu",
      "caste": "Brahmin",
      "isVerified": true,
      "lastActive": "2024-01-15T10:00:00.000Z",
      "profileCompleteness": 85,
      "requiresPremiumForName": true,
      "isPremiumRequired": false
    }
  ],
  "pagination": { ... }
}
```

#### ✅ Response (Premium User)
```json
{
  "success": true,
  "data": [
    {
      "profileId": "PM123ABC",
      "firstName": "John",
      "lastName": "Doe",
      "age": 28,
      "height": 175,
      "city": "Bangalore",
      "state": "Karnataka",
      "education": "bachelors",
      "occupation": "engineer",
      "religion": "hindu",
      "caste": "Brahmin",
      "isVerified": true,
      "lastActive": "2024-01-15T10:00:00.000Z",
      "profileCompleteness": 85,
      "requiresPremiumForName": false,
      "isPremiumRequired": false
    }
  ],
  "pagination": { ... }
}
```

---

### 3. **Match Categories** - `GET /api/matches/:category`

#### ✅ Response (Non-Premium User)
```json
{
  "success": true,
  "data": [
    {
      "profileId": "PM123ABC",
      "age": 28,
      "height": 175,
      "city": "Bangalore",
      "state": "Karnataka",
      "education": "bachelors",
      "occupation": "engineer",
      "religion": "hindu",
      "caste": "Brahmin",
      "isVerified": true,
      "lastActive": "2024-01-15T10:00:00.000Z",
      "requiresPremiumForName": true,
      "isPremiumRequired": false
    }
  ],
  "pagination": { ... }
}
```

#### ✅ Response (Premium User)
```json
{
  "success": true,
  "data": [
    {
      "profileId": "PM123ABC",
      "firstName": "John",
      "lastName": "Doe",
      "age": 28,
      "height": 175,
      "city": "Bangalore",
      "state": "Karnataka",
      "education": "bachelors",
      "occupation": "engineer",
      "religion": "hindu",
      "caste": "Brahmin",
      "isVerified": true,
      "lastActive": "2024-01-15T10:00:00.000Z",
      "requiresPremiumForName": false,
      "isPremiumRequired": false
    }
  ],
  "pagination": { ... }
}
```

**Affected Match Categories:**
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

---

### 4. **Kundali Match** - `GET /api/kundali/match/:profileId`

#### ✅ Response (Non-Premium User)
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

#### ✅ Response (Premium User)
```json
{
  "success": true,
  "data": {
    "totalScore": 28,
    "maxScore": 36,
    "percentage": 77.78,
    "varnaScore": { "score": 1, "max": 1 },
    "vasyaScore": { "score": 2, "max": 2 },
    // ... other scores
  }
}
```

**Note:** Kundali match score is **premium-only** feature.

---

## 🔧 Frontend Implementation Changes

### 1. **TypeScript/Interface Updates**

#### Update Profile Response Interface

```typescript
interface ProfileResponse {
  profileId: string;
  
  // Name (Premium only)
  firstName?: string;
  lastName?: string;
  nameLocked?: boolean;
  requiresPremiumForName?: boolean;
  
  // Contact (Premium only)
  phone?: string;
  phoneLocked?: boolean;
  requiresPremiumForContact?: boolean;
  
  // Visible to all users
  gender: string;
  age: number;
  height: number;
  maritalStatus: string;
  religion: string;
  caste?: string;
  education: string;
  occupation: string;
  city: string;
  state: string;
  aboutMe?: string;
  profileCompleteness: number;
  isVerified: boolean;
  lastActive: string;
  
  // Photos (Privacy controlled)
  photos?: PhotoItem[];
  photosLocked?: boolean; // true if photosPrivate AND interest not accepted
  
  // Income (Privacy controlled)
  income?: number;
  incomeLocked?: boolean; // true if incomePrivate AND interest not accepted
  
  isPremiumRequired: boolean;
}
```

#### Update Search/Match Response Interface

```typescript
interface SearchProfileItem {
  profileId: string;
  
  // Name (Premium only)
  firstName?: string;
  lastName?: string;
  requiresPremiumForName?: boolean;
  
  // Visible to all users
  age: number;
  height: number;
  city: string;
  state: string;
  education: string;
  occupation: string;
  religion: string;
  caste?: string;
  isVerified: boolean;
  lastActive: string;
  profileCompleteness?: number;
  
  isPremiumRequired: boolean;
}
```

---

### 2. **Profile View Component Updates**

#### Profile Display Component

```typescript
function ProfileViewComponent({ profileId }: { profileId: string }) {
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [isAcceptedMatch, setIsAcceptedMatch] = useState(false);
  
  useEffect(() => {
    checkMembershipStatus().then(status => {
      setIsPremium(status.isPremium);
    });
    
    checkAcceptedMatch(profileId).then(accepted => {
      setIsAcceptedMatch(accepted);
    });
    
    fetchProfile(profileId).then(data => {
      setProfile(data);
    });
  }, [profileId]);
  
  if (!profile) return <Loading />;
  
  return (
    <div className="profile-view">
      {/* Profile Header */}
      <div className="profile-header">
        {profile.nameLocked ? (
          <div className="name-locked">
            <LockIcon />
            <h2>Profile ID: {profile.profileId}</h2>
            <p className="premium-badge">Premium Required to View Name</p>
            <button onClick={() => navigate('/membership')}>
              Upgrade to Premium
            </button>
          </div>
        ) : (
          <h2>{profile.firstName} {profile.lastName}</h2>
        )}
      </div>
      
      {/* Profile Details - Visible to all */}
      <div className="profile-details">
        <ProfileDetail label="Age" value={profile.age} />
        <ProfileDetail label="Height" value={`${profile.height} cm`} />
        <ProfileDetail label="Education" value={profile.education} />
        <ProfileDetail label="Occupation" value={profile.occupation} />
        <ProfileDetail label="City" value={profile.city} />
        <ProfileDetail label="State" value={profile.state} />
        <ProfileDetail label="Religion" value={profile.religion} />
        <ProfileDetail label="Caste" value={profile.caste} />
      </div>
      
      {/* Photos Section */}
      {profile.photosLocked ? (
        <div className="photos-locked">
          <LockIcon />
          <p>Photos are private. Connect with this profile to view photos.</p>
          {!isAcceptedMatch && (
            <button onClick={() => sendInterest(profileId)}>
              Send Interest
            </button>
          )}
        </div>
      ) : (
        <PhotoGallery photos={profile.photos} />
      )}
      
      {/* Income Section */}
      {profile.incomeLocked ? (
        <div className="income-locked">
          <LockIcon />
          <p>Income is private. Connect with this profile to view income.</p>
        </div>
      ) : (
        <ProfileDetail label="Income" value={`₹${formatIncome(profile.income)}`} />
      )}
      
      {/* Contact Section - Premium Only */}
      {profile.phoneLocked ? (
        <div className="contact-locked">
          <LockIcon />
          <p>Premium membership required to view contact details</p>
          <button onClick={() => navigate('/membership')}>
            Upgrade to Premium
          </button>
        </div>
      ) : (
        <ProfileDetail label="Phone" value={profile.phone} />
      )}
      
      {/* Kundali Match - Premium Only */}
      {isPremium ? (
        <KundaliMatchButton profileId={profileId} />
      ) : (
        <div className="kundali-locked">
          <LockIcon />
          <p>Premium membership required for Kundali matching</p>
          <button onClick={() => navigate('/membership')}>
            Upgrade to Premium
          </button>
        </div>
      )}
    </div>
  );
}
```

---

### 3. **Search Results Component Updates**

#### Search Results List

```typescript
function SearchResults({ results }: { results: SearchProfileItem[] }) {
  return (
    <div className="search-results">
      {results.map((profile) => (
        <ProfileCard key={profile.profileId} profile={profile} />
      ))}
    </div>
  );
}

function ProfileCard({ profile }: { profile: SearchProfileItem }) {
  return (
    <div className="profile-card">
      {/* Name Section */}
      {profile.requiresPremiumForName ? (
        <div className="name-section locked">
          <LockIcon size={16} />
          <span className="profile-id">Profile ID: {profile.profileId}</span>
          <span className="premium-badge">Premium Required</span>
        </div>
      ) : (
        <h3 className="name-section">
          {profile.firstName} {profile.lastName}
        </h3>
      )}
      
      {/* Details - Visible to all */}
      <div className="profile-info">
        <p>Age: {profile.age} • Height: {profile.height}cm</p>
        <p>City: {profile.city}, {profile.state}</p>
        <p>Education: {profile.education}</p>
        <p>Occupation: {profile.occupation}</p>
        <p>Religion: {profile.religion}</p>
        {profile.caste && <p>Caste: {profile.caste}</p>}
      </div>
      
      <button onClick={() => navigate(`/profile/${profile.profileId}`)}>
        View Profile
      </button>
    </div>
  );
}
```

---

### 4. **Match Categories Component Updates**

#### Match List Component

```typescript
function MatchList({ matches }: { matches: SearchProfileItem[] }) {
  return (
    <div className="match-list">
      {matches.map((match) => (
        <MatchCard key={match.profileId} match={match} />
      ))}
    </div>
  );
}

function MatchCard({ match }: { match: SearchProfileItem }) {
  return (
    <div className="match-card">
      {/* Profile Photo Placeholder */}
      <div className="match-photo">
        <ProfileIcon />
      </div>
      
      {/* Name Section */}
      {match.requiresPremiumForName ? (
        <div className="match-name locked">
          <LockIcon />
          <div className="profile-id">{match.profileId}</div>
          <span className="premium-badge">Premium</span>
        </div>
      ) : (
        <h3 className="match-name">
          {match.firstName} {match.lastName}
        </h3>
      )}
      
      {/* Details - Visible to all */}
      <div className="match-details">
        <p>{match.age} years • {match.height}cm</p>
        <p>{match.city}, {match.state}</p>
        <p>{match.education} • {match.occupation}</p>
        <p>{match.religion} {match.caste && `• ${match.caste}`}</p>
      </div>
      
      <div className="match-actions">
        <button onClick={() => navigate(`/profile/${match.profileId}`)}>
          View Profile
        </button>
        {match.requiresPremiumForName && (
          <button 
            className="btn-premium"
            onClick={() => navigate('/membership')}
          >
            Upgrade to See Name
          </button>
        )}
      </div>
    </div>
  );
}
```

---

### 5. **Privacy-Aware Photo Display**

```typescript
function PhotoGallery({ photos, photosLocked }: { 
  photos?: PhotoItem[], 
  photosLocked?: boolean 
}) {
  if (photosLocked) {
    return (
      <div className="photos-locked">
        <LockIcon />
        <p>Photos are private</p>
        <p>Connect with this profile to view all photos</p>
      </div>
    );
  }
  
  if (!photos || photos.length === 0) {
    return <div className="no-photos">No photos available</div>;
  }
  
  return (
    <div className="photo-gallery">
      {photos.map((photo, index) => (
        <img 
          key={index} 
          src={photo.url} 
          alt={`Photo ${index + 1}`}
          className={photo.isPrivate ? 'photo-private' : ''}
        />
      ))}
    </div>
  );
}
```

---

### 6. **Privacy-Aware Income Display**

```typescript
function IncomeDisplay({ income, incomeLocked }: { 
  income?: number, 
  incomeLocked?: boolean 
}) {
  if (incomeLocked) {
    return (
      <div className="income-locked">
        <LockIcon />
        <p>Income is private</p>
        <p>Connect with this profile to view income</p>
      </div>
    );
  }
  
  if (!income) {
    return <div className="no-income">Income not specified</div>;
  }
  
  return (
    <div className="income-display">
      <span className="label">Annual Income:</span>
      <span className="value">₹{formatIncome(income)}</span>
    </div>
  );
}
```

---

### 7. **Kundali Match Component**

```typescript
function KundaliMatchButton({ profileId }: { profileId: string }) {
  const [isPremium, setIsPremium] = useState(false);
  const [matchScore, setMatchScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    checkMembershipStatus().then(status => {
      setIsPremium(status.isPremium);
    });
  }, []);
  
  async function fetchKundaliMatch() {
    if (!isPremium) {
      showUpgradeModal();
      return;
    }
    
    setLoading(true);
    try {
      const response = await api.get(`/kundali/match/${profileId}`);
      setMatchScore(response.data);
    } catch (err: any) {
      if (err.error?.code === 'PREMIUM_REQUIRED') {
        showUpgradeModal();
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }
  
  if (!isPremium) {
    return (
      <div className="kundali-locked">
        <LockIcon />
        <p>Premium membership required for Kundali matching</p>
        <button onClick={() => navigate('/membership')}>
          Upgrade to Premium
        </button>
      </div>
    );
  }
  
  return (
    <div className="kundali-match">
      <button onClick={fetchKundaliMatch} disabled={loading}>
        {loading ? 'Calculating...' : 'View Kundali Match'}
      </button>
      {matchScore && <KundaliMatchResults score={matchScore} />}
      {error && <div className="error">{error}</div>}
    </div>
  );
}
```

---

### 8. **Utility Functions**

#### Check Premium Status

```typescript
export async function checkIsPremium(): Promise<boolean> {
  try {
    const response = await api.get('/membership/summary');
    return response.data.isPremium || false;
  } catch (error) {
    return false;
  }
}

// Check if interest is accepted
export async function checkAcceptedMatch(profileId: string): Promise<boolean> {
  try {
    const response = await api.get(`/activity/interests/status/${profileId}`);
    return response.data.isAccepted || false;
  } catch (error) {
    return false;
  }
}
```

#### Profile Data Helper

```typescript
// Check if name is available
export function hasName(profile: ProfileResponse | SearchProfileItem): boolean {
  return !profile.requiresPremiumForName && !!profile.firstName;
}

// Check if contact is available
export function hasContact(profile: ProfileResponse): boolean {
  return !profile.phoneLocked && !!profile.phone;
}

// Format profile name for display
export function formatProfileName(profile: ProfileResponse | SearchProfileItem): string {
  if (hasName(profile)) {
    return `${profile.firstName} ${profile.lastName}`;
  }
  return `Profile ID: ${profile.profileId}`;
}
```

---

### 9. **UI/UX Considerations**

#### Visual Indicators

1. **Name Lock Icon** - Show lock icon next to profile ID when name is locked
2. **Premium Badge** - Show "Premium Required" badge on locked fields
3. **Privacy Lock** - Show lock icon for photos/income when privacy restricted
4. **Upgrade CTA** - Prominent "Upgrade to Premium" buttons for locked features

#### User Experience Flow

```
User views profile
  ↓
Sees profile details (age, education, etc.) - ✅ Visible
  ↓
Name shows as "Profile ID: PM123ABC" with lock icon
  ↓
User can:
  - Upgrade to see name
  - View other details
  - Send interest to unlock photos/income (if private)
```

---

### 10. **Privacy Rules Summary**

| Field | Non-Premium | Premium | Privacy Rule |
|-------|-------------|---------|--------------|
| Profile ID | ✅ | ✅ | Always visible |
| Age | ✅ | ✅ | Always visible |
| Height | ✅ | ✅ | Always visible |
| Education | ✅ | ✅ | Always visible |
| Occupation | ✅ | ✅ | Always visible |
| City/State | ✅ | ✅ | Always visible |
| Religion/Caste | ✅ | ✅ | Always visible |
| About Me | ✅ | ✅ | Always visible |
| **Name** | ❌ | ✅ | Premium only |
| **Phone** | ❌ | ✅ | Premium only |
| **Kundali Match** | ❌ | ✅ | Premium only |
| Photos | ✅* | ✅* | If `photosPrivate=false` OR interest accepted |
| Income | ✅* | ✅* | If `incomePrivate=false` OR interest accepted |

*Subject to privacy settings and accepted interest

---

### 11. **Component Examples**

#### Locked Name Display

```tsx
{profile.requiresPremiumForName ? (
  <div className="name-locked">
    <LockIcon />
    <h2>Profile ID: {profile.profileId}</h2>
    <span className="premium-badge">Premium Required</span>
    <button onClick={() => navigate('/membership')}>
      Upgrade to View Name
    </button>
  </div>
) : (
  <h2>{profile.firstName} {profile.lastName}</h2>
)}
```

#### Privacy-Controlled Photos

```tsx
{profile.photosLocked ? (
  <div className="photos-locked">
    <LockIcon />
    <p>Photos are private</p>
    {!isAcceptedMatch ? (
      <button onClick={() => sendInterest(profileId)}>
        Send Interest to View Photos
      </button>
    ) : (
      <p>Waiting for interest acceptance</p>
    )}
  </div>
) : (
  <PhotoGallery photos={profile.photos} />
)}
```

#### Privacy-Controlled Income

```tsx
{profile.incomeLocked ? (
  <div className="income-locked">
    <LockIcon />
    <p>Income is private</p>
    {!isAcceptedMatch ? (
      <button onClick={() => sendInterest(profileId)}>
        Connect to View Income
      </button>
    ) : (
      <p>Waiting for interest acceptance</p>
    )}
  </div>
) : (
  <div>Annual Income: ₹{formatIncome(profile.income)}</div>
)}
```

---

## 📝 Summary of Changes

### What Non-Premium Users Can See:
✅ Profile ID  
✅ Age, Height  
✅ Education, Occupation  
✅ City, State  
✅ Religion, Caste  
✅ About Me  
✅ Photos (if not private OR interest accepted)  
✅ Income (if not private OR interest accepted)  

### What Non-Premium Users CANNOT See:
❌ First Name, Last Name  
❌ Phone Number  
❌ Kundali Match Score  

### Privacy Rules:
- `photosPrivate = true`: Photos only visible if interest is accepted
- `incomePrivate = true`: Income only visible if interest is accepted

### What Premium Users Can See:
✅ Everything non-premium users can see  
✅ First Name, Last Name  
✅ Phone Number (if privacy allows)  
✅ Kundali Match Score  

---

## ⚠️ Breaking Changes

1. **Name Fields** - `firstName` and `lastName` are now optional and only available for premium users
2. **Contact Field** - `phone` is now locked for non-premium users
3. **Kundali Match** - Requires premium membership
4. **Photos/Income** - Now respect privacy settings AND require accepted interest if private

---

## 🚀 Migration Steps

1. **Update TypeScript interfaces** - Make name fields optional, add lock flags
2. **Update profile display components** - Handle locked name/contact
3. **Update search/match components** - Show profile ID when name is locked
4. **Add privacy checks** - Check `photosLocked` and `incomeLocked` flags
5. **Add interest status check** - Check if interest is accepted for private photos/income
6. **Update Kundali match component** - Add premium check
7. **Add UI indicators** - Lock icons, premium badges
8. **Test all flows** - Premium/non-premium, with/without accepted interest

---

## 🎨 UI Component Library

### Lock Icon Component
```tsx
<LockIcon size={16} className="text-gray-500" />
```

### Premium Badge Component
```tsx
<span className="premium-badge">
  <CrownIcon /> Premium Required
</span>
```

### Upgrade Button Component
```tsx
<button className="btn-upgrade" onClick={() => navigate('/membership')}>
  Upgrade to Premium
</button>
```

---

**Last Updated:** 2024-01-15  
**API Version:** 1.0.0  
**Privacy Rules:** Updated
