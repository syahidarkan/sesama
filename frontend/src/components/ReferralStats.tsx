'use client';

import { useState, useEffect } from 'react';
import { referralApi } from '@/lib/api';
import { ReferralStats as ReferralStatsType } from '@/types/referral';
import { Users, Award, DollarSign, TrendingUp, Clock } from 'lucide-react';

export default function ReferralStats() {
  const [stats, setStats] = useState<ReferralStatsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await referralApi.getMyStats();
      setStats(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal memuat statistik');
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
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Memuat statistik...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Referrals */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-primary-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-primary-100 p-2 rounded-lg">
              <Users className="text-primary-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Referral</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalReferrals}
              </p>
            </div>
          </div>
        </div>

        {/* Total Points */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-yellow-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-yellow-100 p-2 rounded-lg">
              <Award className="text-yellow-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Poin</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalPoints.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Total Amount */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-green-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-green-100 p-2 rounded-lg">
              <DollarSign className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Donasi</p>
              <p className="text-lg font-bold text-gray-900">
                {formatCurrency(stats.totalAmount)}
              </p>
            </div>
          </div>
        </div>

        {/* Rank */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-purple-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-purple-100 p-2 rounded-lg">
              <TrendingUp className="text-purple-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Peringkat</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.rank ? `#${stats.rank}` : '-'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Referrals */}
      {stats.recentReferrals && stats.recentReferrals.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="bg-primary-50 px-6 py-4 border-b border-primary-100">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Clock size={20} className="text-primary-600" />
              Referral Terbaru
            </h3>
          </div>
          <div className="divide-y divide-gray-100">
            {stats.recentReferrals.map((referral) => (
              <div key={referral.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      {referral.donation?.donorName || 'Anonymous'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {referral.donation?.createdAt &&
                        formatDate(referral.donation.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary-600">
                      {formatCurrency(Number(referral.donation?.amount || 0))}
                    </p>
                    <p className="text-sm text-gray-600">
                      +{referral.pointsEarned} poin
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Referrals Yet */}
      {stats.totalReferrals === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <Users size={48} className="mx-auto mb-4 text-blue-400" />
          <h3 className="font-semibold text-blue-900 mb-2">
            Belum Ada Referral
          </h3>
          <p className="text-blue-800 text-sm">
            Mulai bagikan link referral Anda untuk mendapatkan poin setiap kali
            ada yang berdonasi melalui link Anda!
          </p>
        </div>
      )}
    </div>
  );
}
