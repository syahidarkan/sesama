'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { beritaApi } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default function AdminBeritaPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [berita, setBerita] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Only CONTENT_MANAGER, MANAGER, SUPER_ADMIN can access
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Kelola Berita</h1>
            <p className="mt-2 text-gray-600">Buat dan kelola berita LAZISMU</p>
          </div>
          <Link
            href="/admin/berita/create"
            className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 font-medium"
          >
            Buat Berita Baru
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Memuat berita...</p>
          </div>
        ) : berita.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 mb-4">Belum ada berita</p>
            <Link
              href="/admin/berita/create"
              className="text-orange-600 hover:underline font-medium"
            >
              Buat berita pertama
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Judul
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kategori
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Penulis
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {berita.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 line-clamp-2">
                        {item.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.author?.name || 'Admin'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800">
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(item.publishedAt).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                      <Link
                        href={`/berita/${item.slug}`}
                        target="_blank"
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Lihat
                      </Link>
                      {(user?.role === 'SUPER_ADMIN' || item.authorId === user?.id) && (
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Hapus
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
