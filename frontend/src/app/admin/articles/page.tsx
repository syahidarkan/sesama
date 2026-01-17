'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { articlesApi } from '@/lib/api';
import Link from 'next/link';

export default function ArticlesListPage() {
  const router = useRouter();
  const { user, hasRole } = useAuthStore();
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchArticles();
  }, [filter]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const status = filter === 'ALL' ? undefined : filter;
      const response = await articlesApi.getAll(status, undefined, undefined, 100, 0);
      setArticles(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (id: string) => {
    try {
      await articlesApi.submit(id);
      alert('Pelaporan berhasil disubmit untuk approval!');
      fetchArticles();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Gagal submit pelaporan');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus pelaporan ini?')) return;

    try {
      await articlesApi.delete(id);
      alert('Pelaporan berhasil dihapus!');
      fetchArticles();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Gagal menghapus pelaporan');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      DRAFT: 'bg-gray-100 text-gray-800',
      PENDING_APPROVAL: 'bg-yellow-100 text-yellow-800',
      PUBLISHED: 'bg-orange-100 text-orange-800',
      REJECTED: 'bg-red-100 text-red-800',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Kelola Pelaporan</h1>
              <p className="text-sm text-gray-600">Daftar semua pelaporan penyaluran</p>
            </div>
            <div className="flex items-center gap-4">
              {hasRole(['CONTENT_MANAGER', 'PENGUSUL', 'SUPER_ADMIN']) && (
                <Link
                  href="/admin/articles/create"
                  className="px-4 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700 font-semibold transition-colors"
                >
                  + Pelaporan Baru
                </Link>
              )}
              <Link
                href="/admin/dashboard"
                className="text-gray-600 hover:text-gray-700 font-medium"
              >
                ← Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filter Tabs */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {['ALL', 'DRAFT', 'PENDING_APPROVAL', 'PUBLISHED', 'REJECTED'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === status
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'ALL' ? 'Semua' : status.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Articles List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat data...</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">📰</div>
            <p className="text-gray-600 mb-4">Tidak ada pelaporan ditemukan</p>
            {hasRole(['CONTENT_MANAGER', 'PENGUSUL', 'SUPER_ADMIN']) && (
              <Link
                href="/admin/articles/create"
                className="inline-block px-6 py-3 rounded-lg bg-orange-600 text-white hover:bg-orange-700 font-semibold transition-colors"
              >
                Buat Pelaporan Pertama
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {articles.map((article) => (
              <div
                key={article.id}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{article.title}</h3>
                      {getStatusBadge(article.status)}
                    </div>

                    {article.excerpt && (
                      <p className="text-gray-600 mb-3 line-clamp-2">{article.excerpt}</p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      <div className="flex items-center gap-1">
                        <span>👤</span>
                        <span>{article.author?.name || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>📅</span>
                        <span>{new Date(article.createdAt).toLocaleDateString('id-ID')}</span>
                      </div>
                      {article.publishedAt && (
                        <div className="flex items-center gap-1">
                          <span>✅</span>
                          <span>Published: {new Date(article.publishedAt).toLocaleDateString('id-ID')}</span>
                        </div>
                      )}
                      {article.program && (
                        <div className="flex items-center gap-1">
                          <span>🔗</span>
                          <span>{article.program.title}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Submit button - only for DRAFT articles */}
                      {article.status === 'DRAFT' && hasRole(['CONTENT_MANAGER', 'PENGUSUL']) && (
                        <button
                          onClick={() => handleSubmit(article.id)}
                          className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium text-sm transition-colors"
                        >
                          Submit untuk Approval
                        </button>
                      )}

                      {/* View button */}
                      {article.status === 'PUBLISHED' && (
                        <Link
                          href={`/pelaporan/${article.slug}`}
                          className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium text-sm transition-colors"
                        >
                          Lihat Pelaporan
                        </Link>
                      )}

                      {/* Edit button - only for own articles in DRAFT or REJECTED status */}
                      {(article.status === 'DRAFT' || article.status === 'REJECTED') &&
                        article.authorId === user?.id &&
                        hasRole(['CONTENT_MANAGER', 'PENGUSUL', 'SUPER_ADMIN']) && (
                        <Link
                          href={`/admin/articles/${article.id}/edit`}
                          className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium text-sm transition-colors"
                        >
                          Edit
                        </Link>
                      )}

                      {/* Delete button - only for own articles in DRAFT status */}
                      {article.status === 'DRAFT' &&
                        article.authorId === user?.id &&
                        hasRole(['CONTENT_MANAGER', 'PENGUSUL', 'SUPER_ADMIN']) && (
                        <button
                          onClick={() => handleDelete(article.id)}
                          className="px-4 py-2 rounded-lg border border-red-300 text-red-700 hover:bg-red-50 font-medium text-sm transition-colors"
                        >
                          Hapus
                        </button>
                      )}

                      {/* History button - for managers */}
                      {hasRole(['MANAGER', 'SUPERVISOR', 'SUPER_ADMIN']) && (
                        <Link
                          href={`/admin/articles/${article.id}/history`}
                          className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium text-sm transition-colors"
                        >
                          📜 History
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start">
            <div className="text-2xl mr-4">ℹ️</div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Tentang Pelaporan</h3>
              <p className="text-sm text-blue-800">
                Pelaporan digunakan untuk laporan penyaluran dan konten informatif. Semua pelaporan
                harus melalui approval Manager sebelum dipublikasikan. Pelaporan yang sudah
                dipublikasikan akan tampil di halaman publik.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
