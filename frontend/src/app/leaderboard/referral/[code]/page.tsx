'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { referralApi } from '@/lib/api';
import Link from 'next/link';

export default function ReferralDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (params.code) {
      fetchDetail(params.code as string);
    }
  }, [params.code]);

  const fetchDetail = async (code: string) => {
    try {
      const res = await referralApi.getDetail(code, 100, 0);
      setData(res.data);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to load referral detail');
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Memuat detail referral...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Data Tidak Ditemukan</h2>
          <p className="text-gray-600 mb-6">{error || 'Kode referral tidak valid'}</p>
          <Link
            href="/leaderboard?tab=referral"
            className="inline-flex items-center px-6 py-3 bg-primary-600 hover:bg-primary-600 text-white rounded-lg font-semibold transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Kembali ke Leaderboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-40 bg-white/95">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">SobatBantu</span>
            </Link>

            <Link
              href="/leaderboard?tab=referral"
              className="inline-flex items-center px-5 py-2.5 text-gray-700 hover:text-gray-900 font-medium transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Kembali ke Leaderboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-primary-600 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center text-white">
            <div className="inline-flex items-center space-x-2 bg-white/20 px-5 py-2.5 rounded-full mb-6 border border-white/30">
              <svg className="w-5 h-5 text-primary-100" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <span className="text-white font-bold text-sm tracking-wide">Detail Referral</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">{data.referrer}</h1>
            <p className="text-xl text-primary-50 mb-8">Kode: {data.code}</p>

            {/* Stats */}
            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <div className="bg-white/10 rounded-lg p-6 border border-white/20">
                <div className="text-3xl font-bold text-white mb-2">
                  {formatCurrency(Number(data.totalDonations))}
                </div>
                <div className="text-primary-100 font-medium">Total Dampak Donasi</div>
              </div>
              <div className="bg-white/10 rounded-lg p-6 border border-white/20">
                <div className="text-3xl font-bold text-white mb-2">
                  {data.totalDonors}+
                </div>
                <div className="text-primary-100 font-medium">Donatur Diajak</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Donors List */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
            <h2 className="text-xl font-bold text-gray-900">
              Daftar Donatur ({data.donations.total})
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Semua donatur yang berdonasi melalui link referral ini
            </p>
          </div>

          {data.donations.data.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {data.donations.data.map((donation: any, index: number) => (
                <div key={donation.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{donation.donorName}</h3>
                          {donation.donorEmail && (
                            <p className="text-xs text-gray-500">{donation.donorEmail}</p>
                          )}
                        </div>
                      </div>
                      <div className="ml-13">
                        <p className="text-sm text-gray-600 mb-1">{donation.programTitle}</p>
                        <p className="text-xs text-gray-400">{formatDate(donation.createdAt)}</p>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-lg font-bold text-primary-600">
                        {formatCurrency(Number(donation.amount))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="text-gray-600">Belum ada donatur dari referral ini</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
