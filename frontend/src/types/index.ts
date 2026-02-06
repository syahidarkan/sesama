// ============================================
// USER & AUTH TYPES
// ============================================

export type UserRole =
  | 'USER'
  | 'PENGUSUL'
  | 'MANAGER'
  | 'CONTENT_MANAGER'
  | 'SUPERVISOR'
  | 'FINANCE'
  | 'SUPER_ADMIN';

export type PengusulStatus =
  | 'PENDING_VERIFICATION'
  | 'APPROVED'
  | 'REJECTED';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  pengusulStatus?: PengusulStatus;
  phone?: string;
  ktpNumber?: string;
  ktpImageUrl?: string;
  address?: string;
  institutionName?: string;
  institutionProfile?: string;
  supportingDocuments?: string[];
  verificationNotes?: string;
  createdAt: string;
}

export interface LoginResponse {
  requiresOTP: boolean;
  userId?: string;
  access_token?: string;
  session_token?: string;
  user?: User;
  message?: string;
}

// ============================================
// PROGRAM TYPES
// ============================================

export type ProgramStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'ACTIVE'
  | 'CLOSED'
  | 'REJECTED';

export interface Program {
  id: string;
  title: string;
  slug: string;
  description: string;
  targetAmount: number;
  collectedAmount: number;
  currentAmount?: number;
  donorCount?: number;
  status: ProgramStatus;
  category?: string;
  imageUrl?: string;
  institutionName?: string;
  beneficiaryName?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  closedAt?: string;
  endDate?: string;
  creator?: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
}

// ============================================
// DONATION TYPES
// ============================================

export type DonationStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'EXPIRED';

export interface Donation {
  id: string;
  programId: string;
  donorName: string;
  donorEmail?: string;
  amount: number;
  isAnonymous: boolean;
  status: DonationStatus;
  paidAt?: string;
  createdAt: string;
}

// ============================================
// ARTICLE TYPES
// ============================================

export type ArticleStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'PUBLISHED'
  | 'REJECTED';

export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImageUrl?: string;
  programId?: string;
  authorId: string;
  status: ArticleStatus;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  author?: {
    id: string;
    name: string;
    role: UserRole;
  };
  program?: {
    id: string;
    title: string;
    slug: string;
  };
}

// ============================================
// GAMIFICATION TYPES
// ============================================

export type DonorTitle = 'PEMULA' | 'DERMAWAN' | 'JURAGAN' | 'SULTAN' | 'LEGEND';

export interface LeaderboardEntry {
  id: string;
  donorName: string;
  totalDonations: number;
  donationCount: number;
  title: DonorTitle;
  rank?: number;
  lastDonationAt?: string;
}

export interface TitleInfo {
  title: DonorTitle;
  minAmount: number;
  maxAmount: number | null;
  color: string;
  icon: string;
}

// ============================================
// APPROVAL TYPES
// ============================================

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export type ActionType =
  | 'PENGUSUL_REGISTRATION'
  | 'CREATE_PROGRAM'
  | 'EDIT_PROGRAM'
  | 'CLOSE_PROGRAM'
  | 'PUBLISH_ARTICLE';

export interface Approval {
  id: string;
  entityType: string;
  entityId: string;
  actionType: ActionType;
  status: ApprovalStatus;
  requestedBy: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
  requester?: User;
}

// ============================================
// AUDIT LOG TYPES
// ============================================

export type AuditAction =
  | 'LOGIN'
  | 'LOGOUT'
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'APPROVE'
  | 'REJECT'
  | 'PUBLISH'
  | 'VERIFY_PENGUSUL'
  | 'DONATION_SUCCESS'
  | 'OTP_SENT'
  | 'SESSION_EXPIRED';

export interface AuditLog {
  id: string;
  userId?: string;
  userRole?: UserRole;
  action: AuditAction;
  entityType?: string;
  entityId?: string;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

// ============================================
// COMMENT TYPES
// ============================================

export interface Comment {
  id: string;
  programId: string;
  userId: string;
  content: string;
  isHidden: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    role: UserRole;
  };
}

// ============================================
// PAGINATION TYPES
// ============================================

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}
