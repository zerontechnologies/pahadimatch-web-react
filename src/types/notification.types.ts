// ===== NOTIFICATION TYPES =====
export type NotificationType =
  | 'profile_view'
  | 'interest_received'
  | 'interest_accepted'
  | 'interest_declined'
  | 'new_message'
  | 'shortlisted'
  | 'photo_request'
  | 'membership_expiring'
  | 'membership_expired'
  | 'new_match'
  | 'profile_verified'
  | 'system';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: {
    fromUserId?: string;
    profileId?: string;
    chatId?: string;
    [key: string]: string | undefined;
  };
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface NotificationListResponse {
  notifications: Notification[];
  unreadCount: number;
}

