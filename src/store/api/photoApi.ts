import { apiSlice } from './apiSlice';
import type { ApiResponse, Photo, PhotoUploadResponse, PhotoRequirements, ReorderPhotosRequest } from '@/types';

export const photoApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get My Photos
    getMyPhotos: builder.query<ApiResponse<Photo[]>, void>({
      query: () => '/photos',
      providesTags: ['Photos'],
    }),
    
    // Upload Photo
    uploadPhoto: builder.mutation<
      ApiResponse<PhotoUploadResponse>,
      { file: File; isProfilePhoto?: boolean; isPrivate?: boolean }
    >({
      query: ({ file, isProfilePhoto = false, isPrivate = false }) => {
        const formData = new FormData();
        formData.append('photo', file);
        formData.append('isProfilePhoto', String(isProfilePhoto));
        formData.append('isPrivate', String(isPrivate));
        
        return {
          url: '/photos/upload',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['Photos', 'OwnProfile'],
    }),
    
    // Check Photo Requirements
    getPhotoRequirements: builder.query<ApiResponse<PhotoRequirements>, void>({
      query: () => '/photos/requirements',
      providesTags: ['Photos'],
    }),
    
    // Set Profile Photo
    setProfilePhoto: builder.mutation<ApiResponse<null>, string>({
      query: (photoId) => ({
        url: `/photos/${photoId}/profile`,
        method: 'PUT',
      }),
      invalidatesTags: ['Photos', 'OwnProfile'],
    }),
    
    // Toggle Photo Privacy
    togglePhotoPrivacy: builder.mutation<ApiResponse<null>, string>({
      query: (photoId) => ({
        url: `/photos/${photoId}/privacy`,
        method: 'PUT',
      }),
      invalidatesTags: ['Photos'],
    }),
    
    // Reorder Photos
    reorderPhotos: builder.mutation<ApiResponse<null>, ReorderPhotosRequest>({
      query: (data) => ({
        url: '/photos/reorder',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Photos'],
    }),
    
    // Delete Photo
    deletePhoto: builder.mutation<ApiResponse<null>, string>({
      query: (photoId) => ({
        url: `/photos/${photoId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Photos', 'OwnProfile'],
    }),
  }),
});

export const {
  useGetMyPhotosQuery,
  useUploadPhotoMutation,
  useGetPhotoRequirementsQuery,
  useSetProfilePhotoMutation,
  useTogglePhotoPrivacyMutation,
  useReorderPhotosMutation,
  useDeletePhotoMutation,
} = photoApi;

