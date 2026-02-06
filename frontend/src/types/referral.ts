// Referral Types
export interface ReferralCode {
  id: string;
  code: string;
  userId: string;
  programId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  program?: {
    id: string;
    title: string;
    slug: string;
  };
  _count?: {
    referralDonations: number;
  };
}

export interface ReferralDonation {
  id: string;
  referralCodeId: string;
  donationId: string;
  referrerUserId: string;
  pointsEarned: number;
  createdAt: string;
  referralCode?: ReferralCode;
  donation?: {
    amount: string;
    donorName: string;
    createdAt: string;
  };
}

export interface ReferralLeaderboard {
  id: string;
  userId: string;
  totalReferrals: number;
  totalPoints: number;
  totalAmount: string;
  rank: number;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface ReferralStats {
  totalReferrals: number;
  totalPoints: number;
  totalAmount: number;
  activeReferralCodes: number;
  rank?: number;
  recentReferrals: ReferralDonation[];
}
