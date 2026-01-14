// ===== PROFILE TYPES =====
export type Gender = 'male' | 'female';
export type MaritalStatus = 'never_married' | 'divorced' | 'widowed' | 'awaiting_divorce';
export type Religion = 'hindu' | 'muslim' | 'christian' | 'sikh' | 'buddhist' | 'jain' | 'other';
export type ManglikStatus = 'yes' | 'no' | 'partial' | 'dont_know';
export type Education = 'high_school' | 'diploma' | 'bachelors' | 'masters' | 'phd' | 'professional';
export type Occupation = 'government' | 'private' | 'business' | 'self_employed' | 'army' | 'doctor' | 'engineer' | 'teacher' | 'lawyer' | 'other';
export type FamilyType = 'joint' | 'nuclear';
export type FamilyStatus = 'middle_class' | 'upper_middle_class' | 'rich' | 'affluent';
export type Diet = 'vegetarian' | 'non_vegetarian' | 'eggetarian' | 'vegan';
export type Habit = 'yes' | 'no' | 'occasionally';
export type BodyType = 'slim' | 'average' | 'athletic' | 'heavy';
export type Complexion = 'very_fair' | 'fair' | 'wheatish' | 'dark';
export type Origin = 'garhwali' | 'kumaoni' | 'jonsari' | 'other';

export interface Profile {
  // Identifiers
  userId?: string;
  profileId?: string;
  
  // Basic Info
  firstName: string;
  lastName: string;
  gender: Gender;
  dateOfBirth: string; // YYYY-MM-DD
  age?: number; // Calculated
  
  // Physical
  height: number; // cm
  weight?: number;
  bodyType?: BodyType;
  complexion?: Complexion;
  
  // Personal
  maritalStatus: MaritalStatus;
  motherTongue?: string;
  religion: Religion;
  caste?: string;
  subCaste?: string;
  gothra?: string;
  manglik?: ManglikStatus;
  origin?: Origin; // NEW: garhwali, kumaoni, jonsari, other
  
  // Education & Career
  education: Education;
  educationDetail?: string;
  college?: string;
  occupation: Occupation;
  occupationDetail?: string;
  company?: string;
  income: number; // Annual in INR
  
  // Location
  city: string;
  state: string;
  country: string;
  
  // Family
  familyType?: FamilyType;
  familyStatus?: FamilyStatus;
  fatherOccupation?: string;
  motherOccupation?: string;
  siblings?: number;
  
  // Lifestyle
  diet?: Diet;
  smoking?: Habit;
  drinking?: Habit;
  
  // About
  aboutMe?: string;
  hobbies?: string[];
  
  // Metadata
  profileCompleteness?: number;
  isVerified?: boolean;
  lastActive?: string;
}

export interface ProfileCreateRequest extends Partial<Profile> {}

export interface ViewProfileResponse {
  profileId: string;
  isPremiumRequired: boolean;
  message?: string; // Only present when isPremiumRequired is true
  
  // Premium flags
  requiresPremiumForName?: boolean;
  requiresPremiumForContact?: boolean;
  
  // Only present when isPremiumRequired is false
  userId?: string;
  firstName?: string;
  lastName?: string;
  gender?: Gender;
  dateOfBirth?: string;
  age?: number;
  height?: number;
  weight?: number;
  bodyType?: BodyType;
  complexion?: Complexion;
  maritalStatus?: MaritalStatus;
  motherTongue?: string;
  religion?: Religion;
  caste?: string;
  subCaste?: string;
  gothra?: string;
  manglik?: ManglikStatus;
  education?: Education;
  educationDetail?: string;
  college?: string;
  occupation?: Occupation;
  occupationDetail?: string;
  company?: string;
  income?: number | null;
  incomeLocked?: boolean;
  city?: string;
  state?: string;
  country?: string;
  familyType?: FamilyType;
  familyStatus?: FamilyStatus;
  fatherOccupation?: string;
  motherOccupation?: string;
  siblings?: number;
  diet?: Diet;
  smoking?: Habit;
  drinking?: Habit;
  aboutMe?: string;
  hobbies?: string[];
  profileCompleteness?: number;
  isVerified?: boolean;
  lastActive?: string;
  phone?: string;
  phoneLocked?: boolean;
  photos?: ProfilePhoto[];
  photosLocked?: boolean;
  isShortlisted?: boolean;
}

export interface ProfilePhoto {
  id?: string;
  url: string;
  isProfilePhoto: boolean;
  isPrivate?: boolean;
  order?: number;
  isApproved?: boolean;
  createdAt?: string;
}

export interface PrivacySettings {
  phonePrivate: boolean;
  photosPrivate: boolean;
  incomePrivate: boolean;
}

export interface PartnerPreferences {
  ageMin?: number;
  ageMax?: number;
  heightMin?: number;
  heightMax?: number;
  religion?: Religion[];
  caste?: string[];
  education?: Education[];
  occupation?: Occupation[];
  incomeMin?: number;
  locations?: string[];
  manglik?: ManglikStatus[];
  maritalStatus?: MaritalStatus[];
  motherTongue?: string[];
  diet?: Diet[];
}

export interface ProfileView {
  profileId: string;
  lastName: string; // Only lastName
  age: number;
  city: string;
  education?: string;
  occupation?: string;
  profilePhoto?: string;
  viewCount: number;
  lastViewedAt: string;
}

export interface NotificationSettings {
  email?: boolean;
  matches?: boolean;
  interests?: boolean;
  messages?: boolean;
  profileViews?: boolean;
  shortlist?: boolean;
}

export interface OwnProfileResponse extends Profile {
  privacySettings: PrivacySettings;
  preferences: PartnerPreferences;
  notificationSettings?: NotificationSettings;
}

