import { apiSlice } from './apiSlice';
import type { ApiResponse, CreateKundaliRequest, Kundali, KundaliMatchResponse } from '@/types';

export const kundaliApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Create Kundali
    createKundali: builder.mutation<ApiResponse<Kundali>, CreateKundaliRequest>({
      query: (data) => ({
        url: '/kundali',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Kundali'],
    }),
    
    // Get Own Kundali
    getKundali: builder.query<ApiResponse<Kundali>, void>({
      query: () => '/kundali',
      providesTags: ['Kundali'],
    }),
    
    // Get Kundali Match (Premium Only)
    getKundaliMatch: builder.query<ApiResponse<KundaliMatchResponse>, string>({
      query: (profileId) => `/kundali/match/${profileId}`,
    }),
  }),
});

export const {
  useCreateKundaliMutation,
  useGetKundaliQuery,
  useGetKundaliMatchQuery,
  useLazyGetKundaliMatchQuery,
} = kundaliApi;

