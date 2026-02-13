'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { articlesApi } from '@/lib/api';
import Link from 'next/link';

export default function ArticleHistoryPage() {
  const router = useRouter();
  const params = useParams();
  const { hasRole } = useAuthStore();
  const [article, setArticle] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const articleId = params.id as string;

      // Fetch article details and history
      const [historyRes] = await Promise.all([
        articlesApi.getHistory(articleId),
      ]);

      setHistory(historyRes.data || []);
    } catch (error: any) {
      console.error('Failed to fetch article history:', error);
      if (error.response?.status === 404) {
        alert('Pelaporan tidak ditemukan');
        router.push('/admin/articles');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Riwayat Edit Pelaporan</h1>
              <p className="text-sm text-gray-600">
                History semua perubahan pada pelaporan
              </p>
            </div>
            <Link
              href="/admin/articles"
              className="text-gray-600 hover:text-gray-700 font-medium shrink-0"
            >
              ← Kembali
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat data...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">📜</div>
            <p className="text-gray-600 mb-4">
              Belum ada riwayat edit untuk pelaporan ini
            </p>
            <Link
              href="/admin/articles"
              className="inline-block px-6 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700 font-semibold transition-colors"
            >
              Kembali ke Daftar Pelaporan
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start">
                <div className="text-2xl mr-4">ℹ️</div>
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">
                    Tentang Riwayat Edit
                  </h3>
                  <p className="text-sm text-blue-800">
                    Halaman ini menampilkan semua perubahan yang pernah dilakukan pada pelaporan.
                    Setiap kali pelaporan diedit, sistem akan menyimpan snapshot dari versi sebelumnya.
                  </p>
                </div>
              </div>
            </div>

            {/* History Timeline */}
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                📜 Timeline Perubahan ({history.length} versi)
              </h2>

              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                <div className="space-y-8">
                  {history.map((item, index) => (
                    <div key={item.id} className="relative pl-16">
                      {/* Timeline Dot */}
                      <div className="absolute left-6 w-5 h-5 rounded-full bg-green-600 border-4 border-white shadow"></div>

                      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-semibold text-gray-500">
                                Versi #{history.length - index}
                              </span>
                              {index === 0 && (
                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                                  Latest
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">
                              📅 {formatDate(item.editedAt)}
                            </p>
                            {item.editedBy && (
                              <p className="text-sm text-gray-600">
                                👤 Diedit oleh: <span className="font-medium">{item.editedBy}</span>
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Content Preview */}
                        <div className="border-t border-gray-200 pt-4">
                          <div className="mb-3">
                            <h4 className="text-sm font-semibold text-gray-700 mb-1">
                              Judul:
                            </h4>
                            <p className="text-gray-900">{item.title}</p>
                          </div>

                          {item.excerpt && (
                            <div className="mb-3">
                              <h4 className="text-sm font-semibold text-gray-700 mb-1">
                                Excerpt:
                              </h4>
                              <p className="text-gray-600 text-sm">{item.excerpt}</p>
                            </div>
                          )}

                          <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-1">
                              Konten:
                            </h4>
                            <div className="text-gray-600 text-sm line-clamp-3 bg-white p-4 rounded border border-gray-200">
                              {item.content}
                            </div>
                          </div>

                          {item.coverImageUrl && (
                            <div className="mt-3">
                              <h4 className="text-sm font-semibold text-gray-700 mb-1">
                                Cover Image:
                              </h4>
                              <a
                                href={item.coverImageUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-700 text-sm"
                              >
                                {item.coverImageUrl}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
