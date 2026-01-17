'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { programsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { ArrowLeft, Calendar, Target, TrendingUp, Users } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function ProgramDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const { user } = useAuthStore();

    const { data, isLoading } = useQuery({
        queryKey: ['program', id],
        queryFn: () => programsApi.getOne(id),
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Loading...</div>
            </div>
        );
    }

    const program = data?.data;

    if (!program) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Program not found</p>
            </div>
        );
    }

    const progress = Math.round(
        (parseFloat(program.collectedAmount || '0') / parseFloat(program.targetAmount || '1')) * 100
    );

    const approveMutation = useMutation({
        mutationFn: () => programsApi.approve(id),
        onSuccess: () => {
            alert('Program berhasil disetujui!');
            window.location.reload();
        },
    });

    const rejectMutation = useMutation({
        mutationFn: () => programsApi.reject(id),
        onSuccess: () => {
            alert('Program ditolak.');
            window.location.reload();
        },
    });

    return (
        <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex items-center justify-between">
                <Link
                    href="/dashboard/programs"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Kembali ke Daftar Program
                </Link>

                <div className="flex gap-3">
                    {/* Edit Button - Visible to Creator or Admin Lazismu/IT */}
                    {['ADMIN_LAZISMU', 'ADMIN_IT', 'DEVELOPER'].includes(user?.role || '') && (
                        <Link
                            href={`/dashboard/programs/${id}/edit`}
                            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                        >
                            Edit Program
                        </Link>
                    )}

                    {/* Approval Actions - Visible to Admin Lazismu/IT for Pending Programs */}
                    {program.status === 'PENDING_APPROVAL' &&
                        ['ADMIN_LAZISMU', 'ADMIN_IT', 'DEVELOPER'].includes(user?.role || '') && (
                            <>
                                <button
                                    onClick={() => rejectMutation.mutate()}
                                    disabled={rejectMutation.isPending}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors disabled:opacity-50"
                                >
                                    {rejectMutation.isPending ? 'Memproses...' : 'Tolak'}
                                </button>
                                <button
                                    onClick={() => approveMutation.mutate()}
                                    disabled={approveMutation.isPending}
                                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition-colors disabled:opacity-50"
                                >
                                    {approveMutation.isPending ? 'Memproses...' : 'Setujui'}
                                </button>
                            </>
                        )}
                </div>
            </div>

            {/* Program Header */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                {program.imageUrl && (
                    <img
                        src={program.imageUrl}
                        alt={program.title}
                        className="w-full h-64 object-cover"
                    />
                )}
                <div className="p-8">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{program.title}</h1>
                            <p className="text-gray-600">{program.description}</p>
                        </div>
                        <span
                            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap ${program.status === 'ACTIVE'
                                ? 'bg-emerald-100 text-emerald-700'
                                : program.status === 'PENDING_APPROVAL'
                                    ? 'bg-orange-100 text-orange-700'
                                    : program.status === 'CLOSED'
                                        ? 'bg-gray-100 text-gray-700'
                                        : program.status === 'REJECTED'
                                            ? 'bg-red-100 text-red-700'
                                            : 'bg-blue-100 text-blue-700'
                                }`}
                        >
                            {program.status?.replace(/_/g, ' ')}
                        </span>
                    </div>

                    {/* Progress */}
                    <div className="mb-6">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="font-semibold text-gray-700">Progress Donasi</span>
                            <span className="font-bold text-emerald-600">{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                            <div
                                className="bg-gradient-to-r from-emerald-500 to-blue-500 h-3 rounded-full transition-all"
                                style={{ width: `${Math.min(progress, 100)}%` }}
                            ></div>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="font-bold text-gray-900">
                                Rp {parseInt(program.collectedAmount || '0').toLocaleString('id-ID')}
                            </span>
                            <span className="text-gray-500">
                                dari Rp {parseInt(program.targetAmount || '0').toLocaleString('id-ID')}
                            </span>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-emerald-50 p-4 rounded-lg">
                            <div className="flex items-center gap-3">
                                <Users className="w-8 h-8 text-emerald-600" />
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">
                                        {program._count?.donations || 0}
                                    </div>
                                    <div className="text-sm text-gray-600">Total Donatur</div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="flex items-center gap-3">
                                <Target className="w-8 h-8 text-blue-600" />
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">{progress}%</div>
                                    <div className="text-sm text-gray-600">Tercapai</div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                            <div className="flex items-center gap-3">
                                <Calendar className="w-8 h-8 text-purple-600" />
                                <div>
                                    <div className="text-sm font-semibold text-gray-900">
                                        <span suppressHydrationWarning>{new Date(program.createdAt).toLocaleDateString('id-ID')}</span>
                                    </div>
                                    <div className="text-sm text-gray-600">Tanggal Dibuat</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Creator Info */}
                    <div className="border-t pt-4">
                        <p className="text-sm text-gray-600">
                            Dibuat oleh: <span className="font-semibold">{program.creator?.name}</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Bank Accounts */}
            {program.bankAccounts && Array.isArray(program.bankAccounts) && program.bankAccounts.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Rekening Penerima</h2>
                    <div className="space-y-3">
                        {program.bankAccounts.map((bank: any, idx: number) => (
                            <div key={idx} className="bg-gray-50 p-4 rounded-lg">
                                <div className="font-semibold text-gray-900">{bank.bank_name}</div>
                                <div className="text-gray-600">{bank.account_number}</div>
                                <div className="text-sm text-gray-500">{bank.account_name}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
