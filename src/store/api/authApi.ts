import { apiSlice } from './apiSlice';
import type { ApiResponse, AuthResponse, AuthUser, SendOtpRequest, VerifyOtpRequest, ChangePhoneRequest, VerifyPhoneChangeRequest } from '@/types';

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Send OTP
    sendOtp: builder.mutation<ApiResponse<null>, SendOtpRequest>({
      query: (data) => ({
        url: '/auth/send-otp',
        method: 'POST',
        body: data,
      }),
    }),
    
    // Verify OTP
    verifyOtp: builder.mutation<ApiResponse<AuthResponse>, VerifyOtpRequest>({
      query: (data) => ({
        url: '/auth/verify-otp',
        method: 'POST',
        body: data,
      }),
    }),
    
    // Get Current User
    getMe: builder.query<ApiResponse<AuthUser>, void>({
      query: () => '/auth/me',
      providesTags: ['OwnProfile'],
    }),
    
    // Change Phone Number - Step 1
    changePhone: builder.mutation<ApiResponse<null>, ChangePhoneRequest>({
      query: (data) => ({
        url: '/auth/change-phone',
        method: 'POST',
        body: data,
      }),
    }),
    
    // Verify Phone Change - Step 2
    verifyPhoneChange: builder.mutation<ApiResponse<AuthUser>, VerifyPhoneChangeRequest>({
      query: (data) => ({
        url: '/auth/verify-phone-change',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['OwnProfile'],
    }),
  }),
});

export const {
  useSendOtpMutation,
  useVerifyOtpMutation,
  useGetMeQuery,
  useLazyGetMeQuery,
  useChangePhoneMutation,
  useVerifyPhoneChangeMutation,
} = authApi;

