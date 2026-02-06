'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { pelaporanApi, programsApi } from '@/lib/api';
import Link from 'next/link';
import FileUpload from '@/components/FileUpload';

interface UploadedFile {
  id: string;
  filename: string;
  storedFilename: string;
  mimeType: string;
  size: number;
}

export default function CreatePelaporanPage() {
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
      // Ambil program CLOSED untuk pelaporan penyaluran
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

      const response = await pelaporanApi.create(data);
      const pelaporanId = response.data.id;

      // If user wants to submit for approval
      if (submitForApproval) {
        await pelaporanApi.submit(pelaporanId);
        alert('Pelaporan berhasil dibuat dan disubmit untuk approval!');
      } else {
        alert('Pelaporan berhasil dibuat! Status: DRAFT');
      }

      router.push('/admin/pelaporan');
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
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Buat Pelaporan Baru</h1>
              <p className="text-sm text-gray-600">Buat laporan penyaluran atau update program</p>
            </div>
            <Link
              href="/admin/pelaporan"
              className="text-gray-600 hover:text-gray-700 font-medium"
            >
              ← Kembali
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Judul Pelaporan <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Contoh: Laporan Penyaluran Bantuan Pendidikan Bulan Januari 2024"
                className="w-full px-4 py-2.5 rounded-md border border-gray-300 focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                required
              />
            </div>

            {/* Program Link */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Terkait Program (Opsional)
              </label>
              <select
                name="programId"
                value={formData.programId}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-md border border-gray-300 focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="">Tidak terkait program tertentu</option>
                {programs.map((program) => (
                  <option key={program.id} value={program.id}>
                    {program.title}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-500">
                Pilih program jika pelaporan ini merupakan laporan penyaluran
              </p>
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Ringkasan Singkat
              </label>
              <textarea
                name="excerpt"
                value={formData.excerpt}
                onChange={handleChange}
                placeholder="Ringkasan pelaporan dalam 1-2 kalimat..."
                rows={3}
                className="w-full px-4 py-2.5 rounded-md border border-gray-300 focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                maxLength={200}
              />
              <p className="mt-1 text-sm text-gray-500">
                Maksimal 200 karakter - akan ditampilkan di preview
              </p>
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                className="w-full px-4 py-2.5 rounded-md border border-gray-300 focus:ring-1 focus:ring-teal-500 focus:border-teal-500 font-mono text-sm"
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
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <label className="flex items-start cursor-pointer">
                <input
                  type="checkbox"
                  checked={submitForApproval}
                  onChange={(e) => setSubmitForApproval(e.target.checked)}
                  className="mt-1 mr-3 w-5 h-5 text-green-600 rounded focus:ring-1 focus:ring-teal-500"
                />
                <div className="flex-1">
                  <div className="font-semibold text-green-900 mb-1">
                    Langsung submit untuk approval (Recommended)
                  </div>
                  <p className="text-sm text-green-800">
                    Pelaporan akan otomatis disubmit ke Manager untuk approval setelah dibuat.
                    Jika tidak dicentang, pelaporan akan tersimpan sebagai DRAFT.
                  </p>
                </div>
              </label>
            </div>

            {/* Info Box */}
            <div className="bg-cyan-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="text-xl mr-3">Info</div>
                <div className="text-sm text-cyan-800">
                  <p className="font-semibold mb-1">Alur Approval:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Pelaporan dibuat → Status: <strong>DRAFT</strong></li>
                    <li>Pelaporan disubmit → Status: <strong>PENDING_APPROVAL</strong></li>
                    <li>Manager approve → Status: <strong>PUBLISHED</strong> (Publik bisa lihat)</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 rounded-lg bg-teal-500 text-white font-bold hover:bg-teal-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Menyimpan...' : 'Buat Pelaporan'}
              </button>
              <Link
                href="/admin/pelaporan"
                className="px-8 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
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
