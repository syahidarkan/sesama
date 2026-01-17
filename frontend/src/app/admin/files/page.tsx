'use client';

import { useEffect, useState } from 'react';
import { uploadsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import Link from 'next/link';

interface UploadedFile {
  id: string;
  filename: string;
  storedFilename: string;
  mimeType: string;
  size: number;
  category: string;
  entityType?: string;
  entityId?: string;
  fieldName?: string;
  uploadedAt: string;
  uploader: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

interface StorageStats {
  totalFiles: number;
  totalSize: number;
  totalSizeFormatted: string;
  byCategory: Array<{
    category: string;
    count: number;
    size: number;
    sizeFormatted: string;
  }>;
}

export default function FilesManagementPage() {
  const { user } = useAuthStore();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [stats, setStats] = useState<StorageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    category: '',
    entityType: '',
  });

  useEffect(() => {
    fetchFiles();
    fetchStats();
  }, [filter]);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const response = await uploadsApi.getAllForAdmin({
        category: filter.category || undefined,
        entityType: filter.entityType || undefined,
        limit: 100,
      });
      setFiles(response.data.data);
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await uploadsApi.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('id-ID');
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('video/')) return '🎥';
    if (mimeType === 'application/pdf') return '📄';
    if (mimeType.includes('word') || mimeType.includes('.doc')) return '📝';
    if (mimeType.includes('excel') || mimeType.includes('.xls')) return '📊';
    if (mimeType.includes('powerpoint') || mimeType.includes('.ppt')) return '📑';
    return '📎';
  };

  const handleDelete = async (fileId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus file ini?')) return;

    try {
      await uploadsApi.delete(fileId);
      await fetchFiles();
      await fetchStats();
      alert('File berhasil dihapus');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Gagal menghapus file');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/dashboard"
            className="text-orange-600 hover:text-orange-700 mb-4 inline-block"
          >
            ← Kembali ke Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Manajemen File</h1>
          <p className="text-gray-600 mt-2">
            Kelola semua file yang diupload ke sistem
          </p>
        </div>

        {/* Storage Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600">Total File</div>
              <div className="text-3xl font-bold text-gray-900 mt-2">
                {stats.totalFiles}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600">Total Storage</div>
              <div className="text-3xl font-bold text-gray-900 mt-2">
                {stats.totalSizeFormatted}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600">Gambar</div>
              <div className="text-3xl font-bold text-blue-600 mt-2">
                {stats.byCategory.find((c) => c.category === 'COVER_IMAGE')?.count || 0}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600">Dokumen</div>
              <div className="text-3xl font-bold text-purple-600 mt-2">
                {stats.byCategory.filter((c) =>
                  ['PROPOSAL', 'AKTA_NOTARIS', 'SK_KEMENKUMHAM', 'NPWP'].includes(c.category)
                ).reduce((sum, c) => sum + c.count, 0)}
              </div>
            </div>
          </div>
        )}

        {/* Category Stats */}
        {stats && stats.byCategory.length > 0 && (
          <div className="bg-white rounded-lg shadow mb-8 p-6">
            <h2 className="text-lg font-semibold mb-4">Storage per Kategori</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.byCategory.map((cat) => (
                <div key={cat.category} className="border rounded p-3">
                  <div className="text-xs text-gray-600">{cat.category.replace(/_/g, ' ')}</div>
                  <div className="font-semibold">{cat.count} file</div>
                  <div className="text-sm text-gray-500">{cat.sizeFormatted}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <h2 className="text-lg font-semibold mb-4">Filter</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategori
              </label>
              <select
                value={filter.category}
                onChange={(e) => setFilter({ ...filter, category: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              >
                <option value="">Semua Kategori</option>
                <option value="KTP">KTP</option>
                <option value="PROPOSAL">Proposal</option>
                <option value="AKTA_NOTARIS">Akta Notaris</option>
                <option value="SK_KEMENKUMHAM">SK Kemenkumham</option>
                <option value="NPWP">NPWP</option>
                <option value="SURAT_DOMISILI">Surat Domisili</option>
                <option value="OFFICIAL_LETTER">Surat Resmi</option>
                <option value="BUDGET_PLAN">RAB</option>
                <option value="BUKTI_KONDISI">Bukti Kondisi</option>
                <option value="SURAT_KETERANGAN_RT">Surat Keterangan RT</option>
                <option value="COVER_IMAGE">Cover Image</option>
                <option value="OTHER">Lainnya</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipe Entity
              </label>
              <select
                value={filter.entityType}
                onChange={(e) => setFilter({ ...filter, entityType: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              >
                <option value="">Semua Tipe</option>
                <option value="program">Program</option>
                <option value="user">User</option>
                <option value="pelaporan">Pelaporan</option>
                <option value="berita">Berita</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilter({ category: '', entityType: '' })}
                className="w-full bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
              >
                Reset Filter
              </button>
            </div>
          </div>
        </div>

        {/* Files List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold">Daftar File ({files.length})</h2>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Memuat data...</p>
            </div>
          ) : files.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Tidak ada file yang ditemukan
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      File
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kategori
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Uploader
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal Upload
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {files.map((file) => (
                    <tr key={file.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">{getFileIcon(file.mimeType)}</span>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {file.filename}
                            </div>
                            <div className="text-xs text-gray-500">
                              {file.entityType && (
                                <span className="mr-2">
                                  {file.entityType} {file.fieldName && `(${file.fieldName})`}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                          {file.category.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatFileSize(file.size)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{file.uploader.name}</div>
                        <div className="text-xs text-gray-500">{file.uploader.role}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(file.uploadedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <a
                            href={uploadsApi.getFileUrl(file.storedFilename)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Lihat
                          </a>
                          <a
                            href={uploadsApi.getDownloadUrl(file.storedFilename)}
                            className="text-orange-600 hover:text-orange-800"
                          >
                            Download
                          </a>
                          {user?.role === 'SUPER_ADMIN' && (
                            <button
                              onClick={() => handleDelete(file.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Hapus
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
