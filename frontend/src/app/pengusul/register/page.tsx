'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { roleUpgradesApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import Link from 'next/link';
import FileUpload from '@/components/FileUpload';

interface UploadedFile {
  id: string;
  filename: string;
  storedFilename: string;
  mimeType: string;
  size: number;
}

interface FormData {
  ktpNumber: string;
  ktpImageFiles: UploadedFile[];
  phone: string;
  address: string;
  institutionName?: string;
  institutionProfile?: string;
  supportingDocumentFiles: UploadedFile[];
}

export default function PengusulRegisterPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    ktpNumber: '',
    ktpImageFiles: [],
    phone: '',
    address: '',
    institutionName: '',
    institutionProfile: '',
    supportingDocumentFiles: [],
  });

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    if (user?.role !== 'USER') {
      router.push('/dashboard');
      return;
    }
  }, [isAuthenticated, user, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.ktpNumber || formData.ktpNumber.length !== 16) {
          setError('Nomor KTP harus 16 digit');
          return false;
        }
        if (!formData.phone || formData.phone.length < 10) {
          setError('Nomor telepon tidak valid');
          return false;
        }
        if (!formData.address || formData.address.length < 10) {
          setError('Alamat terlalu pendek (minimal 10 karakter)');
          return false;
        }
        return true;

      case 2:
        return true;

      case 3:
        if (!formData.ktpImageFiles || formData.ktpImageFiles.length === 0) {
          setError('Foto KTP wajib diunggah');
          return false;
        }
        return true;

      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
      setError('');
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep(3)) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const ktpImageUrl = formData.ktpImageFiles[0]?.storedFilename
        ? `${process.env.NEXT_PUBLIC_API_URL}/uploads/file/${formData.ktpImageFiles[0].storedFilename}`
        : '';

      const supportingDocuments = formData.supportingDocumentFiles.map(
        (file) => `${process.env.NEXT_PUBLIC_API_URL}/uploads/file/${file.storedFilename}`
      );

      await roleUpgradesApi.submitPengusulRequest({
        ktpNumber: formData.ktpNumber,
        ktpImageUrl,
        phone: formData.phone,
        address: formData.address,
        institutionName: formData.institutionName || undefined,
        institutionProfile: formData.institutionProfile || undefined,
        supportingDocuments: supportingDocuments.length > 0 ? supportingDocuments : undefined,
      });

      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        'Gagal mendaftar sebagai pengusul. Silakan coba lagi.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Pendaftaran Berhasil
          </h2>
          <p className="text-gray-600 mb-6">
            Pendaftaran Anda sebagai pengusul sedang diproses. Tim kami akan meninjau
            dokumen Anda dan memberikan konfirmasi melalui email dalam 1-3 hari kerja.
          </p>
          <p className="text-sm text-gray-500">
            Mengarahkan ke beranda...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              SobatBantu
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

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`flex items-center ${step < 4 ? 'flex-1' : ''}`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      step <= currentStep
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {step}
                  </div>
                  {step < 4 && (
                    <div
                      className={`flex-1 h-1 mx-2 ${
                        step < currentStep ? 'bg-primary-500' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>Data Pribadi</span>
              <span>Lembaga</span>
              <span>Dokumen</span>
              <span>Review</span>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Pendaftaran Pengusul
          </h1>
          <p className="text-gray-600 mb-8">
            Lengkapi data berikut untuk mendaftar sebagai pengusul program donasi
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nomor KTP <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="ktpNumber"
                    value={formData.ktpNumber}
                    onChange={handleChange}
                    maxLength={16}
                    placeholder="Masukkan 16 digit nomor KTP"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nomor Telepon/WhatsApp <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Contoh: 081234567890"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Alamat Lengkap <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Masukkan alamat lengkap termasuk RT/RW, Kelurahan, Kecamatan, Kota/Kabupaten, Provinsi"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                  <p className="text-sm text-primary-800">
                    Jika Anda mewakili lembaga/organisasi, lengkapi data berikut. Jika
                    individu, Anda bisa melewati bagian ini.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nama Lembaga/Organisasi
                  </label>
                  <input
                    type="text"
                    name="institutionName"
                    value={formData.institutionName}
                    onChange={handleChange}
                    placeholder="Contoh: Yayasan Peduli SobatBantu"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Profil Lembaga
                  </label>
                  <textarea
                    name="institutionProfile"
                    value={formData.institutionProfile}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Deskripsikan profil lembaga, visi misi, dan bidang kegiatan"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <FileUpload
                  label="Foto KTP"
                  accept="image/*"
                  multiple={false}
                  maxSize={10}
                  category="KTP"
                  entityType="user"
                  fieldName="ktpImage"
                  required={true}
                  description="Upload foto KTP yang jelas dan dapat terbaca (max 10MB)"
                  onChange={(files) => setFormData((prev) => ({ ...prev, ktpImageFiles: files }))}
                  value={formData.ktpImageFiles}
                />

                <FileUpload
                  label="Dokumen Pendukung (Opsional)"
                  accept="image/*,application/pdf,.doc,.docx"
                  multiple={true}
                  maxSize={10}
                  category="LEGALITY_DOCS"
                  entityType="user"
                  fieldName="supportingDocs"
                  description="Upload sertifikat lembaga, SK kepengurusan, atau dokumen pendukung lainnya (max 10MB per file)"
                  onChange={(files) => setFormData((prev) => ({ ...prev, supportingDocumentFiles: files }))}
                  value={formData.supportingDocumentFiles}
                />
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-primary-800 font-medium">
                    Periksa kembali data Anda sebelum mengirim pendaftaran
                  </p>
                </div>

                <div className="border border-gray-200 rounded-lg p-6 space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Nomor KTP</h3>
                    <p className="text-gray-900">{formData.ktpNumber}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Nomor Telepon</h3>
                    <p className="text-gray-900">{formData.phone}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Alamat</h3>
                    <p className="text-gray-900">{formData.address}</p>
                  </div>

                  {formData.institutionName && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Nama Lembaga
                      </h3>
                      <p className="text-gray-900">{formData.institutionName}</p>
                    </div>
                  )}

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Foto KTP</h3>
                    <p className="text-primary-600">
                      {formData.ktpImageFiles.length > 0
                        ? `✓ ${formData.ktpImageFiles[0].filename}`
                        : '✗ Belum diupload'}
                    </p>
                  </div>

                  {formData.supportingDocumentFiles.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Dokumen Pendukung
                      </h3>
                      <p className="text-primary-600">
                        ✓ {formData.supportingDocumentFiles.length} dokumen
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mt-8">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Kembali
                </button>
              )}

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="ml-auto px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors"
                >
                  Lanjut
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="ml-auto px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? 'Mengirim...' : 'Kirim Pendaftaran'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
