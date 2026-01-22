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
  onTyping?: (data: SocketTyping) => void;
  onMessagesRead?: (data: SocketMessagesRead) => void;
  onMessagesDelivered?: (data: SocketMessagesDelivered) => void;
  onMessageDeleted?: (data: SocketMessageDeleted) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
};

class WebSocketService {
  private socket: Socket | null = null;
  private wsUrl: string;
  private handlers: SocketEventHandlers = {};
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second

  constructor() {
    // Get WebSocket URL from environment or derive from API URL
    const apiUrl = import.meta.env.VITE_API_URL || '/api';
    const wsUrl = import.meta.env.VITE_WS_URL;
    
    if (wsUrl) {
      this.wsUrl = wsUrl;
    } else {
      // Derive WebSocket URL from API URL
      // If API URL is /api, assume WebSocket is at root
      // If API URL is http://localhost:3000/api, assume WebSocket is at http://localhost:3000
      // If API URL is https://api.example.com/api, assume WebSocket is at https://api.example.com
      if (apiUrl.startsWith('http')) {
        try {
          const url = new URL(apiUrl);
          // Use wss:// for https:// and ws:// for http://
          const protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
          this.wsUrl = `${protocol}//${url.host}`;
        } catch (e) {
          // Fallback to same origin if URL parsing fails
          const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
          this.wsUrl = `${protocol}//${window.location.host}`;
        }
      } else {
        // Relative path, assume same origin
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        this.wsUrl = `${protocol}//${window.location.host}`;
      }
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
      reconnectionAttempts: this.maxReconnectAttempts,
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
        console.error('WebSocket connection error:', error);
      }
      this.handlers.onError?.(error);
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

    this.socket.on('typing', (data: SocketTyping) => {
      this.handlers.onTyping?.(data);
    });

    this.socket.on('messages_read', (data: SocketMessagesRead) => {
      this.handlers.onMessagesRead?.(data);
    });

    this.socket.on('messages_delivered', (data: SocketMessagesDelivered) => {
      this.handlers.onMessagesDelivered?.(data);
    });

    this.socket.on('message_deleted', (data: SocketMessageDeleted) => {
      this.handlers.onMessageDeleted?.(data);
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

  // Send typing indicator
  sendTyping(chatId: string) {
    if (this.socket?.connected) {
      this.socket.emit('typing', { chatId });
    }
  }

  // Join a chat room
  joinChat(chatId: string) {
    if (this.socket?.connected) {
      this.socket.emit('join_chat', { chatId });
    }
  }

  // Leave a chat room
  leaveChat(chatId: string) {
    if (this.socket?.connected) {
      this.socket.emit('leave_chat', { chatId });
    }
  }
}

// Singleton instance
export const webSocketService = new WebSocketService();

