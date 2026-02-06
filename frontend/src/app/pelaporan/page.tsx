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

  // Placeholder images for pelaporan/reports
  const getPlaceholderImage = (index: number) => {
    const images = [
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=400&fit=crop', // documents
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop', // analytics
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop', // charts
      'https://images.unsplash.com/photo-1434626881859-194d67b2b86f?w=600&h=400&fit=crop', // reports
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop', // finance
      'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&h=400&fit=crop', // graphs
    ];
    return images[index % images.length];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
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
          {pelaporan.map((item, index) => (
            <Link
              key={item.id}
              href={`/pelaporan/${item.slug}`}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:border-gray-300 hover:shadow-md transition-all group"
            >
              <div className="aspect-video bg-gray-100 overflow-hidden">
                <img
                  src={item.coverImageUrl || getPlaceholderImage(index)}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
              </div>
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
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
                  <div className="mt-3 inline-block bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-xs font-semibold">
                    {item.program.title}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>

        {pelaporan.length === 0 && (
          <div className="text-center py-16 bg-gray-50 rounded-lg">
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
