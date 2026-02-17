'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import Link from 'next/link';

declare global {
  interface Window {
    google?: any;
  }
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

export default function LoginPage() {
  const router = useRouter();
  const {
    login,
    googleLogin,
    verifyOTP,
    resendOTP,
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
      await googleLogin(response.credential, 'public');
      const state = useAuthStore.getState();
      if (state.user) {
        router.push('/dashboard');
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
          document.getElementById('google-signin-btn'),
          {
            theme: 'outline',
            size: 'large',
            width: '100%',
            text: 'signin_with',
            shape: 'rectangular',
            logo_alignment: 'left',
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
      await login(email, password, 'public');

      const state = useAuthStore.getState();
      if (!state.pendingOTP && state.user) {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Email atau password salah. Silakan coba lagi.');
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

  const handleResendOTP = async () => {
    setError('');
    try {
      await resendOTP();
      alert('Kode OTP baru telah dikirim ke email Anda');
    } catch (err: any) {
      setError('Gagal mengirim ulang OTP');
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

  // TOTP Setup Screen (First time admin login)
  if (pendingTOTPSetup && totpUserId && totpQRCode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-base">S</span>
              </div>
              <span className="text-xl font-bold text-gray-900">SobatBantu</span>
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-br from-primary-600 to-primary-700 p-8 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.1)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.1)_50%,rgba(255,255,255,0.1)_75%,transparent_75%)] bg-[length:40px_40px] opacity-30" />
              <div className="relative">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-white/30">
                  <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Setup Google Authenticator</h1>
                <p className="text-primary-100 text-sm">
                  Scan QR code di bawah dengan Google Authenticator
                </p>
              </div>
            </div>

            <div className="p-8">
              {(error || authError) && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-red-700 font-medium">{error || authError}</p>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
                  <div className="flex justify-center mb-4">
                    <img src={totpQRCode} alt="QR Code" className="w-48 h-48 border-4 border-white rounded-xl shadow-lg" />
                  </div>
                  <p className="text-xs text-center text-gray-600 mb-2">Atau masukkan kode manual:</p>
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <code className="text-xs text-gray-800 break-all font-mono">{totpSecret}</code>
                  </div>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-4">
                  <p className="text-sm text-blue-700">
                    📱 <strong>Langkah-langkah:</strong>
                  </p>
                  <ol className="text-xs text-blue-600 mt-2 space-y-1 ml-4 list-decimal">
                    <li>Download Google Authenticator di Play Store / App Store</li>
                    <li>Buka app dan scan QR code di atas</li>
                    <li>Masukkan kode 6 digit yang muncul di bawah ini</li>
                  </ol>
                </div>

                <form onSubmit={handleVerifyTOTP} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3 text-center">
                      Masukkan Kode Verifikasi
                    </label>
                    <input
                      type="text"
                      value={totpToken}
                      onChange={(e) => setTotpToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="● ● ● ● ● ●"
                      maxLength={6}
                      className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:border-primary-600 focus:ring-4 focus:ring-primary-600/10 text-center text-3xl tracking-[0.5em] font-bold text-gray-900 outline-none transition-all bg-gray-50 hover:bg-white"
                      required
                      autoFocus
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || totpToken.length !== 6}
                    className="w-full py-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold text-base rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                  >
                    {isLoading ? 'Memverifikasi...' : 'Verifikasi & Aktifkan'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // TOTP Verification Screen (Returning admin)
  if (pendingTOTP && totpUserId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-base">S</span>
              </div>
              <span className="text-xl font-bold text-gray-900">SobatBantu</span>
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-br from-primary-600 to-primary-700 p-8 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.1)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.1)_50%,rgba(255,255,255,0.1)_75%,transparent_75%)] bg-[length:40px_40px] opacity-30" />
              <div className="relative">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-white/30">
                  <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Verifikasi 2FA</h1>
                <p className="text-primary-100 text-sm">
                  Masukkan kode dari Google Authenticator
                </p>
              </div>
            </div>

            <div className="p-8">
              {(error || authError) && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-red-700 font-medium">{error || authError}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleVerifyTOTP} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3 text-center">
                    Kode Authenticator
                  </label>
                  <input
                    type="text"
                    value={totpToken}
                    onChange={(e) => setTotpToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="● ● ● ● ● ●"
                    maxLength={6}
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:border-primary-600 focus:ring-4 focus:ring-primary-600/10 text-center text-3xl tracking-[0.5em] font-bold text-gray-900 outline-none transition-all bg-gray-50 hover:bg-white"
                    required
                    autoFocus
                  />
                  <div className="mt-3 flex items-center justify-center gap-2 text-xs text-gray-500">
                    <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Buka Google Authenticator untuk melihat kode</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || totpToken.length !== 6}
                  className="w-full py-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold text-base rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  {isLoading ? 'Memverifikasi...' : 'Verifikasi'}
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                <button
                  onClick={() => {
                    useAuthStore.getState().clearTOTP();
                    setTotpToken('');
                    setError('');
                  }}
                  className="flex items-center gap-2 text-gray-500 hover:text-gray-700 font-medium transition-colors mx-auto"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Kembali
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Email OTP Verification Screen (Legacy)
  if (pendingOTP && otpUserId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo & Back Button */}
          <div className="mb-8 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-base">S</span>
              </div>
              <span className="text-xl font-bold text-gray-900">SobatBantu</span>
            </Link>
          </div>

          {/* Main Card */}
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
            {/* Header Section with Icon */}
            <div className="bg-gradient-to-br from-primary-600 to-primary-700 p-8 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.1)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.1)_50%,rgba(255,255,255,0.1)_75%,transparent_75%)] bg-[length:40px_40px] opacity-30" />
              <div className="relative">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-white/30">
                  <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Verifikasi Kode OTP</h1>
                <p className="text-primary-100 text-sm">
                  Masukkan kode 6 digit yang telah dikirim ke email Anda
                </p>
              </div>
            </div>

            {/* Form Section */}
            <div className="p-8">
              {(error || authError) && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-red-700 font-medium">{error || authError}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleVerifyOTP} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3 text-center">
                    Kode Verifikasi
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="● ● ● ● ● ●"
                    maxLength={6}
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:border-primary-600 focus:ring-4 focus:ring-primary-600/10 text-center text-3xl tracking-[0.5em] font-bold text-gray-900 outline-none transition-all bg-gray-50 hover:bg-white"
                    required
                    autoFocus
                  />
                  <div className="mt-3 flex items-center justify-center gap-2 text-xs text-gray-500">
                    <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Kode OTP telah dikirim ke email Anda</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || otp.length !== 6}
                  className="w-full py-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold text-base rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl disabled:shadow-none transform hover:-translate-y-0.5 disabled:transform-none"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Memverifikasi...
                    </span>
                  ) : (
                    'Verifikasi Kode'
                  )}
                </button>
              </form>

              {/* Action Buttons */}
              <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
                <button
                  onClick={handleResendOTP}
                  disabled={isLoading}
                  className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold disabled:opacity-50 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Kirim Ulang Kode
                </button>
                <button
                  onClick={() => {
                    useAuthStore.getState().clearOTP();
                    setOtp('');
                    setError('');
                  }}
                  className="flex items-center gap-2 text-gray-500 hover:text-gray-700 font-medium transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Kembali
                </button>
              </div>
            </div>
          </div>

          {/* Help Text */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Tidak menerima kode?{' '}
              <button
                onClick={handleResendOTP}
                disabled={isLoading}
                className="text-primary-600 hover:text-primary-700 font-semibold underline disabled:opacity-50"
              >
                Kirim ulang
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Form */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <Link href="/" className="text-xl font-bold text-gray-900">SobatBantu</Link>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">Masuk</h1>
          <p className="text-sm text-gray-600 mb-6">
            Masuk untuk melanjutkan ke akun Anda
          </p>

          {(error || authError) && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              {error || authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full px-3 py-2.5 border border-gray-300 rounded focus:border-primary-600 focus:ring-2 focus:ring-primary-600/10 outline-none text-gray-900 text-sm transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="w-full px-3 py-2.5 pr-10 border border-gray-300 rounded focus:border-primary-600 focus:ring-2 focus:ring-primary-600/10 outline-none text-gray-900 text-sm transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {showPassword ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    ) : (
                      <>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </>
                    )}
                  </svg>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || googleLoading}
              className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium text-sm rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white text-gray-500">atau</span>
            </div>
          </div>

          {/* Google Sign-In Button */}
          <div id="google-signin-btn" className="flex justify-center"></div>
          {googleLoading && (
            <p className="text-center text-sm text-gray-500 mt-2">Memproses login Google...</p>
          )}

          <div className="mt-6 text-center text-sm">
            <p className="text-gray-600">
              Belum punya akun?{' '}
              <Link href="/register" className="text-primary-600 hover:text-primary-700 font-medium">
                Daftar
              </Link>
            </p>
            <Link href="/" className="inline-block mt-3 text-xs text-gray-400 hover:text-gray-600">
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>

      {/* Right panel - Enhanced Design */}
      <div className="hidden lg:flex flex-1 relative bg-primary-600 items-center justify-center p-12 overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)]"></div>

        <div className="relative max-w-lg text-white">
          <div className="inline-flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-full mb-6 border border-white/30">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-white font-semibold text-xs tracking-wide">Platform Terpercaya</span>
          </div>

          <h2 className="text-3xl lg:text-4xl font-bold mb-4 leading-tight">
            Salurkan Kebaikan dengan Aman & Transparan
          </h2>
          <p className="text-lg text-primary-100 mb-10 leading-relaxed">
            Bergabunglah dengan ribuan donatur yang telah mempercayai kami untuk menyalurkan bantuan kepada yang membutuhkan.
          </p>

          <div className="space-y-4 mb-10">
            {[
              {
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />,
                title: 'Terverifikasi & Transparan',
                desc: 'Semua program diverifikasi ketat dan dapat dilacak secara real-time'
              },
              {
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />,
                title: 'Pencairan Instan',
                desc: 'Dana tersalurkan dalam 24 jam tanpa potongan biaya admin'
              },
              {
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />,
                title: 'Komunitas Peduli',
                desc: 'Bergabung dengan 100K+ donatur di seluruh Indonesia'
              },
            ].map((item, idx) => (
              <div key={idx} className="flex gap-4 items-start bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center shrink-0 border border-white/30">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {item.icon}
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">{item.title}</h3>
                  <p className="text-sm text-primary-100 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { value: '100K+', label: 'Donatur Aktif', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /> },
              { value: '500+', label: 'Program Sukses', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /> },
              { value: '4.9/5', label: 'Rating Donatur', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /> },
            ].map((stat, idx) => (
              <div key={idx} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center border border-white/20">
                <div className="w-8 h-8 mx-auto mb-2 bg-white/20 rounded-lg flex items-center justify-center border border-white/30">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {stat.icon}
                  </svg>
                </div>
                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-xs text-primary-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
