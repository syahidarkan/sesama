'use client';

import { useEffect, useState } from 'react';
import { articlesApi } from '@/lib/api';
import { Article } from '@/types';
import Link from 'next/link';

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const response = await articlesApi.getAll('PUBLISHED', undefined, undefined, 20, 0);
      setArticles(response.data.data);
    } catch (error) {
      console.error('Failed to fetch articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const totalArticles = articles.length;
  const featuredArticle = articles[0];
  const remainingArticles = articles.slice(1);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-600 rounded-full mb-4 border border-gray-200 shadow-orange-500/30 animate-spin">
            <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full"></div>
          </div>
          <p className="text-gray-600 font-medium">Memuat laporan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-gray-200/80 backdrop-blur-sm bg-white/95 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-11 h-11 bg-orange-600 rounded-xl flex items-center justify-center border border-gray-200 shadow-orange-500/30 transform group-hover:scale-105 transition-transform">
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
              className="inline-flex items-center px-5 py-2.5 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-gray-300 hover:shadow-md transition-all transform hover:-translate-y-0.5"
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
      <div className="relative bg-orange-600 overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)]"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-5 py-2.5 rounded-full mb-6 border border-white/30">
              <svg className="w-5 h-5 text-orange-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-white font-bold text-sm tracking-wide">Transparansi Penyaluran</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Laporan Penyaluran Dana
            </h1>
            <p className="text-xl text-orange-50 leading-relaxed mb-8">
              Kami berkomitmen untuk transparan dalam setiap penyaluran dana donasi. Pantau bagaimana setiap rupiah Anda memberikan dampak nyata bagi sesama yang membutuhkan.
            </p>
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{totalArticles}+</div>
                  <div className="text-sm text-orange-100">Laporan Terverifikasi</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">100%</div>
                  <div className="text-sm text-orange-100">Transparan & Akuntabel</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Featured Article */}
        {featuredArticle && (
          <div className="mb-20">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Laporan Terbaru</h2>
            </div>
            <Link
              href={`/articles/${featuredArticle.slug}`}
              className="group block bg-white rounded-lg overflow-hidden border border-gray-200 border-2 border-gray-100 hover:border-orange-200 hover:border border-gray-200 transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="grid lg:grid-cols-2 gap-0">
                {featuredArticle.coverImageUrl && (
                  <div className="aspect-[4/3] lg:aspect-auto bg-orange-50 overflow-hidden">
                    <img
                      src={featuredArticle.coverImageUrl}
                      alt={featuredArticle.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}
                <div className="p-10 flex flex-col justify-center">
                  {featuredArticle.program && (
                    <div className="inline-flex items-center space-x-2 bg-orange-50 text-orange-600 px-4 py-2 rounded-full text-sm font-bold mb-4 w-fit border border-orange-200">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      <span>{featuredArticle.program.title}</span>
                    </div>
                  )}
                  <h3 className="text-3xl font-bold text-gray-900 mb-4 group-hover:text-orange-600 transition-colors leading-tight">
                    {featuredArticle.title}
                  </h3>
                  {featuredArticle.excerpt && (
                    <p className="text-lg text-gray-600 mb-6 leading-relaxed line-clamp-3">
                      {featuredArticle.excerpt}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold">
                        {featuredArticle.author?.name?.charAt(0) || 'A'}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{featuredArticle.author?.name}</div>
                        <div className="text-sm text-gray-500">
                          {formatDate(featuredArticle.publishedAt || featuredArticle.createdAt)}
                        </div>
                      </div>
                    </div>
                    <div className="inline-flex items-center text-orange-600 font-bold group-hover:translate-x-2 transition-transform">
                      Baca Selengkapnya
                      <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* All Articles */}
        {remainingArticles.length > 0 && (
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Semua Laporan</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {remainingArticles.map((article) => (
                <Link
                  key={article.id}
                  href={`/articles/${article.slug}`}
                  className="group bg-white rounded-lg overflow-hidden border-2 border-gray-100 hover:border-orange-200 shadow-md hover:border border-gray-200 transition-all duration-300 transform hover:-translate-y-1"
                >
                  {article.coverImageUrl && (
                    <div className="aspect-[16/10] bg-gray-100 overflow-hidden">
                      <img
                        src={article.coverImageUrl}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    {article.program && (
                      <div className="inline-block bg-orange-50 text-orange-600 px-3 py-1.5 rounded-lg text-xs font-bold mb-3 border border-orange-100">
                        {article.program.title}
                      </div>
                    )}
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors line-clamp-2 leading-snug">
                      {article.title}
                    </h3>
                    {article.excerpt && (
                      <p className="text-gray-600 mb-4 line-clamp-2 text-sm leading-relaxed">
                        {article.excerpt}
                      </p>
                    )}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {article.author?.name?.charAt(0) || 'A'}
                        </div>
                        <span className="text-sm font-medium text-gray-700">{article.author?.name}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatDate(article.publishedAt || article.createdAt)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {articles.length === 0 && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Belum Ada Laporan</h3>
            <p className="text-gray-600 mb-6">Laporan penyaluran akan segera hadir</p>
            <Link
              href="/"
              className="inline-flex items-center px-8 py-4 bg-orange-600 text-white font-bold rounded-xl border border-gray-200 shadow-orange-500/30 hover:border border-gray-200 hover:shadow-orange-500/40 transform hover:-translate-y-0.5 transition-all"
            >
              Kembali ke Beranda
            </Link>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-20 relative bg-orange-600 rounded-lg overflow-hidden border border-gray-200">
          <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)]"></div>
          <div className="relative px-8 py-16 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-lg mb-6 border border-white/30">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">
              Percayakan Donasi Anda pada Kami
            </h2>
            <p className="text-xl text-orange-50 mb-8 max-w-2xl mx-auto leading-relaxed">
              Setiap penyaluran dana dilaporkan secara transparan dan terverifikasi. Pantau dampak nyata dari kontribusi Anda.
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-10 py-5 bg-white text-orange-600 font-bold text-lg rounded-xl border border-gray-200 hover:border border-gray-200 transform hover:-translate-y-1 hover:scale-105 transition-all"
            >
              <svg className="w-6 h-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              Mulai Berdonasi Sekarang
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-1">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-11 h-11 bg-orange-600 rounded-xl flex items-center justify-center border border-gray-200">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <span className="text-2xl font-bold text-white">sesama</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Platform donasi terpercaya untuk membantu sesama yang membutuhkan
              </p>
            </div>

            <div>
              <h3 className="font-bold text-white text-lg mb-4">Program</h3>
              <ul className="space-y-3">
                <li><Link href="/" className="hover:text-orange-400 transition-colors">Donasi Aktif</Link></li>
                <li><Link href="/programs" className="hover:text-orange-400 transition-colors">Semua Program</Link></li>
                <li><Link href="/articles" className="hover:text-orange-400 transition-colors">Laporan</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-white text-lg mb-4">Tentang</h3>
              <ul className="space-y-3">
                <li><Link href="/about" className="hover:text-orange-400 transition-colors">Tentang Kami</Link></li>
                <li><Link href="/contact" className="hover:text-orange-400 transition-colors">Kontak</Link></li>
                <li><Link href="/faq" className="hover:text-orange-400 transition-colors">FAQ</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-white text-lg mb-4">Legal</h3>
              <ul className="space-y-3">
                <li><Link href="/privacy" className="hover:text-orange-400 transition-colors">Kebijakan Privasi</Link></li>
                <li><Link href="/terms" className="hover:text-orange-400 transition-colors">Syarat & Ketentuan</Link></li>
                <li><Link href="/legal" className="hover:text-orange-400 transition-colors">Informasi Legal</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between">
            <p className="text-gray-500 text-sm mb-4 md:mb-0">
              © 2024 sesama. Semua hak dilindungi undang-undang.
            </p>
            <div className="flex items-center space-x-6">
              <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
