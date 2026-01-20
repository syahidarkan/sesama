'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { programsApi, approvalsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { Plus, Loader2, Filter, Search, Heart, Calendar, User, TrendingUp, Eye } from 'lucide-react';
import Link from 'next/link';

export default function ProgramsPage() {
    const user = useAuthStore((state) => state.user);
    const queryClient = useQueryClient();
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');

    const { data: programs, isLoading } = useQuery({
        queryKey: ['programs', statusFilter],
        queryFn: () => programsApi.getAll(statusFilter || undefined).then((res) => res.data),
    });

    const canCreate = ['ADMIN_LAZISMU', 'ADMIN_LEMBAGA_ISLAMI', 'DEVELOPER'].includes(
        user?.role || ''
    );

    // Normalize programs data - handle both array and { data: [...] } formats
    const programsList = Array.isArray(programs) ? programs : (programs?.data || []);

    const filteredPrograms = programsList.filter((program: any) =>
        program.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        program.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const stats = {
        total: programsList.length || 0,
        active: programsList.filter((p: any) => p.status === 'ACTIVE').length || 0,
        pending: programsList.filter((p: any) => p.status === 'PENDING_APPROVAL').length || 0,
        draft: programsList.filter((p: any) => p.status === 'DRAFT').length || 0,
    };

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg p-5 border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                        <Heart className="w-5 h-5 text-gray-400" />
                        <div className="text-2xl font-semibold text-gray-900">{stats.total}</div>
                    </div>
                    <div className="text-sm text-gray-600">Total Programs</div>
                </div>

                <div className="bg-white rounded-lg p-5 border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                        <TrendingUp className="w-5 h-5 text-gray-400" />
                        <div className="text-2xl font-semibold text-gray-900">{stats.active}</div>
                    </div>
                    <div className="text-sm text-gray-600">Active</div>
                </div>

                <div className="bg-white rounded-lg p-5 border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <div className="text-2xl font-semibold text-gray-900">{stats.pending}</div>
                    </div>
                    <div className="text-sm text-gray-600">Pending</div>
                </div>

                <div className="bg-white rounded-lg p-5 border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                        <Eye className="w-5 h-5 text-gray-400" />
                        <div className="text-2xl font-semibold text-gray-900">{stats.draft}</div>
                    </div>
                    <div className="text-sm text-gray-600">Draft</div>
                </div>
            </div>

            {/* Header & Actions */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Programs</h2>
                        <p className="text-sm text-gray-600 mt-0.5">Manage and monitor donation programs</p>
                    </div>
                    {canCreate && (
                        <Link
                            href="/dashboard/programs/create"
                            className="inline-flex items-center justify-center space-x-2 px-4 py-2 rounded-md bg-orange-600 text-white text-sm font-medium hover:bg-orange-700 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            <span>New Program</span>
                        </Link>
                    )}
                </div>

                {/* Search & Filter */}
                <div className="mt-6 grid md:grid-cols-2 gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search programs..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-gray-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors outline-none"
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-gray-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors outline-none appearance-none bg-white"
                        >
                            <option value="">All Status</option>
                            <option value="DRAFT">Draft</option>
                            <option value="PENDING_APPROVAL">Pending</option>
                            <option value="ACTIVE">Active</option>
                            <option value="CLOSED">Closed</option>
                            <option value="REJECTED">Rejected</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Programs Grid */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-400 mb-3" />
                    <p className="text-sm text-gray-600">Loading programs...</p>
                </div>
            ) : filteredPrograms && filteredPrograms.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredPrograms.map((program: any) => {
                        const progress = Math.min(
                            (parseFloat(program.collectedAmount) / parseFloat(program.targetAmount)) * 100,
                            100
                        );

                        return (
                            <Link
                                key={program.id}
                                href={`/dashboard/programs/${program.id}`}
                                className="group bg-white rounded-lg border border-gray-200 hover:border-orange-500 transition-colors overflow-hidden"
                            >
                                {program.imageUrl && (
                                    <div className="relative aspect-video overflow-hidden bg-gray-100">
                                        <img
                                            src={program.imageUrl}
                                            alt={program.title}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute top-3 right-3">
                                            <span
                                                className={`px-2 py-1 rounded text-xs font-medium ${program.status === 'ACTIVE'
                                                    ? 'bg-green-100 text-green-800'
                                                    : program.status === 'PENDING_APPROVAL'
                                                        ? 'bg-orange-100 text-orange-800'
                                                        : program.status === 'CLOSED'
                                                            ? 'bg-gray-100 text-gray-800'
                                                            : program.status === 'REJECTED'
                                                                ? 'bg-red-100 text-red-800'
                                                                : 'bg-blue-100 text-blue-800'
                                                    }`}
                                            >
                                                {program.status.replace(/_/g, ' ')}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <div className="p-5">
                                    <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2">
                                        {program.title}
                                    </h3>

                                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                        {program.description}
                                    </p>

                                    {/* Progress Bar */}
                                    <div className="mb-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs text-gray-500">Progress</span>
                                            <span className="text-xs font-medium text-gray-900">
                                                {Math.round(progress)}%
                                            </span>
                                        </div>
                                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-orange-600 rounded-full transition-all"
                                                style={{ width: `${progress}%` }}
                                            ></div>
                                        </div>
                                        <div className="flex justify-between items-center mt-2">
                                            <span className="text-sm font-medium text-gray-900">
                                                Rp {parseInt(program.collectedAmount).toLocaleString('id-ID')}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                of Rp {parseInt(program.targetAmount).toLocaleString('id-ID')}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Footer Info */}
                                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                        <div className="flex items-center space-x-2 text-gray-600">
                                            <User className="w-4 h-4" />
                                            <span className="text-xs">{program.creator.name}</span>
                                        </div>
                                        <div className="flex items-center space-x-1.5 text-gray-600">
                                            <Heart className="w-4 h-4" />
                                            <span className="text-xs">{program._count?.donations || 0} donations</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            ) : (
                <div className="bg-white rounded-lg border border-gray-200 p-12">
                    <div className="text-center">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                            <Heart className="w-6 h-6 text-gray-400" />
                        </div>
                        <h3 className="text-base font-semibold text-gray-900 mb-1">
                            {searchQuery ? 'No programs found' : 'No programs yet'}
                        </h3>
                        <p className="text-sm text-gray-600 mb-6">
                            {searchQuery
                                ? 'Try adjusting your search query'
                                : 'Create your first donation program'}
                        </p>
                        {canCreate && !searchQuery && (
                            <Link
                                href="/dashboard/programs/create"
                                className="inline-flex items-center space-x-2 px-4 py-2 rounded-md bg-orange-600 text-white text-sm font-medium hover:bg-orange-700 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                <span>New Program</span>
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
