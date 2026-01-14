import { apiSlice } from './apiSlice';
import type { ApiResponse, SearchParams, SearchResultProfile, SaveSearchPreferencesRequest, Pagination } from '@/types';

// Helper to build query string from filters
const buildSearchQuery = (params: SearchParams): string => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        if (value.length > 0) {
          searchParams.append(key, value.join(','));
        }
      } else {
        searchParams.append(key, String(value));
      }
    }
  });
  
  return searchParams.toString();
};

export const searchApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Search Profiles
    searchProfiles: builder.query<
      ApiResponse<SearchResultProfile[]> & { pagination: Pagination },
      SearchParams
    >({
      query: (params) => `/search?${buildSearchQuery(params)}`,
      providesTags: ['Search'],
    }),
    
    // Save Search Preferences
    saveSearchPreferences: builder.mutation<ApiResponse<null>, SaveSearchPreferencesRequest>({
      query: (data) => ({
        url: '/search/save-preferences',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['OwnProfile'],
    }),
  }),
});

export const {
  useSearchProfilesQuery,
  useLazySearchProfilesQuery,
  useSaveSearchPreferencesMutation,
} = searchApi;

