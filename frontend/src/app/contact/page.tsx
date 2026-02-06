'use client';

import { useEffect, useState } from 'react';
import { staticPagesApi } from '@/lib/api';
import Link from 'next/link';
import { Mail, Phone, MapPin, Clock, MessageCircle } from 'lucide-react';

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
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">Memuat halaman...</p>
        </div>
      </div>
    );
  }

  const contactMethods = [
    {
      icon: <Mail className="w-6 h-6" />,
      title: 'Email',
      primary: 'info@sesama.org',
      secondary: 'support@sesama.org',
      description: 'Kirim email untuk pertanyaan umum atau bantuan',
      color: 'primary'
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: 'Telepon',
      primary: '+62 21 1234 5678',
      secondary: 'Senin - Jumat, 09:00 - 17:00 WIB',
      description: 'Hubungi kami langsung untuk bantuan cepat',
      color: 'accent'
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: 'WhatsApp',
      primary: '+62 812 3456 7890',
      secondary: 'Respon dalam 1-2 jam',
      description: 'Chat langsung dengan tim support kami',
      color: 'green'
    }
  ];

  const officeInfo = [
    {
      icon: <MapPin className="w-5 h-5" />,
      label: 'Alamat Kantor',
      value: 'Jl. Kemanusiaan No. 123, Jakarta Selatan 12345, Indonesia'
    },
    {
      icon: <Clock className="w-5 h-5" />,
      label: 'Jam Operasional',
      value: 'Senin - Jumat: 09:00 - 17:00 WIB | Sabtu: 09:00 - 13:00 WIB'
    }
  ];

  const socialMedia = [
    { name: 'Instagram', handle: '@sesama.id', url: '#', icon: '📸' },
    { name: 'Twitter', handle: '@sesama_id', url: '#', icon: '🐦' },
    { name: 'Facebook', handle: '/sesama.id', url: '#', icon: '👥' },
    { name: 'LinkedIn', handle: '/company/sesama', url: '#', icon: '💼' }
  ];

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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="text-white font-bold text-sm tracking-wide">Hubungi Kami</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Kami Siap Membantu Anda
            </h1>
            <p className="text-xl text-primary-50 leading-relaxed">
              Punya pertanyaan, saran, atau butuh bantuan? Tim kami siap memberikan dukungan terbaik untuk Anda.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Methods */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {contactMethods.map((method, index) => (
            <div
              key={method.title}
              className={`bg-white rounded-xl border border-gray-200 p-8 hover:shadow-lg transition-all hover-scale animate-fadeInUp stagger-${index + 1}`}
            >
              <div className={`w-14 h-14 ${
                method.color === 'primary' ? 'bg-primary-600' :
                method.color === 'accent' ? 'bg-accent-600' :
                'bg-green-600'
              } rounded-xl flex items-center justify-center mb-4 text-white`}>
                {method.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{method.title}</h3>
              <p className="text-sm text-gray-500 mb-4">{method.description}</p>
              <div className="space-y-1">
                <a href={method.title === 'Email' ? `mailto:${method.primary}` : `tel:${method.primary}`} className="block text-gray-900 font-semibold hover:text-primary-600 transition-colors">
                  {method.primary}
                </a>
                <p className="text-sm text-gray-500">{method.secondary}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Office Info & Social Media */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Office Information */}
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Informasi Kantor</h2>
            <div className="space-y-6">
              {officeInfo.map((info) => (
                <div key={info.label} className="flex gap-4">
                  <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center shrink-0 text-primary-600">
                    {info.icon}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">{info.label}</div>
                    <div className="text-gray-900">{info.value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Map placeholder */}
            <div className="mt-8 aspect-video bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Peta Lokasi</p>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Ikuti Kami</h2>
              <div className="space-y-4">
                {socialMedia.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-primary-200 hover:bg-primary-50 transition-all group"
                  >
                    <div className="text-3xl">{social.icon}</div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">{social.name}</div>
                      <div className="text-sm text-gray-500">{social.handle}</div>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-xl border border-primary-100 p-8">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Butuh Jawaban Cepat?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Kunjungi halaman FAQ kami untuk jawaban atas pertanyaan umum.
              </p>
              <Link
                href="/faq"
                className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium text-sm transition-colors"
              >
                Lihat FAQ
                <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Response Time */}
        <div className="mt-12 bg-white rounded-xl border border-gray-200 p-8">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-semibold mb-4">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>Respon Cepat</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Waktu Respon Kami</h3>
            <p className="text-gray-600">
              Kami berkomitmen untuk merespon setiap pertanyaan Anda dalam <strong>maksimal 24 jam</strong> di hari kerja.
              Untuk pertanyaan mendesak, gunakan WhatsApp untuk respon lebih cepat.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-500">
              &copy; 2026 sesama. Semua hak dilindungi.
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <Link href="/privacy" className="hover:text-gray-700">Privasi</Link>
              <Link href="/terms" className="hover:text-gray-700">Ketentuan</Link>
              <Link href="/faq" className="hover:text-gray-700">FAQ</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
