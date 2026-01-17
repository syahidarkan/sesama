'use client';

import { useQuery } from '@tanstack/react-query';
import { usersApi } from '@/lib/api';
import { Users, Mail, Shield, CheckCircle, XCircle } from 'lucide-react';

export default function UsersPage() {
    const { data, isLoading } = useQuery({
        queryKey: ['users'],
        queryFn: () => usersApi.getAll(),
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Loading...</div>
            </div>
        );
    }

    const users = data?.data || [];

    const getRoleBadge = (role: string) => {
        const colors = {
            DEVELOPER: 'bg-purple-100 text-purple-800',
            ADMIN_IT: 'bg-blue-100 text-blue-800',
            ADMIN_LAZISMU: 'bg-emerald-100 text-emerald-800',
            ADMIN_LEMBAGA_ISLAMI: 'bg-teal-100 text-teal-800',
            DONATUR: 'bg-gray-100 text-gray-800',
        };
        return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Manajemen Pengguna</h1>
                <div className="text-sm text-gray-600">
                    Total: <span className="font-semibold">{users.length}</span> users
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg border">
                    <div className="flex items-center gap-3">
                        <Shield className="w-8 h-8 text-purple-600" />
                        <div>
                            <div className="text-2xl font-bold text-gray-900">
                                {users.filter((u: any) => u.role === 'DEVELOPER').length}
                            </div>
                            <div className="text-sm text-gray-600">Developers</div>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                    <div className="flex items-center gap-3">
                        <Users className="w-8 h-8 text-emerald-600" />
                        <div>
                            <div className="text-2xl font-bold text-gray-900">
                                {users.filter((u: any) => u.role.includes('ADMIN')).length}
                            </div>
                            <div className="text-sm text-gray-600">Admins</div>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                    <div className="flex items-center gap-3">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                        <div>
                            <div className="text-2xl font-bold text-gray-900">
                                {users.filter((u: any) => u.isActive).length}
                            </div>
                            <div className="text-sm text-gray-600">Active</div>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                    <div className="flex items-center gap-3">
                        <XCircle className="w-8 h-8 text-red-600" />
                        <div>
                            <div className="text-2xl font-bold text-gray-900">
                                {users.filter((u: any) => !u.isActive).length}
                            </div>
                            <div className="text-sm text-gray-600">Inactive</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl shadow-sm border">
                <div className="p-6">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Role</th>
                                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Status</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Created</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user: any) => (
                                    <tr key={user.id} className="border-b hover:bg-gray-50">
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center text-white font-bold">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="font-medium text-gray-900">{user.name}</div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Mail className="w-4 h-4" />
                                                <span className="text-sm">{user.email}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadge(
                                                    user.role
                                                )}`}
                                            >
                                                {user.role.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            {user.isActive ? (
                                                <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                                            ) : (
                                                <XCircle className="w-5 h-5 text-red-500 mx-auto" />
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-600">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
