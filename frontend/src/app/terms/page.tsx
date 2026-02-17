'use client';

import { useEffect, useState } from 'react';
import { staticPagesApi } from '@/lib/api';
import Link from 'next/link';
import { Shield, FileText, CheckCircle } from 'lucide-react';

export default function TermsPage() {
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPage();
  }, []);

  const fetchPage = async () => {
    try {
      const response = await staticPagesApi.getPage('terms-of-service');
      setPage(response.data);
    } catch (error) {
      console.error('Error fetching terms:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">Memuat halaman...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-gray-200/80 bg-white/95 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-11 h-11 bg-primary-600 rounded-lg flex items-center justify-center border border-gray-200 shadow-md transform group-hover:scale-105 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              SobatBantu
              </span>
            </Link>
            <Link
              href="/"
              className="inline-flex items-center px-5 py-2.5 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-lg hover:border-gray-300 hover:shadow-md transition-all"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative bg-primary-600 overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)]"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center space-x-2 bg-white/20 px-5 py-2.5 rounded-full mb-6 border border-white/30">
              <FileText className="w-4 h-4 text-primary-100" />
              <span className="text-white font-bold text-sm tracking-wide">Dokumen Legal</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
              Syarat & Ketentuan
            </h1>
            <p className="text-lg text-primary-50">
              Terakhir diperbarui: {page?.updatedAt ? new Date(page.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '1 Januari 2026'}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-white rounded-xl border border-gray-200 p-8 md:p-12 shadow-sm">
          <div className="prose prose-gray max-w-none">
            <div className="bg-primary-50 border-l-4 border-primary-600 p-6 rounded-lg mb-8">
              <p className="text-gray-700 leading-relaxed mb-0">
                Syarat dan Ketentuan ini mengatur penggunaan platform <strong>SobatBantu</strong>.
                Dengan mengakses atau menggunakan layanan kami, Anda menyetujui untuk terikat oleh ketentuan ini.
              </p>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4 flex items-center gap-3">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center shrink-0">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              Penggunaan Platform
            </h2>
            <p className="text-gray-700 mb-4">Dengan menggunakan SobatBantu, Anda setuju untuk:</p>
            <ul className="space-y-2 text-gray-700">
              <li>Memberikan informasi yang akurat dan lengkap</li>
              <li>Menjaga kerahasiaan akun Anda</li>
              <li>Tidak menyalahgunakan platform untuk tujuan ilegal</li>
              <li>Tidak mengganggu atau merusak sistem kami</li>
              <li>Menghormati hak kekayaan intelektual kami dan pihak lain</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Donasi dan Pembayaran</h2>
            <p className="text-gray-700">
              Semua donasi yang dilakukan melalui platform kami bersifat final dan tidak dapat dibatalkan setelah pembayaran dikonfirmasi.
              Kami tidak bertanggung jawab atas kesalahan input yang dilakukan oleh donatur.
            </p>
            <p className="text-gray-700 mt-4">
              Kami bekerja sama dengan penyedia payment gateway yang telah terverifikasi untuk memproses pembayaran Anda dengan aman.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Verifikasi Program</h2>
            <p className="text-gray-700">
              Setiap program yang diajukan melalui platform kami akan melalui proses verifikasi. Kami berhak untuk menolak,
              menangguhkan, atau menghapus program yang tidak memenuhi kriteria kami.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Batasan Tanggung Jawab</h2>
            <p className="text-gray-700">
              Platform SobatBantu bertindak sebagai perantara antara donatur dan penerima dana. Kami tidak bertanggung jawab
              atas klaim, kerugian, atau kerusakan yang timbul dari penggunaan platform atau program yang didanai melalui platform kami.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Perubahan Ketentuan</h2>
            <p className="text-gray-700">
              Kami dapat memperbarui Syarat dan Ketentuan ini dari waktu ke waktu. Perubahan akan berlaku segera setelah dipublikasikan
              di halaman ini. Penggunaan platform setelah perubahan berarti Anda menerima ketentuan yang diperbarui.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Kontak</h2>
            <p className="text-gray-700">
              Jika Anda memiliki pertanyaan tentang Syarat dan Ketentuan ini, silakan hubungi kami di{' '}
              <a href="mailto:legal@sobatbantu.org" className="text-primary-600 hover:text-primary-700 font-semibold">legal@sobatbantu.org</a>
            </p>
          </div>
        </div>

        {/* Related Links */}
        <div className="grid md:grid-cols-2 gap-4 mt-8">
          <Link
            href="/privacy"
            className="flex items-center gap-3 p-5 bg-white rounded-xl border border-gray-200 hover:border-primary-200 hover:shadow-md transition-all group"
          >
            <Shield className="w-6 h-6 text-primary-600" />
            <div>
              <div className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">Kebijakan Privasi</div>
              <div className="text-sm text-gray-500">Bagaimana kami melindungi data Anda</div>
            </div>
          </Link>
          <Link
            href="/legal"
            className="flex items-center gap-3 p-5 bg-white rounded-xl border border-gray-200 hover:border-primary-200 hover:shadow-md transition-all group"
          >
            <FileText className="w-6 h-6 text-primary-600" />
            <div>
              <div className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">Informasi Legal</div>
              <div className="text-sm text-gray-500">Detail legal platform kami</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-500">
              &copy; 2026 SobatBantu. Semua hak dilindungi.
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <Link href="/privacy" className="hover:text-gray-700">Privasi</Link>
              <Link href="/contact" className="hover:text-gray-700">Kontak</Link>
              <Link href="/faq" className="hover:text-gray-700">FAQ</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
