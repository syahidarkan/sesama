'use client';

import { useEffect, useState } from 'react';
import { uploadsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import Link from 'next/link';
import { ArrowLeft, Loader2, FileText, Image, File, HardDrive, Trash2, Download, Eye, Filter } from 'lucide-react';

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
    if (mimeType.startsWith('image/')) return <Image className="w-5 h-5 text-blue-600" />;
    if (mimeType === 'application/pdf') return <FileText className="w-5 h-5 text-red-600" />;
    return <File className="w-5 h-5 text-gray-600" />;
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

  if (loading && !stats) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600 mb-3" />
        <p className="text-sm text-gray-600">Memuat data file...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/dashboard"
          className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-orange-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Manajemen File</h1>
          <p className="text-sm text-gray-600 mt-1">Kelola semua file yang diupload ke sistem</p>
        </div>
      </div>

      {/* Storage Statistics */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <File className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-2xl font-semibold text-gray-900 mb-1">{stats.totalFiles}</div>
            <div className="text-sm text-gray-600">Total File</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <HardDrive className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-2xl font-semibold text-gray-900 mb-1">{stats.totalSizeFormatted}</div>
            <div className="text-sm text-gray-600">Total Storage</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <Image className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-2xl font-semibold text-blue-600 mb-1">
              {stats.byCategory.find((c) => c.category === 'COVER_IMAGE')?.count || 0}
            </div>
            <div className="text-sm text-gray-600">Gambar</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <FileText className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-2xl font-semibold text-purple-600 mb-1">
              {stats.byCategory.filter((c) =>
                ['PROPOSAL', 'AKTA_NOTARIS', 'SK_KEMENKUMHAM', 'NPWP'].includes(c.category)
              ).reduce((sum, c) => sum + c.count, 0)}
            </div>
            <div className="text-sm text-gray-600">Dokumen</div>
          </div>
        </div>
      )}

      {/* Category Stats */}
      {stats && stats.byCategory.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Storage per Kategori</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {stats.byCategory.map((cat) => (
              <div key={cat.category} className="bg-gray-50 rounded-md border border-gray-200 p-3">
                <div className="text-xs text-gray-600 mb-1">{cat.category.replace(/_/g, ' ')}</div>
                <div className="text-sm font-medium text-gray-900">{cat.count} file</div>
                <div className="text-xs text-gray-500">{cat.sizeFormatted}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="w-4 h-4 text-gray-500" />
          <h2 className="text-base font-semibold text-gray-900">Filter</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kategori
            </label>
            <select
              value={filter.category}
              onChange={(e) => setFilter({ ...filter, category: e.target.value })}
              className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors outline-none"
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
              className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors outline-none"
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
              className="w-full px-6 py-2.5 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 transition-colors"
            >
              Reset Filter
            </button>
          </div>
        </div>
      </div>

      {/* Files List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900">Daftar File ({files.length})</h2>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-orange-600 mb-3" />
            <p className="text-sm text-gray-600">Memuat data...</p>
          </div>
        ) : files.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <File className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">Tidak ada file</h3>
            <p className="text-sm text-gray-600">Tidak ada file yang ditemukan dengan filter ini</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    File
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Kategori
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Uploader
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Tanggal Upload
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {files.map((file) => (
                  <tr key={file.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          {getFileIcon(file.mimeType)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                            {file.filename}
                          </div>
                          {file.entityType && (
                            <div className="text-xs text-gray-500">
                              {file.entityType} {file.fieldName && `(${file.fieldName})`}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2.5 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded border border-blue-200">
                        {file.category.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatFileSize(file.size)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{file.uploader.name}</div>
                      <div className="text-xs text-gray-500">{file.uploader.role}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(file.uploadedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <a
                          href={uploadsApi.getFileUrl(file.storedFilename)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-blue-300 text-blue-700 hover:bg-blue-50 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Lihat</span>
                        </a>
                        <a
                          href={uploadsApi.getDownloadUrl(file.storedFilename)}
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-orange-300 text-orange-700 hover:bg-orange-50 transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </a>
                        {user?.role === 'SUPER_ADMIN' && (
                          <button
                            onClick={() => handleDelete(file.id)}
                            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-red-300 text-red-700 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Hapus</span>
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
  );
}
