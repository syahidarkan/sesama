'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { pelaporanApi } from '@/lib/api';
import Link from 'next/link';

interface Pelaporan {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImageUrl?: string;
  status: string;
  publishedAt?: string;
  createdAt: string;
  author?: { name: string };
  program?: { title: string; slug: string };
}

export default function PelaporanDetailPage() {
  const params = useParams();
  const [pelaporan, setPelaporan] = useState<Pelaporan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.slug) {
      fetchPelaporan(params.slug as string);
    }
  }, [params.slug]);

  const fetchPelaporan = async (slug: string) => {
    try {
      const response = await pelaporanApi.getBySlug(slug);
      setPelaporan(response.data);
    } catch (error) {
      console.error('Failed to fetch pelaporan:', error);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!pelaporan) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Pelaporan Tidak Ditemukan</h2>
          <Link href="/pelaporan" className="text-orange-600 hover:text-orange-700 font-medium">
            Kembali ke Daftar Pelaporan
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
              href="/pelaporan"
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              Kembali
            </Link>
          </div>
        </div>
      </nav>

      <article className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white">
          {pelaporan.coverImageUrl && (
            <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden mb-8">
              <img
                src={pelaporan.coverImageUrl}
                alt={pelaporan.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
            <span>{pelaporan.author?.name}</span>
            <span>•</span>
            <span>{formatDate(pelaporan.publishedAt || pelaporan.createdAt)}</span>
            {pelaporan.program && (
              <>
                <span>•</span>
                <Link
                  href={`/programs/${pelaporan.program.slug}`}
                  className="text-orange-600 hover:text-orange-700 font-medium"
                >
                  {pelaporan.program.title}
                </Link>
              </>
            )}
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
            {pelaporan.title}
          </h1>

          <div
            className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: pelaporan.content.replace(/\n/g, '<br />') }}
          />
        </div>

        {pelaporan.program && (
          <div className="mt-12 bg-orange-50 rounded-xl border border-orange-200 p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Program Terkait</h3>
            <Link
              href={`/programs/${pelaporan.program.slug}`}
              className="text-orange-600 hover:text-orange-700 font-semibold text-lg inline-flex items-center gap-2"
            >
              {pelaporan.program.title}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}
      </article>
    </div>
  );
}
