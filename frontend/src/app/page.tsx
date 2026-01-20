'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { programsApi, gamificationApi, articlesApi } from '@/lib/api';
import { Program, LeaderboardEntry, Article } from '@/types';
import { useAuthStore } from '@/store/auth';

export default function HomePage() {
  const { user, isAuthenticated } = useAuthStore();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      const [programsRes, leaderboardRes, articlesRes] = await Promise.all([
        programsApi.getAll('ACTIVE', 6, 0),
        gamificationApi.getLeaderboard(5, 0),
        articlesApi.getAll('PUBLISHED', undefined, undefined, 3, 0),
      ]);

      setPrograms(programsRes.data.data || []);
      setLeaderboard(leaderboardRes.data.data || []);
      setArticles(articlesRes.data.data || []);
    } catch (error) {
      console.error('Failed to fetch home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const calculateProgress = (collected: number, target: number) => {
    return Math.min((collected / target) * 100, 100);
  };

  const calculateDaysLeft = (endDate: string | Date) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const totalCollected = programs.reduce((sum, p) => sum + p.collectedAmount, 0);
  const totalDonors = programs.reduce((sum, p) => sum + p.donorCount, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                sesama
              </span>
            </Link>

            <div className="hidden lg:flex items-center space-x-1">
              <Link
                href="/programs"
                className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all font-medium"
              >
                Program
              </Link>
              <Link
                href="/articles"
                className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all font-medium"
              >
                Laporan
              </Link>
              <Link
                href="/leaderboard"
                className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all font-medium"
              >
                Donatur
              </Link>
              <Link
                href="/about"
                className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all font-medium"
              >
                Tentang
              </Link>
            </div>

            <div className="flex items-center space-x-3">
              {!mounted ? (
                <div className="w-28 h-11 bg-gray-100 rounded-xl animate-pulse" />
              ) : isAuthenticated() ? (
                <Link
                  href={user?.role && ['MANAGER', 'CONTENT_MANAGER', 'SUPERVISOR', 'SUPER_ADMIN', 'PENGUSUL'].includes(user.role)
                    ? '/admin/dashboard'
                    : '/dashboard'}
                  className="px-6 py-3 bg-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-semibold border border-gray-200 shadow-orange-500/30 hover:border border-gray-200 hover:shadow-orange-500/40 transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-5 py-2.5 text-gray-700 hover:text-gray-900 font-medium transition-colors"
                  >
                    Masuk
                  </Link>
                  <Link
                    href="/register"
                    className="px-6 py-3 bg-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-semibold border border-gray-200 shadow-orange-500/30 hover:border border-gray-200 hover:shadow-orange-500/40 transition-all duration-300 transform hover:-translate-y-0.5"
                  >
                    Daftar
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-orange-50/30">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold">
                <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                <span>Transparan & Terpercaya</span>
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.1] tracking-tight">
                Setiap Rupiah,
                <br />
                <span className="bg-orange-600 bg-clip-text text-transparent">
                  Jadi Harapan Baru
                </span>
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                Donasi Anda tersalurkan langsung ke yang membutuhkan. Pantau perjalanan setiap rupiah secara real-time.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/programs"
                  className="inline-flex items-center justify-center px-8 py-4 bg-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-semibold text-lg border border-gray-200 shadow-orange-500/30 hover:border border-gray-200 hover:shadow-orange-500/40 transition-all duration-300 transform hover:-translate-y-1"
                >
                  Mulai Berdonasi
                  <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link
                  href="/about"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white hover:bg-gray-50 text-gray-900 rounded-xl font-semibold text-lg border-2 border-gray-200 hover:border-gray-300 transition-all duration-300"
                >
                  Cara Kerja Kami
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 pt-8 border-t border-gray-200">
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {programs.length}+
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Program Aktif</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {totalDonors.toLocaleString('id-ID')}+
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Donatur</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">100%</div>
                  <div className="text-sm text-gray-600 mt-1">Transparan</div>
                </div>
              </div>
            </div>

            {/* Hero Image/Visual */}
            <div className="relative">
              <div className="relative bg-orange-50 rounded-lg p-8 border border-gray-200 border border-orange-100">
                <div className="absolute -top-6 -right-6 w-32 h-32 bg-orange-500 rounded-lg opacity-20 blur-2xl" />
                <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-orange-600 rounded-lg opacity-20 blur-2xl" />

                <div className="relative bg-white rounded-lg p-6 border border-gray-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-600">Total Dana Tersalurkan</span>
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                      ✓ Terverifikasi
                    </span>
                  </div>
                  <div className="text-4xl font-bold bg-orange-600 bg-clip-text text-transparent">
                    {formatCurrency(totalCollected)}
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>100% transparansi</span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl p-4 shadow-md">
                    <div className="text-sm text-gray-600 mb-1">Pencairan Otomatis</div>
                    <div className="text-2xl font-bold text-gray-900">24 jam</div>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-md">
                    <div className="text-sm text-gray-600 mb-1">Biaya Admin</div>
                    <div className="text-2xl font-bold text-gray-900">0%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div className="space-y-2">
              <h2 className="text-4xl font-bold text-gray-900">
                Program Mendesak
              </h2>
              <p className="text-lg text-gray-600">
                Mereka membutuhkan bantuan Anda sekarang
              </p>
            </div>
            <Link
              href="/programs"
              className="hidden lg:inline-flex items-center px-6 py-3 bg-white hover:bg-gray-50 text-gray-900 rounded-xl font-semibold border-2 border-gray-200 hover:border-gray-300 transition-all"
            >
              Lihat Semua Program
              <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg overflow-hidden border border-gray-200 border border-gray-100">
                  <div className="aspect-[4/3] bg-gray-200 animate-pulse" />
                  <div className="p-6 space-y-4">
                    <div className="h-6 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                    <div className="h-3 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : programs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {programs.slice(0, 6).map((program) => {
                const progress = calculateProgress(program.collectedAmount, program.targetAmount);
                const daysLeft = calculateDaysLeft(program.endDate);

                return (
                  <Link
                    key={program.id}
                    href={`/programs/${program.slug}`}
                    className="group bg-white rounded-lg overflow-hidden border border-gray-200 border border-gray-100 hover:border border-gray-200 hover:border-orange-200 transition-all duration-300 transform hover:-translate-y-2"
                  >
                    <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                      {program.imageUrl ? (
                        <img
                          src={program.imageUrl}
                          alt={program.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <svg className="w-20 h-20 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}

                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1.5 bg-white/95 backdrop-blur-sm text-gray-900 text-xs font-bold rounded-full border border-gray-200">
                          {program.category}
                        </span>
                      </div>

                      {daysLeft > 0 && daysLeft <= 7 && (
                        <div className="absolute top-4 right-4">
                          <span className="px-3 py-1.5 bg-red-500 text-white text-xs font-bold rounded-full border border-gray-200">
                            {daysLeft} hari lagi
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-6 space-y-4">
                      <h3 className="text-xl font-bold text-gray-900 line-clamp-2 leading-snug group-hover:text-orange-600 transition-colors">
                        {program.title}
                      </h3>

                      <div className="space-y-3">
                        <div>
                          <div className="flex items-baseline justify-between mb-2">
                            <span className="text-sm font-semibold text-gray-600">
                              Terkumpul
                            </span>
                            <span className="text-xs font-bold text-orange-600">
                              {progress.toFixed(0)}%
                            </span>
                          </div>

                          <div className="relative w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="absolute inset-y-0 left-0 bg-orange-600 rounded-full transition-all duration-1000 ease-out"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-xl font-bold text-gray-900">
                              {formatCurrency(program.collectedAmount)}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              dari {formatCurrency(program.targetAmount)}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-900">
                              {program.donorCount}
                            </div>
                            <div className="text-xs text-gray-500">
                              donatur
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">
                            {program.institutionName || program.beneficiaryName || 'Lembaga'}
                          </span>
                          <span className="text-orange-600 font-semibold group-hover:translate-x-1 transition-transform">
                            Donasi →
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-lg border-2 border-dashed border-gray-200">
              <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-gray-600 text-lg">Belum ada program aktif saat ini</p>
            </div>
          )}

          <div className="mt-12 text-center lg:hidden">
            <Link
              href="/programs"
              className="inline-flex items-center px-8 py-4 bg-white hover:bg-gray-50 text-gray-900 rounded-xl font-semibold border-2 border-gray-200 hover:border-gray-300 transition-all"
            >
              Lihat Semua Program
              <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Kenapa Berdonasi di sesama?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Kami memastikan setiap rupiah Anda tersalurkan dengan transparan dan akuntabel
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="group p-8 bg-orange-50 rounded-lg hover:border border-gray-200 transition-all duration-300 border border-orange-100">
              <div className="w-14 h-14 bg-orange-600 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-gray-200">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                100% Terverifikasi
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Setiap program diverifikasi tim kami. Data lengkap dan dokumen pendukung bisa diakses kapan saja.
              </p>
            </div>

            <div className="group p-8 bg-blue-50 rounded-lg hover:border border-gray-200 transition-all duration-300 border border-blue-100">
              <div className="w-14 h-14 bg-blue-600 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-gray-200">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Transparansi Penuh
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Pantau penggunaan dana real-time. Laporan penyaluran lengkap dengan foto dan dokumentasi tersedia.
              </p>
            </div>

            <div className="group p-8 bg-green-50 rounded-lg hover:border border-gray-200 transition-all duration-300 border border-green-100">
              <div className="w-14 h-14 bg-green-600 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-gray-200">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Pencairan Cepat
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Dana otomatis cair dalam 24 jam setelah target tercapai. Tidak ada biaya admin atau potongan tersembunyi.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Leaderboard Section */}
      {leaderboard.length > 0 && (
        <section className="py-20 px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-gray-50/50">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Pendonasi Terbaik
              </h2>
              <p className="text-lg text-gray-600">
                Apresiasi untuk para dermawan yang telah membantu sesama
              </p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 border border-gray-100 overflow-hidden">
              {leaderboard.slice(0, 5).map((entry, index) => (
                <div
                  key={entry.id}
                  className={`flex items-center justify-between p-6 hover:bg-gray-50 transition-colors ${
                    index !== leaderboard.length - 1 ? 'border-b border-gray-100' : ''
                  }`}
                >
                  <div className="flex items-center space-x-6">
                    <div className={`relative w-16 h-16 rounded-lg flex items-center justify-center font-bold text-xl border border-gray-200 ${
                      index === 0
                        ? 'bg-yellow-500 text-white'
                        : index === 1
                        ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white'
                        : index === 2
                        ? 'bg-gradient-to-br from-orange-400 to-orange-500 text-white'
                        : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700'
                    }`}>
                      {index === 0 && (
                        <div className="absolute -top-2 -right-2">
                          <span className="text-2xl">👑</span>
                        </div>
                      )}
                      #{entry.rank}
                    </div>

                    <div>
                      <div className="text-lg font-bold text-gray-900 mb-1">
                        {entry.donorName}
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{entry.donationCount} donasi</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-bold bg-orange-600 bg-clip-text text-transparent">
                      {formatCurrency(Number(entry.totalDonations))}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      total donasi
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <Link
                href="/leaderboard"
                className="inline-flex items-center px-8 py-4 bg-white hover:bg-gray-50 text-gray-900 rounded-xl font-semibold border-2 border-gray-200 hover:border-gray-300 transition-all border border-gray-200 hover:border border-gray-200"
              >
                Lihat Seluruh Leaderboard
                <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-24 px-6 lg:px-8 bg-orange-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,rgba(255,255,255,0.3))]" />

        <div className="max-w-4xl mx-auto text-center relative">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            Punya Program yang
            <br />
            Butuh Pendanaan?
          </h2>
          <p className="text-xl text-orange-50 mb-10 max-w-2xl mx-auto leading-relaxed">
            Ajukan program Anda dan raih dukungan dari ribuan donatur di seluruh Indonesia. Proses mudah, cepat, dan transparan.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/pengusul/register"
              className="inline-flex items-center justify-center px-8 py-4 bg-white hover:bg-gray-50 text-orange-600 rounded-xl font-bold text-lg border border-gray-200 hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1"
            >
              Daftar Sebagai Pengusul
              <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center justify-center px-8 py-4 bg-orange-700/50 hover:bg-orange-700/70 text-white rounded-xl font-semibold text-lg backdrop-blur-sm border-2 border-white/30 hover:border-white/50 transition-all"
            >
              Pelajari Lebih Lanjut
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div>
              <div className="text-3xl font-bold text-white mb-1">24 jam</div>
              <div className="text-sm text-orange-100">Proses verifikasi</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-1">0%</div>
              <div className="text-sm text-orange-100">Biaya platform</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-1">100%</div>
              <div className="text-sm text-orange-100">Dana tersalur</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">S</span>
                </div>
                <span className="text-2xl font-bold">sesama</span>
              </div>
              <p className="text-gray-400 leading-relaxed max-w-sm mb-6">
                Platform donasi terpercaya yang menghubungkan kebaikan Anda dengan mereka yang membutuhkan.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4">Program</h3>
              <ul className="space-y-3">
                <li><Link href="/programs" className="text-gray-400 hover:text-white transition-colors">Semua Program</Link></li>
                <li><Link href="/articles" className="text-gray-400 hover:text-white transition-colors">Laporan Penyaluran</Link></li>
                <li><Link href="/leaderboard" className="text-gray-400 hover:text-white transition-colors">Leaderboard</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4">Perusahaan</h3>
              <ul className="space-y-3">
                <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors">Tentang Kami</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Hubungi Kami</Link></li>
                <li><Link href="/faq" className="text-gray-400 hover:text-white transition-colors">FAQ</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4">Legal</h3>
              <ul className="space-y-3">
                <li><Link href="/terms" className="text-gray-400 hover:text-white transition-colors">Syarat & Ketentuan</Link></li>
                <li><Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">Kebijakan Privasi</Link></li>
                <li><Link href="/legal" className="text-gray-400 hover:text-white transition-colors">Informasi Legal</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-500 text-sm">
              © 2026 sesama. Seluruh hak cipta dilindungi.
            </p>
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Terdaftar & Diawasi OJK
              </span>
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                SSL Secure
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
