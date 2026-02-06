'use client';

import { useState } from 'react';
import { referralApi } from '@/lib/api';
import { ReferralCode } from '@/types/referral';
import { Copy, Check, Share2, QrCode } from 'lucide-react';

interface ReferralCodeGeneratorProps {
  programId?: string;
  programSlug?: string;
  onCodeGenerated?: (code: ReferralCode) => void;
}

export default function ReferralCodeGenerator({
  programId,
  programSlug,
  onCodeGenerated,
}: ReferralCodeGeneratorProps) {
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState<ReferralCode | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const generateCode = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await referralApi.generateCode();
      setCode(response.data);
      if (onCodeGenerated) {
        onCodeGenerated(response.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal membuat kode referral');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const shareReferralLink = async () => {
    if (!code) return;

    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const link = programSlug
      ? `${baseUrl}/programs/${programSlug}?ref=${code.code}`
      : `${baseUrl}?ref=${code.code}`;
    const shareData = {
      title: 'Donasi Bersama Kita Bisa!',
      text: `Yuk donasi melalui link referral saya! Setiap donasi membantu program ${code.program?.title || 'kami'}.`,
      url: link,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      copyToClipboard(link);
    }
  };

  const buildReferralLink = () => {
    if (!code) return '';
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return programSlug
      ? `${baseUrl}/programs/${programSlug}?ref=${code.code}`
      : `${baseUrl}?ref=${code.code}`;
  };

  const referralLink = buildReferralLink();

  return (
    <div className="bg-white rounded-lg border border-primary-100 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-primary-50 p-3 rounded-lg">
          <Share2 className="text-primary-600" size={24} />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Link Referral</h3>
          <p className="text-sm text-gray-600">
            Dapatkan poin untuk setiap donasi melalui link Anda
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {!code ? (
        <button
          onClick={generateCode}
          disabled={loading}
          className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {loading ? 'Membuat...' : 'Buat Link Referral'}
        </button>
      ) : (
        <div className="space-y-4">
          {/* Referral Code Display */}
          <div className="bg-primary-50 rounded-lg p-4">
            <label className="text-sm text-gray-600 block mb-2">
              Kode Referral Anda:
            </label>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-white px-4 py-2 rounded border border-primary-200 font-mono text-lg font-bold text-primary-700">
                {code.code}
              </code>
              <button
                onClick={() => copyToClipboard(code.code)}
                className="p-2 hover:bg-primary-100 rounded-lg transition-colors"
                title="Salin kode"
              >
                {copied ? (
                  <Check size={20} className="text-green-600" />
                ) : (
                  <Copy size={20} className="text-gray-600" />
                )}
              </button>
            </div>
          </div>

          {/* Referral Link Display */}
          <div>
            <label className="text-sm text-gray-600 block mb-2">
              Link Referral Lengkap:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={referralLink}
                readOnly
                className="flex-1 bg-gray-50 px-4 py-2 rounded border border-gray-200 text-sm"
              />
              <button
                onClick={() => copyToClipboard(referralLink)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Salin link"
              >
                {copied ? (
                  <Check size={20} className="text-green-600" />
                ) : (
                  <Copy size={20} className="text-gray-600" />
                )}
              </button>
            </div>
          </div>

          {/* Share Button */}
          <button
            onClick={shareReferralLink}
            className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <Share2 size={18} />
            Bagikan Link Referral
          </button>

          {/* Info */}
          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-200">
            <p className="font-medium text-gray-900 mb-1">Cara Kerja:</p>
            <ul className="space-y-1 text-gray-600">
              <li>- Bagikan link referral Anda kepada teman</li>
              <li>- Setiap orang yang berdonasi melalui link Anda, Anda dapat 100 poin</li>
              <li>- Poin terakumulasi di leaderboard referral</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
