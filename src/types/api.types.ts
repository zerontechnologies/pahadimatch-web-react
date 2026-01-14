// ===== STANDARD API RESPONSE =====
export interface ApiResponse<T> {
  success: boolean;
  status: number;
  message: string;
  data?: T;
  error?: {
    code?: string;
    details?: Record<string, string[]>;
  };
  pagination?: Pagination;
  meta?: {
    timestamp: string;
  };
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// ===== ERROR CODES =====
export type ErrorCode =
  | 'BAD_REQUEST'
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'AUTH_ERROR'
  | 'FORBIDDEN'
  | 'PREMIUM_REQUIRED'
  | 'INTEREST_REQUIRED'
  | 'CONTACT_LIMIT_REACHED'
  | 'FEATURE_REQUIRED'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'DUPLICATE_KEY'
  | 'RATE_LIMIT_EXCEEDED'
  | 'OTP_RATE_LIMIT'
  | 'SERVER_ERROR';

