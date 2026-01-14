// ===== MEMBERSHIP TYPES =====
export type PlanType = 'free' | 'silver' | 'gold' | 'platinum';

export interface PlanFeatures {
  viewContacts: boolean;
  unlimitedInterests: boolean;
  messaging: boolean;
  viewPrivatePhotos: boolean;
  priorityListing: boolean;
}

export interface MembershipPlan {
  id: PlanType;
  name: string;
  price: number;
  discountedPrice: number;
  contactsAllowed: number;
  validityDays: number;
  features: PlanFeatures;
}

export interface MembershipSummary {
  currentPlan: PlanType;
  isActive: boolean;
  isPremium: boolean;
  expiresAt: string;
  contactsUsed: number;
  contactsAllowed: number;
  contactsRemaining: number;
  dailyInterestCount?: number;
  dailyInterestLimit?: number;
  dailyInterestRemaining?: number;
  features: PlanFeatures;
}

export interface MembershipPurchaseRequest {
  plan: PlanType;
  paymentId: string;
  paymentMethod: 'razorpay' | 'paytm' | 'upi';
}

export interface MembershipPurchaseResponse {
  id: string;
  plan: PlanType;
  startDate: string;
  endDate: string;
  isActive: boolean;
  contactsUsed: number;
  contactsAllowed: number;
  amount: number;
  discountedAmount: number;
}

export interface ViewContactRequest {
  profileId: string;
}

export interface ViewContactResponse {
  success: boolean;
  contactsRemaining: number;
  alreadyViewed: boolean;
}

// Default Plans Data
export const MEMBERSHIP_PLANS: Record<PlanType, MembershipPlan> = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    discountedPrice: 0,
    contactsAllowed: 5,
    validityDays: 365,
    features: {
      viewContacts: false,
      unlimitedInterests: false,
      messaging: false,
      viewPrivatePhotos: false,
      priorityListing: false,
    },
  },
  silver: {
    id: 'silver',
    name: 'Silver Membership',
    price: 2500,
    discountedPrice: 2300,
    contactsAllowed: 40,
    validityDays: 180,
    features: {
      viewContacts: true,
      unlimitedInterests: false,
      messaging: true,
      viewPrivatePhotos: true,
      priorityListing: false,
    },
  },
  gold: {
    id: 'gold',
    name: 'Gold Membership',
    price: 4000,
    discountedPrice: 2500,
    contactsAllowed: 100,
    validityDays: 270,
    features: {
      viewContacts: true,
      unlimitedInterests: true,
      messaging: true,
      viewPrivatePhotos: true,
      priorityListing: false,
    },
  },
  platinum: {
    id: 'platinum',
    name: 'Platinum Membership',
    price: 5000,
    discountedPrice: 3000,
    contactsAllowed: 150,
    validityDays: 365,
    features: {
      viewContacts: true,
      unlimitedInterests: true,
      messaging: true,
      viewPrivatePhotos: true,
      priorityListing: true,
    },
  },
};

