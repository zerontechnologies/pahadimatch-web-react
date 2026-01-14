// ===== MATCH TYPES =====
import type { SearchResultProfile } from './search.types';

export type MatchCategory =
  | 'new_matches'
  | 'preferred_matches'
  | 'broader_matches'
  | 'similar_matches'
  | 'govt_matches'
  | 'army_officer_matches'
  | 'occupation_matches'
  | 'salary_matches'
  | 'location_matches'
  | 'education_matches'
  | 'manglik_matches'
  | 'shortlisted_profiles'
  | 'premium_matches'
  | 'nadi_matches'
  | 'highlighter_matches'
  | 'parent_settled_matches'
  | 'family_origin_matches';

export interface MatchCategoryInfo {
  id: MatchCategory;
  name: string;
  description: string;
  icon?: string;
  isPremium?: boolean;
}

export const MATCH_CATEGORIES: MatchCategoryInfo[] = [
  { id: 'new_matches', name: 'New Matches', description: 'Profiles joined in last 30 days', icon: 'Sparkles' },
  { id: 'preferred_matches', name: 'Preferred Matches', description: 'Based on your preferences', icon: 'Heart' },
  { id: 'broader_matches', name: 'Broader Matches', description: 'Relaxed criteria matches', icon: 'Maximize' },
  { id: 'similar_matches', name: 'Similar Matches', description: 'Same education/occupation', icon: 'Users' },
  { id: 'govt_matches', name: 'Government Job', description: 'Government employees', icon: 'Building' },
  { id: 'army_officer_matches', name: 'Army Officers', description: 'Defense personnel', icon: 'Shield' },
  { id: 'occupation_matches', name: 'Same Occupation', description: 'Your occupation category', icon: 'Briefcase' },
  { id: 'nadi_matches', name: 'Nadi Match', description: 'Compatible Nadi (Kundali)', icon: 'Moon', isPremium: true },
  { id: 'salary_matches', name: 'Salary Matches', description: 'Income range matches', icon: 'Wallet' },
  { id: 'location_matches', name: 'Nearby', description: 'Same city/state', icon: 'MapPin' },
  { id: 'parent_settled_matches', name: 'Parent Settled', description: 'Parents in same location', icon: 'Home' },
  { id: 'family_origin_matches', name: 'Family Origin', description: 'Same native place', icon: 'Map' },
  { id: 'education_matches', name: 'Education', description: 'Same education level', icon: 'GraduationCap' },
  { id: 'manglik_matches', name: 'Manglik', description: 'Compatible manglik status', icon: 'Star' },
  { id: 'shortlisted_profiles', name: 'Shortlisted', description: 'Profiles you shortlisted', icon: 'Bookmark' },
  { id: 'highlighter_matches', name: 'Highlighted', description: 'Stand out profiles', icon: 'Zap' },
  { id: 'premium_matches', name: 'Premium', description: 'Premium members only', icon: 'Crown', isPremium: true },
];

export interface MatchProfile extends SearchResultProfile {
  matchScore?: number;
}

export interface MatchScoreBreakdown {
  ageScore: number;
  heightScore: number;
  educationScore: number;
  occupationScore: number;
  incomeScore: number;
  locationScore: number;
  religionScore: number;
  casteScore: number;
  manglikScore: number;
  familyScore: number;
  preferenceMatchScore: number;
}

export interface MatchScoreResponse {
  profileId: string;
  userId: string;
  totalScore: number;
  breakdown: MatchScoreBreakdown;
  profile: {
    firstName: string;
    lastName: string;
    age: number;
    height: number;
    city: string;
    education: string;
    occupation: string;
    religion: string;
  };
}

