'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { beritaApi } from '@/lib/api';
import {
  Newspaper, Plus, Search, Filter, Eye, Trash2, ArrowLeft, Loader2,
  Calendar, User, Tag, CheckCircle
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function AdminBeritaPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [berita, setBerita] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');

  const allowedRoles = ['CONTENT_MANAGER', 'MANAGER', 'SUPER_ADMIN'];
  if (!user || !allowedRoles.includes(user.role)) {
    router.push('/admin');
    return null;
  }

  useEffect(() => {
    loadBerita();
  }, []);

  const loadBerita = async () => {
    setLoading(true);
    try {
      const response = await beritaApi.getAllForAdmin();
      setBerita(response.data || []);
    } catch (error) {
      console.error('Failed to load berita:', error);
      setBerita([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus berita ini?')) return;
    try {
      await beritaApi.delete(id);
      loadBerita();
    } catch (error: any) {
      alert('Gagal menghapus: ' + error.response?.data?.message);
    }
  };

  const categories = ['ALL', 'POLITIK', 'SOSIAL', 'TEKNOLOGI', 'EKONOMI', 'PENDIDIKAN', 'KESEHATAN', 'OLAHRAGA', 'HIBURAN', 'LAINNYA'];

  const filteredBerita = berita.filter(item => {
    const matchesSearch = item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'ALL' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const stats = {
    total: berita.length,
    published: berita.filter(b => b.status === 'PUBLISHED').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600 mb-3" />
          <p className="text-sm text-gray-600">Memuat berita...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <Newspaper className="w-6 h-6 text-gray-400" />
            <div className="text-right">
              <p className="text-xs text-gray-600 mb-1">Total Berita</p>
              <p className="text-3xl font-semibold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <CheckCircle className="w-6 h-6 text-gray-400" />
            <div className="text-right">
              <p className="text-xs text-gray-600 mb-1">Published</p>
              <p className="text-3xl font-semibold text-gray-900">{stats.published}</p>
            </div>
          </div>
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
              placeholder="Cari berita berdasarkan judul..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-300 rounded-md focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors outline-none"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setFilterCategory(category)}
                  className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    filterCategory === category
                      ? 'bg-teal-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-teal-50'
                  }`}
                >
                  <Tag className="w-3.5 h-3.5" />
                  <span>{category === 'ALL' ? 'Semua' : category}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Berita List */}
      {filteredBerita.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Newspaper className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">Tidak ada berita ditemukan</h3>
          <p className="text-sm text-gray-600 mb-6">
            {searchQuery ? 'Coba gunakan kata kunci lain untuk pencarian' : 'Belum ada berita yang sesuai dengan filter'}
          </p>
          {!searchQuery && (
            <Link
              href="/admin/berita/create"
              className="inline-flex items-center space-x-2 px-6 py-2.5 bg-teal-500 text-white rounded-md text-sm font-medium hover:bg-teal-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Berita Pertama</span>
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Judul
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Kategori
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Penulis
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBerita.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 line-clamp-2 max-w-md">
                        {item.title}
                      </div>
                      {item.excerpt && (
                        <div className="text-xs text-gray-500 line-clamp-1 mt-1">
                          {item.excerpt}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs font-medium border bg-teal-50 border-teal-200 text-teal-700">
                        <Tag className="w-3 h-3" />
                        <span>{item.category}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2 text-sm text-gray-700">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">{item.author?.name || 'Admin'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs font-medium border bg-green-50 border-green-200 text-green-700">
                        <CheckCircle className="w-3 h-3" />
                        <span>{item.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(item.publishedAt).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          href={`/berita/${item.slug}`}
                          target="_blank"
                          className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-md border border-blue-300 text-cyan-700 text-sm font-medium hover:bg-cyan-50 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Lihat</span>
                        </Link>
                        {(user?.role === 'SUPER_ADMIN' || item.authorId === user?.id) && (
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-md border border-red-300 text-red-700 text-sm font-medium hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Hapus</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
