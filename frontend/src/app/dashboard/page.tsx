'use client';

import { useQuery } from '@tanstack/react-query';
import { programsApi, donationsApi, approvalsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import Link from 'next/link';

export default function DashboardPage() {
    const user = useAuthStore((state) => state.user);

    const { data: programs, isLoading: loadingPrograms } = useQuery({
        queryKey: ['programs'],
        queryFn: () => programsApi.getAll().then((res) => res.data),
    });

    const { data: stats } = useQuery({
        queryKey: ['donations-stats'],
        queryFn: () => donationsApi.getStats().then((res) => res.data),
    });

    const { data: approvals } = useQuery({
        queryKey: ['approvals'],
        queryFn: () => approvalsApi.getAll().then((res) => res.data),
        enabled: user?.role !== 'USER',
    });

    const activePrograms = programs?.filter((p: any) => p.status === 'ACTIVE') || [];
    const pendingApprovals = approvals?.filter((a: any) => a.status === 'PENDING') || [];

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="relative bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 rounded-3xl overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)]"></div>
                <div className="relative px-8 py-12">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4 border border-white/30">
                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-white text-sm font-bold">{user?.role.replace(/_/g, ' ')}</span>
                            </div>
                            <h1 className="text-4xl font-bold text-white mb-3">
                                Selamat Datang, {user?.name}
                            </h1>
                            <p className="text-orange-100 text-lg">
                                Kelola dan pantau seluruh aktivitas donasi dari dashboard ini
                            </p>
                        </div>
                        <div className="hidden lg:block w-32 h-32 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 flex items-center justify-center">
                            <svg className="w-16 h-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Donations */}
                <div className="relative bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-100 to-orange-50 rounded-bl-full opacity-50"></div>
                    <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                        </div>
                        <div className="text-sm text-gray-600 font-semibold mb-2">Total Donasi</div>
                        <div className="text-3xl font-bold text-gray-900 mb-2">
                            {formatCurrency(stats?.totalAmount || 0)}
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                                {stats?.totalDonations || 0} transaksi
                            </span>
                        </div>
                    </div>
                </div>

                {/* Active Programs */}
                <div className="relative bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-blue-50 rounded-bl-full opacity-50"></div>
                    <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            </div>
                        </div>
                        <div className="text-sm text-gray-600 font-semibold mb-2">Program Aktif</div>
                        <div className="text-3xl font-bold text-gray-900 mb-2">
                            {activePrograms.length}
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">
                                dari {programs?.length || 0} total
                            </span>
                        </div>
                    </div>
                </div>

                {/* Total Donors */}
                <div className="relative bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100 to-purple-50 rounded-bl-full opacity-50"></div>
                    <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                        </div>
                        <div className="text-sm text-gray-600 font-semibold mb-2">Total Donatur</div>
                        <div className="text-3xl font-bold text-gray-900 mb-2">
                            {stats?.totalDonations || 0}
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">
                                Kontributor aktif
                            </span>
                        </div>
                    </div>
                </div>

                {/* Pending Approvals */}
                <div className="relative bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-bl-full opacity-50"></div>
                    <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/30">
                                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                        <div className="text-sm text-gray-600 font-semibold mb-2">Persetujuan</div>
                        <div className="text-3xl font-bold text-gray-900 mb-2">
                            {pendingApprovals.length}
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">
                                Menunggu review
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Programs List */}
            <div className="bg-white rounded-3xl border-2 border-gray-100 shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-gray-50 to-white px-8 py-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-1">Program Terbaru</h2>
                            <p className="text-gray-600 text-sm">Program donasi yang sedang berjalan</p>
                        </div>
                        <Link
                            href="/dashboard/programs"
                            className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 transform hover:-translate-y-0.5 transition-all"
                        >
                            <span>Lihat Semua</span>
                            <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </Link>
                    </div>
                </div>

                <div className="p-8">
                    {loadingPrograms ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full mb-4 shadow-lg shadow-orange-500/30 animate-spin">
                                    <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full"></div>
                                </div>
                                <p className="text-gray-600 font-medium">Memuat program...</p>
                            </div>
                        </div>
                    ) : programs && programs.length > 0 ? (
                        <div className="space-y-4">
                            {programs.slice(0, 5).map((program: any) => (
                                <Link
                                    key={program.id}
                                    href={`/dashboard/programs/${program.id}`}
                                    className="block group"
                                >
                                    <div className="p-6 rounded-2xl border-2 border-gray-100 hover:border-orange-200 hover:bg-orange-50/50 transition-all transform hover:-translate-y-1 hover:shadow-lg">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3 mb-3">
                                                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                                                        {program.title}
                                                    </h3>
                                                    <span
                                                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                            program.status === 'ACTIVE'
                                                                ? 'bg-green-100 text-green-700 border border-green-200'
                                                                : program.status === 'PENDING_APPROVAL'
                                                                ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                                                                : 'bg-gray-100 text-gray-700 border border-gray-200'
                                                        }`}
                                                    >
                                                        {program.status.replace(/_/g, ' ')}
                                                    </span>
                                                </div>
                                                <p className="text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                                                    {program.description}
                                                </p>
                                                <div className="flex items-center space-x-6">
                                                    <div>
                                                        <div className="text-sm text-gray-500 mb-1">Terkumpul</div>
                                                        <div className="text-lg font-bold text-orange-600">
                                                            {formatCurrency(parseInt(program.collectedAmount))}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="text-sm text-gray-500 mb-1">Target</div>
                                                        <div className="text-lg font-bold text-gray-900">
                                                            {formatCurrency(parseInt(program.targetAmount))}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="text-sm text-gray-500 mb-1">Progress</div>
                                                        <div className="text-lg font-bold text-blue-600">
                                                            {Math.round((parseInt(program.collectedAmount) / parseInt(program.targetAmount)) * 100)}%
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <svg className="w-6 h-6 text-gray-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all shrink-0 ml-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
                                <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Belum Ada Program</h3>
                            <p className="text-gray-600 mb-6">Mulai buat program donasi pertama Anda</p>
                            <Link
                                href="/dashboard/programs/create"
                                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 transform hover:-translate-y-0.5 transition-all"
                            >
                                Buat Program Baru
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Pending Approvals */}
            {user?.role !== 'USER' && pendingApprovals.length > 0 && (
                <div className="bg-white rounded-3xl border-2 border-yellow-200 shadow-xl overflow-hidden">
                    <div className="bg-gradient-to-r from-yellow-50 to-white px-8 py-6 border-b border-yellow-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-1">Persetujuan Pending</h2>
                                <p className="text-gray-600 text-sm">Item yang membutuhkan persetujuan Anda</p>
                            </div>
                            <Link
                                href="/dashboard/approvals"
                                className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-semibold rounded-xl hover:from-yellow-600 hover:to-yellow-700 shadow-lg shadow-yellow-500/30 hover:shadow-xl hover:shadow-yellow-500/40 transform hover:-translate-y-0.5 transition-all"
                            >
                                <span>Lihat Semua</span>
                                <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </Link>
                        </div>
                    </div>

                    <div className="p-8">
                        <div className="space-y-4">
                            {pendingApprovals.slice(0, 5).map((approval: any) => (
                                <Link
                                    key={approval.id}
                                    href={`/dashboard/approvals`}
                                    className="block group"
                                >
                                    <div className="p-6 rounded-2xl border-2 border-yellow-100 hover:border-yellow-300 hover:bg-yellow-50 transition-all transform hover:-translate-y-1 hover:shadow-lg">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3 mb-3">
                                                    <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                                                        <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                    </div>
                                                    <h3 className="text-lg font-bold text-gray-900">
                                                        {approval.actionType.replace(/_/g, ' ')}
                                                    </h3>
                                                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 border border-yellow-200">
                                                        PENDING
                                                    </span>
                                                </div>
                                                <div className="flex items-center space-x-4 text-sm text-gray-600">
                                                    <div className="flex items-center space-x-2">
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                        </svg>
                                                        <span>{approval.requester.name}</span>
                                                    </div>
                                                    <span className="text-gray-400">•</span>
                                                    <span>{approval.requester.role.replace(/_/g, ' ')}</span>
                                                </div>
                                            </div>
                                            <svg className="w-6 h-6 text-gray-400 group-hover:text-yellow-600 group-hover:translate-x-1 transition-all shrink-0 ml-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
