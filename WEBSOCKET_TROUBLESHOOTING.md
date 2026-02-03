# WebSocket Troubleshooting Guide

## Current Issue: No logs when sending messages

### Symptoms:
- ✅ WebSocket connects (socket ID appears)
- ⚠️ New socket ID when clicking chat (shouldn't happen)
- ❌ No logs when sending message (neither sender nor receiver)

## Debugging Steps

### 1. Check Console Logs

When you send a message, you should see these logs in order:

**On Sender Side:**
1. `📤 Sending message:` - Message being sent via API
2. `✅ Message sent successfully:` - API response received
3. `🔵 WebSocket received event: new_message` - If backend emits to sender
4. `✅ WebSocket event: new_message` - Event handler triggered
5. `📨 WebSocket handler: New message received` - Handler processing

**On Receiver Side:**
1. `🔵 WebSocket received event: new_message` - Event received from backend
2. `✅ WebSocket event: new_message` - Event handler triggered
3. `📨 WebSocket handler: New message received` - Handler processing

### 2. If You See "Sending message" but No WebSocket Events

**Problem:** Backend is not emitting WebSocket events

**Check Backend:**
- Is the backend emitting `new_message` event after saving message?
- Is the backend emitting to the correct socket (receiver's socket)?
- Check backend logs to see if message is saved but event not emitted

### 3. If You See WebSocket Events but No Handler Logs

**Problem:** Handlers not registered or socket reconnected

**Check:**
- Look for "WebSocket handlers registered" log
- Check if socket ID changes (indicates reconnection)
- Verify handlers are set up before sending message

### 4. If Socket ID Changes When Clicking Chat

**Problem:** Socket is reconnecting unnecessarily

**Possible Causes:**
- Component unmounting/remounting
- Token changing
- WebSocket service being recreated

**Solution:** Socket should persist across navigation. Check if `useWebSocket` is being called multiple times.

## Expected Flow

```
User A sends message
  ↓
Frontend: POST /chat/:profileId/message
  ↓
Backend: Save message to DB
  ↓
Backend: Find User B's socket
  ↓
Backend: socket.to(userBSocketId).emit('new_message', {...})
  ↓
User B's Frontend: Receives 'new_message' event
  ↓
Frontend: Updates cache and UI
```

## Common Backend Issues

1. **Backend not emitting events**
   - Check if backend has WebSocket server running
   - Verify backend emits `new_message` after saving message
   - Check backend logs for errors

2. **Backend emitting to wrong socket**
   - Verify backend tracks which socket belongs to which user
   - Check if backend finds correct receiver's socket

3. **Backend using wrong event name**
   - Event must be exactly `new_message` (case-sensitive)
   - Check backend code for event name

4. **Backend not including required fields**
   - Must include: messageId, chatId, senderId, senderProfileId, content, createdAt
   - Check backend payload structure

## Testing Commands

Open browser console and run:

```javascript
// Check if WebSocket is connected
window.__REDUX_STORE__?.getState?.() // Check Redux state

// Check socket connection
// In console, you should see socket connection logs
```

## Next Steps

1. **Check Backend Logs** - Most likely issue is backend not emitting events
2. **Verify Event Name** - Backend must emit `new_message` (exact name)
3. **Check Socket Tracking** - Backend must track which socket belongs to which user
4. **Test with Postman/curl** - Send message via API and check if backend emits event

