# Frontend Cursor Prompt for PahadiMatch Integration

## Overview
This document provides cursor prompts and implementation guidance for frontend developers integrating with the PahadiMatch backend API.

---

## Quick Cursor Prompt

Use this prompt in Cursor to help build the frontend:

```
I'm building a matrimonial platform frontend (PahadiMatch) that needs to integrate with a Node.js backend API. 

Key Features Required:
1. Phone OTP authentication (signup/login)
2. Profile management with photo uploads
3. Match searching with advanced filters
4. Interest sending/accepting system
5. Real-time chat via WebSocket
6. Membership/subscription management
7. Privacy controls

Important Privacy Rules:
- Users only see profileId by default, never full names
- lastName visible only for connected users (accepted interest)
- Full name + contact only visible if:
  a) User has premium subscription AND
  b) User has called the "View Contact" API specifically for that profile
- Profile photos respect privacy settings
- Income visibility follows same rules as photos

API Base URL: http://localhost:5000/api
WebSocket URL: ws://localhost:5000

Authentication: JWT Bearer token in Authorization header

Please help me build React/Next.js components following these rules.
```

---

## API Response Structure

All API responses follow this format:
```typescript
interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

---

## Critical Privacy Implementation

### Profile Data Visibility Matrix

| Field | Non-Premium | Premium (No View Contact) | Premium (Viewed Contact) | Connected (Accepted Interest) |
|-------|-------------|---------------------------|--------------------------|-------------------------------|
| profileId | ✅ | ✅ | ✅ | ✅ |
| lastName | ❌ | ❌ | ✅ | ✅ |
| firstName | ❌ | ❌ | ✅ | ❌ |
| phone | ❌ | ❌ (masked) | ✅ | ❌ |
| photos | Profile only | Profile only | All | All (if privacy allows) |
| income | If public | If public | ✅ | ✅ (if accepted) |

### New Response Fields in Profile API

```typescript
interface ProfileResponse {
  // Basic info - always visible
  profileId: string;
  gender: string;
  age: number;
  height: number;
  // ... other basic fields
  
  // NAME VISIBILITY
  firstName?: string;      // Only if hasViewedContact=true
  lastName?: string;       // Only if connected OR hasViewedContact=true
  nameLocked: boolean;     // true if name is hidden
  requiresPremiumForName: boolean;
  
  // CONTACT VISIBILITY
  phone?: string;          // Full if hasViewedContact, masked otherwise
  phoneLocked: boolean;    // true if contact is hidden
  requiresPremiumForContact: boolean;
  
  // PHOTOS VISIBILITY
  photos: Array<{url: string; isProfilePhoto: boolean}>;
  photosLocked: boolean;   // true if only profile photo shown
  
  // INCOME VISIBILITY
  income?: number;
  incomeLocked: boolean;
  
  // STATUS FLAGS - NEW!
  hasViewedContact: boolean;        // Premium user has viewed this contact
  isConnected: boolean;             // Interest accepted (both ways)
  alreadySentInterest: boolean;     // Current user already sent interest
  sentInterestStatus?: string;      // 'pending' | 'accepted' | 'declined'
  receivedInterest: boolean;        // This profile sent interest to current user
  receivedInterestStatus?: string;  // 'pending' | 'accepted' | 'declined'
}
```

---

## Frontend Implementation Guide

### 1. Profile Card Component

```tsx
// ProfileCard.tsx
const ProfileCard = ({ profile }) => {
  // Determine what to show based on flags
  const showName = () => {
    if (profile.hasViewedContact) {
      return `${profile.firstName} ${profile.lastName}`;
    }
    if (profile.isConnected && profile.lastName) {
      return profile.lastName;
    }
    return profile.profileId; // Fallback to profileId
  };

  const showActionButton = () => {
    if (profile.isConnected) {
      return <Button onClick={openChat}>Message</Button>;
    }
    if (profile.alreadySentInterest) {
      return <Badge>{profile.sentInterestStatus}</Badge>;
    }
    if (profile.receivedInterest) {
      return (
        <>
          <Button onClick={acceptInterest}>Accept</Button>
          <Button onClick={declineInterest}>Decline</Button>
        </>
      );
    }
    return <Button onClick={sendInterest}>Send Interest</Button>;
  };

  const showPhoto = () => {
    if (profile.photos && profile.photos.length > 0) {
      return profile.photos[0].url;
    }
    return '/placeholder-avatar.png';
  };

  return (
    <Card>
      <img src={showPhoto()} alt="Profile" />
      <h3>{showName()}</h3>
      <p>{profile.age} years, {profile.city}</p>
      {profile.photosLocked && <LockIcon />}
      {showActionButton()}
      
      {/* View Contact Button for Premium Users */}
      {!profile.hasViewedContact && !profile.phoneLocked && (
        <Button onClick={() => viewContact(profile.profileId)}>
          View Contact
        </Button>
      )}
    </Card>
  );
};
```

### 2. View Contact API Flow

```tsx
// This is the critical API to unlock full profile details
const viewContact = async (profileId: string) => {
  try {
    // Check membership first
    const membershipRes = await api.get('/membership/summary');
    if (!membershipRes.data.isPremium) {
      showUpgradePrompt();
      return;
    }
    
    if (membershipRes.data.contactsRemaining <= 0) {
      showMessage('No contacts remaining. Please renew your membership.');
      return;
    }

    // Call View Contact API - THIS UNLOCKS FULL DETAILS
    const res = await api.post(`/membership/view-contact/${profileId}`);
    
    if (res.data.success) {
      // Refresh profile to get full details
      const profileRes = await api.get(`/profile/${profileId}`);
      setProfile(profileRes.data.data);
      
      showMessage(`Contact viewed. ${res.data.data.contactsRemaining} contacts remaining.`);
    }
  } catch (error) {
    handleError(error);
  }
};
```

### 3. Interest Handling

```tsx
const sendInterest = async (profileId: string) => {
  try {
    const res = await api.post('/activity/interest', { receiverProfileId: profileId });
    
    if (res.data.success) {
      showMessage('Interest sent successfully!');
      // Update UI to show "Interest Sent"
      setProfile(prev => ({
        ...prev,
        alreadySentInterest: true,
        sentInterestStatus: 'pending'
      }));
    }
  } catch (error) {
    if (error.response?.data?.message?.includes('limit')) {
      showMessage('Daily interest limit reached. Try again tomorrow.');
    } else {
      handleError(error);
    }
  }
};
```

### 4. Chat List Implementation

```tsx
// Chat list now shows lastName only (not full name) unless contact viewed
const ChatList = () => {
  const [chats, setChats] = useState([]);

  useEffect(() => {
    const loadChats = async () => {
      const res = await api.get('/chat');
      setChats(res.data.data);
    };
    loadChats();
  }, []);

  return (
    <List>
      {chats.map(chat => (
        <ListItem key={chat.id}>
          <Avatar src={chat.participant.profilePhoto} />
          <div>
            {/* Show full name only if hasViewedContact */}
            {chat.participant.hasViewedContact 
              ? `${chat.participant.firstName} ${chat.participant.lastName}`
              : chat.participant.lastName || chat.participant.profileId
            }
          </div>
          <Badge>{chat.unreadCount}</Badge>
        </ListItem>
      ))}
    </List>
  );
};
```

### 5. Who Viewed My Profile (Premium Only)

```tsx
const ProfileViews = () => {
  const [views, setViews] = useState([]);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    const loadViews = async () => {
      try {
        const res = await api.get('/profile/views');
        setViews(res.data.data);
        setIsPremium(true);
      } catch (error) {
        if (error.response?.data?.code === 'PREMIUM_REQUIRED') {
          setIsPremium(false);
        }
      }
    };
    loadViews();
  }, []);

  if (!isPremium) {
    return (
      <UpgradePrompt 
        message="Upgrade to Premium to see who viewed your profile"
      />
    );
  }

  return (
    <List>
      {views.map(view => (
        <ListItem key={view.profileId}>
          <Avatar src={view.profilePhoto} />
          <div>
            {/* Only lastName shown for viewers */}
            <strong>{view.lastName || view.profileId}</strong>
            <span>{view.age} years, {view.city}</span>
          </div>
          <small>Viewed {view.viewCount} times</small>
        </ListItem>
      ))}
    </List>
  );
};
```

### 6. Photo Upload

```tsx
const PhotoUpload = () => {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file: File, isProfilePhoto: boolean, isPrivate: boolean) => {
    const formData = new FormData();
    formData.append('photo', file);
    formData.append('isProfilePhoto', String(isProfilePhoto));
    formData.append('isPrivate', String(isPrivate));

    try {
      setUploading(true);
      const res = await api.post('/photos/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (res.data.success) {
        showMessage('Photo uploaded successfully!');
        refreshPhotos();
      }
    } catch (error) {
      if (error.response?.status === 503) {
        showMessage('Photo upload service is temporarily unavailable. Please try again later.');
      } else if (error.response?.status === 400) {
        showMessage(error.response.data.message);
      } else {
        showMessage('Failed to upload photo. Please try again.');
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input 
        type="file" 
        accept="image/jpeg,image/jpg,image/png"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            if (file.size > 8 * 1024 * 1024) {
              showMessage('File size must be less than 8MB');
              return;
            }
            handleUpload(file, false, false);
          }
        }}
      />
      {uploading && <Spinner />}
    </div>
  );
};
```

---

## New API Endpoints Summary

### Activity Module
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/activity/connections` | Get list of connected users (for messaging) |
| GET | `/api/activity/interest-limit` | Check daily interest limit status |
| POST | `/api/activity/interest` | Send interest to a profile |
| PUT | `/api/activity/interest/:interestId/respond` | Accept/decline interest |

### Membership Module
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/membership/view-contact/:profileId` | **View contact - unlocks full profile** |
| GET | `/api/membership/summary` | Get membership status with limits |

### Profile Module
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/profile/views` | Who viewed my profile (Premium only) |
| PUT | `/api/profile/notifications` | Update notification settings |

---

## WebSocket Events

### Connection
```javascript
const socket = io('ws://localhost:5000', {
  auth: { token: 'your-jwt-token' }
});
```

### Events
| Event | Direction | Description |
|-------|-----------|-------------|
| `join_chat` | Client → Server | Join a chat room |
| `send_message` | Client → Server | Send a message |
| `new_message` | Server → Client | Receive a message |
| `message_delivered` | Server → Client | Message delivery confirmation |
| `message_read` | Server → Client | Message read confirmation |
| `typing` | Both | User is typing indicator |

---

## Error Codes to Handle

| Code | Status | Meaning | UI Action |
|------|--------|---------|-----------|
| `PREMIUM_REQUIRED` | 403 | Feature needs premium | Show upgrade prompt |
| `CONTACT_LIMIT_REACHED` | 400 | No contacts remaining | Show renewal prompt |
| `DAILY_INTEREST_LIMIT` | 400 | Daily interest limit reached | Show message |
| `ALREADY_SENT` | 400 | Interest already sent | Update UI state |
| `BLOCKED` | 403 | User is blocked | Hide profile |

---

## Environment Variables for Frontend

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_WS_URL=ws://localhost:5000
NEXT_PUBLIC_APP_NAME=PahadiMatch
```

---

## Checklist for Frontend Implementation

- [ ] Authentication flow with OTP
- [ ] Profile creation/editing
- [ ] Photo upload with progress
- [ ] Search with filters
- [ ] Match categories display
- [ ] Interest send/accept/decline
- [ ] Chat with real-time messages
- [ ] Membership purchase flow
- [ ] View Contact API integration
- [ ] Privacy indicators (lock icons)
- [ ] Who viewed my profile (premium)
- [ ] Notification settings
- [ ] Profile views tracking
- [ ] Connected users list
- [ ] Daily interest limit display

