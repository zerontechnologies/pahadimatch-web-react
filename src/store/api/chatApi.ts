import { apiSlice } from './apiSlice';
import type { 
  ApiResponse, 
  Chat, 
  ChatMessage, 
  SendMessageRequest, 
  CanChatResponse, 
  UnreadCountResponse,
  Pagination 
} from '@/types';

export const chatApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Check If Can Chat
    checkCanChat: builder.query<ApiResponse<CanChatResponse>, string>({
      query: (profileId) => `/chat/can-chat/${profileId}`,
    }),
    
    // Get Chat List
    getChatList: builder.query<ApiResponse<Chat[]>, void>({
      query: () => '/chat',
      providesTags: ['Chats'],
    }),
    
    // Send Message
    sendMessage: builder.mutation<
      ApiResponse<ChatMessage>,
      { profileId: string; data: SendMessageRequest }
    >({
      query: ({ profileId, data }) => ({
        url: `/chat/${profileId}/message`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Chats', 'Messages'],
    }),
    
    // Get Chat Messages
    getChatMessages: builder.query<
      ApiResponse<ChatMessage[]> & { pagination: Pagination },
      { chatId: string; page?: number; limit?: number }
    >({
      query: ({ chatId, page = 1, limit = 50 }) => 
        `/chat/${chatId}/messages?page=${page}&limit=${limit}`,
      providesTags: (_result, _error, { chatId }) => [{ type: 'Messages', id: chatId }],
    }),
    
    // Mark Messages as Read
    markMessagesAsRead: builder.mutation<ApiResponse<null>, string>({
      query: (chatId) => ({
        url: `/chat/${chatId}/read`,
        method: 'PUT',
      }),
      invalidatesTags: ['Chats'],
    }),
    
    // Delete Message
    deleteMessage: builder.mutation<ApiResponse<null>, string>({
      query: (messageId) => ({
        url: `/chat/message/${messageId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Messages', 'Chats'],
    }),
    
    // Get Unread Count
    getUnreadCount: builder.query<ApiResponse<UnreadCountResponse>, void>({
      query: () => '/chat/unread',
      providesTags: ['Chats'],
    }),
  }),
});

export const {
  useCheckCanChatQuery,
  useLazyCheckCanChatQuery,
  useGetChatListQuery,
  useSendMessageMutation,
  useGetChatMessagesQuery,
  useLazyGetChatMessagesQuery,
  useMarkMessagesAsReadMutation,
  useDeleteMessageMutation,
  useGetUnreadCountQuery,
} = chatApi;

