'use client';

import { useEffect, useState } from 'react';
import { gamificationApi } from '@/lib/api';
import { LeaderboardEntry, TitleInfo } from '@/types';
import Link from 'next/link';

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [titles, setTitles] = useState<TitleInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [leaderboardRes, titlesRes] = await Promise.all([
        gamificationApi.getLeaderboard(50),
        gamificationApi.getTitles(),
      ]);
      setLeaderboard(leaderboardRes.data.data);
      setTitles(titlesRes.data);
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

  const getTitleIcon = (title: string) => {
    const titleInfo = titles.find((t) => t.title === title);
    return titleInfo?.icon || '🌱';
  };

  const totalDonations = leaderboard.reduce((sum, entry) => sum + Number(entry.totalDonations), 0);
  const totalDonors = leaderboard.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-500 rounded-full mb-4 border border-gray-200 shadow-teal-500/30 animate-spin">
            <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full"></div>
          </div>
          <p className="text-gray-600 font-medium">Memuat leaderboard...</p>
        </div>
      </div>
    );
  }

  const topThree = leaderboard.slice(0, 3);
  const remaining = leaderboard.slice(3);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-gray-200/80 backdrop-blur-sm bg-white/95 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-11 h-11 bg-teal-500 rounded-xl flex items-center justify-center border border-gray-200 shadow-teal-500/30 transform group-hover:scale-105 transition-transform">
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
              className="inline-flex items-center px-5 py-2.5 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-gray-300 hover:shadow-md transition-all transform hover:-translate-y-0.5"
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
      <div className="relative bg-teal-500 overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)]"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-20 text-center">
          <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-5 py-2.5 rounded-full mb-6 border border-white/30">
            <svg className="w-5 h-5 text-orange-100" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-white font-bold text-sm tracking-wide">Leaderboard Donatur</span>
          </div>
          <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Para Pahlawan<br />
            <span className="text-orange-100">Kemanusiaan</span>
          </h1>
          <p className="text-xl text-orange-50 max-w-2xl mx-auto leading-relaxed">
            Terima kasih kepada para donatur luar biasa yang telah memberikan harapan bagi sesama. Setiap kontribusi Anda menciptakan perubahan nyata.
          </p>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <div className="text-4xl font-bold text-white mb-2">
                {totalDonors}+
              </div>
              <div className="text-orange-100 font-medium">Donatur Aktif</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <div className="text-4xl font-bold text-white mb-2">
                {formatAmount(totalDonations).replace('Rp', 'Rp ')}
              </div>
              <div className="text-orange-100 font-medium">Total Donasi Terkumpul</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <div className="text-4xl font-bold text-white mb-2">
                100%
              </div>
              <div className="text-orange-100 font-medium">Transparan & Terverifikasi</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Podium - Top 3 */}
        {topThree.length > 0 && (
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Podium Donatur Teratas</h2>
              <p className="text-lg text-gray-600">Penghargaan untuk kontribusi luar biasa</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-end">
              {/* Rank 2 - Silver */}
              {topThree[1] && (
                <div className="relative">
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-16 h-16 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center border border-gray-200 shadow-gray-400/40 border-4 border-white z-10">
                    <span className="text-2xl">🥈</span>
                  </div>
                  <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg p-8 pt-12 border-2 border-gray-300 border border-gray-200 transform hover:-translate-y-2 transition-all duration-300">
                    <div className="text-center">
                      <div className="text-5xl font-bold text-gray-700 mb-1">#2</div>
                      <div className="h-16 flex items-center justify-center mb-4">
                        <h3 className="text-xl font-bold text-gray-900 line-clamp-2">{topThree[1].donorName}</h3>
                      </div>
                      <div className="flex items-center justify-center space-x-2 mb-4">
                        <span className="text-2xl">{getTitleIcon(topThree[1].title)}</span>
                        <span className="font-bold text-lg" style={{ color: getTitleColor(topThree[1].title) }}>
                          {topThree[1].title}
                        </span>
                      </div>
                      <div className="bg-white rounded-xl p-4 border border-gray-200 mb-3">
                        <div className="text-sm text-gray-600 mb-1">Total Donasi</div>
                        <div className="text-2xl font-bold bg-gradient-to-r from-gray-600 to-gray-700 bg-clip-text text-transparent">
                          {formatAmount(Number(topThree[1].totalDonations))}
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-semibold">{topThree[1].donationCount}</span> transaksi
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Rank 1 - Gold */}
              {topThree[0] && (
                <div className="relative md:-mt-8">
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-20 h-20 bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-500 rounded-full flex items-center justify-center border border-gray-200 shadow-yellow-500/50 border-4 border-white z-10 animate-pulse">
                    <span className="text-3xl">👑</span>
                  </div>
                  <div className="bg-gradient-to-br from-yellow-50 via-orange-50 to-yellow-100 rounded-lg p-10 pt-14 border-4 border-yellow-400 border border-gray-200 shadow-yellow-500/30 transform hover:-translate-y-2 transition-all duration-300">
                    <div className="text-center">
                      <div className="text-6xl font-bold bg-gradient-to-r from-yellow-600 to-cyan-500 bg-clip-text text-transparent mb-1">#1</div>
                      <div className="h-16 flex items-center justify-center mb-4">
                        <h3 className="text-2xl font-bold text-gray-900 line-clamp-2">{topThree[0].donorName}</h3>
                      </div>
                      <div className="flex items-center justify-center space-x-2 mb-4">
                        <span className="text-3xl">{getTitleIcon(topThree[0].title)}</span>
                        <span className="font-bold text-xl" style={{ color: getTitleColor(topThree[0].title) }}>
                          {topThree[0].title}
                        </span>
                      </div>
                      <div className="bg-white rounded-lg p-6 border border-gray-200 mb-4">
                        <div className="text-sm text-gray-600 mb-2">Total Donasi</div>
                        <div className="text-3xl font-bold bg-teal-500 bg-clip-text text-transparent">
                          {formatAmount(Number(topThree[0].totalDonations))}
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-semibold">{topThree[0].donationCount}</span> transaksi
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Rank 3 - Bronze */}
              {topThree[2] && (
                <div className="relative">
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-16 h-16 bg-gradient-to-br from-teal-300 to-cyan-400 rounded-full flex items-center justify-center border border-gray-200 shadow-teal-400/40 border-4 border-white z-10">
                    <span className="text-2xl">🥉</span>
                  </div>
                  <div className="bg-gradient-to-br from-teal-100 to-cyan-200 rounded-lg p-8 pt-12 border-2 border-teal-300 border border-gray-200 transform hover:-translate-y-2 transition-all duration-300">
                    <div className="text-center">
                      <div className="text-5xl font-bold text-teal-700 mb-1">#3</div>
                      <div className="h-16 flex items-center justify-center mb-4">
                        <h3 className="text-xl font-bold text-gray-900 line-clamp-2">{topThree[2].donorName}</h3>
                      </div>
                      <div className="flex items-center justify-center space-x-2 mb-4">
                        <span className="text-2xl">{getTitleIcon(topThree[2].title)}</span>
                        <span className="font-bold text-lg" style={{ color: getTitleColor(topThree[2].title) }}>
                          {topThree[2].title}
                        </span>
                      </div>
                      <div className="bg-white rounded-xl p-4 border border-gray-200 mb-3">
                        <div className="text-sm text-gray-600 mb-1">Total Donasi</div>
                        <div className="text-2xl font-bold bg-teal-500 bg-clip-text text-transparent">
                          {formatAmount(Number(topThree[2].totalDonations))}
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-semibold">{topThree[2].donationCount}</span> transaksi
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Title Tiers */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Tingkat Donatur</h2>
            <p className="text-lg text-gray-600">Raih gelar sesuai total kontribusi Anda</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {titles.map((title, index) => (
              <div
                key={title.title}
                className="relative bg-white rounded-lg p-6 border-2 border border-gray-200 hover:border border-gray-200 transform hover:-translate-y-1 transition-all duration-300"
                style={{ borderColor: title.color }}
              >
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white border border-gray-200"
                  style={{ backgroundColor: title.color }}>
                  {index + 1}
                </div>
                <div className="text-center">
                  <div className="text-5xl mb-3">{title.icon}</div>
                  <div className="font-bold text-lg mb-2" style={{ color: title.color }}>
                    {title.title}
                  </div>
                  <div className="text-xs text-gray-600 leading-relaxed">
                    {title.maxAmount
                      ? `${formatAmount(title.minAmount)} - ${formatAmount(title.maxAmount)}`
                      : `> ${formatAmount(title.minAmount)}`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Remaining Rankings */}
        {remaining.length > 0 && (
          <div>
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Donatur Lainnya</h2>
              <p className="text-lg text-gray-600">Setiap kontribusi sangat berarti</p>
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              {remaining.map((entry, index) => {
                const rank = index + 4;
                return (
                  <div
                    key={entry.id}
                    className="bg-white rounded-lg p-6 border-2 border-gray-100 shadow-md hover:border border-gray-200 hover:border-teal-200 transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="w-14 h-14 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center border-2 border-gray-200 shrink-0">
                          <span className="text-xl font-bold text-gray-700">#{rank}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg text-gray-900 mb-1 truncate">{entry.donorName}</h3>
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{getTitleIcon(entry.title)}</span>
                            <span className="font-semibold text-sm" style={{ color: getTitleColor(entry.title) }}>
                              {entry.title}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        <div className="text-xl font-bold text-teal-600 mb-1">
                          {formatAmount(Number(entry.totalDonations))}
                        </div>
                        <div className="text-sm text-gray-500">
                          {entry.donationCount} transaksi
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {leaderboard.length === 0 && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Belum Ada Data Leaderboard</h3>
            <p className="text-gray-600 mb-6">Jadilah yang pertama untuk masuk ke leaderboard</p>
            <Link
              href="/"
              className="inline-flex items-center px-8 py-4 bg-teal-500 text-white font-bold rounded-xl border border-gray-200 shadow-teal-500/30 hover:border border-gray-200 hover:shadow-teal-500/40 transform hover:-translate-y-0.5 transition-all"
            >
              Mulai Berdonasi
            </Link>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-20 relative bg-teal-500 rounded-lg overflow-hidden border border-gray-200">
          <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)]"></div>
          <div className="relative px-8 py-16 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-lg mb-6 border border-white/30">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">
              Bergabunglah dengan Para Pahlawan
            </h2>
            <p className="text-xl text-orange-50 mb-8 max-w-2xl mx-auto leading-relaxed">
              Mulai berdonasi sekarang dan raih gelar tertinggi sambil membantu sesama yang membutuhkan
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-10 py-5 bg-white text-teal-600 font-bold text-lg rounded-xl border border-gray-200 hover:border border-gray-200 transform hover:-translate-y-1 hover:scale-105 transition-all"
            >
              <svg className="w-6 h-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              Lihat Program Donasi
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-1">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-11 h-11 bg-teal-500 rounded-xl flex items-center justify-center border border-gray-200">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <span className="text-2xl font-bold text-white">sesama</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Platform donasi terpercaya untuk membantu sesama yang membutuhkan
              </p>
            </div>

            <div>
              <h3 className="font-bold text-white text-lg mb-4">Program</h3>
              <ul className="space-y-3">
                <li><Link href="/" className="hover:text-orange-400 transition-colors">Donasi Aktif</Link></li>
                <li><Link href="/programs" className="hover:text-orange-400 transition-colors">Semua Program</Link></li>
                <li><Link href="/leaderboard" className="hover:text-orange-400 transition-colors">Leaderboard</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-white text-lg mb-4">Tentang</h3>
              <ul className="space-y-3">
                <li><Link href="/about" className="hover:text-orange-400 transition-colors">Tentang Kami</Link></li>
                <li><Link href="/contact" className="hover:text-orange-400 transition-colors">Kontak</Link></li>
                <li><Link href="/faq" className="hover:text-orange-400 transition-colors">FAQ</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-white text-lg mb-4">Legal</h3>
              <ul className="space-y-3">
                <li><Link href="/privacy" className="hover:text-orange-400 transition-colors">Kebijakan Privasi</Link></li>
                <li><Link href="/terms" className="hover:text-orange-400 transition-colors">Syarat & Ketentuan</Link></li>
                <li><Link href="/legal" className="hover:text-orange-400 transition-colors">Informasi Legal</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between">
            <p className="text-gray-500 text-sm mb-4 md:mb-0">
              © 2024 sesama. Semua hak dilindungi undang-undang.
            </p>
            <div className="flex items-center space-x-6">
              <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
