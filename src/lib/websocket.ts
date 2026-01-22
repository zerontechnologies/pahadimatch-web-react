import { io, Socket } from 'socket.io-client';
import type { 
  SocketNewMessage, 
  SocketMessageSent, 
  SocketTyping, 
  SocketMessagesRead,
  SocketMessagesDelivered,
  SocketMessageDeleted
} from '@/types';

type SocketEventHandlers = {
  onNewMessage?: (data: SocketNewMessage) => void;
  onMessageSent?: (data: SocketMessageSent) => void;
  onUserTyping?: (data: SocketTyping) => void;
  onUserStoppedTyping?: (data: SocketTyping) => void;
  onMessagesRead?: (data: SocketMessagesRead) => void;
  onMessagesDelivered?: (data: SocketMessagesDelivered) => void;
  onMessageDeleted?: (data: SocketMessageDeleted) => void;
  onChatJoined?: (data: { chatId: string }) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: { message: string; code?: string }) => void;
};

class WebSocketService {
  private socket: Socket | null = null;
  private wsUrl: string;
  private handlers: SocketEventHandlers = {};
  private reconnectDelay = 1000; // Start with 1 second

  constructor() {
    // Get WebSocket URL from environment or derive from API URL
    const apiUrl = import.meta.env.VITE_API_URL || '/api';
    const wsUrl = import.meta.env.VITE_WS_URL;
    
    if (wsUrl) {
      // If VITE_WS_URL is set, use it directly (convert http/https to ws/wss)
      if (wsUrl.startsWith('http://')) {
        this.wsUrl = wsUrl.replace('http://', 'ws://');
      } else if (wsUrl.startsWith('https://')) {
        this.wsUrl = wsUrl.replace('https://', 'wss://');
      } else if (wsUrl.startsWith('ws://') || wsUrl.startsWith('wss://')) {
        this.wsUrl = wsUrl;
      } else {
        // If it's a relative path or just a host, assume ws://
        this.wsUrl = wsUrl.startsWith('ws') ? wsUrl : `ws://${wsUrl}`;
      }
    } else {
      // Derive WebSocket URL from API URL
      // If API URL is /api, try to get backend URL from vite proxy or use localhost:3000
      // If API URL is http://localhost:3000/api, assume WebSocket is at http://localhost:3000
      // If API URL is https://api.example.com/api, assume WebSocket is at https://api.example.com
      if (apiUrl.startsWith('http')) {
        try {
          const url = new URL(apiUrl);
          // Use wss:// for https:// and ws:// for http://
          const protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
          this.wsUrl = `${protocol}//${url.host}`;
        } catch (e) {
          // Fallback: if API URL parsing fails, try to use backend from vite proxy
          // Vite proxy typically forwards /api to http://localhost:3000
          // So WebSocket should be at ws://localhost:3000
          if (import.meta.env.DEV) {
            this.wsUrl = 'ws://localhost:3000';
          } else {
            // Production: use same origin
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            this.wsUrl = `${protocol}//${window.location.host}`;
          }
        }
      } else {
        // Relative path (/api) - in dev, vite proxy forwards to localhost:3000
        // So WebSocket should connect to ws://localhost:3000
        if (import.meta.env.DEV) {
          this.wsUrl = 'ws://localhost:3000';
        } else {
          // Production: use same origin
          const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
          this.wsUrl = `${protocol}//${window.location.host}`;
        }
      }
    }
    
    if (import.meta.env.DEV) {
      console.log('🔌 WebSocket URL configured:', this.wsUrl);
    }
  }

  connect(token: string) {
    // Don't reconnect if already connected with same token
    if (this.socket?.connected) {
      if (import.meta.env.DEV) {
        console.log('WebSocket already connected, reusing connection');
      }
      return; // Already connected
    }

    // Disconnect existing socket if any
    if (this.socket) {
      if (import.meta.env.DEV) {
        console.log('Disconnecting existing socket before reconnecting');
      }
      this.disconnect();
    }
    
    if (import.meta.env.DEV) {
      console.log('Connecting WebSocket to:', this.wsUrl);
    }
    
    this.socket = io(this.wsUrl, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'], // Try WebSocket first, fallback to polling
      reconnection: true,
      reconnectionDelay: this.reconnectDelay,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity, // Keep trying to reconnect indefinitely
      // Production-friendly settings
      upgrade: true,
      rememberUpgrade: true,
      // Timeout settings
      timeout: 20000,
      // Force new connection if token changes
      forceNew: false,
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    if (!this.socket) return;

    // Remove all existing listeners to avoid duplicates
    this.socket.removeAllListeners();

    this.socket.on('connect', () => {
      if (import.meta.env.DEV) {
        console.log('WebSocket connected, socket ID:', this.socket?.id);
        console.log('WebSocket handlers registered:', Object.keys(this.handlers).filter(k => this.handlers[k as keyof SocketEventHandlers]));
      }
      this.reconnectDelay = 1000; // Reset delay
      this.handlers.onConnect?.();
    });

    this.socket.on('disconnect', (reason) => {
      if (import.meta.env.DEV) {
        console.log('WebSocket disconnected:', reason);
      }
      this.handlers.onDisconnect?.();
    });

    this.socket.on('connect_error', (error) => {
      // Only log errors in development, avoid console spam in production
      if (import.meta.env.DEV) {
        console.error('❌ WebSocket connection error:', error.message || error);
        console.error('   Attempting to connect to:', this.wsUrl);
        console.error('   Error details:', error);
      }
      
      // Handle authentication errors
      if (error.message === 'Authentication failed' || error.message?.includes('auth')) {
        this.handlers.onError?.(error);
      } else {
        // For other connection errors, still call error handler but don't spam
        // The socket.io client will automatically retry
        if (import.meta.env.DEV) {
          console.log('   Socket.io will automatically retry connection...');
        }
      }
    });

    // Listen to ALL events for debugging (dev only)
    // Note: onAny might not be available in all socket.io versions
    if (import.meta.env.DEV && typeof this.socket.onAny === 'function') {
      this.socket.onAny((eventName: string, ...args: any[]) => {
        console.log('🔵 WebSocket received event:', eventName, args);
      });
    }

    // Chat events
    this.socket.on('new_message', (data: SocketNewMessage) => {
      if (import.meta.env.DEV) {
        console.log('✅ WebSocket event: new_message', data);
      }
      if (this.handlers.onNewMessage) {
        this.handlers.onNewMessage(data);
      } else {
        if (import.meta.env.DEV) {
          console.warn('⚠️ No handler registered for onNewMessage');
        }
      }
    });

    this.socket.on('message_sent', (data: SocketMessageSent) => {
      if (import.meta.env.DEV) {
        console.log('✅ WebSocket event: message_sent', data);
      }
      this.handlers.onMessageSent?.(data);
    });

    // Typing indicators (user_typing and user_stopped_typing)
    this.socket.on('user_typing', (data: SocketTyping) => {
      if (import.meta.env.DEV) {
        console.log('✅ WebSocket event: user_typing', data);
      }
      this.handlers.onUserTyping?.(data);
    });

    this.socket.on('user_stopped_typing', (data: SocketTyping) => {
      if (import.meta.env.DEV) {
        console.log('✅ WebSocket event: user_stopped_typing', data);
      }
      this.handlers.onUserStoppedTyping?.(data);
    });

    this.socket.on('messages_read', (data: SocketMessagesRead) => {
      if (import.meta.env.DEV) {
        console.log('✅ WebSocket event: messages_read', data);
      }
      this.handlers.onMessagesRead?.(data);
    });

    this.socket.on('messages_delivered', (data: SocketMessagesDelivered) => {
      if (import.meta.env.DEV) {
        console.log('✅ WebSocket event: messages_delivered', data);
      }
      this.handlers.onMessagesDelivered?.(data);
    });

    this.socket.on('message_deleted', (data: SocketMessageDeleted) => {
      if (import.meta.env.DEV) {
        console.log('✅ WebSocket event: message_deleted', data);
      }
      this.handlers.onMessageDeleted?.(data);
    });

    // Chat joined confirmation
    this.socket.on('chat_joined', (data: { chatId: string }) => {
      if (import.meta.env.DEV) {
        console.log('✅ WebSocket event: chat_joined', data);
      }
      this.handlers.onChatJoined?.(data);
    });

    // Error event
    this.socket.on('error', (error: { message: string; code?: string }) => {
      if (import.meta.env.DEV) {
        console.error('❌ WebSocket error event:', error);
      }
      this.handlers.onError?.(error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  setHandlers(handlers: SocketEventHandlers) {
    // Merge with existing handlers instead of replacing
    this.handlers = { ...this.handlers, ...handlers };
    
    if (import.meta.env.DEV) {
      console.log('📝 WebSocket handlers updated:', Object.keys(this.handlers).filter(k => this.handlers[k as keyof SocketEventHandlers]));
    }
  }

  removeHandlers(handlersToRemove?: Partial<SocketEventHandlers>) {
    if (handlersToRemove) {
      // Remove specific handlers
      Object.keys(handlersToRemove).forEach((key) => {
        delete this.handlers[key as keyof SocketEventHandlers];
      });
    } else {
      // Remove all handlers
      this.handlers = {};
    }
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  // Send message via socket (recommended for real-time)
  sendMessage(
    receiverProfileId: string,
    content: string,
    messageType: 'predefined' | 'custom' = 'custom'
  ) {
    if (this.socket?.connected) {
      if (import.meta.env.DEV) {
        console.log('📤 Emitting send_message:', { receiverProfileId, content, messageType });
      }
      this.socket.emit('send_message', {
        receiverProfileId,
        content,
        messageType,
      });
    } else {
      if (import.meta.env.DEV) {
        console.warn('⚠️ Cannot send message: socket not connected');
      }
    }
  }

  // Send typing indicator
  sendTyping(chatId: string, receiverProfileId: string) {
    if (this.socket?.connected) {
      this.socket.emit('typing', { chatId, receiverProfileId });
    }
  }

  // Stop typing indicator
  stopTyping(chatId: string, receiverProfileId: string) {
    if (this.socket?.connected) {
      this.socket.emit('stop_typing', { chatId, receiverProfileId });
    }
  }

  // Join a chat room (chatId should be string, not object)
  joinChat(chatId: string) {
    if (this.socket?.connected) {
      if (import.meta.env.DEV) {
        console.log('📥 Joining chat:', chatId);
      }
      this.socket.emit('join_chat', chatId);
    }
  }

  // Leave a chat room (chatId should be string, not object)
  leaveChat(chatId: string) {
    if (this.socket?.connected) {
      if (import.meta.env.DEV) {
        console.log('📤 Leaving chat:', chatId);
      }
      this.socket.emit('leave_chat', chatId);
    }
  }

  // Mark messages as read
  markAsRead(chatId: string) {
    if (this.socket?.connected) {
      if (import.meta.env.DEV) {
        console.log('👁️ Marking as read:', chatId);
      }
      this.socket.emit('mark_read', chatId);
    }
  }

  // Mark messages as delivered
  markAsDelivered(chatId: string) {
    if (this.socket?.connected) {
      if (import.meta.env.DEV) {
        console.log('📬 Marking as delivered:', chatId);
      }
      this.socket.emit('mark_delivered', chatId);
    }
  }

  // Delete message
  deleteMessage(messageId: string) {
    if (this.socket?.connected) {
      if (import.meta.env.DEV) {
        console.log('🗑️ Deleting message:', messageId);
      }
      this.socket.emit('delete_message', messageId);
    }
  }
}

// Singleton instance
export const webSocketService = new WebSocketService();

