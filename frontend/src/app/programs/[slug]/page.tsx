'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { programsApi, donationsApi, paymentsApi, articlesApi } from '@/lib/api';
import { Program, Donation, Article } from '@/types';
import Link from 'next/link';

export default function ProgramDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [program, setProgram] = useState<Program | null>(null);
  const [recentDonations, setRecentDonations] = useState<Donation[]>([]);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'story' | 'updates' | 'donors'>('story');

  const [showDonationModal, setShowDonationModal] = useState(false);
  const [donationAmount, setDonationAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [donationLoading, setDonationLoading] = useState(false);
  const [donationError, setDonationError] = useState('');

  const presetAmounts = [50000, 100000, 250000, 500000, 1000000, 2000000];

  useEffect(() => {
    if (params.slug) {
      fetchProgramData(params.slug as string);
    }
  }, [params.slug]);

  const fetchProgramData = async (slug: string) => {
    try {
      const [programRes, donationsRes, articlesRes] = await Promise.all([
        programsApi.getBySlug(slug),
        donationsApi.getAll(undefined, 20, 0),
        articlesApi.getAll('PUBLISHED', undefined, undefined, 5, 0),
      ]);

      const programData = programRes.data;
      setProgram(programData);

      const allDonations = donationsRes.data?.data || [];
      const programDonations = allDonations.filter(
        (d: Donation) => d.programId === programData.id
      );
      setRecentDonations(programDonations.slice(0, 10));

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
    if (!program) return 0;
    const end = new Date(program.endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-600 mx-auto mb-4"></div>
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
            className="inline-flex items-center px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-semibold transition-colors"
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
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-40 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">sesama</span>
            </Link>

            <Link
              href="/"
              className="inline-flex items-center px-5 py-2.5 text-gray-700 hover:text-gray-900 font-medium transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Kembali
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section with Image */}
      <div className="relative bg-gray-900">
        {program.imageUrl ? (
          <>
            <div className="absolute inset-0">
              <img
                src={program.imageUrl}
                alt={program.title}
                className="w-full h-full object-cover opacity-40"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />
            </div>
            <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-32">
              <div className="max-w-4xl">
                <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-sm font-semibold text-white mb-6">
                  <span>{program.category}</span>
                </div>
                <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                  {program.title}
                </h1>
                <div className="flex flex-wrap items-center gap-6 text-white/90">
                  {program.institutionName && (
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span className="font-medium">{program.institutionName}</span>
                    </div>
                  )}
                  {program.beneficiaryName && (
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="font-medium">{program.beneficiaryName}</span>
                    </div>
                  )}
                  {program.creator && (
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-2">
                        <span className="text-xs font-bold">{program.creator.name.charAt(0)}</span>
                      </div>
                      <span className="font-medium">oleh {program.creator.name}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold mb-6">
              <span>{program.category}</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight max-w-4xl">
              {program.title}
            </h1>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Progress Stats Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-8 border border-gray-200">
              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-1">
                    {formatCurrency(program.collectedAmount).replace('Rp', '')}
                  </div>
                  <div className="text-sm text-gray-600">Terkumpul</div>
                </div>
                <div className="text-center border-x border-gray-200">
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {program.donorCount}
                  </div>
                  <div className="text-sm text-gray-600">Donatur</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {daysLeft}
                  </div>
                  <div className="text-sm text-gray-600">Hari Lagi</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-gray-900">Progress Pencapaian</span>
                  <span className="font-bold text-orange-600">{progress.toFixed(1)}%</span>
                </div>
                <div className="relative w-full h-4 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-orange-600 rounded-full transition-all duration-1000 ease-out border border-gray-200"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Rp 0</span>
                  <span className="font-semibold">Target {formatCurrency(program.targetAmount)}</span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg border border-gray-200 border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-200 bg-gray-50">
                <div className="flex">
                  <button
                    onClick={() => setActiveTab('story')}
                    className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors ${
                      activeTab === 'story'
                        ? 'text-orange-600 border-b-2 border-orange-600 bg-white'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Cerita Program
                  </button>
                  <button
                    onClick={() => setActiveTab('updates')}
                    className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors ${
                      activeTab === 'updates'
                        ? 'text-orange-600 border-b-2 border-orange-600 bg-white'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Laporan ({relatedArticles.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('donors')}
                    className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors ${
                      activeTab === 'donors'
                        ? 'text-orange-600 border-b-2 border-orange-600 bg-white'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Donatur ({recentDonations.length})
                  </button>
                </div>
              </div>

              <div className="p-8">
                {activeTab === 'story' && (
                  <div className="prose prose-lg max-w-none">
                    <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {program.description}
                    </div>
                  </div>
                )}

                {activeTab === 'updates' && (
                  <div className="space-y-4">
                    {relatedArticles.length > 0 ? (
                      relatedArticles.map((article) => (
                        <Link
                          key={article.id}
                          href={`/articles/${article.slug}`}
                          className="block group"
                        >
                          <div className="flex items-start space-x-4 p-5 rounded-xl border border-gray-200 hover:border-orange-300 hover:bg-orange-50/50 transition-all">
                            <div className="shrink-0 w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                              <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-gray-900 mb-1 group-hover:text-orange-600 transition-colors">
                                {article.title}
                              </h3>
                              {article.excerpt && (
                                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                  {article.excerpt}
                                </p>
                              )}
                              <p className="text-xs text-gray-500">
                                {formatDate(article.publishedAt || article.createdAt)}
                              </p>
                            </div>
                            <svg className="shrink-0 w-5 h-5 text-gray-400 group-hover:text-orange-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <p className="text-gray-600">Belum ada laporan penyaluran</p>
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
                          className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold border border-gray-200">
                              {donation.donorName.charAt(0)}
                            </div>
                            <div>
                              <div className="font-bold text-gray-900">
                                {donation.donorName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {formatDate(donation.createdAt)}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-orange-600">
                              {formatCurrency(donation.amount)}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <p className="text-gray-600">Belum ada donatur</p>
                        <p className="text-sm text-gray-500 mt-1">Jadilah yang pertama berdonasi!</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Donation Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border-2 border-orange-200 border border-gray-200 sticky top-28">
              <div className="p-6 bg-gradient-to-br from-orange-50 to-white border-b-2 border-orange-100">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Salurkan Kebaikan Anda
                </h3>
                <p className="text-sm text-gray-600">
                  Setiap rupiah Anda akan tersalurkan 100% ke penerima manfaat
                </p>
              </div>

              <div className="p-6">
                {program.status === 'ACTIVE' ? (
                  <button
                    onClick={() => setShowDonationModal(true)}
                    className="w-full py-4 bg-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-bold text-lg border border-gray-200 shadow-orange-500/30 hover:border border-gray-200 hover:shadow-orange-500/40 transition-all duration-300 transform hover:-translate-y-0.5"
                  >
                    Donasi Sekarang
                  </button>
                ) : (
                  <div className="bg-gray-100 text-gray-600 py-4 rounded-xl text-center font-semibold">
                    {program.status === 'CLOSED' ? 'Program Telah Ditutup' : 'Program Tidak Aktif'}
                  </div>
                )}

                <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="shrink-0 w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
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
                    <div className="shrink-0 w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
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
                    <div className="shrink-0 w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
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
            </div>
          </div>
        </div>
      </div>

      {/* Donation Modal */}
      {showDonationModal && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-lg border border-gray-200 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-orange-600 px-8 py-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-white">Form Donasi</h3>
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
              <p className="text-orange-50 mt-2">Pilih nominal dan lengkapi data Anda</p>
            </div>

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
                      className={`px-4 py-4 border-2 rounded-xl font-bold text-sm transition-all ${
                        donationAmount === amount.toString()
                          ? 'border-orange-600 bg-orange-50 text-orange-700 border border-gray-200 shadow-orange-500/20'
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
                  className={`w-full mt-3 px-4 py-4 border-2 rounded-xl font-bold text-sm transition-all ${
                    donationAmount === 'custom'
                      ? 'border-orange-600 bg-orange-50 text-orange-700 border border-gray-200 shadow-orange-500/20'
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
                      className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all outline-none text-gray-900 font-semibold"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
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
                      className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all outline-none text-gray-900"
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
                      className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all outline-none text-gray-900"
                    />
                    <p className="mt-2 text-xs text-gray-500">Untuk mendapatkan notifikasi donasi</p>
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={donationLoading || !donationAmount}
                className="w-full py-4 bg-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-bold text-lg border border-gray-200 shadow-orange-500/30 hover:border border-gray-200 hover:shadow-orange-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
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
      )}
    </div>
  );
}
