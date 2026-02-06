'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { articlesApi } from '@/lib/api';
import Link from 'next/link';
import { FileText, Plus, Search, Filter, Clock, CheckCircle, XCircle, Edit3, Trash2, Eye, History, ArrowLeft, Loader2, Send, User, Calendar, Link2 } from 'lucide-react';

export default function ArticlesListPage() {
  const router = useRouter();
  const { user, hasRole } = useAuthStore();
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

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
    const styles: Record<string, { bg: string; text: string; icon: any }> = {
      DRAFT: { bg: 'bg-gray-50 border-gray-200', text: 'text-gray-700', icon: FileText },
      PENDING_APPROVAL: { bg: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-700', icon: Clock },
      PUBLISHED: { bg: 'bg-green-50 border-green-200', text: 'text-green-700', icon: CheckCircle },
      REJECTED: { bg: 'bg-red-50 border-red-200', text: 'text-red-700', icon: XCircle },
    };

    const config = styles[status] || { bg: 'bg-gray-50 border-gray-200', text: 'text-gray-700', icon: FileText };
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs font-medium border ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3" />
        <span>{status.replace('_', ' ')}</span>
      </span>
    );
  };

  const getStats = () => {
    return {
      total: articles.length,
      draft: articles.filter(a => a.status === 'DRAFT').length,
      pending: articles.filter(a => a.status === 'PENDING_APPROVAL').length,
      published: articles.filter(a => a.status === 'PUBLISHED').length,
      rejected: articles.filter(a => a.status === 'REJECTED').length,
    };
  };

  const stats = getStats();

  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <FileText className="w-5 h-5 text-gray-400" />
            <span className="text-2xl font-semibold text-gray-900">{stats.total}</span>
          </div>
          <p className="text-xs text-gray-600">Total Pelaporan</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <FileText className="w-5 h-5 text-gray-400" />
            <span className="text-2xl font-semibold text-gray-900">{stats.draft}</span>
          </div>
          <p className="text-xs text-gray-600">Draft</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-5 h-5 text-gray-400" />
            <span className="text-2xl font-semibold text-gray-900">{stats.pending}</span>
          </div>
          <p className="text-xs text-gray-600">Pending</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-5 h-5 text-gray-400" />
            <span className="text-2xl font-semibold text-gray-900">{stats.published}</span>
          </div>
          <p className="text-xs text-gray-600">Published</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <XCircle className="w-5 h-5 text-gray-400" />
            <span className="text-2xl font-semibold text-gray-900">{stats.rejected}</span>
          </div>
          <p className="text-xs text-gray-600">Ditolak</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari pelaporan berdasarkan judul atau konten..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-300 rounded-md focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors outline-none"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'ALL', label: 'Semua', icon: FileText },
                { value: 'DRAFT', label: 'Draft', icon: FileText },
                { value: 'PENDING_APPROVAL', label: 'Pending', icon: Clock },
                { value: 'PUBLISHED', label: 'Published', icon: CheckCircle },
                { value: 'REJECTED', label: 'Ditolak', icon: XCircle },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.value}
                    onClick={() => setFilter(item.value)}
                    className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      filter === item.value
                        ? 'bg-teal-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-teal-50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Articles List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600 mb-3" />
          <p className="text-sm text-gray-600">Memuat data pelaporan...</p>
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <FileText className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">Tidak ada pelaporan ditemukan</h3>
          <p className="text-sm text-gray-600 mb-6">
            {searchQuery ? 'Coba gunakan kata kunci lain untuk pencarian' : 'Belum ada pelaporan yang sesuai dengan filter yang dipilih'}
          </p>
          {hasRole(['CONTENT_MANAGER', 'PENGUSUL', 'SUPER_ADMIN', 'MANAGER']) && !searchQuery && (
            <Link
              href="/admin/articles/create"
              className="inline-flex items-center space-x-2 px-6 py-2.5 bg-teal-500 text-white rounded-md text-sm font-medium hover:bg-teal-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Pelaporan Pertama</span>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredArticles.map((article) => (
            <div
              key={article.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:border-teal-500 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {article.title}
                    </h3>
                    {getStatusBadge(article.status)}
                  </div>

                  {article.excerpt && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{article.excerpt}</p>
                  )}

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    <div className="flex items-center space-x-2 text-sm">
                      <div className="w-8 h-8 bg-gray-50 rounded-md flex items-center justify-center border border-gray-200">
                        <User className="w-4 h-4 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Penulis</p>
                        <p className="font-medium text-gray-900">{article.author?.name || 'Unknown'}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 text-sm">
                      <div className="w-8 h-8 bg-gray-50 rounded-md flex items-center justify-center border border-gray-200">
                        <Calendar className="w-4 h-4 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Dibuat</p>
                        <p className="font-medium text-gray-900">{new Date(article.createdAt).toLocaleDateString('id-ID')}</p>
                      </div>
                    </div>

                    {article.publishedAt && (
                      <div className="flex items-center space-x-2 text-sm">
                        <div className="w-8 h-8 bg-gray-50 rounded-md flex items-center justify-center border border-gray-200">
                          <CheckCircle className="w-4 h-4 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Published</p>
                          <p className="font-medium text-gray-900">{new Date(article.publishedAt).toLocaleDateString('id-ID')}</p>
                        </div>
                      </div>
                    )}

                    {article.program && (
                      <div className="flex items-center space-x-2 text-sm">
                        <div className="w-8 h-8 bg-gray-50 rounded-md flex items-center justify-center border border-gray-200">
                          <Link2 className="w-4 h-4 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Program</p>
                          <p className="font-medium text-gray-900 line-clamp-1">{article.program.title}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    {/* Submit button */}
                    {article.status === 'DRAFT' && hasRole(['CONTENT_MANAGER', 'PENGUSUL', 'MANAGER']) && (
                      <button
                        onClick={() => handleSubmit(article.id)}
                        className="inline-flex items-center space-x-2 px-4 py-2 rounded-md bg-cyan-600 text-white text-sm font-medium hover:bg-cyan-700 transition-colors"
                      >
                        <Send className="w-4 h-4" />
                        <span>Submit</span>
                      </button>
                    )}

                    {/* View button */}
                    {article.status === 'PUBLISHED' && (
                      <Link
                        href={`/pelaporan/${article.slug}`}
                        className="inline-flex items-center space-x-2 px-4 py-2 rounded-md border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 hover:border-gray-400 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Lihat</span>
                      </Link>
                    )}

                    {/* Edit button */}
                    {(article.status === 'DRAFT' || article.status === 'REJECTED') &&
                      article.authorId === user?.id &&
                      hasRole(['CONTENT_MANAGER', 'PENGUSUL', 'SUPER_ADMIN', 'MANAGER']) && (
                      <Link
                        href={`/admin/articles/${article.id}/edit`}
                        className="inline-flex items-center space-x-2 px-4 py-2 rounded-md border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 hover:border-gray-400 transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                        <span>Edit</span>
                      </Link>
                    )}

                    {/* Delete button */}
                    {article.status === 'DRAFT' &&
                      article.authorId === user?.id &&
                      hasRole(['CONTENT_MANAGER', 'PENGUSUL', 'SUPER_ADMIN', 'MANAGER']) && (
                      <button
                        onClick={() => handleDelete(article.id)}
                        className="inline-flex items-center space-x-2 px-4 py-2 rounded-md border border-red-300 text-red-700 text-sm font-medium hover:bg-red-50 hover:border-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Hapus</span>
                      </button>
                    )}

                    {/* History button */}
                    {hasRole(['MANAGER', 'SUPERVISOR', 'SUPER_ADMIN']) && (
                      <Link
                        href={`/admin/articles/${article.id}/history`}
                        className="inline-flex items-center space-x-2 px-4 py-2 rounded-md border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 hover:border-gray-400 transition-colors"
                      >
                        <History className="w-4 h-4" />
                        <span>History</span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
