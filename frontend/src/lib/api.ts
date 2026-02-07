import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  // Only access localStorage on client-side
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle 401 errors - redirect to login
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If 401 Unauthorized, clear auth and redirect to login
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        // Don't redirect if already on login/register pages or if this is a login request
        const currentPath = window.location.pathname;
        const isAuthRequest = error.config.url?.includes('/auth/login') ||
                             error.config.url?.includes('/auth/register') ||
                             error.config.url?.includes('/auth/verify-otp');

        if (!currentPath.includes('/login') && !currentPath.includes('/register') && !isAuthRequest) {
          console.log('Session expired - redirecting to login');
          localStorage.removeItem('access_token');
          localStorage.removeItem('session_token');
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

// ============================================
// AUTH API (with 2FA/OTP)
// ============================================
export const authApi = {
  register: (email: string, password: string, name: string, phone?: string) =>
    api.post('/auth/register', { email, password, name, phone }),

  login: (email: string, password: string, portal: string = 'public') =>
    api.post('/auth/login', { email, password, portal }),

  verifyOTP: (userId: string, otp: string) =>
    api.post('/auth/verify-otp', { userId, otp }),

  resendOTP: (userId: string) =>
    api.post('/auth/resend-otp', { userId }),

  logout: (sessionToken?: string) =>
    api.post('/auth/logout', { sessionToken }),

  refresh: () => api.post('/auth/refresh'),

  reAuthenticate: (password: string) =>
    api.post('/auth/re-authenticate', { password }),
};

// ============================================
// PENGUSUL API
// ============================================
export const pengusulApi = {
  register: (data: {
    ktpNumber: string;
    ktpImageUrl: string;
    phone: string;
    address: string;
    institutionName?: string;
    institutionProfile?: string;
    supportingDocuments?: string[];
  }) => api.post('/pengusul/register', data),

  getPending: (limit?: number, offset?: number) =>
    api.get('/pengusul/pending', { params: { limit, offset } }),

  approve: (id: string, notes?: string) =>
    api.post(`/pengusul/${id}/approve`, { notes }),

  reject: (id: string, notes?: string) =>
    api.post(`/pengusul/${id}/reject`, { notes }),

  getProfile: () => api.get('/pengusul/profile'),

  getAll: (status?: string, limit?: number, offset?: number) =>
    api.get('/pengusul', { params: { status, limit, offset } }),
};

// ============================================
// PROGRAMS API
// ============================================
export const programsApi = {
  getAll: (status?: string, limit?: number, offset?: number, createdBy?: string) =>
    api.get('/programs', { params: { status, limit, offset, createdBy } }),

  getOne: (id: string) => api.get(`/programs/${id}`),

  getBySlug: (slug: string) => api.get(`/programs/slug/${slug}`),

  create: (data: {
    title: string;
    description: string;
    targetAmount: number;
    category?: string;
    imageUrl?: string;
  }) => api.post('/programs', data),

  update: (id: string, data: any) => api.put(`/programs/${id}`, data),

  submit: (id: string) => api.post(`/programs/${id}/submit`),

  approve: (id: string, comment?: string) =>
    api.post(`/programs/${id}/approve`, { comment }),

  reject: (id: string, comment?: string) =>
    api.post(`/programs/${id}/reject`, { comment }),

  delete: (id: string) => api.delete(`/programs/${id}`),
};

// ============================================
// DONATIONS API
// ============================================
export const donationsApi = {
  getAll: (programId?: string, limit?: number, offset?: number) =>
    api.get('/donations', { params: { programId, limit, offset } }),

  getMyDonations: () => api.get('/donations/my'),

  getById: (orderId: string) =>
    api.get(`/donations/${orderId}`),

  getStats: (programId?: string) =>
    api.get('/donations/stats', { params: { programId } }),

  create: (data: {
    programId: string;
    amount: number;
    donorName: string;
    donorEmail?: string;
    isAnonymous?: boolean;
  }) => api.post('/donations', data),
};

// ============================================
// PAYMENTS API (Midtrans)
// ============================================
export const paymentsApi = {
  create: (data: {
    programId: string;
    amount: number;
    donorName: string;
    donorEmail?: string;
    referralCode?: string;
  }) => api.post('/payments/create', data),

  getStatus: (orderId: string) =>
    api.get(`/payments/status/${orderId}`),
};

// ============================================
// ARTICLES API (CMS)
// ============================================
export const articlesApi = {
  getAll: (
    status?: string,
    programId?: string,
    authorId?: string,
    limit?: number,
    offset?: number,
  ) =>
    api.get('/articles', {
      params: { status, programId, authorId, limit, offset },
    }),

  getBySlug: (slug: string) => api.get(`/articles/slug/${slug}`),

  create: (data: {
    title: string;
    content: string;
    excerpt?: string;
    coverImageUrl?: string;
    programId?: string;
  }) => api.post('/articles', data),

  update: (id: string, data: any) => api.put(`/articles/${id}`, data),

  submit: (id: string) => api.post(`/articles/${id}/submit`),

  approve: (id: string, comment?: string) =>
    api.post(`/articles/${id}/approve`, { comment }),

  reject: (id: string, comment?: string) =>
    api.post(`/articles/${id}/reject`, { comment }),

  getHistory: (id: string) => api.get(`/articles/${id}/history`),

  delete: (id: string) => api.delete(`/articles/${id}`),
};

// ============================================
// BERITA API (News/Blog - Direct Publish)
// ============================================
export const beritaApi = {
  // Public endpoints
  getAll: (category?: string, limit?: number, offset?: number) =>
    api.get('/berita', { params: { category, limit, offset } }),

  getBySlug: (slug: string) => api.get(`/berita/slug/${slug}`),

  // Admin endpoints
  getAllForAdmin: (limit?: number, offset?: number) =>
    api.get('/berita/admin/all', { params: { limit, offset } }),

  getById: (id: string) => api.get(`/berita/${id}`),

  create: (data: {
    title: string;
    content: string;
    excerpt?: string;
    coverImageUrl?: string;
    category?: string;
  }) => api.post('/berita', data),

  update: (id: string, data: any) => api.put(`/berita/${id}`, data),

  delete: (id: string) => api.delete(`/berita/${id}`),
};

// ============================================
// STATIC PAGES API (About Us, Legal)
// ============================================
export const staticPagesApi = {
  getPage: (slug: string) => api.get(`/static-pages/${slug}`),

  updatePage: (slug: string, data: { title: string; content: string }) =>
    api.put(`/static-pages/${slug}`, data),
};

// ============================================
// ROLE UPGRADES API (USER → PENGUSUL, MANAGER, etc.)
// ============================================
export const roleUpgradesApi = {
  // USER: Submit upgrade request to PENGUSUL
  submitPengusulRequest: (data: {
    ktpNumber: string;
    ktpImageUrl: string;
    phone: string;
    address: string;
    institutionName?: string;
    institutionProfile?: string;
    supportingDocuments?: string[];
  }) => api.post('/role-upgrades/pengusul/request', data),

  // USER: Get my upgrade request status
  getMyRequest: () => api.get('/role-upgrades/my-request'),

  // MANAGER/SUPER_ADMIN: Get pending PENGUSUL requests
  getPendingPengusulRequests: () =>
    api.get('/role-upgrades/pengusul/pending'),

  // MANAGER/SUPER_ADMIN: Approve PENGUSUL request
  approvePengusulRequest: (requestId: string, notes?: string) =>
    api.patch(`/role-upgrades/pengusul/${requestId}/approve`, { notes }),

  // MANAGER/SUPER_ADMIN: Reject PENGUSUL request
  rejectPengusulRequest: (requestId: string, notes: string) =>
    api.patch(`/role-upgrades/pengusul/${requestId}/reject`, { notes }),

  // SUPER_ADMIN: Get all users for role management
  getAllUsers: () => api.get('/role-upgrades/users'),

  // SUPER_ADMIN: Manually upgrade user role
  upgradeUserRole: (
    userId: string,
    data: { targetRole: string; notes?: string }
  ) => api.patch(`/role-upgrades/user/${userId}/upgrade`, data),

  // SUPER_ADMIN: Change user role (upgrade or downgrade)
  changeUserRole: (
    userId: string,
    data: { targetRole: string; notes?: string }
  ) => api.patch(`/role-upgrades/user/${userId}/change-role`, data),
};

// ============================================
// GAMIFICATION API
// ============================================
export const gamificationApi = {
  getLeaderboard: (limit?: number, offset?: number) =>
    api.get('/gamification/leaderboard', { params: { limit, offset } }),

  getRank: (identifier: string) =>
    api.get('/gamification/rank', { params: { identifier } }),

  getTitles: () => api.get('/gamification/titles'),

  getStatistics: () => api.get('/gamification/statistics'),
};

// ============================================
// FINANCE API
// ============================================
export const financeApi = {
  // Get overall statistics
  getStatistics: () => api.get('/finance/statistics'),

  // Get all transactions
  getAllTransactions: (params?: {
    status?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }) => api.get('/finance/transactions', { params }),

  // Get transactions by program
  getTransactionsByProgram: (programId: string, limit?: number, offset?: number) =>
    api.get(`/finance/transactions/by-program/${programId}`, {
      params: { limit, offset },
    }),

  // Get all programs with fund details
  getProgramsFunds: () => api.get('/finance/programs/funds'),

  // Get single program fund
  getProgramFund: (programId: string) =>
    api.get(`/finance/programs/${programId}/fund`),

  // Get program donors
  getProgramDonors: (programId: string, limit?: number, offset?: number) =>
    api.get(`/finance/programs/${programId}/donors`, {
      params: { limit, offset },
    }),

  // Get top donors
  getTopDonors: (limit?: number) =>
    api.get('/finance/donors/top', { params: { limit } }),

  // Get donation trends
  getDonationTrends: (period: 'daily' | 'weekly' | 'monthly' = 'daily', days?: number) =>
    api.get('/finance/trends', { params: { period, days } }),
};

// ============================================
// APPROVALS API
// ============================================
export const approvalsApi = {
  getAll: (
    entityType?: string,
    status?: string,
    limit?: number,
    offset?: number,
  ) =>
    api.get('/approvals', {
      params: { entityType, status, limit, offset },
    }),

  getOne: (id: string) => api.get(`/approvals/${id}`),

  approve: (id: string, comment?: string) =>
    api.post(`/approvals/${id}/approve`, { comment }),

  reject: (id: string, comment?: string) =>
    api.post(`/approvals/${id}/reject`, { comment }),
};

// ============================================
// AUDIT LOGS API
// ============================================
export const auditLogsApi = {
  getAll: (filters?: {
    userId?: string;
    action?: string;
    entityType?: string;
    entityId?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }) => api.get('/audit-logs', { params: filters }),

  getUserActivity: (userId: string) =>
    api.get('/audit-logs/user-activity', { params: { userId } }),
};

// ============================================
// USERS API
// ============================================
export const usersApi = {
  getAll: (role?: string, limit?: number, offset?: number) =>
    api.get('/users', { params: { role, limit, offset } }),

  getOne: (id: string) => api.get(`/users/${id}`),

  update: (id: string, data: any) => api.put(`/users/${id}`, data),

  delete: (id: string) => api.delete(`/users/${id}`),

  create: (data: { email: string; name: string; password: string; role: string }) =>
    api.post('/users', data),

  updateRole: (id: string, role: string) =>
    api.put(`/users/${id}/role`, { role }),

  softDelete: (id: string) => api.delete(`/users/${id}/soft`),
};


// ============================================
// SYSTEM SETTINGS API (Dropdown Management)
// ============================================
export const systemSettingsApi = {
  getByCategory: (category: string) =>
    api.get(`/system-settings/category/${category}`),

  create: (data: { category: string; key: string; value: string; sortOrder?: number }) =>
    api.post('/system-settings', data),

  update: (id: string, data: any) =>
    api.put(`/system-settings/${id}`, data),

  delete: (id: string) => api.delete(`/system-settings/${id}`),
};

// ============================================
// FORM FIELD CONFIG API (Field Visibility)
// ============================================
export const formFieldConfigApi = {
  getConfig: (formType: string) =>
    api.get(`/form-field-config/${formType}`),

  getAllConfigs: () => api.get('/form-field-config'),

  updateField: (formType: string, fieldName: string, data: { isVisible?: boolean; isRequired?: boolean }) =>
    api.put(`/form-field-config/${formType}/${fieldName}`, data),

  createField: (data: { formType: string; fieldName: string; isVisible?: boolean; isRequired?: boolean }) =>
    api.post('/form-field-config', data),

  deleteField: (formType: string, fieldName: string) =>
    api.delete(`/form-field-config/${formType}/${fieldName}`),
};

// ============================================
// UPLOADS API (File Management)
// ============================================
export const uploadsApi = {
  // Upload single file
  uploadSingle: (file: File, options?: {
    category?: string;
    entityType?: string;
    entityId?: string;
    fieldName?: string;
    isPublic?: boolean;
  }) => {
    const formData = new FormData();
    formData.append('file', file);
    if (options?.category) formData.append('category', options.category);
    if (options?.entityType) formData.append('entityType', options.entityType);
    if (options?.entityId) formData.append('entityId', options.entityId);
    if (options?.fieldName) formData.append('fieldName', options.fieldName);
    if (options?.isPublic !== undefined) formData.append('isPublic', String(options.isPublic));

    return api.post('/uploads/single', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Upload multiple files
  uploadMultiple: (files: File[], options?: {
    category?: string;
    entityType?: string;
    entityId?: string;
    fieldName?: string;
    isPublic?: boolean;
  }) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    if (options?.category) formData.append('category', options.category);
    if (options?.entityType) formData.append('entityType', options.entityType);
    if (options?.entityId) formData.append('entityId', options.entityId);
    if (options?.fieldName) formData.append('fieldName', options.fieldName);
    if (options?.isPublic !== undefined) formData.append('isPublic', String(options.isPublic));

    return api.post('/uploads/multiple', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Get file by ID
  getById: (id: string) => api.get(`/uploads/${id}`),

  // Get file URL
  getFileUrl: (storedFilename: string) =>
    `${API_URL}/uploads/file/${storedFilename}`,

  // Get download URL
  getDownloadUrl: (storedFilename: string) =>
    `${API_URL}/uploads/download/${storedFilename}`,

  // Get all files (admin)
  getAllForAdmin: (filters?: {
    category?: string;
    entityType?: string;
    entityId?: string;
    uploadedBy?: string;
    limit?: number;
    offset?: number;
  }) => api.get('/uploads/admin/all', { params: filters }),

  // Get files by entity
  getByEntity: (entityType: string, entityId: string) =>
    api.get(`/uploads/entity/${entityType}/${entityId}`),

  // Get storage stats
  getStats: () => api.get('/uploads/admin/stats'),

  // Associate file with entity
  associate: (fileId: string, entityType: string, entityId: string, fieldName?: string) =>
    api.post(`/uploads/${fileId}/associate`, { entityType, entityId, fieldName }),

  // Delete file
  delete: (id: string) => api.delete(`/uploads/${id}`),
};

// ============================================
// REFERRAL API
// ============================================
export const referralApi = {
  generateCode: () => api.post('/referral/generate'),

  getMyStats: () => api.get('/referral/my'),

  getLeaderboard: (limit?: number, offset?: number) =>
    api.get('/referral/leaderboard', { params: { limit, offset } }),

  getDetail: (code: string, limit?: number, offset?: number) =>
    api.get(`/referral/detail/${code}`, { params: { limit, offset } }),
};

// ============================================
// COMMENTS API
// ============================================
export const commentsApi = {
  getAll: (programId: string) =>
    api.get('/comments', { params: { programId } }),

  create: (data: { programId: string; content: string }) =>
    api.post('/comments', data),

  hide: (id: string) => api.patch(`/comments/${id}/hide`),

  unhide: (id: string) => api.patch(`/comments/${id}/unhide`),

  delete: (id: string) => api.delete(`/comments/${id}`),
};

// ============================================
// PELAPORAN API (renamed from Articles)
// ============================================
export const pelaporanApi = {
  getAll: (
    status?: string,
    programId?: string,
    authorId?: string,
    limit?: number,
    offset?: number,
  ) =>
    api.get('/pelaporan', {
      params: { status, programId, authorId, limit, offset },
    }),

  getBySlug: (slug: string) => api.get(`/pelaporan/slug/${slug}`),

  create: (data: {
    title: string;
    content: string;
    excerpt?: string;
    coverImageUrl?: string;
    programId?: string;
  }) => api.post('/pelaporan', data),

  update: (id: string, data: any) => api.put(`/pelaporan/${id}`, data),

  submit: (id: string) => api.post(`/pelaporan/${id}/submit`),

  approve: (id: string, comment?: string) =>
    api.post(`/pelaporan/${id}/approve`, { comment }),

  reject: (id: string, comment?: string) =>
    api.post(`/pelaporan/${id}/reject`, { comment }),

  getHistory: (id: string) => api.get(`/pelaporan/${id}/history`),

  delete: (id: string) => api.delete(`/pelaporan/${id}`),
};
