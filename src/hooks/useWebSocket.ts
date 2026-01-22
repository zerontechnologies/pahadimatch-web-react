import { useEffect, useRef, useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { selectAuthToken, selectIsAuthenticated, selectCurrentUser } from '@/store/slices/authSlice';
import { webSocketService } from '@/lib/websocket';
import { chatApi } from '@/store/api/chatApi';
import type { 
  SocketNewMessage, 
  SocketMessageSent, 
  SocketTyping, 
  SocketMessagesRead,
  SocketMessagesDelivered,
  SocketMessageDeleted
} from '@/types';

export function useWebSocket() {
  const dispatch = useAppDispatch();
  const token = useAppSelector(selectAuthToken);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const currentUser = useAppSelector(selectCurrentUser);
  const handlersRef = useRef<{
    onNewMessage?: (data: SocketNewMessage) => void;
    onMessageSent?: (data: SocketMessageSent) => void;
    onTyping?: (data: SocketTyping) => void;
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
              const exists = draft.data.some((msg) => msg.id === data.messageId);
              if (!exists) {
                // Determine receiverId: if current user is not the sender, they are the receiver
                // Otherwise, we need to get receiverId from the chat or leave it empty
                // For now, we'll set it based on who is viewing (if not sender, they're receiver)
                const receiverId = currentUserId && currentUserId !== data.senderId ? currentUserId : '';
                
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
                  isOwn: currentUserId === data.senderId,
                };
                
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
        dispatch(
          chatApi.util.updateQueryData(
            'getChatMessages',
            { chatId: data.chatId, limit: 50 },
            (draft) => {
              if (draft?.data) {
                const message = draft.data.find((msg) => msg.id === data.messageId);
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

    webSocketService.setHandlers(handlersRef.current);
    
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

  const sendTyping = useCallback((chatId: string) => {
    webSocketService.sendTyping(chatId);
  }, []);

  const joinChat = useCallback((chatId: string) => {
    webSocketService.joinChat(chatId);
  }, []);

  const leaveChat = useCallback((chatId: string) => {
    webSocketService.leaveChat(chatId);
  }, []);

  return {
    isConnected: webSocketService.isConnected(),
    sendTyping,
    joinChat,
    leaveChat,
  };
}

