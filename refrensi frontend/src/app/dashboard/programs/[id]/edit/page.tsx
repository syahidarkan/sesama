'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { programsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { ArrowLeft, Loader2, Plus, Trash2, Save, Heart, CreditCard, Edit3, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import FileUpload from '@/components/FileUpload';

interface UploadedFile {
  id: string;
  filename: string;
  storedFilename: string;
  mimeType: string;
  size: number;
}

export default function EditProgramPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const { user } = useAuthStore();
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        targetAmount: '',
        imageUrl: '',
    });

    const [imageFiles, setImageFiles] = useState<UploadedFile[]>([]);

    const [bankAccounts, setBankAccounts] = useState([
        { bank_name: '', account_number: '', account_name: '' }
    ]);

    const { data: program, isLoading } = useQuery({
        queryKey: ['program', id],
        queryFn: () => programsApi.getOne(id).then(res => res.data),
    });

    useEffect(() => {
        if (program) {
            setFormData({
                title: program.title,
                description: program.description,
                targetAmount: program.targetAmount,
                imageUrl: program.imageUrl || '',
            });
            if (program.bankAccounts && program.bankAccounts.length > 0) {
                setBankAccounts(program.bankAccounts);
            }
        }
    }, [program]);

    const updateMutation = useMutation({
        mutationFn: (data: any) => programsApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['program', id] });
            alert('Program berhasil diperbarui!');
            router.push(`/dashboard/programs/${id}`);
        },
        onError: (error: any) => {
            alert(error.response?.data?.message || 'Gagal memperbarui program');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const imageUrl = imageFiles[0]?.storedFilename
            ? `${process.env.NEXT_PUBLIC_API_URL}/uploads/file/${imageFiles[0].storedFilename}`
            : formData.imageUrl;

        updateMutation.mutate({
            ...formData,
            imageUrl,
            targetAmount: parseFloat(formData.targetAmount),
            bankAccounts: bankAccounts.filter(b => b.bank_name && b.account_number),
        });
    };

    const addBankAccount = () => {
        setBankAccounts([...bankAccounts, { bank_name: '', account_number: '', account_name: '' }]);
    };

    const removeBankAccount = (index: number) => {
        setBankAccounts(bankAccounts.filter((_, i) => i !== index));
    };

    const updateBankAccount = (index: number, field: string, value: string) => {
        const newAccounts = [...bankAccounts];
        newAccounts[index] = { ...newAccounts[index], [field]: value };
        setBankAccounts(newAccounts);
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-teal-600 mb-3" />
                <p className="text-sm text-gray-600">Memuat data program...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    href={`/dashboard/programs/${id}`}
                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-teal-50 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </Link>
                <div className="flex-1">
                    <h1 className="text-2xl font-semibold text-gray-900">Edit Program</h1>
                    <p className="text-sm text-gray-600 mt-1">Perbarui informasi program donasi</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info Section */}
                <div className="bg-white rounded-lg border border-gray-200 p-8">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                            <Heart className="w-5 h-5 text-teal-600" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900">Informasi Dasar</h2>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">
                                Judul Program *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors outline-none"
                                placeholder="Masukkan judul program"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">
                                Deskripsi Program *
                            </label>
                            <textarea
                                required
                                rows={6}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors outline-none resize-none"
                                placeholder="Jelaskan detail program..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">
                                Target Donasi (Rp) *
                            </label>
                            <input
                                type="number"
                                required
                                min="10000"
                                value={formData.targetAmount}
                                onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors outline-none"
                                placeholder="10000000"
                            />
                            <p className="text-sm text-gray-500 mt-2">
                                Target saat ini: <span className="font-medium text-gray-900">Rp {parseInt(formData.targetAmount || '0').toLocaleString('id-ID')}</span>
                            </p>
                        </div>

                        <div>
                            <FileUpload
                                label="Gambar Banner Program"
                                accept="image/*"
                                multiple={false}
                                maxSize={10}
                                category="COVER_IMAGE"
                                entityType="program"
                                fieldName="imageUrl"
                                description={formData.imageUrl ? "Upload gambar baru untuk mengganti banner saat ini (max 10MB)" : "Upload gambar banner untuk program (max 10MB)"}
                                onChange={(files) => setImageFiles(files)}
                                value={imageFiles}
                            />
                            {formData.imageUrl && !imageFiles.length && (
                                <div className="mt-4 p-4 bg-cyan-50 rounded-md border border-blue-200">
                                    <div className="flex items-start space-x-3">
                                        <AlertCircle className="w-5 h-5 text-cyan-600 mt-0.5 shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium text-cyan-900">Gambar saat ini tersimpan</p>
                                            <p className="text-xs text-cyan-700 mt-1">Upload gambar baru untuk menggantinya, atau biarkan kosong untuk tetap menggunakan gambar yang ada</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Bank Accounts Section */}
                {['ADMIN_LAZISMU', 'DEVELOPER'].includes(user?.role || '') && (
                    <div className="bg-white rounded-lg border border-gray-200 p-8">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                                    <CreditCard className="w-5 h-5 text-cyan-600" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">Rekening Penerima</h2>
                                    <p className="text-sm text-gray-600">Kelola rekening tujuan donasi</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={addBankAccount}
                                className="inline-flex items-center space-x-2 px-4 py-2 bg-cyan-600 text-white rounded-md text-sm font-medium hover:bg-cyan-700 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Tambah Rekening</span>
                            </button>
                        </div>

                        <div className="space-y-4">
                            {bankAccounts.map((account, index) => (
                                <div key={index} className="bg-gray-50 rounded-md p-6 border border-gray-200">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-2">Nama Bank</label>
                                            <input
                                                type="text"
                                                value={account.bank_name}
                                                onChange={(e) => updateBankAccount(index, 'bank_name', e.target.value)}
                                                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors outline-none"
                                                placeholder="BCA, Mandiri, BNI..."
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-2">No. Rekening</label>
                                            <input
                                                type="text"
                                                value={account.account_number}
                                                onChange={(e) => updateBankAccount(index, 'account_number', e.target.value)}
                                                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors outline-none font-mono"
                                                placeholder="1234567890"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-2">Atas Nama</label>
                                            <input
                                                type="text"
                                                value={account.account_name}
                                                onChange={(e) => updateBankAccount(index, 'account_name', e.target.value)}
                                                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors outline-none"
                                                placeholder="Nama Penerima"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end">
                                        <button
                                            type="button"
                                            onClick={() => removeBankAccount(index)}
                                            className="inline-flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            <span>Hapus Rekening</span>
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {bankAccounts.length === 0 && (
                                <div className="text-center py-12 bg-gray-50 rounded-md border border-dashed border-gray-300">
                                    <CreditCard className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                                    <p className="text-sm text-gray-600">Belum ada rekening</p>
                                    <p className="text-xs text-gray-500 mt-1">Klik tombol "Tambah Rekening" untuk menambah</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Submit Section */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-start space-x-3">
                            <AlertCircle className="w-5 h-5 text-teal-600 mt-0.5 shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-gray-900">Pastikan semua data sudah benar</p>
                                <p className="text-xs text-gray-600 mt-1">Perubahan akan langsung tersimpan setelah Anda klik tombol simpan</p>
                            </div>
                        </div>
                        <div className="flex gap-3 w-full md:w-auto">
                            <Link
                                href={`/dashboard/programs/${id}`}
                                className="flex-1 md:flex-none inline-flex items-center justify-center px-6 py-2.5 text-gray-700 hover:bg-gray-100 rounded-md text-sm font-medium transition-colors border border-gray-300"
                            >
                                Batal
                            </Link>
                            <button
                                type="submit"
                                disabled={updateMutation.isPending}
                                className="flex-1 md:flex-none inline-flex items-center justify-center space-x-2 px-8 py-2.5 bg-teal-500 text-white rounded-md text-sm font-medium hover:bg-teal-600 transition-colors disabled:opacity-50"
                            >
                                {updateMutation.isPending ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Menyimpan...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        <span>Simpan Perubahan</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
