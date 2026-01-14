// ===== SEARCH TYPES =====
import type { Education, Gender, ManglikStatus, MaritalStatus, Occupation, Religion } from './profile.types';

export type SortBy = 'relevance' | 'newest' | 'lastActive';

export interface SearchFilters {
  gender?: Gender;
  ageMin?: number;
  ageMax?: number;
  heightMin?: number;
  heightMax?: number;
  maritalStatus?: MaritalStatus[];
  religion?: Religion[];
  caste?: string[];
  manglik?: ManglikStatus[];
  education?: Education[];
  occupation?: Occupation[];
  incomeMin?: number;
  incomeMax?: number;
  locations?: string[];
  city?: string;
  state?: string;
  motherTongue?: string[];
  isVerified?: boolean;
  hasPhotos?: boolean;
  isPremium?: boolean;
  sortBy?: SortBy;
}

export interface SearchParams extends SearchFilters {
  page?: number;
  limit?: number;
}

export interface SearchResultProfile {
  profileId: string;
  isPremiumRequired: boolean;
  requiresPremiumForName?: boolean;
  
  // Only present when isPremiumRequired is false
  firstName?: string; // Only if hasViewedContact
  lastName?: string; // Only if connected OR hasViewedContact OR received interest
  age?: number;
  height?: number;
  city?: string;
  state?: string;
  education?: Education;
  occupation?: Occupation;
  religion?: Religion;
  caste?: string;
  isVerified?: boolean;
  lastActive?: string;
  profilePhoto?: string;
  photos?: Array<{ url: string; isProfilePhoto: boolean }>;
  photosLocked?: boolean; // true if photos are private AND interest not accepted
  matchScore?: number;
  
  // Interest status flags
  alreadySentInterest?: boolean;
  sentInterestStatus?: 'pending' | 'accepted' | 'declined';
  receivedInterest?: boolean;
  receivedInterestStatus?: 'pending' | 'accepted' | 'declined';
  isConnected?: boolean;
  hasViewedContact?: boolean;
}

export interface SaveSearchPreferencesRequest extends SearchFilters {}

