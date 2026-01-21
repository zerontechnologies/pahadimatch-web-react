// ===== ACTIVITY TYPES =====
export type InterestStatus = 'pending' | 'accepted' | 'declined';

export interface SendInterestRequest {
  profileId: string;
  message?: string;
}

export interface Interest {
  id: string;
  status: InterestStatus;
  message?: string;
  createdAt: string;
  profile: {
    profileId: string;
    lastName: string; // Only lastName (no firstName)
    age: number;
    city: string;
    profilePhoto?: string;
    isVerified?: boolean;
  };
}

export interface InterestSentResponse {
  id: string;
  status: InterestStatus;
  message?: string;
  createdAt: string;
  dailyInterestRemaining?: number; // Remaining interests for the day
}

// Interest Limit Status
export interface InterestLimitResponse {
  dailyInterestRemaining: number;
  dailyInterestLimit: number;
  canSendInterest: boolean;
}

export interface ShortlistRequest {
  profileId: string;
  note?: string;
}

export interface ShortlistedProfile {
  id: string;
  profileId: string;
  lastName: string; // Only lastName
  age: number;
  city: string;
  profilePhoto?: string;
  isVerified?: boolean;
  note?: string;
  shortlistedAt: string;
}

export interface BlockRequest {
  profileId: string;
  reason?: string;
}

export interface BlockedProfile {
  profileId: string;
  lastName: string; // Only lastName
  isVerified?: boolean;
  blockedAt: string;
  reason?: string;
}

// Connections (Accepted Interests)
export interface Connection {
  profileId: string;
  lastName: string; // Only lastName
  age: number;
  city: string;
  state?: string;
  education?: string;
  occupation?: string;
  religion?: string;
  profilePhoto?: string; // Always visible for connections
   isVerified?: boolean;
  connectedAt: string;
  canMessage: boolean;
  canSendPredefinedMessages: boolean;
}

// Activity Counts
export interface ActivityCounts {
  interestsReceived: {
    total: number;
    pending: number;
    accepted: number;
    declined: number;
  };
  interestsSent: {
    total: number;
    pending: number;
    accepted: number;
    declined: number;
  };
  shortlisted: number;
  blocked: number;
  profileViews: number;
}

