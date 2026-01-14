import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { RootState } from '../index';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Base query with auth header
const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    // Set Content-Type for JSON requests
    // For FormData, we'll skip setting Content-Type in the mutation
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

// Base query with re-auth logic and FormData handling
const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  // Handle FormData - don't set Content-Type, let browser set it with boundary
  let modifiedArgs = args;
  if (typeof args === 'object' && 'body' in args && args.body instanceof FormData) {
    modifiedArgs = {
      ...args,
      prepareHeaders: (headers: Headers) => {
        headers.delete('Content-Type');
        const token = (api.getState() as RootState).auth.token;
        if (token) {
          headers.set('Authorization', `Bearer ${token}`);
        }
        return headers;
      },
    };
  }
  
  const result = await baseQuery(modifiedArgs, api, extraOptions);
  
  if (result.error && result.error.status === 401) {
    // Token expired or invalid - logout user
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    api.dispatch({ type: 'auth/logout' });
    window.location.href = '/login';
  }
  
  return result;
};

// Main API slice - all feature APIs will be injected here
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'Profile',
    'OwnProfile',
    'Photos',
    'Membership',
    'Search',
    'Matches',
    'Interests',
    'Shortlist',
    'Blocked',
    'Chats',
    'Messages',
    'Notifications',
    'Kundali',
    'ProfileViews',
  ],
  endpoints: () => ({}),
});

