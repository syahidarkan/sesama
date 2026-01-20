'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { approvalsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { CheckCircle, XCircle, Clock, Loader2, AlertCircle, Filter, FileCheck, FileX, FileClock, User } from 'lucide-react';
import Link from 'next/link';

export default function ApprovalsPage() {
    const user = useAuthStore((state) => state.user);
    const queryClient = useQueryClient();
    const [statusFilter, setStatusFilter] = useState<string>('PENDING');

    const { data: approvals, isLoading } = useQuery({
        queryKey: ['approvals', statusFilter],
        queryFn: () => approvalsApi.getAll(undefined, statusFilter || undefined).then((res) => res.data),
    });

    const allApprovals = useQuery({
        queryKey: ['approvals-all'],
        queryFn: () => approvalsApi.getAll().then((res) => res.data),
    });

    // Normalize approvals data - handle both array and { data: [...] } formats
    const approvalsList = Array.isArray(approvals) ? approvals : (approvals?.data || []);
    const allApprovalsList = Array.isArray(allApprovals.data) ? allApprovals.data : (allApprovals.data?.data || []);

    const stats = {
        pending: allApprovalsList.filter((a: any) => a.status === 'PENDING').length || 0,
        approved: allApprovalsList.filter((a: any) => a.status === 'APPROVED').length || 0,
        rejected: allApprovalsList.filter((a: any) => a.status === 'REJECTED').length || 0,
        total: allApprovalsList.length || 0,
    };

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg p-5 border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                        <FileCheck className="w-5 h-5 text-gray-400" />
                        <div className="text-2xl font-semibold text-gray-900">{stats.total}</div>
                    </div>
                    <div className="text-sm text-gray-600">Total Pengajuan</div>
                </div>

                <div className="bg-white rounded-lg p-5 border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                        <FileClock className="w-5 h-5 text-gray-400" />
                        <div className="text-2xl font-semibold text-orange-600">{stats.pending}</div>
                    </div>
                    <div className="text-sm text-gray-600">Menunggu Approval</div>
                </div>

                <div className="bg-white rounded-lg p-5 border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                        <CheckCircle className="w-5 h-5 text-gray-400" />
                        <div className="text-2xl font-semibold text-green-600">{stats.approved}</div>
                    </div>
                    <div className="text-sm text-gray-600">Disetujui</div>
                </div>

                <div className="bg-white rounded-lg p-5 border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                        <FileX className="w-5 h-5 text-gray-400" />
                        <div className="text-2xl font-semibold text-red-600">{stats.rejected}</div>
                    </div>
                    <div className="text-sm text-gray-600">Ditolak</div>
                </div>
            </div>

            {/* Header & Filter */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-1">Daftar Persetujuan</h2>
                        <p className="text-sm text-gray-600">Kelola dan tinjau semua pengajuan yang memerlukan persetujuan</p>
                    </div>
                </div>

                {/* Filter */}
                <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full md:w-auto pl-9 pr-8 py-2.5 text-sm rounded-md border border-gray-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors outline-none appearance-none bg-white"
                    >
                        <option value="">Semua Status</option>
                        <option value="PENDING">Menunggu Approval</option>
                        <option value="APPROVED">Disetujui</option>
                        <option value="REJECTED">Ditolak</option>
                    </select>
                </div>
            </div>

            {/* Approvals List */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-600 mb-3" />
                    <p className="text-sm text-gray-600">Memuat data persetujuan...</p>
                </div>
            ) : approvalsList && approvalsList.length > 0 ? (
                <div className="space-y-4">
                    {approvalsList.map((approval: any) => (
                        <div
                            key={approval.id}
                            className="bg-white rounded-lg border border-gray-200 hover:border-orange-500 transition-colors overflow-hidden"
                        >
                            <div className="p-6">
                                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                                approval.status === 'PENDING'
                                                    ? 'bg-orange-100'
                                                    : approval.status === 'APPROVED'
                                                    ? 'bg-green-100'
                                                    : 'bg-red-100'
                                            }`}>
                                                {approval.status === 'PENDING' ? (
                                                    <Clock className="w-5 h-5 text-orange-600" />
                                                ) : approval.status === 'APPROVED' ? (
                                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                                ) : (
                                                    <XCircle className="w-5 h-5 text-red-600" />
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="text-base font-semibold text-gray-900">
                                                    {approval.actionType.replace(/_/g, ' ')}
                                                </h3>
                                                <span
                                                    className={`inline-block mt-1 px-2 py-0.5 rounded-md text-xs font-medium ${
                                                        approval.status === 'PENDING'
                                                            ? 'bg-orange-100 text-orange-700 border border-orange-200'
                                                            : approval.status === 'APPROVED'
                                                            ? 'bg-green-100 text-green-700 border border-green-200'
                                                            : 'bg-red-100 text-red-700 border border-red-200'
                                                    }`}
                                                >
                                                    {approval.status === 'PENDING' ? 'Menunggu Persetujuan' : approval.status === 'APPROVED' ? 'Disetujui' : 'Ditolak'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center space-x-2 text-gray-700">
                                                <User className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm">
                                                    Diajukan oleh <span className="font-medium">{approval.requester.name}</span>
                                                </span>
                                                <span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-medium text-gray-600">
                                                    {approval.requester.role.replace(/_/g, ' ')}
                                                </span>
                                            </div>

                                            {approval.program && (
                                                <div className="flex items-start space-x-2 text-gray-600">
                                                    <AlertCircle className="w-4 h-4 text-gray-400 mt-0.5" />
                                                    <div className="text-sm">
                                                        <span className="text-gray-500">Program:</span>{' '}
                                                        <span className="font-medium text-gray-900">{approval.program.title}</span>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex items-center space-x-2 text-gray-500">
                                                <Clock className="w-4 h-4" />
                                                <span className="text-sm">
                                                    {new Date(approval.createdAt).toLocaleDateString('id-ID', {
                                                        weekday: 'long',
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {approval.status === 'PENDING' && (
                                        <div className="flex gap-3">
                                            <Link
                                                href={`/dashboard/approvals/${approval.id}`}
                                                className="px-6 py-2.5 bg-orange-600 text-white rounded-md text-sm font-medium hover:bg-orange-700 transition-colors"
                                            >
                                                Tinjau
                                            </Link>
                                        </div>
                                    )}
                                </div>

                                {/* Approval Actions History */}
                                {approval.actions && approval.actions.length > 0 && (
                                    <div className="mt-6 pt-6 border-t border-gray-200">
                                        <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center space-x-2">
                                            <FileCheck className="w-4 h-4" />
                                            <span>Riwayat Aksi</span>
                                        </h4>
                                        <div className="space-y-3">
                                            {approval.actions.map((action: any, idx: number) => (
                                                <div
                                                    key={idx}
                                                    className={`flex items-start gap-3 p-4 rounded-lg border ${
                                                        action.action === 'APPROVE'
                                                            ? 'bg-green-50 border-green-200'
                                                            : 'bg-red-50 border-red-200'
                                                    }`}
                                                >
                                                    {action.action === 'APPROVE' ? (
                                                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                                    ) : (
                                                        <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                                                    )}
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className={`font-medium ${
                                                                action.action === 'APPROVE' ? 'text-green-900' : 'text-red-900'
                                                            }`}>
                                                                {action.approver.name}
                                                            </span>
                                                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                                                action.action === 'APPROVE'
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : 'bg-red-100 text-red-800'
                                                            }`}>
                                                                {action.approverRole.replace(/_/g, ' ')}
                                                            </span>
                                                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                                                action.action === 'APPROVE'
                                                                    ? 'bg-green-600 text-white'
                                                                    : 'bg-red-600 text-white'
                                                            }`}>
                                                                {action.action === 'APPROVE' ? 'MENYETUJUI' : 'MENOLAK'}
                                                            </span>
                                                        </div>
                                                        {action.comment && (
                                                            <p className={`text-sm italic ${
                                                                action.action === 'APPROVE' ? 'text-green-700' : 'text-red-700'
                                                            }`}>
                                                                "{action.comment}"
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-lg border border-gray-200 p-12">
                    <div className="text-center">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-6 h-6 text-gray-400" />
                        </div>
                        <h3 className="text-base font-semibold text-gray-900 mb-2">Tidak Ada Persetujuan</h3>
                        <p className="text-sm text-gray-600">
                            {statusFilter === 'PENDING'
                                ? 'Tidak ada pengajuan yang menunggu persetujuan'
                                : statusFilter === 'APPROVED'
                                    ? 'Tidak ada pengajuan yang disetujui'
                                    : statusFilter === 'REJECTED'
                                        ? 'Tidak ada pengajuan yang ditolak'
                                        : 'Belum ada pengajuan persetujuan'}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
