'use client';

import { useEffect, useState } from 'react';
import { staticPagesApi } from '@/lib/api';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';

export default function FAQPage() {
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

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

  const faqData = [
    {
      category: 'Tentang Sesama',
      icon: <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
      questions: [
        {
          q: 'Apa itu Sesama?',
          a: 'Sesama adalah platform donasi online yang menghubungkan donatur dengan mereka yang membutuhkan bantuan. Kami berkomitmen untuk transparansi penuh dan penyaluran dana yang akuntabel.'
        },
        {
          q: 'Bagaimana cara kerja Sesama?',
          a: 'Anda dapat memilih program donasi yang ingin didukung, melakukan pembayaran melalui berbagai metode, dan menerima laporan penyaluran dana secara berkala. Setiap donasi tercatat dan dapat dilacak.'
        },
        {
          q: 'Apakah Sesama lembaga resmi?',
          a: 'Ya, Sesama adalah platform resmi yang terdaftar dan diawasi. Kami bekerja sama dengan berbagai lembaga filantropi yang terverifikasi untuk memastikan setiap program berjalan sesuai standar.'
        }
      ]
    },
    {
      category: 'Donasi',
      icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
      questions: [
        {
          q: 'Bagaimana cara berdonasi?',
          a: 'Pilih program yang ingin Anda dukung, klik tombol "Donasi Sekarang", isi jumlah donasi dan data diri, lalu lakukan pembayaran. Anda akan menerima konfirmasi melalui email.'
        },
        {
          q: 'Berapa minimal donasi?',
          a: 'Minimal donasi adalah Rp 10.000. Setiap kontribusi, berapapun jumlahnya, sangat berarti bagi mereka yang membutuhkan.'
        },
        {
          q: 'Metode pembayaran apa saja yang tersedia?',
          a: 'Kami menerima pembayaran melalui transfer bank, kartu kredit/debit, e-wallet (GoPay, OVO, Dana), dan virtual account berbagai bank.'
        },
        {
          q: 'Apakah donasi saya aman?',
          a: 'Ya, sangat aman. Kami menggunakan gateway pembayaran terenkripsi dan tidak menyimpan informasi kartu kredit Anda. Semua transaksi dilindungi dengan standar keamanan internasional.'
        },
        {
          q: 'Apakah saya mendapat bukti donasi?',
          a: 'Ya, bukti donasi akan dikirimkan ke email Anda segera setelah pembayaran dikonfirmasi. Bukti ini dapat digunakan untuk keperluan pelaporan atau dokumentasi pribadi.'
        }
      ]
    },
    {
      category: 'Transparansi',
      icon: <><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>,
      questions: [
        {
          q: 'Bagaimana saya tahu donasi saya tersalurkan?',
          a: 'Kami mempublikasikan laporan penyaluran untuk setiap program di halaman Laporan. Anda juga dapat melihat progress setiap program secara real-time di dashboard.'
        },
        {
          q: 'Apakah ada biaya administrasi?',
          a: 'Kami tidak memotong donasi Anda untuk biaya operasional. 100% donasi Anda akan disalurkan kepada penerima manfaat. Biaya payment gateway (jika ada) sudah termasuk dalam total pembayaran Anda.'
        },
        {
          q: 'Berapa lama dana cair ke penerima?',
          a: 'Dana akan cair maksimal 24 jam setelah program mencapai target atau sesuai jadwal pencairan yang telah ditentukan. Semua pencairan tercatat dan dapat dilacak.'
        }
      ]
    },
    {
      category: 'Akun & Program',
      icon: <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
      questions: [
        {
          q: 'Apakah saya harus membuat akun untuk berdonasi?',
          a: 'Tidak. Anda dapat berdonasi tanpa membuat akun. Namun, dengan akun Anda dapat melihat riwayat donasi dan mendapatkan update terbaru dari program yang Anda dukung.'
        },
        {
          q: 'Bagaimana cara membuat program donasi?',
          a: 'Daftar sebagai Pengusul melalui halaman registrasi, lengkapi profil dan dokumen yang diperlukan, lalu ajukan proposal program. Tim kami akan meninjau dan menghubungi Anda.'
        },
        {
          q: 'Berapa lama verifikasi program?',
          a: 'Proses verifikasi biasanya memakan waktu 3-7 hari kerja. Tim kami akan menghubungi Anda jika memerlukan dokumen tambahan atau klarifikasi.'
        }
      ]
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">Memuat FAQ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-gray-200/80 bg-white/95 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-11 h-11 bg-primary-600 rounded-lg flex items-center justify-center border border-gray-200 shadow-md transform group-hover:scale-105 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                sesama
              </span>
            </Link>
            <Link
              href="/"
              className="inline-flex items-center px-5 py-2.5 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-lg hover:border-gray-300 hover:shadow-md transition-all"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative bg-primary-600 overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)]"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center space-x-2 bg-white/20 px-5 py-2.5 rounded-full mb-6 border border-white/30">
              <svg className="w-5 h-5 text-primary-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-white font-bold text-sm tracking-wide">Pusat Bantuan</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Pertanyaan yang Sering Diajukan
            </h1>
            <p className="text-xl text-primary-50 leading-relaxed">
              Temukan jawaban atas pertanyaan umum seputar donasi, program, dan cara kerja platform kami.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Content */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="space-y-8">
          {faqData.map((category, categoryIndex) => (
            <div key={category.category} className="animate-fadeInUp" style={{ animationDelay: `${categoryIndex * 0.1}s` }}>
              {/* Category Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    {category.icon}
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{category.category}</h2>
              </div>

              {/* Questions */}
              <div className="space-y-3">
                {category.questions.map((item, qIndex) => {
                  const globalIndex = categoryIndex * 100 + qIndex;
                  const isOpen = openIndex === globalIndex;

                  return (
                    <div key={qIndex} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-primary-200 transition-colors">
                      <button
                        onClick={() => setOpenIndex(isOpen ? null : globalIndex)}
                        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                      >
                        <span className="font-semibold text-gray-900 pr-4">{item.q}</span>
                        <ChevronDown
                          className={`w-5 h-5 text-primary-600 shrink-0 transition-transform duration-200 ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      <div
                        className={`overflow-hidden transition-all duration-300 ${
                          isOpen ? 'max-h-96' : 'max-h-0'
                        }`}
                      >
                        <div className="px-6 pb-4 pt-2">
                          <p className="text-gray-600 leading-relaxed">{item.a}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Still have questions CTA */}
        <div className="mt-16 bg-gradient-to-br from-primary-50 to-accent-50 rounded-2xl border border-primary-100 p-10 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Masih punya pertanyaan?</h3>
          <p className="text-gray-600 mb-6 max-w-xl mx-auto">
            Tim kami siap membantu menjawab pertanyaan Anda. Hubungi kami melalui halaman kontak.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-colors shadow-md"
            >
              Hubungi Kami
              <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center justify-center px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 rounded-lg font-medium border border-gray-200 transition-colors"
            >
              Pelajari Lebih Lanjut
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-500">
              &copy; 2026 sesama. Semua hak dilindungi.
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <Link href="/privacy" className="hover:text-gray-700">Privasi</Link>
              <Link href="/terms" className="hover:text-gray-700">Ketentuan</Link>
              <Link href="/contact" className="hover:text-gray-700">Kontak</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
