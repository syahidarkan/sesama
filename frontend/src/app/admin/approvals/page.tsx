'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { pengusulApi, programsApi, articlesApi } from '@/lib/api';
import { User, Program, Article } from '@/types';
import Link from 'next/link';
import {
  CheckCircle, XCircle, Users, Heart, FileText, ArrowLeft, Loader2,
  Eye, Calendar, DollarSign, Building, Image, Shield, Clock
} from 'lucide-react';

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
    setPendingAction({ type, id, action });
    setShowReauth(true);
  };

  const executeAction = async () => {
    if (!pendingAction) return;

    const { type, id, action } = pendingAction;

    try {
      setActionLoading(id);

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

      await fetchApprovals();

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
        <div className="flex flex-col items-center">
          <Loader2 className="w-8 h-8 animate-spin text-orange-600 mb-3" />
          <p className="text-sm text-gray-600">Memuat data approval...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    {
      value: 'pengusul' as ApprovalType,
      label: 'Pengusul',
      icon: Users,
      count: pengusulList.length,
    },
    {
      value: 'program' as ApprovalType,
      label: 'Program',
      icon: Heart,
      count: programList.length,
    },
    {
      value: 'article' as ApprovalType,
      label: 'Pelaporan',
      icon: FileText,
      count: articleList.length,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.value;
          return (
            <div
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`cursor-pointer rounded-lg border p-5 transition-colors ${
                isActive
                  ? 'bg-orange-600 border-orange-600 text-white'
                  : 'bg-white border-gray-200 hover:border-orange-500'
              }`}
            >
              <div className="flex items-center justify-between">
                <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                <div className="text-right">
                  <p className={`text-3xl font-semibold ${isActive ? 'text-white' : 'text-gray-900'}`}>
                    {tab.count}
                  </p>
                  <p className={`text-sm ${isActive ? 'text-white/90' : 'text-gray-600'}`}>
                    {tab.label}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg border border-gray-200">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <div className="flex">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`flex-1 flex items-center justify-center space-x-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    isActive
                      ? 'border-orange-600 text-orange-600 bg-orange-50/50'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    isActive ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-6">
          {/* Pengusul Tab */}
          {activeTab === 'pengusul' && (
            <div className="space-y-4">
              {pengusulList.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Users className="w-6 h-6 text-gray-400" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-1">Tidak ada pengusul pending</h3>
                  <p className="text-sm text-gray-600">Semua pengusul sudah diverifikasi</p>
                </div>
              ) : (
                pengusulList.map((pengusul) => (
                  <div
                    key={pengusul.id}
                    className="bg-white rounded-lg p-6 border border-gray-200 hover:border-orange-500 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center text-white font-medium text-lg">
                          {pengusul.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{pengusul.name}</h3>
                          <p className="text-sm text-gray-600">{pengusul.email}</p>
                          <p className="text-sm text-gray-600">KTP: {pengusul.ktpNumber || 'N/A'}</p>
                          {pengusul.institutionName && (
                            <p className="text-sm text-gray-600 flex items-center space-x-1 mt-1">
                              <Building className="w-4 h-4" />
                              <span>{pengusul.institutionName}</span>
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-yellow-50 border border-yellow-200 text-yellow-700 text-xs font-medium rounded-md">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {pengusul.pengusulStatus}
                      </span>
                    </div>

                    {pengusul.institutionProfile && (
                      <div className="mb-4 bg-gray-50 rounded-md p-4 border border-gray-200">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Profil Lembaga:</h4>
                        <p className="text-sm text-gray-700 leading-relaxed">{pengusul.institutionProfile}</p>
                      </div>
                    )}

                    {pengusul.ktpImageUrl && (
                      <div className="mb-4">
                        <a
                          href={pengusul.ktpImageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 hover:border-gray-400 transition-colors"
                        >
                          <Image className="w-4 h-4" />
                          <span>Lihat Foto KTP</span>
                        </a>
                      </div>
                    )}

                    <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => handleAction('pengusul', pengusul.id, 'approve')}
                        disabled={actionLoading === pengusul.id}
                        className="inline-flex items-center space-x-2 px-6 py-2.5 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleAction('pengusul', pengusul.id, 'reject')}
                        disabled={actionLoading === pengusul.id}
                        className="inline-flex items-center space-x-2 px-6 py-2.5 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                      <span className="flex items-center space-x-1.5 text-xs text-gray-500 ml-auto">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formatDate(pengusul.createdAt)}</span>
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
                <div className="text-center py-20">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-6 h-6 text-gray-400" fill="currentColor" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-1">Tidak ada program pending</h3>
                  <p className="text-sm text-gray-600">Semua program sudah diapprove atau ditolak</p>
                </div>
              ) : (
                programList.map((program) => (
                  <div
                    key={program.id}
                    className="bg-white rounded-lg p-6 border border-gray-200 hover:border-orange-500 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{program.title}</h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-3">{program.description}</p>
                        <div className="flex flex-wrap gap-2">
                          <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-md">
                            <DollarSign className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-900">{formatCurrency(program.targetAmount)}</span>
                          </div>
                          {program.category && (
                            <div className="inline-flex items-center px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-md">
                              <span className="text-sm font-medium text-gray-900">{program.category}</span>
                            </div>
                          )}
                          <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-md">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-900">{program.creator?.name || 'Unknown'}</span>
                          </div>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-yellow-50 border border-yellow-200 text-yellow-700 text-xs font-medium rounded-md ml-4">
                        <Clock className="w-3 h-3 inline mr-1" />
                        PENDING
                      </span>
                    </div>

                    {program.imageUrl && (
                      <div className="mb-4">
                        <img
                          src={program.imageUrl}
                          alt={program.title}
                          className="w-full max-w-2xl h-64 object-cover rounded-md border border-gray-200"
                        />
                      </div>
                    )}

                    <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => handleAction('program', program.id, 'approve')}
                        disabled={actionLoading === program.id}
                        className="inline-flex items-center space-x-2 px-6 py-2.5 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Approve & Publish</span>
                      </button>
                      <button
                        onClick={() => handleAction('program', program.id, 'reject')}
                        disabled={actionLoading === program.id}
                        className="inline-flex items-center space-x-2 px-6 py-2.5 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                      <span className="flex items-center space-x-1.5 text-xs text-gray-500 ml-auto">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formatDate(program.createdAt)}</span>
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
                <div className="text-center py-20">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-6 h-6 text-gray-400" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-1">Tidak ada pelaporan pending</h3>
                  <p className="text-sm text-gray-600">Semua pelaporan sudah diapprove atau ditolak</p>
                </div>
              ) : (
                articleList.map((article) => (
                  <div
                    key={article.id}
                    className="bg-white rounded-lg p-6 border border-gray-200 hover:border-orange-500 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{article.title}</h3>
                        {article.excerpt && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{article.excerpt}</p>
                        )}
                        <div className="flex flex-wrap gap-2">
                          <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-md">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-900">{article.author?.name || 'Unknown'}</span>
                          </div>
                          {article.program && (
                            <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-md">
                              <Heart className="w-4 h-4 text-gray-400" fill="currentColor" />
                              <span className="text-sm font-medium text-gray-900 line-clamp-1">{article.program.title}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-yellow-50 border border-yellow-200 text-yellow-700 text-xs font-medium rounded-md ml-4">
                        <Clock className="w-3 h-3 inline mr-1" />
                        PENDING
                      </span>
                    </div>

                    {article.coverImageUrl && (
                      <div className="mb-4">
                        <img
                          src={article.coverImageUrl}
                          alt={article.title}
                          className="w-full max-w-2xl h-64 object-cover rounded-md border border-gray-200"
                        />
                      </div>
                    )}

                    <div className="mb-4">
                      <Link
                        href={`/pelaporan/${article.slug}`}
                        target="_blank"
                        className="inline-flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 hover:border-gray-400 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Preview Pelaporan</span>
                      </Link>
                    </div>

                    <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => handleAction('article', article.id, 'approve')}
                        disabled={actionLoading === article.id}
                        className="inline-flex items-center space-x-2 px-6 py-2.5 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Approve & Publish</span>
                      </button>
                      <button
                        onClick={() => handleAction('article', article.id, 'reject')}
                        disabled={actionLoading === article.id}
                        className="inline-flex items-center space-x-2 px-6 py-2.5 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                      <span className="flex items-center space-x-1.5 text-xs text-gray-500 ml-auto">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formatDate(article.createdAt)}</span>
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Re-authentication Modal */}
      {showReauth && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-8 border border-gray-200">
            <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mx-auto mb-6">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2 text-center">
              Konfirmasi Password
            </h2>
            <p className="text-sm text-gray-600 mb-6 text-center">
              Untuk keamanan, masukkan password Anda untuk melanjutkan approval.
            </p>

            <input
              type="password"
              value={reauthPassword}
              onChange={(e) => setReauthPassword(e.target.value)}
              placeholder="Masukkan password"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors outline-none mb-6"
              onKeyPress={(e) => {
                if (e.key === 'Enter') executeAction();
              }}
            />

            <div className="flex gap-3">
              <button
                onClick={executeAction}
                disabled={!reauthPassword || !!actionLoading}
                className="flex-1 px-6 py-2.5 bg-orange-600 text-white rounded-md text-sm font-medium hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading ? (
                  <span className="flex items-center justify-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Memproses...</span>
                  </span>
                ) : (
                  'Konfirmasi'
                )}
              </button>
              <button
                onClick={() => {
                  setShowReauth(false);
                  setPendingAction(null);
                  setReauthPassword('');
                }}
                className="flex-1 px-6 py-2.5 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
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
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    }>
      <ApprovalsPageContent />
    </Suspense>
  );
}
