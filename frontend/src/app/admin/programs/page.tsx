'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { programsApi } from '@/lib/api';
import Link from 'next/link';

export default function AdminProgramsPage() {
  const router = useRouter();
  const { user, hasRole } = useAuthStore();
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchPrograms();
  }, [filter]);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const status = filter === 'ALL' ? undefined : filter;
      const response = await programsApi.getAll(status, 100, 0);

      // Filter untuk PENGUSUL - hanya tampilkan program sendiri
      let filteredPrograms = response.data.data || [];
      if (hasRole(['PENGUSUL'])) {
        filteredPrograms = filteredPrograms.filter((p: any) => p.createdBy === user?.id);
      }

      setPrograms(filteredPrograms);
    } catch (error) {
      console.error('Failed to fetch programs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      DRAFT: 'bg-gray-100 text-gray-800',
      PENDING_APPROVAL: 'bg-yellow-100 text-yellow-800',
      ACTIVE: 'bg-orange-100 text-orange-800',
      COMPLETED: 'bg-blue-100 text-blue-800',
      REJECTED: 'bg-red-100 text-red-800',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Kelola Program</h1>
              <p className="text-sm text-gray-600">Daftar semua program donasi</p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/admin/dashboard"
                className="px-4 py-2 text-gray-600 hover:text-gray-700 font-medium"
              >
                ← Dashboard
              </Link>
              {hasRole(['CONTENT_MANAGER', 'SUPER_ADMIN', 'PENGUSUL']) && (
                <Link
                  href="/admin/programs/create"
                  className="px-4 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700 font-semibold"
                >
                  + Buat Program
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filter Tabs */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {['ALL', 'DRAFT', 'PENDING_APPROVAL', 'ACTIVE', 'COMPLETED', 'REJECTED'].map((status) => (
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

        {/* Programs List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat data...</p>
          </div>
        ) : programs.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">📋</div>
            <p className="text-gray-600">Tidak ada program ditemukan</p>
          </div>
        ) : (
          <div className="space-y-4">
            {programs.map((program) => (
              <div key={program.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{program.title}</h3>
                      {getStatusBadge(program.status)}
                    </div>
                    <p className="text-gray-600 mb-4 line-clamp-2">{program.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Target:</span>{' '}
                        <span className="font-semibold text-orange-600">
                          {formatCurrency(program.targetAmount)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Terkumpul:</span>{' '}
                        <span className="font-semibold">
                          {formatCurrency(program.currentAmount || 0)}
                        </span>
                      </div>
                      {program.category && (
                        <div>
                          <span className="text-gray-500">Kategori:</span>{' '}
                          <span className="font-semibold">{program.category}</span>
                        </div>
                      )}
                      {program.creator && (
                        <div>
                          <span className="text-gray-500">Dibuat oleh:</span>{' '}
                          <span className="font-semibold">{program.creator.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="ml-6 flex flex-col gap-2">
                    <Link
                      href={`/programs/${program.slug}`}
                      className="px-4 py-2 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors text-center"
                    >
                      Lihat Detail
                    </Link>
                    {hasRole(['CONTENT_MANAGER', 'SUPER_ADMIN']) && program.status === 'DRAFT' && (
                      <button
                        onClick={async () => {
                          try {
                            await programsApi.submit(program.id);
                            alert('Program berhasil disubmit untuk approval!');
                            fetchPrograms();
                          } catch (err: any) {
                            alert(err.response?.data?.message || 'Gagal submit program');
                          }
                        }}
                        className="px-4 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700 font-semibold transition-colors"
                      >
                        Submit
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
