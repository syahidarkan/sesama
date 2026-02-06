'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import ReferralCodeGenerator from '@/components/ReferralCodeGenerator';
import ReferralStats from '@/components/ReferralStats';
import ReferralLeaderboard from '@/components/ReferralLeaderboard';
import { Share2, TrendingUp, Award } from 'lucide-react';

export default function ReferralsPage() {
  const router = useRouter();
  const { user, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-700 to-primary-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
              <Share2 size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Program Referral</h1>
              <p className="text-primary-100 mt-1">
                Bagikan link, dapatkan poin untuk setiap donasi
              </p>
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Share2 size={24} />
                <div>
                  <p className="font-semibold">1. Bagikan Link</p>
                  <p className="text-sm text-primary-100">
                    Buat dan bagikan link referral Anda
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Award size={24} />
                <div>
                  <p className="font-semibold">2. Dapatkan Poin</p>
                  <p className="text-sm text-primary-100">
                    100 poin per donasi melalui link Anda
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <TrendingUp size={24} />
                <div>
                  <p className="font-semibold">3. Naik Peringkat</p>
                  <p className="text-sm text-primary-100">
                    Bersaing di leaderboard referral
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Generator & Stats */}
          <div className="lg:col-span-2 space-y-8">
            {/* Referral Code Generator */}
            <ReferralCodeGenerator />

            {/* My Stats */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Statistik Saya
              </h2>
              <ReferralStats />
            </div>
          </div>

          {/* Right Column: Leaderboard */}
          <div className="lg:col-span-1">
            <ReferralLeaderboard />
          </div>
        </div>
      </div>
    </div>
  );
}
