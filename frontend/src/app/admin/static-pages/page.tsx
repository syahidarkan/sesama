'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'next/navigation';
import { staticPagesApi } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default function AdminStaticPagesPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPage, setEditingPage] = useState<any>(null);
  const [showEditor, setShowEditor] = useState(false);

  // Only SUPER_ADMIN can access
  if (user?.role !== 'SUPER_ADMIN') {
    router.push('/admin');
    return null;
  }

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    setLoading(true);
    try {
      // Load both static pages
      const [aboutResponse, legalResponse] = await Promise.all([
        staticPagesApi.getPage('about-us'),
        staticPagesApi.getPage('legal'),
      ]);
      setPages([aboutResponse.data, legalResponse.data]);
    } catch (error) {
      console.error('Failed to load pages:', error);
      setPages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (page: any) => {
    setEditingPage({ ...page });
    setShowEditor(true);
  };

  const handleSave = async () => {
    if (!editingPage) return;

    try {
      await staticPagesApi.updatePage(editingPage.slug, {
        title: editingPage.title,
        content: editingPage.content,
      });
      alert('Halaman berhasil diupdate!');
      setShowEditor(false);
      setEditingPage(null);
      loadPages();
    } catch (error: any) {
      alert('Gagal update halaman: ' + error.response?.data?.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Kelola Halaman Statis</h1>
          <p className="mt-2 text-gray-600">
            Edit halaman About Us dan Legal (hanya SUPER_ADMIN)
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Memuat halaman...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pages.map((page) => (
              <div key={page.id} className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{page.title}</h3>
                <p className="text-sm text-gray-500 mb-4">Slug: {page.slug}</p>
                <div className="text-sm text-gray-600 mb-4">
                  <p>Terakhir diupdate: {new Date(page.updatedAt).toLocaleDateString('id-ID')}</p>
                  {page.lastEditor && <p>Oleh: {page.lastEditor.name}</p>}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleEdit(page)}
                    className="flex-1 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 font-medium"
                  >
                    Edit Halaman
                  </button>
                  <a
                    href={`/${page.slug === 'about-us' ? 'about' : page.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 font-medium text-center"
                  >
                    Preview
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Editor Modal */}
        {showEditor && editingPage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b sticky top-0 bg-white">
                <h2 className="text-2xl font-bold text-gray-900">Edit: {editingPage.title}</h2>
              </div>

              <div className="p-6 space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Judul Halaman
                  </label>
                  <input
                    type="text"
                    value={editingPage.title}
                    onChange={(e) =>
                      setEditingPage({ ...editingPage, title: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Konten (HTML)
                  </label>
                  <textarea
                    value={editingPage.content}
                    onChange={(e) =>
                      setEditingPage({ ...editingPage, content: e.target.value })
                    }
                    rows={20}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-mono text-sm"
                    placeholder="Masukkan konten HTML..."
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Anda bisa menggunakan HTML untuk formatting konten. Contoh:
                    <code className="ml-2">&lt;h2&gt;Judul&lt;/h2&gt;</code>,
                    <code className="ml-2">&lt;p&gt;Paragraf&lt;/p&gt;</code>,
                    <code className="ml-2">&lt;ul&gt;&lt;li&gt;List&lt;/li&gt;&lt;/ul&gt;</code>
                  </p>
                </div>

                {/* Preview */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preview
                  </label>
                  <div className="border border-gray-300 rounded-lg p-6 bg-gray-50">
                    <div
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: editingPage.content }}
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 border-t bg-gray-50 flex gap-4 justify-end">
                <button
                  onClick={() => {
                    setShowEditor(false);
                    setEditingPage(null);
                  }}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-white font-medium"
                >
                  Batal
                </button>
                <button
                  onClick={handleSave}
                  className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium"
                >
                  Simpan Perubahan
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
