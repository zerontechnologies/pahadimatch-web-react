# Frontend Privacy Rules - Complete Guide

## 🔒 Critical Privacy Rules

### **LastName Visibility Rules**

**LastName is ONLY visible for:**
1. ✅ **Connected Users** (accepted interests) - Shows `lastName` only
2. ✅ **Received Interests** (users who sent interest to you) - Shows `lastName` only

**LastName is NOT visible for:**
- ❌ Shortlisted profiles - Only `profileId`
- ❌ Sent interests - Only `profileId`
- ❌ Blocked users - Only `profileId`
- ❌ Search results - Only `profileId` (unless connected/received)
- ❌ Match categories - Only `profileId` (unless connected/received)

### **Contact/Name/Photos Visibility Rules**

**Contact, Full Name, and All Photos are ONLY visible if:**
1. ✅ **Premium user has used "View Contact" API** - Shows everything (firstName, lastName, phone, all photos, income)

**Otherwise:**
- ❌ Even premium users (without using API) - No contact, no firstName
- ❌ Connected users - Only `lastName`, no contact, no firstName
- ❌ Non-premium users - Only `profileId`, no name, no contact

**Important:** Once "View Contact" API is used, all subsequent profile views will show full details automatically.

---

## 📋 API Response Examples

### 1. **Shortlisted Profiles** - `GET /api/activity/shortlist`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "profileId": "PM123ABC",
      "age": 28,
      "city": "Dehradun",
      "state": "Uttarakhand",
      "education": "masters",
      "occupation": "engineer",
      "religion": "hindu",
      "profilePhoto": "https://...", // Only if not private or connected
      "isConnected": false,
      "shortlistedAt": "2024-01-15T10:00:00.000Z"
      // NO lastName unless connected or received interest
    },
    {
      "profileId": "PM456DEF",
      "lastName": "Verma", // Only if connected or received interest
      "age": 26,
      "city": "Delhi",
      "profilePhoto": "https://...",
      "isConnected": true, // Connected - shows lastName
      "shortlistedAt": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

**UI Implementation:**
```tsx
{profile.lastName ? (
  <h3>{profile.lastName}</h3>
) : (
  <h3>Profile ID: {profile.profileId}</h3>
)}
```

---

### 2. **Sent Interests** - `GET /api/activity/interests/sent`

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
        "age": 26,
        "city": "Delhi",
        "education": "bachelors",
        "occupation": "engineer",
        "religion": "hindu",
        "profilePhoto": "https://...", // Based on privacy
        "isConnected": false
        // NO lastName - only profileId
      }
    }
  ]
}
```

**UI Implementation:**
```tsx
<div className="interest-card">
  <img src={interest.profile.profilePhoto || placeholder} />
  <h3>Profile ID: {interest.profile.profileId}</h3>
  <p>Age: {interest.profile.age} • {interest.profile.city}</p>
  <p>Status: {interest.status}</p>
</div>
```

---

### 3. **Received Interests** - `GET /api/activity/interests/received`

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
        "lastName": "Verma", // ✅ Shows lastName (received interest)
        "age": 26,
        "city": "Delhi",
        "education": "bachelors",
        "occupation": "engineer",
        "religion": "hindu",
        "profilePhoto": "https://...",
        "isConnected": false
      }
    }
  ]
}
```

**UI Implementation:**
```tsx
<div className="interest-card">
  <img src={interest.profile.profilePhoto || placeholder} />
  <h3>{interest.profile.lastName}</h3> {/* Shows lastName */}
  <p>Age: {interest.profile.age} • {interest.profile.city}</p>
  <button onClick={() => acceptInterest(interest.id)}>Accept</button>
</div>
```

---

### 4. **Blocked Profiles** - `GET /api/activity/blocked`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "profileId": "PM789GHI",
      "blockedAt": "2024-01-15T10:00:00.000Z"
      // NO lastName - only profileId
    },
    {
      "profileId": "PM123ABC",
      "lastName": "Sharma", // Only if connected or received interest
      "blockedAt": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

---

### 5. **Connected Users** - `GET /api/activity/connections`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "profileId": "PM456DEF",
      "lastName": "Verma", // ✅ Shows lastName (connected)
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
      // NO firstName, NO contact
    }
  ]
}
```

---

### 6. **View Profile** - `GET /api/profile/:profileId`

**Response (Premium User - NOT used View Contact API):**
```json
{
  "success": true,
  "data": {
    "profileId": "PM123ABC",
    "gender": "male",
    "age": 28,
    "height": 175,
    "city": "Dehradun",
    "state": "Uttarakhand",
    "education": "masters",
    "occupation": "engineer",
    "religion": "hindu",
    "caste": "Brahmin",
    "aboutMe": "Looking for...",
    "photos": [...], // Only if not private or connected
    "photosLocked": false,
    "income": 1500000, // Only if not private or connected
    "incomeLocked": false,
    "phone": "98******10", // Masked
    "phoneLocked": true,
    "nameLocked": true, // No name visible
    "requiresPremiumForName": false, // Premium but haven't used API
    "hasViewedContact": false,
    "isPremiumRequired": false
  }
}
```

**Response (Premium User - USED View Contact API):**
```json
{
  "success": true,
  "data": {
    "profileId": "PM123ABC",
    "firstName": "Rahul", // ✅ Full name visible
    "lastName": "Sharma",
    "gender": "male",
    "age": 28,
    "height": 175,
    "city": "Dehradun",
    "state": "Uttarakhand",
    "education": "masters",
    "occupation": "engineer",
    "religion": "hindu",
    "caste": "Brahmin",
    "aboutMe": "Looking for...",
    "photos": [...], // ✅ All photos visible (privacy bypassed)
    "photosLocked": false,
    "income": 1500000, // ✅ Income visible (privacy bypassed)
    "incomeLocked": false,
    "phone": "+919876543210", // ✅ Full phone visible
    "phoneLocked": false,
    "nameLocked": false,
    "requiresPremiumForName": false,
    "hasViewedContact": true, // ✅ Indicates contact was viewed
    "isPremiumRequired": false
  }
}
```

**Response (Connected User - Accepted Interest):**
```json
{
  "success": true,
  "data": {
    "profileId": "PM123ABC",
    "lastName": "Sharma", // ✅ Only lastName visible
    "gender": "male",
    "age": 28,
    "height": 175,
    "city": "Dehradun",
    "photos": [...], // ✅ All photos visible (connected)
    "photosLocked": false,
    "income": 1500000, // ✅ Income visible if not private
    "incomeLocked": false,
    "phone": "98******10", // ❌ Still masked
    "phoneLocked": true,
    "nameLocked": false, // lastName is visible
    "requiresPremiumForName": false,
    "hasViewedContact": false,
    "isConnected": true
  }
}
```

---

## 🎯 UI Component Examples

### Profile Card Component

```tsx
function ProfileCard({ profile }: { profile: any }) {
  const displayName = profile.lastName 
    ? profile.lastName 
    : `Profile ID: ${profile.profileId}`;

  return (
    <div className="profile-card">
      {profile.photoLocked ? (
        <div className="photo-locked">
          <LockIcon />
          <span>Private Photo</span>
        </div>
      ) : profile.profilePhoto ? (
        <img src={profile.profilePhoto} alt="Profile" />
      ) : (
        <div className="no-photo">
          <UserIcon />
        </div>
      )}
      
      <h3>{displayName}</h3>
      
      <div className="profile-info">
        <p>Age: {profile.age} • {profile.city}</p>
        <p>{profile.education} • {profile.occupation}</p>
      </div>
      
      {!profile.lastName && (
        <p className="name-locked">
          <LockIcon /> Name hidden
        </p>
      )}
    </div>
  );
}
```

### Interest List Component

```tsx
function InterestList({ interests, type }: { interests: any[], type: 'sent' | 'received' }) {
  return (
    <div className="interest-list">
      {interests.map(interest => (
        <div key={interest.id} className="interest-item">
          <img 
            src={interest.profile.profilePhoto || placeholder} 
            alt="Profile"
          />
          
          <div className="interest-info">
            {type === 'received' && interest.profile.lastName ? (
              <h3>{interest.profile.lastName}</h3>
            ) : (
              <h3>Profile ID: {interest.profile.profileId}</h3>
            )}
            
            <p>Age: {interest.profile.age} • {interest.profile.city}</p>
            <p>Status: {interest.status}</p>
            
            {type === 'received' && interest.status === 'pending' && (
              <div className="actions">
                <button onClick={() => acceptInterest(interest.id)}>
                  Accept
                </button>
                <button onClick={() => declineInterest(interest.id)}>
                  Decline
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
```

### Profile View Component

```tsx
function ProfileView({ profileId }: { profileId: string }) {
  const [profile, setProfile] = useState<any>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [hasViewedContact, setHasViewedContact] = useState(false);
  
  useEffect(() => {
    fetchProfile(profileId).then(data => {
      setProfile(data);
      setHasViewedContact(data.hasViewedContact);
    });
    
    checkMembership().then(status => {
      setIsPremium(status.isPremium);
    });
  }, [profileId]);
  
  async function handleViewContact() {
    if (!isPremium) {
      showUpgradeModal();
      return;
    }
    
    try {
      await viewContact(profileId);
      
      // Refresh profile - now will show full details
      const updated = await fetchProfile(profileId);
      setProfile(updated);
      setHasViewedContact(true);
    } catch (error) {
      // Handle error
    }
  }
  
  if (!profile) return <Loading />;
  
  const displayName = profile.hasViewedContact 
    ? `${profile.firstName} ${profile.lastName}`
    : profile.lastName 
      ? profile.lastName 
      : `Profile ID: ${profile.profileId}`;
  
  return (
    <div className="profile-view">
      <div className="profile-header">
        <h1>{displayName}</h1>
        
        {!profile.hasViewedContact && isPremium && (
          <button onClick={handleViewContact} className="btn-view-contact">
            View Contact & Full Name
          </button>
        )}
      </div>
      
      {/* Profile details */}
      <div className="profile-details">
        <Detail label="Age" value={profile.age} />
        <Detail label="City" value={profile.city} />
        <Detail label="Education" value={profile.education} />
        <Detail label="Occupation" value={profile.occupation} />
      </div>
      
      {/* Photos */}
      {profile.photosLocked ? (
        <div className="photos-locked">
          <LockIcon />
          <p>Photos are private</p>
        </div>
      ) : (
        <PhotoGallery photos={profile.photos} />
      )}
      
      {/* Contact */}
      {profile.phoneLocked ? (
        <div className="contact-locked">
          <LockIcon />
          {isPremium && !hasViewedContact ? (
            <button onClick={handleViewContact}>
              View Contact
            </button>
          ) : (
            <p>Premium required to view contact</p>
          )}
        </div>
      ) : (
        <Detail label="Phone" value={profile.phone} />
      )}
    </div>
  );
}
```

---

## 🔑 Key Rules Summary

| Scenario | ProfileId | LastName | FirstName | Contact | Photos |
|----------|-----------|----------|-----------|---------|--------|
| **Shortlisted** | ✅ | ❌* | ❌ | ❌ | If not private or connected |
| **Sent Interest** | ✅ | ❌ | ❌ | ❌ | If not private or accepted |
| **Received Interest** | ✅ | ✅ | ❌ | ❌ | If not private or accepted |
| **Blocked** | ✅ | ❌* | ❌ | ❌ | ❌ |
| **Connected** | ✅ | ✅ | ❌ | ❌ | ✅ All |
| **Premium (No API)** | ✅ | ❌ | ❌ | ❌ | If not private or connected |
| **Premium (Used API)** | ✅ | ✅ | ✅ | ✅ | ✅ All |

*LastName only if connected or received interest

---

## 🚨 Important Notes

1. **Always check `lastName` field** - If present, show it; if not, show `profileId`
2. **Check `hasViewedContact`** - If `true`, show full details; if `false`, show limited
3. **Check `isConnected`** - If `true`, show `lastName` and all photos
4. **Never show contact** unless `hasViewedContact === true`
5. **Never show firstName** unless `hasViewedContact === true`
6. **Once "View Contact" API is used**, all subsequent views show full details automatically

---

## 📱 Frontend Implementation Checklist

- [ ] Update all list components to check for `lastName` before displaying
- [ ] Show "Profile ID: XXX" when `lastName` is not available
- [ ] Add "View Contact" button for premium users (when `hasViewedContact === false`)
- [ ] Hide contact/phone fields unless `hasViewedContact === true`
- [ ] Show lock icons for locked fields
- [ ] Update search/match results to respect lastName visibility
- [ ] Update shortlist/sent interests to show only profileId
- [ ] Update received interests to show lastName
- [ ] Update connected users to show lastName
- [ ] Test all scenarios with different membership levels

---

**Last Updated:** 2024-01-15  
**Version:** 2.0.0

