'use client';

import { useState, useEffect } from 'react';
import { staticPagesApi } from '@/lib/api';
import Link from 'next/link';

export default function LegalPage() {
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPage();
  }, []);

  const loadPage = async () => {
    setLoading(true);
    try {
      const response = await staticPagesApi.getPage('legal');
      setPage(response.data);
    } catch (error) {
      console.error('Failed to load page:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const defaultContent = `
    <div class="space-y-8">
      <div>
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Informasi Hukum</h2>
        <p class="text-gray-700">
          Halaman ini berisi informasi hukum dan ketentuan penggunaan platform SobatBantu.
          Kami berkomitmen untuk beroperasi secara transparan dan sesuai dengan peraturan yang berlaku.
        </p>
      </div>

      <div>
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Legalitas Platform</h2>
        <p class="text-gray-700 mb-4">
          SobatBantu adalah platform donasi yang beroperasi sesuai dengan hukum dan peraturan yang berlaku
          di Republik Indonesia. Kami terdaftar dan memiliki izin operasi yang sah.
        </p>
      </div>

      <div>
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Perlindungan Data</h2>
        <p class="text-gray-700">
          Kami melindungi data pribadi Anda sesuai dengan Undang-Undang Perlindungan Data Pribadi (UU PDP).
          Informasi pribadi Anda dienkripsi dan disimpan dengan aman. Kami tidak akan membagikan data Anda
          kepada pihak ketiga tanpa persetujuan Anda.
        </p>
      </div>

      <div>
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Transparansi Keuangan</h2>
        <p class="text-gray-700">
          Seluruh transaksi donasi tercatat dan dapat diaudit. Kami mempublikasikan laporan keuangan secara berkala
          dan memberikan akses penuh kepada donatur untuk melacak penggunaan dana mereka.
        </p>
      </div>

      <div>
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Kebijakan Terkait</h2>
        <ul class="space-y-2">
          <li>
            <a href="/terms" class="text-primary-600 hover:text-primary-700 font-medium">
              Syarat dan Ketentuan Penggunaan
            </a>
          </li>
          <li>
            <a href="/privacy" class="text-primary-600 hover:text-primary-700 font-medium">
              Kebijakan Privasi
            </a>
          </li>
        </ul>
      </div>

      <div>
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Kontak Hukum</h2>
        <p class="text-gray-700">
          Untuk pertanyaan terkait aspek hukum atau kepatuhan, silakan hubungi tim legal kami di
          <a href="mailto:legal@sobatbantu.org" class="text-primary-600 hover:text-primary-700 font-medium"> legal@sobatbantu.org</a>
        </p>
      </div>
    </div>
  `;

  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              SobatBantu
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

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {page?.title || 'Informasi Hukum'}
          </h1>
          {page?.updatedAt && (
            <p className="text-sm text-gray-500">
              Terakhir diperbarui: {new Date(page.updatedAt).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          )}
        </div>

        <div className="bg-white prose prose-lg max-w-none">
          {page?.content ? (
            <div dangerouslySetInnerHTML={{ __html: page.content }} />
          ) : (
            <div dangerouslySetInnerHTML={{ __html: defaultContent }} />
          )}
        </div>
      </div>
    </div>
  );
}
