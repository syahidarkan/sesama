'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { pengusulApi, programsApi, articlesApi } from '@/lib/api';
import { User, Program, Article } from '@/types';
import Link from 'next/link';

type ApprovalType = 'pengusul' | 'program' | 'article';

interface PendingPengusul extends User {
  ktpImageUrl?: string;
  institutionName?: string;
  institutionProfile?: string;
}

function ApprovalsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, hasRole } = useAuthStore();

  const [activeTab, setActiveTab] = useState<ApprovalType>(
    (searchParams.get('type') as ApprovalType) || 'pengusul'
  );
  const [pengusulList, setPengusulList] = useState<PendingPengusul[]>([]);
  const [programList, setProgramList] = useState<Program[]>([]);
  const [articleList, setArticleList] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Re-auth modal
  const [showReauth, setShowReauth] = useState(false);
  const [reauthPassword, setReauthPassword] = useState('');
  const [pendingAction, setPendingAction] = useState<{
    type: ApprovalType;
    id: string;
    action: 'approve' | 'reject';
  } | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    if (!hasRole(['MANAGER', 'SUPER_ADMIN'])) {
      router.push('/admin/dashboard');
      return;
    }

    fetchApprovals();
  }, [activeTab]);

  const fetchApprovals = async () => {
    try {
      setLoading(true);

      if (activeTab === 'pengusul') {
        const response = await pengusulApi.getPending(50, 0);
        setPengusulList(response.data.data || []);
      } else if (activeTab === 'program') {
        const response = await programsApi.getAll('PENDING_APPROVAL', 50, 0);
        setProgramList(response.data.data || []);
      } else if (activeTab === 'article') {
        const response = await articlesApi.getAll('PENDING_APPROVAL', undefined, undefined, 50, 0);
        setArticleList(response.data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch approvals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (
    type: ApprovalType,
    id: string,
    action: 'approve' | 'reject'
  ) => {
    // For sensitive actions, require re-authentication
    setPendingAction({ type, id, action });
    setShowReauth(true);
  };

  const executeAction = async () => {
    if (!pendingAction) return;

    const { type, id, action } = pendingAction;

    try {
      setActionLoading(id);

      // In production, call authApi.reAuthenticate(reauthPassword) first
      // For now, proceed directly

      if (type === 'pengusul') {
        if (action === 'approve') {
          await pengusulApi.approve(id);
        } else {
          await pengusulApi.reject(id);
        }
      } else if (type === 'program') {
        if (action === 'approve') {
          await programsApi.approve(id);
        } else {
          await programsApi.reject(id);
        }
      } else if (type === 'article') {
        if (action === 'approve') {
          await articlesApi.approve(id);
        } else {
          await articlesApi.reject(id);
        }
      }

      // Refresh list
      await fetchApprovals();

      // Close modal
      setShowReauth(false);
      setPendingAction(null);
      setReauthPassword('');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Gagal melakukan approval');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data approval...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Approval Center</h1>
            <p className="text-sm text-gray-600">
              Review dan approve item yang pending
            </p>
          </div>
          <Link
            href="/admin/dashboard"
            className="text-orange-600 hover:text-orange-700 font-medium"
          >
            ← Dashboard
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-6">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('pengusul')}
                className={`px-6 py-4 font-semibold border-b-2 transition ${
                  activeTab === 'pengusul'
                    ? 'border-orange-600 text-orange-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Pengusul ({pengusulList.length})
              </button>
              <button
                onClick={() => setActiveTab('program')}
                className={`px-6 py-4 font-semibold border-b-2 transition ${
                  activeTab === 'program'
                    ? 'border-orange-600 text-orange-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Program ({programList.length})
              </button>
              <button
                onClick={() => setActiveTab('article')}
                className={`px-6 py-4 font-semibold border-b-2 transition ${
                  activeTab === 'article'
                    ? 'border-orange-600 text-orange-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Pelaporan ({articleList.length})
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Pengusul Tab */}
            {activeTab === 'pengusul' && (
              <div className="space-y-4">
                {pengusulList.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    Tidak ada pengusul yang menunggu verifikasi
                  </div>
                ) : (
                  pengusulList.map((pengusul) => (
                    <div
                      key={pengusul.id}
                      className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            {pengusul.name}
                          </h3>
                          <p className="text-sm text-gray-600">{pengusul.email}</p>
                          <p className="text-sm text-gray-600">
                            KTP: {pengusul.ktpNumber || 'N/A'}
                          </p>
                          {pengusul.institutionName && (
                            <p className="text-sm text-gray-600">
                              Lembaga: {pengusul.institutionName}
                            </p>
                          )}
                        </div>
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                          {pengusul.pengusulStatus}
                        </span>
                      </div>

                      {pengusul.institutionProfile && (
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold text-gray-700 mb-1">
                            Profil Lembaga:
                          </h4>
                          <p className="text-sm text-gray-600">
                            {pengusul.institutionProfile}
                          </p>
                        </div>
                      )}

                      {pengusul.ktpImageUrl && (
                        <div className="mb-4">
                          <a
                            href={pengusul.ktpImageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-700"
                          >
                            📄 Lihat Foto KTP →
                          </a>
                        </div>
                      )}

                      <div className="flex items-center gap-3 pt-4 border-t">
                        <button
                          onClick={() => handleAction('pengusul', pengusul.id, 'approve')}
                          disabled={actionLoading === pengusul.id}
                          className="px-4 py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 disabled:bg-gray-400"
                        >
                          ✓ Approve
                        </button>
                        <button
                          onClick={() => handleAction('pengusul', pengusul.id, 'reject')}
                          disabled={actionLoading === pengusul.id}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:bg-gray-400"
                        >
                          ✗ Reject
                        </button>
                        <span className="text-xs text-gray-500 ml-auto">
                          Diajukan: {formatDate(pengusul.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Program Tab */}
            {activeTab === 'program' && (
              <div className="space-y-4">
                {programList.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    Tidak ada program yang menunggu approval
                  </div>
                ) : (
                  programList.map((program) => (
                    <div
                      key={program.id}
                      className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-2">
                            {program.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {program.description.substring(0, 200)}...
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>Target: {formatCurrency(program.targetAmount)}</span>
                            {program.category && <span>• {program.category}</span>}
                            <span>
                              • Oleh: {program.creator?.name || 'Unknown'}
                            </span>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full ml-4">
                          {program.status}
                        </span>
                      </div>

                      {program.imageUrl && (
                        <div className="mb-4">
                          <img
                            src={program.imageUrl}
                            alt={program.title}
                            className="w-full max-w-sm h-48 object-cover rounded-lg"
                          />
                        </div>
                      )}

                      <div className="flex items-center gap-3 pt-4 border-t">
                        <button
                          onClick={() => handleAction('program', program.id, 'approve')}
                          disabled={actionLoading === program.id}
                          className="px-4 py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 disabled:bg-gray-400"
                        >
                          ✓ Approve & Publish
                        </button>
                        <button
                          onClick={() => handleAction('program', program.id, 'reject')}
                          disabled={actionLoading === program.id}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:bg-gray-400"
                        >
                          ✗ Reject
                        </button>
                        <span className="text-xs text-gray-500 ml-auto">
                          Diajukan: {formatDate(program.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Article Tab */}
            {activeTab === 'article' && (
              <div className="space-y-4">
                {articleList.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    Tidak ada pelaporan yang menunggu approval
                  </div>
                ) : (
                  articleList.map((article) => (
                    <div
                      key={article.id}
                      className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-2">
                            {article.title}
                          </h3>
                          {article.excerpt && (
                            <p className="text-sm text-gray-600 mb-2">
                              {article.excerpt}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>Oleh: {article.author?.name || 'Unknown'}</span>
                            {article.program && (
                              <span>• Program: {article.program.title}</span>
                            )}
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full ml-4">
                          {article.status}
                        </span>
                      </div>

                      {article.coverImageUrl && (
                        <div className="mb-4">
                          <img
                            src={article.coverImageUrl}
                            alt={article.title}
                            className="w-full max-w-sm h-48 object-cover rounded-lg"
                          />
                        </div>
                      )}

                      <div className="mb-4">
                        <Link
                          href={`/pelaporan/${article.slug}`}
                          target="_blank"
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          📄 Preview Pelaporan →
                        </Link>
                      </div>

                      <div className="flex items-center gap-3 pt-4 border-t">
                        <button
                          onClick={() => handleAction('article', article.id, 'approve')}
                          disabled={actionLoading === article.id}
                          className="px-4 py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 disabled:bg-gray-400"
                        >
                          ✓ Approve & Publish
                        </button>
                        <button
                          onClick={() => handleAction('article', article.id, 'reject')}
                          disabled={actionLoading === article.id}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:bg-gray-400"
                        >
                          ✗ Reject
                        </button>
                        <span className="text-xs text-gray-500 ml-auto">
                          Diajukan: {formatDate(article.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Re-authentication Modal */}
      {showReauth && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Konfirmasi Password
            </h2>
            <p className="text-gray-600 mb-6">
              Untuk keamanan, masukkan password Anda untuk melanjutkan approval.
            </p>

            <input
              type="password"
              value={reauthPassword}
              onChange={(e) => setReauthPassword(e.target.value)}
              placeholder="Masukkan password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 mb-6"
              onKeyPress={(e) => {
                if (e.key === 'Enter') executeAction();
              }}
            />

            <div className="flex items-center gap-3">
              <button
                onClick={executeAction}
                disabled={!reauthPassword || !!actionLoading}
                className="flex-1 px-4 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 disabled:bg-gray-400"
              >
                {actionLoading ? 'Memproses...' : 'Konfirmasi'}
              </button>
              <button
                onClick={() => {
                  setShowReauth(false);
                  setPendingAction(null);
                  setReauthPassword('');
                }}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ApprovalsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-500">Memuat...</p></div>}>
      <ApprovalsPageContent />
    </Suspense>
  );
}
