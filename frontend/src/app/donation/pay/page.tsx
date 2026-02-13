'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { paymentsApi } from '@/lib/api';
import Link from 'next/link';
import QRCode from 'qrcode';

function PaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const orderId = searchParams.get('order_id');
  const trxId = searchParams.get('trx_id');
  const type = searchParams.get('type') || 'qris';
  const address = searchParams.get('address') || '';
  const amount = searchParams.get('amount') || '0';
  const name = searchParams.get('name') || 'Donatur';

  const [status, setStatus] = useState<string>('pending');
  const [checking, setChecking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(30 * 60); // 30 minutes
  const [simulating, setSimulating] = useState(false);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Generate QR code from QRIS address
  useEffect(() => {
    if (type === 'qris' && address && qrCanvasRef.current) {
      QRCode.toCanvas(qrCanvasRef.current, address, {
        width: 280,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      }).catch(console.error);
    }
  }, [type, address]);

  // Auto-check status every 10 seconds
  useEffect(() => {
    if (!orderId) return;

    const interval = setInterval(async () => {
      try {
        const res = await paymentsApi.getStatus(orderId);
        const data = res.data?.data;
        if (data?.status === 'completed') {
          setStatus('completed');
          clearInterval(interval);
          setTimeout(() => {
            router.push(`/donation/success?order_id=${orderId}`);
          }, 2000);
        } else if (data?.status === 'failed') {
          setStatus('failed');
          clearInterval(interval);
        }
      } catch (err) {
        // Silently ignore polling errors
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [orderId, router]);

  const formatCurrency = (val: string | number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(Number(val));
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const checkStatusManually = async () => {
    if (!orderId) return;
    setChecking(true);
    try {
      const res = await paymentsApi.getStatus(orderId);
      const data = res.data?.data;
      if (data?.status === 'completed') {
        setStatus('completed');
        setTimeout(() => {
          router.push(`/donation/success?order_id=${orderId}`);
        }, 2000);
      } else if (data?.status === 'failed') {
        setStatus('failed');
      }
    } catch (err) {
      // ignore
    } finally {
      setChecking(false);
    }
  };

  const simulatePayment = async () => {
    if (!orderId) return;
    setSimulating(true);
    try {
      await paymentsApi.sandboxSimulate(orderId, Number(amount));
      setStatus('completed');
      setTimeout(() => {
        router.push(`/donation/success?order_id=${orderId}`);
      }, 2000);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Simulate gagal');
    } finally {
      setSimulating(false);
    }
  };

  if (status === 'completed') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Pembayaran Berhasil!</h2>
          <p className="text-gray-600">Mengalihkan ke halaman sukses...</p>
        </div>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-lg border border-gray-200 p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Pembayaran Gagal</h2>
          <p className="text-gray-600 text-sm mb-6">Pembayaran tidak dapat diproses. Silakan coba lagi.</p>
          <Link
            href="/"
            className="inline-flex items-center px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium text-sm rounded-lg transition-colors"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-gray-900 mb-1">Selesaikan Pembayaran</h1>
          <p className="text-gray-600 text-sm">Lakukan pembayaran sebelum waktu habis</p>
        </div>

        {/* Timer */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4 text-center">
          <p className="text-xs text-gray-500 mb-1">Batas waktu pembayaran</p>
          <p className={`text-2xl font-mono font-bold ${countdown < 300 ? 'text-red-600' : 'text-gray-900'}`}>
            {formatTime(countdown)}
          </p>
        </div>

        {/* Payment Amount */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Total Pembayaran</span>
            <span className="text-xs text-gray-400 uppercase font-medium">{type}</span>
          </div>
          <p className="text-2xl font-bold text-primary-600">{formatCurrency(amount)}</p>
          <p className="text-xs text-gray-500 mt-1">Atas nama: {name}</p>
        </div>

        {/* Payment Details */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-4">
          <div className="bg-primary-600 px-4 py-3">
            <h2 className="text-white font-semibold text-sm">
              {type === 'qris' ? 'Scan QRIS' : 'Transfer Virtual Account'}
            </h2>
          </div>

          <div className="p-4">
            {type === 'qris' ? (
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                  Scan kode QRIS di bawah ini menggunakan aplikasi e-wallet atau mobile banking Anda
                </p>
                {address && (
                  <div className="flex flex-col items-center mb-4">
                    <div className="bg-white border-2 border-gray-200 rounded-xl p-4 inline-block shadow-sm">
                      <canvas ref={qrCanvasRef} />
                    </div>
                  </div>
                )}
                <p className="text-xs text-gray-500">
                  Mendukung: GoPay, OVO, DANA, ShopeePay, LinkAja, dan semua bank
                </p>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-600 mb-3">
                  Transfer ke nomor Virtual Account berikut:
                </p>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Nomor VA</p>
                    <p className="font-mono text-lg font-bold text-gray-900">{address}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(address)}
                    className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-medium rounded-lg transition-colors"
                  >
                    {copied ? 'Tersalin!' : 'Salin'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
          <h3 className="font-semibold text-sm text-gray-900 mb-3">Cara Pembayaran:</h3>
          {type === 'qris' ? (
            <ol className="text-sm text-gray-600 space-y-2">
              <li className="flex gap-2">
                <span className="shrink-0 w-5 h-5 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                Buka aplikasi e-wallet atau mobile banking
              </li>
              <li className="flex gap-2">
                <span className="shrink-0 w-5 h-5 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                Pilih menu Scan/QRIS
              </li>
              <li className="flex gap-2">
                <span className="shrink-0 w-5 h-5 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                Scan kode QRIS yang tertera di atas
              </li>
              <li className="flex gap-2">
                <span className="shrink-0 w-5 h-5 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-bold">4</span>
                Konfirmasi dan selesaikan pembayaran
              </li>
            </ol>
          ) : (
            <ol className="text-sm text-gray-600 space-y-2">
              <li className="flex gap-2">
                <span className="shrink-0 w-5 h-5 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                Buka mobile banking atau ATM
              </li>
              <li className="flex gap-2">
                <span className="shrink-0 w-5 h-5 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                Pilih menu Transfer Virtual Account
              </li>
              <li className="flex gap-2">
                <span className="shrink-0 w-5 h-5 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                Masukkan nomor VA yang tertera di atas
              </li>
              <li className="flex gap-2">
                <span className="shrink-0 w-5 h-5 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-bold">4</span>
                Konfirmasi jumlah dan selesaikan transfer
              </li>
            </ol>
          )}
        </div>

        {/* Check Status Button */}
        <button
          onClick={checkStatusManually}
          disabled={checking}
          className="w-full py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white font-medium text-sm rounded-lg transition-colors mb-3"
        >
          {checking ? 'Memeriksa...' : 'Saya Sudah Bayar - Cek Status'}
        </button>

        <p className="text-center text-xs text-gray-500 mb-4">
          Status pembayaran akan diperbarui secara otomatis
        </p>

        {/* Sandbox Simulate Button - hanya untuk testing */}
        <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
          <p className="text-xs text-yellow-700 mb-2 font-medium">[SANDBOX MODE] Tombol ini hanya untuk uji coba</p>
          <button
            onClick={simulatePayment}
            disabled={simulating}
            className="w-full py-2.5 bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-300 text-white font-medium text-sm rounded-lg transition-colors"
          >
            {simulating ? 'Memproses...' : 'Simulate Pembayaran Berhasil'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-600 rounded-full">
          <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    }>
      <PaymentContent />
    </Suspense>
  );
}
