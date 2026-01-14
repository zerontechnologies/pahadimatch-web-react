import { apiSlice } from './apiSlice';
import type { 
  ApiResponse, 
  Profile, 
  ProfileCreateRequest, 
  OwnProfileResponse, 
  ViewProfileResponse,
  PrivacySettings,
  PartnerPreferences,
  NotificationSettings,
  ProfileView,
  Pagination
} from '@/types';

export const profileApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get Own Profile
    getOwnProfile: builder.query<ApiResponse<OwnProfileResponse>, void>({
      query: () => '/profile',
      providesTags: ['OwnProfile'],
    }),
    
    // Create/Update Profile
    updateProfile: builder.mutation<ApiResponse<Profile>, ProfileCreateRequest>({
      query: (data) => ({
        url: '/profile',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['OwnProfile'],
    }),
    
    // View Another Profile
    getProfile: builder.query<ApiResponse<ViewProfileResponse>, string>({
      query: (profileId) => `/profile/${profileId}`,
      providesTags: (_result, _error, profileId) => [{ type: 'Profile', id: profileId }],
    }),
    
    // Update Privacy Settings
    updatePrivacy: builder.mutation<ApiResponse<PrivacySettings>, PrivacySettings>({
      query: (data) => ({
        url: '/profile/privacy',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['OwnProfile'],
    }),
    
    // Update Partner Preferences
    updatePreferences: builder.mutation<ApiResponse<PartnerPreferences>, PartnerPreferences>({
      query: (data) => ({
        url: '/profile/preferences',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['OwnProfile', 'Matches'],
    }),
    
    // Get Profile Views (Who Viewed Me)
    getProfileViews: builder.query<
      ApiResponse<ProfileView[]> & { pagination: Pagination },
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 20 }) => `/profile/views?page=${page}&limit=${limit}`,
      providesTags: ['ProfileViews'],
    }),

    // Update Notification Settings
    updateNotificationSettings: builder.mutation<ApiResponse<NotificationSettings>, NotificationSettings>({
      query: (data) => ({
        url: '/profile/notifications',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['OwnProfile'],
    }),
  }),
});

export const {
  useGetOwnProfileQuery,
  useLazyGetOwnProfileQuery,
  useUpdateProfileMutation,
  useGetProfileQuery,
  useLazyGetProfileQuery,
  useUpdatePrivacyMutation,
  useUpdatePreferencesMutation,
  useUpdateNotificationSettingsMutation,
  useGetProfileViewsQuery,
} = profileApi;

