'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { beritaApi } from '@/lib/api';

const CATEGORIES = [
  { key: 'SEMUA', label: 'Semua' },
  { key: 'POLITIK', label: 'Politik' },
  { key: 'SOSIAL', label: 'Sosial' },
  { key: 'TEKNOLOGI', label: 'Teknologi' },
  { key: 'EKONOMI', label: 'Ekonomi' },
  { key: 'PENDIDIKAN', label: 'Pendidikan' },
  { key: 'KESEHATAN', label: 'Kesehatan' },
  { key: 'OLAHRAGA', label: 'Olahraga' },
  { key: 'HIBURAN', label: 'Hiburan' },
  { key: 'LAINNYA', label: 'Lainnya' },
];

export default function BeritaPage() {
  const [berita, setBerita] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('SEMUA');

  useEffect(() => {
    loadBerita();
  }, [selectedCategory]);

  const loadBerita = async () => {
    setLoading(true);
    try {
      const category = selectedCategory === 'SEMUA' ? undefined : selectedCategory;
      const response = await beritaApi.getAll(category);
      setBerita(response.data || []);
    } catch (error) {
      console.error('Failed to load berita:', error);
      setBerita([]);
    } finally {
      setLoading(false);
    }
  };

  // Placeholder images for berita/news
  const getPlaceholderImage = (index: number) => {
    const images = [
      'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&h=400&fit=crop', // newspaper
      'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=600&h=400&fit=crop', // news
      'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600&h=400&fit=crop', // world
      'https://images.unsplash.com/photo-1586339949216-35c2747cc36d?w=600&h=400&fit=crop', // community
      'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&h=400&fit=crop', // meeting
      'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=600&h=400&fit=crop', // team
    ];
    return images[index % images.length];
  };

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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Berita</h1>
          <p className="text-xl text-gray-600">
            Berita terkini tentang program dan kegiatan kami
          </p>
        </div>

        <div className="mb-8 flex flex-wrap gap-2 justify-center">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === cat.key
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : berita.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-lg">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            <p className="text-gray-600">Belum ada berita</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {berita.map((item, index) => (
              <Link
                key={item.id}
                href={`/berita/${item.slug}`}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 hover:shadow-md transition-all group"
              >
                <div className="aspect-video bg-gray-100 overflow-hidden">
                  <img
                    src={item.coverImageUrl || getPlaceholderImage(index)}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-primary-50 text-primary-700 text-xs font-semibold rounded">
                      {item.category}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(item.publishedAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                    {item.title}
                  </h3>
                  {item.excerpt && (
                    <p className="text-gray-600 text-sm line-clamp-3">{item.excerpt}</p>
                  )}
                  <div className="mt-4 text-sm text-gray-500">
                    <span>Oleh: {item.author?.name || 'Admin'}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
