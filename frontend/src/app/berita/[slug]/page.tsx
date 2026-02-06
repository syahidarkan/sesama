'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { beritaApi } from '@/lib/api';

export default function BeritaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [berita, setBerita] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (slug) {
      loadBerita();
    }
  }, [slug]);

  const loadBerita = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await beritaApi.getBySlug(slug);
      setBerita(response.data);
    } catch (error: any) {
      console.error('Failed to load berita:', error);
      setError('Berita tidak ditemukan');
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

  if (error || !berita) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4 text-lg">{error}</p>
          <Link href="/berita" className="text-primary-600 hover:text-primary-700 font-medium">
            Kembali ke Berita
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              sesama
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

      <article className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-primary-50 text-primary-700 text-sm font-semibold rounded-full">
              {berita.category}
            </span>
            <span className="text-sm text-gray-500">
              {new Date(berita.publishedAt).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">{berita.title}</h1>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Oleh: {berita.author?.name || 'Admin'}</span>
          </div>
        </div>

        {berita.coverImageUrl && (
          <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-8">
            <img
              src={berita.coverImageUrl}
              alt={berita.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {berita.excerpt && (
          <div className="bg-gray-50 border-l-4 border-primary-600 p-4 mb-8 rounded">
            <p className="text-lg text-gray-700 italic">{berita.excerpt}</p>
          </div>
        )}

        <div
          className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: berita.content }}
        />

        <div className="mt-12 pt-6 border-t border-gray-200">
          <Link
            href="/berita"
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Lihat Berita Lainnya
          </Link>
        </div>
      </article>
    </div>
  );
}
