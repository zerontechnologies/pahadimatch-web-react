# Realtime Chat Integration Guide

This guide explains how to integrate the PahadiMatch realtime chat system in your frontend application. The backend uses Socket.io for real-time bidirectional communication, ensuring instant message delivery across all user devices.

## Table of Contents

1. [Overview](#overview)
2. [Socket.io Client Setup](#socketio-client-setup)
3. [Connection & Authentication](#connection--authentication)
4. [Event Handlers](#event-handlers)
5. [Sending Messages](#sending-messages)
6. [Receiving Messages](#receiving-messages)
7. [Chat Management](#chat-management)
8. [Typing Indicators](#typing-indicators)
9. [Message Status Updates](#message-status-updates)
10. [Error Handling](#error-handling)
11. [Complete Example](#complete-example)
12. [Best Practices](#best-practices)

---

## Overview

The chat system supports:
- ✅ **Real-time message delivery** - Messages appear instantly without API calls
- ✅ **Multi-device support** - Users can be connected from multiple devices simultaneously
- ✅ **Typing indicators** - See when someone is typing
- ✅ **Read receipts** - Know when messages are read
- ✅ **Delivery status** - Track message delivery
- ✅ **Automatic reconnection** - Handles connection drops gracefully

---

## Socket.io Client Setup

### Installation

```bash
npm install socket.io-client
# or
yarn add socket.io-client
```

### Basic Connection Setup

```typescript
import { io, Socket } from 'socket.io-client';

// Get your API base URL from environment
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

// Get JWT token from your auth system
const token = localStorage.getItem('authToken'); // or your token storage

// Create socket connection
const socket: Socket = io(API_URL, {
  auth: {
    token: token, // JWT token for authentication
  },
  transports: ['websocket', 'polling'], // Fallback to polling if websocket fails
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: Infinity,
});
```

---

## Connection & Authentication

### Connect to Socket

The socket automatically authenticates using the JWT token provided in the `auth` object.

```typescript
// Connection event handlers
socket.on('connect', () => {
  console.log('✅ Connected to chat server');
  console.log('Socket ID:', socket.id);
  
  // User is now connected and can send/receive messages
  // All pending messages will be marked as delivered automatically
});

socket.on('disconnect', (reason) => {
  console.log('❌ Disconnected from chat server:', reason);
  
  if (reason === 'io server disconnect') {
    // Server disconnected the socket, reconnect manually
    socket.connect();
  }
  // Otherwise, socket.io will automatically try to reconnect
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
  
  if (error.message === 'Authentication failed') {
    // Token is invalid, redirect to login
    // Handle logout/redirect logic here
  }
});
```

### Re-authentication on Token Refresh

If your app refreshes tokens, update the socket connection:

```typescript
// When token is refreshed
function updateSocketToken(newToken: string) {
  socket.disconnect();
  socket.auth.token = newToken;
  socket.connect();
}
```

---

## Event Handlers

### 1. New Message Received

Listen for incoming messages:

```typescript
socket.on('new_message', (data) => {
  console.log('📨 New message received:', data);
  
  // Data structure:
  // {
  //   messageId: string,
  //   chatId: string,
  //   senderId: string,
  //   senderProfileId: string,
  //   content: string,
  //   messageType: 'predefined' | 'custom',
  //   createdAt: string (ISO date)
  // }
  
  // Add message to your chat state
  addMessageToChat(data.chatId, {
    id: data.messageId,
    senderId: data.senderId,
    senderProfileId: data.senderProfileId,
    content: data.content,
    messageType: data.messageType,
    createdAt: new Date(data.createdAt),
    status: 'delivered', // Just received
  });
  
  // Update UI, show notification, etc.
  updateChatUI(data.chatId);
  showNotification(data);
});
```

### 2. Message Sent Confirmation

When you send a message, get confirmation:

```typescript
socket.on('message_sent', (data) => {
  console.log('✅ Message sent confirmation:', data);
  
  // Data structure:
  // {
  //   messageId: string,
  //   chatId: string,
  //   status: 'sent' | 'delivered' | 'read',
  //   createdAt: string
  // }
  
  // Update message status in your state
  updateMessageStatus(data.messageId, data.status);
});
```

### 3. Messages Read

When recipient reads your messages:

```typescript
socket.on('messages_read', (data) => {
  console.log('👁️ Messages read:', data);
  
  // Data structure:
  // {
  //   chatId: string,
  //   readBy: string (profileId),
  //   readByUserId: string,
  //   readAt: string (ISO date)
  // }
  
  // Update all messages in this chat to 'read' status
  markChatMessagesAsRead(data.chatId);
});
```

### 4. Messages Delivered

When messages are delivered to recipient:

```typescript
socket.on('messages_delivered', (data) => {
  console.log('📬 Messages delivered:', data);
  
  // Data structure:
  // {
  //   chatId: string,
  //   deliveredTo: string (profileId),
  //   deliveredToUserId: string,
  //   deliveredAt: string (ISO date)
  // }
  
  // Update message status to 'delivered'
  markChatMessagesAsDelivered(data.chatId);
});
```

### 5. Message Deleted

When a message is deleted:

```typescript
socket.on('message_deleted', (data) => {
  console.log('🗑️ Message deleted:', data);
  
  // Data structure:
  // {
  //   messageId: string,
  //   deletedBy: string (profileId),
  //   deletedByUserId: string,
  //   deletedAt: string (ISO date)
  // }
  
  // Remove message from UI
  removeMessageFromChat(data.messageId);
});
```

### 6. Typing Indicators

```typescript
// User is typing
socket.on('user_typing', (data) => {
  // Data: { profileId: string, chatId: string, senderId: string }
  showTypingIndicator(data.chatId, data.profileId);
});

// User stopped typing
socket.on('user_stopped_typing', (data) => {
  // Data: { profileId: string, chatId: string, senderId: string }
  hideTypingIndicator(data.chatId, data.profileId);
});
```

### 7. Chat Joined Confirmation

```typescript
socket.on('chat_joined', (data) => {
  // Data: { chatId: string }
  console.log('Joined chat:', data.chatId);
  // Chat room joined successfully
});
```

### 8. Errors

```typescript
socket.on('error', (error) => {
  console.error('Socket error:', error);
  
  // Error structure: { message: string, code?: string }
  
  if (error.code === 'PREMIUM_REQUIRED') {
    // Show premium upgrade prompt
  } else if (error.code === 'INTEREST_REQUIRED') {
    // Show interest required message
  } else {
    // Show generic error
    showError(error.message);
  }
});
```

---

## Sending Messages

### Method 1: Via Socket (Recommended for Real-time)

```typescript
function sendMessage(
  receiverProfileId: string,
  content: string,
  messageType: 'predefined' | 'custom' = 'custom'
) {
  socket.emit('send_message', {
    receiverProfileId: receiverProfileId,
    content: content,
    messageType: messageType,
  });
  
  // Optimistically add message to UI
  const tempMessage = {
    id: 'temp-' + Date.now(),
    senderId: currentUserId,
    content: content,
    messageType: messageType,
    status: 'sending',
    createdAt: new Date(),
  };
  addMessageToChatOptimistically(tempMessage);
}
```

### Method 2: Via REST API (Fallback)

```typescript
async function sendMessageViaAPI(
  receiverProfileId: string,
  content: string,
  messageType: 'predefined' | 'custom' = 'custom'
) {
  try {
    const response = await fetch(
      `${API_URL}/api/chat/${receiverProfileId}/message`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ content, messageType }),
      }
    );
    
    const data = await response.json();
    
    if (data.success) {
      // Message sent - socket will receive confirmation
      return data.data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Failed to send message:', error);
    throw error;
  }
}
```

**Note:** When using REST API, the socket will still receive `new_message` event for the sent message, so your UI will update automatically.

---

## Receiving Messages

### Join Chat Room

When user opens a chat, join the chat room:

```typescript
function openChat(chatId: string) {
  // Join chat room to receive real-time updates
  socket.emit('join_chat', chatId);
  
  // Load initial messages via API
  loadChatMessages(chatId);
}

async function loadChatMessages(chatId: string) {
  try {
    const response = await fetch(
      `${API_URL}/api/chat/${chatId}/messages?page=1&limit=50`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );
    
    const data = await response.json();
    
    if (data.success) {
      // Add messages to state
      setChatMessages(chatId, data.data);
    }
  } catch (error) {
    console.error('Failed to load messages:', error);
  }
}
```

### Leave Chat Room

When user closes/leaves a chat:

```typescript
function closeChat(chatId: string) {
  socket.emit('leave_chat', chatId);
}
```

---

## Chat Management

### Get User's Chats

```typescript
async function getUserChats() {
  try {
    const response = await fetch(`${API_URL}/api/chat`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    const data = await response.json();
    
    if (data.success) {
      return data.data; // Array of chat objects
    }
  } catch (error) {
    console.error('Failed to load chats:', error);
  }
}
```

### Mark Messages as Read

```typescript
// Via Socket (Recommended)
function markAsRead(chatId: string) {
  socket.emit('mark_read', chatId);
}

// Via REST API (Alternative)
async function markAsReadViaAPI(chatId: string) {
  try {
    await fetch(`${API_URL}/api/chat/${chatId}/read`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error('Failed to mark as read:', error);
  }
}
```

### Mark Messages as Delivered

```typescript
// Automatically handled when user joins chat room
// Or manually:
socket.emit('mark_delivered', chatId);
```

### Delete Message

```typescript
// Via Socket
function deleteMessage(messageId: string) {
  socket.emit('delete_message', messageId);
}

// Via REST API
async function deleteMessageViaAPI(messageId: string) {
  try {
    await fetch(`${API_URL}/api/chat/message/${messageId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error('Failed to delete message:', error);
  }
}
```

---

## Typing Indicators

### Send Typing Indicator

```typescript
let typingTimeout: NodeJS.Timeout;

function handleTyping(chatId: string, receiverProfileId: string) {
  // Emit typing event
  socket.emit('typing', { chatId, receiverProfileId });
  
  // Auto-stop typing after 3 seconds of inactivity
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    socket.emit('stop_typing', { chatId, receiverProfileId });
  }, 3000);
}

function handleStopTyping(chatId: string, receiverProfileId: string) {
  clearTimeout(typingTimeout);
  socket.emit('stop_typing', { chatId, receiverProfileId });
}
```

### Receive Typing Indicator

```typescript
socket.on('user_typing', (data) => {
  // Show typing indicator in UI
  setTypingIndicator(data.chatId, data.profileId, true);
});

socket.on('user_stopped_typing', (data) => {
  // Hide typing indicator
  setTypingIndicator(data.chatId, data.profileId, false);
});
```

---

## Message Status Updates

### Status Flow

1. **Sending** → Message is being sent (optimistic UI state)
2. **Sent** → Message saved to database
3. **Delivered** → Message delivered to recipient's device(s)
4. **Read** → Recipient has read the message

### Update Status in UI

```typescript
function updateMessageStatus(messageId: string, status: 'sent' | 'delivered' | 'read') {
  // Update message in your state
  setMessages(prevMessages =>
    prevMessages.map(msg =>
      msg.id === messageId ? { ...msg, status } : msg
    )
  );
}
```

---

## Error Handling

### Connection Errors

```typescript
socket.on('connect_error', (error) => {
  if (error.message === 'Authentication failed') {
    // Token expired or invalid
    handleLogout();
  } else {
    // Network or server error
    showConnectionError();
  }
});
```

### Message Send Errors

```typescript
socket.on('error', (error) => {
  switch (error.code) {
    case 'PREMIUM_REQUIRED':
      showPremiumUpgradeModal();
      break;
    case 'INTEREST_REQUIRED':
      showInterestRequiredMessage();
      break;
    case 'INVALID_PREDEFINED_MESSAGE':
      showError('Invalid predefined message selected');
      break;
    default:
      showError(error.message || 'An error occurred');
  }
});
```

---

## Complete Example

### React Hook Example

```typescript
import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

export function useChatSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      console.error('No auth token found');
      return;
    }
    
    // Initialize socket
    const newSocket = io(API_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
    });
    
    // Connection events
    newSocket.on('connect', () => {
      console.log('✅ Connected to chat');
      setIsConnected(true);
    });
    
    newSocket.on('disconnect', () => {
      console.log('❌ Disconnected from chat');
      setIsConnected(false);
    });
    
    // Message events
    newSocket.on('new_message', (data) => {
      console.log('📨 New message:', data);
      setMessages(prev => [...prev, {
        id: data.messageId,
        chatId: data.chatId,
        senderId: data.senderId,
        content: data.content,
        messageType: data.messageType,
        createdAt: new Date(data.createdAt),
        status: 'delivered',
      }]);
    });
    
    newSocket.on('message_sent', (data) => {
      setMessages(prev =>
        prev.map(msg =>
          msg.id === data.messageId
            ? { ...msg, status: data.status }
            : msg
        )
      );
    });
    
    newSocket.on('messages_read', (data) => {
      setMessages(prev =>
        prev.map(msg =>
          msg.chatId === data.chatId && msg.senderId !== currentUserId
            ? { ...msg, status: 'read' }
            : msg
        )
      );
    });
    
    // Typing indicators
    newSocket.on('user_typing', (data) => {
      setTypingUsers(prev => new Set(prev).add(data.profileId));
    });
    
    newSocket.on('user_stopped_typing', (data) => {
      setTypingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(data.profileId);
        return newSet;
      });
    });
    
    // Errors
    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
      // Handle error in UI
    });
    
    setSocket(newSocket);
    
    // Cleanup
    return () => {
      newSocket.close();
    };
  }, []);
  
  const sendMessage = (
    receiverProfileId: string,
    content: string,
    messageType: 'predefined' | 'custom' = 'custom'
  ) => {
    if (socket && isConnected) {
      socket.emit('send_message', {
        receiverProfileId,
        content,
        messageType,
      });
    }
  };
  
  const joinChat = (chatId: string) => {
    if (socket && isConnected) {
      socket.emit('join_chat', chatId);
    }
  };
  
  const markAsRead = (chatId: string) => {
    if (socket && isConnected) {
      socket.emit('mark_read', chatId);
    }
  };
  
  return {
    socket,
    isConnected,
    messages,
    typingUsers,
    sendMessage,
    joinChat,
    markAsRead,
  };
}
```

### Usage in Component

```typescript
function ChatComponent({ chatId, receiverProfileId }: Props) {
  const { 
    isConnected, 
    messages, 
    typingUsers, 
    sendMessage, 
    joinChat, 
    markAsRead 
  } = useChatSocket();
  
  const [input, setInput] = useState('');
  
  useEffect(() => {
    if (chatId) {
      joinChat(chatId);
      markAsRead(chatId);
    }
  }, [chatId]);
  
  const handleSend = () => {
    if (input.trim() && isConnected) {
      sendMessage(receiverProfileId, input.trim());
      setInput('');
    }
  };
  
  return (
    <div className="chat-container">
      <div className="connection-status">
        {isConnected ? '🟢 Online' : '🔴 Offline'}
      </div>
      
      <div className="messages">
        {messages.map(msg => (
          <MessageComponent key={msg.id} message={msg} />
        ))}
      </div>
      
      {typingUsers.has(receiverProfileId) && (
        <div className="typing-indicator">
          {receiverProfileId} is typing...
        </div>
      )}
      
      <div className="input-area">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type a message..."
        />
        <button onClick={handleSend} disabled={!isConnected}>
          Send
        </button>
      </div>
    </div>
  );
}
```

---

## Best Practices

### 1. **Connection Management**
- ✅ Initialize socket once when user logs in
- ✅ Reuse the same socket instance across components
- ✅ Clean up on logout
- ✅ Handle reconnection automatically

### 2. **Message State Management**
- ✅ Use optimistic updates for sent messages
- ✅ Replace temporary messages with real ones when confirmed
- ✅ Handle duplicate messages (check messageId)
- ✅ Maintain message order

### 3. **Performance**
- ✅ Lazy load chat messages (pagination)
- ✅ Virtualize long message lists
- ✅ Debounce typing indicators
- ✅ Cache chat list locally

### 4. **Error Handling**
- ✅ Always have fallback to REST API
- ✅ Show user-friendly error messages
- ✅ Retry failed operations
- ✅ Handle offline scenarios

### 5. **Security**
- ✅ Never expose sensitive data in socket events
- ✅ Validate all user inputs
- ✅ Use HTTPS/WSS in production
- ✅ Implement rate limiting on frontend

### 6. **User Experience**
- ✅ Show connection status
- ✅ Display typing indicators
- ✅ Show message status (sent/delivered/read)
- ✅ Handle notifications properly
- ✅ Support multiple tabs/devices

---

## Testing

### Test Connection

```typescript
// Check if socket is connected
if (socket?.connected) {
  console.log('Socket is connected');
} else {
  console.log('Socket is not connected');
}
```

### Test Events

```typescript
// Listen to all events for debugging
socket.onAny((event, ...args) => {
  console.log('Event received:', event, args);
});
```

---

## Troubleshooting

### Messages not appearing in real-time
1. Check if socket is connected: `socket.connected`
2. Verify authentication token is valid
3. Check browser console for errors
4. Ensure you're listening to `new_message` event
5. Verify you've joined the chat room

### Connection keeps dropping
1. Check network stability
2. Verify server is running
3. Check CORS configuration
4. Verify token expiration
5. Check firewall/proxy settings

### Duplicate messages
1. Ensure you're not listening to events multiple times
2. Check if both socket and REST API are updating UI
3. Implement message deduplication by messageId

---

## API Endpoints Reference

While socket is recommended for real-time, REST API is available as fallback:

- `GET /api/chat` - Get user's chats
- `GET /api/chat/:chatId/messages` - Get chat messages
- `POST /api/chat/:profileId/message` - Send message
- `PUT /api/chat/:chatId/read` - Mark as read
- `DELETE /api/chat/message/:messageId` - Delete message
- `GET /api/chat/unread` - Get unread count
- `GET /api/chat/predefined-messages` - Get predefined messages
- `GET /api/chat/can-chat/:profileId` - Check if can chat

---

## Support

For issues or questions:
1. Check server logs for socket connection errors
2. Verify JWT token is valid and not expired
3. Ensure CORS is properly configured
4. Check network connectivity

---

**Happy Coding! 🚀**

