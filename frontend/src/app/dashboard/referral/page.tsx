'use client';

import { useEffect, useState } from 'react';
import { referralApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import Link from 'next/link';
import { Link2, Copy, Users, TrendingUp, ArrowRight, Loader2, CheckCircle } from 'lucide-react';

export default function ReferralDashboardPage() {
  const user = useAuthStore((state) => state.user);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await referralApi.getMyStats();
      setStats(res.data);
    } catch (error) {
      console.error('Failed to fetch referral stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateCode = async () => {
    try {
      setGenerating(true);
      const res = await referralApi.generateCode();
      setStats((prev: any) => ({ ...prev, code: res.data.code }));
    } catch (error) {
      console.error('Failed to generate referral code:', error);
    } finally {
      setGenerating(false);
    }
  };

  const copyReferralLink = (programSlug?: string) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const link = programSlug
      ? `${baseUrl}/programs/${programSlug}?ref=${stats.code}`
      : `${baseUrl}?ref=${stats.code}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Referral Saya</h1>
        <p className="text-sm text-gray-600">
          Bagikan link referral Anda dan lihat dampak donasi dari orang yang Anda ajak
        </p>
      </div>

      {/* Referral Code Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Kode Referral</h2>
        {stats?.code ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 font-mono text-lg font-semibold text-gray-900">
                {stats.code}
              </div>
              <button
                onClick={() => copyReferralLink()}
                className="inline-flex items-center gap-2 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
              >
                {copied ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                {copied ? 'Disalin!' : 'Salin Link'}
              </button>
            </div>
            <p className="text-sm text-gray-500">
              Link referral Anda: <span className="font-mono text-gray-700">{typeof window !== 'undefined' ? window.location.origin : ''}?ref={stats.code}</span>
            </p>
          </div>
        ) : (
          <div className="text-center py-6">
            <Link2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 mb-4">Anda belum memiliki kode referral</p>
            <button
              onClick={generateCode}
              disabled={generating}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium disabled:opacity-50"
            >
              {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Link2 className="w-5 h-5" />}
              Generate Kode Referral
            </button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          <div className="text-sm text-gray-600 mb-1">Total Donasi dari Referral</div>
          <div className="text-2xl font-semibold text-gray-900">
            {formatCurrency(Number(stats?.totalDonations || 0))}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <Users className="w-5 h-5 text-gray-400" />
          </div>
          <div className="text-sm text-gray-600 mb-1">Total Donatur dari Referral</div>
          <div className="text-2xl font-semibold text-gray-900">
            {stats?.totalDonors || 0}
          </div>
        </div>
      </div>

      {/* Referral History */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Riwayat Donasi Referral</h2>
          <p className="text-sm text-gray-600 mt-0.5">Daftar donasi yang masuk melalui link referral Anda</p>
        </div>
        <div className="p-6">
          {stats?.donations && stats.donations.length > 0 ? (
            <div className="space-y-3">
              {stats.donations.map((d: any) => (
                <div key={d.id} className="p-4 rounded-md border border-gray-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{d.donorName}</div>
                      <div className="text-xs text-gray-500 mt-1">{d.programTitle}</div>
                      <div className="text-xs text-gray-400 mt-1">{formatDate(d.createdAt)}</div>
                    </div>
                    <div className="text-sm font-semibold text-primary-600">
                      {formatCurrency(Number(d.amount))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-gray-900 mb-1">Belum Ada Donasi Referral</h3>
              <p className="text-sm text-gray-600">Bagikan link referral Anda untuk mulai mengajak orang berdonasi</p>
            </div>
          )}
        </div>
      </div>

      {/* Link to public leaderboard */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Leaderboard Referral</h3>
            <p className="text-sm text-gray-600">Lihat peringkat referral dari semua pengguna</p>
          </div>
          <Link
            href="/leaderboard?tab=referral"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-600 transition-colors"
          >
            Lihat Leaderboard <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
