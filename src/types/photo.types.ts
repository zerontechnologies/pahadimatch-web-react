// ===== PHOTO TYPES =====
export interface Photo {
  id: string;
  url: string;
  isProfilePhoto: boolean;
  isPrivate: boolean;
  order: number;
  isApproved: boolean;
  createdAt: string;
}

export interface PhotoUploadResponse {
  id: string;
  url: string;
  isProfilePhoto: boolean;
  isPrivate: boolean;
  order: number;
  isApproved: boolean;
  createdAt: string;
}

export interface PhotoRequirements {
  count: number;
  hasMinimum: boolean;
  hasProfilePhoto: boolean;
  remaining: number;
}

export interface ReorderPhotosRequest {
  photoOrder: string[];
}

// Photo Constraints
export const PHOTO_CONSTRAINTS = {
  maxFileSize: 8 * 1024 * 1024, // 8MB
  allowedTypes: ['image/jpeg', 'image/jpg', 'image/png'] as const,
  minPhotos: 5,
  maxPhotos: 10,
} as const;

export type AllowedPhotoType = typeof PHOTO_CONSTRAINTS.allowedTypes[number];

