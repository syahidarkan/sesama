'use client';

import { useQuery } from '@tanstack/react-query';
import { approvalsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function ApprovalsPage() {
    const user = useAuthStore((state) => state.user);

    const { data: approvals, isLoading } = useQuery({
        queryKey: ['approvals'],
        queryFn: () => approvalsApi.getAll().then((res) => res.data),
    });

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Persetujuan</h1>
                <p className="text-gray-600">Kelola persetujuan program dan aksi lainnya</p>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
                </div>
            ) : (
                <div className="space-y-4">
                    {approvals?.map((approval: any) => (
                        <Link
                            key={approval.id}
                            href={`/dashboard/approvals/${approval.id}`}
                            className="block bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all p-6 border border-gray-100 hover:border-emerald-200"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-xl font-bold text-gray-900">
                                            {approval.actionType.replace(/_/g, ' ')}
                                        </h3>
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-semibold ${approval.status === 'PENDING'
                                                    ? 'bg-orange-100 text-orange-700'
                                                    : approval.status === 'APPROVED'
                                                        ? 'bg-emerald-100 text-emerald-700'
                                                        : 'bg-red-100 text-red-700'
                                                }`}
                                        >
                                            {approval.status}
                                        </span>
                                    </div>
                                    <p className="text-gray-600 mb-2">
                                        Diajukan oleh: <span className="font-semibold">{approval.requester.name}</span>{' '}
                                        ({approval.requester.role.replace(/_/g, ' ')})
                                    </p>
                                    {approval.program && (
                                        <p className="text-sm text-gray-500">Program: {approval.program.title}</p>
                                    )}
                                </div>
                            </div>

                            {/* Approval Actions History */}
                            {approval.actions && approval.actions.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Riwayat Aksi:</h4>
                                    <div className="space-y-2">
                                        {approval.actions.map((action: any, idx: number) => (
                                            <div key={idx} className="flex items-center gap-2 text-sm">
                                                {action.action === 'APPROVE' ? (
                                                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                                                ) : (
                                                    <XCircle className="w-4 h-4 text-red-600" />
                                                )}
                                                <span className="text-gray-700">
                                                    {action.approver.name} ({action.approverRole.replace(/_/g, ' ')})
                                                </span>
                                                <span className="text-gray-500">- {action.action}</span>
                                                {action.comment && (
                                                    <span className="text-gray-400 italic">"{action.comment}"</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                                <Clock className="w-4 h-4" />
                                <span>{new Date(approval.createdAt).toLocaleString('id-ID')}</span>
                            </div>
                        </Link>
                    ))}

                    {approvals?.length === 0 && (
                        <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
                            <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-600">Tidak ada persetujuan pending</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
