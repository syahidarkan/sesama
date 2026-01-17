'use client';

import { useEffect, useState } from 'react';
import { staticPagesApi } from '@/lib/api';
import Link from 'next/link';

export default function FAQPage() {
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPage();
  }, []);

  const fetchPage = async () => {
    try {
      const response = await staticPagesApi.getPage('faq');
      setPage(response.data);
    } catch (error) {
      console.error('Error fetching FAQ:', error);
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
      <div class="border-b border-gray-200 pb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Tentang Sesama</h2>

        <div class="space-y-6">
          <div>
            <h3 class="font-semibold text-gray-900 mb-2">Apa itu Sesama?</h3>
            <p class="text-gray-700">
              Sesama adalah platform donasi online yang menghubungkan donatur dengan mereka yang membutuhkan bantuan.
              Kami berkomitmen untuk transparansi penuh dan penyaluran dana yang akuntabel.
            </p>
          </div>

          <div>
            <h3 class="font-semibold text-gray-900 mb-2">Bagaimana cara kerja Sesama?</h3>
            <p class="text-gray-700">
              Anda dapat memilih program donasi yang ingin didukung, melakukan pembayaran melalui berbagai metode,
              dan menerima laporan penyaluran dana secara berkala. Setiap donasi tercatat dan dapat dilacak.
            </p>
          </div>
        </div>
      </div>

      <div class="border-b border-gray-200 pb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Donasi</h2>

        <div class="space-y-6">
          <div>
            <h3 class="font-semibold text-gray-900 mb-2">Bagaimana cara berdonasi?</h3>
            <p class="text-gray-700">
              Pilih program yang ingin Anda dukung, klik tombol "Donasi Sekarang", isi jumlah donasi dan data diri,
              lalu lakukan pembayaran. Anda akan menerima konfirmasi melalui email.
            </p>
          </div>

          <div>
            <h3 class="font-semibold text-gray-900 mb-2">Berapa minimal donasi?</h3>
            <p class="text-gray-700">
              Minimal donasi adalah Rp 10.000. Setiap kontribusi, berapapun jumlahnya, sangat berarti bagi mereka yang membutuhkan.
            </p>
          </div>

          <div>
            <h3 class="font-semibold text-gray-900 mb-2">Metode pembayaran apa saja yang tersedia?</h3>
            <p class="text-gray-700">
              Kami menerima pembayaran melalui transfer bank, kartu kredit/debit, e-wallet (GoPay, OVO, Dana),
              dan virtual account berbagai bank.
            </p>
          </div>

          <div>
            <h3 class="font-semibold text-gray-900 mb-2">Apakah donasi saya aman?</h3>
            <p class="text-gray-700">
              Ya, sangat aman. Kami menggunakan gateway pembayaran terenkripsi dan tidak menyimpan informasi kartu kredit Anda.
              Semua transaksi dilindungi dengan standar keamanan internasional.
            </p>
          </div>
        </div>
      </div>

      <div class="border-b border-gray-200 pb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Transparansi</h2>

        <div class="space-y-6">
          <div>
            <h3 class="font-semibold text-gray-900 mb-2">Bagaimana saya tahu donasi saya tersalurkan?</h3>
            <p class="text-gray-700">
              Kami mempublikasikan laporan penyaluran untuk setiap program di halaman Laporan.
              Anda juga dapat melihat progress setiap program secara real-time di dashboard.
            </p>
          </div>

          <div>
            <h3 class="font-semibold text-gray-900 mb-2">Apakah ada biaya administrasi?</h3>
            <p class="text-gray-700">
              Kami tidak memotong donasi Anda untuk biaya operasional. 100% donasi Anda akan disalurkan kepada penerima manfaat.
              Biaya payment gateway (jika ada) sudah termasuk dalam total pembayaran Anda.
            </p>
          </div>
        </div>
      </div>

      <div>
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Akun</h2>

        <div class="space-y-6">
          <div>
            <h3 class="font-semibold text-gray-900 mb-2">Apakah saya harus membuat akun untuk berdonasi?</h3>
            <p class="text-gray-700">
              Tidak. Anda dapat berdonasi tanpa membuat akun. Namun, dengan akun Anda dapat melihat riwayat donasi
              dan mendapatkan update terbaru dari program yang Anda dukung.
            </p>
          </div>

          <div>
            <h3 class="font-semibold text-gray-900 mb-2">Bagaimana cara membuat program donasi?</h3>
            <p class="text-gray-700">
              Daftar sebagai Pengusul melalui halaman registrasi, lengkapi profil dan dokumen yang diperlukan,
              lalu ajukan proposal program. Tim kami akan meninjau dan menghubungi Anda.
            </p>
          </div>
        </div>
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
            {page?.title || 'Pertanyaan yang Sering Diajukan'}
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
