'use client';

import { useEffect, useState } from 'react';
import { staticPagesApi } from '@/lib/api';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPage();
  }, []);

  const fetchPage = async () => {
    try {
      const response = await staticPagesApi.getPage('privacy-policy');
      setPage(response.data);
    } catch (error) {
      console.error('Error fetching privacy policy:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  const defaultContent = `
    <div class="space-y-8">
      <div>
        <p class="text-gray-700">
          Kebijakan Privasi ini menjelaskan bagaimana Sesama mengumpulkan, menggunakan, dan melindungi informasi pribadi Anda.
          Dengan menggunakan platform kami, Anda menyetujui praktik yang dijelaskan dalam kebijakan ini.
        </p>
      </div>

      <div>
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Informasi yang Kami Kumpulkan</h2>
        <p class="text-gray-700 mb-4">Kami mengumpulkan informasi berikut:</p>
        <ul class="list-disc pl-6 space-y-2 text-gray-700">
          <li>Informasi identitas: nama, alamat email, nomor telepon</li>
          <li>Informasi pembayaran: data transaksi (kami tidak menyimpan detail kartu kredit)</li>
          <li>Informasi penggunaan: riwayat donasi, program yang Anda kunjungi</li>
          <li>Informasi teknis: alamat IP, jenis browser, sistem operasi</li>
        </ul>
      </div>

      <div>
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Bagaimana Kami Menggunakan Informasi</h2>
        <p class="text-gray-700 mb-4">Informasi Anda digunakan untuk:</p>
        <ul class="list-disc pl-6 space-y-2 text-gray-700">
          <li>Memproses donasi dan transaksi Anda</li>
          <li>Mengirimkan konfirmasi dan tanda terima donasi</li>
          <li>Memberikan update tentang program yang Anda dukung</li>
          <li>Meningkatkan layanan dan pengalaman pengguna</li>
          <li>Mencegah penipuan dan aktivitas yang tidak sah</li>
        </ul>
      </div>

      <div>
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Keamanan Data</h2>
        <p class="text-gray-700">
          Kami menggunakan enkripsi SSL/TLS untuk melindungi data Anda saat ditransmisikan.
          Data disimpan di server yang aman dengan akses terbatas. Kami secara rutin meninjau
          dan memperbarui langkah-langkah keamanan kami.
        </p>
      </div>

      <div>
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Berbagi Informasi</h2>
        <p class="text-gray-700">
          Kami tidak menjual, menyewakan, atau menukar informasi pribadi Anda kepada pihak ketiga.
          Kami hanya membagikan informasi yang diperlukan dengan:
        </p>
        <ul class="list-disc pl-6 space-y-2 text-gray-700 mt-4">
          <li>Payment gateway untuk memproses pembayaran</li>
          <li>Layanan email untuk mengirimkan notifikasi</li>
          <li>Otoritas hukum jika diwajibkan oleh hukum</li>
        </ul>
      </div>

      <div>
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Hak Anda</h2>
        <p class="text-gray-700">Anda memiliki hak untuk:</p>
        <ul class="list-disc pl-6 space-y-2 text-gray-700 mt-4">
          <li>Mengakses data pribadi Anda</li>
          <li>Meminta koreksi data yang tidak akurat</li>
          <li>Meminta penghapusan data Anda</li>
          <li>Menolak atau membatasi pemrosesan data</li>
          <li>Menarik persetujuan kapan saja</li>
        </ul>
      </div>

      <div>
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Cookie</h2>
        <p class="text-gray-700">
          Kami menggunakan cookie untuk meningkatkan pengalaman Anda. Cookie membantu kami mengingat preferensi Anda
          dan menganalisis penggunaan situs. Anda dapat menonaktifkan cookie melalui pengaturan browser Anda.
        </p>
      </div>

      <div>
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Perubahan Kebijakan</h2>
        <p class="text-gray-700">
          Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu. Perubahan akan diposting di halaman ini
          dengan tanggal pembaruan yang baru. Kami mendorong Anda untuk meninjau kebijakan ini secara berkala.
        </p>
      </div>

      <div>
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Hubungi Kami</h2>
        <p class="text-gray-700">
          Jika Anda memiliki pertanyaan tentang Kebijakan Privasi ini, silakan hubungi kami di
          <a href="/contact" class="text-teal-600 hover:text-teal-700 font-medium"> halaman kontak</a>.
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
            {page?.title || 'Kebijakan Privasi'}
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
