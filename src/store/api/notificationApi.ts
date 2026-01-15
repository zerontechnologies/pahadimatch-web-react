import { apiSlice } from './apiSlice';
import type { ApiResponse, Notification, Pagination } from '@/types';


export const notificationApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get Notifications
    getNotifications: builder.query<
      ApiResponse<Notification[]> & { pagination: Pagination; unreadCount: number },
      { page?: number; limit?: number; unreadOnly?: boolean }
    >({
      query: ({ page = 1, limit = 20, unreadOnly = false }) => 
        `/notifications?page=${page}&limit=${limit}&unreadOnly=${unreadOnly}`,
      providesTags: ['Notifications'],
    }),
    
    // Get Unread Count
    getNotificationUnreadCount: builder.query<ApiResponse<{ unreadCount: number }>, void>({
      query: () => '/notifications/unread-count',
      providesTags: ['Notifications'],
    }),
    
    // Mark as Read
    markNotificationAsRead: builder.mutation<ApiResponse<null>, string>({
      query: (notificationId) => ({
        url: `/notifications/${notificationId}/read`,
        method: 'PUT',
      }),
      invalidatesTags: ['Notifications'],
    }),
    
    // Mark All as Read
    markAllNotificationsAsRead: builder.mutation<ApiResponse<null>, void>({
      query: () => ({
        url: '/notifications/read-all',
        method: 'PUT',
      }),
      invalidatesTags: ['Notifications'],
    }),
    
    // Delete Notification
    deleteNotification: builder.mutation<ApiResponse<null>, string>({
      query: (notificationId) => ({
        url: `/notifications/${notificationId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Notifications'],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetNotificationUnreadCountQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
  useDeleteNotificationMutation,
} = notificationApi;

