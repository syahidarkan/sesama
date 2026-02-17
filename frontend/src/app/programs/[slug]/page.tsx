'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { programsApi, donationsApi, paymentsApi, articlesApi, referralApi, commentsApi } from '@/lib/api';
import CommentSection from '@/components/CommentSection';
import { Program, Donation, Article } from '@/types';
import { useAuthStore } from '@/store/auth';
import Link from 'next/link';

export default function ProgramDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAuthStore((state) => state.user);

  const [program, setProgram] = useState<Program | null>(null);
  const [recentDonations, setRecentDonations] = useState<Donation[]>([]);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'story' | 'updates' | 'donors' | 'comments'>('story');

  const [showDonationModal, setShowDonationModal] = useState(false);
  const [donationAmount, setDonationAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [donationLoading, setDonationLoading] = useState(false);
  const [donationError, setDonationError] = useState('');
  const [shareTooltip, setShareTooltip] = useState('');

  const [myReferralCode, setMyReferralCode] = useState<string | null>(null);
  const [generatingReferral, setGeneratingReferral] = useState(false);
  const [referralCopied, setReferralCopied] = useState(false);
  const referralCodeFromUrl = searchParams.get('ref');

  const presetAmounts = [50000, 100000, 250000, 500000, 1000000, 2000000];

  const getPlaceholderImage = () => {
    const images = [
      'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=1200&h=600&fit=crop',
      'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1200&h=600&fit=crop',
      'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=1200&h=600&fit=crop',
      'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1200&h=600&fit=crop',
    ];
    return images[Math.floor(Math.random() * images.length)];
  };

  useEffect(() => {
    if (params.slug) {
      fetchProgramData(params.slug as string);
    }
  }, [params.slug]);

  // Refetch data when user returns from payment (for updated donor count)
  useEffect(() => {
    const paymentStatus = searchParams.get('payment_status');
    if (paymentStatus === 'success' && params.slug) {
      // Wait a bit for backend to process webhook
      setTimeout(() => {
        fetchProgramData(params.slug as string);
      }, 1000);
    }
  }, [searchParams, params.slug]);

  const fetchProgramData = async (slug: string) => {
    try {
      // First get program data
      const programRes = await programsApi.getBySlug(slug);
      const programData = programRes.data;
      setProgram(programData);

      // Then fetch related data with programId filter
      const [donationsRes, articlesRes] = await Promise.all([
        donationsApi.getAll(programData.id, 50, 0), // Filter by programId
        articlesApi.getAll('PUBLISHED', undefined, undefined, 10, 0),
      ]);

      // Backend returns array directly (not wrapped in { data: [...] })
      const donations = Array.isArray(donationsRes.data) ? donationsRes.data : (donationsRes.data?.data || []);
      setRecentDonations(donations);

      // Filter articles for this program
      const allArticles = articlesRes.data?.data || [];
      const programArticles = allArticles.filter(
        (a: Article) => a.programId === programData.id
      );
      setRelatedArticles(programArticles);
    } catch (error) {
      console.error('Failed to fetch program:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDonationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDonationError('');

    const amount = donationAmount === 'custom' ? parseInt(customAmount) : parseInt(donationAmount);

    if (!amount || amount < 10000) {
      setDonationError('Minimal donasi Rp 10.000');
      return;
    }

    if (!isAnonymous && !donorName) {
      setDonationError('Nama donatur wajib diisi');
      return;
    }

    try {
      setDonationLoading(true);

      const response = await paymentsApi.create({
        programId: program!.id,
        amount: amount,
        donorName: isAnonymous ? 'Hamba Allah' : donorName,
        donorEmail: donorEmail || undefined,
        referralCode: referralCodeFromUrl || undefined,
      });

      window.location.href = response.data.paymentUrl;
    } catch (error: any) {
      setDonationError(
        error.response?.data?.message || 'Gagal membuat donasi. Silakan coba lagi.'
      );
    } finally {
      setDonationLoading(false);
    }
  };

  const generateMyReferralCode = async () => {
    try {
      setGeneratingReferral(true);
      const res = await referralApi.generateCode();
      setMyReferralCode(res.data.code);
    } catch (error) {
      console.error('Failed to generate referral code:', error);
    } finally {
      setGeneratingReferral(false);
    }
  };

  const copyMyReferralLink = () => {
    if (!myReferralCode || !program) return;
    const url = `${window.location.origin}/programs/${program.slug}?ref=${myReferralCode}`;
    navigator.clipboard.writeText(url);
    setReferralCopied(true);
    setTimeout(() => setReferralCopied(false), 2000);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const calculateProgress = () => {
    if (!program) return 0;
    return Math.min((program.collectedAmount / program.targetAmount) * 100, 100);
  };

  const calculateDaysLeft = () => {
    if (!program || !program.endDate) return 0;
    const end = new Date(program.endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Memuat program...</p>
        </div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Program Tidak Ditemukan
          </h2>
          <p className="text-gray-600 mb-6">
            Program yang Anda cari tidak tersedia atau telah dihapus
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  const progress = calculateProgress();
  const daysLeft = calculateDaysLeft();

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
              <span className="text-lg sm:text-xl font-bold text-gray-900">SobatBantu</span>
            </Link>
            <Link
              href="/"
              className="inline-flex items-center px-3 sm:px-5 py-2 sm:py-2.5 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-lg hover:border-gray-300 hover:shadow-md transition-all text-sm"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="hidden sm:inline">Kembali ke Beranda</span>
              <span className="sm:hidden">Kembali</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section with Image */}
      <section className="relative bg-primary-600 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.05)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.05)_50%,rgba(255,255,255,0.05)_75%,transparent_75%)] bg-[length:40px_40px] opacity-30" />
        <div className="absolute inset-0">
          <img
            src={program.imageUrl || getPlaceholderImage()}
            alt={program.title}
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary-600/90 via-primary-700/80 to-primary-900/90" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-20">
          <div className="max-w-4xl">
            {program.category && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/15 text-white rounded-lg text-xs font-semibold tracking-wide uppercase border border-white/20 mb-4 sm:mb-6">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <span>{program.category}</span>
              </div>
            )}
            <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-white leading-tight tracking-tight mb-4 sm:mb-6">
              {program.title}
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-white/90 text-sm">
              {program.institutionName && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center border border-white/20">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <span className="font-medium text-white">{program.institutionName}</span>
                </div>
              )}
              {program.beneficiaryName && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center border border-white/20">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <span className="font-medium text-white">{program.beneficiaryName}</span>
                </div>
              )}
              {program.creator && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center border border-white/20">
                    <span className="text-xs font-bold text-white">{program.creator.name.charAt(0)}</span>
                  </div>
                  <span className="font-medium text-white">oleh {program.creator.name}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Progress Stats Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-8 shadow-sm">
              <div className="grid grid-cols-3 gap-2 sm:gap-6 mb-6 sm:mb-8">
                <div className="text-center">
                  <div className="text-lg sm:text-3xl font-bold text-primary-600 mb-1">
                    {formatCurrency(program.collectedAmount).replace('Rp', '')}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">Terkumpul</div>
                </div>
                <div className="text-center border-x border-gray-200">
                  <div className="text-lg sm:text-3xl font-bold text-gray-900 mb-1">
                    {program.donorCount ?? 0}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">Donatur</div>
                </div>
                <div className="text-center">
                  <div className="text-lg sm:text-3xl font-bold text-gray-900 mb-1">
                    {program.endDate ? daysLeft : '∞'}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">{program.endDate ? 'Hari Lagi' : 'Tanpa Batas'}</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-gray-900">Progress Pencapaian</span>
                  <span className="font-bold text-primary-600">{progress.toFixed(1)}%</span>
                </div>
                <div className="relative w-full h-4 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-primary-600 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span className="font-medium">{formatCurrency(program.collectedAmount)}</span>
                  <span className="font-semibold">Target {formatCurrency(program.targetAmount)}</span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="border-b border-gray-200 overflow-x-auto">
                <div className="flex min-w-max">
                  <button
                    onClick={() => setActiveTab('story')}
                    className={`flex-1 min-w-20 px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-bold transition-all relative ${
                      activeTab === 'story'
                        ? 'text-primary-600 bg-primary-50/50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {activeTab === 'story' && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600" />
                    )}
                    <div className="flex items-center justify-center gap-1 sm:gap-2">
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      <span className="hidden sm:inline">Cerita Program</span>
                      <span className="sm:hidden">Cerita</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('updates')}
                    className={`flex-1 min-w-20 px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-bold transition-all relative ${
                      activeTab === 'updates'
                        ? 'text-primary-600 bg-primary-50/50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {activeTab === 'updates' && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600" />
                    )}
                    <div className="flex items-center justify-center gap-1 sm:gap-2">
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="hidden sm:inline">Laporan ({relatedArticles.length})</span>
                      <span className="sm:hidden">Laporan</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('donors')}
                    className={`flex-1 min-w-20 px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-bold transition-all relative ${
                      activeTab === 'donors'
                        ? 'text-primary-600 bg-primary-50/50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {activeTab === 'donors' && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600" />
                    )}
                    <div className="flex items-center justify-center gap-1 sm:gap-2">
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span className="hidden sm:inline">Donatur ({program.donorCount ?? 0})</span>
                      <span className="sm:hidden">Donatur</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('comments')}
                    className={`flex-1 min-w-20 px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-bold transition-all relative ${
                      activeTab === 'comments'
                        ? 'text-primary-600 bg-primary-50/50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {activeTab === 'comments' && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600" />
                    )}
                    <div className="flex items-center justify-center gap-1 sm:gap-2">
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span>Komentar</span>
                    </div>
                  </button>
                </div>
              </div>

              <div className="p-4 sm:p-8">
                {activeTab === 'story' && (
                  <div className="prose prose-lg max-w-none">
                    <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {program.description}
                    </div>
                  </div>
                )}

                {activeTab === 'updates' && (
                  <div className="space-y-3">
                    {relatedArticles.length > 0 ? (
                      relatedArticles.map((article) => (
                        <Link
                          key={article.id}
                          href={`/articles/${article.slug}`}
                          className="block group"
                        >
                          <div className="flex items-start space-x-4 p-5 rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all bg-white hover:bg-primary-50/30">
                            <div className="shrink-0 w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-50 rounded-xl flex items-center justify-center group-hover:from-primary-600 group-hover:to-primary-700 transition-all shadow-sm">
                              <svg className="w-6 h-6 text-primary-600 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors leading-snug">
                                {article.title}
                              </h3>
                              {article.excerpt && (
                                <p className="text-sm text-gray-600 mb-2 line-clamp-2 leading-relaxed">
                                  {article.excerpt}
                                </p>
                              )}
                              <p className="text-xs text-gray-500 flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {formatDate(article.publishedAt || article.createdAt)}
                              </p>
                            </div>
                            <svg className="shrink-0 w-5 h-5 text-gray-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <div className="text-center py-16">
                        <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-200 shadow-sm">
                          <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <h4 className="font-bold text-gray-900 text-lg mb-1">Belum Ada Laporan</h4>
                        <p className="text-sm text-gray-500">Laporan penyaluran akan segera hadir</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'donors' && (
                  <div className="space-y-3">
                    {recentDonations.length > 0 ? (
                      recentDonations.map((donation, index) => (
                        <div
                          key={donation.id}
                          className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-50/50 hover:from-primary-50 hover:to-primary-50/50 border border-gray-100 hover:border-primary-200 transition-all shadow-sm"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                              {donation.donorName.charAt(0)}
                            </div>
                            <div>
                              <div className="font-bold text-gray-900">
                                {donation.donorName}
                              </div>
                              <div className="text-xs text-gray-500">
                                {formatDate(donation.createdAt)}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-primary-600">
                              {formatCurrency(donation.amount)}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-16">
                        <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-200 shadow-sm">
                          <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <h4 className="font-bold text-gray-900 text-lg mb-1">Belum Ada Donatur</h4>
                        <p className="text-sm text-gray-500">Jadilah yang pertama berbagi kebaikan untuk program ini!</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'comments' && (
                  <CommentSection programId={program.id} />
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Donation Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 sticky top-20 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-br from-primary-600 to-primary-700 p-6 text-white">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center border border-white/30">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold">
                    Salurkan Kebaikan Anda
                  </h3>
                </div>
                <p className="text-sm text-primary-100">
                  100% donasi Anda tersalurkan langsung ke penerima manfaat
                </p>
              </div>

              <div className="p-6">
                {program.status === 'ACTIVE' ? (
                  <button
                    onClick={() => setShowDonationModal(true)}
                    className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold text-base transition-colors"
                  >
                    Donasi Sekarang
                  </button>
                ) : (
                  <div className="bg-gray-100 text-gray-600 py-4 rounded-lg text-center font-semibold">
                    {program.status === 'CLOSED' ? 'Program Telah Ditutup' : 'Program Tidak Aktif'}
                  </div>
                )}

                <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">Terverifikasi</div>
                      <div className="text-xs text-gray-600">Data program telah divalidasi</div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">Aman & Terpercaya</div>
                      <div className="text-xs text-gray-600">Pembayaran dilindungi enkripsi</div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">Pencairan Cepat</div>
                      <div className="text-xs text-gray-600">Dana tersalur dalam 24 jam</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Share Section */}
              <div className="mt-4 bg-white rounded-lg border border-gray-200 p-5">
                <h4 className="text-sm font-bold text-gray-900 mb-3">Bagikan Program Ini</h4>
                <div className="flex items-center gap-2">
                  {/* WhatsApp */}
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`Ayo bantu donasi untuk "${program.title}" di ${typeof window !== 'undefined' ? window.location.href : ''}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-semibold transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    WA
                  </a>
                  {/* Facebook */}
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    FB
                  </a>
                  {/* Twitter/X */}
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Ayo bantu donasi untuk "${program.title}"`)}&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-black hover:bg-gray-800 text-white rounded-lg text-xs font-semibold transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    X
                  </a>
                  {/* Copy Link */}
                  <button
                    onClick={() => {
                      const url = window.location.href;
                      if (navigator.share) {
                        navigator.share({ title: program.title, text: `Ayo bantu donasi untuk "${program.title}"`, url });
                      } else {
                        navigator.clipboard.writeText(url);
                        setShareTooltip('Link disalin!');
                        setTimeout(() => setShareTooltip(''), 2000);
                      }
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold transition-colors relative"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                    {shareTooltip || 'Link'}
                  </button>
                </div>
              </div>

              {/* Referral Link Section - Only for logged-in users */}
              {user && (
                <div className="mt-4 bg-primary-50 rounded-lg border border-primary-200 p-5">
                  <h4 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    Link Referral Saya
                  </h4>
                  <p className="text-xs text-gray-600 mb-3">
                    Bagikan link referral khusus untuk program ini dan dapatkan dampak dari setiap donasi
                  </p>
                  {myReferralCode ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={`${typeof window !== 'undefined' ? window.location.origin : ''}/programs/${program.slug}?ref=${myReferralCode}`}
                          className="flex-1 px-3 py-2 text-xs bg-white border border-gray-200 rounded-md font-mono text-gray-700"
                        />
                        <button
                          onClick={copyMyReferralLink}
                          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold rounded-md transition-colors"
                        >
                          {referralCopied ? '✓ Disalin!' : 'Salin'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={generateMyReferralCode}
                      disabled={generatingReferral}
                      className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
                    >
                      {generatingReferral ? 'Generating...' : 'Generate Link Referral'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Donation Modal */}
      {showDonationModal && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Fixed Header - stays on top */}
            <div className="bg-primary-600 px-6 py-5 rounded-t-lg flex-shrink-0 relative z-20 shadow-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Form Donasi</h3>
                <button
                  onClick={() => {
                    setShowDonationModal(false);
                    setDonationError('');
                  }}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                >
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-primary-50 mt-2">Pilih nominal dan lengkapi data Anda</p>
            </div>

            {/* Scrollable Form Content */}
            <div className="overflow-y-auto flex-1">
              <form onSubmit={handleDonationSubmit} className="p-8 space-y-6">
              {donationError && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-red-500 mt-0.5 mr-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-red-700 font-medium">{donationError}</p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">
                  Pilih Nominal Donasi
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {presetAmounts.map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => {
                        setDonationAmount(amount.toString());
                        setCustomAmount('');
                      }}
                      className={`px-4 py-4 border-2 rounded-lg font-bold text-sm transition-all ${
                        donationAmount === amount.toString()
                          ? 'border-primary-600 bg-primary-50 text-primary-700'
                          : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {formatCurrency(amount)}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setDonationAmount('custom')}
                  className={`w-full mt-3 px-4 py-4 border-2 rounded-lg font-bold text-sm transition-all ${
                    donationAmount === 'custom'
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Masukkan Nominal Lain
                </button>
              </div>

              {donationAmount === 'custom' && (
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Nominal Donasi (Min. Rp 10.000)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-600 font-semibold">
                      Rp
                    </span>
                    <input
                      type="number"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      placeholder="10000"
                      min="10000"
                      className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none text-gray-900 font-semibold"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label
                  htmlFor="anonymous"
                  className="ml-3 text-sm font-medium text-gray-900"
                >
                  Sembunyikan nama saya (Hamba Allah)
                </label>
              </div>

              {!isAnonymous && (
                <>
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      placeholder="Nama Anda"
                      className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none text-gray-900"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      Email (Opsional)
                    </label>
                    <input
                      type="email"
                      value={donorEmail}
                      onChange={(e) => setDonorEmail(e.target.value)}
                      placeholder="email@contoh.com"
                      className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none text-gray-900"
                    />
                    <p className="mt-2 text-xs text-gray-500">Untuk mendapatkan notifikasi donasi</p>
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={donationLoading || !donationAmount}
                className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {donationLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Memproses...
                  </span>
                ) : (
                  'Lanjut ke Pembayaran'
                )}
              </button>
            </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
