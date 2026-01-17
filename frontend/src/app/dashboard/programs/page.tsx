'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { programsApi, approvalsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { Plus, Loader2, Filter } from 'lucide-react';
import Link from 'next/link';

export default function ProgramsPage() {
    const user = useAuthStore((state) => state.user);
    const queryClient = useQueryClient();
    const [statusFilter, setStatusFilter] = useState<string>('');

    const { data: programs, isLoading } = useQuery({
        queryKey: ['programs', statusFilter],
        queryFn: () => programsApi.getAll(statusFilter || undefined).then((res) => res.data),
    });

    const canCreate = ['ADMIN_LAZISMU', 'ADMIN_LEMBAGA_ISLAMI', 'DEVELOPER'].includes(
        user?.role || ''
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Manajemen Program</h1>
                    <p className="text-gray-600">Kelola program donasi Anda</p>
                </div>
                {canCreate && (
                    <Link
                        href="/dashboard/programs/create"
                        className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-emerald-600 to-blue-600 text-white font-semibold hover:from-emerald-700 hover:to-blue-700 transition-all shadow-lg"
                    >
                        <Plus className="w-5 h-5" />
                        Buat Program
                    </Link>
                )}
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                <div className="flex items-center gap-4">
                    <Filter className="w-5 h-5 text-gray-500" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    >
                        <option value="">Semua Status</option>
                        <option value="DRAFT">Draft</option>
                        <option value="PENDING_APPROVAL">Pending Approval</option>
                        <option value="ACTIVE">Aktif</option>
                        <option value="CLOSED">Ditutup</option>
                        <option value="REJECTED">Ditolak</option>
                    </select>
                </div>
            </div>

            {/* Programs Grid */}
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {programs?.map((program: any) => (
                        <Link
                            key={program.id}
                            href={`/dashboard/programs/${program.id}`}
                            className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all overflow-hidden border border-gray-100 hover:border-emerald-200"
                        >
                            {program.imageUrl && (
                                <img
                                    src={program.imageUrl}
                                    alt={program.title}
                                    className="w-full h-48 object-cover"
                                />
                            )}
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-xl font-bold text-gray-900">{program.title}</h3>
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${program.status === 'ACTIVE'
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
                                        {program.status.replace(/_/g, ' ')}
                                    </span>
                                </div>

                                <p className="text-gray-600 mb-4 line-clamp-2">{program.description}</p>

                                {/* Progress */}
                                <div className="mb-4">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-600">Progress</span>
                                        <span className="font-semibold text-emerald-600">
                                            {Math.round(
                                                (parseFloat(program.collectedAmount) /
                                                    parseFloat(program.targetAmount)) *
                                                100
                                            )}
                                            %
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-gradient-to-r from-emerald-500 to-blue-500 h-2 rounded-full"
                                            style={{
                                                width: `${Math.min(
                                                    (parseFloat(program.collectedAmount) /
                                                        parseFloat(program.targetAmount)) *
                                                    100,
                                                    100
                                                )}%`,
                                            }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between text-sm mt-1">
                                        <span className="font-semibold text-gray-900">
                                            Rp {parseInt(program.collectedAmount).toLocaleString('id-ID')}
                                        </span>
                                        <span className="text-gray-500">
                                            dari Rp {parseInt(program.targetAmount).toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between text-sm text-gray-600">
                                    <span>Oleh: {program.creator.name}</span>
                                    <span>{program._count?.donations || 0} donasi</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {programs?.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-600">Belum ada program yang tersedia</p>
                </div>
            )}
        </div>
    );
}
