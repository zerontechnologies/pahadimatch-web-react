import { apiSlice } from './apiSlice';
import type { ApiResponse, MatchCategory, MatchCategoryInfo, MatchCategoryCount, MatchProfile, MatchScoreResponse, Pagination } from '@/types';

export const matchApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get Match Categories
    getMatchCategories: builder.query<ApiResponse<MatchCategoryInfo[]>, void>({
      query: () => '/matches/categories',
    }),
    
    // Get Match Category Counts (all categories with counts in one call)
    getMatchCategoryCounts: builder.query<ApiResponse<MatchCategoryCount[]>, void>({
      query: () => '/matches/categories/counts',
      providesTags: ['MatchCategoryCounts'],
    }),
    
    // Get Matches by Category
    getMatchesByCategory: builder.query<
      ApiResponse<MatchProfile[]> & { pagination: Pagination },
      { category: MatchCategory; page?: number; limit?: number }
    >({
      query: ({ category, page = 1, limit = 20 }) => 
        `/matches/${category}?page=${page}&limit=${limit}`,
      providesTags: (_result, _error, { category }) => [{ type: 'Matches', id: category }],
    }),
    
    // Get Match Score
    getMatchScore: builder.query<ApiResponse<MatchScoreResponse>, string>({
      query: (profileId) => `/matches/score/${profileId}`,
    }),
  }),
});

export const {
  useGetMatchCategoriesQuery,
  useGetMatchCategoryCountsQuery,
  useGetMatchesByCategoryQuery,
  useLazyGetMatchesByCategoryQuery,
  useGetMatchScoreQuery,
  useLazyGetMatchScoreQuery,
} = matchApi;

