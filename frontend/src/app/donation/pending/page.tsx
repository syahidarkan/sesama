'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function DonationPendingContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        {/* Pending Icon with Animation */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-28 h-28 bg-yellow-500 rounded-full mb-6 border border-gray-200 shadow-yellow-500/40 relative">
            <div className="absolute inset-0 rounded-full bg-yellow-400 animate-ping opacity-30"></div>
            <svg className="w-14 h-14 text-white relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Menunggu Konfirmasi
          </h1>
          <p className="text-xl text-gray-600">
            Donasi Anda sedang diproses
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-lg border border-gray-200 border-2 border-gray-100 overflow-hidden mb-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 px-8 py-6">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-bold text-lg">Status Pembayaran</h2>
              <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-bold border border-white/30 flex items-center space-x-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span>Pending</span>
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 space-y-6">
            {orderId && (
              <div className="bg-yellow-50 rounded-lg p-6 border-2 border-yellow-200">
                <div className="text-sm text-yellow-700 font-semibold mb-2">Order ID</div>
                <div className="font-mono text-sm font-bold text-yellow-900 break-all">
                  {orderId}
                </div>
              </div>
            )}

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100/50 rounded-lg p-6 border-2 border-yellow-200">
              <div className="flex items-start space-x-4">
                <div className="shrink-0 w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-yellow-900 mb-2">Pembayaran Sedang Diverifikasi</h3>
                  <p className="text-yellow-800 text-sm leading-relaxed">
                    Pembayaran Anda sedang dalam proses verifikasi. Kami akan mengupdate status donasi Anda setelah pembayaran dikonfirmasi.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-lg border border-gray-200 border-2 border-gray-100 p-6 mb-6">
          <h3 className="font-bold text-gray-900 mb-6">Estimasi Waktu Verifikasi</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">Transfer Bank & E-Wallet</h4>
                <p className="text-sm text-gray-600">5 - 30 menit</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">Kartu Kredit/Debit</h4>
                <p className="text-sm text-gray-600">Instant - 5 menit</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="shrink-0 w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">Virtual Account & Gerai Retail</h4>
                <p className="text-sm text-gray-600">1 - 24 jam</p>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-lg border border-gray-200 border-2 border-blue-200 p-6 mb-6">
          <div className="flex items-start space-x-4">
            <div className="shrink-0 w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-blue-900 mb-2">Apa yang Harus Dilakukan?</h3>
              <ul className="space-y-2 text-blue-800 text-sm">
                <li className="flex items-start space-x-2">
                  <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Pastikan Anda telah menyelesaikan pembayaran sesuai metode yang dipilih</span>
                </li>
                <li className="flex items-start space-x-2">
                  <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Simpan Order ID untuk referensi dan pengecekan status</span>
                </li>
                <li className="flex items-start space-x-2">
                  <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Anda akan menerima notifikasi email setelah pembayaran dikonfirmasi</span>
                </li>
                <li className="flex items-start space-x-2">
                  <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Halaman ini dapat ditutup, status akan diupdate otomatis</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Help Contact */}
        <div className="bg-white rounded-lg border border-gray-200 border-2 border-gray-100 p-6 mb-6">
          <div className="flex items-start space-x-4">
            <div className="shrink-0 w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 mb-2">Butuh Bantuan?</h3>
              <p className="text-gray-600 text-sm mb-3">
                Jika pembayaran Anda belum dikonfirmasi setelah batas waktu estimasi, hubungi tim support kami.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://wa.me/6281234567890"
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                  </svg>
                  <span>WhatsApp</span>
                </a>
                <a
                  href="mailto:support@sesama.id"
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>Email</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <Link
          href="/"
          className="block w-full text-center px-8 py-4 bg-orange-600 text-white font-bold rounded-xl border border-gray-200 shadow-orange-500/30 hover:border border-gray-200 hover:shadow-orange-500/40 transform hover:-translate-y-0.5 transition-all"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}

export default function DonationPendingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-50 flex items-center justify-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full border border-gray-200 shadow-yellow-500/30">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    }>
      <DonationPendingContent />
    </Suspense>
  );
}
