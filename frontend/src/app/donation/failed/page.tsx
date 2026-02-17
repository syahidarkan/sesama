'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function DonationFailedContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-lg w-full">
        {/* Error header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500 rounded-full mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Pembayaran Gagal</h1>
          <p className="text-gray-600">Donasi Anda tidak dapat diproses</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-4">
          <div className="bg-red-500 px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-semibold">Detail Pembayaran</h2>
              <span className="px-3 py-1 bg-white/20 rounded text-white text-xs font-medium">Gagal</span>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {orderId && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="text-xs text-gray-600 font-medium mb-1">Order ID</div>
                <div className="font-mono text-xs font-bold text-gray-900 break-all">{orderId}</div>
              </div>
            )}

            <div className="bg-red-50 border border-red-100 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="shrink-0 w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-red-900 text-sm mb-1">Transaksi Dibatalkan</h3>
                  <p className="text-red-800 text-xs leading-relaxed">
                    Tidak ada dana yang terpotong dari rekening Anda. Silakan coba lagi atau hubungi kami.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Possible causes */}
        <div className="bg-white rounded-lg border border-gray-200 p-5 mb-4">
          <h3 className="font-semibold text-gray-900 text-sm mb-3">Kemungkinan Penyebab</h3>
          <ul className="space-y-2">
            {[
              'Saldo tidak mencukupi atau limit transaksi terlampaui',
              'Koneksi internet terputus saat proses pembayaran',
              'Informasi kartu/rekening yang dimasukkan tidak valid',
              'Transaksi dibatalkan secara manual oleh donatur',
            ].map((text) => (
              <li key={text} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="w-1 h-1 rounded-full bg-gray-400 mt-2 shrink-0" />
                {text}
              </li>
            ))}
          </ul>
        </div>

        {/* Help */}
        <div className="bg-primary-50 border border-primary-100 rounded-lg p-5 mb-4">
          <h3 className="font-semibold text-primary-900 text-sm mb-2">Butuh Bantuan?</h3>
          <p className="text-primary-800 text-xs mb-3">
            Tim kami siap membantu Anda 24/7.
          </p>
          <div className="flex gap-2">
            <a href="https://wa.me/6281234567890" className="inline-flex items-center gap-1.5 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition-colors">
              WhatsApp
            </a>
            <a href="mailto:support@sobatbantu.id" className="inline-flex items-center gap-1.5 px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-medium rounded-lg transition-colors">
              Email
            </a>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium text-sm rounded-lg transition-colors"
          >
            Coba Lagi
          </Link>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium text-sm rounded-lg transition-colors"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function DonationFailedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-red-500 rounded-full">
          <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    }>
      <DonationFailedContent />
    </Suspense>
  );
}
