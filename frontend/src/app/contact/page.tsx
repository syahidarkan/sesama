'use client';

import { useEffect, useState } from 'react';
import { staticPagesApi } from '@/lib/api';
import Link from 'next/link';

export default function ContactPage() {
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPage();
  }, []);

  const fetchPage = async () => {
    try {
      const response = await staticPagesApi.getPage('contact');
      setPage(response.data);
    } catch (error) {
      console.error('Error fetching contact page:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  const defaultContent = `
    <div class="space-y-8">
      <div>
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Hubungi Kami</h2>
        <p class="text-gray-700 mb-6">
          Kami siap membantu Anda. Jangan ragu untuk menghubungi kami melalui saluran berikut.
        </p>
      </div>

      <div class="grid md:grid-cols-2 gap-8">
        <div class="border border-gray-200 rounded-lg p-6">
          <h3 class="font-semibold text-gray-900 mb-3">Email</h3>
          <p class="text-gray-700">info@sesama.org</p>
          <p class="text-gray-700">support@sesama.org</p>
        </div>

        <div class="border border-gray-200 rounded-lg p-6">
          <h3 class="font-semibold text-gray-900 mb-3">Telepon</h3>
          <p class="text-gray-700">+62 21 1234 5678</p>
          <p class="text-sm text-gray-600 mt-1">Senin - Jumat, 09:00 - 17:00 WIB</p>
        </div>

        <div class="border border-gray-200 rounded-lg p-6">
          <h3 class="font-semibold text-gray-900 mb-3">Alamat Kantor</h3>
          <p class="text-gray-700">
            Jl. Kemanusiaan No. 123<br>
            Jakarta Selatan 12345<br>
            Indonesia
          </p>
        </div>

        <div class="border border-gray-200 rounded-lg p-6">
          <h3 class="font-semibold text-gray-900 mb-3">Media Sosial</h3>
          <p class="text-gray-700">Instagram: @sesama.id</p>
          <p class="text-gray-700">Twitter: @sesama_id</p>
          <p class="text-gray-700">Facebook: /sesama.id</p>
        </div>
      </div>

      <div class="border-t border-gray-200 pt-8">
        <h3 class="font-semibold text-gray-900 mb-3">Pertanyaan Umum</h3>
        <p class="text-gray-700">
          Untuk pertanyaan yang sering diajukan, silakan kunjungi halaman <a href="/faq" class="text-orange-600 hover:text-orange-700 font-medium">FAQ</a> kami.
        </p>
      </div>
    </div>
  `;

  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              sesama
            </Link>
            <Link
              href="/"
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              Kembali
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {page?.title || 'Hubungi Kami'}
          </h1>
          {page?.updatedAt && (
            <p className="text-sm text-gray-500">
              Terakhir diperbarui: {new Date(page.updatedAt).toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          )}
        </div>

        <div className="bg-white prose prose-lg max-w-none">
          {page?.content ? (
            <div dangerouslySetInnerHTML={{ __html: page.content }} />
          ) : (
            <div dangerouslySetInnerHTML={{ __html: defaultContent }} />
          )}
        </div>
      </main>
    </div>
  );
}
