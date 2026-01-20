'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { programsApi, systemSettingsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { ArrowLeft, ArrowRight, Loader2, CheckCircle, Heart, Building2, User, FileText, CreditCard, Upload } from 'lucide-react';
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

    const [programType, setProgramType] = useState<ProgramType>(null);
    const [currentStep, setCurrentStep] = useState(0);

    const [imageFiles, setImageFiles] = useState<UploadedFile[]>([]);
    const [ktpPengajuFiles, setKtpPengajuFiles] = useState<UploadedFile[]>([]);
    const [buktiKondisiFiles, setBuktiKondisiFiles] = useState<UploadedFile[]>([]);
    const [suratKeteranganRtFiles, setSuratKeteranganRtFiles] = useState<UploadedFile[]>([]);
    const [aktaNotarisFiles, setAktaNotarisFiles] = useState<UploadedFile[]>([]);
    const [npwpFiles, setNpwpFiles] = useState<UploadedFile[]>([]);
    const [proposalFiles, setProposalFiles] = useState<UploadedFile[]>([]);

    const [categories, setCategories] = useState<any[]>([]);
    const [institutionTypes, setInstitutionTypes] = useState<any[]>([]);
    const [bankNames, setBankNames] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        targetAmount: '',
        category: '',
        startDate: '',
        endDate: '',
        institutionName: '',
        institutionType: '',
        institutionAddress: '',
        picName: '',
        picPhone: '',
        picEmail: '',
        bankName: '',
        accountNumber: '',
        accountName: '',
        beneficiaryBankAccount: '',
        beneficiaryBankName: '',
    });

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

    const getSteps = () => {
        if (programType === 'INDIVIDU') {
            return [
                { title: 'Informasi Dasar', key: 'basic', icon: Heart },
                { title: 'Data Pengaju', key: 'pengaju', icon: User },
                { title: 'Bukti Kondisi', key: 'bukti', icon: Upload },
                { title: 'Surat Keterangan', key: 'surat', icon: FileText },
                { title: 'Rekening Penerima', key: 'rekening', icon: CreditCard },
            ];
        }
        return [
            { title: 'Informasi Dasar', key: 'basic', icon: Heart },
            { title: 'Data Lembaga', key: 'lembaga', icon: Building2 },
            { title: 'Dokumen Legal', key: 'legal', icon: FileText },
            { title: 'Proposal & RAB', key: 'proposal', icon: Upload },
            { title: 'PIC Lembaga', key: 'pic', icon: User },
            { title: 'Rekening', key: 'rekening', icon: CreditCard },
            { title: 'Review', key: 'review', icon: CheckCircle },
        ];
    };

    const steps = programType ? getSteps() : [];
    const totalSteps = steps.length;

    const handleSubmit = () => {
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

    if (!programType) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/programs" className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-orange-50 transition-colors">
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">Buat Program Baru</h1>
                        <p className="text-sm text-gray-600 mt-1">Pilih tipe program yang sesuai dengan kebutuhan</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <button
                        onClick={() => setProgramType('INDIVIDU')}
                        className="group bg-white rounded-lg p-8 border border-gray-200 hover:border-orange-500 transition-all text-left"
                    >
                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-6">
                            <User className="w-6 h-6 text-orange-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">
                            Program Individu
                        </h3>
                        <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                            Untuk bantuan perorangan seperti biaya pengobatan, korban bencana, atau kebutuhan mendesak individu.
                        </p>
                        <div className="space-y-2">
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                                <span>5 langkah pengisian</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                                <span>KTP Pengaju & Bukti Kondisi</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                                <span>Surat Keterangan RT/RW</span>
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => setProgramType('LEMBAGA')}
                        className="group bg-white rounded-lg p-8 border border-gray-200 hover:border-orange-500 transition-all text-left"
                    >
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                            <Building2 className="w-6 h-6 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">
                            Program Lembaga
                        </h3>
                        <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                            Untuk program dari organisasi, yayasan, masjid, sekolah, atau lembaga resmi lainnya.
                        </p>
                        <div className="space-y-2">
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                <span>7 langkah pengisian</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                <span>Akta Notaris & NPWP</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                <span>Proposal & Data PIC</span>
                            </div>
                        </div>
                    </button>
                </div>
            </div>
        );
    }

    const renderStepContent = () => {
        const stepKey = steps[currentStep]?.key;

        if (stepKey === 'basic') {
            return (
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Judul Program *</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors outline-none"
                            placeholder="Contoh: Bantuan Operasi Jantung Pak Ahmad"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Deskripsi Program *</label>
                        <textarea
                            rows={5}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors outline-none resize-none"
                            placeholder="Jelaskan detail program dan mengapa bantuan dibutuhkan..."
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">Target Donasi (Rp) *</label>
                            <input
                                type="number"
                                min="100000"
                                value={formData.targetAmount}
                                onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors outline-none"
                                placeholder="10000000"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">Kategori *</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors outline-none appearance-none bg-white"
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
                        description="Upload foto atau video yang menunjukkan kondisi yang membutuhkan bantuan (max 50MB per file)"
                        onChange={(files) => setBuktiKondisiFiles(files)}
                        value={buktiKondisiFiles}
                    />
                </div>
            );
        }

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
                        description="Upload surat keterangan dari RT/RW/Kelurahan (PDF/Image, max 10MB)"
                        onChange={(files) => setSuratKeteranganRtFiles(files)}
                        value={suratKeteranganRtFiles}
                    />
                </div>
            );
        }

        if (stepKey === 'lembaga') {
            return (
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Nama Lembaga *</label>
                        <input
                            type="text"
                            value={formData.institutionName}
                            onChange={(e) => setFormData({ ...formData, institutionName: e.target.value })}
                            className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors outline-none"
                            placeholder="Yayasan Amal Sejahtera"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Jenis Lembaga *</label>
                        <select
                            value={formData.institutionType}
                            onChange={(e) => setFormData({ ...formData, institutionType: e.target.value })}
                            className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors outline-none appearance-none bg-white"
                        >
                            <option value="">Pilih Jenis Lembaga</option>
                            {institutionTypes.map((type) => (
                                <option key={type.key} value={type.key}>{type.value}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Alamat Lembaga *</label>
                        <textarea
                            rows={3}
                            value={formData.institutionAddress}
                            onChange={(e) => setFormData({ ...formData, institutionAddress: e.target.value })}
                            className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors outline-none resize-none"
                            placeholder="Jl. Contoh No. 123, Kota..."
                        />
                    </div>
                </div>
            );
        }

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
                        description="Upload proposal program beserta RAB dalam satu file (PDF/Word, max 100MB)"
                        onChange={(files) => setProposalFiles(files)}
                        value={proposalFiles}
                    />
                </div>
            );
        }

        if (stepKey === 'pic') {
            return (
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Nama PIC *</label>
                        <input
                            type="text"
                            value={formData.picName}
                            onChange={(e) => setFormData({ ...formData, picName: e.target.value })}
                            className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors outline-none"
                            placeholder="Ahmad Subagyo"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">No. HP PIC *</label>
                        <input
                            type="tel"
                            value={formData.picPhone}
                            onChange={(e) => setFormData({ ...formData, picPhone: e.target.value })}
                            className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors outline-none"
                            placeholder="08123456789"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Email PIC</label>
                        <input
                            type="email"
                            value={formData.picEmail}
                            onChange={(e) => setFormData({ ...formData, picEmail: e.target.value })}
                            className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors outline-none"
                            placeholder="pic@lembaga.org"
                        />
                    </div>
                </div>
            );
        }

        if (stepKey === 'rekening') {
            if (programType === 'INDIVIDU') {
                return (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">Nama Bank Penerima *</label>
                            <select
                                value={formData.beneficiaryBankName}
                                onChange={(e) => setFormData({ ...formData, beneficiaryBankName: e.target.value })}
                                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors outline-none appearance-none bg-white"
                            >
                                <option value="">Pilih Bank</option>
                                {bankNames.map((bank) => (
                                    <option key={bank.key} value={bank.value}>{bank.value}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">No. Rekening Penerima *</label>
                            <input
                                type="text"
                                value={formData.beneficiaryBankAccount}
                                onChange={(e) => setFormData({ ...formData, beneficiaryBankAccount: e.target.value })}
                                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors outline-none"
                                placeholder="1234567890"
                            />
                        </div>
                    </div>
                );
            }
            return (
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Nama Bank *</label>
                        <select
                            value={formData.bankName}
                            onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                            className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors outline-none appearance-none bg-white"
                        >
                            <option value="">Pilih Bank</option>
                            {bankNames.map((bank) => (
                                <option key={bank.key} value={bank.value}>{bank.value}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">No. Rekening *</label>
                        <input
                            type="text"
                            value={formData.accountNumber}
                            onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                            className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors outline-none"
                            placeholder="1234567890"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Nama Pemilik Rekening *</label>
                        <input
                            type="text"
                            value={formData.accountName}
                            onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                            className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors outline-none"
                            placeholder="Yayasan Amal Sejahtera"
                        />
                    </div>
                </div>
            );
        }

        if (stepKey === 'review') {
            return (
                <div className="space-y-6">
                    <div className="bg-orange-50 rounded-lg p-6 border border-orange-200">
                        <h3 className="font-medium text-orange-900 mb-4 text-base flex items-center space-x-2">
                            <CheckCircle className="w-5 h-5" />
                            <span>Ringkasan Program</span>
                        </h3>
                        <dl className="space-y-3">
                            <div className="flex justify-between items-center py-2 border-b border-orange-200">
                                <dt className="text-sm text-orange-700">Judul:</dt>
                                <dd className="text-sm font-medium text-orange-900 text-right">{formData.title || '-'}</dd>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-orange-200">
                                <dt className="text-sm text-orange-700">Target:</dt>
                                <dd className="text-sm font-medium text-orange-900">Rp {parseInt(formData.targetAmount || '0').toLocaleString('id-ID')}</dd>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-orange-200">
                                <dt className="text-sm text-orange-700">Lembaga:</dt>
                                <dd className="text-sm font-medium text-orange-900 text-right">{formData.institutionName || '-'}</dd>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <dt className="text-sm text-orange-700">PIC:</dt>
                                <dd className="text-sm font-medium text-orange-900 text-right">{formData.picName || '-'}</dd>
                            </div>
                        </dl>
                    </div>
                    <p className="text-sm text-gray-600 bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <span className="font-medium text-blue-900">Perhatian:</span> Pastikan semua data sudah benar sebelum mengirim. Program akan diproses setelah disubmit.
                    </p>
                </div>
            );
        }

        return null;
    };

    const isLastStep = currentStep === totalSteps - 1;
    const CurrentStepIcon = steps[currentStep]?.icon || Heart;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => currentStep > 0 ? setCurrentStep(currentStep - 1) : setProgramType(null)}
                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-orange-50 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div className="flex-1">
                    <h1 className="text-2xl font-semibold text-gray-900">Buat Program {programType}</h1>
                    <p className="text-sm text-gray-600 mt-1">Langkah {currentStep + 1} dari {totalSteps} - {steps[currentStep]?.title}</p>
                </div>
            </div>

            {/* Progress Steps */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 overflow-x-auto">
                <div className="flex items-center justify-between min-w-max">
                    {steps.map((step, index) => {
                        const StepIcon = step.icon;
                        return (
                            <div key={step.key} className="flex items-center">
                                <div className="flex flex-col items-center">
                                    <div className={`flex items-center justify-center w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                                        index < currentStep
                                            ? 'bg-green-600 text-white'
                                            : index === currentStep
                                            ? 'bg-orange-600 text-white'
                                            : 'bg-gray-100 text-gray-400'
                                    }`}>
                                        {index < currentStep ? (
                                            <CheckCircle className="w-5 h-5" />
                                        ) : (
                                            <StepIcon className="w-5 h-5" />
                                        )}
                                    </div>
                                    <span className={`mt-2 text-xs font-medium whitespace-nowrap ${
                                        index <= currentStep ? 'text-gray-900' : 'text-gray-400'
                                    }`}>
                                        {step.title}
                                    </span>
                                </div>
                                {index < steps.length - 1 && (
                                    <div className={`w-12 h-1 mx-3 rounded-full transition-all ${
                                        index < currentStep ? 'bg-green-600' : 'bg-gray-200'
                                    }`} />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Form Content */}
            <div className="bg-white rounded-lg border border-gray-200 p-8">
                <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <CurrentStepIcon className="w-5 h-5 text-orange-600" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">{steps[currentStep]?.title}</h2>
                </div>
                {renderStepContent()}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center bg-white rounded-lg border border-gray-200 p-6">
                <button
                    onClick={() => currentStep > 0 ? setCurrentStep(currentStep - 1) : setProgramType(null)}
                    className="inline-flex items-center space-x-2 px-6 py-2.5 text-gray-700 hover:bg-gray-100 rounded-md text-sm font-medium transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Kembali</span>
                </button>
                {isLastStep ? (
                    <button
                        onClick={handleSubmit}
                        disabled={createMutation.isPending}
                        className="inline-flex items-center space-x-2 px-8 py-2.5 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                        {createMutation.isPending ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Menyimpan...</span>
                            </>
                        ) : (
                            <>
                                <CheckCircle className="w-4 h-4" />
                                <span>Kirim Program</span>
                            </>
                        )}
                    </button>
                ) : (
                    <button
                        onClick={() => setCurrentStep(currentStep + 1)}
                        className="inline-flex items-center space-x-2 px-8 py-2.5 bg-orange-600 text-white rounded-md text-sm font-medium hover:bg-orange-700 transition-colors"
                    >
                        <span>Lanjutkan</span>
                        <ArrowRight className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    );
}
