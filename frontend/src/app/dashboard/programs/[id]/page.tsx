'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { programsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { ArrowLeft, Calendar, Target, TrendingUp, Users, Edit, CheckCircle, XCircle, Loader2, Heart, CreditCard, User, MapPin, Building } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

export default function ProgramDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const { user } = useAuthStore();
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['program', id],
        queryFn: () => programsApi.getOne(id),
    });

    const approveMutation = useMutation({
        mutationFn: () => programsApi.approve(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['program', id] });
            alert('Program berhasil disetujui!');
        },
    });

    const rejectMutation = useMutation({
        mutationFn: () => programsApi.reject(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['program', id] });
            alert('Program ditolak.');
        },
    });

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600 mb-3" />
                <p className="text-sm text-gray-600">Memuat detail program...</p>
            </div>
        );
    }

    const program = data?.data;

    if (!program) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-12">
                <div className="text-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <Heart className="w-6 h-6 text-gray-400" />
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 mb-2">Program Tidak Ditemukan</h3>
                    <p className="text-sm text-gray-600 mb-6">Program yang Anda cari tidak tersedia</p>
                    <Link
                        href="/dashboard/programs"
                        className="inline-flex items-center space-x-2 px-6 py-2.5 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-600 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Kembali ke Daftar Program</span>
                    </Link>
                </div>
            </div>
        );
    }

    const progress = Math.min(
        Math.round((parseFloat(program.collectedAmount || '0') / parseFloat(program.targetAmount || '1')) * 100),
        100
    );

    return (
        <div className="space-y-6">
            {/* Header Navigation */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <Link
                    href="/dashboard/programs"
                    className="inline-flex items-center space-x-2 text-gray-600 hover:text-primary-600 text-sm font-medium transition-colors"
                >
                    <div className="w-8 h-8 rounded-md bg-gray-100 hover:bg-primary-50 flex items-center justify-center transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                    </div>
                    <span>Kembali ke Daftar Program</span>
                </Link>

                <div className="flex gap-3">
                    {['ADMIN_LAZISMU', 'ADMIN_IT', 'DEVELOPER'].includes(user?.role || '') && (
                        <Link
                            href={`/dashboard/programs/${id}/edit`}
                            className="inline-flex items-center space-x-2 px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 hover:border-gray-400 transition-colors"
                        >
                            <Edit className="w-4 h-4" />
                            <span>Edit Program</span>
                        </Link>
                    )}

                    {program.status === 'PENDING_APPROVAL' &&
                        ['ADMIN_LAZISMU', 'ADMIN_IT', 'DEVELOPER'].includes(user?.role || '') && (
                            <>
                                <button
                                    onClick={() => rejectMutation.mutate()}
                                    disabled={rejectMutation.isPending}
                                    className="inline-flex items-center space-x-2 px-6 py-2.5 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                                >
                                    <XCircle className="w-4 h-4" />
                                    <span>{rejectMutation.isPending ? 'Memproses...' : 'Tolak'}</span>
                                </button>
                                <button
                                    onClick={() => approveMutation.mutate()}
                                    disabled={approveMutation.isPending}
                                    className="inline-flex items-center space-x-2 px-6 py-2.5 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                                >
                                    <CheckCircle className="w-4 h-4" />
                                    <span>{approveMutation.isPending ? 'Memproses...' : 'Setujui'}</span>
                                </button>
                            </>
                        )}
                </div>
            </div>

            {/* Main Content */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Left Column - Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Program Header */}
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        {program.imageUrl && (
                            <div className="relative aspect-video overflow-hidden bg-gray-100">
                                <img
                                    src={program.imageUrl}
                                    alt={program.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-4 right-4">
                                    <span
                                        className={`px-3 py-1.5 rounded-md text-xs font-medium ${program.status === 'ACTIVE'
                                            ? 'bg-green-600 text-white'
                                            : program.status === 'PENDING_APPROVAL'
                                                ? 'bg-primary-600 text-white'
                                                : program.status === 'CLOSED'
                                                    ? 'bg-gray-600 text-white'
                                                    : program.status === 'REJECTED'
                                                        ? 'bg-red-600 text-white'
                                                        : 'bg-blue-600 text-white'
                                            }`}
                                    >
                                        {program.status?.replace(/_/g, ' ')}
                                    </span>
                                </div>
                            </div>
                        )}

                        <div className="p-6">
                            <h1 className="text-2xl font-semibold text-gray-900 mb-4">{program.title}</h1>
                            <p className="text-gray-600 leading-relaxed mb-6">{program.description}</p>

                            {/* Progress Section */}
                            <div className="bg-primary-50 rounded-lg p-6 border border-primary-200">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-sm font-medium text-primary-900">Dana Terkumpul</span>
                                    <span className="text-xl font-semibold text-primary-600">{progress}%</span>
                                </div>
                                <div className="w-full h-2 bg-white rounded-full overflow-hidden mb-4 border border-primary-200">
                                    <div
                                        className="h-full bg-primary-600 transition-all duration-200"
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <div className="text-xs text-primary-700 mb-1">Terkumpul</div>
                                        <div className="text-lg font-semibold text-primary-900">
                                            Rp {parseInt(program.collectedAmount || '0').toLocaleString('id-ID')}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-primary-700 mb-1">Target</div>
                                        <div className="text-lg font-semibold text-primary-900">
                                            Rp {parseInt(program.targetAmount || '0').toLocaleString('id-ID')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Additional Info */}
                    {program.location && (
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                <span>Lokasi</span>
                            </h3>
                            <p className="text-sm text-gray-700">{program.location}</p>
                        </div>
                    )}

                    {/* Bank Accounts */}
                    {program.bankAccounts && Array.isArray(program.bankAccounts) && program.bankAccounts.length > 0 && (
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                                <CreditCard className="w-4 h-4 text-gray-400" />
                                <span>Rekening Penerima Dana</span>
                            </h3>
                            <div className="space-y-3">
                                {program.bankAccounts.map((bank: any, idx: number) => (
                                    <div key={idx} className="bg-gray-50 rounded-md p-4 border border-gray-200">
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1">
                                                <div className="font-medium text-gray-900">{bank.bank_name}</div>
                                                <div className="text-sm text-gray-700 font-mono">{bank.account_number}</div>
                                                <div className="text-sm text-gray-600">{bank.account_name}</div>
                                            </div>
                                            <div className="w-10 h-10 bg-gray-200 rounded-md flex items-center justify-center">
                                                <CreditCard className="w-5 h-5 text-gray-500" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column - Stats & Info */}
                <div className="space-y-6">
                    {/* Stats Cards */}
                    <div className="space-y-4">
                        <div className="bg-white rounded-lg p-5 border border-gray-200">
                            <div className="flex items-center justify-between mb-3">
                                <Users className="w-5 h-5 text-gray-400" />
                            </div>
                            <div className="text-3xl font-semibold text-green-600 mb-1">
                                {program._count?.donations || 0}
                            </div>
                            <div className="text-sm text-gray-600">Total Donatur</div>
                        </div>

                        <div className="bg-white rounded-lg p-5 border border-gray-200">
                            <div className="flex items-center justify-between mb-3">
                                <Target className="w-5 h-5 text-gray-400" />
                            </div>
                            <div className="text-3xl font-semibold text-blue-600 mb-1">{progress}%</div>
                            <div className="text-sm text-gray-600">Target Tercapai</div>
                        </div>

                        <div className="bg-white rounded-lg p-5 border border-gray-200">
                            <div className="flex items-center justify-between mb-3">
                                <Calendar className="w-5 h-5 text-gray-400" />
                            </div>
                            <div className="text-base font-semibold text-gray-900 mb-1" suppressHydrationWarning>
                                {new Date(program.createdAt).toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric'
                                })}
                            </div>
                            <div className="text-sm text-gray-600">Tanggal Dibuat</div>
                        </div>
                    </div>

                    {/* Creator Info */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span>Pembuat Program</span>
                        </h3>
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-lg bg-primary-600 flex items-center justify-center text-white font-medium text-lg">
                                {program.creator?.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div className="font-medium text-gray-900">{program.creator?.name}</div>
                                <div className="text-sm text-gray-600">{program.creator?.email}</div>
                                <div className="text-xs text-primary-600 font-medium mt-1">
                                    {program.creator?.role?.replace(/_/g, ' ')}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Category & Type */}
                    {(program.category || program.programType) && (
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                                <Building className="w-4 h-4 text-gray-400" />
                                <span>Informasi Program</span>
                            </h3>
                            <div className="space-y-3">
                                {program.category && (
                                    <div>
                                        <div className="text-xs text-gray-500 mb-1">Kategori</div>
                                        <div className="px-3 py-1.5 bg-primary-50 text-primary-700 border border-primary-200 rounded-md font-medium text-sm inline-block">
                                            {program.category}
                                        </div>
                                    </div>
                                )}
                                {program.programType && (
                                    <div>
                                        <div className="text-xs text-gray-500 mb-1">Tipe Program</div>
                                        <div className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-md font-medium text-sm inline-block">
                                            {program.programType}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
