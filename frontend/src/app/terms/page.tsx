'use client';

import { useEffect, useState } from 'react';
import { staticPagesApi } from '@/lib/api';
import Link from 'next/link';

export default function TermsPage() {
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPage();
  }, []);

  const fetchPage = async () => {
    try {
      const response = await staticPagesApi.getPage('terms-of-service');
      setPage(response.data);
    } catch (error) {
      console.error('Error fetching terms:', error);
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
        <p class="text-gray-700">
          Syarat dan Ketentuan ini mengatur penggunaan platform Sesama.
          Dengan mengakses atau menggunakan layanan kami, Anda menyetujui untuk terikat oleh ketentuan ini.
        </p>
      </div>

      <div>
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Penggunaan Platform</h2>
        <p class="text-gray-700 mb-4">Dengan menggunakan Sesama, Anda setuju untuk:</p>
        <ul class="list-disc pl-6 space-y-2 text-gray-700">
          <li>Memberikan informasi yang akurat dan lengkap</li>
          <li>Menjaga kerahasiaan akun Anda</li>
          <li>Tidak menyalahgunakan platform untuk tujuan ilegal</li>
          <li>Tidak mengganggu atau merusak sistem kami</li>
          <li>Menghormati hak kekayaan intelektual kami</li>
        </ul>
      </div>

      <div>
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Donasi</h2>
        <p class="text-gray-700 mb-4">Mengenai donasi:</p>
        <ul class="list-disc pl-6 space-y-2 text-gray-700">
          <li>Semua donasi bersifat sukarela dan tidak dapat dikembalikan kecuali dalam keadaan tertentu</li>
          <li>Kami berhak menolak atau mengembalikan donasi yang mencurigakan</li>
          <li>Donasi akan disalurkan sesuai dengan program yang Anda pilih</li>
          <li>Anda akan menerima tanda terima resmi untuk setiap donasi</li>
          <li>100% donasi Anda akan disalurkan kepada penerima manfaat</li>
        </ul>
      </div>

      <div>
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Program Penggalangan Dana</h2>
        <p class="text-gray-700 mb-4">Untuk yang mengajukan program:</p>
        <ul class="list-disc pl-6 space-y-2 text-gray-700">
          <li>Semua informasi yang diberikan harus akurat dan dapat diverifikasi</li>
          <li>Kami berhak meminta dokumen pendukung tambahan</li>
          <li>Program dapat ditolak atau ditutup tanpa pemberitahuan jika melanggar ketentuan</li>
          <li>Dana yang terkumpul akan dicairkan sesuai dengan jadwal yang disepakati</li>
          <li>Pengusul wajib memberikan laporan penggunaan dana secara berkala</li>
        </ul>
      </div>

      <div>
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Tanggung Jawab</h2>
        <p class="text-gray-700">
          Sesama bertindak sebagai platform penghubung antara donatur dan penerima bantuan.
          Kami berusaha memverifikasi setiap program, namun tidak bertanggung jawab atas:
        </p>
        <ul class="list-disc pl-6 space-y-2 text-gray-700 mt-4">
          <li>Keakuratan informasi yang diberikan oleh pengusul program</li>
          <li>Penggunaan dana oleh penerima bantuan</li>
          <li>Hasil akhir dari program penggalangan dana</li>
          <li>Kerugian yang timbul dari penggunaan platform</li>
        </ul>
      </div>

      <div>
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Pembayaran</h2>
        <p class="text-gray-700">
          Semua pembayaran diproses melalui payment gateway pihak ketiga yang aman dan terenkripsi.
          Biaya transaksi (jika ada) sudah termasuk dalam total pembayaran yang ditampilkan.
          Kami tidak menyimpan informasi kartu kredit Anda.
        </p>
      </div>

      <div>
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Pengembalian Dana</h2>
        <p class="text-gray-700">
          Donasi umumnya bersifat final dan tidak dapat dikembalikan. Pengembalian dana hanya akan dipertimbangkan dalam kasus:
        </p>
        <ul class="list-disc pl-6 space-y-2 text-gray-700 mt-4">
          <li>Kesalahan teknis yang menyebabkan pembayaran ganda</li>
          <li>Program dinyatakan palsu atau melanggar ketentuan kami</li>
          <li>Program dibatalkan sebelum dana disalurkan</li>
        </ul>
      </div>

      <div>
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Privasi</h2>
        <p class="text-gray-700">
          Penggunaan informasi pribadi Anda diatur oleh
          <a href="/privacy" class="text-orange-600 hover:text-orange-700 font-medium"> Kebijakan Privasi</a> kami.
          Silakan baca dokumen tersebut untuk memahami bagaimana kami mengumpulkan, menggunakan, dan melindungi data Anda.
        </p>
      </div>

      <div>
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Perubahan Ketentuan</h2>
        <p class="text-gray-700">
          Kami berhak mengubah Syarat dan Ketentuan ini kapan saja. Perubahan akan diposting di halaman ini
          dan mulai berlaku segera setelah dipublikasikan. Penggunaan platform setelah perubahan berarti
          Anda menerima ketentuan yang diperbarui.
        </p>
      </div>

      <div>
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Hukum yang Berlaku</h2>
        <p class="text-gray-700">
          Syarat dan Ketentuan ini diatur oleh dan ditafsirkan sesuai dengan hukum Republik Indonesia.
          Setiap perselisihan akan diselesaikan melalui pengadilan yang berwenang di Jakarta.
        </p>
      </div>

      <div>
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Kontak</h2>
        <p class="text-gray-700">
          Jika Anda memiliki pertanyaan tentang Syarat dan Ketentuan ini, silakan hubungi kami di
          <a href="/contact" class="text-orange-600 hover:text-orange-700 font-medium"> halaman kontak</a>.
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
            {page?.title || 'Syarat dan Ketentuan'}
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
