// ===== KUNDALI TYPES =====
export interface CreateKundaliRequest {
  dateOfBirth: string;
  timeOfBirth: string;
  placeOfBirth: string;
  latitude: number;
  longitude: number;
  timezone: number;
}

export interface Kundali {
  id: string;
  userId: string;
  dateOfBirth: string;
  timeOfBirth: string;
  placeOfBirth: string;
  rashi: string;
  nakshatra: string;
  nadi: string;
  gana: string;
  manglikStatus: string;
  manglikPercentage: number;
}

export interface KundaliScoreDetail {
  score: number;
  max: number;
  description: string;
}

export interface KundaliMatchResponse {
  totalScore: number;
  maxScore: number;
  percentage: number;
  varnaScore: KundaliScoreDetail;
  vasyaScore: KundaliScoreDetail;
  taraScore: KundaliScoreDetail;
  yoniScore: KundaliScoreDetail;
  grahaScore: KundaliScoreDetail;
  ganaScore: KundaliScoreDetail;
  bhakootScore: KundaliScoreDetail;
  nadiScore: KundaliScoreDetail;
  manglikCompatibility: {
    compatible: boolean;
    description: string;
  };
  conclusion: string;
  recommendations: string[];
}

