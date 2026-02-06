'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'next/navigation';
import { beritaApi } from '@/lib/api';
import FileUpload from '@/components/FileUpload';

export const dynamic = 'force-dynamic';

interface UploadedFile {
  id: string;
  filename: string;
  storedFilename: string;
  mimeType: string;
  size: number;
}

const CATEGORIES = [
  'POLITIK',
  'SOSIAL',
  'TEKNOLOGI',
  'EKONOMI',
  'PENDIDIKAN',
  'KESEHATAN',
  'OLAHRAGA',
  'HIBURAN',
  'LAINNYA',
];

export default function CreateBeritaPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [coverImageFiles, setCoverImageFiles] = useState<UploadedFile[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: 'SOSIAL',
  });

  // Only CONTENT_MANAGER, MANAGER, SUPER_ADMIN can access
  const allowedRoles = ['CONTENT_MANAGER', 'MANAGER', 'SUPER_ADMIN'];
  if (!user || !allowedRoles.includes(user.role)) {
    router.push('/admin');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert('Judul wajib diisi');
      return;
    }

    if (!formData.content.trim()) {
      alert('Konten wajib diisi');
      return;
    }

    setLoading(true);
    try {
      // Convert uploaded file to URL
      const coverImageUrl = coverImageFiles[0]?.storedFilename
        ? `${process.env.NEXT_PUBLIC_API_URL}/uploads/file/${coverImageFiles[0].storedFilename}`
        : '';

      await beritaApi.create({
        ...formData,
        coverImageUrl,
      });
      alert('Berita berhasil dipublikasi!');
      router.push('/admin/berita');
    } catch (error: any) {
      console.error('Failed to create berita:', error);
      alert('Gagal membuat berita: ' + (error.response?.data?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-semibold text-gray-900">Buat Berita Baru</h1>
          <p className="mt-1 text-sm text-gray-600">
            Berita akan langsung dipublikasi setelah dibuat (no approval)
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Judul Berita <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              placeholder="Masukkan judul berita"
              required
            />
          </div>

          {/* Category */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Kategori <span className="text-red-600">*</span>
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              required
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Cover Image Upload */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <FileUpload
              label="Gambar Cover"
              accept="image/*"
              multiple={false}
              maxSize={10}
              category="COVER_IMAGE"
              entityType="berita"
              fieldName="coverImage"
              description="Upload gambar cover untuk berita (max 10MB, opsional)"
              onChange={(files) => setCoverImageFiles(files)}
              value={coverImageFiles}
            />
          </div>

          {/* Excerpt */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Ringkasan (Excerpt)
            </label>
            <textarea
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              rows={3}
              className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              placeholder="Ringkasan singkat berita (opsional)"
            />
            <p className="mt-2 text-xs text-gray-500">
              Ringkasan akan ditampilkan di daftar berita
            </p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Konten Berita <span className="text-red-600">*</span>
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={15}
              className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 font-mono"
              placeholder="Tulis konten berita di sini. Anda bisa menggunakan HTML untuk formatting.

Contoh:
<p>Paragraf pertama...</p>
<p>Paragraf kedua...</p>
<ul>
  <li>Poin 1</li>
  <li>Poin 2</li>
</ul>"
              required
            />
            <p className="mt-2 text-xs text-gray-500">
              Anda bisa menggunakan HTML untuk formatting konten
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2.5 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
              disabled={loading}
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-sm bg-teal-500 text-white rounded-md hover:bg-teal-600 font-medium disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Mempublikasi...' : 'Publikasi Berita'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
