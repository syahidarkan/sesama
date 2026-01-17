'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { programsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { ArrowLeft, Loader2, Plus, Trash2, Save } from 'lucide-react';
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
            alert('Program berhasil diperbarui!');
            router.push(`/dashboard/programs/${id}`);
        },
        onError: (error: any) => {
            alert(error.response?.data?.message || 'Gagal memperbarui program');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Convert uploaded file to URL
        const imageUrl = imageFiles[0]?.storedFilename
            ? `${process.env.NEXT_PUBLIC_API_URL}/uploads/file/${imageFiles[0].storedFilename}`
            : formData.imageUrl; // Keep existing URL if no new upload

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
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    href={`/dashboard/programs/${id}`}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Edit Program</h1>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-gray-900">Informasi Dasar</h2>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Judul Program *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Deskripsi *
                            </label>
                            <textarea
                                required
                                rows={5}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Target Donasi (Rp) *
                            </label>
                            <input
                                type="number"
                                required
                                min="10000"
                                value={formData.targetAmount}
                                onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
                            description={formData.imageUrl ? "Upload gambar baru untuk mengganti gambar saat ini (max 10MB, opsional)" : "Upload gambar banner untuk program (max 10MB, opsional)"}
                            onChange={(files) => setImageFiles(files)}
                            value={imageFiles}
                        />
                    </div>

                    {/* Bank Accounts - Only visible to ADMIN_LAZISMU and DEVELOPER */}
                    {['ADMIN_LAZISMU', 'DEVELOPER'].includes(user?.role || '') && (
                        <div className="space-y-4 border-t pt-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-900">Rekening Penerima</h2>
                                <button
                                    type="button"
                                    onClick={addBankAccount}
                                    className="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                                >
                                    <Plus className="w-4 h-4" />
                                    Tambah Rekening
                                </button>
                            </div>

                            {bankAccounts.map((account, index) => (
                                <div key={index} className="grid grid-cols-1 md:grid-cols-7 gap-4 items-end bg-gray-50 p-4 rounded-lg">
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Nama Bank</label>
                                        <input
                                            type="text"
                                            value={account.bank_name}
                                            onChange={(e) => updateBankAccount(index, 'bank_name', e.target.value)}
                                            className="w-full px-3 py-2 border rounded-md text-sm"
                                            placeholder="BCA/Mandiri..."
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-medium text-gray-500 mb-1">No. Rekening</label>
                                        <input
                                            type="text"
                                            value={account.account_number}
                                            onChange={(e) => updateBankAccount(index, 'account_number', e.target.value)}
                                            className="w-full px-3 py-2 border rounded-md text-sm"
                                            placeholder="1234567890"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Atas Nama</label>
                                        <input
                                            type="text"
                                            value={account.account_name}
                                            onChange={(e) => updateBankAccount(index, 'account_name', e.target.value)}
                                            className="w-full px-3 py-2 border rounded-md text-sm"
                                            placeholder="Yayasan..."
                                        />
                                    </div>
                                    <div className="md:col-span-1 flex justify-end">
                                        <button
                                            type="button"
                                            onClick={() => removeBankAccount(index)}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Hapus"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex justify-end gap-4 pt-6 border-t">
                        <Link
                            href={`/dashboard/programs/${id}`}
                            className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                        >
                            Batal
                        </Link>
                        <button
                            type="submit"
                            disabled={updateMutation.isPending}
                            className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {updateMutation.isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Menyimpan...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Simpan Perubahan
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
