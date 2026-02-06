'use client';

import { useState, useEffect } from 'react';
import { referralApi } from '@/lib/api';
import { ReferralLeaderboard as ReferralLeaderboardType } from '@/types/referral';
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react';

export default function ReferralLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<ReferralLeaderboardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await referralApi.getLeaderboard(10, 0);
      setLeaderboard(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal memuat leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="text-yellow-500" size={24} />;
      case 2:
        return <Medal className="text-gray-400" size={24} />;
      case 3:
        return <Medal className="text-orange-400" size={24} />;
      default:
        return <Award className="text-primary-500" size={20} />;
    }
  };

  const getRankBadgeStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 2:
        return 'bg-gray-50 text-gray-700 border-gray-200';
      case 3:
        return 'bg-orange-50 text-orange-700 border-orange-200';
      default:
        return 'bg-primary-50 text-primary-700 border-primary-200';
    }
  };

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(Number(amount));
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Memuat leaderboard...</p>
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

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-700 to-primary-500 p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp size={28} />
          <h2 className="text-2xl font-bold">Leaderboard Referral</h2>
        </div>
        <p className="text-primary-100">
          Top 10 pengguna dengan referral terbanyak
        </p>
      </div>

      {/* Leaderboard List */}
      <div className="divide-y divide-gray-100">
        {leaderboard.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Award size={48} className="mx-auto mb-4 text-gray-300" />
            <p>Belum ada data leaderboard referral</p>
            <p className="text-sm mt-2">
              Jadilah yang pertama untuk mulai mereferensikan program!
            </p>
          </div>
        ) : (
          leaderboard.map((entry, index) => (
            <div
              key={entry.id}
              className={`p-4 hover:bg-gray-50 transition-colors ${
                index < 3 ? 'bg-gray-50' : ''
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Rank */}
                <div
                  className={`flex-shrink-0 w-12 h-12 rounded-full border-2 flex items-center justify-center font-bold ${getRankBadgeStyle(
                    entry.rank
                  )}`}
                >
                  {entry.rank <= 3 ? (
                    getRankIcon(entry.rank)
                  ) : (
                    <span>{entry.rank}</span>
                  )}
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {entry.user?.name || 'Anonymous'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {entry.totalReferrals} referral
                    {entry.totalReferrals !== 1 ? 's' : ''}
                  </p>
                </div>

                {/* Stats */}
                <div className="text-right">
                  <div className="flex items-center gap-2 justify-end">
                    <div className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-semibold">
                      {entry.totalPoints.toLocaleString()} poin
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {formatCurrency(entry.totalAmount)}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {leaderboard.length > 0 && (
        <div className="bg-gray-50 p-4 text-center text-sm text-gray-600">
          <p>
            Referral teratas mendapatkan poin untuk setiap donasi yang masuk
            melalui link mereka
          </p>
        </div>
      )}
    </div>
  );
}
