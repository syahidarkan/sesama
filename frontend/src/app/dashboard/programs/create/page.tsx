'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { programsApi, systemSettingsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { ArrowLeft, ArrowRight, Loader2, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import FileUpload from '@/components/FileUpload';

interface UploadedFile {
  id: string;
  filename: string;
  storedFilename: string;
  mimeType: string;
  size: number;
}

type ProgramType = 'INDIVIDU' | 'LEMBAGA' | null;

export default function CreateProgramPage() {
    const router = useRouter();
    const { user } = useAuthStore();

    // Program Type Selection
    const [programType, setProgramType] = useState<ProgramType>(null);
    const [currentStep, setCurrentStep] = useState(0);

    // File upload states
    const [imageFiles, setImageFiles] = useState<UploadedFile[]>([]);
    const [ktpPengajuFiles, setKtpPengajuFiles] = useState<UploadedFile[]>([]);
    const [buktiKondisiFiles, setBuktiKondisiFiles] = useState<UploadedFile[]>([]);
    const [suratKeteranganRtFiles, setSuratKeteranganRtFiles] = useState<UploadedFile[]>([]);
    const [aktaNotarisFiles, setAktaNotarisFiles] = useState<UploadedFile[]>([]);
    const [npwpFiles, setNpwpFiles] = useState<UploadedFile[]>([]);
    const [proposalFiles, setProposalFiles] = useState<UploadedFile[]>([]);

    // Dropdown options from API
    const [categories, setCategories] = useState<any[]>([]);
    const [institutionTypes, setInstitutionTypes] = useState<any[]>([]);
    const [bankNames, setBankNames] = useState<any[]>([]);

    // Common Form Data
    const [formData, setFormData] = useState({
        // Basic Info
        title: '',
        description: '',
        targetAmount: '',
        category: '',
        startDate: '',
        endDate: '',

        // LEMBAGA Fields
        institutionName: '',
        institutionType: '',
        institutionAddress: '',
        picName: '',
        picPhone: '',
        picEmail: '',
        bankName: '',
        accountNumber: '',
        accountName: '',

        // INDIVIDU Fields
        beneficiaryBankAccount: '',
        beneficiaryBankName: '',
    });

    // Load dropdown options
    useEffect(() => {
        const loadOptions = async () => {
            try {
                const [catRes, instRes, bankRes] = await Promise.all([
                    systemSettingsApi.getByCategory('program_categories'),
                    systemSettingsApi.getByCategory('institution_types'),
                    systemSettingsApi.getByCategory('bank_names'),
                ]);
                setCategories(catRes.data || []);
                setInstitutionTypes(instRes.data || []);
                setBankNames(bankRes.data || []);
            } catch (error) {
                console.error('Failed to load options:', error);
            }
        };
        loadOptions();
    }, []);

    const createMutation = useMutation({
        mutationFn: (data: any) => programsApi.create(data),
        onSuccess: () => {
            const isHighRole = ['MANAGER', 'SUPER_ADMIN'].includes(user?.role || '');
            alert(isHighRole
                ? 'Program berhasil dibuat dan langsung aktif!'
                : 'Program berhasil dibuat! Menunggu persetujuan.');
            router.push('/dashboard/programs');
        },
        onError: (error: any) => {
            alert(error.response?.data?.message || 'Gagal membuat program');
        },
    });

    // Steps configuration based on program type
    const getSteps = () => {
        if (programType === 'INDIVIDU') {
            return [
                { title: 'Informasi Dasar', key: 'basic' },
                { title: 'Data Pengaju', key: 'pengaju' },
                { title: 'Bukti Kondisi', key: 'bukti' },
                { title: 'Surat Keterangan', key: 'surat' },
                { title: 'Rekening Penerima', key: 'rekening' },
            ];
        }
        return [
            { title: 'Informasi Dasar', key: 'basic' },
            { title: 'Data Lembaga', key: 'lembaga' },
            { title: 'Dokumen Legal', key: 'legal' },
            { title: 'Proposal & RAB', key: 'proposal' },
            { title: 'PIC Lembaga', key: 'pic' },
            { title: 'Rekening', key: 'rekening' },
            { title: 'Review', key: 'review' },
        ];
    };

    const steps = programType ? getSteps() : [];
    const totalSteps = steps.length;

    const handleSubmit = () => {
        // Convert uploaded files to URLs
        const imageUrl = imageFiles[0]?.storedFilename
            ? `${process.env.NEXT_PUBLIC_API_URL}/uploads/file/${imageFiles[0].storedFilename}`
            : '';

        const submitData: any = {
            programType,
            title: formData.title,
            description: formData.description,
            targetAmount: parseFloat(formData.targetAmount),
            category: formData.category,
            imageUrl: imageUrl || undefined,
            startDate: formData.startDate || undefined,
            endDate: formData.endDate || undefined,
        };

        if (programType === 'INDIVIDU') {
            const ktpPengajuUrl = ktpPengajuFiles[0]?.storedFilename
                ? `${process.env.NEXT_PUBLIC_API_URL}/uploads/file/${ktpPengajuFiles[0].storedFilename}`
                : '';
            const buktiKondisiUrls = buktiKondisiFiles.map(
                (file) => `${process.env.NEXT_PUBLIC_API_URL}/uploads/file/${file.storedFilename}`
            );
            const suratKeteranganRtUrl = suratKeteranganRtFiles[0]?.storedFilename
                ? `${process.env.NEXT_PUBLIC_API_URL}/uploads/file/${suratKeteranganRtFiles[0].storedFilename}`
                : '';

            submitData.ktpPengajuUrl = ktpPengajuUrl;
            submitData.buktiKondisiUrls = buktiKondisiUrls;
            submitData.suratKeteranganRtUrl = suratKeteranganRtUrl;
            submitData.beneficiaryBankAccount = formData.beneficiaryBankAccount;
            submitData.beneficiaryBankName = formData.beneficiaryBankName;
        } else {
            const aktaNotaris = aktaNotarisFiles[0]?.storedFilename
                ? `${process.env.NEXT_PUBLIC_API_URL}/uploads/file/${aktaNotarisFiles[0].storedFilename}`
                : '';
            const npwp = npwpFiles[0]?.storedFilename
                ? `${process.env.NEXT_PUBLIC_API_URL}/uploads/file/${npwpFiles[0].storedFilename}`
                : '';
            const proposalUrl = proposalFiles[0]?.storedFilename
                ? `${process.env.NEXT_PUBLIC_API_URL}/uploads/file/${proposalFiles[0].storedFilename}`
                : '';

            submitData.institutionName = formData.institutionName;
            submitData.institutionType = formData.institutionType;
            submitData.institutionAddress = formData.institutionAddress;
            submitData.aktaNotaris = aktaNotaris;
            submitData.npwp = npwp;
            submitData.proposalUrl = proposalUrl;
            submitData.picName = formData.picName;
            submitData.picPhone = formData.picPhone;
            submitData.picEmail = formData.picEmail;
            submitData.bankName = formData.bankName;
            submitData.accountNumber = formData.accountNumber;
            submitData.accountName = formData.accountName;
        }

        createMutation.mutate(submitData);
    };

    // Program Type Selection Screen
    if (!programType) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/programs" className="p-2 hover:bg-gray-100 rounded-lg">
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">Buat Program Baru</h1>
                </div>

                <div className="bg-white rounded-xl shadow-sm border p-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Pilih Tipe Program</h2>
                    <p className="text-gray-600 mb-8">Pilih tipe program sesuai dengan kebutuhan Anda</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* INDIVIDU Option */}
                        <button
                            onClick={() => setProgramType('INDIVIDU')}
                            className="border-2 border-gray-200 rounded-xl p-6 text-left hover:border-emerald-500 hover:bg-emerald-50 transition-all group"
                        >
                            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-emerald-200">
                                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Program Individu</h3>
                            <p className="text-gray-600 text-sm mb-4">
                                Untuk bantuan perorangan seperti biaya pengobatan, korban bencana,
                                atau kebutuhan mendesak individu.
                            </p>
                            <ul className="text-sm text-gray-500 space-y-1">
                                <li>• 5 langkah pengisian</li>
                                <li>• KTP Pengaju</li>
                                <li>• Bukti Kondisi (Foto/Video)</li>
                                <li>• Surat Keterangan RT/RW</li>
                            </ul>
                        </button>

                        {/* LEMBAGA Option */}
                        <button
                            onClick={() => setProgramType('LEMBAGA')}
                            className="border-2 border-gray-200 rounded-xl p-6 text-left hover:border-emerald-500 hover:bg-emerald-50 transition-all group"
                        >
                            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-emerald-200">
                                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Program Lembaga</h3>
                            <p className="text-gray-600 text-sm mb-4">
                                Untuk program dari organisasi, yayasan, masjid, sekolah,
                                atau lembaga resmi lainnya.
                            </p>
                            <ul className="text-sm text-gray-500 space-y-1">
                                <li>• 7 langkah pengisian</li>
                                <li>• Akta Notaris & NPWP</li>
                                <li>• Proposal & RAB</li>
                                <li>• Data PIC Lembaga</li>
                            </ul>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Render Step Content
    const renderStepContent = () => {
        const stepKey = steps[currentStep]?.key;

        // BASIC INFO (Both types)
        if (stepKey === 'basic') {
            return (
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Judul Program *</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                            placeholder="Contoh: Bantuan Operasi Jantung Pak Ahmad"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi *</label>
                        <textarea
                            rows={5}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                            placeholder="Jelaskan detail program dan mengapa bantuan dibutuhkan..."
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Target Donasi (Rp) *</label>
                            <input
                                type="number"
                                min="100000"
                                value={formData.targetAmount}
                                onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                                placeholder="10000000"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Kategori *</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                            >
                                <option value="">Pilih Kategori</option>
                                {categories.map((cat) => (
                                    <option key={cat.key} value={cat.key}>{cat.value}</option>
                                ))}
                            </select>
                        </div>
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
            );
        }

        // INDIVIDU: Data Pengaju
        if (stepKey === 'pengaju') {
            return (
                <div className="space-y-6">
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
            );
        }

        // INDIVIDU: Bukti Kondisi
        if (stepKey === 'bukti') {
            return (
                <div className="space-y-6">
                    <FileUpload
                        label="Foto/Video Bukti Kondisi"
                        accept="image/*,video/*"
                        multiple={true}
                        maxSize={50}
                        category="BUKTI_KONDISI"
                        entityType="program"
                        fieldName="buktiKondisi"
                        required={true}
                        description="Upload foto atau video yang menunjukkan kondisi yang membutuhkan bantuan (max 50MB per file, bisa lebih dari satu)"
                        onChange={(files) => setBuktiKondisiFiles(files)}
                        value={buktiKondisiFiles}
                    />
                </div>
            );
        }

        // INDIVIDU: Surat Keterangan
        if (stepKey === 'surat') {
            return (
                <div className="space-y-6">
                    <FileUpload
                        label="Surat Keterangan RT/RW/Kelurahan"
                        accept="image/*,application/pdf"
                        multiple={false}
                        maxSize={10}
                        category="SURAT_KETERANGAN_RT"
                        entityType="program"
                        fieldName="suratKeteranganRt"
                        required={true}
                        description="Upload surat keterangan dari RT/RW/Kelurahan yang menerangkan kondisi pemohon (PDF/Image, max 10MB)"
                        onChange={(files) => setSuratKeteranganRtFiles(files)}
                        value={suratKeteranganRtFiles}
                    />
                </div>
            );
        }

        // LEMBAGA: Data Lembaga
        if (stepKey === 'lembaga') {
            return (
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lembaga *</label>
                        <input
                            type="text"
                            value={formData.institutionName}
                            onChange={(e) => setFormData({ ...formData, institutionName: e.target.value })}
                            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                            placeholder="Yayasan Amal Sejahtera"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Lembaga *</label>
                        <select
                            value={formData.institutionType}
                            onChange={(e) => setFormData({ ...formData, institutionType: e.target.value })}
                            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                        >
                            <option value="">Pilih Jenis Lembaga</option>
                            {institutionTypes.map((type) => (
                                <option key={type.key} value={type.key}>{type.value}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Lembaga *</label>
                        <textarea
                            rows={3}
                            value={formData.institutionAddress}
                            onChange={(e) => setFormData({ ...formData, institutionAddress: e.target.value })}
                            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                            placeholder="Jl. Contoh No. 123, Kota..."
                        />
                    </div>
                </div>
            );
        }

        // LEMBAGA: Dokumen Legal
        if (stepKey === 'legal') {
            return (
                <div className="space-y-6">
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
                        label="NPWP Lembaga"
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
                </div>
            );
        }

        // LEMBAGA: Proposal
        if (stepKey === 'proposal') {
            return (
                <div className="space-y-6">
                    <FileUpload
                        label="Proposal & RAB"
                        accept="application/pdf,.doc,.docx"
                        multiple={false}
                        maxSize={100}
                        category="PROPOSAL"
                        entityType="program"
                        fieldName="proposal"
                        required={true}
                        description="Upload proposal program beserta Rencana Anggaran Biaya (RAB) dalam satu file (PDF/Word, max 100MB)"
                        onChange={(files) => setProposalFiles(files)}
                        value={proposalFiles}
                    />
                </div>
            );
        }

        // LEMBAGA: PIC
        if (stepKey === 'pic') {
            return (
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nama PIC *</label>
                        <input
                            type="text"
                            value={formData.picName}
                            onChange={(e) => setFormData({ ...formData, picName: e.target.value })}
                            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                            placeholder="Ahmad Subagyo"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">No. HP PIC *</label>
                        <input
                            type="tel"
                            value={formData.picPhone}
                            onChange={(e) => setFormData({ ...formData, picPhone: e.target.value })}
                            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                            placeholder="08123456789"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email PIC</label>
                        <input
                            type="email"
                            value={formData.picEmail}
                            onChange={(e) => setFormData({ ...formData, picEmail: e.target.value })}
                            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                            placeholder="pic@lembaga.org"
                        />
                    </div>
                </div>
            );
        }

        // REKENING (Both types, different fields)
        if (stepKey === 'rekening') {
            if (programType === 'INDIVIDU') {
                return (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Bank Penerima *</label>
                            <select
                                value={formData.beneficiaryBankName}
                                onChange={(e) => setFormData({ ...formData, beneficiaryBankName: e.target.value })}
                                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                            >
                                <option value="">Pilih Bank</option>
                                {bankNames.map((bank) => (
                                    <option key={bank.key} value={bank.value}>{bank.value}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">No. Rekening Penerima *</label>
                            <input
                                type="text"
                                value={formData.beneficiaryBankAccount}
                                onChange={(e) => setFormData({ ...formData, beneficiaryBankAccount: e.target.value })}
                                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                                placeholder="1234567890"
                            />
                        </div>
                    </div>
                );
            }
            return (
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nama Bank *</label>
                        <select
                            value={formData.bankName}
                            onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                        >
                            <option value="">Pilih Bank</option>
                            {bankNames.map((bank) => (
                                <option key={bank.key} value={bank.value}>{bank.value}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">No. Rekening *</label>
                        <input
                            type="text"
                            value={formData.accountNumber}
                            onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                            placeholder="1234567890"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nama Pemilik Rekening *</label>
                        <input
                            type="text"
                            value={formData.accountName}
                            onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                            placeholder="Yayasan Amal Sejahtera"
                        />
                    </div>
                </div>
            );
        }

        // REVIEW (LEMBAGA only)
        if (stepKey === 'review') {
            return (
                <div className="space-y-6">
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                        <h3 className="font-medium text-emerald-800 mb-2">Ringkasan Program</h3>
                        <dl className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <dt className="text-gray-600">Judul:</dt>
                                <dd className="font-medium">{formData.title || '-'}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-gray-600">Target:</dt>
                                <dd className="font-medium">Rp {parseInt(formData.targetAmount || '0').toLocaleString('id-ID')}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-gray-600">Lembaga:</dt>
                                <dd className="font-medium">{formData.institutionName || '-'}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-gray-600">PIC:</dt>
                                <dd className="font-medium">{formData.picName || '-'}</dd>
                            </div>
                        </dl>
                    </div>
                    <p className="text-sm text-gray-600">
                        Pastikan semua data sudah benar sebelum mengirim. Program akan diproses setelah disubmit.
                    </p>
                </div>
            );
        }

        return null;
    };

    const isLastStep = currentStep === totalSteps - 1;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => programType ? (currentStep > 0 ? setCurrentStep(currentStep - 1) : setProgramType(null)) : router.back()}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Buat Program {programType}</h1>
                    <p className="text-sm text-gray-500">Langkah {currentStep + 1} dari {totalSteps}</p>
                </div>
            </div>

            {/* Progress Steps */}
            <div className="bg-white rounded-xl shadow-sm border p-4">
                <div className="flex items-center justify-between">
                    {steps.map((step, index) => (
                        <div key={step.key} className="flex items-center">
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                                index < currentStep
                                    ? 'bg-emerald-600 text-white'
                                    : index === currentStep
                                    ? 'bg-emerald-100 text-emerald-600 border-2 border-emerald-600'
                                    : 'bg-gray-100 text-gray-400'
                            }`}>
                                {index < currentStep ? <CheckCircle className="w-5 h-5" /> : index + 1}
                            </div>
                            <span className={`ml-2 text-sm hidden md:block ${
                                index <= currentStep ? 'text-gray-900' : 'text-gray-400'
                            }`}>
                                {step.title}
                            </span>
                            {index < steps.length - 1 && (
                                <div className={`w-8 md:w-16 h-1 mx-2 rounded ${
                                    index < currentStep ? 'bg-emerald-600' : 'bg-gray-200'
                                }`} />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Form Content */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">{steps[currentStep]?.title}</h2>
                {renderStepContent()}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between">
                <button
                    onClick={() => currentStep > 0 ? setCurrentStep(currentStep - 1) : setProgramType(null)}
                    className="px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
                >
                    Kembali
                </button>
                {isLastStep ? (
                    <button
                        onClick={handleSubmit}
                        disabled={createMutation.isPending}
                        className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium disabled:opacity-50 flex items-center gap-2"
                    >
                        {createMutation.isPending ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Menyimpan...
                            </>
                        ) : (
                            'Kirim Program'
                        )}
                    </button>
                ) : (
                    <button
                        onClick={() => setCurrentStep(currentStep + 1)}
                        className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium flex items-center gap-2"
                    >
                        Lanjut
                        <ArrowRight className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    );
}
