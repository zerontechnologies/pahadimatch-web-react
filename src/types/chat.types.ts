// ===== CHAT TYPES =====
export type MessageStatus = 'sent' | 'delivered' | 'read';

export interface ChatParticipant {
  profileId: string;
  firstName?: string;
  lastName?: string;
  profilePhoto?: string;
  isOnline?: boolean;
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

export interface SendMessageRequest {
  content: string;
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

