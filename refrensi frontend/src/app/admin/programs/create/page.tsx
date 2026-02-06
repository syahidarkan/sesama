'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { programsApi } from '@/lib/api';
import Link from 'next/link';
import FileUpload from '@/components/FileUpload';
import { FileText, Building2, FileCheck, BarChart3, User, Edit3, CreditCard, Image, Camera, File } from 'lucide-react';

interface UploadedFile {
  id: string;
  filename: string;
  storedFilename: string;
  mimeType: string;
  size: number;
}

type ProgramType = 'INDIVIDU' | 'LEMBAGA' | null;

// Steps untuk CONTENT_MANAGER (3 langkah - sederhana)
const CONTENT_MANAGER_STEPS = [
  { id: 1, name: 'Informasi Program', icon: FileText },
  { id: 2, name: 'Detail & Target', icon: Edit3 },
  { id: 3, name: 'Rekening Bank', icon: CreditCard },
];

// Steps untuk LEMBAGA (7 langkah)
const LEMBAGA_STEPS = [
  { id: 1, name: 'Informasi Dasar', icon: FileText },
  { id: 2, name: 'Profil Lembaga', icon: Building2 },
  { id: 3, name: 'Dokumen Legalitas', icon: File },
  { id: 4, name: 'Proposal & RAB', icon: BarChart3 },
  { id: 5, name: 'Contact Person', icon: User },
  { id: 6, name: 'Detail Program', icon: Edit3 },
  { id: 7, name: 'Rekening Bank', icon: CreditCard },
];

// Steps untuk INDIVIDU (5 langkah)
const INDIVIDU_STEPS = [
  { id: 1, name: 'Informasi Dasar', icon: FileText },
  { id: 2, name: 'Data Pengaju', icon: User },
  { id: 3, name: 'Bukti Kondisi', icon: Camera },
  { id: 4, name: 'Surat Keterangan', icon: FileCheck },
  { id: 5, name: 'Rekening Penerima', icon: CreditCard },
];

export default function CreateProgramPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [programType, setProgramType] = useState<ProgramType>(null);
  const [currentStep, setCurrentStep] = useState(1);

  // File upload states
  const [imageFiles, setImageFiles] = useState<UploadedFile[]>([]);
  const [aktaNotarisFiles, setAktaNotarisFiles] = useState<UploadedFile[]>([]);
  const [skKemenkumhamFiles, setSkKemenkumhamFiles] = useState<UploadedFile[]>([]);
  const [npwpFiles, setNpwpFiles] = useState<UploadedFile[]>([]);
  const [suratDomisiliFiles, setSuratDomisiliFiles] = useState<UploadedFile[]>([]);
  const [legalityDocsFiles, setLegalityDocsFiles] = useState<UploadedFile[]>([]);
  const [proposalFiles, setProposalFiles] = useState<UploadedFile[]>([]);
  const [officialLetterFiles, setOfficialLetterFiles] = useState<UploadedFile[]>([]);
  const [budgetPlanFiles, setBudgetPlanFiles] = useState<UploadedFile[]>([]);
  const [ktpPengajuFiles, setKtpPengajuFiles] = useState<UploadedFile[]>([]);
  const [buktiKondisiFiles, setBuktiKondisiFiles] = useState<UploadedFile[]>([]);
  const [suratKeteranganRtFiles, setSuratKeteranganRtFiles] = useState<UploadedFile[]>([]);

  // Check if user is PENGUSUL (needs full form with proposal)
  const isPengusul = user?.role === 'PENGUSUL';
  // CONTENT_MANAGER, MANAGER, SUPER_ADMIN get simple form
  const isSimpleForm = ['CONTENT_MANAGER', 'MANAGER', 'SUPER_ADMIN'].includes(user?.role || '');

  const [formData, setFormData] = useState({
    // Common: Informasi Dasar
    title: '',
    description: '',
    targetAmount: '',
    category: '',
    location: '',
    startDate: '',
    endDate: '',

    // ========== LEMBAGA SPECIFIC (PENGUSUL only) ==========
    institutionName: '',
    institutionAddress: '',
    institutionPhone: '',
    institutionEmail: '',
    institutionType: '',
    institutionEstablished: '',
    institutionProfile: '',

    // Contact Person (PENGUSUL only)
    picName: '',
    picPosition: '',
    picPhone: '',
    picEmail: '',

    // Detail Program
    beneficiaryCount: '',
    programObjective: '',
    implementationPlan: '',
    expectedOutput: '',
    sustainabilityPlan: '',

    // Rekening Bank
    bankName: '',
    bankAccountNumber: '',
    bankAccountName: '',

    // ========== INDIVIDU SPECIFIC (PENGUSUL only) ==========
    applicantName: '',
    applicantKtpNumber: '',
    applicantPhone: '',
    applicantAddress: '',

    // Bukti Kondisi
    kondisiDescription: '',

    // Surat Keterangan RT/RW
    rtRwName: '',
    rtRwPhone: '',

    // Rekening Penerima (for INDIVIDU)
    beneficiaryBankName: '',
    beneficiaryBankAccount: '',
    beneficiaryAccountName: '',
  });

  // Determine which steps to use
  const getSteps = () => {
    if (isSimpleForm) return CONTENT_MANAGER_STEPS;
    if (programType === 'LEMBAGA') return LEMBAGA_STEPS;
    if (programType === 'INDIVIDU') return INDIVIDU_STEPS;
    return [];
  };

  const steps = getSteps();
  const totalSteps = steps.length;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateStep = (step: number): boolean => {
    setError('');

    // For CONTENT_MANAGER simple form
    if (isSimpleForm) {
      if (step === 1) {
        if (!formData.title) {
          setError('Judul program wajib diisi');
          return false;
        }
        if (!formData.category) {
          setError('Kategori program wajib diisi');
          return false;
        }
        if (!formData.targetAmount) {
          setError('Target donasi wajib diisi');
          return false;
        }
      }
      if (step === 2) {
        if (!formData.description) {
          setError('Deskripsi program wajib diisi');
          return false;
        }
        if (!formData.programObjective) {
          setError('Tujuan program wajib diisi');
          return false;
        }
      }
      if (step === 3) {
        if (!formData.bankName) {
          setError('Nama bank wajib diisi');
          return false;
        }
        if (!formData.bankAccountNumber) {
          setError('No rekening wajib diisi');
          return false;
        }
        if (!formData.bankAccountName) {
          setError('Nama pemilik rekening wajib diisi');
          return false;
        }
      }
      return true;
    }

    // For PENGUSUL - LEMBAGA
    if (programType === 'LEMBAGA') {
      if (step === 1) {
        if (!formData.title || !formData.category || !formData.targetAmount) {
          setError('Semua field pada informasi dasar wajib diisi');
          return false;
        }
      }
      if (step === 2) {
        if (!formData.institutionName || !formData.institutionType || !formData.institutionAddress) {
          setError('Nama lembaga, jenis lembaga, dan alamat wajib diisi');
          return false;
        }
      }
      if (step === 3) {
        if (aktaNotarisFiles.length === 0 || npwpFiles.length === 0) {
          setError('Akta Notaris dan NPWP wajib diisi');
          return false;
        }
      }
      if (step === 4) {
        if (proposalFiles.length === 0) {
          setError('Proposal & RAB wajib diisi');
          return false;
        }
      }
      if (step === 5) {
        if (!formData.picName || !formData.picPhone) {
          setError('Nama dan nomor HP PIC wajib diisi');
          return false;
        }
      }
      if (step === 6) {
        if (!formData.description || !formData.programObjective) {
          setError('Deskripsi dan tujuan program wajib diisi');
          return false;
        }
      }
      if (step === 7) {
        if (!formData.bankName || !formData.bankAccountNumber || !formData.bankAccountName) {
          setError('Semua informasi rekening bank wajib diisi');
          return false;
        }
      }
      return true;
    }

    // For PENGUSUL - INDIVIDU
    if (programType === 'INDIVIDU') {
      if (step === 1) {
        if (!formData.title || !formData.category || !formData.targetAmount || !formData.description) {
          setError('Semua field pada informasi dasar wajib diisi');
          return false;
        }
      }
      if (step === 2) {
        if (!formData.applicantName || !formData.applicantPhone || ktpPengajuFiles.length === 0) {
          setError('Nama, nomor HP, dan foto KTP pengaju wajib diisi');
          return false;
        }
      }
      if (step === 3) {
        if (buktiKondisiFiles.length === 0) {
          setError('Foto/video bukti kondisi wajib diisi');
          return false;
        }
      }
      if (step === 4) {
        if (suratKeteranganRtFiles.length === 0) {
          setError('Surat keterangan RT/RW/Kelurahan wajib diisi');
          return false;
        }
      }
      if (step === 5) {
        if (!formData.beneficiaryBankName || !formData.beneficiaryBankAccount || !formData.beneficiaryAccountName) {
          setError('Semua informasi rekening penerima wajib diisi');
          return false;
        }
      }
      return true;
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    setError('');
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setLoading(true);
    setError('');

    try {
      // Convert uploaded files to URLs
      const imageUrl = imageFiles[0]?.storedFilename
        ? `${process.env.NEXT_PUBLIC_API_URL}/uploads/file/${imageFiles[0].storedFilename}`
        : '';

      let data: any = {
        title: formData.title,
        description: formData.description,
        targetAmount: parseFloat(formData.targetAmount),
        category: formData.category,
        location: formData.location || undefined,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
        imageUrl: imageUrl || undefined,
        programObjective: formData.programObjective || undefined,
        implementationPlan: formData.implementationPlan || undefined,
        expectedOutput: formData.expectedOutput || undefined,
        sustainabilityPlan: formData.sustainabilityPlan || undefined,
        beneficiaryCount: formData.beneficiaryCount ? parseInt(formData.beneficiaryCount) : undefined,
      };

      // For PENGUSUL with LEMBAGA
      if (isPengusul && programType === 'LEMBAGA') {
        const aktaNotaris = aktaNotarisFiles[0]?.storedFilename
          ? `${process.env.NEXT_PUBLIC_API_URL}/uploads/file/${aktaNotarisFiles[0].storedFilename}`
          : '';
        const skKemenkumham = skKemenkumhamFiles[0]?.storedFilename
          ? `${process.env.NEXT_PUBLIC_API_URL}/uploads/file/${skKemenkumhamFiles[0].storedFilename}`
          : '';
        const npwp = npwpFiles[0]?.storedFilename
          ? `${process.env.NEXT_PUBLIC_API_URL}/uploads/file/${npwpFiles[0].storedFilename}`
          : '';
        const suratDomisili = suratDomisiliFiles[0]?.storedFilename
          ? `${process.env.NEXT_PUBLIC_API_URL}/uploads/file/${suratDomisiliFiles[0].storedFilename}`
          : '';
        const legalityDocs = legalityDocsFiles[0]?.storedFilename
          ? `${process.env.NEXT_PUBLIC_API_URL}/uploads/file/${legalityDocsFiles[0].storedFilename}`
          : '';
        const proposalUrl = proposalFiles[0]?.storedFilename
          ? `${process.env.NEXT_PUBLIC_API_URL}/uploads/file/${proposalFiles[0].storedFilename}`
          : '';
        const officialLetterUrl = officialLetterFiles[0]?.storedFilename
          ? `${process.env.NEXT_PUBLIC_API_URL}/uploads/file/${officialLetterFiles[0].storedFilename}`
          : '';
        const budgetPlanUrl = budgetPlanFiles[0]?.storedFilename
          ? `${process.env.NEXT_PUBLIC_API_URL}/uploads/file/${budgetPlanFiles[0].storedFilename}`
          : '';

        data = {
          ...data,
          programType: 'LEMBAGA',
          institutionName: formData.institutionName || undefined,
          institutionAddress: formData.institutionAddress || undefined,
          institutionPhone: formData.institutionPhone || undefined,
          institutionEmail: formData.institutionEmail || undefined,
          institutionType: formData.institutionType || undefined,
          institutionEstablished: formData.institutionEstablished || undefined,
          institutionProfile: formData.institutionProfile || undefined,
          aktaNotaris: aktaNotaris || undefined,
          skKemenkumham: skKemenkumham || undefined,
          npwp: npwp || undefined,
          suratDomisili: suratDomisili || undefined,
          legalityDocs: legalityDocs || undefined,
          proposalUrl: proposalUrl || undefined,
          officialLetterUrl: officialLetterUrl || undefined,
          budgetPlanUrl: budgetPlanUrl || undefined,
          picName: formData.picName || undefined,
          picPosition: formData.picPosition || undefined,
          picPhone: formData.picPhone || undefined,
          picEmail: formData.picEmail || undefined,
          bankName: formData.bankName || undefined,
          bankAccountNumber: formData.bankAccountNumber || undefined,
          bankAccountName: formData.bankAccountName || undefined,
        };
      }

      // For PENGUSUL with INDIVIDU
      if (isPengusul && programType === 'INDIVIDU') {
        const ktpPengajuUrl = ktpPengajuFiles[0]?.storedFilename
          ? `${process.env.NEXT_PUBLIC_API_URL}/uploads/file/${ktpPengajuFiles[0].storedFilename}`
          : '';
        const buktiKondisiUrls = buktiKondisiFiles.map(
          (file) => `${process.env.NEXT_PUBLIC_API_URL}/uploads/file/${file.storedFilename}`
        );
        const suratKeteranganRtUrl = suratKeteranganRtFiles[0]?.storedFilename
          ? `${process.env.NEXT_PUBLIC_API_URL}/uploads/file/${suratKeteranganRtFiles[0].storedFilename}`
          : '';

        data = {
          ...data,
          programType: 'INDIVIDU',
          applicantName: formData.applicantName || undefined,
          applicantKtpNumber: formData.applicantKtpNumber || undefined,
          applicantPhone: formData.applicantPhone || undefined,
          applicantAddress: formData.applicantAddress || undefined,
          ktpPengajuUrl: ktpPengajuUrl || undefined,
          buktiKondisiUrls: buktiKondisiUrls.length > 0 ? buktiKondisiUrls : undefined,
          kondisiDescription: formData.kondisiDescription || undefined,
          suratKeteranganRtUrl: suratKeteranganRtUrl || undefined,
          rtRwName: formData.rtRwName || undefined,
          rtRwPhone: formData.rtRwPhone || undefined,
          beneficiaryBankName: formData.beneficiaryBankName || undefined,
          beneficiaryBankAccount: formData.beneficiaryBankAccount || undefined,
          beneficiaryAccountName: formData.beneficiaryAccountName || undefined,
        };
      }

      // For CONTENT_MANAGER (simple form)
      if (isSimpleForm) {
        data = {
          ...data,
          programType: 'LEMBAGA', // Default to LEMBAGA for simple form
          bankName: formData.bankName || undefined,
          bankAccountNumber: formData.bankAccountNumber || undefined,
          bankAccountName: formData.bankAccountName || undefined,
        };
      }

      await programsApi.create(data);

      if (isSimpleForm) {
        alert('Program berhasil dibuat dan akan masuk approval!');
      } else {
        alert('Program berhasil dibuat! Status: DRAFT. Silakan submit untuk approval.');
      }

      router.push('/admin/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal membuat program');
    } finally {
      setLoading(false);
    }
  };

  // For PENGUSUL - Show program type selection first
  if (isPengusul && !programType) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Buat Program Donasi</h1>
                <p className="text-sm text-gray-600 mt-1">Pilih jenis program yang ingin Anda ajukan</p>
              </div>
              <Link
                href="/admin/dashboard"
                className="text-sm text-gray-600 hover:text-gray-900 font-medium"
              >
                ← Kembali
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-2 gap-6">
            {/* INDIVIDU Card */}
            <button
              onClick={() => setProgramType('INDIVIDU')}
              className="bg-white rounded-lg border border-gray-200 p-8 hover:border-teal-500 transition-colors text-left group"
            >
              <div className="w-12 h-12 rounded-lg bg-teal-100 flex items-center justify-center mb-4 group-hover:bg-orange-200 transition-colors">
                <User className="w-6 h-6 text-teal-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Program Individu</h2>
              <p className="text-sm text-gray-600 mb-6">
                Untuk membantu individu/perorangan yang membutuhkan bantuan mendesak
              </p>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-start">
                  <span className="text-teal-600 mr-2 mt-0.5">•</span>
                  <span>Tetangga yang sakit parah</span>
                </div>
                <div className="flex items-start">
                  <span className="text-teal-600 mr-2 mt-0.5">•</span>
                  <span>Korban bencana/kebakaran</span>
                </div>
                <div className="flex items-start">
                  <span className="text-teal-600 mr-2 mt-0.5">•</span>
                  <span>Kebutuhan pendidikan anak</span>
                </div>
                <div className="flex items-start">
                  <span className="text-teal-600 mr-2 mt-0.5">•</span>
                  <span>Biaya pengobatan mendesak</span>
                </div>
                <div className="flex items-start">
                  <span className="text-teal-600 mr-2 mt-0.5">•</span>
                  <span>Kebutuhan mendesak lainnya</span>
                </div>
              </div>
              <div className="mt-6 px-3 py-1.5 rounded-md bg-teal-50 text-teal-700 text-xs font-medium inline-block">
                Form Sederhana (5 Langkah)
              </div>
            </button>

            {/* LEMBAGA Card */}
            <button
              onClick={() => setProgramType('LEMBAGA')}
              className="bg-white rounded-lg border border-gray-200 p-8 hover:border-teal-500 transition-colors text-left group"
            >
              <div className="w-12 h-12 rounded-lg bg-teal-100 flex items-center justify-center mb-4 group-hover:bg-orange-200 transition-colors">
                <Building2 className="w-6 h-6 text-teal-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Program Lembaga</h2>
              <p className="text-sm text-gray-600 mb-6">
                Untuk program dari lembaga/organisasi yang terverifikasi
              </p>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-start">
                  <span className="text-teal-600 mr-2 mt-0.5">•</span>
                  <span>Yayasan pendidikan</span>
                </div>
                <div className="flex items-start">
                  <span className="text-teal-600 mr-2 mt-0.5">•</span>
                  <span>Pondok pesantren</span>
                </div>
                <div className="flex items-start">
                  <span className="text-teal-600 mr-2 mt-0.5">•</span>
                  <span>Masjid & musholla</span>
                </div>
                <div className="flex items-start">
                  <span className="text-teal-600 mr-2 mt-0.5">•</span>
                  <span>LAZ dan lembaga sosial</span>
                </div>
                <div className="flex items-start">
                  <span className="text-teal-600 mr-2 mt-0.5">•</span>
                  <span>Organisasi kemasyarakatan</span>
                </div>
              </div>
              <div className="mt-6 px-3 py-1.5 rounded-md bg-teal-50 text-teal-700 text-xs font-medium inline-block">
                Form Lengkap (7 Langkah)
              </div>
            </button>
          </div>

          <div className="mt-8 bg-amber-50 border border-amber-200 rounded-lg p-6">
            <div className="flex items-start">
              <div className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0 mt-0.5">!</div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Penting untuk Diperhatikan</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Pastikan semua data yang diisi adalah <strong>benar dan valid</strong></li>
                  <li>• Upload dokumen langsung melalui form ini (max 100MB per file)</li>
                  <li>• Dokumen yang diupload akan otomatis tersimpan dan terverifikasi</li>
                  <li>• Program akan melalui <strong>verifikasi Manager</strong> sebelum dipublikasikan</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Form
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                {isSimpleForm ? 'Buat Program Donasi' : `Buat Program ${programType}`}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {isSimpleForm
                  ? 'Form sederhana untuk Content Manager'
                  : `Isi formulir lengkap untuk program ${programType?.toLowerCase()}`}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {isPengusul && programType && (
                <button
                  onClick={() => {
                    setProgramType(null);
                    setCurrentStep(1);
                    setError('');
                  }}
                  className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                >
                  Ganti Tipe
                </button>
              )}
              <Link
                href="/admin/dashboard"
                className="text-sm text-gray-600 hover:text-gray-900 font-medium"
              >
                ← Kembali
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              return (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        currentStep === step.id
                          ? 'bg-teal-500 text-white'
                          : currentStep > step.id
                          ? 'bg-teal-100 text-teal-600'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      <StepIcon className="w-5 h-5" />
                    </div>
                    <span
                      className={`mt-2 text-xs font-medium text-center max-w-[80px] ${
                        currentStep === step.id
                          ? 'text-gray-900'
                          : currentStep > step.id
                          ? 'text-gray-600'
                          : 'text-gray-400'
                      }`}
                    >
                      {step.name}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`h-0.5 w-12 mx-2 transition-all ${
                        currentStep > step.id
                          ? 'bg-teal-500'
                          : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* CONTENT_MANAGER Forms */}
          {isSimpleForm && currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Informasi Program</h2>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Judul Program <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Contoh: Bantuan Pendidikan Anak Yatim 2024"
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Kategori <span className="text-red-600">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  required
                >
                  <option value="">Pilih Kategori</option>
                  <option value="Pendidikan">Pendidikan</option>
                  <option value="Kesehatan">Kesehatan</option>
                  <option value="Bencana Alam">Bencana Alam</option>
                  <option value="Kemanusiaan">Kemanusiaan</option>
                  <option value="Infrastruktur">Infrastruktur</option>
                  <option value="Dakwah">Dakwah</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Target Donasi (Rp) <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  name="targetAmount"
                  value={formData.targetAmount}
                  onChange={handleChange}
                  placeholder="10000000"
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  required
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Lokasi Program
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Contoh: Jakarta Selatan"
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <FileUpload
                label="Gambar Banner Program"
                accept="image/*"
                multiple={false}
                maxSize={10}
                category="COVER_IMAGE"
                entityType="program"
                fieldName="imageUrl"
                description="Upload gambar banner untuk program (max 10MB, opsional)"
                onChange={(files) => setImageFiles(files)}
                value={imageFiles}
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Tanggal Mulai
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Tanggal Berakhir
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </div>
            </div>
          )}

          {isSimpleForm && currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Detail & Target</h2>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Deskripsi Program <span className="text-red-600">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Jelaskan program donasi ini secara detail..."
                  rows={6}
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Tujuan Program <span className="text-red-600">*</span>
                </label>
                <textarea
                  name="programObjective"
                  value={formData.programObjective}
                  onChange={handleChange}
                  placeholder="Apa tujuan dari program ini?"
                  rows={4}
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Jumlah Penerima Manfaat (estimasi)
                </label>
                <input
                  type="number"
                  name="beneficiaryCount"
                  value={formData.beneficiaryCount}
                  onChange={handleChange}
                  placeholder="100"
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Rencana Pelaksanaan
                </label>
                <textarea
                  name="implementationPlan"
                  value={formData.implementationPlan}
                  onChange={handleChange}
                  placeholder="Bagaimana program ini akan dilaksanakan?"
                  rows={4}
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Output yang Diharapkan
                </label>
                <textarea
                  name="expectedOutput"
                  value={formData.expectedOutput}
                  onChange={handleChange}
                  placeholder="Apa hasil yang diharapkan dari program ini?"
                  rows={3}
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>
          )}

          {isSimpleForm && currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Rekening Bank</h2>

              <div className="bg-cyan-50 border border-blue-200 rounded-md p-4 mb-6">
                <p className="text-sm text-gray-700">
                  Masukkan informasi rekening bank yang akan digunakan untuk menerima dana donasi.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Nama Bank <span className="text-red-600">*</span>
                </label>
                <select
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  required
                >
                  <option value="">Pilih Bank</option>
                  <option value="BCA">BCA</option>
                  <option value="Mandiri">Mandiri</option>
                  <option value="BNI">BNI</option>
                  <option value="BRI">BRI</option>
                  <option value="BSI">BSI (Bank Syariah Indonesia)</option>
                  <option value="CIMB Niaga">CIMB Niaga</option>
                  <option value="Permata">Permata</option>
                  <option value="Danamon">Danamon</option>
                  <option value="BTN">BTN</option>
                  <option value="Muamalat">Muamalat</option>
                  <option value="BCA Syariah">BCA Syariah</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Nomor Rekening <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="bankAccountNumber"
                  value={formData.bankAccountNumber}
                  onChange={handleChange}
                  placeholder="1234567890"
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Nama Pemilik Rekening <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="bankAccountName"
                  value={formData.bankAccountName}
                  onChange={handleChange}
                  placeholder="Nama sesuai rekening bank"
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  Pastikan nama sesuai dengan yang tertera di rekening bank
                </p>
              </div>
            </div>
          )}

          {/* PENGUSUL - LEMBAGA Forms */}
          {isPengusul && programType === 'LEMBAGA' && currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Informasi Dasar Program</h2>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Judul Program <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Contoh: Bantuan Pendidikan Anak Yatim 2024"
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Kategori <span className="text-red-600">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  required
                >
                  <option value="">Pilih Kategori</option>
                  <option value="Pendidikan">Pendidikan</option>
                  <option value="Kesehatan">Kesehatan</option>
                  <option value="Bencana Alam">Bencana Alam</option>
                  <option value="Kemanusiaan">Kemanusiaan</option>
                  <option value="Infrastruktur">Infrastruktur</option>
                  <option value="Dakwah">Dakwah</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Target Donasi (Rp) <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  name="targetAmount"
                  value={formData.targetAmount}
                  onChange={handleChange}
                  placeholder="10000000"
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  required
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Lokasi Program
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Contoh: Jakarta Selatan"
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <FileUpload
                label="Gambar Banner Program"
                accept="image/*"
                multiple={false}
                maxSize={10}
                category="COVER_IMAGE"
                entityType="program"
                fieldName="imageUrl"
                description="Upload gambar banner untuk program (max 10MB, opsional)"
                onChange={(files) => setImageFiles(files)}
                value={imageFiles}
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Tanggal Mulai
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Tanggal Berakhir
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </div>
            </div>
          )}

          {isPengusul && programType === 'LEMBAGA' && currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Profil Lembaga</h2>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Nama Lembaga <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="institutionName"
                  value={formData.institutionName}
                  onChange={handleChange}
                  placeholder="Contoh: Yayasan Pendidikan Al-Ikhlas"
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Jenis Lembaga <span className="text-red-600">*</span>
                </label>
                <select
                  name="institutionType"
                  value={formData.institutionType}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  required
                >
                  <option value="">Pilih Jenis Lembaga</option>
                  <option value="Yayasan">Yayasan</option>
                  <option value="Perkumpulan">Perkumpulan</option>
                  <option value="Pondok Pesantren">Pondok Pesantren</option>
                  <option value="Madrasah">Madrasah</option>
                  <option value="Masjid">Masjid</option>
                  <option value="Organisasi Kemasyarakatan">Organisasi Kemasyarakatan</option>
                  <option value="LAZ">LAZ (Lembaga Amil Zakat)</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Alamat Lengkap Lembaga <span className="text-red-600">*</span>
                </label>
                <textarea
                  name="institutionAddress"
                  value={formData.institutionAddress}
                  onChange={handleChange}
                  placeholder="Jalan, Kelurahan, Kecamatan, Kota/Kabupaten, Provinsi"
                  rows={3}
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Nomor Telepon Lembaga
                </label>
                <input
                  type="tel"
                  name="institutionPhone"
                  value={formData.institutionPhone}
                  onChange={handleChange}
                  placeholder="021-12345678"
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Email Lembaga
                </label>
                <input
                  type="email"
                  name="institutionEmail"
                  value={formData.institutionEmail}
                  onChange={handleChange}
                  placeholder="info@lembaga.org"
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Tahun Berdiri
                </label>
                <input
                  type="text"
                  name="institutionEstablished"
                  value={formData.institutionEstablished}
                  onChange={handleChange}
                  placeholder="2020"
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Profil Singkat Lembaga
                </label>
                <textarea
                  name="institutionProfile"
                  value={formData.institutionProfile}
                  onChange={handleChange}
                  placeholder="Ceritakan tentang lembaga Anda..."
                  rows={4}
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>
          )}

          {isPengusul && programType === 'LEMBAGA' && currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Dokumen Legalitas</h2>

              <div className="bg-cyan-50 border border-blue-200 rounded-md p-4 mb-6">
                <p className="text-sm text-gray-700">
                  Upload dokumen langsung melalui form di bawah ini. File akan tersimpan otomatis.
                </p>
              </div>

              <FileUpload
                label="Akta Notaris"
                accept="application/pdf,image/*"
                multiple={false}
                maxSize={10}
                category="AKTA_NOTARIS"
                entityType="program"
                fieldName="aktaNotaris"
                required={true}
                description="Upload akta notaris lembaga (PDF/Image, max 10MB)"
                onChange={(files) => setAktaNotarisFiles(files)}
                value={aktaNotarisFiles}
              />

              <FileUpload
                label="SK Kemenkumham"
                accept="application/pdf,image/*"
                multiple={false}
                maxSize={10}
                category="SK_KEMENKUMHAM"
                entityType="program"
                fieldName="skKemenkumham"
                description="Upload SK Kemenkumham (PDF/Image, max 10MB)"
                onChange={(files) => setSkKemenkumhamFiles(files)}
                value={skKemenkumhamFiles}
              />

              <FileUpload
                label="NPWP"
                accept="application/pdf,image/*"
                multiple={false}
                maxSize={10}
                category="NPWP"
                entityType="program"
                fieldName="npwp"
                required={true}
                description="Upload NPWP lembaga (PDF/Image, max 10MB)"
                onChange={(files) => setNpwpFiles(files)}
                value={npwpFiles}
              />

              <FileUpload
                label="Surat Domisili"
                accept="application/pdf,image/*"
                multiple={false}
                maxSize={10}
                category="SURAT_DOMISILI"
                entityType="program"
                fieldName="suratDomisili"
                description="Upload surat domisili lembaga (PDF/Image, max 10MB)"
                onChange={(files) => setSuratDomisiliFiles(files)}
                value={suratDomisiliFiles}
              />

              <FileUpload
                label="Dokumen Legalitas Lainnya"
                accept="application/pdf,image/*"
                multiple={false}
                maxSize={10}
                category="LEGALITY_DOCS"
                entityType="program"
                fieldName="legalityDocs"
                description="Upload dokumen legalitas tambahan (PDF/Image, max 10MB)"
                onChange={(files) => setLegalityDocsFiles(files)}
                value={legalityDocsFiles}
              />
            </div>
          )}

          {isPengusul && programType === 'LEMBAGA' && currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Proposal & RAB</h2>

              <div className="bg-cyan-50 border border-blue-200 rounded-md p-4 mb-6">
                <p className="text-sm text-gray-700">
                  Upload proposal lengkap dan Rencana Anggaran Biaya (RAB) dalam format PDF
                </p>
              </div>

              <FileUpload
                label="Proposal & RAB"
                accept="application/pdf,.doc,.docx"
                multiple={false}
                maxSize={100}
                category="PROPOSAL"
                entityType="program"
                fieldName="proposal"
                required={true}
                description="Upload proposal program beserta RAB (PDF/Word, max 100MB). Harus berisi: Latar belakang, tujuan, rencana kegiatan, RAB, dan timeline"
                onChange={(files) => setProposalFiles(files)}
                value={proposalFiles}
              />

              <FileUpload
                label="Surat Resmi/Permohonan"
                accept="application/pdf,image/*"
                multiple={false}
                maxSize={10}
                category="OFFICIAL_LETTER"
                entityType="program"
                fieldName="officialLetter"
                description="Upload surat resmi/permohonan (PDF/Image, max 10MB)"
                onChange={(files) => setOfficialLetterFiles(files)}
                value={officialLetterFiles}
              />

              <FileUpload
                label="Dokumen RAB Terpisah (Opsional)"
                accept="application/pdf,.xls,.xlsx"
                multiple={false}
                maxSize={50}
                category="BUDGET_PLAN"
                entityType="program"
                fieldName="budgetPlan"
                description="Upload RAB terpisah jika ada (PDF/Excel, max 50MB)"
                onChange={(files) => setBudgetPlanFiles(files)}
                value={budgetPlanFiles}
              />
            </div>
          )}

          {isPengusul && programType === 'LEMBAGA' && currentStep === 5 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Contact Person (PIC)</h2>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Nama PIC <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="picName"
                  value={formData.picName}
                  onChange={handleChange}
                  placeholder="Nama lengkap PIC"
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Jabatan PIC
                </label>
                <input
                  type="text"
                  name="picPosition"
                  value={formData.picPosition}
                  onChange={handleChange}
                  placeholder="Contoh: Ketua Yayasan"
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  No. HP/WhatsApp PIC <span className="text-red-600">*</span>
                </label>
                <input
                  type="tel"
                  name="picPhone"
                  value={formData.picPhone}
                  onChange={handleChange}
                  placeholder="08123456789"
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Email PIC
                </label>
                <input
                  type="email"
                  name="picEmail"
                  value={formData.picEmail}
                  onChange={handleChange}
                  placeholder="pic@email.com"
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>
          )}

          {isPengusul && programType === 'LEMBAGA' && currentStep === 6 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Detail Program</h2>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Deskripsi Program <span className="text-red-600">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Jelaskan program donasi ini secara detail..."
                  rows={6}
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Tujuan Program <span className="text-red-600">*</span>
                </label>
                <textarea
                  name="programObjective"
                  value={formData.programObjective}
                  onChange={handleChange}
                  placeholder="Apa tujuan dari program ini?"
                  rows={4}
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Jumlah Penerima Manfaat (estimasi)
                </label>
                <input
                  type="number"
                  name="beneficiaryCount"
                  value={formData.beneficiaryCount}
                  onChange={handleChange}
                  placeholder="100"
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Rencana Pelaksanaan
                </label>
                <textarea
                  name="implementationPlan"
                  value={formData.implementationPlan}
                  onChange={handleChange}
                  placeholder="Bagaimana program ini akan dilaksanakan?"
                  rows={4}
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Output yang Diharapkan
                </label>
                <textarea
                  name="expectedOutput"
                  value={formData.expectedOutput}
                  onChange={handleChange}
                  placeholder="Apa hasil yang diharapkan dari program ini?"
                  rows={3}
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Rencana Keberlanjutan
                </label>
                <textarea
                  name="sustainabilityPlan"
                  value={formData.sustainabilityPlan}
                  onChange={handleChange}
                  placeholder="Bagaimana keberlanjutan program ini setelah selesai?"
                  rows={3}
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>
          )}

          {isPengusul && programType === 'LEMBAGA' && currentStep === 7 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Rekening Bank</h2>

              <div className="bg-cyan-50 border border-blue-200 rounded-md p-4 mb-6">
                <p className="text-sm text-gray-700">
                  Masukkan informasi rekening lembaga yang akan digunakan untuk menerima dana donasi.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Nama Bank <span className="text-red-600">*</span>
                </label>
                <select
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  required
                >
                  <option value="">Pilih Bank</option>
                  <option value="BCA">BCA</option>
                  <option value="Mandiri">Mandiri</option>
                  <option value="BNI">BNI</option>
                  <option value="BRI">BRI</option>
                  <option value="BSI">BSI (Bank Syariah Indonesia)</option>
                  <option value="CIMB Niaga">CIMB Niaga</option>
                  <option value="Permata">Permata</option>
                  <option value="Danamon">Danamon</option>
                  <option value="BTN">BTN</option>
                  <option value="Muamalat">Muamalat</option>
                  <option value="BCA Syariah">BCA Syariah</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Nomor Rekening <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="bankAccountNumber"
                  value={formData.bankAccountNumber}
                  onChange={handleChange}
                  placeholder="1234567890"
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Nama Pemilik Rekening <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="bankAccountName"
                  value={formData.bankAccountName}
                  onChange={handleChange}
                  placeholder="Nama lembaga sesuai rekening bank"
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  Harus atas nama lembaga, bukan pribadi
                </p>
              </div>
            </div>
          )}

          {/* PENGUSUL - INDIVIDU Forms */}
          {isPengusul && programType === 'INDIVIDU' && currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Informasi Dasar Program</h2>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Judul Program <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Contoh: Bantu Pak RT Terkena Stroke"
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Deskripsi Singkat <span className="text-red-600">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Ceritakan kondisi penerima bantuan..."
                  rows={5}
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Kategori <span className="text-red-600">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  required
                >
                  <option value="">Pilih Kategori</option>
                  <option value="Kesehatan">Kesehatan</option>
                  <option value="Pendidikan">Pendidikan</option>
                  <option value="Bencana Alam">Bencana Alam</option>
                  <option value="Kebakaran">Kebakaran</option>
                  <option value="Kemanusiaan">Kemanusiaan</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Target Donasi (Rp) <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  name="targetAmount"
                  value={formData.targetAmount}
                  onChange={handleChange}
                  placeholder="5000000"
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  required
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Lokasi
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Contoh: Jakarta Timur"
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <FileUpload
                label="Gambar Banner Program"
                accept="image/*"
                multiple={false}
                maxSize={10}
                category="COVER_IMAGE"
                entityType="program"
                fieldName="imageUrl"
                description="Upload gambar banner untuk program (max 10MB, opsional)"
                onChange={(files) => setImageFiles(files)}
                value={imageFiles}
              />
            </div>
          )}

          {isPengusul && programType === 'INDIVIDU' && currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Data Pengaju</h2>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Nama Lengkap Pengaju <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="applicantName"
                  value={formData.applicantName}
                  onChange={handleChange}
                  placeholder="Nama Anda sebagai pengaju"
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Nomor KTP Pengaju
                </label>
                <input
                  type="text"
                  name="applicantKtpNumber"
                  value={formData.applicantKtpNumber}
                  onChange={handleChange}
                  placeholder="16 digit nomor KTP"
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  maxLength={16}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  No. HP/WhatsApp Pengaju <span className="text-red-600">*</span>
                </label>
                <input
                  type="tel"
                  name="applicantPhone"
                  value={formData.applicantPhone}
                  onChange={handleChange}
                  placeholder="08123456789"
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Alamat Lengkap Pengaju
                </label>
                <textarea
                  name="applicantAddress"
                  value={formData.applicantAddress}
                  onChange={handleChange}
                  placeholder="Alamat lengkap Anda"
                  rows={3}
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <FileUpload
                label="Foto KTP Pengaju"
                accept="image/*"
                multiple={false}
                maxSize={10}
                category="KTP"
                entityType="program"
                fieldName="ktpPengaju"
                required={true}
                description="Upload foto KTP pengaju yang jelas dan dapat terbaca (max 10MB)"
                onChange={(files) => setKtpPengajuFiles(files)}
                value={ktpPengajuFiles}
              />
            </div>
          )}

          {isPengusul && programType === 'INDIVIDU' && currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Bukti Kondisi</h2>

              <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-6">
                <p className="text-sm text-gray-700">
                  Upload foto/video yang menunjukkan kondisi penerima bantuan
                </p>
              </div>

              <FileUpload
                label="Foto/Video Bukti Kondisi"
                accept="image/*,video/*"
                multiple={true}
                maxSize={50}
                category="BUKTI_KONDISI"
                entityType="program"
                fieldName="buktiKondisi"
                required={true}
                description="Upload foto/video yang menunjukkan kondisi penerima bantuan (max 50MB per file, bisa lebih dari satu). Contoh: Foto rumah rusak, surat dokter, foto kondisi, video, screenshot biaya pengobatan, dll"
                onChange={(files) => setBuktiKondisiFiles(files)}
                value={buktiKondisiFiles}
              />

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Deskripsi Kondisi Detail
                </label>
                <textarea
                  name="kondisiDescription"
                  value={formData.kondisiDescription}
                  onChange={handleChange}
                  placeholder="Jelaskan kondisi penerima bantuan secara detail..."
                  rows={5}
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>
          )}

          {isPengusul && programType === 'INDIVIDU' && currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Surat Keterangan RT/RW</h2>

              <div className="bg-cyan-50 border border-blue-200 rounded-md p-4 mb-6">
                <p className="text-sm text-gray-700">
                  Surat keterangan dari RT/RW/Kelurahan untuk memvalidasi kondisi penerima bantuan
                </p>
              </div>

              <FileUpload
                label="Foto Surat Keterangan"
                accept="image/*,application/pdf"
                multiple={false}
                maxSize={10}
                category="SURAT_KETERANGAN_RT"
                entityType="program"
                fieldName="suratKeteranganRt"
                required={true}
                description="Upload surat keterangan dari RT/RW/Kelurahan yang memvalidasi kondisi penerima bantuan (PDF/Image, max 10MB)"
                onChange={(files) => setSuratKeteranganRtFiles(files)}
                value={suratKeteranganRtFiles}
              />

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Nama RT/RW/Kepala Desa
                </label>
                <input
                  type="text"
                  name="rtRwName"
                  value={formData.rtRwName}
                  onChange={handleChange}
                  placeholder="Nama yang menandatangani surat"
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  No. HP RT/RW/Kepala Desa
                </label>
                <input
                  type="tel"
                  name="rtRwPhone"
                  value={formData.rtRwPhone}
                  onChange={handleChange}
                  placeholder="08123456789"
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Nomor ini bisa dihubungi untuk verifikasi
                </p>
              </div>
            </div>
          )}

          {isPengusul && programType === 'INDIVIDU' && currentStep === 5 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Rekening Penerima</h2>

              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                <p className="text-sm text-gray-700">
                  <strong>PENTING:</strong> Rekening harus atas nama penerima manfaat atau keluarga terdekat
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Nama Bank <span className="text-red-600">*</span>
                </label>
                <select
                  name="beneficiaryBankName"
                  value={formData.beneficiaryBankName}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  required
                >
                  <option value="">Pilih Bank</option>
                  <option value="BCA">BCA</option>
                  <option value="Mandiri">Mandiri</option>
                  <option value="BNI">BNI</option>
                  <option value="BRI">BRI</option>
                  <option value="BSI">BSI (Bank Syariah Indonesia)</option>
                  <option value="CIMB Niaga">CIMB Niaga</option>
                  <option value="Permata">Permata</option>
                  <option value="Danamon">Danamon</option>
                  <option value="BTN">BTN</option>
                  <option value="Muamalat">Muamalat</option>
                  <option value="BCA Syariah">BCA Syariah</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Nomor Rekening <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="beneficiaryBankAccount"
                  value={formData.beneficiaryBankAccount}
                  onChange={handleChange}
                  placeholder="1234567890"
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Nama Pemilik Rekening <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="beneficiaryAccountName"
                  value={formData.beneficiaryAccountName}
                  onChange={handleChange}
                  placeholder="Nama sesuai rekening bank"
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  Harus atas nama penerima bantuan atau keluarga terdekat (ayah/ibu/anak)
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentStep === 1}
              className="px-6 py-2.5 text-sm rounded-md border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ← Kembali
            </button>

            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 text-sm rounded-md bg-teal-500 text-white font-medium hover:bg-teal-600 transition-colors"
              >
                Lanjut →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="px-8 py-2.5 text-sm rounded-md bg-teal-500 text-white font-semibold hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Menyimpan...' : isSimpleForm ? 'Buat Program' : 'Simpan Program'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
