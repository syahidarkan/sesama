'use client';

import { useState, useEffect } from 'react';
import { staticPagesApi } from '@/lib/api';
import Link from 'next/link';

export default function AboutPage() {
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPage();
  }, []);

  const loadPage = async () => {
    setLoading(true);
    try {
      const response = await staticPagesApi.getPage('about-us');
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
                sesama
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
        <div className="relative max-w-7xl mx-auto px-6 py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center space-x-2 bg-white/20 px-5 py-2.5 rounded-full mb-6 border border-white/30">
              <svg className="w-5 h-5 text-primary-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-white font-bold text-sm tracking-wide">Tentang Platform</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Tentang Kami
            </h1>
            <p className="text-xl text-primary-50 leading-relaxed mb-8">
              Kami membangun jembatan antara kepedulian Anda dengan harapan mereka. Setiap rupiah yang Anda salurkan tercatat, terverifikasi, dan tersalurkan 100% tanpa potongan.
            </p>
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center border border-white/30">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">100K+</div>
                  <div className="text-sm text-primary-100">Donatur Terdaftar</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center border border-white/30">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">100%</div>
                  <div className="text-sm text-primary-100">Dana Tersalurkan</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mission */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-2 gap-16">
          <div>
            <p className="text-xs font-semibold text-primary-600 uppercase tracking-wide mb-3">Misi Kami</p>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Membangun Ekosistem Donasi yang Transparan dan Terpercaya
            </h2>
            <p className="text-gray-600 mb-8">
              Kami percaya bahwa teknologi dapat mempermudah setiap orang untuk berbagi kebaikan. Dengan sistem yang transparan dan mudah diakses, kami ingin menghilangkan hambatan antara niat baik dengan penyaluran bantuan nyata.
            </p>

            <div className="space-y-5">
              {[
                { title: 'Transparansi Penuh', desc: 'Setiap transaksi tercatat dan dapat dilacak. Laporan penyaluran dipublikasikan secara real-time.' },
                { title: 'Verifikasi Ketat', desc: 'Setiap program melalui proses validasi dokumen dan survey lapangan oleh tim kami.' },
                { title: 'Pencairan Cepat', desc: 'Dana otomatis cair dalam 24 jam setelah program mencapai target tanpa biaya admin.' },
              ].map((item) => (
                <div key={item.title} className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-600 mt-2 shrink-0" />
                  <div>
                    <h3 className="font-medium text-gray-900 text-sm">{item.title}</h3>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-600">Tingkat Kepercayaan</span>
                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
                  Sangat Tinggi
                </span>
              </div>
              <div className="flex items-baseline">
                <span className="text-4xl font-bold text-gray-900">4.9</span>
                <span className="text-gray-400 ml-1">/ 5.0</span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <div className="text-sm font-medium text-gray-600 mb-2">Total Dana Tersalurkan</div>
              <div className="text-2xl font-bold text-gray-900">Rp 50+ Miliar</div>
              <div className="mt-3 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-primary-600 rounded-full" style={{width: '100%'}} />
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600">Waktu Respons</div>
                  <div className="text-xl font-bold text-gray-900">&lt; 1 jam</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="border-t border-gray-200 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <p className="text-xs font-semibold text-primary-600 uppercase tracking-wide mb-3">Nilai Kami</p>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Prinsip yang Kami Pegang Teguh</h2>
          <p className="text-gray-600 mb-10 max-w-2xl">
            Nilai-nilai ini menjadi fondasi setiap keputusan dan tindakan kami dalam melayani donatur dan penerima manfaat
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: 'Integritas', desc: 'Kami berkomitmen pada kejujuran dan transparansi dalam setiap aspek operasional platform.' },
              { title: 'Empati', desc: 'Memahami kebutuhan donatur dan penerima manfaat dengan sepenuh hati untuk menciptakan dampak nyata.' },
              { title: 'Akuntabilitas', desc: 'Bertanggung jawab penuh atas setiap rupiah yang dipercayakan kepada kami untuk disalurkan.' },
              { title: 'Inovasi', desc: 'Terus berinovasi menghadirkan solusi terbaik untuk mempermudah penyaluran bantuan.' },
            ].map((value) => (
              <div key={value.title} className="bg-white rounded-lg p-6 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-sm text-gray-500">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CMS Content */}
      {page?.content && (
        <div className="max-w-4xl mx-auto px-6 py-16">
          <div
            className="prose prose-gray max-w-none"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        </div>
      )}

      {/* CTA */}
      <div className="bg-primary-600">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">
            Mari bersama ciptakan dampak nyata
          </h2>
          <p className="text-primary-100 mb-8 max-w-lg mx-auto">
            Bergabunglah dengan ribuan donatur yang telah mempercayai kami untuk menyalurkan kebaikan.
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              href="/programs"
              className="px-5 py-2.5 bg-white text-primary-700 font-medium text-sm rounded hover:bg-primary-50 transition-colors"
            >
              Mulai Berdonasi
            </Link>
            <Link
              href="/pengusul/register"
              className="px-5 py-2.5 bg-primary-700 border border-primary-500 text-white font-medium text-sm rounded hover:bg-primary-800 transition-colors"
            >
              Ajukan Program
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-500">
              &copy; 2026 sesama. Semua hak dilindungi.
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <Link href="/privacy" className="hover:text-gray-700">Privasi</Link>
              <Link href="/terms" className="hover:text-gray-700">Ketentuan</Link>
              <Link href="/contact" className="hover:text-gray-700">Kontak</Link>
            </div>
          </div>
          {page?.lastEditedBy && (
            <div className="mt-6 pt-6 border-t border-gray-100 text-center text-xs text-gray-400">
              Terakhir diperbarui: {new Date(page.updatedAt).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}
