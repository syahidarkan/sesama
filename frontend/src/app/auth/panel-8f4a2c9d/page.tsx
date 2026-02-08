'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';

declare global {
  interface Window {
    google?: any;
  }
}

const GOOGLE_CLIENT_ID = '818814114213-6lj9i5uoqnpjf2ri3l0k8m3e7s9v5qch.apps.googleusercontent.com';

export default function AdminLoginPage() {
  const router = useRouter();
  const {
    login,
    googleLogin,
    verifyOTP,
    verifyTOTP,
    pendingOTP,
    otpUserId,
    pendingTOTP,
    pendingTOTPSetup,
    totpUserId,
    totpQRCode,
    totpSecret,
    isLoading,
    error: authError
  } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [totpToken, setTotpToken] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleCallback = useCallback(async (response: any) => {
    setError('');
    setGoogleLoading(true);
    try {
      await googleLogin(response.credential, 'admin');
      const state = useAuthStore.getState();
      if (state.user && !state.pendingTOTP && !state.pendingTOTPSetup) {
        router.push('/admin/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login dengan Google gagal');
    } finally {
      setGoogleLoading(false);
    }
  }, [googleLogin, router]);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCallback,
        });
        window.google.accounts.id.renderButton(
          document.getElementById('google-signin-btn-admin'),
          {
            theme: 'outline',
            size: 'large',
            width: '100%',
            text: 'signin_with',
            shape: 'rectangular',
          }
        );
      }
    };
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, [handleGoogleCallback]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password, 'admin');
      const state = useAuthStore.getState();
      if (!state.pendingOTP && state.user) {
        router.push('/admin/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Email atau password salah.');
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (otp.length !== 6) {
      setError('Kode OTP harus 6 digit');
      return;
    }

    try {
      await verifyOTP(otp);
      router.push('/admin/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Kode OTP tidak valid');
    }
  };

  const handleVerifyTOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (totpToken.length !== 6) {
      setError('Kode harus 6 digit');
      return;
    }

    try {
      await verifyTOTP(totpToken);
      router.push('/admin/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Kode tidak valid');
    }
  };

  // TOTP Setup Screen
  if (pendingTOTPSetup && totpUserId && totpQRCode) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-gray-900 mb-1">Setup Authenticator</h1>
              <p className="text-sm text-gray-600">Scan QR code dengan Google Authenticator</p>
            </div>

            {(error || authError) && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">{error || authError}</div>
            )}

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex justify-center mb-3">
                  <img src={totpQRCode} alt="QR Code" className="w-40 h-40 border-2 border-white rounded-lg shadow" />
                </div>
                <p className="text-xs text-center text-gray-600 mb-2">Atau masukkan kode manual:</p>
                <div className="bg-white rounded p-2 border border-gray-200">
                  <code className="text-xs text-gray-800 break-all">{totpSecret}</code>
                </div>
              </div>

              <form onSubmit={handleVerifyTOTP} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Kode Verifikasi</label>
                  <input
                    type="text"
                    value={totpToken}
                    onChange={(e) => setTotpToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    maxLength={6}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-center text-2xl tracking-[0.5em] font-bold focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none"
                    required
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading || totpToken.length !== 6}
                  className="w-full py-2.5 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Memverifikasi...' : 'Verifikasi & Aktifkan'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // TOTP Verification Screen
  if (pendingTOTP && totpUserId) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h1 className="text-lg font-bold text-gray-900 mb-1">Verifikasi 2FA</h1>
              <p className="text-sm text-gray-600">Masukkan kode dari Google Authenticator</p>
            </div>

            {(error || authError) && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">{error || authError}</div>
            )}

            <form onSubmit={handleVerifyTOTP} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Kode Authenticator</label>
                <input
                  type="text"
                  value={totpToken}
                  onChange={(e) => setTotpToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-center text-2xl tracking-[0.5em] font-bold focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none"
                  required
                  autoFocus
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || totpToken.length !== 6}
                className="w-full py-2.5 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Memverifikasi...' : 'Verifikasi'}
              </button>
              <button
                type="button"
                onClick={() => {
                  useAuthStore.getState().clearTOTP();
                  setTotpToken('');
                  setError('');
                }}
                className="w-full text-sm text-gray-600 hover:text-gray-800"
              >
                Kembali
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
          <div className="text-center mb-6">
            <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center mx-auto mb-3">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-lg font-bold text-gray-900">Admin Access</h1>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
              {error}
            </div>
          )}

          {!pendingOTP ? (
            <>
            <div className="text-center mb-6">
              <p className="text-sm text-gray-600 mb-4">Login dengan akun Google Workspace Anda untuk mengakses admin panel</p>
            </div>

            {/* Google Sign-In Only */}
            <div id="google-signin-btn-admin" className="flex justify-center"></div>
            {googleLoading && (
              <p className="text-center text-xs text-gray-500 mt-2">Memproses login Google...</p>
            )}

            <div className="mt-6 pt-4 border-t border-gray-200 text-center">
              <p className="text-xs text-gray-500">Admin access requires Google OAuth + 2FA</p>
            </div>
            </>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <p className="text-sm text-gray-600 text-center">
                Masukkan kode OTP yang telah dikirim ke email Anda.
              </p>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Kode OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm text-center tracking-[0.5em] font-mono focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none"
                  maxLength={6}
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors"
              >
                Verifikasi
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
