'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roleUpgradesApi } from '@/lib/api';
import { useState } from 'react';
import { CheckCircle, XCircle, Clock, User, FileText, Phone, MapPin, Building, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface UpgradeRequest {
  id: string;
  userId: string;
  requestType: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  ktpNumber: string;
  ktpImageUrl?: string;
  phone: string;
  address: string;
  institutionName?: string;
  institutionProfile?: string;
  supportingDocuments?: string[];
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export default function RoleUpgradesPage() {
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState<UpgradeRequest | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');

  const { data: requests, isLoading } = useQuery({
    queryKey: ['pending-pengusul-requests'],
    queryFn: () => roleUpgradesApi.getPendingPengusulRequests().then((res) => res.data),
  });

  const approveMutation = useMutation({
    mutationFn: (data: { requestId: string; notes?: string }) =>
      roleUpgradesApi.approvePengusulRequest(data.requestId, data.notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-pengusul-requests'] });
      setShowModal(false);
      setSelectedRequest(null);
      setReviewNotes('');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (data: { requestId: string; notes: string }) =>
      roleUpgradesApi.rejectPengusulRequest(data.requestId, data.notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-pengusul-requests'] });
      setShowModal(false);
      setSelectedRequest(null);
      setReviewNotes('');
    },
  });

  const handleApprove = (request: UpgradeRequest) => {
    setSelectedRequest(request);
    setActionType('approve');
    setShowModal(true);
  };

  const handleReject = (request: UpgradeRequest) => {
    setSelectedRequest(request);
    setActionType('reject');
    setShowModal(true);
  };

  const handleConfirmAction = () => {
    if (!selectedRequest) return;

    if (actionType === 'approve') {
      approveMutation.mutate({ requestId: selectedRequest.id, notes: reviewNotes });
    } else {
      if (!reviewNotes.trim()) {
        alert('Catatan penolakan wajib diisi');
        return;
      }
      rejectMutation.mutate({ requestId: selectedRequest.id, notes: reviewNotes });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fadeIn">
        <h1 className="text-2xl font-semibold text-gray-900">Upgrade Pengusul</h1>
        <p className="text-sm text-gray-600 mt-1">
          Review dan setujui permintaan upgrade ke role Pengusul
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fadeIn ">
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-5 h-5 text-amber-600" />
            <span className="text-xs font-medium text-gray-500">PENDING</span>
          </div>
          <div className="text-2xl font-semibold text-gray-900">
            {requests?.length || 0}
          </div>
          <p className="text-xs text-gray-600 mt-1">Menunggu review</p>
        </div>
      </div>

      {/* Requests List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden animate-fadeIn ">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Permintaan Pending</h2>
          <p className="text-sm text-gray-600 mt-0.5">
            {requests?.length || 0} permintaan menunggu persetujuan Anda
          </p>
        </div>

        <div className="divide-y divide-gray-200">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-3" />
                <p className="text-sm text-gray-600">Memuat data...</p>
              </div>
            </div>
          ) : requests && requests.length > 0 ? (
            requests.map((request: UpgradeRequest) => (
              <div
                key={request.id}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* User Info */}
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-gray-900">
                          {request.user.name}
                        </h3>
                        <p className="text-sm text-gray-600">{request.user.email}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Diajukan pada {new Date(request.createdAt).toLocaleDateString('id-ID', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Request Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-start space-x-2 text-sm">
                        <FileText className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                        <div>
                          <span className="text-gray-500">KTP:</span>
                          <span className="ml-1 text-gray-900 font-medium">
                            {request.ktpNumber}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start space-x-2 text-sm">
                        <Phone className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                        <div>
                          <span className="text-gray-500">Telepon:</span>
                          <span className="ml-1 text-gray-900 font-medium">
                            {request.phone}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start space-x-2 text-sm md:col-span-2">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                        <div>
                          <span className="text-gray-500">Alamat:</span>
                          <span className="ml-1 text-gray-900">
                            {request.address}
                          </span>
                        </div>
                      </div>

                      {request.institutionName && (
                        <div className="flex items-start space-x-2 text-sm md:col-span-2">
                          <Building className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                          <div>
                            <span className="text-gray-500">Lembaga:</span>
                            <span className="ml-1 text-gray-900 font-medium">
                              {request.institutionName}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Documents */}
                    {request.ktpImageUrl && (
                      <div className="mb-4">
                        <p className="text-xs font-medium text-gray-500 mb-2">Foto KTP:</p>
                        <a
                          href={request.ktpImageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1.5 bg-primary-50 border border-primary-200 rounded-md text-sm text-primary-700 hover:bg-primary-100 transition-colors"
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Lihat Foto KTP
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleApprove(request)}
                      className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Setujui
                    </button>
                    <button
                      onClick={() => handleReject(request)}
                      className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Tolak
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">
                Tidak Ada Permintaan
              </h3>
              <p className="text-sm text-gray-600">
                Semua permintaan upgrade sudah ditinjau
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {actionType === 'approve' ? 'Setujui Permintaan' : 'Tolak Permintaan'}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Anda akan {actionType === 'approve' ? 'menyetujui' : 'menolak'} permintaan upgrade dari{' '}
              <strong>{selectedRequest.user.name}</strong>
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catatan {actionType === 'reject' && <span className="text-red-500">*</span>}
              </label>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                rows={3}
                placeholder={
                  actionType === 'approve'
                    ? 'Catatan tambahan (opsional)'
                    : 'Jelaskan alasan penolakan'
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required={actionType === 'reject'}
              />
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setReviewNotes('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmAction}
                disabled={approveMutation.isPending || rejectMutation.isPending}
                className={`flex-1 px-4 py-2 rounded-lg text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  actionType === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {approveMutation.isPending || rejectMutation.isPending
                  ? 'Memproses...'
                  : actionType === 'approve'
                  ? 'Ya, Setujui'
                  : 'Ya, Tolak'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
