'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { auditLogsApi } from '@/lib/api';
import Link from 'next/link';

export default function AuditLogsPage() {
  const router = useRouter();
  const { user, hasRole } = useAuthStore();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    if (!hasRole(['SUPER_ADMIN', 'SUPERVISOR', 'MANAGER'])) {
      router.push('/admin/dashboard');
      return;
    }
    fetchLogs();
  }, [filter]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const action = filter === 'ALL' ? undefined : filter;
      const response = await auditLogsApi.getAll({ action, limit: 100, offset: 0 });
      setLogs(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionBadge = (action: string) => {
    const styles: Record<string, string> = {
      LOGIN: 'bg-cyan-100 text-cyan-800',
      LOGOUT: 'bg-gray-100 text-gray-800',
      CREATE: 'bg-teal-100 text-orange-800',
      UPDATE: 'bg-yellow-100 text-yellow-800',
      DELETE: 'bg-red-100 text-red-800',
      APPROVE: 'bg-teal-100 text-teal-800',
      REJECT: 'bg-teal-100 text-orange-800',
    };

    return (
      <span className={`px-2 py-1 rounded text-xs font-semibold ${styles[action] || 'bg-gray-100 text-gray-800'}`}>
        {action}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
              <p className="text-sm text-gray-600">Riwayat aktivitas sistem</p>
            </div>
            <Link
              href="/admin/dashboard"
              className="text-gray-600 hover:text-gray-700 font-medium"
            >
              ← Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Panduan/Legend Box */}
        <div className="bg-cyan-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
          <div className="flex items-start mb-4">
            <div className="text-3xl mr-4">📖</div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-cyan-900 mb-3">
                Panduan Membaca Audit Logs
              </h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="bg-white/70 rounded-lg p-3 border border-blue-100">
                    <h4 className="font-semibold text-cyan-900 mb-1">📊 Action</h4>
                    <p className="text-gray-700 text-xs">
                      Jenis aktivitas yang dilakukan (LOGIN, CREATE, UPDATE, DELETE, dll)
                    </p>
                  </div>
                  <div className="bg-white/70 rounded-lg p-3 border border-blue-100">
                    <h4 className="font-semibold text-cyan-900 mb-1">👤 User Info</h4>
                    <p className="text-gray-700 text-xs">
                      Nama, role, dan email pengguna yang melakukan aktivitas
                    </p>
                  </div>
                  <div className="bg-white/70 rounded-lg p-3 border border-blue-100">
                    <h4 className="font-semibold text-cyan-900 mb-1">🏷️ Entity</h4>
                    <p className="text-gray-700 text-xs">
                      Jenis data yang diubah (program, article, user, dll) dan ID-nya
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="bg-white/70 rounded-lg p-3 border border-blue-100">
                    <h4 className="font-semibold text-cyan-900 mb-1">🌐 IP Address</h4>
                    <p className="text-gray-700 text-xs">
                      Alamat IP dari mana aktivitas dilakukan<br/>
                      <span className="font-mono text-xs bg-cyan-100 px-1 rounded">::1</span> = localhost (komputer sendiri)<br/>
                      <span className="font-mono text-xs bg-cyan-100 px-1 rounded">127.0.0.1</span> = localhost IPv4
                    </p>
                  </div>
                  <div className="bg-white/70 rounded-lg p-3 border border-blue-100">
                    <h4 className="font-semibold text-cyan-900 mb-1">📝 Metadata</h4>
                    <p className="text-gray-700 text-xs">
                      Informasi tambahan tentang aktivitas:<br/>
                      • <span className="font-mono text-xs">{`{"method":"otp"}`}</span> = Login dengan OTP<br/>
                      • <span className="font-mono text-xs">{`{"reason":"resend"}`}</span> = OTP dikirim ulang<br/>
                      • dll (tergantung jenis aktivitas)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {['ALL', 'LOGIN', 'LOGOUT', 'CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT'].map((action) => (
              <button
                key={action}
                onClick={() => setFilter(action)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === action
                    ? 'bg-teal-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {action === 'ALL' ? 'Semua' : action}
              </button>
            ))}
          </div>
        </div>

        {/* Logs List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat data...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">📊</div>
            <p className="text-gray-600">Tidak ada log ditemukan</p>
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getActionBadge(log.action)}
                      <span className="text-xs text-gray-500">
                        {new Date(log.createdAt).toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900">{log.user?.name || 'Unknown'}</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-sm text-gray-600">{log.user?.role || 'N/A'}</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-sm text-gray-600">{log.user?.email || 'N/A'}</span>
                    </div>
                    {log.entityType && (
                      <div className="text-sm text-gray-700">
                        <span className="text-gray-500">Entity:</span> {log.entityType}
                        {log.entityId && (
                          <span className="text-gray-400 ml-2">#{log.entityId.slice(0, 8)}</span>
                        )}
                      </div>
                    )}
                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <div className="mt-2">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-gray-700">📝 Metadata:</span>
                          <span className="text-xs text-gray-500 italic">
                            {log.metadata.method === 'otp' && '(Login menggunakan 2FA/OTP)'}
                            {log.metadata.reason === 'resend' && '(OTP dikirim ulang)'}
                            {log.metadata.email && '(Email terkait aktivitas)'}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 font-mono bg-gray-50 p-2 rounded border border-gray-200">
                          {JSON.stringify(log.metadata, null, 2)}
                        </div>
                      </div>
                    )}
                    {log.ipAddress && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-700">🌐 IP Address:</span>
                        <span className="text-xs text-gray-600 font-mono bg-cyan-50 px-2 py-1 rounded">
                          {log.ipAddress}
                        </span>
                        {log.ipAddress === '::1' && (
                          <span className="text-xs text-teal-600 font-medium">
                            (localhost - komputer sendiri)
                          </span>
                        )}
                        {log.ipAddress === '127.0.0.1' && (
                          <span className="text-xs text-teal-600 font-medium">
                            (localhost - komputer sendiri)
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info */}
        <div className="mt-6 bg-cyan-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start">
            <div className="text-2xl mr-4">ℹ️</div>
            <div>
              <h3 className="font-semibold text-cyan-900 mb-2">Tentang Audit Logs</h3>
              <p className="text-sm text-cyan-800">
                Semua aktivitas penting dalam sistem dicatat secara immutable untuk keperluan audit dan keamanan.
                Log ini tidak dapat dihapus atau diubah dan tersimpan permanen dalam database.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
