'use client';

import { useEffect, useState } from 'react';
import { programsApi } from '@/lib/api';
import { Program } from '@/types';
import Link from 'next/link';

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'ACTIVE' | 'CLOSED'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchPrograms();
  }, [filter]);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      // Public page should only show ACTIVE programs
      const status = filter === 'all' ? 'ACTIVE' : filter;
      const response = await programsApi.getAll(
        status,
        50,
        0
      );
      setPrograms(response.data?.data || []);
    } catch (error) {
      console.error('Error fetching programs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPrograms = programs.filter((program) =>
    program.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    program.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const calculateProgress = (collected: number, target: number) => {
    return Math.min((collected / target) * 100, 100);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const calculateDaysLeft = (endDate?: string) => {
    if (!endDate) return null;
    const diff = Math.ceil((new Date(endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  // Placeholder images for programs without images
  const getPlaceholderImage = (index: number) => {
    const images = [
      'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1594708767771-a7502f3a6c12?w=600&h=400&fit=crop',
    ];
    return images[index % images.length];
  };

  const totalCollected = programs.reduce((sum, p) => sum + (p.collectedAmount || 0), 0);
  const totalDonors = programs.reduce((sum, p) => sum + (p.donorCount || 0), 0);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="text-xl font-bold text-gray-900">SobatBantu</span>
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
      <section className="bg-primary-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.05)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.05)_50%,rgba(255,255,255,0.05)_75%,transparent_75%)] bg-[length:40px_40px] opacity-30" />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/15 text-white rounded-lg text-xs font-semibold tracking-wide uppercase border border-white/20 mb-6">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>Program Donasi</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight mb-4">
              Salurkan Kebaikan Anda
            </h1>
            <p className="text-lg text-primary-100 leading-relaxed max-w-2xl mb-8">
              Pilih program yang sesuai dengan hati Anda dan mulai berbagi kebaikan dan bantu yang membutuhkan.
            </p>

            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/20 max-w-lg">
              <div>
                <div className="text-2xl font-bold text-white">{programs.filter(p => p.status === 'ACTIVE').length}</div>
                <div className="text-sm text-primary-200 mt-0.5">Program Aktif</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{totalDonors.toLocaleString('id-ID')}</div>
                <div className="text-sm text-primary-200 mt-0.5">Total Donatur</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">100%</div>
                <div className="text-sm text-primary-200 mt-0.5">Transparan</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        {/* Search and Filter */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-8 sticky top-20 z-30 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Cari program donasi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 outline-none text-sm text-gray-900"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2">
              {[
                { key: 'all', label: 'Semua', count: programs.length },
                { key: 'ACTIVE', label: 'Aktif', count: programs.filter(p => p.status === 'ACTIVE').length },
                { key: 'CLOSED', label: 'Selesai', count: programs.filter(p => p.status === 'CLOSED').length },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key as any)}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    filter === f.key
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {f.label}
                  <span className={`ml-1.5 px-1.5 py-0.5 rounded text-xs ${
                    filter === f.key ? 'bg-white/20' : 'bg-gray-200'
                  }`}>
                    {f.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Programs Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-sm text-gray-600">Memuat program...</p>
          </div>
        ) : filteredPrograms.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Tidak ada program ditemukan</h3>
            <p className="text-sm text-gray-500 mb-6">Coba ubah filter atau kata kunci pencarian</p>
            <button
              onClick={() => { setFilter('all'); setSearchQuery(''); }}
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrograms.map((program, index) => {
              const progress = calculateProgress(program.collectedAmount || 0, program.targetAmount);
              const daysLeft = calculateDaysLeft(program.endDate);

              return (
                <Link
                  key={program.id}
                  href={`/programs/${program.slug}`}
                  className={`group bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-primary-300 hover:shadow-lg transition-all duration-200 animate-fadeInUp`}
                  style={{ animationDelay: `${0.05 * index}s` }}
                >
                  {/* Image */}
                  <div className="relative aspect-[16/10] bg-gray-100 overflow-hidden">
                    <img
                      src={program.imageUrl || getPlaceholderImage(index)}
                      alt={program.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Status Badge */}
                    <div className="absolute top-3 left-3">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                        program.status === 'ACTIVE'
                          ? 'bg-green-500 text-white'
                          : program.status === 'CLOSED'
                          ? 'bg-gray-500 text-white'
                          : 'bg-amber-500 text-white'
                      }`}>
                        {program.status === 'ACTIVE' ? 'Aktif' : program.status === 'CLOSED' ? 'Selesai' : 'Draft'}
                      </span>
                    </div>

                    {/* Category Badge */}
                    {program.category && (
                      <div className="absolute top-3 right-3">
                        <span className="px-2.5 py-1 bg-primary-600 text-white text-xs font-medium rounded-lg">
                          {program.category}
                        </span>
                      </div>
                    )}

                    {/* Days Left Badge */}
                    {daysLeft !== null && daysLeft > 0 && daysLeft <= 7 && (
                      <div className="absolute bottom-3 right-3">
                        <span className="px-2.5 py-1 bg-red-500 text-white text-xs font-medium rounded-lg">
                          {daysLeft} hari lagi
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5 space-y-4">
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 line-clamp-2 leading-snug group-hover:text-primary-600 transition-colors mb-2">
                        {program.title}
                      </h3>
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {program.description}
                      </p>
                    </div>

                    {/* Progress */}
                    <div>
                      <div className="flex items-baseline justify-between mb-1.5">
                        <span className="text-sm font-bold text-primary-600">
                          {mounted ? formatCurrency(program.collectedAmount || 0) : 'Rp 0'}
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
                        dari {mounted ? formatCurrency(program.targetAmount) : 'Rp 0'}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span>{program.donorCount ?? 0} donatur</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>
                          {daysLeft !== null ? (daysLeft > 0 ? `${daysLeft} hari lagi` : 'Berakhir') : 'Tanpa batas'}
                        </span>
                      </div>
                    </div>

                    {/* CTA */}
                    <button className="w-full py-2.5 bg-primary-50 text-primary-600 rounded-lg text-sm font-semibold group-hover:bg-primary-600 group-hover:text-white transition-colors">
                      {program.status === 'ACTIVE' ? 'Donasi Sekarang' : 'Lihat Detail'}
                    </button>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Load More / Info */}
        {filteredPrograms.length > 0 && (
          <div className="text-center mt-12">
            <p className="text-sm text-gray-500">
              Menampilkan {filteredPrograms.length} dari {programs.length} program
            </p>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <section className="bg-primary-700 py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Tidak menemukan program yang sesuai?
          </h2>
          <p className="text-primary-100 mb-8">
            Anda bisa mengajukan program donasi sendiri sebagai pengusul.
          </p>
          <Link
            href="/pengusul/register"
            className="inline-flex items-center px-6 py-3 bg-white text-primary-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            Daftar Sebagai Pengusul
            <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}
