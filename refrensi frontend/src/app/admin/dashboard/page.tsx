'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { programsApi, articlesApi, donationsApi, approvalsApi } from '@/lib/api';
import Link from 'next/link';
import {
  Heart,
  DollarSign,
  FileText,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowUpRight,
  Calendar,
} from 'lucide-react';

interface DashboardStats {
  totalPrograms: number;
  activePrograms: number;
  totalDonations: number;
  totalAmount: number;
  pendingApprovals: number;
  recentPrograms: any[];
  recentDonations: any[];
  recentArticles: any[];
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, hasRole } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats>({
    totalPrograms: 0,
    activePrograms: 0,
    totalDonations: 0,
    totalAmount: 0,
    pendingApprovals: 0,
    recentPrograms: [],
    recentDonations: [],
    recentArticles: [],
  });
  const [loading, setLoading] = useState(true);

  // Helper function to check if user has access
  const hasAccess = (roles: string[]) => {
    return roles.includes(user?.role || '');
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    // Redirect FINANCE role to finance dashboard
    if (user?.role === 'FINANCE') {
      router.push('/admin/finance');
      return;
    }

    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch data based on user role
      const promises: Promise<any>[] = [
        programsApi.getAll(undefined, 10, 0),
        articlesApi.getAll(undefined, undefined, undefined, 10, 0),
      ];

      // Only fetch donations and approvals if user has permission
      const hasManagerAccess = user?.role === 'MANAGER' || user?.role === 'SUPER_ADMIN' || user?.role === 'SUPERVISOR';
      if (hasManagerAccess) {
        promises.push(donationsApi.getStats());
        promises.push(approvalsApi.getAll(undefined, 'PENDING', 10, 0));
      }

      const results = await Promise.all(promises);
      const programsRes = results[0];
      const articlesRes = results[1];
      const donationsRes = hasManagerAccess ? results[2] : null;
      const approvalsRes = hasManagerAccess ? results[3] : null;

      setStats({
        totalPrograms: programsRes.data.total || 0,
        activePrograms:
          programsRes.data.data?.filter((p: any) => p.status === 'ACTIVE').length || 0,
        totalDonations: donationsRes?.data.totalCount || 0,
        totalAmount: donationsRes?.data.totalAmount || 0,
        pendingApprovals: approvalsRes?.data.total || 0,
        recentPrograms: programsRes.data.data?.slice(0, 5) || [],
        recentDonations: [],
        recentArticles: articlesRes.data.data?.slice(0, 5) || [],
      });
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-teal-500 to-cyan-600 rounded-lg p-6 text-white animate-fadeIn relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>
        <div className="relative z-10">
          <h1 className="text-2xl font-semibold mb-2 animate-slideInLeft">Welcome back, {user?.name}!</h1>
          <p className="text-orange-100 animate-slideInLeft" style={{ animationDelay: '0.1s' }}>
            Here's what's happening with your platform today.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className={`grid md:grid-cols-2 ${hasAccess(['MANAGER', 'SUPERVISOR', 'SUPER_ADMIN']) ? 'lg:grid-cols-4' : 'lg:grid-cols-2'} gap-6`}>
        <div className="bg-white rounded-lg border border-gray-200 p-6 hover-lift animate-fadeIn animate-stagger-1">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors">
              <Heart className="w-6 h-6 text-teal-600" />
            </div>
            <Link
              href="/admin/programs"
              className="text-teal-600 hover:text-teal-700 transition-transform hover:scale-110"
            >
              <ArrowUpRight className="w-5 h-5" />
            </Link>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {stats.totalPrograms}
          </div>
          <p className="text-sm text-gray-600">Total Programs</p>
          <div className="mt-3 flex items-center text-xs text-green-600">
            <TrendingUp className="w-3 h-3 mr-1 animate-bounce-slow" />
            <span>{stats.activePrograms} active</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 hover-lift animate-fadeIn animate-stagger-2">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <Link
              href="/admin/articles"
              className="text-green-600 hover:text-green-700 transition-transform hover:scale-110"
            >
              <ArrowUpRight className="w-5 h-5" />
            </Link>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {stats.recentArticles.length}
          </div>
          <p className="text-sm text-gray-600">Recent Reports</p>
          <div className="mt-3 text-xs text-gray-500">
            This week
          </div>
        </div>

        {hasAccess(['MANAGER', 'SUPERVISOR', 'SUPER_ADMIN']) && (
          <>
            <div className="bg-white rounded-lg border border-gray-200 p-6 hover-lift animate-fadeIn animate-stagger-3">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center group-hover:bg-cyan-200 transition-colors">
                  <DollarSign className="w-6 h-6 text-cyan-600" />
                </div>
                <Link
                  href="/admin/donations"
                  className="text-cyan-600 hover:text-cyan-700 transition-transform hover:scale-110"
                >
                  <ArrowUpRight className="w-5 h-5" />
                </Link>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1 truncate" title={formatCurrency(stats.totalAmount)}>
                {formatCurrency(stats.totalAmount)}
              </div>
              <p className="text-sm text-gray-600">Total Raised</p>
              <div className="mt-3 text-xs text-gray-500">
                {stats.totalDonations} donations
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6 hover-lift animate-fadeIn animate-stagger-4">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
                <Link
                  href="/admin/approvals"
                  className="text-amber-600 hover:text-amber-700 transition-transform hover:scale-110"
                >
                  <ArrowUpRight className="w-5 h-5" />
                </Link>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {stats.pendingApprovals}
              </div>
              <p className="text-sm text-gray-600">Pending Approvals</p>
              <div className="mt-3 text-xs text-amber-600">
                {stats.pendingApprovals > 0 && <span className="inline-block animate-pulse-slow">●</span>} Needs attention
              </div>
            </div>
          </>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Programs */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 animate-fadeIn animate-stagger-5">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Programs</h2>
            <Link
              href="/admin/programs"
              className="text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors"
            >
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {stats.recentPrograms.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No programs yet</p>
            ) : (
              stats.recentPrograms.map((program: any, index: number) => (
                <Link
                  key={program.id}
                  href={`/admin/programs/${program.id}`}
                  className="flex items-start space-x-3 p-3 rounded-md hover:bg-gray-50 transition-all hover-scale border border-transparent hover:border-teal-100"
                  style={{ animationDelay: `${0.1 * index}s` }}
                >
                  <div className="w-10 h-10 bg-teal-100 rounded-md flex items-center justify-center shrink-0 transition-colors group-hover:bg-orange-200">
                    <Heart className="w-5 h-5 text-teal-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {program.title}
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          program.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-700'
                            : program.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {program.status}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(program.createdAt)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Recent Articles */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 animate-fadeIn animate-stagger-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Reports</h2>
            <Link
              href="/admin/articles"
              className="text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors"
            >
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {stats.recentArticles.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No reports yet</p>
            ) : (
              stats.recentArticles.map((article: any, index: number) => (
                <Link
                  key={article.id}
                  href={`/admin/articles/${article.id}`}
                  className="flex items-start space-x-3 p-3 rounded-md hover:bg-gray-50 transition-all hover-scale border border-transparent hover:border-green-100"
                  style={{ animationDelay: `${0.1 * index}s` }}
                >
                  <div className="w-10 h-10 bg-green-100 rounded-md flex items-center justify-center shrink-0 transition-colors group-hover:bg-green-200">
                    <FileText className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {article.title}
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          article.status === 'PUBLISHED'
                            ? 'bg-green-100 text-green-700'
                            : article.status === 'PENDING_APPROVAL'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {article.status}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(article.createdAt)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 animate-fadeIn">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* New Program - Available to all */}
          <Link
            href="/admin/programs/create"
            className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-teal-500 hover:bg-teal-50 transition-all hover-lift group"
          >
            <Heart className="w-8 h-8 text-gray-400 group-hover:text-teal-600 mb-2 transition-all group-hover:scale-110" />
            <span className="text-sm font-medium text-gray-700 group-hover:text-teal-600 transition-colors">
              New Program
            </span>
          </Link>

          {/* New Report - Available to all */}
          <Link
            href="/admin/articles/create"
            className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-green-500 hover:bg-green-50 transition-all hover-lift group"
          >
            <FileText className="w-8 h-8 text-gray-400 group-hover:text-green-600 mb-2 transition-all group-hover:scale-110" />
            <span className="text-sm font-medium text-gray-700 group-hover:text-green-600 transition-colors">
              New Report
            </span>
          </Link>

          {/* New Article - Content Manager, Manager, Super Admin only */}
          {hasAccess(['CONTENT_MANAGER', 'MANAGER', 'SUPER_ADMIN']) && (
            <Link
              href="/admin/berita/create"
              className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-cyan-50 transition-all hover-lift group"
            >
              <FileText className="w-8 h-8 text-gray-400 group-hover:text-cyan-600 mb-2 transition-all group-hover:scale-110" />
              <span className="text-sm font-medium text-gray-700 group-hover:text-cyan-600 transition-colors">
                New Article
              </span>
            </Link>
          )}

          {/* Approvals - Manager, Super Admin only */}
          {hasAccess(['MANAGER', 'SUPER_ADMIN']) && (
            <Link
              href="/admin/approvals"
              className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-amber-500 hover:bg-amber-50 transition-all hover-lift group"
            >
              <CheckCircle className="w-8 h-8 text-gray-400 group-hover:text-amber-600 mb-2 transition-all group-hover:scale-110" />
              <span className="text-sm font-medium text-gray-700 group-hover:text-amber-600 transition-colors">
                Approvals
              </span>
            </Link>
          )}

          {/* Users - Super Admin only */}
          {hasAccess(['SUPER_ADMIN']) && (
            <Link
              href="/admin/users"
              className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-all hover-lift group"
            >
              <Users className="w-8 h-8 text-gray-400 group-hover:text-purple-600 mb-2 transition-all group-hover:scale-110" />
              <span className="text-sm font-medium text-gray-700 group-hover:text-purple-600 transition-colors">
                Users
              </span>
            </Link>
          )}

          {/* Settings - Super Admin only */}
          {hasAccess(['SUPER_ADMIN']) && (
            <Link
              href="/admin/settings"
              className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-gray-500 hover:bg-gray-50 transition-all hover-lift group"
            >
              <Calendar className="w-8 h-8 text-gray-400 group-hover:text-gray-600 mb-2 transition-all group-hover:scale-110" />
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-600 transition-colors">
                Settings
              </span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
