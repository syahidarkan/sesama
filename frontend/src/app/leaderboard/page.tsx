'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { gamificationApi, referralApi } from '@/lib/api';
import { LeaderboardEntry, TitleInfo } from '@/types';
import Link from 'next/link';

function LeaderboardContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'donatur' | 'referral'>(
    searchParams.get('tab') === 'referral' ? 'referral' : 'donatur'
  );
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [referralLeaderboard, setReferralLeaderboard] = useState<any[]>([]);
  const [titles, setTitles] = useState<TitleInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [leaderboardRes, titlesRes, referralRes] = await Promise.all([
        gamificationApi.getLeaderboard(50),
        gamificationApi.getTitles(),
        referralApi.getLeaderboard(50),
      ]);
      setLeaderboard(leaderboardRes.data.data);
      setTitles(titlesRes.data);
      setReferralLeaderboard(referralRes.data.data || []);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getTitleColor = (title: string) => {
    const titleInfo = titles.find((t) => t.title === title);
    return titleInfo?.color || '#6b7280';
  };

  const totalDonations = leaderboard.reduce((sum, entry) => sum + Number(entry.totalDonations), 0);
  const totalDonors = leaderboard.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">Memuat leaderboard...</p>
        </div>
      </div>
    );
  }

  const topThree = leaderboard.slice(0, 3);
  const remaining = leaderboard.slice(3);

  const rankStyles = [
    { bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-700', label: '1st' },
    { bg: 'bg-gray-50', border: 'border-gray-300', text: 'text-gray-600', label: '2nd' },
    { bg: 'bg-orange-50', border: 'border-orange-300', text: 'text-orange-700', label: '3rd' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-gray-200/80 bg-white/95 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-11 h-11 bg-primary-600 rounded-lg flex items-center justify-center border border-gray-200 shadow-md transform group-hover:scale-105 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                sesama
              </span>
            </Link>
            <Link
              href="/"
              className="inline-flex items-center px-5 py-2.5 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-lg hover:border-gray-300 hover:shadow-md transition-all"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative bg-primary-600 overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)]"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center space-x-2 bg-white/20 px-5 py-2.5 rounded-full mb-6 border border-white/30">
              <svg className="w-5 h-5 text-primary-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              <span className="text-white font-bold text-sm tracking-wide">Penghargaan Donatur</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Leaderboard
            </h1>
            <p className="text-xl text-primary-50 leading-relaxed mb-8">
              Penghargaan untuk para donatur yang telah berkontribusi membantu sesama. Setiap kebaikan Anda tercatat dan dihargai.
            </p>
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center border border-white/30">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{totalDonors}+</div>
                  <div className="text-sm text-primary-100">Donatur Aktif</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center border border-white/30">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">100%</div>
                  <div className="text-sm text-primary-100">Transparan & Akuntabel</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Tab Switcher */}
        <div className="flex gap-1 mb-10 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('donatur')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === 'donatur'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Donatur
          </button>
          <button
            onClick={() => setActiveTab('referral')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === 'referral'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Referral
          </button>
        </div>

        {activeTab === 'referral' ? (
          <div>
            {referralLeaderboard.length > 0 ? (
              <div className="space-y-2">
                {referralLeaderboard.map((entry: any, index: number) => {
                  const rank = index + 1;
                  return (
                    <Link
                      key={entry.id}
                      href={`/leaderboard/referral/${entry.code}`}
                      className="block"
                    >
                      <div className={`flex items-center gap-4 px-4 py-3 rounded-lg border transition-colors hover:bg-gray-50 ${
                        rank <= 3 ? 'border-gray-200 bg-gray-50' : 'border-gray-100'
                      }`}>
                        <div className={`w-8 h-8 rounded flex items-center justify-center text-sm font-bold shrink-0 ${
                          rank === 1 ? 'bg-amber-100 text-amber-700'
                          : rank === 2 ? 'bg-gray-100 text-gray-600'
                          : rank === 3 ? 'bg-orange-100 text-orange-700'
                          : 'bg-gray-50 text-gray-500'
                        }`}>
                          {rank}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">{entry.userName}</div>
                          <div className="text-xs text-gray-500">{entry.totalDonors} donatur diajak</div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="font-semibold text-gray-900">
                            {formatAmount(Number(entry.totalDonations))}
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Belum ada data referral</h3>
                <p className="text-sm text-gray-500">Jadilah yang pertama mengajak orang berdonasi</p>
              </div>
            )}
          </div>
        ) : (
        <>
          {/* Top 3 */}
          {topThree.length > 0 && (
            <div className="grid md:grid-cols-3 gap-4 mb-12">
              {topThree.map((entry, index) => {
                const style = rankStyles[index];
                return (
                  <div
                    key={entry.id}
                    className={`${style.bg} border ${style.border} rounded-lg p-6 ${index === 0 ? 'md:col-start-1 md:col-end-2 md:row-start-1' : ''}`}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-10 h-10 rounded flex items-center justify-center font-bold text-lg ${style.bg} ${style.text} border ${style.border}`}>
                        {index + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900 truncate">{entry.donorName}</h3>
                        <span className="text-xs font-medium" style={{ color: getTitleColor(entry.title) }}>
                          {entry.title}
                        </span>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-gray-200">
                      <div className="text-xl font-bold text-gray-900 mb-0.5">
                        {formatAmount(Number(entry.totalDonations))}
                      </div>
                      <div className="text-xs text-gray-500">{entry.donationCount} transaksi</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Title Tiers */}
          {titles.length > 0 && (
            <div className="mb-12">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Tingkat Donatur</h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {titles.map((title, index) => (
                  <div
                    key={title.title}
                    className="bg-white rounded-lg p-4 border border-gray-200"
                  >
                    <div className="text-xs font-bold text-gray-400 mb-1">Tier {index + 1}</div>
                    <div className="font-semibold text-sm mb-1" style={{ color: title.color }}>
                      {title.title}
                    </div>
                    <div className="text-xs text-gray-500">
                      {title.maxAmount
                        ? `${formatAmount(title.minAmount)} - ${formatAmount(title.maxAmount)}`
                        : `> ${formatAmount(title.minAmount)}`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Remaining Rankings */}
          {remaining.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Semua Donatur</h2>
              <div className="space-y-2">
                {remaining.map((entry, index) => {
                  const rank = index + 4;
                  return (
                    <div
                      key={entry.id}
                      className="flex items-center gap-4 px-4 py-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-8 h-8 rounded bg-gray-50 flex items-center justify-center text-sm font-medium text-gray-500 shrink-0">
                        {rank}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">{entry.donorName}</div>
                        <span className="text-xs font-medium" style={{ color: getTitleColor(entry.title) }}>
                          {entry.title}
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-semibold text-gray-900">
                          {formatAmount(Number(entry.totalDonations))}
                        </div>
                        <div className="text-xs text-gray-500">{entry.donationCount} transaksi</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {leaderboard.length === 0 && (
            <div className="text-center py-16">
              <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Belum ada data</h3>
              <p className="text-sm text-gray-500 mb-6">Jadilah yang pertama masuk ke leaderboard</p>
              <Link
                href="/"
                className="inline-flex items-center px-5 py-2.5 bg-primary-600 text-white font-medium text-sm rounded hover:bg-primary-700 transition-colors"
              >
                Mulai Berdonasi
              </Link>
            </div>
          )}

          {/* CTA */}
          <div className="mt-16 bg-primary-600 rounded-lg p-8 text-center">
            <h2 className="text-xl font-bold text-white mb-2">
              Bergabung dengan para donatur
            </h2>
            <p className="text-primary-100 text-sm mb-6 max-w-lg mx-auto">
              Mulai berdonasi sekarang dan raih gelar tertinggi sambil membantu sesama yang membutuhkan
            </p>
            <Link
              href="/programs"
              className="inline-flex items-center px-5 py-2.5 bg-white text-primary-700 font-medium text-sm rounded hover:bg-primary-50 transition-colors"
            >
              Lihat Program Donasi
              <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-500">
              &copy; 2024 sesama. Semua hak dilindungi.
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <Link href="/privacy" className="hover:text-gray-700">Privasi</Link>
              <Link href="/terms" className="hover:text-gray-700">Ketentuan</Link>
              <Link href="/contact" className="hover:text-gray-700">Kontak</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function LeaderboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">Memuat leaderboard...</p>
        </div>
      </div>
    }>
      <LeaderboardContent />
    </Suspense>
  );
}
