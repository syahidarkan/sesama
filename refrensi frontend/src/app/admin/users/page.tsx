'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { usersApi, roleUpgradesApi } from '@/lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import {
  Users, UserCheck, Shield, Eye, Search, Filter, ArrowLeft,
  Loader2, CheckCircle, XCircle, Crown, Briefcase, Edit, UserPlus, ArrowUp, Wallet
} from 'lucide-react';

export default function AdminUsersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, hasRole } = useAuthStore();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [targetRole, setTargetRole] = useState('');
  const [upgradeNotes, setUpgradeNotes] = useState('');

  useEffect(() => {
    if (!hasRole(['SUPER_ADMIN', 'SUPERVISOR'])) {
      router.push('/admin/dashboard');
      return;
    }
    fetchUsers();
  }, [filter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const role = filter === 'ALL' ? undefined : filter;
      const response = await usersApi.getAll(role, 100, 0);
      setUsers(response.data || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const styles: Record<string, { bg: string; text: string; icon: any }> = {
      USER: { bg: 'bg-gray-50 border-gray-200', text: 'text-gray-700', icon: Users },
      PENGUSUL: { bg: 'bg-purple-50 border-purple-200', text: 'text-purple-700', icon: UserCheck },
      MANAGER: { bg: 'bg-teal-50 border-teal-200', text: 'text-teal-700', icon: Briefcase },
      CONTENT_MANAGER: { bg: 'bg-cyan-50 border-blue-200', text: 'text-cyan-700', icon: Edit },
      SUPERVISOR: { bg: 'bg-teal-50 border-teal-200', text: 'text-teal-700', icon: Eye },
      FINANCE: { bg: 'bg-green-50 border-green-200', text: 'text-green-700', icon: Wallet },
      SUPER_ADMIN: { bg: 'bg-red-50 border-red-200', text: 'text-red-700', icon: Crown },
    };

    const config = styles[role] || { bg: 'bg-gray-50 border-gray-200', text: 'text-gray-700', icon: Users };
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${config.bg} ${config.text}`}>
        <Icon className="w-3.5 h-3.5" />
        <span>{role.replace('_', ' ')}</span>
      </span>
    );
  };

  const getStats = () => {
    return {
      total: users.length,
      active: users.filter(u => u.isActive).length,
      inactive: users.filter(u => !u.isActive).length,
      user: users.filter(u => u.role === 'USER').length,
      pengusul: users.filter(u => u.role === 'PENGUSUL').length,
      contentManager: users.filter(u => u.role === 'CONTENT_MANAGER').length,
      manager: users.filter(u => u.role === 'MANAGER').length,
      supervisor: users.filter(u => u.role === 'SUPERVISOR').length,
      finance: users.filter(u => u.role === 'FINANCE').length,
      superAdmin: users.filter(u => u.role === 'SUPER_ADMIN').length,
    };
  };

  const stats = getStats();

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const roleFilters = [
    { value: 'ALL', label: 'Semua', icon: Users },
    { value: 'USER', label: 'User', icon: Users },
    { value: 'PENGUSUL', label: 'Pengusul', icon: UserCheck },
    { value: 'CONTENT_MANAGER', label: 'Content Manager', icon: Edit },
    { value: 'MANAGER', label: 'Manager', icon: Briefcase },
    { value: 'SUPERVISOR', label: 'Supervisor', icon: Eye },
    { value: 'FINANCE', label: 'Finance', icon: Wallet },
    { value: 'SUPER_ADMIN', label: 'Super Admin', icon: Crown },
  ];

  const upgradeMutation = useMutation({
    mutationFn: (data: { userId: string; targetRole: string; notes?: string }) =>
      roleUpgradesApi.changeUserRole(data.userId, { targetRole: data.targetRole, notes: data.notes }),
    onSuccess: () => {
      fetchUsers();
      setShowUpgradeModal(false);
      setSelectedUser(null);
      setTargetRole('');
      setUpgradeNotes('');
    },
  });

  const handleUpgradeClick = (userToUpgrade: any) => {
    setSelectedUser(userToUpgrade);
    setShowUpgradeModal(true);
  };

  const handleConfirmUpgrade = () => {
    if (!selectedUser || !targetRole) return;
    upgradeMutation.mutate({
      userId: selectedUser.id,
      targetRole,
      notes: upgradeNotes,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600 mb-3" />
          <p className="text-sm text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="text-xl font-semibold text-gray-900">{stats.total}</span>
          </div>
          <p className="text-xs text-gray-600">Total</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-4 h-4 text-gray-400" />
            <span className="text-xl font-semibold text-green-600">{stats.active}</span>
          </div>
          <p className="text-xs text-gray-600">Active</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <XCircle className="w-4 h-4 text-gray-400" />
            <span className="text-xl font-semibold text-red-600">{stats.inactive}</span>
          </div>
          <p className="text-xs text-gray-600">Inactive</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <UserCheck className="w-4 h-4 text-gray-400" />
            <span className="text-xl font-semibold text-purple-600">{stats.pengusul}</span>
          </div>
          <p className="text-xs text-gray-600">Proposers</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <Briefcase className="w-4 h-4 text-gray-400" />
            <span className="text-xl font-semibold text-teal-600">{stats.manager}</span>
          </div>
          <p className="text-xs text-gray-600">Managers</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <Crown className="w-4 h-4 text-gray-400" />
            <span className="text-xl font-semibold text-red-600">{stats.superAdmin}</span>
          </div>
          <p className="text-xs text-gray-600">Admins</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-md focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors outline-none"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Filter:</span>
            <div className="flex flex-wrap gap-2">
              {roleFilters.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.value}
                    onClick={() => setFilter(item.value)}
                    className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      filter === item.value
                        ? 'bg-teal-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-teal-50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      {filteredUsers.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Users className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-2">Tidak ada user ditemukan</h3>
          <p className="text-sm text-gray-600">
            {searchQuery ? 'Coba gunakan kata kunci lain untuk pencarian' : 'Belum ada user yang sesuai dengan filter yang dipilih'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Last Login
                  </th>
                  {user?.role === 'SUPER_ADMIN' && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center text-white font-medium">
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{u.name}</div>
                          <div className="text-xs text-gray-500">ID: {u.id.slice(0, 8)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-700">{u.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRoleBadge(u.role)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {u.isActive ? (
                        <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs font-medium border bg-green-50 border-green-200 text-green-700">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs font-medium border bg-red-50 border-red-200 text-red-700">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Inactive</span>
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {u.lastLoginAt
                        ? new Date(u.lastLoginAt).toLocaleDateString('id-ID', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : 'Belum pernah login'}
                    </td>
                    {user?.role === 'SUPER_ADMIN' && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {u.role !== 'SUPER_ADMIN' && (
                          <button
                            onClick={() => handleUpgradeClick(u)}
                            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-teal-500 text-white text-xs font-medium rounded-md hover:bg-teal-600 transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>Change Role</span>
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Change Role Modal */}
      {showUpgradeModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Change User Role
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              Ubah role untuk <strong>{selectedUser.name}</strong> ({selectedUser.email})
            </p>
            <p className="text-xs text-gray-500 mb-4">
              Current role: <span className="font-medium text-teal-600">{selectedUser.role}</span>
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Role <span className="text-red-500">*</span>
              </label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                required
              >
                <option value="">Pilih role...</option>
                <option value="USER">User</option>
                <option value="PENGUSUL">Pengusul</option>
                <option value="CONTENT_MANAGER">Content Manager</option>
                <option value="SUPERVISOR">Supervisor</option>
                <option value="FINANCE">Finance</option>
                <option value="MANAGER">Manager</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catatan (Opsional)
              </label>
              <textarea
                value={upgradeNotes}
                onChange={(e) => setUpgradeNotes(e.target.value)}
                rows={3}
                placeholder="Catatan tambahan tentang perubahan role ini"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  setShowUpgradeModal(false);
                  setSelectedUser(null);
                  setTargetRole('');
                  setUpgradeNotes('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmUpgrade}
                disabled={!targetRole || upgradeMutation.isPending}
                className="flex-1 px-4 py-2 bg-teal-500 text-white rounded-lg font-medium hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {upgradeMutation.isPending ? 'Memproses...' : 'Change Role'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
        <div className="flex items-start space-x-4">
          <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-gray-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-gray-900 mb-3">Informasi Role</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-white rounded-md p-3 border border-gray-200">
                <p className="text-sm"><span className="font-medium text-gray-900">USER:</span> <span className="text-gray-600">User biasa yang bisa berdonasi</span></p>
              </div>
              <div className="bg-white rounded-md p-3 border border-gray-200">
                <p className="text-sm"><span className="font-medium text-gray-900">PENGUSUL:</span> <span className="text-gray-600">User terverifikasi yang bisa mengusulkan program</span></p>
              </div>
              <div className="bg-white rounded-md p-3 border border-gray-200">
                <p className="text-sm"><span className="font-medium text-gray-900">CONTENT_MANAGER:</span> <span className="text-gray-600">Bisa membuat program & pelaporan (perlu approval)</span></p>
              </div>
              <div className="bg-white rounded-md p-3 border border-gray-200">
                <p className="text-sm"><span className="font-medium text-gray-900">MANAGER:</span> <span className="text-gray-600">Gatekeeper utama - approve semua konten</span></p>
              </div>
              <div className="bg-white rounded-md p-3 border border-gray-200">
                <p className="text-sm"><span className="font-medium text-gray-900">SUPERVISOR:</span> <span className="text-gray-600">Read-only access untuk monitoring</span></p>
              </div>
              <div className="bg-white rounded-md p-3 border border-gray-200">
                <p className="text-sm"><span className="font-medium text-gray-900">SUPER_ADMIN:</span> <span className="text-gray-600">Full system access</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
