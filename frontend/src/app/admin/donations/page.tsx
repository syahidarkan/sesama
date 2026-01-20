'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { donationsApi, programsApi } from '@/lib/api';
import Link from 'next/link';
import {
  DollarSign, Heart, ArrowLeft, Loader2, CheckCircle, Clock, XCircle,
  AlertCircle, TrendingUp, Users, Calendar, Filter, Search
} from 'lucide-react';

export default function AdminDonationsPage() {
  const router = useRouter();
  const { user, hasRole } = useAuthStore();
  const [donations, setDonations] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProgram, setSelectedProgram] = useState('ALL');
  const [stats, setStats] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!hasRole(['MANAGER', 'SUPERVISOR', 'SUPER_ADMIN'])) {
      router.push('/admin/dashboard');
      return;
    }
    fetchPrograms();
  }, []);

  useEffect(() => {
    fetchDonations();
    fetchStats();
  }, [selectedProgram]);

  const fetchPrograms = async () => {
    try {
      const response = await programsApi.getAll(undefined, 100, 0);
      setPrograms(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch programs:', error);
    }
  };

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const programId = selectedProgram === 'ALL' ? undefined : selectedProgram;
      const response = await donationsApi.getAll(programId, 100, 0);
      setDonations(response.data || []);
    } catch (error) {
      console.error('Failed to fetch donations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const programId = selectedProgram === 'ALL' ? undefined : selectedProgram;
      const response = await donationsApi.getStats(programId);
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; text: string; icon: any }> = {
      PENDING: { bg: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-700', icon: Clock },
      SUCCESS: { bg: 'bg-green-50 border-green-200', text: 'text-green-700', icon: CheckCircle },
      FAILED: { bg: 'bg-red-50 border-red-200', text: 'text-red-700', icon: XCircle },
      EXPIRED: { bg: 'bg-gray-50 border-gray-200', text: 'text-gray-700', icon: AlertCircle },
    };

    const config = styles[status] || { bg: 'bg-gray-50 border-gray-200', text: 'text-gray-700', icon: AlertCircle };
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs font-medium border ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3" />
        <span>{status}</span>
      </span>
    );
  };

  const filteredDonations = donations.filter(d =>
    d.donorName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.donorEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.program?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="w-8 h-8 animate-spin text-orange-600 mb-3" />
          <p className="text-sm text-gray-600">Memuat data donasi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-6 h-6 text-gray-400" />
              <div className="text-right">
                <p className="text-xs text-gray-600 mb-1">Total Donasi</p>
                <p className="text-2xl font-semibold text-orange-600">{formatCurrency(stats.totalAmount || 0)}</p>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-700">{stats.totalCount || 0} transaksi</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <CheckCircle className="w-6 h-6 text-gray-400" />
              <div className="text-right">
                <p className="text-xs text-gray-600 mb-1">Sukses</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.successCount || 0}</p>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-700">{formatCurrency(stats.successAmount || 0)}</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <Clock className="w-6 h-6 text-gray-400" />
              <div className="text-right">
                <p className="text-xs text-gray-600 mb-1">Pending</p>
                <p className="text-2xl font-semibold text-yellow-600">{stats.pendingCount || 0}</p>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-700">Menunggu pembayaran</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <XCircle className="w-6 h-6 text-gray-400" />
              <div className="text-right">
                <p className="text-xs text-gray-600 mb-1">Gagal/Expired</p>
                <p className="text-2xl font-semibold text-red-600">{(stats.failedCount || 0) + (stats.expiredCount || 0)}</p>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-700">Tidak terselesaikan</p>
          </div>
        </div>
      )}

      {/* Search & Filter */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari donor atau program..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-300 rounded-md focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors outline-none"
            />
          </div>

          {/* Program Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-300 rounded-md focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors outline-none appearance-none bg-white cursor-pointer"
            >
              <option value="ALL">Semua Program</option>
              {programs.map((program) => (
                <option key={program.id} value={program.id}>
                  {program.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Donations Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-orange-600 mb-3" />
          <p className="text-sm text-gray-600">Memuat data donasi...</p>
        </div>
      ) : filteredDonations.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <DollarSign className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">Tidak ada donasi ditemukan</h3>
          <p className="text-sm text-gray-600">
            {searchQuery ? 'Coba gunakan kata kunci lain untuk pencarian' : 'Belum ada donasi untuk filter yang dipilih'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Donor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Program
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Jumlah
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Tanggal
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDonations.map((donation) => (
                  <tr key={donation.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center text-white font-medium">
                          {donation.isAnonymous ? '?' : (donation.donorName?.charAt(0).toUpperCase() || 'D')}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {donation.isAnonymous ? 'Hamba Allah' : donation.donorName}
                          </div>
                          {donation.donorEmail && !donation.isAnonymous && (
                            <div className="text-xs text-gray-500">{donation.donorEmail}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Heart className="w-4 h-4 text-orange-500" fill="currentColor" />
                        <span className="text-sm font-medium text-gray-900 line-clamp-1 max-w-xs">
                          {donation.program?.title || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-orange-600">
                        {formatCurrency(donation.amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(donation.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(donation.createdAt).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}</span>
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
