'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { articlesApi, programsApi } from '@/lib/api';
import Link from 'next/link';
import FileUpload from '@/components/FileUpload';

interface UploadedFile {
  id: string;
  filename: string;
  storedFilename: string;
  mimeType: string;
  size: number;
}

export default function CreateArticlePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [programs, setPrograms] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [coverImageFiles, setCoverImageFiles] = useState<UploadedFile[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    programId: '',
  });

  const [submitForApproval, setSubmitForApproval] = useState(true);

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      // Hanya ambil program yang sudah CLOSED (selesai) untuk pelaporan penyaluran
      const response = await programsApi.getAll('CLOSED', 100, 0);
      setPrograms(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch programs:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Convert uploaded file to URL
      const coverImageUrl = coverImageFiles[0]?.storedFilename
        ? `${process.env.NEXT_PUBLIC_API_URL}/uploads/file/${coverImageFiles[0].storedFilename}`
        : '';

      const data = {
        title: formData.title,
        content: formData.content,
        excerpt: formData.excerpt || undefined,
        coverImageUrl: coverImageUrl || undefined,
        programId: formData.programId || undefined,
      };

      const response = await articlesApi.create(data);
      const articleId = response.data.id;

      // If user wants to submit for approval
      if (submitForApproval) {
        await articlesApi.submit(articleId);
        alert('Pelaporan berhasil dibuat dan disubmit untuk approval!');
      } else {
        alert('Pelaporan berhasil dibuat! Status: DRAFT');
      }

      router.push('/admin/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal membuat pelaporan');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Tulis Pelaporan Baru</h1>
              <p className="text-sm text-gray-600 mt-1">Buat laporan penyaluran atau pelaporan informatif</p>
            </div>
            <Link
              href="/admin/dashboard"
              className="text-sm text-gray-600 hover:text-gray-900 font-medium shrink-0"
            >
              ← Kembali
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-8">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Judul Pelaporan <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Contoh: Laporan Penyaluran Bantuan Pendidikan Bulan Januari 2024"
                className="w-full px-4 py-2.5 text-sm rounded-md border border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                required
              />
            </div>

            {/* Program Link */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Terkait Program (Opsional)
              </label>
              <select
                name="programId"
                value={formData.programId}
                onChange={handleChange}
                className="w-full px-4 py-2.5 text-sm rounded-md border border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              >
                <option value="">Tidak terkait program tertentu</option>
                {programs.map((program) => (
                  <option key={program.id} value={program.id}>
                    {program.title}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs text-gray-500">
                Pilih program jika pelaporan ini merupakan laporan penyaluran
              </p>
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Ringkasan Singkat
              </label>
              <textarea
                name="excerpt"
                value={formData.excerpt}
                onChange={handleChange}
                placeholder="Ringkasan pelaporan dalam 1-2 kalimat..."
                rows={3}
                className="w-full px-4 py-2.5 text-sm rounded-md border border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                maxLength={200}
              />
              <p className="mt-2 text-xs text-gray-500">
                Maksimal 200 karakter - akan ditampilkan di preview pelaporan
              </p>
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Konten Pelaporan <span className="text-red-600">*</span>
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="Tulis konten pelaporan lengkap di sini...

Anda bisa menulis:
- Detail penyaluran bantuan
- Jumlah penerima manfaat
- Dokumentasi kegiatan
- Dampak program
- Dan informasi lainnya"
                rows={15}
                className="w-full px-4 py-2.5 text-sm rounded-md border border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 font-mono"
                required
              />
            </div>

            {/* Cover Image Upload */}
            <FileUpload
              label="Gambar Cover"
              accept="image/*"
              multiple={false}
              maxSize={10}
              category="COVER_IMAGE"
              entityType="pelaporan"
              fieldName="coverImage"
              description="Upload gambar cover untuk pelaporan (max 10MB, opsional)"
              onChange={(files) => setCoverImageFiles(files)}
              value={coverImageFiles}
            />

            {/* Submit for Approval Checkbox */}
            <div className="bg-primary-50 border border-primary-200 rounded-md p-4">
              <label className="flex items-start cursor-pointer">
                <input
                  type="checkbox"
                  checked={submitForApproval}
                  onChange={(e) => setSubmitForApproval(e.target.checked)}
                  className="mt-1 mr-3 w-4 h-4 text-primary-600 rounded focus:ring-1 focus:ring-primary-500"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900 mb-1 text-sm">
                    Langsung submit untuk approval (Recommended)
                  </div>
                  <p className="text-xs text-gray-700">
                    Pelaporan akan otomatis disubmit ke Manager untuk approval setelah dibuat.
                    Jika tidak dicentang, pelaporan akan tersimpan sebagai DRAFT dan perlu
                    disubmit manual nanti.
                  </p>
                </div>
              </label>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex items-start">
                <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0 mt-0.5">i</div>
                <div className="text-sm text-gray-700">
                  <p className="font-medium mb-1 text-gray-900">Alur Approval:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Pelaporan dibuat → Status: <strong>DRAFT</strong></li>
                    <li>Pelaporan disubmit → Status: <strong>PENDING_APPROVAL</strong></li>
                    <li>Manager approve → Status: <strong>PUBLISHED</strong> (Publik bisa lihat)</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 text-sm rounded-md bg-primary-600 text-white font-medium hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Menyimpan...' : 'Buat Pelaporan'}
              </button>
              <Link
                href="/admin/dashboard"
                className="px-6 py-2.5 text-sm rounded-md border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Batal
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
