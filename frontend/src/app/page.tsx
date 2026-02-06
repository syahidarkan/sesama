'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { programsApi, gamificationApi, articlesApi } from '@/lib/api';
import { Program, LeaderboardEntry, Article } from '@/types';
import { useAuthStore } from '@/store/auth';

interface PlatformStats {
  totalDonors: number;
  totalDonations: number;
  totalTransactions: number;
}

export default function HomePage() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [stats, setStats] = useState<PlatformStats>({ totalDonors: 0, totalDonations: 0, totalTransactions: 0 });
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    setMounted(true);
    fetchHomeData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchHomeData = async () => {
    try {
      const [programsRes, leaderboardRes, articlesRes, statsRes] = await Promise.all([
        programsApi.getAll('ACTIVE', 6, 0),
        gamificationApi.getLeaderboard(5, 0),
        articlesApi.getAll('PUBLISHED', undefined, undefined, 3, 0),
        gamificationApi.getStatistics(),
      ]);
      setPrograms(programsRes.data.data || []);
      setLeaderboard(leaderboardRes.data.data || []);
      setArticles(articlesRes.data.data || []);
      setStats(statsRes.data || { totalDonors: 0, totalDonations: 0, totalTransactions: 0 });
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

  const calculateDaysLeft = (endDate?: string | Date) => {
    if (!endDate) return null;
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  // Placeholder images for programs without images
  const getPlaceholderImage = (index: number, category?: string) => {
    const images = [
      'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=600&h=400&fit=crop', // charity hands
      'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&h=400&fit=crop', // children helping
      'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=600&h=400&fit=crop', // community
      'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=600&h=400&fit=crop', // helping hands
      'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=600&h=400&fit=crop', // donation box
      'https://images.unsplash.com/photo-1594708767771-a7502f3a6c12?w=600&h=400&fit=crop', // food donation
    ];
    return images[index % images.length];
  };

  const totalCollected = stats.totalDonations || programs.reduce((sum, p) => sum + p.collectedAmount, 0);
  const totalDonors = stats.totalDonors || 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs sm:text-sm">S</span>
              </div>
              <span className="text-lg sm:text-xl font-bold text-gray-900">sesama</span>
            </Link>

            <div className="hidden lg:flex items-center gap-1">
              {[
                { label: 'Program', href: '/programs' },
                { label: 'Laporan', href: '/articles' },
                { label: 'Donatur', href: '/leaderboard' },
                { label: 'Tentang', href: '/about' },
              ].map((link) => (
                <Link key={link.href} href={link.href} className="px-3 py-2 text-sm text-gray-600 hover:text-primary-600 rounded font-medium transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {!mounted ? (
                <div className="w-20 sm:w-24 h-8 sm:h-9 bg-gray-100 rounded" />
              ) : isAuthenticated() ? (
                <div className="flex items-center gap-2 sm:gap-3">
                  <Link
                    href={user?.role && ['MANAGER', 'CONTENT_MANAGER', 'SUPERVISOR', 'SUPER_ADMIN'].includes(user.role) ? '/admin/dashboard' : '/dashboard'}
                    className="px-3 sm:px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs sm:text-sm rounded-lg font-medium transition-colors"
                  >
                    Dashboard
                  </Link>
                  <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                    <div className="w-7 h-7 bg-primary-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">{user?.name?.charAt(0) || 'U'}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900 hidden md:block">{user?.name}</span>
                  </div>
                  <button
                    onClick={logout}
                    className="px-2 sm:px-4 py-2 text-xs sm:text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
                  >
                    Keluar
                  </button>
                </div>
              ) : (
                <>
                  <Link href="/login" className="px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors">
                    Masuk
                  </Link>
                  <Link href="/register" className="px-3 sm:px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs sm:text-sm rounded-lg font-medium transition-colors">
                    Daftar
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Blue Background */}
      <section className="bg-primary-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.05)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.05)_50%,rgba(255,255,255,0.05)_75%,transparent_75%)] bg-[length:40px_40px] opacity-30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-4 sm:space-y-6 animate-slideInLeft">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/15 text-white rounded-lg text-xs font-semibold tracking-wide uppercase border border-white/20">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Terverifikasi & Transparan</span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-white leading-tight tracking-tight">
                Platform Donasi
                <br />
                Terpercaya untuk Indonesia
              </h1>

              <p className="text-base sm:text-lg text-primary-100 leading-relaxed max-w-lg">
                Setiap kontribusi tersalurkan langsung ke penerima manfaat.
                Pantau perkembangan donasi secara real-time dengan transparansi penuh.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link
                  href="/programs"
                  className="inline-flex items-center justify-center px-6 py-3 bg-white hover:bg-gray-50 text-primary-700 rounded-lg font-semibold transition-all hover:shadow-lg hover:-translate-y-0.5 group"
                >
                  Mulai Berdonasi
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link
                  href="/about"
                  className="inline-flex items-center justify-center px-6 py-3 text-white rounded-lg font-medium border border-white/30 hover:bg-white/10 transition-all hover:border-white/50"
                >
                  Pelajari Lebih Lanjut
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/20">
                <div>
                  <div className="text-2xl font-bold text-white">{programs.length}+</div>
                  <div className="text-sm text-primary-200 mt-0.5">Program Aktif</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{totalDonors.toLocaleString('id-ID')}+</div>
                  <div className="text-sm text-primary-200 mt-0.5">Donatur</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">100%</div>
                  <div className="text-sm text-primary-200 mt-0.5">Transparan</div>
                </div>
              </div>
            </div>

            <div className="hidden lg:block animate-slideInRight">
              <div className="bg-white/10 rounded-2xl p-6 border border-white/20">
                <div className="bg-white rounded-xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">Total Dana Tersalurkan</span>
                    <span className="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-lg">
                      Terverifikasi
                    </span>
                  </div>
                  <div className="text-3xl font-bold text-gray-900">
                    {formatCurrency(totalCollected)}
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-gray-500">
                    <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Setiap rupiah tercatat & terlapor</span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-xl p-4">
                    <div className="text-xs text-gray-500 mb-1">Pencairan</div>
                    <div className="text-lg font-bold text-gray-900">24 jam</div>
                  </div>
                  <div className="bg-white rounded-xl p-4">
                    <div className="text-xs text-gray-500 mb-1">Biaya Admin</div>
                    <div className="text-lg font-bold text-gray-900">0%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Running Banner - Trust & Stats */}
      <div className="relative bg-white border-y border-gray-200 py-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-white z-10 pointer-events-none" />

        <div className="flex animate-scroll">
          {/* First set of items */}
          {[
            { icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />, text: 'Platform Terverifikasi', subtext: 'Terdaftar & Diawasi' },
            { icon: <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />, text: '100.000+ Donatur', subtext: 'Bergabung Bersama Kami' },
            { icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />, text: 'Rp 50M+ Tersalurkan', subtext: 'Dana Terkumpul' },
            { icon: <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />, text: 'Pencairan 24 Jam', subtext: 'Proses Cepat' },
            { icon: <><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>, text: 'Transparansi 100%', subtext: 'Laporan Real-time' },
            { icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />, text: 'Sistem Aman', subtext: 'SSL Encrypted' },
            { icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />, text: 'Biaya Admin 0%', subtext: '100% ke Penerima' },
            { icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />, text: 'Program Terverifikasi', subtext: 'Survey Lapangan' },
          ].map((item, index) => (
            <div key={`set1-${index}`} className="flex items-center gap-3 mx-8 shrink-0">
              <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  {item.icon}
                </svg>
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-gray-900 whitespace-nowrap">{item.text}</div>
                <div className="text-xs text-gray-500 whitespace-nowrap">{item.subtext}</div>
              </div>
            </div>
          ))}

          {/* Duplicate set for seamless loop */}
          {[
            { icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />, text: 'Platform Terverifikasi', subtext: 'Terdaftar & Diawasi' },
            { icon: <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />, text: '100.000+ Donatur', subtext: 'Bergabung Bersama Kami' },
            { icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />, text: 'Rp 50M+ Tersalurkan', subtext: 'Dana Terkumpul' },
            { icon: <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />, text: 'Pencairan 24 Jam', subtext: 'Proses Cepat' },
            { icon: <><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>, text: 'Transparansi 100%', subtext: 'Laporan Real-time' },
            { icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />, text: 'Sistem Aman', subtext: 'SSL Encrypted' },
            { icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />, text: 'Biaya Admin 0%', subtext: '100% ke Penerima' },
            { icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />, text: 'Program Terverifikasi', subtext: 'Survey Lapangan' },
          ].map((item, index) => (
            <div key={`set2-${index}`} className="flex items-center gap-3 mx-8 shrink-0">
              <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  {item.icon}
                </svg>
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-gray-900 whitespace-nowrap">{item.text}</div>
                <div className="text-xs text-gray-500 whitespace-nowrap">{item.subtext}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Poster Carousel */}
      <section className="py-12 px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="relative overflow-hidden rounded-2xl shadow-xl">
            <div className="flex transition-transform duration-700 ease-in-out" style={{
              transform: `translateX(-${currentSlide * 100}%)`
            }}>
              {[
                {
                  title: 'Salurkan Kebaikan Anda',
                  subtitle: 'Bersama membantu sesama yang membutuhkan',
                  gradient: 'from-primary-600 to-primary-800',
                  icon: '💙'
                },
                {
                  title: 'Transparan & Terpercaya',
                  subtitle: 'Pantau donasi Anda secara real-time',
                  gradient: 'from-accent-600 to-accent-800',
                  icon: '✓'
                },
                {
                  title: 'Mulai dari Rp 10.000',
                  subtitle: 'Setiap kontribusi sangat berarti',
                  gradient: 'from-amber-600 to-orange-800',
                  icon: '🌟'
                }
              ].map((poster, index) => (
                <div
                  key={index}
                  className={`min-w-full bg-gradient-to-br ${poster.gradient} p-12 lg:p-16 flex flex-col lg:flex-row items-center justify-between gap-8`}
                >
                  <div className="text-white space-y-4 flex-1">
                    <div className="text-6xl lg:text-7xl mb-4 animate-float">{poster.icon}</div>
                    <h2 className="text-3xl lg:text-4xl font-bold leading-tight">{poster.title}</h2>
                    <p className="text-lg lg:text-xl opacity-90">{poster.subtitle}</p>
                    <Link
                      href="/programs"
                      className="inline-flex items-center mt-6 px-6 py-3 bg-white text-primary-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors shadow-lg"
                    >
                      Lihat Program
                      <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Link>
                  </div>
                  <div className="hidden lg:flex items-center justify-center w-64 h-64 bg-white/10 rounded-full backdrop-blur-sm border-4 border-white/30">
                    <div className="text-8xl animate-float">{poster.icon}</div>
                  </div>
                </div>
              ))}
            </div>
            {/* Carousel Indicators */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2">
              {[0, 1, 2].map((i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    currentSlide === i
                      ? 'bg-white w-8'
                      : 'bg-white/50 w-2 hover:bg-white/70'
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section className="py-16 px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Program Aktif</h2>
              <p className="text-gray-500 mt-1">Salurkan bantuan Anda ke program yang membutuhkan</p>
            </div>
            <Link
              href="/programs"
              className="hidden lg:inline-flex items-center px-4 py-2 text-sm text-primary-600 hover:text-primary-700 font-medium border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors"
            >
              Lihat Semua
              <svg className="w-4 h-4 ml-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl overflow-hidden border border-gray-200">
                  <div className="aspect-[16/10] bg-gray-100" />
                  <div className="p-5 space-y-3">
                    <div className="h-5 bg-gray-100 rounded w-3/4" />
                    <div className="h-4 bg-gray-100 rounded w-1/2" />
                    <div className="h-2 bg-gray-100 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : programs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {programs.slice(0, 6).map((program, index) => {
                const progress = calculateProgress(program.collectedAmount, program.targetAmount);
                const daysLeft = calculateDaysLeft(program.endDate);

                return (
                  <Link
                    key={program.id}
                    href={`/programs/${program.slug}`}
                    className={`group bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-primary-300 hover:shadow-lg hover-scale transition-all duration-200 animate-fadeInUp stagger-${index + 1}`}
                  >
                    <div className="relative aspect-[16/10] bg-gray-100 overflow-hidden">
                      <img
                        src={program.imageUrl || getPlaceholderImage(index, program.category)}
                        alt={program.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />

                      {program.category && (
                        <div className="absolute top-3 left-3">
                          <span className="px-2.5 py-1 bg-primary-600 text-white text-xs font-medium rounded-lg">
                            {program.category}
                          </span>
                        </div>
                      )}

                      {daysLeft !== null && daysLeft > 0 && daysLeft <= 7 && (
                        <div className="absolute top-3 right-3">
                          <span className="px-2.5 py-1 bg-red-500 text-white text-xs font-medium rounded-lg">
                            {daysLeft} hari lagi
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-5 space-y-3">
                      <h3 className="text-base font-semibold text-gray-900 line-clamp-2 leading-snug group-hover:text-primary-600 transition-colors">
                        {program.title}
                      </h3>

                      <div>
                        <div className="flex items-baseline justify-between mb-1.5">
                          <span className="text-sm font-bold text-primary-600">
                            {formatCurrency(program.collectedAmount)}
                          </span>
                          <span className="text-xs text-gray-400">
                            {progress.toFixed(0)}%
                          </span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary-600 rounded-full transition-all duration-700"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-400 mt-1.5">
                          dari {formatCurrency(program.targetAmount)}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                        <span>{program.institutionName || program.beneficiaryName || 'Penggalang Dana'}</span>
                        <span className="text-primary-600 font-semibold group-hover:translate-x-0.5 transition-transform">
                          Donasi &rarr;
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
              <p className="text-gray-500">Belum ada program aktif saat ini</p>
            </div>
          )}

          <div className="mt-8 text-center lg:hidden">
            <Link
              href="/programs"
              className="inline-flex items-center px-5 py-2.5 text-sm text-primary-600 font-medium border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors"
            >
              Lihat Semua Program
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-900">Mengapa Berdonasi di Sesama</h2>
            <p className="text-gray-500 mt-2 max-w-xl mx-auto">
              Kami memastikan setiap donasi tersalurkan dengan transparan dan akuntabel
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />,
                title: 'Program Terverifikasi',
                desc: 'Setiap program diverifikasi tim kami. Dokumen pendukung dan data lengkap tersedia untuk diakses.',
              },
              {
                icon: <><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>,
                title: 'Transparansi Penuh',
                desc: 'Pantau penggunaan dana secara real-time. Laporan penyaluran lengkap dengan dokumentasi tersedia.',
              },
              {
                icon: <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />,
                title: 'Pencairan Cepat',
                desc: 'Dana cair dalam 24 jam. Tidak ada biaya admin atau potongan tersembunyi.',
              },
            ].map((item, index) => (
              <div key={item.title} className={`p-6 rounded-xl bg-primary-50 border border-primary-100 hover:shadow-md hover-scale transition-all animate-scaleIn stagger-${index + 1}`}>
                <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    {item.icon}
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Clean Timeline */}
      <section className="py-20 px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-4">
              Cara Kerja
            </span>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">3 Langkah Mudah Berdonasi</h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Proses donasi yang sederhana, transparan, dan terpercaya
            </p>
          </div>

          {/* Steps Grid */}
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting Line - Desktop Only */}
            <div className="hidden md:block absolute top-16 left-[16.67%] right-[16.67%] h-0.5 bg-gradient-to-r from-primary-200 via-primary-400 to-primary-200" />

            {/* Step 1 */}
            <div className="relative group">
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:border-primary-200 transition-all duration-300 h-full">
                {/* Step Number */}
                <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg mb-6 group-hover:scale-110 transition-transform relative z-10">
                  1
                </div>

                {/* Icon */}
                <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-primary-100 transition-colors">
                  <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-3">Pilih Program</h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  Jelajahi berbagai program terverifikasi yang sesuai dengan niat baik Anda
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative group">
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:border-primary-200 transition-all duration-300 h-full">
                {/* Step Number */}
                <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg mb-6 group-hover:scale-110 transition-transform relative z-10">
                  2
                </div>

                {/* Icon */}
                <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-primary-100 transition-colors">
                  <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-3">Donasi Aman</h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  Lakukan donasi dengan berbagai metode pembayaran yang aman dan terpercaya
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative group">
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:border-primary-200 transition-all duration-300 h-full">
                {/* Step Number */}
                <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg mb-6 group-hover:scale-110 transition-transform relative z-10">
                  3
                </div>

                {/* Icon */}
                <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-primary-100 transition-colors">
                  <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-3">Pantau Dampak</h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  Terima laporan penyaluran dan lihat dampak nyata dari kontribusi Anda
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <Link
              href="/programs"
              className="inline-flex items-center px-8 py-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-primary-600/25 hover:shadow-xl hover:shadow-primary-600/30 hover:-translate-y-0.5"
            >
              Mulai Berdonasi Sekarang
              <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-xs font-semibold tracking-wide uppercase mb-4">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
              <span>Testimoni</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Dipercaya Ribuan Donatur</h2>
            <p className="text-gray-500 mt-2 max-w-2xl mx-auto">
              Dengarkan pengalaman para donatur yang telah mempercayai kami menyalurkan kebaikan mereka.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: 'Ibu Sarah Putri',
                role: 'Donatur Rutin',
                avatar: 'S',
                rating: 5,
                text: 'Transparansi penuh! Setiap bulan saya donasi dan selalu dapat laporan lengkap. Sangat terbantu untuk tracking donasi saya.',
                donated: 'Rp 2.500.000',
                programs: 5,
              },
              {
                name: 'Bapak Ahmad Fauzi',
                role: 'Pengusaha',
                avatar: 'A',
                rating: 5,
                text: 'Platform terbaik untuk CSR perusahaan kami. Proses cepat, laporan detail, dan dampak terukur. Highly recommended!',
                donated: 'Rp 15.000.000',
                programs: 12,
              },
              {
                name: 'Siti Nurhaliza',
                role: 'Profesional',
                avatar: 'N',
                rating: 5,
                text: 'Saya senang bisa membantu dengan mudah. Update program real-time dan tim support sangat responsif. Terima kasih!',
                donated: 'Rp 5.750.000',
                programs: 8,
              },
            ].map((testimonial, index) => (
              <div key={testimonial.name} className={`bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover-scale transition-all duration-200 animate-scaleIn stagger-${index + 1}`}>
                {/* Rating Stars */}
                <div className="flex items-center gap-0.5 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                {/* Testimonial Text */}
                <p className="text-sm text-gray-700 leading-relaxed mb-6 italic">
                  "{testimonial.text}"
                </p>

                {/* User Info */}
                <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                  <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">{testimonial.avatar}</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-xs text-gray-500">{testimonial.role}</div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-100">
                  <div>
                    <div className="text-xs text-gray-500 mb-0.5">Total Donasi</div>
                    <div className="text-sm font-bold text-primary-600">{testimonial.donated}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-0.5">Program</div>
                    <div className="text-sm font-bold text-primary-600">{testimonial.programs} program</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA below testimonials */}
          <div className="mt-10 text-center">
            <p className="text-sm text-gray-600 mb-4">Bergabunglah dengan ribuan donatur lainnya</p>
            <Link
              href="/register"
              className="inline-flex items-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-colors shadow-md"
            >
              Mulai Berdonasi Sekarang
              <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Leaderboard Section */}
      {leaderboard.length > 0 && (
        <section className="py-16 px-6 lg:px-8 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-gray-900">Donatur Teratas</h2>
              <p className="text-gray-500 mt-1">Apresiasi untuk para dermawan yang membantu sesama</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-fadeInUp">
              {leaderboard.slice(0, 5).map((entry, index) => (
                <div
                  key={entry.id}
                  className={`flex items-center justify-between px-6 py-4 hover:bg-primary-50 transition-all hover:translate-x-1 ${
                    index !== leaderboard.length - 1 && index < 4 ? 'border-b border-gray-100' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : index === 1 ? 'bg-gray-100 text-gray-600 border border-gray-200'
                      : index === 2 ? 'bg-orange-50 text-orange-600 border border-orange-200'
                      : 'bg-gray-50 text-gray-500 border border-gray-200'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{entry.donorName}</div>
                      <div className="text-xs text-gray-400">{entry.donationCount} donasi</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-bold text-primary-600">
                      {formatCurrency(Number(entry.totalDonations))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-6">
              <Link
                href="/leaderboard"
                className="inline-flex items-center px-4 py-2 text-sm text-primary-600 font-medium border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors"
              >
                Lihat Seluruh Leaderboard
                <svg className="w-4 h-4 ml-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 px-6 lg:px-8 bg-primary-700">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Punya Program yang Butuh Pendanaan?
          </h2>
          <p className="text-primary-100 mb-8 max-w-xl mx-auto text-lg">
            Ajukan program Anda dan raih dukungan dari donatur di seluruh Indonesia.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/pengusul/register"
              className="inline-flex items-center justify-center px-6 py-3 bg-white hover:bg-gray-50 text-primary-700 rounded-lg font-semibold transition-colors"
            >
              Daftar Sebagai Pengusul
              <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center justify-center px-6 py-3 text-white rounded-lg font-medium border border-white/30 hover:bg-white/10 transition-colors"
            >
              Pelajari Lebih Lanjut
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-10">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">S</span>
                </div>
                <span className="text-xl font-bold">sesama</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
                Platform donasi terpercaya yang menghubungkan kebaikan Anda dengan mereka yang membutuhkan.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-sm mb-3">Program</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/programs" className="text-gray-400 hover:text-primary-400 transition-colors">Semua Program</Link></li>
                <li><Link href="/articles" className="text-gray-400 hover:text-primary-400 transition-colors">Laporan</Link></li>
                <li><Link href="/leaderboard" className="text-gray-400 hover:text-primary-400 transition-colors">Leaderboard</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-sm mb-3">Perusahaan</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="text-gray-400 hover:text-primary-400 transition-colors">Tentang Kami</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-primary-400 transition-colors">Hubungi Kami</Link></li>
                <li><Link href="/faq" className="text-gray-400 hover:text-primary-400 transition-colors">FAQ</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-sm mb-3">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/terms" className="text-gray-400 hover:text-primary-400 transition-colors">Syarat & Ketentuan</Link></li>
                <li><Link href="/privacy" className="text-gray-400 hover:text-primary-400 transition-colors">Kebijakan Privasi</Link></li>
                <li><Link href="/legal" className="text-gray-400 hover:text-primary-400 transition-colors">Informasi Legal</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
            <p className="text-gray-500 text-xs">&copy; 2026 sesama. Seluruh hak cipta dilindungi.</p>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Terdaftar & Diawasi
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
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
