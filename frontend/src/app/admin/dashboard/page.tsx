'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { programsApi, articlesApi, pengusulApi, donationsApi, approvalsApi } from '@/lib/api';
import { UserRole } from '@/types';
import Link from 'next/link';

interface DashboardStats {
  totalPrograms?: number;
  activePrograms?: number;
  closedPrograms?: number;
  totalDonations?: number;
  totalAmount?: number;
  pendingApprovals?: number;
  pendingPengusul?: number;
  totalArticles?: number;
  publishedArticles?: number;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, hasRole, logout } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    // Check if user has admin or pengusul role
    const adminRoles: UserRole[] = ['MANAGER', 'CONTENT_MANAGER', 'SUPERVISOR', 'SUPER_ADMIN', 'PENGUSUL'];
    if (!hasRole(adminRoles)) {
      router.push('/');
      return;
    }

    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      if (hasRole(['MANAGER', 'SUPERVISOR', 'SUPER_ADMIN'])) {
        // Fetch comprehensive stats for managers and supervisors
        const [programsRes, donationsRes, approvalsRes, pengusulRes, articlesRes] =
          await Promise.all([
            programsApi.getAll(undefined, 1, 0),
            donationsApi.getStats(),
            approvalsApi.getAll(undefined, 'PENDING', 1, 0),
            pengusulApi.getPending(1, 0),
            articlesApi.getAll(undefined, undefined, undefined, 1, 0),
          ]);

        setStats({
          totalPrograms: programsRes.data.total || 0,
          activePrograms:
            programsRes.data.data.filter((p: any) => p.status === 'ACTIVE').length || 0,
          totalDonations: donationsRes.data.totalCount || 0,
          totalAmount: donationsRes.data.totalAmount || 0,
          pendingApprovals: approvalsRes.data.total || 0,
          pendingPengusul: pengusulRes.data.total || 0,
          totalArticles: articlesRes.data.total || 0,
          publishedArticles:
            articlesRes.data.data.filter((a: any) => a.status === 'PUBLISHED').length ||
            0,
        });
      } else if (hasRole(['CONTENT_MANAGER'])) {
        // Fetch only own content stats
        const [programsRes, articlesRes] = await Promise.all([
          programsApi.getAll(undefined, 100, 0),
          articlesApi.getAll(undefined, undefined, user?.id, 100, 0),
        ]);

        setStats({
          totalPrograms: programsRes.data.data.filter(
            (p: any) => p.createdBy === user?.id
          ).length,
          activePrograms: programsRes.data.data.filter(
            (p: any) => p.createdBy === user?.id && p.status === 'ACTIVE'
          ).length,
          totalArticles: articlesRes.data.total || 0,
          publishedArticles:
            articlesRes.data.data.filter((a: any) => a.status === 'PUBLISHED').length ||
            0,
        });
      } else if (hasRole(['PENGUSUL'])) {
        // Fetch only own programs and articles for PENGUSUL
        const [programsRes, articlesRes] = await Promise.all([
          programsApi.getAll(undefined, 100, 0),
          articlesApi.getAll(undefined, undefined, user?.id, 100, 0),
        ]);

        const myPrograms = programsRes.data.data.filter((p: any) => p.createdBy === user?.id);

        setStats({
          totalPrograms: myPrograms.length,
          activePrograms: myPrograms.filter((p: any) => p.status === 'ACTIVE').length,
          closedPrograms: myPrograms.filter((p: any) => p.status === 'CLOSED').length,
          totalArticles: articlesRes.data.total || 0,
          publishedArticles:
            articlesRes.data.data.filter((a: any) => a.status === 'PUBLISHED').length || 0,
        });
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
            <p className="text-sm text-gray-600">
              Selamat datang, {user?.name} ({user?.role})
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-gray-600 hover:text-gray-700 font-medium"
            >
              ← Kembali ke Beranda
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 font-semibold transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Programs Card */}
          {(hasRole(['MANAGER', 'SUPERVISOR', 'SUPER_ADMIN', 'CONTENT_MANAGER', 'PENGUSUL'])) && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-3xl">📋</div>
                <span className="text-sm font-medium text-gray-500">Program</span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {stats.totalPrograms || 0}
              </div>
              <p className="text-sm text-gray-600">
                {stats.activePrograms || 0} aktif
              </p>
            </div>
          )}

          {/* Donations Card */}
          {hasRole(['MANAGER', 'SUPERVISOR', 'SUPER_ADMIN']) && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-3xl">💰</div>
                <span className="text-sm font-medium text-gray-500">Donasi</span>
              </div>
              <div className="text-2xl font-bold text-orange-600 mb-1">
                {formatCurrency(stats.totalAmount || 0)}
              </div>
              <p className="text-sm text-gray-600">
                {stats.totalDonations || 0} transaksi
              </p>
            </div>
          )}

          {/* Articles Card */}
          {(hasRole(['MANAGER', 'SUPERVISOR', 'SUPER_ADMIN', 'CONTENT_MANAGER', 'PENGUSUL'])) && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-3xl">📰</div>
                <span className="text-sm font-medium text-gray-500">Pelaporan</span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {stats.totalArticles || 0}
              </div>
              <p className="text-sm text-gray-600">
                {stats.publishedArticles || 0} dipublikasikan
              </p>
            </div>
          )}

          {/* Pending Approvals Card (MANAGER only) */}
          {hasRole(['MANAGER']) && (
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-orange-200">
              <div className="flex items-center justify-between mb-4">
                <div className="text-3xl">⏳</div>
                <span className="text-sm font-medium text-gray-500">Pending</span>
              </div>
              <div className="text-3xl font-bold text-orange-600 mb-1">
                {(stats.pendingApprovals || 0) + (stats.pendingPengusul || 0)}
              </div>
              <p className="text-sm text-gray-600">Menunggu approval</p>
            </div>
          )}
        </div>

        {/* Quick Actions - MANAGER */}
        {hasRole(['MANAGER']) && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Aksi Cepat</h2>
            <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
              {/* Approval Actions */}
              <Link
                href="/admin/approvals?type=pengusul"
                className="flex items-center justify-between p-4 border-2 border-orange-200 rounded-lg hover:border-orange-600 hover:bg-orange-50 transition"
              >
                <div>
                  <h3 className="font-semibold text-gray-900">Verifikasi Pengusul</h3>
                  <p className="text-sm text-gray-600">
                    {stats.pendingPengusul || 0} pending
                  </p>
                </div>
                <div className="text-2xl">👤</div>
              </Link>

              <Link
                href="/admin/approvals?type=program"
                className="flex items-center justify-between p-4 border-2 border-orange-200 rounded-lg hover:border-orange-600 hover:bg-orange-50 transition"
              >
                <div>
                  <h3 className="font-semibold text-gray-900">Approve Program</h3>
                  <p className="text-sm text-gray-600">Review program baru</p>
                </div>
                <div className="text-2xl">📋</div>
              </Link>

              <Link
                href="/admin/approvals?type=article"
                className="flex items-center justify-between p-4 border-2 border-orange-200 rounded-lg hover:border-orange-600 hover:bg-orange-50 transition"
              >
                <div>
                  <h3 className="font-semibold text-gray-900">Publish Pelaporan</h3>
                  <p className="text-sm text-gray-600">Review pelaporan baru</p>
                </div>
                <div className="text-2xl">📰</div>
              </Link>

              {/* Direct Create Actions (Auto-Publish) */}
              <Link
                href="/admin/programs/create"
                className="flex items-center justify-between p-4 border-2 border-orange-200 rounded-lg hover:border-orange-600 hover:bg-orange-50 transition bg-gradient-to-br from-orange-50 to-orange-100"
              >
                <div>
                  <h3 className="font-semibold text-gray-900">Buat Program</h3>
                  <p className="text-sm text-orange-600">Auto-publish</p>
                </div>
                <div className="text-2xl">➕</div>
              </Link>

              <Link
                href="/admin/articles/create"
                className="flex items-center justify-between p-4 border-2 border-orange-200 rounded-lg hover:border-orange-600 hover:bg-orange-50 transition bg-gradient-to-br from-orange-50 to-orange-100"
              >
                <div>
                  <h3 className="font-semibold text-gray-900">Buat Pelaporan</h3>
                  <p className="text-sm text-orange-600">Auto-publish</p>
                </div>
                <div className="text-2xl">✍️</div>
              </Link>

              <Link
                href="/admin/berita/create"
                className="flex items-center justify-between p-4 border-2 border-orange-200 rounded-lg hover:border-orange-600 hover:bg-orange-50 transition bg-gradient-to-br from-orange-50 to-orange-100"
              >
                <div>
                  <h3 className="font-semibold text-gray-900">Tulis Berita</h3>
                  <p className="text-sm text-orange-600">Auto-publish</p>
                </div>
                <div className="text-2xl">📰</div>
              </Link>
            </div>
          </div>
        )}

        {/* Quick Actions - CONTENT_MANAGER */}
        {hasRole(['CONTENT_MANAGER']) && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Aksi Cepat</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link
                href="/admin/programs/create"
                className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-orange-600 hover:bg-orange-50 transition"
              >
                <div>
                  <h3 className="font-semibold text-gray-900">Buat Program Baru</h3>
                  <p className="text-sm text-gray-600">Tambah program donasi</p>
                </div>
                <div className="text-2xl">➕</div>
              </Link>

              <Link
                href="/admin/articles/create"
                className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-orange-600 hover:bg-orange-50 transition"
              >
                <div>
                  <h3 className="font-semibold text-gray-900">Tulis Pelaporan Baru</h3>
                  <p className="text-sm text-gray-600">Buat laporan penyaluran</p>
                </div>
                <div className="text-2xl">✍️</div>
              </Link>

              <Link
                href="/admin/berita/create"
                className="flex items-center justify-between p-4 border-2 border-orange-200 rounded-lg hover:border-orange-600 hover:bg-orange-50 transition bg-gradient-to-br from-orange-50 to-orange-100"
              >
                <div>
                  <h3 className="font-semibold text-gray-900">Tulis Berita</h3>
                  <p className="text-sm text-gray-600">Publikasi berita/blog</p>
                </div>
                <div className="text-2xl">📰</div>
              </Link>

              <Link
                href="/admin/berita"
                className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-orange-600 hover:bg-orange-50 transition"
              >
                <div>
                  <h3 className="font-semibold text-gray-900">Kelola Berita</h3>
                  <p className="text-sm text-gray-600">Lihat semua berita</p>
                </div>
                <div className="text-2xl">📋</div>
              </Link>
            </div>
          </div>
        )}

        {/* Quick Actions - SUPERVISOR */}
        {hasRole(['SUPERVISOR']) && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Aksi Cepat</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link
                href="/admin/programs"
                className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-orange-600 hover:bg-orange-50 transition"
              >
                <div>
                  <h3 className="font-semibold text-gray-900">Lihat Semua Program</h3>
                  <p className="text-sm text-gray-600">Monitoring program</p>
                </div>
                <div className="text-2xl">📋</div>
              </Link>

              <Link
                href="/admin/articles"
                className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-orange-600 hover:bg-orange-50 transition"
              >
                <div>
                  <h3 className="font-semibold text-gray-900">Lihat Semua Pelaporan</h3>
                  <p className="text-sm text-gray-600">Monitoring pelaporan</p>
                </div>
                <div className="text-2xl">📰</div>
              </Link>

              <Link
                href="/admin/donations"
                className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-orange-600 hover:bg-orange-50 transition"
              >
                <div>
                  <h3 className="font-semibold text-gray-900">Laporan Donasi</h3>
                  <p className="text-sm text-gray-600">Tracking transaksi</p>
                </div>
                <div className="text-2xl">💰</div>
              </Link>

              <Link
                href="/admin/audit-logs"
                className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-orange-600 hover:bg-orange-50 transition"
              >
                <div>
                  <h3 className="font-semibold text-gray-900">Audit Logs</h3>
                  <p className="text-sm text-gray-600">Review aktivitas</p>
                </div>
                <div className="text-2xl">📊</div>
              </Link>
            </div>
          </div>
        )}

        {/* Quick Actions - SUPER_ADMIN */}
        {hasRole(['SUPER_ADMIN']) && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Aksi Cepat - Super Admin</h2>

            {/* Direct Create Actions (Auto-Publish) */}
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Buat Konten (Auto-Publish)</h3>
            <div className="grid md:grid-cols-3 lg:grid-cols-3 gap-4 mb-6">
              <Link
                href="/admin/programs/create"
                className="flex items-center justify-between p-4 border-2 border-orange-200 rounded-lg hover:border-orange-600 hover:bg-orange-50 transition bg-gradient-to-br from-orange-50 to-orange-100"
              >
                <div>
                  <h3 className="font-semibold text-gray-900">Buat Program</h3>
                  <p className="text-sm text-orange-600">Langsung aktif</p>
                </div>
                <div className="text-2xl">➕</div>
              </Link>

              <Link
                href="/admin/articles/create"
                className="flex items-center justify-between p-4 border-2 border-orange-200 rounded-lg hover:border-orange-600 hover:bg-orange-50 transition bg-gradient-to-br from-orange-50 to-orange-100"
              >
                <div>
                  <h3 className="font-semibold text-gray-900">Buat Pelaporan</h3>
                  <p className="text-sm text-orange-600">Langsung publish</p>
                </div>
                <div className="text-2xl">✍️</div>
              </Link>

              <Link
                href="/admin/berita/create"
                className="flex items-center justify-between p-4 border-2 border-orange-200 rounded-lg hover:border-orange-600 hover:bg-orange-50 transition bg-gradient-to-br from-orange-50 to-orange-100"
              >
                <div>
                  <h3 className="font-semibold text-gray-900">Tulis Berita</h3>
                  <p className="text-sm text-orange-600">Langsung publish</p>
                </div>
                <div className="text-2xl">📰</div>
              </Link>
            </div>

            {/* Approval & Management Actions */}
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Approval & Manajemen</h3>
            <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
              <Link
                href="/admin/approvals?type=pengusul"
                className="flex items-center justify-between p-4 border-2 border-orange-200 rounded-lg hover:border-orange-600 hover:bg-orange-50 transition"
              >
                <div>
                  <h3 className="font-semibold text-gray-900">Verifikasi Pengusul</h3>
                  <p className="text-sm text-orange-600">{stats.pendingPengusul || 0} pending</p>
                </div>
                <div className="text-2xl">👤</div>
              </Link>

              <Link
                href="/admin/approvals?type=program"
                className="flex items-center justify-between p-4 border-2 border-orange-200 rounded-lg hover:border-orange-600 hover:bg-orange-50 transition"
              >
                <div>
                  <h3 className="font-semibold text-gray-900">Approve Program</h3>
                  <p className="text-sm text-gray-600">Review program</p>
                </div>
                <div className="text-2xl">📋</div>
              </Link>

              <Link
                href="/admin/approvals?type=article"
                className="flex items-center justify-between p-4 border-2 border-orange-200 rounded-lg hover:border-orange-600 hover:bg-orange-50 transition"
              >
                <div>
                  <h3 className="font-semibold text-gray-900">Publish Pelaporan</h3>
                  <p className="text-sm text-gray-600">Review pelaporan</p>
                </div>
                <div className="text-2xl">📰</div>
              </Link>

              <Link
                href="/admin/programs"
                className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-orange-600 hover:bg-orange-50 transition"
              >
                <div>
                  <h3 className="font-semibold text-gray-900">Semua Program</h3>
                  <p className="text-sm text-gray-600">Kelola program</p>
                </div>
                <div className="text-2xl">📋</div>
              </Link>

              <Link
                href="/admin/articles"
                className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-orange-600 hover:bg-orange-50 transition"
              >
                <div>
                  <h3 className="font-semibold text-gray-900">Semua Pelaporan</h3>
                  <p className="text-sm text-gray-600">Kelola pelaporan</p>
                </div>
                <div className="text-2xl">📄</div>
              </Link>

              <Link
                href="/admin/berita"
                className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-orange-600 hover:bg-orange-50 transition"
              >
                <div>
                  <h3 className="font-semibold text-gray-900">Semua Berita</h3>
                  <p className="text-sm text-gray-600">Kelola berita</p>
                </div>
                <div className="text-2xl">📰</div>
              </Link>
            </div>

            {/* Super Admin Exclusive Actions */}
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Fitur Eksklusif Super Admin</h3>
            <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
              <Link
                href="/admin/users"
                className="flex items-center justify-between p-4 border-2 border-purple-200 rounded-lg hover:border-purple-600 hover:bg-purple-50 transition bg-gradient-to-br from-purple-50 to-pink-50"
              >
                <div>
                  <h3 className="font-semibold text-gray-900">Kelola User</h3>
                  <p className="text-sm text-purple-600">User management</p>
                </div>
                <div className="text-2xl">👥</div>
              </Link>

              <Link
                href="/admin/static-pages"
                className="flex items-center justify-between p-4 border-2 border-purple-200 rounded-lg hover:border-purple-600 hover:bg-purple-50 transition bg-gradient-to-br from-purple-50 to-pink-50"
              >
                <div>
                  <h3 className="font-semibold text-gray-900">Static Pages</h3>
                  <p className="text-sm text-purple-600">About & Legal</p>
                </div>
                <div className="text-2xl">📄</div>
              </Link>

              <Link
                href="/admin/files"
                className="flex items-center justify-between p-4 border-2 border-purple-200 rounded-lg hover:border-purple-600 hover:bg-purple-50 transition bg-gradient-to-br from-purple-50 to-pink-50"
              >
                <div>
                  <h3 className="font-semibold text-gray-900">Kelola File</h3>
                  <p className="text-sm text-purple-600">File management</p>
                </div>
                <div className="text-2xl">📁</div>
              </Link>

              <Link
                href="/admin/settings"
                className="flex items-center justify-between p-4 border-2 border-purple-200 rounded-lg hover:border-purple-600 hover:bg-purple-50 transition bg-gradient-to-br from-purple-50 to-pink-50"
              >
                <div>
                  <h3 className="font-semibold text-gray-900">Pengaturan</h3>
                  <p className="text-sm text-purple-600">System settings</p>
                </div>
                <div className="text-2xl">⚙️</div>
              </Link>

              <Link
                href="/admin/audit-logs"
                className="flex items-center justify-between p-4 border-2 border-purple-200 rounded-lg hover:border-purple-600 hover:bg-purple-50 transition bg-gradient-to-br from-purple-50 to-pink-50"
              >
                <div>
                  <h3 className="font-semibold text-gray-900">Audit Logs</h3>
                  <p className="text-sm text-purple-600">System logs</p>
                </div>
                <div className="text-2xl">📊</div>
              </Link>

              <Link
                href="/admin/donations"
                className="flex items-center justify-between p-4 border-2 border-purple-200 rounded-lg hover:border-purple-600 hover:bg-purple-50 transition bg-gradient-to-br from-purple-50 to-pink-50"
              >
                <div>
                  <h3 className="font-semibold text-gray-900">Laporan Donasi</h3>
                  <p className="text-sm text-purple-600">Semua transaksi</p>
                </div>
                <div className="text-2xl">💰</div>
              </Link>
            </div>
          </div>
        )}

        {/* Quick Actions - PENGUSUL */}
        {hasRole(['PENGUSUL']) && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Aksi Cepat</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Link
                href="/admin/programs/create"
                className="flex items-center justify-between p-4 border-2 border-orange-200 rounded-lg hover:border-orange-600 hover:bg-orange-50 transition bg-gradient-to-br from-orange-50 to-orange-100"
              >
                <div>
                  <h3 className="font-semibold text-gray-900">Ajukan Program Baru</h3>
                  <p className="text-sm text-gray-600">Buat program donasi</p>
                </div>
                <div className="text-3xl">➕</div>
              </Link>

              {stats.closedPrograms && stats.closedPrograms > 0 ? (
                <Link
                  href="/admin/articles/create"
                  className="flex items-center justify-between p-4 border-2 border-orange-200 rounded-lg hover:border-orange-600 hover:bg-orange-50 transition bg-gradient-to-br from-orange-50 to-orange-100"
                >
                  <div>
                    <h3 className="font-semibold text-gray-900">Buat Pelaporan Penyaluran</h3>
                    <p className="text-sm text-gray-600">Laporan pasca donasi</p>
                  </div>
                  <div className="text-3xl">📝</div>
                </Link>
              ) : (
                <div className="flex items-center justify-between p-4 border-2 border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed opacity-60">
                  <div>
                    <h3 className="font-semibold text-gray-700">Buat Pelaporan Penyaluran</h3>
                    <p className="text-xs text-gray-600">
                      ⚠️ Belum ada program yang selesai (CLOSED)
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Selesaikan program terlebih dahulu untuk membuat laporan
                    </p>
                  </div>
                  <div className="text-3xl opacity-40">📝</div>
                </div>
              )}

              <Link
                href="/admin/programs"
                className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-orange-600 hover:bg-orange-50 transition"
              >
                <div>
                  <h3 className="font-semibold text-gray-900">Program Saya</h3>
                  <p className="text-sm text-gray-600">Lihat semua program</p>
                </div>
                <div className="text-2xl">📋</div>
              </Link>

              <Link
                href="/admin/articles"
                className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-orange-600 hover:bg-orange-50 transition"
              >
                <div>
                  <h3 className="font-semibold text-gray-900">Pelaporan Saya</h3>
                  <p className="text-sm text-gray-600">Lihat semua pelaporan</p>
                </div>
                <div className="text-2xl">📰</div>
              </Link>
            </div>
          </div>
        )}

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start">
            <div className="text-2xl mr-4">ℹ️</div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">
                Informasi Role Anda
              </h3>
              {hasRole(['MANAGER']) && (
                <div className="text-sm text-blue-800 space-y-2">
                  <p>
                    Sebagai <strong>Manager</strong>, Anda memiliki kemampuan:
                  </p>
                  <ul className="list-disc list-inside ml-2 space-y-1">
                    <li><strong>Approve/Reject</strong> pengusul, program, dan pelaporan dari role di bawah</li>
                    <li><strong>Auto-Publish</strong>: Program dan pelaporan yang Anda buat langsung AKTIF tanpa perlu approval</li>
                    <li><strong>Berita</strong>: Dapat membuat dan publish berita langsung</li>
                    <li>Melihat semua data program, donasi, dan pelaporan</li>
                  </ul>
                </div>
              )}
              {hasRole(['CONTENT_MANAGER']) && (
                <div className="text-sm text-blue-800 space-y-2">
                  <p>
                    Sebagai <strong>Content Manager</strong>, Anda memiliki kemampuan:
                  </p>
                  <ul className="list-disc list-inside ml-2 space-y-1">
                    <li><strong>Buat Program & Pelaporan</strong>: Memerlukan approval Manager sebelum publish</li>
                    <li><strong>Berita (Auto-Publish)</strong>: Dapat membuat dan publish berita langsung tanpa approval</li>
                    <li>Melihat dan mengelola konten yang Anda buat</li>
                  </ul>
                </div>
              )}
              {hasRole(['SUPERVISOR']) && (
                <div className="text-sm text-blue-800 space-y-2">
                  <p>
                    Sebagai <strong>Supervisor</strong>, Anda memiliki kemampuan:
                  </p>
                  <ul className="list-disc list-inside ml-2 space-y-1">
                    <li><strong>Read-Only Access</strong>: Melihat semua data untuk monitoring dan audit</li>
                    <li>Akses ke laporan donasi dan audit logs</li>
                    <li>Tidak dapat membuat atau mengubah data</li>
                  </ul>
                </div>
              )}
              {hasRole(['SUPER_ADMIN']) && (
                <div className="text-sm text-blue-800 space-y-2">
                  <p>
                    Sebagai <strong>Super Admin</strong>, Anda memiliki akses penuh:
                  </p>
                  <ul className="list-disc list-inside ml-2 space-y-1">
                    <li><strong>Auto-Publish</strong>: Semua konten yang Anda buat langsung aktif tanpa approval</li>
                    <li><strong>Approve/Reject</strong>: Semua approval dari role di bawah</li>
                    <li><strong>User Management</strong>: Membuat, mengubah role, dan menonaktifkan user</li>
                    <li><strong>System Settings</strong>: Mengelola pengaturan sistem, dropdown options, dan form fields</li>
                    <li><strong>Static Pages</strong>: Edit halaman About Us dan Legal</li>
                    <li><strong>Audit Logs</strong>: Melihat semua aktivitas sistem</li>
                  </ul>
                </div>
              )}
              {hasRole(['PENGUSUL']) && (
                <div className="text-sm text-blue-800 space-y-2">
                  <p>
                    Sebagai <strong>Pengusul</strong>, Anda memiliki kemampuan:
                  </p>
                  <ul className="list-disc list-inside ml-2 space-y-1">
                    <li><strong>Ajukan Program</strong>: Buat program donasi (perlu approval Manager)</li>
                    <li><strong>Buat Pelaporan</strong>: Laporan penyaluran dana (perlu approval Manager)</li>
                    <li>Melihat dan mengelola program dan pelaporan Anda sendiri</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
