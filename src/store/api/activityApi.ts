import { apiSlice } from './apiSlice';
import type { 
  ApiResponse, 
  SendInterestRequest, 
  Interest, 
  InterestSentResponse,
  InterestStatus,
  InterestLimitResponse,
  ShortlistRequest,
  ShortlistedProfile,
  BlockRequest,
  BlockedProfile,
  Connection,
  Pagination
} from '@/types';

export const activityApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Send Interest
    sendInterest: builder.mutation<ApiResponse<InterestSentResponse>, SendInterestRequest>({
      query: (data) => ({
        url: '/activity/interest',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Interests'],
    }),
    
    // Accept Interest
    acceptInterest: builder.mutation<ApiResponse<null>, string>({
      query: (interestId) => ({
        url: `/activity/interest/${interestId}/accept`,
        method: 'PUT',
      }),
      invalidatesTags: ['Interests', 'Chats'],
    }),
    
    // Decline Interest
    declineInterest: builder.mutation<ApiResponse<null>, string>({
      query: (interestId) => ({
        url: `/activity/interest/${interestId}/decline`,
        method: 'PUT',
      }),
      invalidatesTags: ['Interests'],
    }),
    
    // Get Received Interests
    getReceivedInterests: builder.query<
      ApiResponse<Interest[]> & { pagination: Pagination },
      { status?: InterestStatus; page?: number; limit?: number }
    >({
      query: ({ status, page = 1, limit = 20 }) => {
        let url = `/activity/interests/received?page=${page}&limit=${limit}`;
        if (status) url += `&status=${status}`;
        return url;
      },
      providesTags: ['Interests'],
    }),
    
    // Get Sent Interests
    getSentInterests: builder.query<
      ApiResponse<Interest[]> & { pagination: Pagination },
      { status?: InterestStatus; page?: number; limit?: number }
    >({
      query: ({ status, page = 1, limit = 20 }) => {
        let url = `/activity/interests/sent?page=${page}&limit=${limit}`;
        if (status) url += `&status=${status}`;
        return url;
      },
      providesTags: ['Interests'],
    }),
    
    // Shortlist Profile
    shortlistProfile: builder.mutation<ApiResponse<null>, ShortlistRequest>({
      query: (data) => ({
        url: '/activity/shortlist',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Shortlist'],
    }),
    
    // Remove from Shortlist
    removeFromShortlist: builder.mutation<ApiResponse<null>, string>({
      query: (profileId) => ({
        url: `/activity/shortlist/${profileId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Shortlist'],
    }),
    
    // Get Shortlisted Profiles
    getShortlistedProfiles: builder.query<
      ApiResponse<ShortlistedProfile[]> & { pagination: Pagination },
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 20 }) => `/activity/shortlist?page=${page}&limit=${limit}`,
      providesTags: ['Shortlist'],
    }),
    
    // Block Profile
    blockProfile: builder.mutation<ApiResponse<null>, BlockRequest>({
      query: (data) => ({
        url: '/activity/block',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Blocked', 'Chats'],
    }),
    
    // Unblock Profile
    unblockProfile: builder.mutation<ApiResponse<null>, string>({
      query: (profileId) => ({
        url: `/activity/block/${profileId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Blocked'],
    }),
    
    // Get Blocked Profiles
    getBlockedProfiles: builder.query<
      ApiResponse<BlockedProfile[]> & { pagination: Pagination },
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 20 }) => `/activity/blocked?page=${page}&limit=${limit}`,
      providesTags: ['Blocked'],
    }),
    
    // Get Connections (Accepted Interests)
    getConnections: builder.query<
      ApiResponse<Connection[]> & { pagination: Pagination },
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 20 }) => `/activity/connections?page=${page}&limit=${limit}`,
      providesTags: ['Interests', 'Chats'],
    }),
    
    // Get Interest Limit Status
    getInterestLimit: builder.query<ApiResponse<InterestLimitResponse>, void>({
      query: () => '/activity/interest-limit',
      providesTags: ['Interests'],
    }),
  }),
});

export const {
  useSendInterestMutation,
  useAcceptInterestMutation,
  useDeclineInterestMutation,
  useGetReceivedInterestsQuery,
  useLazyGetReceivedInterestsQuery,
  useGetSentInterestsQuery,
  useLazyGetSentInterestsQuery,
  useShortlistProfileMutation,
  useRemoveFromShortlistMutation,
  useGetShortlistedProfilesQuery,
  useBlockProfileMutation,
  useUnblockProfileMutation,
  useGetBlockedProfilesQuery,
  useGetConnectionsQuery,
  useGetInterestLimitQuery,
} = activityApi;

