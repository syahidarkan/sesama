'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function DonationPendingContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-lg w-full">
        {/* Pending header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-500 rounded-full mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Menunggu Konfirmasi</h1>
          <p className="text-gray-600">Donasi Anda sedang diproses</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-4">
          <div className="bg-yellow-500 px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-semibold">Status Pembayaran</h2>
              <span className="px-3 py-1 bg-white/20 rounded text-white text-xs font-medium flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                Pending
              </span>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {orderId && (
              <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
                <div className="text-xs text-yellow-700 font-medium mb-1">Order ID</div>
                <div className="font-mono text-xs font-bold text-yellow-900 break-all">{orderId}</div>
              </div>
            )}

            <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="shrink-0 w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-yellow-900 text-sm mb-1">Pembayaran Sedang Diverifikasi</h3>
                  <p className="text-yellow-800 text-xs leading-relaxed">
                    Kami akan mengupdate status donasi Anda setelah pembayaran dikonfirmasi.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-lg border border-gray-200 p-5 mb-4">
          <h3 className="font-semibold text-gray-900 text-sm mb-4">Estimasi Waktu Verifikasi</h3>
          <div className="space-y-3">
            {[
              { label: 'Transfer Bank & E-Wallet', time: '5 - 30 menit' },
              { label: 'Kartu Kredit/Debit', time: 'Instant - 5 menit' },
              { label: 'Virtual Account & Gerai Retail', time: '1 - 24 jam' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <span className="text-sm text-gray-700">{item.label}</span>
                <span className="text-xs text-gray-500 font-medium">{item.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-primary-50 border border-primary-100 rounded-lg p-5 mb-4">
          <h3 className="font-semibold text-primary-900 text-sm mb-3">Yang Perlu Dilakukan</h3>
          <ul className="space-y-2 text-primary-800 text-xs">
            {[
              'Pastikan Anda telah menyelesaikan pembayaran sesuai metode yang dipilih',
              'Simpan Order ID untuk referensi dan pengecekan status',
              'Anda akan menerima notifikasi email setelah pembayaran dikonfirmasi',
              'Halaman ini dapat ditutup, status akan diupdate otomatis',
            ].map((text) => (
              <li key={text} className="flex items-start gap-2">
                <svg className="w-3.5 h-3.5 shrink-0 mt-0.5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Help */}
        <div className="bg-white rounded-lg border border-gray-200 p-5 mb-4">
          <h3 className="font-semibold text-gray-900 text-sm mb-2">Butuh Bantuan?</h3>
          <p className="text-gray-600 text-xs mb-3">
            Hubungi tim support kami jika pembayaran belum dikonfirmasi setelah batas waktu estimasi.
          </p>
          <div className="flex gap-2">
            <a href="https://wa.me/6281234567890" className="inline-flex items-center gap-1.5 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition-colors">
              WhatsApp
            </a>
            <a href="mailto:support@sesama.id" className="inline-flex items-center gap-1.5 px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-medium rounded-lg transition-colors">
              Email
            </a>
          </div>
        </div>

        <Link
          href="/"
          className="block w-full text-center px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium text-sm rounded-lg transition-colors"
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-500 rounded-full">
          <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    }>
      <DonationPendingContent />
    </Suspense>
  );
}
