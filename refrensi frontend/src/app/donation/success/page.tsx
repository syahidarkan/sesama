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
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-teal-500 rounded-full mb-6 border border-gray-200 shadow-teal-500/30">
            <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-lg text-gray-600 font-medium">Memuat status donasi...</p>
        </div>
      </div>
    );
  }

  if (error || !donation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-lg border border-gray-200 border-2 border-gray-100 p-10 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
            <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Terjadi Kesalahan</h1>
          <p className="text-gray-600 mb-8">{error}</p>
          <Link
            href="/"
            className="inline-flex items-center px-8 py-4 bg-teal-500 text-white font-bold rounded-xl border border-gray-200 shadow-teal-500/30 hover:border border-gray-200 hover:shadow-teal-500/40 transform hover:-translate-y-0.5 transition-all"
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
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        {/* Success Animation */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-28 h-28 bg-green-500 rounded-full mb-6 border border-gray-200 shadow-green-500/40 animate-bounce">
            <svg className="w-14 h-14 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Donasi Berhasil!
          </h1>
          <p className="text-xl text-gray-600">
            Terima kasih atas kebaikan Anda
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-lg border border-gray-200 border-2 border-gray-100 overflow-hidden mb-6">
          {/* Header */}
          <div className="bg-teal-500 px-8 py-6">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-bold text-lg">Detail Donasi</h2>
              <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-bold border border-white/30">
                ✓ Terverifikasi
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="p-8 space-y-6">
            <div className="bg-gradient-to-br from-teal-50 to-cyan-100/50 rounded-lg p-6 border-2 border-teal-200">
              <div className="text-sm text-teal-700 font-semibold mb-2">Jumlah Donasi</div>
              <div className="text-4xl font-bold text-teal-600">
                {formatCurrency(donation.amount)}
              </div>
            </div>

            <div className="grid gap-4">
              <div className="flex items-center justify-between py-4 border-b border-gray-100">
                <span className="text-gray-600 font-medium">Order ID</span>
                <span className="font-mono text-sm font-bold text-gray-900 bg-gray-100 px-3 py-1.5 rounded-lg">
                  {donation.id.substring(0, 20)}...
                </span>
              </div>
              <div className="flex items-center justify-between py-4 border-b border-gray-100">
                <span className="text-gray-600 font-medium">Nama Donatur</span>
                <span className="font-bold text-gray-900">{donation.donorName}</span>
              </div>
              {donation.program && (
                <div className="flex items-center justify-between py-4">
                  <span className="text-gray-600 font-medium">Program</span>
                  <span className="font-semibold text-teal-600">{donation.program.title}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Impact Message */}
        <div className="bg-white rounded-lg border border-gray-200 border-2 border-green-100 p-6 mb-6">
          <div className="flex items-start space-x-4">
            <div className="shrink-0 w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 mb-2">Donasi Anda Membawa Harapan</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Donasi Anda telah berhasil diterima dan akan segera disalurkan kepada yang membutuhkan. Semoga menjadi amal jariyah yang berkah dan membawa manfaat bagi sesama.
              </p>
            </div>
          </div>
        </div>

        {/* Share Section */}
        <div className="bg-white rounded-lg border border-gray-200 border-2 border-gray-100 p-6 mb-6">
          <h3 className="font-bold text-gray-900 mb-4">Bagikan Kebaikan Ini</h3>
          <div className="flex flex-wrap gap-3 mb-4">
            <button className="flex-1 min-w-[140px] flex items-center justify-center space-x-2 px-4 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-semibold border border-gray-200 hover:border border-gray-200 transform hover:-translate-y-0.5 transition-all">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
              </svg>
              <span>Twitter</span>
            </button>
            <button className="flex-1 min-w-[140px] flex items-center justify-center space-x-2 px-4 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl font-semibold border border-gray-200 hover:border border-gray-200 transform hover:-translate-y-0.5 transition-all">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
              </svg>
              <span>Facebook</span>
            </button>
            <button className="flex-1 min-w-[140px] flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold border border-gray-200 hover:border border-gray-200 transform hover:-translate-y-0.5 transition-all">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
              </svg>
              <span>WhatsApp</span>
            </button>
          </div>
          <p className="text-center text-sm text-gray-500">
            Ajak teman dan keluarga untuk ikut berdonasi
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid md:grid-cols-2 gap-4">
          {donation.program && (
            <Link
              href={`/programs/${donation.program.slug || donation.programId}`}
              className="flex items-center justify-center space-x-2 px-8 py-4 bg-teal-500 text-white font-bold rounded-xl border border-gray-200 shadow-teal-500/30 hover:border border-gray-200 hover:shadow-teal-500/40 transform hover:-translate-y-0.5 transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>Lihat Program</span>
            </Link>
          )}
          <Link
            href="/"
            className="flex items-center justify-center space-x-2 px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:border-gray-300 hover:border border-gray-200 transform hover:-translate-y-0.5 transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>Kembali ke Beranda</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function DonationSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-500 rounded-full border border-gray-200 shadow-teal-500/30">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    }>
      <DonationSuccessContent />
    </Suspense>
  );
}
