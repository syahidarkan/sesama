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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Memuat halaman...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">sesama</span>
            </Link>

            <Link
              href="/"
              className="inline-flex items-center px-5 py-2.5 text-gray-700 hover:text-gray-900 font-medium transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Kembali
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-teal-500 overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,rgba(255,255,255,0.3))]" />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold text-white mb-8">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Platform Donasi Terpercaya</span>
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Menghubungkan Kebaikan
              <br />
              dengan Mereka yang
              <br />
              Membutuhkan
            </h1>

            <p className="text-xl text-orange-50 leading-relaxed mb-10">
              Kami membangun jembatan antara kepedulian Anda dengan harapan mereka. Setiap rupiah yang Anda salurkan tercatat, terverifikasi, dan tersalurkan 100% tanpa potongan.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/programs"
                className="inline-flex items-center justify-center px-8 py-4 bg-white hover:bg-gray-50 text-teal-600 rounded-xl font-bold text-lg border border-gray-200 hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1"
              >
                Lihat Program Kami
                <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-4 bg-orange-700/50 hover:bg-teal-600/70 text-white rounded-xl font-semibold text-lg backdrop-blur-sm border-2 border-white/30 hover:border-white/50 transition-all"
              >
                Hubungi Kami
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold bg-teal-500 bg-clip-text text-transparent mb-2">
                100K+
              </div>
              <div className="text-gray-600 font-medium">Donatur Terdaftar</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold bg-teal-500 bg-clip-text text-transparent mb-2">
                500+
              </div>
              <div className="text-gray-600 font-medium">Program Tersalurkan</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold bg-teal-500 bg-clip-text text-transparent mb-2">
                100%
              </div>
              <div className="text-gray-600 font-medium">Dana Tersalurkan</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold bg-teal-500 bg-clip-text text-transparent mb-2">
                24/7
              </div>
              <div className="text-gray-600 font-medium">Layanan Aktif</div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-block px-4 py-2 bg-teal-100 text-teal-700 rounded-full text-sm font-bold mb-6">
                MISI KAMI
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
                Membangun Ekosistem Donasi yang Transparan dan Terpercaya
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                Kami percaya bahwa teknologi dapat mempermudah setiap orang untuk berbagi kebaikan. Dengan sistem yang transparan dan mudah diakses, kami ingin menghilangkan hambatan antara niat baik dengan penyaluran bantuan nyata.
              </p>

              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="shrink-0 w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Transparansi Penuh</h3>
                    <p className="text-gray-600">Setiap transaksi tercatat dan dapat dilacak. Laporan penyaluran dipublikasikan secara real-time.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="shrink-0 w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Verifikasi Ketat</h3>
                    <p className="text-gray-600">Setiap program melalui proses validasi dokumen dan survey lapangan oleh tim kami.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="shrink-0 w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Pencairan Cepat</h3>
                    <p className="text-gray-600">Dana otomatis cair dalam 24 jam setelah program mencapai target tanpa biaya admin.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square bg-teal-50 rounded-lg border border-gray-200 border border-teal-100 p-8">
                <div className="absolute -top-6 -right-6 w-32 h-32 bg-teal-500 rounded-lg opacity-20 blur-2xl" />
                <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-teal-500 rounded-lg opacity-20 blur-2xl" />

                <div className="relative h-full flex flex-col justify-center space-y-6">
                  <div className="bg-white rounded-lg p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-gray-600">Tingkat Kepercayaan</span>
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                        Sangat Tinggi
                      </span>
                    </div>
                    <div className="flex items-baseline">
                      <span className="text-5xl font-bold text-gray-900">4.9</span>
                      <span className="text-lg text-gray-500 ml-2">/ 5.0</span>
                    </div>
                    <div className="flex text-orange-500 mt-2">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-6 border border-gray-200">
                    <div className="text-sm font-semibold text-gray-600 mb-3">Total Dana Tersalurkan</div>
                    <div className="text-3xl font-bold bg-teal-500 bg-clip-text text-transparent">
                      Rp 50+ Miliar
                    </div>
                    <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-teal-500 rounded-full" style={{width: '100%'}} />
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-6 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-gray-600">Waktu Respons</div>
                        <div className="text-2xl font-bold text-gray-900">&lt; 1 jam</div>
                      </div>
                      <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-teal-100 text-teal-700 rounded-full text-sm font-bold mb-6">
              NILAI KAMI
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Prinsip yang Kami Pegang Teguh
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Nilai-nilai ini menjadi fondasi setiap keputusan dan tindakan kami dalam melayani donatur dan penerima manfaat
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="group p-8 bg-teal-50 rounded-lg hover:border border-gray-200 transition-all duration-300 border border-teal-100">
              <div className="w-14 h-14 bg-teal-500 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-gray-200">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Integritas
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Kami berkomitmen pada kejujuran dan transparansi dalam setiap aspek operasional platform.
              </p>
            </div>

            <div className="group p-8 bg-cyan-50 rounded-lg hover:border border-gray-200 transition-all duration-300 border border-blue-100">
              <div className="w-14 h-14 bg-cyan-600 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-gray-200">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Empati
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Memahami kebutuhan donatur dan penerima manfaat dengan sepenuh hati untuk menciptakan dampak nyata.
              </p>
            </div>

            <div className="group p-8 bg-green-50 rounded-lg hover:border border-gray-200 transition-all duration-300 border border-green-100">
              <div className="w-14 h-14 bg-green-600 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-gray-200">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Akuntabilitas
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Bertanggung jawab penuh atas setiap rupiah yang dipercayakan kepada kami untuk disalurkan.
              </p>
            </div>

            <div className="group p-8 bg-purple-50 rounded-lg hover:border border-gray-200 transition-all duration-300 border border-purple-100">
              <div className="w-14 h-14 bg-purple-600 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-gray-200">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Inovasi
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Terus berinovasi menghadirkan solusi terbaik untuk mempermudah penyaluran bantuan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CMS Content */}
      {page?.content && (
        <section className="py-20 px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div
              className="prose prose-lg max-w-none text-gray-700"
              dangerouslySetInnerHTML={{ __html: page.content }}
            />
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-24 px-6 lg:px-8 bg-teal-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,rgba(255,255,255,0.3))]" />

        <div className="max-w-4xl mx-auto text-center relative">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            Mari Bersama Ciptakan
            <br />
            Dampak Nyata
          </h2>
          <p className="text-xl text-orange-50 mb-10 max-w-2xl mx-auto leading-relaxed">
            Bergabunglah dengan ribuan donatur yang telah mempercayai kami untuk menyalurkan kebaikan mereka kepada yang membutuhkan.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/programs"
              className="inline-flex items-center justify-center px-8 py-4 bg-white hover:bg-gray-50 text-teal-600 rounded-xl font-bold text-lg border border-gray-200 hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1"
            >
              Mulai Berdonasi
              <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="/pengusul/register"
              className="inline-flex items-center justify-center px-8 py-4 bg-orange-700/50 hover:bg-teal-600/70 text-white rounded-xl font-semibold text-lg backdrop-blur-sm border-2 border-white/30 hover:border-white/50 transition-all"
            >
              Ajukan Program
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div className="lg:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">S</span>
                </div>
                <span className="text-2xl font-bold">sesama</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Platform donasi terpercaya yang menghubungkan kebaikan Anda dengan mereka yang membutuhkan.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4">Program</h3>
              <ul className="space-y-3">
                <li><Link href="/programs" className="text-gray-400 hover:text-white transition-colors">Semua Program</Link></li>
                <li><Link href="/articles" className="text-gray-400 hover:text-white transition-colors">Laporan Penyaluran</Link></li>
                <li><Link href="/leaderboard" className="text-gray-400 hover:text-white transition-colors">Leaderboard</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4">Perusahaan</h3>
              <ul className="space-y-3">
                <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors">Tentang Kami</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Hubungi Kami</Link></li>
                <li><Link href="/faq" className="text-gray-400 hover:text-white transition-colors">FAQ</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4">Legal</h3>
              <ul className="space-y-3">
                <li><Link href="/terms" className="text-gray-400 hover:text-white transition-colors">Syarat & Ketentuan</Link></li>
                <li><Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">Kebijakan Privasi</Link></li>
                <li><Link href="/legal" className="text-gray-400 hover:text-white transition-colors">Informasi Legal</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-500 text-sm">
              © 2026 sesama. Seluruh hak cipta dilindungi.
            </p>
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Terdaftar & Diawasi OJK
              </span>
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1.5 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                SSL Secure
              </span>
            </div>
          </div>

          {page?.lastEditedBy && (
            <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
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
