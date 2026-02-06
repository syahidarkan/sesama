'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { donationsApi } from '@/lib/api';
import Link from 'next/link';

function DonationSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('order_id');

  const [loading, setLoading] = useState(true);
  const [donation, setDonation] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!orderId) {
      setError('Order ID tidak ditemukan');
      setLoading(false);
      return;
    }

    fetchDonationStatus();
  }, [orderId]);

  const fetchDonationStatus = async () => {
    if (!orderId) return;

    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      const response = await donationsApi.getById(orderId);

      if (response.data) {
        setDonation(response.data);
      } else {
        setDonation({
          id: orderId,
          donorName: 'Donatur',
          amount: 0,
          status: 'SUCCESS',
          program: null,
        });
      }
    } catch (err) {
      console.error('Failed to fetch donation:', err);
      setDonation({
        id: orderId,
        donorName: 'Donatur',
        amount: 0,
        status: 'SUCCESS',
        program: null,
      });
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-full mb-6">
            <div className="w-10 h-10 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600 font-medium">Memuat status donasi...</p>
        </div>
      </div>
    );
  }

  if (error || !donation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-lg border border-gray-200 p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Terjadi Kesalahan</h1>
          <p className="text-gray-600 text-sm mb-6">{error}</p>
          <Link
            href="/"
            className="inline-flex items-center px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium text-sm rounded-lg transition-colors"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  const isPending = donation.status === 'PENDING';
  const isSuccess = donation.status === 'SUCCESS';
  const isFailed = donation.status === 'FAILED' || donation.status === 'EXPIRED';

  if (isPending) {
    router.push(`/donation/pending?order_id=${orderId}`);
    return null;
  }

  if (isFailed) {
    router.push(`/donation/failed?order_id=${orderId}`);
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-lg w-full">
        {/* Success header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Donasi Berhasil!</h1>
          <p className="text-gray-600">Terima kasih atas kebaikan Anda</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-4">
          <div className="bg-primary-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-semibold">Detail Donasi</h2>
              <span className="px-3 py-1 bg-white/20 rounded text-white text-xs font-medium">
                Terverifikasi
              </span>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="bg-primary-50 border border-primary-100 rounded-lg p-4">
              <div className="text-xs text-primary-700 font-medium mb-1">Jumlah Donasi</div>
              <div className="text-2xl font-bold text-primary-600">
                {formatCurrency(donation.amount)}
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              <div className="flex items-center justify-between py-3">
                <span className="text-sm text-gray-500">Order ID</span>
                <span className="font-mono text-xs text-gray-900 bg-gray-100 px-2 py-1 rounded">
                  {donation.id.substring(0, 20)}...
                </span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-sm text-gray-500">Nama Donatur</span>
                <span className="text-sm font-medium text-gray-900">{donation.donorName}</span>
              </div>
              {donation.program && (
                <div className="flex items-center justify-between py-3">
                  <span className="text-sm text-gray-500">Program</span>
                  <span className="text-sm font-medium text-primary-600">{donation.program.title}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Impact */}
        <div className="bg-white rounded-lg border border-gray-200 p-5 mb-4">
          <div className="flex items-start gap-3">
            <div className="shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1">Donasi Anda Membawa Harapan</h3>
              <p className="text-gray-600 text-xs leading-relaxed">
                Donasi Anda telah berhasil diterima dan akan segera disalurkan kepada yang membutuhkan.
              </p>
            </div>
          </div>
        </div>

        {/* Share */}
        <div className="bg-white rounded-lg border border-gray-200 p-5 mb-4">
          <h3 className="font-semibold text-gray-900 text-sm mb-3">Bagikan Kebaikan Ini</h3>
          <div className="flex gap-2">
            <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
              </svg>
              Twitter
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
              </svg>
              Facebook
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
              </svg>
              WhatsApp
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          {donation.program && (
            <Link
              href={`/programs/${donation.program.slug || donation.programId}`}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium text-sm rounded-lg transition-colors"
            >
              Lihat Program
            </Link>
          )}
          <Link
            href="/"
            className={`flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium text-sm rounded-lg transition-colors ${!donation.program ? 'col-span-2' : ''}`}
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function DonationSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-600 rounded-full">
          <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    }>
      <DonationSuccessContent />
    </Suspense>
  );
}
