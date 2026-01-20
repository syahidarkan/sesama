'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { programsApi, donationsApi, approvalsApi, roleUpgradesApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import Link from 'next/link';
import { TrendingUp, Heart, Users, CheckCircle, ArrowRight, Loader2, UserPlus, Clock, CheckCircle2, XCircle } from 'lucide-react';

export default function DashboardPage() {
    const router = useRouter();
    const user = useAuthStore((state) => state.user);

    // Redirect FINANCE role to finance dashboard
    useEffect(() => {
        if (user?.role === 'FINANCE') {
            router.push('/admin/finance');
        }
    }, [user, router]);

    const { data: programs, isLoading: loadingPrograms } = useQuery({
        queryKey: ['programs'],
        queryFn: () => programsApi.getAll().then((res) => res.data),
    });

    const { data: stats } = useQuery({
        queryKey: ['donations-stats'],
        queryFn: () => donationsApi.getStats().then((res) => res.data),
        enabled: user?.role !== 'USER', // Only fetch for admin roles
    });

    // For USER role: fetch their personal donation history
    const { data: myDonations } = useQuery({
        queryKey: ['my-donations'],
        queryFn: () => donationsApi.getAll().then((res) => res.data),
        enabled: user?.role === 'USER',
    });

    const { data: approvals } = useQuery({
        queryKey: ['approvals'],
        queryFn: () => approvalsApi.getAll().then((res) => res.data),
        enabled: user?.role !== 'USER',
    });

    const { data: upgradeRequest } = useQuery({
        queryKey: ['my-upgrade-request'],
        queryFn: () => roleUpgradesApi.getMyRequest().then((res) => res.data),
        enabled: user?.role === 'USER',
    });

    const programsList = Array.isArray(programs) ? programs : (programs?.data || []);
    const approvalsList = Array.isArray(approvals) ? approvals : (approvals?.data || []);

    const activePrograms = programsList.filter((p: any) => p.status === 'ACTIVE');
    const pendingApprovals = approvalsList.filter((a: any) => a.status === 'PENDING');

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="space-y-6">
            {/* Welcome Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-start justify-between">
                    <div>
                        <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs font-medium bg-orange-50 border border-orange-200 text-orange-700 mb-3">
                            <span>{user?.role.replace(/_/g, ' ')}</span>
                        </span>
                        <h1 className="text-2xl font-semibold text-gray-900 mb-1">
                            Selamat Datang, {user?.name}
                        </h1>
                        <p className="text-sm text-gray-600">
                            Kelola dan pantau seluruh aktivitas donasi dari dashboard ini
                        </p>
                    </div>
                </div>
            </div>

            {/* USER Role: Upgrade to Pengusul Section */}
            {user?.role === 'USER' && (
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200 overflow-hidden">
                    <div className="p-6">
                        {!upgradeRequest ? (
                            // No upgrade request submitted - show CTA
                            <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-4">
                                    <div className="w-14 h-14 bg-orange-600 rounded-xl flex items-center justify-center shrink-0">
                                        <UserPlus className="w-7 h-7 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900 mb-1">
                                            Upgrade ke Pengusul
                                        </h2>
                                        <p className="text-sm text-gray-700 mb-4">
                                            Tingkatkan akun Anda untuk dapat membuat program donasi dan menjangkau lebih banyak donatur
                                        </p>
                                        <ul className="space-y-2 mb-4">
                                            <li className="flex items-start text-sm text-gray-700">
                                                <CheckCircle className="w-4 h-4 text-orange-600 mr-2 mt-0.5 shrink-0" />
                                                <span>Buat program donasi tanpa batas</span>
                                            </li>
                                            <li className="flex items-start text-sm text-gray-700">
                                                <CheckCircle className="w-4 h-4 text-orange-600 mr-2 mt-0.5 shrink-0" />
                                                <span>Akses dashboard pengusul dengan statistik lengkap</span>
                                            </li>
                                            <li className="flex items-start text-sm text-gray-700">
                                                <CheckCircle className="w-4 h-4 text-orange-600 mr-2 mt-0.5 shrink-0" />
                                                <span>Verifikasi akun dengan KTP untuk kepercayaan donatur</span>
                                            </li>
                                        </ul>
                                        <Link
                                            href="/pengusul/register"
                                            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 transition-colors"
                                        >
                                            <UserPlus className="w-4 h-4" />
                                            <span>Mulai Upgrade Sekarang</span>
                                            <ArrowRight className="w-4 h-4" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // Upgrade request submitted - show status
                            <div className="flex items-start space-x-4">
                                <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${
                                    upgradeRequest.status === 'PENDING'
                                        ? 'bg-amber-100'
                                        : upgradeRequest.status === 'APPROVED'
                                        ? 'bg-green-100'
                                        : 'bg-red-100'
                                }`}>
                                    {upgradeRequest.status === 'PENDING' && <Clock className="w-7 h-7 text-amber-600" />}
                                    {upgradeRequest.status === 'APPROVED' && <CheckCircle2 className="w-7 h-7 text-green-600" />}
                                    {upgradeRequest.status === 'REJECTED' && <XCircle className="w-7 h-7 text-red-600" />}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <h2 className="text-lg font-semibold text-gray-900">
                                            Status Upgrade Pengusul
                                        </h2>
                                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${
                                            upgradeRequest.status === 'PENDING'
                                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                                : upgradeRequest.status === 'APPROVED'
                                                ? 'bg-green-50 text-green-700 border-green-200'
                                                : 'bg-red-50 text-red-700 border-red-200'
                                        }`}>
                                            {upgradeRequest.status === 'PENDING' && 'Menunggu Review'}
                                            {upgradeRequest.status === 'APPROVED' && 'Disetujui'}
                                            {upgradeRequest.status === 'REJECTED' && 'Ditolak'}
                                        </span>
                                    </div>
                                    {upgradeRequest.status === 'PENDING' && (
                                        <p className="text-sm text-gray-700 mb-2">
                                            Permintaan upgrade Anda sedang ditinjau oleh tim. Anda akan mendapat notifikasi segera setelah diproses.
                                        </p>
                                    )}
                                    {upgradeRequest.status === 'APPROVED' && (
                                        <p className="text-sm text-gray-700 mb-2">
                                            Selamat! Akun Anda telah di-upgrade menjadi Pengusul. Silakan refresh halaman untuk melihat fitur baru.
                                        </p>
                                    )}
                                    {upgradeRequest.status === 'REJECTED' && (
                                        <div>
                                            <p className="text-sm text-gray-700 mb-2">
                                                Permintaan upgrade Anda ditolak. Alasan: {upgradeRequest.reviewNotes || 'Tidak disebutkan'}
                                            </p>
                                            <Link
                                                href="/pengusul/register"
                                                className="inline-flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 transition-colors"
                                            >
                                                <span>Ajukan Ulang</span>
                                                <ArrowRight className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    )}
                                    <div className="text-xs text-gray-600 mt-2">
                                        Diajukan pada {new Date(upgradeRequest.createdAt).toLocaleDateString('id-ID', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Stats Grid */}
            {user?.role === 'USER' ? (
                // USER Stats - Personal donation stats
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* My Total Donations */}
                    <div className="bg-white rounded-lg border border-gray-200 p-5">
                        <div className="flex items-center justify-between mb-4">
                            <TrendingUp className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="text-sm text-gray-600 mb-1">Total Donasi Saya</div>
                        <div className="text-2xl font-semibold text-gray-900 mb-2">
                            {formatCurrency(
                                myDonations?.reduce((sum: number, d: any) => sum + parseFloat(d.amount || 0), 0) || 0
                            )}
                        </div>
                        <span className="inline-flex px-2 py-0.5 bg-green-50 text-green-700 text-xs font-medium rounded border border-green-200">
                            {myDonations?.length || 0} transaksi
                        </span>
                    </div>

                    {/* Programs I Supported */}
                    <div className="bg-white rounded-lg border border-gray-200 p-5">
                        <div className="flex items-center justify-between mb-4">
                            <Heart className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="text-sm text-gray-600 mb-1">Program yang Dibantu</div>
                        <div className="text-2xl font-semibold text-gray-900 mb-2">
                            {new Set(myDonations?.map((d: any) => d.programId)).size || 0}
                        </div>
                        <span className="text-sm text-gray-500">
                            Program berbeda
                        </span>
                    </div>

                    {/* My Donation Rank */}
                    <div className="bg-white rounded-lg border border-gray-200 p-5">
                        <div className="flex items-center justify-between mb-4">
                            <Users className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="text-sm text-gray-600 mb-1">Riwayat Donasi</div>
                        <div className="text-2xl font-semibold text-gray-900 mb-2">
                            {myDonations?.filter((d: any) => d.status === 'SUCCESS').length || 0}
                        </div>
                        <Link
                            href="/dashboard/donations"
                            className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                        >
                            Lihat semua →
                        </Link>
                    </div>
                </div>
            ) : (
                // Admin Stats - Global platform stats
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Total Donations */}
                    <div className="bg-white rounded-lg border border-gray-200 p-5">
                        <div className="flex items-center justify-between mb-4">
                            <TrendingUp className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="text-sm text-gray-600 mb-1">Total Donasi</div>
                        <div className="text-2xl font-semibold text-gray-900 mb-2">
                            {formatCurrency(stats?.totalAmount || 0)}
                        </div>
                        <span className="inline-flex px-2 py-0.5 bg-green-50 text-green-700 text-xs font-medium rounded border border-green-200">
                            {stats?.totalDonations || 0} transaksi
                        </span>
                    </div>

                    {/* Active Programs */}
                    <div className="bg-white rounded-lg border border-gray-200 p-5">
                        <div className="flex items-center justify-between mb-4">
                            <Heart className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="text-sm text-gray-600 mb-1">Program Aktif</div>
                        <div className="text-2xl font-semibold text-gray-900 mb-2">
                            {activePrograms.length}
                        </div>
                        <span className="text-sm text-gray-500">
                            dari {programsList.length} total
                        </span>
                    </div>

                    {/* Total Donors */}
                    <div className="bg-white rounded-lg border border-gray-200 p-5">
                        <div className="flex items-center justify-between mb-4">
                            <Users className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="text-sm text-gray-600 mb-1">Total Donatur</div>
                        <div className="text-2xl font-semibold text-gray-900 mb-2">
                            {stats?.totalDonations || 0}
                        </div>
                        <span className="text-sm text-gray-500">
                            Kontributor aktif
                        </span>
                    </div>

                    {/* Pending Approvals */}
                    <div className="bg-white rounded-lg border border-gray-200 p-5">
                        <div className="flex items-center justify-between mb-4">
                            <CheckCircle className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="text-sm text-gray-600 mb-1">Persetujuan</div>
                        <div className="text-2xl font-semibold text-gray-900 mb-2">
                            {pendingApprovals.length}
                        </div>
                        <span className="text-sm text-gray-500">
                            Menunggu review
                        </span>
                    </div>
                </div>
            )}

            {/* Programs List */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Program Terbaru</h2>
                            <p className="text-sm text-gray-600 mt-0.5">Program donasi yang sedang berjalan</p>
                        </div>
                        <Link
                            href="/dashboard/programs"
                            className="inline-flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-md hover:bg-orange-700 transition-colors"
                        >
                            <span>Lihat Semua</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>

                <div className="p-6">
                    {loadingPrograms ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-center">
                                <Loader2 className="w-8 h-8 animate-spin text-orange-600 mx-auto mb-3" />
                                <p className="text-sm text-gray-600">Memuat program...</p>
                            </div>
                        </div>
                    ) : programsList && programsList.length > 0 ? (
                        <div className="space-y-3">
                            {programsList.slice(0, 5).map((program: any) => (
                                <Link
                                    key={program.id}
                                    href={`/dashboard/programs/${program.id}`}
                                    className="block group"
                                >
                                    <div className="p-4 rounded-md border border-gray-200 hover:border-orange-300 hover:bg-orange-50/30 transition-colors">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <h3 className="text-sm font-medium text-gray-900 group-hover:text-orange-600 transition-colors truncate">
                                                        {program.title}
                                                    </h3>
                                                    <span
                                                        className={`inline-flex px-2 py-0.5 rounded text-xs font-medium border ${
                                                            program.status === 'ACTIVE'
                                                                ? 'bg-green-50 text-green-700 border-green-200'
                                                                : program.status === 'PENDING_APPROVAL'
                                                                ? 'bg-orange-50 text-orange-700 border-orange-200'
                                                                : 'bg-gray-50 text-gray-700 border-gray-200'
                                                        }`}
                                                    >
                                                        {program.status.replace(/_/g, ' ')}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-3 line-clamp-1">
                                                    {program.description}
                                                </p>
                                                <div className="flex items-center space-x-6 text-sm">
                                                    <div>
                                                        <span className="text-gray-500">Terkumpul: </span>
                                                        <span className="font-medium text-orange-600">
                                                            {formatCurrency(parseInt(program.collectedAmount))}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">Target: </span>
                                                        <span className="font-medium text-gray-900">
                                                            {formatCurrency(parseInt(program.targetAmount))}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">Progress: </span>
                                                        <span className="font-medium text-blue-600">
                                                            {Math.round((parseInt(program.collectedAmount) / parseInt(program.targetAmount)) * 100)}%
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-orange-600 shrink-0 ml-4" />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <Heart className="w-6 h-6 text-gray-400" />
                            </div>
                            <h3 className="text-base font-semibold text-gray-900 mb-1">Belum Ada Program</h3>
                            <p className="text-sm text-gray-600 mb-4">Mulai buat program donasi pertama Anda</p>
                            <Link
                                href="/dashboard/programs/create"
                                className="inline-flex items-center px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-md hover:bg-orange-700 transition-colors"
                            >
                                Buat Program Baru
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Pending Approvals */}
            {user?.role !== 'USER' && pendingApprovals.length > 0 && (
                <div className="bg-white rounded-lg border border-orange-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-orange-200 bg-orange-50">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">Persetujuan Pending</h2>
                                <p className="text-sm text-gray-600 mt-0.5">Item yang membutuhkan persetujuan Anda</p>
                            </div>
                            <Link
                                href="/dashboard/approvals"
                                className="inline-flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-md hover:bg-orange-700 transition-colors"
                            >
                                <span>Lihat Semua</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="space-y-3">
                            {pendingApprovals.slice(0, 5).map((approval: any) => (
                                <Link
                                    key={approval.id}
                                    href={`/dashboard/approvals`}
                                    className="block group"
                                >
                                    <div className="p-4 rounded-md border border-gray-200 hover:border-orange-300 hover:bg-orange-50/30 transition-colors">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3 mb-2">
                                                    <div className="w-8 h-8 bg-orange-100 rounded-md flex items-center justify-center">
                                                        <CheckCircle className="w-4 h-4 text-orange-600" />
                                                    </div>
                                                    <h3 className="text-sm font-medium text-gray-900">
                                                        {approval.actionType.replace(/_/g, ' ')}
                                                    </h3>
                                                    <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">
                                                        PENDING
                                                    </span>
                                                </div>
                                                <div className="flex items-center space-x-3 text-sm text-gray-600 ml-11">
                                                    <span>{approval.requester.name}</span>
                                                    <span className="text-gray-400">·</span>
                                                    <span>{approval.requester.role.replace(/_/g, ' ')}</span>
                                                </div>
                                            </div>
                                            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-orange-600 shrink-0 ml-4" />
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
