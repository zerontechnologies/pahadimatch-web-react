// ===== AUTHENTICATION TYPES =====
export type OtpPurpose = 'signup' | 'login';

export interface SendOtpRequest {
  phone: string;
  purpose: OtpPurpose;
}

export interface VerifyOtpRequest {
  phone: string;
  otp: string;
  purpose: OtpPurpose;
  dailyInterestLimit?: number; // Required for signup, optional for login
}

export interface AuthUser {
  id: string;
  profileId: string;
  phone: string;
  isPhoneVerified: boolean;
  isProfileComplete: boolean;
  lastLogin?: string;
  createdAt?: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
  isNewUser?: boolean;
  isProfileComplete?: boolean;
}

export interface ChangePhoneRequest {
  newPhone: string;
}

export interface VerifyPhoneChangeRequest {
  newPhone: string;
  otp: string;
}

// Auth State
export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

