# Frontend Messaging Updates - Predefined Messages

## 📋 Summary

Messaging has been updated to support **predefined messages** for connections (accepted interests) **without requiring subscription**. Custom messages still require premium membership.

---

## ✅ Changes

### 1. Predefined Messages for Connections (No Subscription Required)

**Before:**
- All messaging required premium membership
- Free users couldn't send any messages

**After:**
- **Predefined messages**: Available for connections (accepted interests) without subscription
- **Custom messages**: Still require premium membership

---

## 🔧 API Changes

### 1. Get Predefined Messages List

**Endpoint:** `GET /api/chat/predefined-messages`

**Response:**
```json
{
  "success": true,
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

**Usage:**
- Call this endpoint to get the list of predefined messages
- Display them as buttons/options in the chat UI for free users

---

### 2. Send Message (Updated)

**Endpoint:** `POST /api/chat/:profileId/message`

**Request Body:**
```json
{
  "content": "Hi, I liked your profile!",
  "messageType": "predefined"  // or "custom" (default)
}
```

**Fields:**
- `content` (required): Message text
- `messageType` (optional): `"predefined"` or `"custom"` (default: `"custom"`)

**Response:**
```json
{
  "success": true,
  "message": "Message sent",
  "data": {
    "_id": "...",
    "chatId": "...",
    "senderId": "...",
    "receiverId": "...",
    "content": "Hi, I liked your profile!",
    "messageType": "predefined",
    "status": "sent",
    "createdAt": "2026-01-16T10:00:00.000Z"
  }
}
```

**Error Responses:**

1. **Not Connected (No Accepted Interest):**
```json
{
  "success": false,
  "message": "Both users must accept interest before chatting",
  "code": "INTEREST_REQUIRED"
}
```

2. **Custom Message Without Premium:**
```json
{
  "success": false,
  "message": "Premium membership required for custom messages. You can send predefined messages instead.",
  "code": "PREMIUM_REQUIRED"
}
```

3. **Invalid Predefined Message:**
```json
{
  "success": false,
  "message": "Invalid predefined message. Please select from available options.",
  "code": "INVALID_PREDEFINED_MESSAGE"
}
```

---

### 3. Check Can Chat (Updated)

**Endpoint:** `GET /api/chat/can-chat/:profileId?messageType=predefined|custom`

**Query Parameters:**
- `messageType` (optional): `"predefined"` or `"custom"` (default: `"custom"`)

**Response:**
```json
{
  "success": true,
  "data": {
    "allowed": true,
    "reason": null
  }
}
```

**Example:**
- `GET /api/chat/can-chat/PM123ABC?messageType=predefined` - Check if can send predefined message
- `GET /api/chat/can-chat/PM123ABC?messageType=custom` - Check if can send custom message

---

## 🎨 UI/UX Implementation

### Chat Interface for Free Users (Connections)

1. **Show Predefined Messages:**
   - Display predefined messages as buttons/quick replies
   - Fetch list from `GET /api/chat/predefined-messages`
   - Show them above the message input field

2. **Message Input:**
   - For free users: **Disable custom message input** (or show upgrade prompt)
   - Only allow selection of predefined messages
   - Show message: "Upgrade to send custom messages"

3. **For Premium Users:**
   - Show both predefined messages (quick replies) and custom input
   - Allow typing custom messages

### Example UI Flow:

```
┌─────────────────────────────────────┐
│  Chat with [Last Name]              │
├─────────────────────────────────────┤
│  [Previous messages...]              │
├─────────────────────────────────────┤
│  Quick Messages:                    │
│  [Hi, I liked your profile!]        │
│  [Would you like to connect?]       │
│  [I'm interested in knowing...]    │
│  [Show more...]                     │
├─────────────────────────────────────┤
│  ┌─────────────────────────────┐   │
│  │ Type a message...            │   │
│  │ [Disabled for free users]    │   │
│  └─────────────────────────────┘   │
│  [Upgrade to send custom messages]  │
└─────────────────────────────────────┘
```

---

## 🔌 WebSocket Updates

### Send Message Event

**Event:** `send_message`

**Data:**
```json
{
  "receiverProfileId": "PM123ABC",
  "content": "Hi, I liked your profile!",
  "messageType": "predefined"  // or "custom"
}
```

**Response Events:**
- `message_sent` - Confirmation to sender
- `new_message` - Notification to receiver
- `chat_message` - Broadcast to chat room

**Updated Response:**
```json
{
  "messageId": "...",
  "chatId": "...",
  "content": "Hi, I liked your profile!",
  "messageType": "predefined",  // NEW FIELD
  "createdAt": "2026-01-16T10:00:00.000Z"
}
```

---

## 📝 Implementation Checklist

### Frontend Updates Required:

- [ ] Add API call to fetch predefined messages (`GET /api/chat/predefined-messages`)
- [ ] Display predefined messages as buttons/quick replies in chat UI
- [ ] Update send message API call to include `messageType` field
- [ ] For free users:
  - [ ] Disable custom message input
  - [ ] Only allow predefined message selection
  - [ ] Show upgrade prompt for custom messages
- [ ] For premium users:
  - [ ] Show both predefined and custom input
  - [ ] Allow typing custom messages
- [ ] Update WebSocket `send_message` event to include `messageType`
- [ ] Update message display to show `messageType` (optional, for UI distinction)
- [ ] Update error handling for new error codes:
  - [ ] `PREMIUM_REQUIRED` - Show upgrade prompt
  - [ ] `INVALID_PREDEFINED_MESSAGE` - Show error
  - [ ] `INTEREST_REQUIRED` - Show connection required message

---

## 🧪 Testing

### Test Cases:

1. **Free User - Predefined Messages:**
   - ✅ User has accepted interest (connection)
   - ✅ Can send predefined messages
   - ✅ Cannot send custom messages
   - ✅ Shows upgrade prompt for custom messages

2. **Free User - Not Connected:**
   - ✅ Cannot send any messages (predefined or custom)
   - ✅ Shows "Both users must accept interest" error

3. **Premium User:**
   - ✅ Can send both predefined and custom messages
   - ✅ All messaging features work

4. **Invalid Predefined Message:**
   - ✅ Sending custom text with `messageType: "predefined"` fails
   - ✅ Shows "Invalid predefined message" error

---

## 📊 Message Type Field

All messages now include a `messageType` field:

```typescript
enum MessageType {
  PREDEFINED = 'predefined',
  CUSTOM = 'custom'
}
```

**In API Responses:**
```json
{
  "messageType": "predefined"  // or "custom"
}
```

**Usage:**
- Use to distinguish message types in UI (optional styling)
- Use to determine if user can send custom messages
- Use for analytics/reporting

---

## 🔄 Backward Compatibility

- Existing messages without `messageType` will default to `"custom"`
- Old API calls without `messageType` will default to `"custom"`
- Existing chat functionality remains unchanged for premium users

---

## 📚 Example Code

### Fetch Predefined Messages:
```typescript
const response = await fetch('/api/chat/predefined-messages', {
  headers: { Authorization: `Bearer ${token}` }
});
const { data: predefinedMessages } = await response.json();
```

### Send Predefined Message:
```typescript
const response = await fetch(`/api/chat/${profileId}/message`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  },
  body: JSON.stringify({
    content: 'Hi, I liked your profile!',
    messageType: 'predefined'
  })
});
```

### Send Custom Message (Premium):
```typescript
const response = await fetch(`/api/chat/${profileId}/message`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  },
  body: JSON.stringify({
    content: 'Hello, how are you doing today?',
    messageType: 'custom'  // or omit (defaults to custom)
  })
});
```

### WebSocket Send:
```typescript
socket.emit('send_message', {
  receiverProfileId: 'PM123ABC',
  content: 'Hi, I liked your profile!',
  messageType: 'predefined'
});
```

---

## ❓ FAQ

**Q: Can free users send custom messages?**
A: No, only predefined messages are allowed for free users with connections.

**Q: What if a free user tries to send a custom message?**
A: They'll get a `PREMIUM_REQUIRED` error with message: "Premium membership required for custom messages. You can send predefined messages instead."

**Q: Can free users send messages to non-connections?**
A: No, both users must have accepted interest (be connected) before any messaging is allowed.

**Q: How many predefined messages are there?**
A: Currently 8 predefined messages. The list can be fetched from the API.

**Q: Can predefined messages be customized?**
A: No, predefined messages are fixed. Users must upgrade to send custom messages.

---

**Last Updated:** 2026-01-16
**Version:** 1.0

