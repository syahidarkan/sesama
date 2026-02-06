'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import { pelaporanApi } from '@/lib/api';
import Link from 'next/link';
import {
  FileText,
  Plus,
  Filter,
  Calendar,
  User,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Edit2,
  Trash2,
  History,
  Send,
  Info,
  FileCheck,
} from 'lucide-react';

export default function PelaporanListPage() {
  const { user, hasRole } = useAuthStore();
  const [pelaporan, setPelaporan] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchPelaporan();
  }, [filter]);

  const fetchPelaporan = async () => {
    try {
      setLoading(true);
      const status = filter === 'ALL' ? undefined : filter;
      const response = await pelaporanApi.getAll(status, undefined, undefined, 100, 0);
      setPelaporan(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch pelaporan:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (id: string) => {
    try {
      await pelaporanApi.submit(id);
      alert('Pelaporan berhasil disubmit untuk approval!');
      fetchPelaporan();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Gagal submit pelaporan');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus pelaporan ini?')) return;

    try {
      await pelaporanApi.delete(id);
      alert('Pelaporan berhasil dihapus!');
      fetchPelaporan();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Gagal menghapus pelaporan');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<
      string,
      { bg: string; text: string; icon: any }
    > = {
      DRAFT: {
        bg: 'bg-gray-100',
        text: 'text-gray-700',
        icon: FileText,
      },
      PENDING_APPROVAL: {
        bg: 'bg-amber-100',
        text: 'text-amber-700',
        icon: Clock,
      },
      PUBLISHED: {
        bg: 'bg-green-100',
        text: 'text-green-700',
        icon: CheckCircle,
      },
      REJECTED: {
        bg: 'bg-red-100',
        text: 'text-red-700',
        icon: XCircle,
      },
    };

    const style = styles[status] || styles.DRAFT;
    const Icon = style.icon;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${style.bg} ${style.text}`}
      >
        <Icon className="w-3 h-3 mr-1" />
        {status.replace('_', ' ')}
      </span>
    );
  };

  const filterOptions = [
    { value: 'ALL', label: 'Semua', count: pelaporan.length },
    { value: 'DRAFT', label: 'Draft' },
    { value: 'PENDING_APPROVAL', label: 'Pending' },
    { value: 'PUBLISHED', label: 'Published' },
    { value: 'REJECTED', label: 'Rejected' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Pelaporan</h1>
          <p className="text-sm text-gray-600 mt-1">
            Kelola laporan penyaluran dan transparansi program
          </p>
        </div>
        {hasRole(['CONTENT_MANAGER', 'PENGUSUL', 'SUPER_ADMIN']) && (
          <Link
            href="/admin/pelaporan/create"
            className="inline-flex items-center px-4 py-2 bg-teal-500 text-white rounded-md text-sm font-medium hover:bg-teal-600 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Buat Pelaporan
          </Link>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  filter === option.value
                    ? 'bg-teal-100 text-teal-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {option.label}
                {option.count !== undefined && ` (${option.count})`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Pelaporan List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm text-gray-600">Memuat data...</p>
          </div>
        </div>
      ) : pelaporan.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileCheck className="w-8 h-8 text-teal-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Tidak ada pelaporan ditemukan
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            {filter === 'ALL'
              ? 'Belum ada pelaporan dibuat. Buat pelaporan pertama Anda.'
              : `Tidak ada pelaporan dengan status ${filter.replace('_', ' ')}.`}
          </p>
          {hasRole(['CONTENT_MANAGER', 'PENGUSUL', 'SUPER_ADMIN']) && filter === 'ALL' && (
            <Link
              href="/admin/pelaporan/create"
              className="inline-flex items-center px-6 py-3 bg-teal-500 text-white rounded-md text-sm font-medium hover:bg-teal-600 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Buat Pelaporan Pertama
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {pelaporan.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:border-teal-300 transition-all duration-200 hover:shadow-sm group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-orange-200 transition-colors">
                      <FileText className="w-5 h-5 text-teal-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {item.title}
                        </h3>
                        {getStatusBadge(item.status)}
                      </div>
                      {item.excerpt && (
                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                          {item.excerpt}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mb-4 ml-13">
                    <div className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5" />
                      <span>{item.author?.name || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(item.createdAt).toLocaleDateString('id-ID')}</span>
                    </div>
                    {item.publishedAt && (
                      <div className="flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>
                          Dipublikasi {new Date(item.publishedAt).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                    )}
                    {item.program && (
                      <div className="flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5" />
                        <span className="truncate max-w-xs">{item.program.title}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 ml-13">
                    {/* Submit button - only for DRAFT */}
                    {item.status === 'DRAFT' && hasRole(['CONTENT_MANAGER', 'PENGUSUL']) && (
                      <button
                        onClick={() => handleSubmit(item.id)}
                        className="inline-flex items-center px-3 py-1.5 bg-cyan-600 text-white rounded-md text-xs font-medium hover:bg-cyan-700 transition-colors"
                      >
                        <Send className="w-3.5 h-3.5 mr-1" />
                        Submit
                      </button>
                    )}

                    {/* View button */}
                    {item.status === 'PUBLISHED' && (
                      <Link
                        href={`/pelaporan/${item.slug}`}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-gray-700 rounded-md text-xs font-medium hover:bg-gray-50 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        Lihat
                      </Link>
                    )}

                    {/* Edit button */}
                    {(item.status === 'DRAFT' || item.status === 'REJECTED') &&
                      item.authorId === user?.id &&
                      hasRole(['CONTENT_MANAGER', 'PENGUSUL', 'SUPER_ADMIN']) && (
                        <Link
                          href={`/admin/pelaporan/${item.id}/edit`}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-gray-700 rounded-md text-xs font-medium hover:bg-gray-50 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5 mr-1" />
                          Edit
                        </Link>
                      )}

                    {/* Delete button */}
                    {item.status === 'DRAFT' &&
                      item.authorId === user?.id &&
                      hasRole(['CONTENT_MANAGER', 'PENGUSUL', 'SUPER_ADMIN']) && (
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="inline-flex items-center px-3 py-1.5 border border-red-300 text-red-700 rounded-md text-xs font-medium hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1" />
                          Hapus
                        </button>
                      )}

                    {/* History button */}
                    {hasRole(['MANAGER', 'SUPERVISOR', 'SUPER_ADMIN']) && (
                      <Link
                        href={`/admin/pelaporan/${item.id}/history`}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-gray-700 rounded-md text-xs font-medium hover:bg-gray-50 transition-colors"
                      >
                        <History className="w-3.5 h-3.5 mr-1" />
                        History
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
      <div className="bg-cyan-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center shrink-0">
            <Info className="w-5 h-5 text-cyan-600" />
          </div>
          <div>
            <h3 className="font-semibold text-cyan-900 mb-1">Tentang Pelaporan</h3>
            <p className="text-sm text-cyan-800">
              Pelaporan digunakan untuk laporan penyaluran dan transparansi program. Semua
              pelaporan harus melalui approval Manager sebelum dipublikasikan. Pelaporan yang
              sudah dipublikasikan akan tampil di halaman publik.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
