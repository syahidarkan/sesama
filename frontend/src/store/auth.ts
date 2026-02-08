import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, UserRole } from '@/types';
import { authApi } from '@/lib/api';

interface AuthState {
  // State
  user: User | null;
  accessToken: string | null;
  sessionToken: string | null;
  isLoading: boolean;
  error: string | null;

  // OTP State
  pendingOTP: boolean;
  otpUserId: string | null;

  // TOTP State
  pendingTOTP: boolean;
  pendingTOTPSetup: boolean;
  totpUserId: string | null;
  totpQRCode: string | null;
  totpSecret: string | null;

  // Actions
  login: (email: string, password: string, portal?: string) => Promise<void>;
  googleLogin: (idToken: string, portal?: string) => Promise<void>;
  verifyOTP: (otp: string) => Promise<void>;
  resendOTP: () => Promise<void>;
  verifyTOTP: (token: string) => Promise<void>;
  register: (email: string, password: string, name: string, phone?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  setAuth: (user: User, accessToken: string, sessionToken?: string) => void;
  clearError: () => void;
  clearOTP: () => void;
  clearTOTP: () => void;

  // Helpers
  isAuthenticated: () => boolean;
  isAdmin: () => boolean;
  hasRole: (roles: UserRole[]) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial State
      user: null,
      accessToken: null,
      sessionToken: null,
      isLoading: false,
      error: null,
      pendingOTP: false,
      otpUserId: null,
      pendingTOTP: false,
      pendingTOTPSetup: false,
      totpUserId: null,
      totpQRCode: null,
      totpSecret: null,

      // Login
      login: async (email: string, password: string, portal: string = 'public') => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.login(email, password, portal);
          const data = response.data;

          if (data.requiresOTP) {
            // Admin user - OTP required, check email
            set({
              pendingOTP: true,
              otpUserId: data.userId,
              isLoading: false,
            });
          } else {
            // Regular user - direct login
            set({
              user: data.user,
              accessToken: data.access_token,
              sessionToken: data.session_token,
              pendingOTP: false,
              otpUserId: null,
              isLoading: false,
            });

            // Save to localStorage
            if (typeof window !== 'undefined') {
              localStorage.setItem('access_token', data.access_token);
              if (data.session_token) {
                localStorage.setItem('session_token', data.session_token);
              }
            }
          }
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Login failed',
            isLoading: false,
          });
          throw error;
        }
      },

      // Google Login
      googleLogin: async (idToken: string, portal: string = 'public') => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.googleLogin(idToken, portal);
          const data = response.data;

          if (data.requiresTOTPSetup) {
            // Admin user - first time, need TOTP setup
            set({
              pendingTOTPSetup: true,
              totpUserId: data.userId,
              totpQRCode: data.qrCode,
              totpSecret: data.secret,
              isLoading: false,
            });
          } else if (data.requiresTOTP) {
            // Admin user - TOTP verification required
            set({
              pendingTOTP: true,
              totpUserId: data.userId,
              isLoading: false,
            });
          } else if (data.requiresOTP) {
            // Admin user - email OTP required (legacy)
            set({
              pendingOTP: true,
              otpUserId: data.userId,
              isLoading: false,
            });
          } else {
            // Regular user - direct login
            set({
              user: data.user,
              accessToken: data.access_token,
              sessionToken: data.session_token,
              pendingOTP: false,
              otpUserId: null,
              pendingTOTP: false,
              totpUserId: null,
              isLoading: false,
            });

            if (typeof window !== 'undefined') {
              localStorage.setItem('access_token', data.access_token);
              if (data.session_token) {
                localStorage.setItem('session_token', data.session_token);
              }
            }
          }
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Google login failed',
            isLoading: false,
          });
          throw error;
        }
      },

      // Verify OTP
      verifyOTP: async (otp: string) => {
        const { otpUserId } = get();
        if (!otpUserId) {
          set({ error: 'No pending OTP verification' });
          return;
        }

        set({ isLoading: true, error: null });
        try {
          const response = await authApi.verifyOTP(otpUserId, otp);
          const data = response.data;

          set({
            user: data.user,
            accessToken: data.access_token,
            sessionToken: data.session_token,
            pendingOTP: false,
            otpUserId: null,
            isLoading: false,
          });

          // Save to localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem('access_token', data.access_token);
            if (data.session_token) {
              localStorage.setItem('session_token', data.session_token);
            }
          }
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'OTP verification failed',
            isLoading: false,
          });
          throw error;
        }
      },

      // Resend OTP
      resendOTP: async () => {
        const { otpUserId } = get();
        if (!otpUserId) return;

        set({ isLoading: true, error: null });
        try {
          await authApi.resendOTP(otpUserId);
          set({ isLoading: false });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Failed to resend OTP',
            isLoading: false,
          });
          throw error;
        }
      },

      // Verify TOTP
      verifyTOTP: async (token: string) => {
        const { totpUserId } = get();
        if (!totpUserId) {
          set({ error: 'No pending TOTP verification' });
          return;
        }

        set({ isLoading: true, error: null });
        try {
          const response = await authApi.verifyTOTP(totpUserId, token);
          const data = response.data;

          set({
            user: data.user,
            accessToken: data.access_token,
            sessionToken: data.session_token,
            pendingTOTP: false,
            pendingTOTPSetup: false,
            totpUserId: null,
            totpQRCode: null,
            totpSecret: null,
            isLoading: false,
          });

          // Save to localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem('access_token', data.access_token);
            if (data.session_token) {
              localStorage.setItem('session_token', data.session_token);
            }
          }
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'TOTP verification failed',
            isLoading: false,
          });
          throw error;
        }
      },

      // Register
      register: async (email: string, password: string, name: string, phone?: string) => {
        set({ isLoading: true, error: null });
        try {
          await authApi.register(email, password, name, phone);
          set({ isLoading: false });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Registration failed',
            isLoading: false,
          });
          throw error;
        }
      },

      // Logout
      logout: async () => {
        const { sessionToken } = get();
        try {
          await authApi.logout(sessionToken || undefined);
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({
            user: null,
            accessToken: null,
            sessionToken: null,
            pendingOTP: false,
            otpUserId: null,
            pendingTOTP: false,
            pendingTOTPSetup: false,
            totpUserId: null,
            totpQRCode: null,
            totpSecret: null,
          });

          // Clear localStorage
          if (typeof window !== 'undefined') {
            localStorage.removeItem('access_token');
            localStorage.removeItem('session_token');
          }
        }
      },

      // Refresh Token
      refreshToken: async () => {
        try {
          const response = await authApi.refresh();
          const data = response.data;

          set({ accessToken: data.access_token });

          if (typeof window !== 'undefined') {
            localStorage.setItem('access_token', data.access_token);
          }
        } catch (error) {
          // If refresh fails, logout
          get().logout();
        }
      },

      // Set Auth (for manual auth setting)
      setAuth: (user, accessToken, sessionToken) => {
        set({ user, accessToken, sessionToken });

        if (typeof window !== 'undefined') {
          localStorage.setItem('access_token', accessToken);
          if (sessionToken) {
            localStorage.setItem('session_token', sessionToken);
          }
        }
      },

      // Clear Error
      clearError: () => set({ error: null }),

      // Clear OTP state (back to login)
      clearOTP: () => set({ pendingOTP: false, otpUserId: null, error: null }),

      // Clear TOTP state (back to login)
      clearTOTP: () => set({
        pendingTOTP: false,
        pendingTOTPSetup: false,
        totpUserId: null,
        totpQRCode: null,
        totpSecret: null,
        error: null
      }),

      // Helper: Is Authenticated
      isAuthenticated: () => {
        return !!get().accessToken && !!get().user;
      },

      // Helper: Is Admin (any admin role)
      isAdmin: () => {
        const user = get().user;
        if (!user) return false;

        const adminRoles: UserRole[] = [
          'MANAGER',
          'CONTENT_MANAGER',
          'SUPERVISOR',
          'SUPER_ADMIN',
        ];

        return adminRoles.includes(user.role);
      },

      // Helper: Has Role
      hasRole: (roles: UserRole[]) => {
        const user = get().user;
        if (!user) return false;
        return roles.includes(user.role);
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        sessionToken: state.sessionToken,
      }),
    }
  )
);
