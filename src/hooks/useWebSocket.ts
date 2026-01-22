import { useEffect, useRef, useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { selectAuthToken, selectIsAuthenticated, selectCurrentUser } from '@/store/slices/authSlice';
import { webSocketService } from '@/lib/websocket';
import { chatApi } from '@/store/api/chatApi';
import { addToast } from '@/store/slices/uiSlice';
import type { 
  SocketNewMessage, 
  SocketMessageSent, 
  SocketTyping, 
  SocketMessagesRead,
  SocketMessagesDelivered,
  SocketMessageDeleted,
  MessageType
} from '@/types';

export function useWebSocket() {
  const dispatch = useAppDispatch();
  const token = useAppSelector(selectAuthToken);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const currentUser = useAppSelector(selectCurrentUser);
  const handlersRef = useRef<{
    onNewMessage?: (data: SocketNewMessage) => void;
    onMessageSent?: (data: SocketMessageSent) => void;
    onUserTyping?: (data: SocketTyping) => void;
    onUserStoppedTyping?: (data: SocketTyping) => void;
    onMessagesRead?: (data: SocketMessagesRead) => void;
    onMessagesDelivered?: (data: SocketMessagesDelivered) => void;
    onMessageDeleted?: (data: SocketMessageDeleted) => void;
  }>({});

  // Connect/disconnect based on authentication
  useEffect(() => {
    if (isAuthenticated && token) {
      webSocketService.connect(token);
    } else {
      webSocketService.disconnect();
    }

    return () => {
      webSocketService.disconnect();
      webSocketService.removeHandlers();
    };
  }, [isAuthenticated, token]);

  // Set up event handlers that update RTK Query cache
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('🔧 Setting up WebSocket handlers');
    }
    
    handlersRef.current = {
      onNewMessage: (data: SocketNewMessage) => {
        // Log for debugging (only in dev)
        if (import.meta.env.DEV) {
          console.log('📨 WebSocket handler: New message received', data);
        }

        // Get current user to determine receiverId
        const currentUserId = currentUser?.id || '';
        const isOwnMessage = currentUserId === data.senderId;
        
        // Update messages cache for the chat (if cache exists)
        const updateResult = dispatch(
          chatApi.util.updateQueryData(
            'getChatMessages',
            { chatId: data.chatId, limit: 50 },
            (draft) => {
              if (!draft?.data) {
                // Cache doesn't exist yet, create it
                draft.data = [];
              }
              
              // Check if message already exists (avoid duplicates)
              const existingIndex = draft.data.findIndex((msg) => msg.id === data.messageId);
              
              if (existingIndex === -1) {
                // Message doesn't exist, check if there's a temp message to replace (for sender's own messages)
                let tempMessageIndex = -1;
                if (isOwnMessage) {
                  // Find temp message with matching content (sent recently, within last 5 seconds)
                  const fiveSecondsAgo = Date.now() - 5000;
                  tempMessageIndex = draft.data.findIndex(
                    (msg) => msg.id.startsWith('temp-') && 
                             msg.content === data.content &&
                             msg.senderId === data.senderId &&
                             new Date(msg.createdAt).getTime() > fiveSecondsAgo
                  );
                }
                
                // Determine receiverId: if current user is not the sender, they are the receiver
                const receiverId = currentUserId && !isOwnMessage ? currentUserId : '';
                
                // Create new message object
                const newMessage = {
                  id: data.messageId,
                  chatId: data.chatId,
                  senderId: data.senderId,
                  receiverId: receiverId, // Always a string
                  content: data.content,
                  status: 'sent' as const,
                  createdAt: data.createdAt,
                  messageType: data.messageType,
                  isOwn: isOwnMessage,
                };
                
                if (tempMessageIndex !== -1) {
                  // Replace temp message with real message
                  draft.data[tempMessageIndex] = newMessage;
                } else {
                  // Determine message order: if messages are sorted by createdAt ascending (oldest first)
                  // add to end, otherwise add to beginning
                  const messages = draft.data;
                  if (messages.length === 0) {
                    messages.push(newMessage);
                  } else {
                    // Check if messages are sorted ascending (oldest first) or descending (newest first)
                    const isAscending = messages.length > 1 && 
                      new Date(messages[0].createdAt).getTime() < new Date(messages[messages.length - 1].createdAt).getTime();
                    
                    if (isAscending) {
                      // Oldest first: add new message to end
                      messages.push(newMessage);
                    } else {
                      // Newest first: add new message to beginning
                      messages.unshift(newMessage);
                    }
                  }
                }
              }
            }
          )
        );

        // If cache didn't exist, invalidate to trigger a refetch
        if (!updateResult) {
          // Cache doesn't exist, invalidate to trigger refetch when chat is opened
          dispatch(chatApi.util.invalidateTags([{ type: 'Messages', id: data.chatId }]));
        }

        // Always invalidate chat list to update last message and unread count
        dispatch(chatApi.util.invalidateTags(['Chats']));
      },

      onMessageSent: (data: SocketMessageSent) => {
        // Update message status in cache
        // This can also replace temp messages if the messageId matches a temp one
        dispatch(
          chatApi.util.updateQueryData(
            'getChatMessages',
            { chatId: data.chatId, limit: 50 },
            (draft) => {
              if (draft?.data) {
                // First try to find by exact messageId
                let message = draft.data.find((msg) => msg.id === data.messageId);
                
                // If not found and this is a sent status, it might be replacing a temp message
                // Find the most recent temp message (for sender's own messages)
                if (!message && data.status === 'sent') {
                  const tempMessages = draft.data.filter((msg) => msg.id.startsWith('temp-'));
                  if (tempMessages.length > 0) {
                    // Get the most recent temp message (should be the one we just sent)
                    const mostRecentTemp = tempMessages.sort((a, b) => 
                      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                    )[0];
                    if (mostRecentTemp) {
                      // Update the temp message with real ID and status
                      mostRecentTemp.id = data.messageId;
                      mostRecentTemp.status = data.status;
                      message = mostRecentTemp;
                    }
                  }
                }
                
                if (message) {
                  message.status = data.status;
                }
              }
            }
          )
        );
      },

      onMessagesRead: (_data: SocketMessagesRead) => {
        // Update chat list to reflect read status
        dispatch(chatApi.util.invalidateTags(['Chats']));
      },

      onMessagesDelivered: (data: SocketMessagesDelivered) => {
        // Update message delivery status
        dispatch(
          chatApi.util.updateQueryData(
            'getChatMessages',
            { chatId: data.chatId, limit: 50 },
            (draft) => {
              if (draft?.data) {
                // Mark messages as delivered (you may need to adjust this based on your API)
                draft.data.forEach((msg) => {
                  if (msg.status === 'sent') {
                    msg.status = 'delivered';
                  }
                });
              }
            }
          )
        );
      },

      onMessageDeleted: (data: SocketMessageDeleted) => {
        // Remove message from cache
        dispatch(
          chatApi.util.updateQueryData(
            'getChatMessages',
            { chatId: data.chatId, limit: 50 },
            (draft) => {
              if (draft?.data) {
                draft.data = draft.data.filter((msg) => msg.id !== data.messageId);
              }
            }
          )
        );
        // Invalidate chat list
        dispatch(chatApi.util.invalidateTags(['Chats']));
      },
    };

    // Set handlers (typing handlers are managed separately by useTypingIndicator)
    // Also set up error handler
    webSocketService.setHandlers({
      ...handlersRef.current,
      onError: (error: { message: string; code?: string }) => {
        if (import.meta.env.DEV) {
          console.error('❌ Socket error:', error);
        }
        
        // Handle specific error codes
        let title = 'Chat Error';
        let message = error.message || 'An error occurred';
        
        if (error.code === 'PREMIUM_REQUIRED') {
          title = 'Premium Required';
          message = 'Upgrade to premium to send custom messages. You can send predefined messages instead.';
        } else if (error.code === 'INTEREST_REQUIRED') {
          title = 'Connection Required';
          message = 'Both users must accept interest before chatting.';
        } else if (error.code === 'INVALID_PREDEFINED_MESSAGE') {
          title = 'Invalid Message';
          message = 'Invalid predefined message. Please select from available options.';
        }
        
        dispatch(addToast({
          type: 'error',
          title,
          message,
        }));
      },
    });
    
    if (import.meta.env.DEV) {
      console.log('✅ WebSocket handlers registered');
    }

    return () => {
      if (import.meta.env.DEV) {
        console.log('🧹 Cleaning up WebSocket handlers');
      }
      // Don't remove handlers on cleanup - we want them to persist
      // webSocketService.removeHandlers();
    };
  }, [dispatch, currentUser]);

  const sendMessage = useCallback((
    receiverProfileId: string,
    content: string,
    messageType: MessageType = 'custom'
  ) => {
    webSocketService.sendMessage(receiverProfileId, content, messageType);
  }, []);

  const sendTyping = useCallback((chatId: string, receiverProfileId: string) => {
    webSocketService.sendTyping(chatId, receiverProfileId);
  }, []);

  const stopTyping = useCallback((chatId: string, receiverProfileId: string) => {
    webSocketService.stopTyping(chatId, receiverProfileId);
  }, []);

  const joinChat = useCallback((chatId: string) => {
    webSocketService.joinChat(chatId);
  }, []);

  const leaveChat = useCallback((chatId: string) => {
    webSocketService.leaveChat(chatId);
  }, []);

  const markAsRead = useCallback((chatId: string) => {
    webSocketService.markAsRead(chatId);
  }, []);

  return {
    isConnected: webSocketService.isConnected(),
    sendMessage,
    sendTyping,
    stopTyping,
    joinChat,
    leaveChat,
    markAsRead,
  };
}

