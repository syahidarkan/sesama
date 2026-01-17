'use client';

import { useEffect, useState } from 'react';
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
  program?: { title: string };
}

export default function PelaporanPage() {
  const [pelaporan, setPelaporan] = useState<Pelaporan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPelaporan();
  }, []);

  const fetchPelaporan = async () => {
    try {
      const response = await pelaporanApi.getAll('PUBLISHED', undefined, undefined, 20, 0);
      setPelaporan(response.data.data || []);
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
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              Kembali
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Pelaporan Program
          </h1>
          <p className="text-xl text-gray-600">
            Transparansi penggunaan dana donasi Anda
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pelaporan.map((item) => (
            <Link
              key={item.id}
              href={`/pelaporan/${item.slug}`}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-gray-300 hover:shadow-md transition-all group"
            >
              {item.coverImageUrl && (
                <div className="aspect-video bg-gray-100 overflow-hidden">
                  <img
                    src={item.coverImageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors line-clamp-2">
                  {item.title}
                </h2>
                {item.excerpt && (
                  <p className="text-gray-600 mb-4 line-clamp-2 text-sm">{item.excerpt}</p>
                )}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{item.author?.name}</span>
                  <span>{formatDate(item.publishedAt || item.createdAt)}</span>
                </div>
                {item.program && (
                  <div className="mt-3 inline-block bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-xs font-semibold">
                    {item.program.title}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>

        {pelaporan.length === 0 && (
          <div className="text-center py-16 bg-gray-50 rounded-xl">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-600">Belum ada pelaporan yang dipublikasikan</p>
          </div>
        )}
      </div>
    </div>
  );
}
