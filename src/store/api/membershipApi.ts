import { apiSlice } from './apiSlice';
import type { 
  ApiResponse, 
  MembershipPlan, 
  MembershipSummary, 
  MembershipPurchaseRequest, 
  MembershipPurchaseResponse,
  ViewContactResponse 
} from '@/types';

export const membershipApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get Available Plans
    getPlans: builder.query<ApiResponse<MembershipPlan[]>, void>({
      query: () => '/membership/plans',
    }),
    
    // Get Membership Summary
    getMembershipSummary: builder.query<ApiResponse<MembershipSummary>, void>({
      query: () => '/membership/summary',
      providesTags: ['Membership'],
    }),
    
    // Purchase Membership
    purchaseMembership: builder.mutation<ApiResponse<MembershipPurchaseResponse>, MembershipPurchaseRequest>({
      query: (data) => ({
        url: '/membership/purchase',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Membership'],
    }),
    
    // View Contact (Uses Contact Quota)
    viewContact: builder.mutation<ApiResponse<ViewContactResponse>, string>({
      query: (profileId) => ({
        url: `/membership/view-contact/${profileId}`,
        method: 'POST',
      }),
      invalidatesTags: ['Membership', 'Profile'],
    }),
    
    // Get Membership History
    getMembershipHistory: builder.query<ApiResponse<MembershipPurchaseResponse[]>, void>({
      query: () => '/membership/history',
    }),
  }),
});

export const {
  useGetPlansQuery,
  useGetMembershipSummaryQuery,
  useLazyGetMembershipSummaryQuery,
  usePurchaseMembershipMutation,
  useViewContactMutation,
  useGetMembershipHistoryQuery,
} = membershipApi;

