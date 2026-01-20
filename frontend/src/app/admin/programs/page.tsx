'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { programsApi } from '@/lib/api';
import Link from 'next/link';
import { Heart, Plus, Search, Filter, TrendingUp, Clock, CheckCircle, XCircle, FileText, ArrowLeft, Loader2, Eye } from 'lucide-react';

export default function AdminProgramsPage() {
  const router = useRouter();
  const { user, hasRole } = useAuthStore();
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPrograms();
  }, [filter]);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const status = filter === 'ALL' ? undefined : filter;
      const response = await programsApi.getAll(status, 100, 0);

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
    const styles: Record<string, { bg: string; text: string; icon: any }> = {
      DRAFT: { bg: 'bg-gray-50 border-gray-200', text: 'text-gray-700', icon: FileText },
      PENDING_APPROVAL: { bg: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-700', icon: Clock },
      ACTIVE: { bg: 'bg-green-50 border-green-200', text: 'text-green-700', icon: CheckCircle },
      COMPLETED: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', icon: TrendingUp },
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStats = () => {
    return {
      total: programs.length,
      draft: programs.filter(p => p.status === 'DRAFT').length,
      pending: programs.filter(p => p.status === 'PENDING_APPROVAL').length,
      active: programs.filter(p => p.status === 'ACTIVE').length,
      completed: programs.filter(p => p.status === 'COMPLETED').length,
      rejected: programs.filter(p => p.status === 'REJECTED').length,
    };
  };

  const stats = getStats();

  const filteredPrograms = programs.filter(program =>
    program.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    program.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <Heart className="w-5 h-5 text-gray-400" />
            <span className="text-2xl font-semibold text-gray-900">{stats.total}</span>
          </div>
          <p className="text-xs text-gray-600">Total Program</p>
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
            <span className="text-2xl font-semibold text-gray-900">{stats.active}</span>
          </div>
          <p className="text-xs text-gray-600">Aktif</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-gray-400" />
            <span className="text-2xl font-semibold text-gray-900">{stats.completed}</span>
          </div>
          <p className="text-xs text-gray-600">Selesai</p>
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
              placeholder="Cari program berdasarkan judul atau deskripsi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-300 rounded-md focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors outline-none"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'ALL', label: 'Semua', icon: Heart },
                { value: 'DRAFT', label: 'Draft', icon: FileText },
                { value: 'PENDING_APPROVAL', label: 'Pending', icon: Clock },
                { value: 'ACTIVE', label: 'Aktif', icon: CheckCircle },
                { value: 'COMPLETED', label: 'Selesai', icon: TrendingUp },
                { value: 'REJECTED', label: 'Ditolak', icon: XCircle },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.value}
                    onClick={() => setFilter(item.value)}
                    className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      filter === item.value
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-orange-50'
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

      {/* Programs List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-orange-600 mb-3" />
          <p className="text-sm text-gray-600">Memuat data program...</p>
        </div>
      ) : filteredPrograms.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Heart className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">Tidak ada program ditemukan</h3>
          <p className="text-sm text-gray-600 mb-6">
            {searchQuery ? 'Coba gunakan kata kunci lain untuk pencarian' : 'Belum ada program yang sesuai dengan filter yang dipilih'}
          </p>
          {hasRole(['CONTENT_MANAGER', 'SUPER_ADMIN', 'PENGUSUL', 'MANAGER']) && !searchQuery && (
            <Link
              href="/admin/programs/create"
              className="inline-flex items-center space-x-2 px-6 py-2.5 bg-orange-600 text-white rounded-md text-sm font-medium hover:bg-orange-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Program Baru</span>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredPrograms.map((program) => (
            <div
              key={program.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:border-orange-500 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {program.title}
                    </h3>
                    {getStatusBadge(program.status)}
                  </div>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{program.description}</p>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-600">Progress Donasi</span>
                      <span className="text-xs font-medium text-gray-900">
                        {program.targetAmount > 0
                          ? Math.round(((program.currentAmount || 0) / program.targetAmount) * 100)
                          : 0}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange-600 rounded-full transition-all"
                        style={{
                          width: `${program.targetAmount > 0 ? Math.min(((program.currentAmount || 0) / program.targetAmount) * 100, 100) : 0}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-gray-50 rounded-md p-3 border border-gray-200">
                      <p className="text-xs text-gray-600 mb-1">Target</p>
                      <p className="text-sm font-medium text-gray-900">{formatCurrency(program.targetAmount)}</p>
                    </div>
                    <div className="bg-gray-50 rounded-md p-3 border border-gray-200">
                      <p className="text-xs text-gray-600 mb-1">Terkumpul</p>
                      <p className="text-sm font-medium text-gray-900">{formatCurrency(program.currentAmount || 0)}</p>
                    </div>
                    {program.category && (
                      <div className="bg-gray-50 rounded-md p-3 border border-gray-200">
                        <p className="text-xs text-gray-600 mb-1">Kategori</p>
                        <p className="text-sm font-medium text-gray-900">{program.category}</p>
                      </div>
                    )}
                    {program.creator && (
                      <div className="bg-gray-50 rounded-md p-3 border border-gray-200">
                        <p className="text-xs text-gray-600 mb-1">Pembuat</p>
                        <p className="text-sm font-medium text-gray-900">{program.creator.name}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="ml-6 flex flex-col gap-2 min-w-[140px]">
                  <Link
                    href={`/programs/${program.slug}`}
                    className="inline-flex items-center justify-center space-x-2 px-4 py-2 rounded-md border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 hover:border-gray-400 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Lihat</span>
                  </Link>
                  {hasRole(['CONTENT_MANAGER', 'SUPER_ADMIN', 'MANAGER']) && program.status === 'DRAFT' && (
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
                      className="inline-flex items-center justify-center space-x-2 px-4 py-2 rounded-md bg-orange-600 text-white text-sm font-medium hover:bg-orange-700 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Submit</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
