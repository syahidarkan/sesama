'use client';

import { useQuery } from '@tanstack/react-query';
import { donationsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import Link from 'next/link';
import {
  ArrowLeft,
  Loader2,
  CheckCircle,
  Clock,
  XCircle,
  Calendar,
  DollarSign,
  Heart,
  Download
} from 'lucide-react';

export default function MyDonationsPage() {
  const { user } = useAuthStore();

  const { data: donations, isLoading } = useQuery({
    queryKey: ['my-donations'],
    queryFn: () => donationsApi.getMyDonations().then((res) => res.data),
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { bg: string; text: string; icon: any; label: string }> = {
      SUCCESS: {
        bg: 'bg-green-50 border-green-200',
        text: 'text-green-700',
        icon: CheckCircle,
        label: 'Berhasil',
      },
      PENDING: {
        bg: 'bg-amber-50 border-amber-200',
        text: 'text-amber-700',
        icon: Clock,
        label: 'Pending',
      },
      FAILED: {
        bg: 'bg-red-50 border-red-200',
        text: 'text-red-700',
        icon: XCircle,
        label: 'Gagal',
      },
    };

    const { bg, text, icon: Icon, label } = config[status] || config.PENDING;

    return (
      <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium border ${bg} ${text}`}>
        <Icon className="w-3.5 h-3.5" />
        <span>{label}</span>
      </span>
    );
  };

  const totalDonated = donations?.reduce((sum: number, d: any) => {
    if (d.status === 'SUCCESS') {
      return sum + parseFloat(d.amount || 0);
    }
    return sum;
  }, 0) || 0;

  const successfulDonations = donations?.filter((d: any) => d.status === 'SUCCESS').length || 0;
  const programsSupported = new Set(
    donations?.filter((d: any) => d.status === 'SUCCESS').map((d: any) => d.programId)
  ).size || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between animate-fadeIn">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Kembali
            </Link>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">Riwayat Donasi</h1>
          <p className="text-sm text-gray-600 mt-1">
            Semua donasi yang pernah Anda lakukan
          </p>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fadeIn animate-stagger-1">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-sm text-green-800 mb-1">Total Donasi</div>
          <div className="text-2xl font-semibold text-green-900">
            {formatCurrency(totalDonated)}
          </div>
          <p className="text-xs text-green-700 mt-1">
            Dari {successfulDonations} transaksi berhasil
          </p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <Heart className="w-5 h-5 text-orange-600" />
          </div>
          <div className="text-sm text-orange-800 mb-1">Program Dibantu</div>
          <div className="text-2xl font-semibold text-orange-900">
            {programsSupported}
          </div>
          <p className="text-xs text-orange-700 mt-1">
            Program berbeda
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-sm text-blue-800 mb-1">Total Transaksi</div>
          <div className="text-2xl font-semibold text-blue-900">
            {donations?.length || 0}
          </div>
          <p className="text-xs text-blue-700 mt-1">
            {donations?.filter((d: any) => d.status === 'PENDING').length || 0} pending
          </p>
        </div>
      </div>

      {/* Donations List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden animate-fadeIn animate-stagger-2">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Semua Transaksi</h2>
          <p className="text-sm text-gray-600 mt-0.5">
            {donations?.length || 0} transaksi ditemukan
          </p>
        </div>

        <div className="divide-y divide-gray-200">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-orange-600 mx-auto mb-3" />
                <p className="text-sm text-gray-600">Memuat riwayat...</p>
              </div>
            </div>
          ) : donations && donations.length > 0 ? (
            donations.map((donation: any) => (
              <div
                key={donation.id}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Program Info */}
                    <div className="flex items-start space-x-4 mb-3">
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center shrink-0">
                        <Heart className="w-6 h-6 text-orange-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-gray-900 mb-1">
                          {donation.program?.title || 'Program'}
                        </h3>
                        <div className="flex items-center space-x-3 text-sm text-gray-600">
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(donation.createdAt).toLocaleDateString('id-ID', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Donation Details */}
                    <div className="ml-16 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Jumlah Donasi:</span>
                        <span className="text-lg font-semibold text-orange-600">
                          {formatCurrency(parseFloat(donation.amount))}
                        </span>
                      </div>

                      {donation.donorName && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Nama Donatur:</span>
                          <span className="text-gray-900 font-medium">
                            {donation.isAnonymous ? 'Anonim' : donation.donorName}
                          </span>
                        </div>
                      )}

                      {donation.message && (
                        <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700 italic">"{donation.message}"</p>
                        </div>
                      )}

                      {donation.actionpayOrderId && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">Order ID:</span>
                          <span className="text-gray-700 font-mono">
                            {donation.actionpayOrderId}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="ml-4">
                    {getStatusBadge(donation.status)}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">
                Belum Ada Donasi
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Anda belum melakukan donasi ke program apapun
              </p>
              <Link
                href="/programs"
                className="inline-flex items-center px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 transition-colors"
              >
                Mulai Berdonasi
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Info Box */}
      {donations && donations.length > 0 && (
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-5">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
              <Download className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-blue-900 mb-1">
                Butuh Bukti Donasi?
              </h3>
              <p className="text-sm text-blue-800">
                Untuk mendapatkan bukti donasi atau sertifikat, silakan hubungi tim kami melalui
                email atau WhatsApp yang tertera di halaman kontak.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
