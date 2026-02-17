'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { usersApi } from '@/lib/api';
import { Users, Mail, Shield, CheckCircle, XCircle, Loader2, Search, Filter, UserPlus, UserCheck, UserX, Calendar } from 'lucide-react';

export default function UsersPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>('');

    const { data, isLoading } = useQuery({
        queryKey: ['users'],
        queryFn: () => usersApi.getAll(),
    });

    const users = data?.data || [];

    const filteredUsers = users.filter((user: any) => {
        const matchesSearch =
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = !roleFilter || user.role === roleFilter;
        const matchesStatus = statusFilter === '' ||
            (statusFilter === 'active' ? user.isActive : !user.isActive);
        return matchesSearch && matchesRole && matchesStatus;
    });

    const stats = {
        total: users.length,
        developers: users.filter((u: any) => u.role === 'DEVELOPER').length,
        admins: users.filter((u: any) => u.role.includes('ADMIN')).length,
        active: users.filter((u: any) => u.isActive).length,
        inactive: users.filter((u: any) => !u.isActive).length,
    };

    const getRoleBadge = (role: string) => {
        const colors = {
            DEVELOPER: 'bg-purple-50 text-purple-700 border-purple-200',
            ADMIN_IT: 'bg-blue-50 text-blue-700 border-blue-200',
            ADMIN_SobatBantu: 'bg-green-50 text-green-700 border-green-200',
            ADMIN_LEMBAGA_ISLAMI: 'bg-primary-50 text-primary-700 border-primary-200',
            DONATUR: 'bg-gray-50 text-gray-700 border-gray-200',
        };
        return colors[role as keyof typeof colors] || 'bg-gray-50 text-gray-700 border-gray-200';
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600 mb-3" />
                <p className="text-sm text-gray-600">Memuat data pengguna...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-white rounded-lg p-5 border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                        <Users className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="text-3xl font-semibold text-gray-900 mb-1">{stats.total}</div>
                    <div className="text-sm text-gray-600">Total Pengguna</div>
                </div>

                <div className="bg-white rounded-lg p-5 border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                        <Shield className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="text-3xl font-semibold text-purple-600 mb-1">{stats.developers}</div>
                    <div className="text-sm text-gray-600">Developer</div>
                </div>

                <div className="bg-white rounded-lg p-5 border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                        <UserPlus className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="text-3xl font-semibold text-primary-600 mb-1">{stats.admins}</div>
                    <div className="text-sm text-gray-600">Admin</div>
                </div>

                <div className="bg-white rounded-lg p-5 border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                        <UserCheck className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="text-3xl font-semibold text-green-600 mb-1">{stats.active}</div>
                    <div className="text-sm text-gray-600">Aktif</div>
                </div>

                <div className="bg-white rounded-lg p-5 border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                        <UserX className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="text-3xl font-semibold text-red-600 mb-1">{stats.inactive}</div>
                    <div className="text-sm text-gray-600">Nonaktif</div>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Daftar Pengguna</h2>
                        <p className="text-sm text-gray-600 mt-1">Kelola semua pengguna platform</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari nama atau email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-300 rounded-md focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors outline-none"
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-300 rounded-md focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors outline-none appearance-none bg-white"
                        >
                            <option value="">Semua Role</option>
                            <option value="DEVELOPER">Developer</option>
                            <option value="ADMIN_IT">Admin IT</option>
                            <option value="ADMIN_SobatBantu">Admin SobatBantu</option>
                            <option value="ADMIN_LEMBAGA_ISLAMI">Admin Lembaga Islami</option>
                            <option value="DONATUR">Donatur</option>
                        </select>
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-300 rounded-md focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors outline-none appearance-none bg-white"
                        >
                            <option value="">Semua Status</option>
                            <option value="active">Aktif</option>
                            <option value="inactive">Nonaktif</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            {filteredUsers.length > 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Pengguna</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Bergabung</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredUsers.map((user: any) => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 rounded-lg bg-primary-600 flex items-center justify-center text-white font-medium">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                    <div className="text-xs text-gray-500">ID: {user.id.slice(0, 8)}...</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-2 text-sm text-gray-700">
                                                <Mail className="w-4 h-4 text-gray-400" />
                                                <span>{user.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-3 py-1 rounded-md text-xs font-medium border ${getRoleBadge(user.role)}`}>
                                                {user.role.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center">
                                                {user.isActive ? (
                                                    <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs font-medium bg-green-50 border border-green-200 text-green-700">
                                                        <CheckCircle className="w-3.5 h-3.5" />
                                                        <span>Aktif</span>
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs font-medium bg-red-50 border border-red-200 text-red-700">
                                                        <XCircle className="w-3.5 h-3.5" />
                                                        <span>Nonaktif</span>
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                <span>
                                                    {new Date(user.createdAt).toLocaleDateString('id-ID', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-lg border border-gray-200 p-12">
                    <div className="text-center">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                            <Users className="w-6 h-6 text-gray-400" />
                        </div>
                        <h3 className="text-base font-semibold text-gray-900 mb-2">Tidak Ada Pengguna</h3>
                        <p className="text-sm text-gray-600">
                            {searchQuery || roleFilter || statusFilter
                                ? 'Tidak ada pengguna yang sesuai dengan filter'
                                : 'Belum ada pengguna terdaftar'}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
