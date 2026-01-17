'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { donationsApi, programsApi } from '@/lib/api';
import Link from 'next/link';

export default function AdminDonationsPage() {
  const router = useRouter();
  const { user, hasRole } = useAuthStore();
  const [donations, setDonations] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProgram, setSelectedProgram] = useState('ALL');
  const [stats, setStats] = useState<any>(null);

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
    const styles: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      SUCCESS: 'bg-orange-100 text-orange-800',
      FAILED: 'bg-red-100 text-red-800',
      EXPIRED: 'bg-gray-100 text-gray-800',
    };

    return (
      <span className={`px-2 py-1 rounded text-xs font-semibold ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
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
              <h1 className="text-2xl font-bold text-gray-900">Laporan Donasi</h1>
              <p className="text-sm text-gray-600">Tracking semua transaksi donasi</p>
            </div>
            <Link
              href="/admin/dashboard"
              className="text-gray-600 hover:text-gray-700 font-medium"
            >
              ← Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-3xl">💰</div>
                <span className="text-sm font-medium text-gray-500">Total Donasi</span>
              </div>
              <div className="text-2xl font-bold text-orange-600 mb-1">
                {formatCurrency(stats.totalAmount || 0)}
              </div>
              <p className="text-sm text-gray-600">{stats.totalCount || 0} transaksi</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-3xl">✅</div>
                <span className="text-sm font-medium text-gray-500">Sukses</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {stats.successCount || 0}
              </div>
              <p className="text-sm text-gray-600">
                {formatCurrency(stats.successAmount || 0)}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-3xl">⏳</div>
                <span className="text-sm font-medium text-gray-500">Pending</span>
              </div>
              <div className="text-2xl font-bold text-yellow-600 mb-1">
                {stats.pendingCount || 0}
              </div>
              <p className="text-sm text-gray-600">Menunggu pembayaran</p>
            </div>
          </div>
        )}

        {/* Filter */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Filter by Program
          </label>
          <select
            value={selectedProgram}
            onChange={(e) => setSelectedProgram(e.target.value)}
            className="w-full md:w-96 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="ALL">Semua Program</option>
            {programs.map((program) => (
              <option key={program.id} value={program.id}>
                {program.title}
              </option>
            ))}
          </select>
        </div>

        {/* Donations List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat data...</p>
          </div>
        ) : donations.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">💸</div>
            <p className="text-gray-600">Belum ada donasi</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Donor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Program
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Jumlah
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Tanggal
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {donations.map((donation) => (
                  <tr key={donation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {donation.isAnonymous ? 'Hamba Allah' : donation.donorName}
                      </div>
                      {donation.donorEmail && !donation.isAnonymous && (
                        <div className="text-xs text-gray-500">{donation.donorEmail}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {donation.program?.title || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-orange-600">
                        {formatCurrency(donation.amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(donation.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(donation.createdAt).toLocaleDateString('id-ID')}
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
