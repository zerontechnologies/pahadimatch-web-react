// ===== CHAT TYPES =====
export type MessageStatus = 'sent' | 'delivered' | 'read';

export interface ChatParticipant {
  profileId: string;
  firstName?: string; // Only if hasViewedContact
  lastName?: string; // Only if connected OR hasViewedContact
  profilePhoto?: string;
  isOnline?: boolean;
  hasViewedContact?: boolean; // Flag to determine if full name should be shown
  isConnected?: boolean; // Flag to determine if lastName should be shown
  isVerified?: boolean;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  receiverId: string;
  content: string;
  status: MessageStatus;
  createdAt: string;
  isOwn?: boolean;
  messageType?: MessageType; // 'predefined' or 'custom'
}

export interface Chat {
  id: string;
  participant: ChatParticipant;
  lastMessage: {
    content: string;
    createdAt: string;
    status: MessageStatus;
  };
  lastMessageAt: string;
  unreadCount: number;
}

export type MessageType = 'predefined' | 'custom';

export interface SendMessageRequest {
  content: string;
  messageType?: MessageType; // Optional, defaults to 'custom'
}

export interface CanChatResponse {
  allowed: boolean;
  reason?: string;
}

export interface UnreadCountResponse {
  unreadCount: number;
}

// WebSocket Events
export interface SocketNewMessage {
  messageId: string;
  chatId: string;
  senderId: string;
  senderProfileId: string;
  content: string;
  messageType?: MessageType; // 'predefined' or 'custom'
  createdAt: string;
}

export interface SocketMessageSent {
  messageId: string;
  chatId: string;
  status: MessageStatus;
}

export interface SocketTyping {
  profileId: string;
  chatId: string;
}

export interface SocketMessagesRead {
  chatId: string;
  readBy: string;
}

export interface SocketMessagesDelivered {
  chatId: string;
  deliveredTo: string;
}

export interface SocketMessageDeleted {
  messageId: string;
  deletedBy: string;
}

