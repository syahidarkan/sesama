'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'next/navigation';
import { systemSettingsApi, formFieldConfigApi, usersApi } from '@/lib/api';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'dropdowns' | 'fields' | 'users'>('dropdowns');

  // Only SUPER_ADMIN can access
  if (user?.role !== 'SUPER_ADMIN') {
    router.push('/admin');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Pengaturan Sistem</h1>
          <p className="mt-2 text-gray-600">
            Kelola dropdown, field form, dan user (SUPER ADMIN)
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('dropdowns')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'dropdowns'
                    ? 'border-orange-600 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Kelola Dropdown
              </button>
              <button
                onClick={() => setActiveTab('fields')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'fields'
                    ? 'border-orange-600 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Kelola Field Form
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'users'
                    ? 'border-orange-600 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Kelola User
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'dropdowns' && <DropdownManagement />}
            {activeTab === 'fields' && <FormFieldManagement />}
            {activeTab === 'users' && <UserManagement />}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// DROPDOWN MANAGEMENT COMPONENT
// ============================================
function DropdownManagement() {
  const [category, setCategory] = useState<string>('program_categories');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [newItem, setNewItem] = useState({ key: '', value: '', sortOrder: 0 });

  const loadItems = async () => {
    setLoading(true);
    try {
      const response = await systemSettingsApi.getByCategory(category);
      const itemsArray = Array.isArray(response.data) ? response.data : [];
      setItems(itemsArray);
    } catch (error) {
      console.error('Failed to load items:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    try {
      await systemSettingsApi.create({
        category,
        key: newItem.key,
        value: newItem.value,
        sortOrder: newItem.sortOrder,
      });
      setShowAddModal(false);
      setNewItem({ key: '', value: '', sortOrder: 0 });
      loadItems();
    } catch (error: any) {
      alert('Gagal menambah item: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEdit = async () => {
    if (!editItem) return;
    try {
      await systemSettingsApi.update(editItem.id, {
        key: editItem.key,
        value: editItem.value,
        sortOrder: editItem.sortOrder,
        isActive: editItem.isActive,
      });
      setShowEditModal(false);
      setEditItem(null);
      loadItems();
    } catch (error: any) {
      alert('Gagal update item: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus item ini?')) return;
    try {
      await systemSettingsApi.delete(id);
      loadItems();
    } catch (error: any) {
      alert('Gagal menghapus: ' + (error.response?.data?.message || error.message));
    }
  };

  useEffect(() => {
    loadItems();
  }, [category]);

  const categoryOptions = [
    { value: 'program_categories', label: 'Kategori Program' },
    { value: 'institution_types', label: 'Jenis Lembaga' },
    { value: 'bank_names', label: 'Nama Bank' },
    { value: 'berita_categories', label: 'Kategori Berita' },
    { value: 'locations', label: 'Lokasi/Wilayah' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pilih Kategori
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500"
          >
            {categoryOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
        >
          + Tambah Item
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Key</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value (Display Name)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sort</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    Belum ada item untuk kategori ini
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 text-sm font-mono text-gray-600">{item.key}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{item.value}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.sortOrder}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.isActive !== false
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {item.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm space-x-3">
                      <button
                        onClick={() => {
                          setEditItem({ ...item });
                          setShowEditModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Tambah Item Baru</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Key (Unique ID)</label>
                <input
                  type="text"
                  value={newItem.key}
                  onChange={(e) => setNewItem({ ...newItem, key: e.target.value.toUpperCase().replace(/\s+/g, '_') })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="PENDIDIKAN"
                />
                <p className="text-xs text-gray-500 mt-1">Gunakan huruf kapital, tanpa spasi</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Value (Display Name)</label>
                <input
                  type="text"
                  value={newItem.value}
                  onChange={(e) => setNewItem({ ...newItem, value: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Pendidikan"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                <input
                  type="number"
                  value={newItem.sortOrder}
                  onChange={(e) => setNewItem({ ...newItem, sortOrder: parseInt(e.target.value) || 0 })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewItem({ key: '', value: '', sortOrder: 0 });
                }}
                className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={handleAdd}
                className="flex-1 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Edit Item</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Key</label>
                <input
                  type="text"
                  value={editItem.key}
                  onChange={(e) => setEditItem({ ...editItem, key: e.target.value.toUpperCase().replace(/\s+/g, '_') })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Value (Display Name)</label>
                <input
                  type="text"
                  value={editItem.value}
                  onChange={(e) => setEditItem({ ...editItem, value: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                <input
                  type="number"
                  value={editItem.sortOrder}
                  onChange={(e) => setEditItem({ ...editItem, sortOrder: parseInt(e.target.value) || 0 })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={editItem.isActive !== false}
                  onChange={(e) => setEditItem({ ...editItem, isActive: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700">Active (tampilkan di dropdown)</label>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditItem(null);
                }}
                className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={handleEdit}
                className="flex-1 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// FORM FIELD MANAGEMENT COMPONENT
// ============================================
function FormFieldManagement() {
  const [formType, setFormType] = useState<string>('program_lembaga');
  const [fields, setFields] = useState<any>({});
  const [allFields, setAllFields] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newField, setNewField] = useState({ fieldName: '', isVisible: true, isRequired: false });

  const loadFields = async () => {
    setLoading(true);
    try {
      const response = await formFieldConfigApi.getConfig(formType);
      setFields(response.data || {});
    } catch (error) {
      console.error('Failed to load fields:', error);
      setFields({});
    } finally {
      setLoading(false);
    }
  };

  const loadAllFields = async () => {
    try {
      const response = await formFieldConfigApi.getAllConfigs();
      setAllFields(response.data || []);
    } catch (error) {
      console.error('Failed to load all fields:', error);
    }
  };

  const toggleVisibility = async (fieldName: string, currentVisible: boolean) => {
    try {
      await formFieldConfigApi.updateField(formType, fieldName, {
        isVisible: !currentVisible,
      });
      loadFields();
    } catch (error: any) {
      alert('Gagal update: ' + (error.response?.data?.message || error.message));
    }
  };

  const toggleRequired = async (fieldName: string, currentRequired: boolean) => {
    try {
      await formFieldConfigApi.updateField(formType, fieldName, {
        isRequired: !currentRequired,
      });
      loadFields();
    } catch (error: any) {
      alert('Gagal update: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleAddField = async () => {
    try {
      await formFieldConfigApi.createField({
        formType,
        fieldName: newField.fieldName,
        isVisible: newField.isVisible,
        isRequired: newField.isRequired,
      });
      setShowAddModal(false);
      setNewField({ fieldName: '', isVisible: true, isRequired: false });
      loadFields();
    } catch (error: any) {
      alert('Gagal menambah field: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteField = async (fieldName: string) => {
    if (!confirm(`Yakin ingin menghapus field "${fieldName}"?`)) return;
    try {
      await formFieldConfigApi.deleteField(formType, fieldName);
      loadFields();
    } catch (error: any) {
      alert('Gagal menghapus: ' + (error.response?.data?.message || error.message));
    }
  };

  useEffect(() => {
    loadFields();
    loadAllFields();
  }, [formType]);

  const formTypeOptions = [
    { value: 'program_lembaga', label: 'Form Program Lembaga' },
    { value: 'program_individu', label: 'Form Program Individu' },
    { value: 'pengusul_registration', label: 'Form Pendaftaran Pengusul' },
  ];

  const fieldLabels: Record<string, string> = {
    // Lembaga fields
    institutionName: 'Nama Lembaga',
    institutionType: 'Jenis Lembaga',
    institutionAddress: 'Alamat Lembaga',
    institutionPhone: 'Telepon Lembaga',
    institutionEmail: 'Email Lembaga',
    institutionProfile: 'Profil Lembaga',
    aktaNotaris: 'Akta Notaris',
    skKemenkumham: 'SK Kemenkumham',
    npwp: 'NPWP',
    suratDomisili: 'Surat Domisili',
    proposalUrl: 'Proposal & RAB',
    officialLetterUrl: 'Surat Resmi',
    picName: 'Nama PIC',
    picPhone: 'Telepon PIC',
    picEmail: 'Email PIC',
    picPosition: 'Jabatan PIC',
    bankName: 'Nama Bank',
    bankAccountNumber: 'No. Rekening',
    bankAccountName: 'Nama Pemilik Rekening',
    // Individu fields
    ktpPengajuUrl: 'KTP Pengaju',
    buktiKondisiUrls: 'Foto/Video Bukti Kondisi',
    suratKeteranganRtUrl: 'Surat Keterangan RT/RW',
    beneficiaryBankAccount: 'No. Rekening Penerima',
    beneficiaryBankName: 'Bank Penerima',
    // Common
    title: 'Judul Program',
    description: 'Deskripsi',
    targetAmount: 'Target Donasi',
    category: 'Kategori',
    location: 'Lokasi',
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pilih Tipe Form
          </label>
          <select
            value={formType}
            onChange={(e) => setFormType(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500"
          >
            {formTypeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
        >
          + Tambah Field
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Tips:</strong> Toggle "Visible" untuk menyembunyikan field dari form.
          Toggle "Required" untuk membuat field wajib diisi.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Field Name</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Visible</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Required</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.keys(fields).length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    Belum ada konfigurasi field untuk form ini. Klik "Tambah Field" untuk menambahkan.
                  </td>
                </tr>
              ) : (
                Object.entries(fields).map(([fieldName, config]: [string, any]) => (
                  <tr key={fieldName}>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {fieldLabels[fieldName] || fieldName}
                      </div>
                      <div className="text-xs text-gray-500 font-mono">{fieldName}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => toggleVisibility(fieldName, config.isVisible)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          config.isVisible
                            ? 'bg-orange-100 text-orange-800 hover:bg-orange-200'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {config.isVisible ? 'Visible' : 'Hidden'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => toggleRequired(fieldName, config.isRequired)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          config.isRequired
                            ? 'bg-red-100 text-red-800 hover:bg-red-200'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {config.isRequired ? 'Required' : 'Optional'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDeleteField(fieldName)}
                        className="text-red-600 hover:text-red-900 text-sm"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Field Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Tambah Field Baru</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Field Name</label>
                <input
                  type="text"
                  value={newField.fieldName}
                  onChange={(e) => setNewField({ ...newField, fieldName: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="namaField"
                />
                <p className="text-xs text-gray-500 mt-1">Gunakan camelCase (contoh: namaLembaga)</p>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newField.isVisible}
                    onChange={(e) => setNewField({ ...newField, isVisible: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">Visible</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newField.isRequired}
                    onChange={(e) => setNewField({ ...newField, isRequired: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">Required</span>
                </label>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewField({ fieldName: '', isVisible: true, isRequired: false });
                }}
                className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={handleAddField}
                className="flex-1 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// USER MANAGEMENT COMPONENT
// ============================================
function UserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [newUser, setNewUser] = useState({ email: '', name: '', password: '', role: 'USER' });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('');

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await usersApi.getAll(filterRole || undefined);
      setUsers(response.data || []);
    } catch (error) {
      console.error('Failed to load users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    try {
      await usersApi.create(newUser);
      setShowCreateModal(false);
      setNewUser({ email: '', name: '', password: '', role: 'USER' });
      loadUsers();
      alert('User berhasil dibuat!');
    } catch (error: any) {
      alert('Gagal membuat user: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    try {
      await usersApi.update(selectedUser.id, {
        name: selectedUser.name,
        email: selectedUser.email,
        role: selectedUser.role,
        isActive: selectedUser.isActive,
      });
      setShowEditModal(false);
      setSelectedUser(null);
      loadUsers();
      alert('User berhasil diupdate!');
    } catch (error: any) {
      alert('Gagal update user: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteUser = async (userId: string, permanent: boolean = false) => {
    const message = permanent
      ? 'Yakin ingin HAPUS PERMANEN user ini? Data tidak bisa dikembalikan!'
      : 'Yakin ingin menonaktifkan user ini? (Soft delete)';

    if (!confirm(message)) return;

    try {
      if (permanent) {
        await usersApi.delete(userId);
      } else {
        await usersApi.softDelete(userId);
      }
      loadUsers();
    } catch (error: any) {
      alert('Gagal menghapus: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleToggleActive = async (user: any) => {
    try {
      await usersApi.update(user.id, {
        isActive: !user.isActive,
      });
      loadUsers();
    } catch (error: any) {
      alert('Gagal update status: ' + (error.response?.data?.message || error.message));
    }
  };

  useEffect(() => {
    loadUsers();
  }, [filterRole]);

  const roleOptions = [
    { value: 'USER', label: 'User', color: 'bg-gray-100 text-gray-800' },
    { value: 'PENGUSUL', label: 'Pengusul', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'CONTENT_MANAGER', label: 'Content Manager', color: 'bg-purple-100 text-purple-800' },
    { value: 'SUPERVISOR', label: 'Supervisor', color: 'bg-blue-100 text-blue-800' },
    { value: 'MANAGER', label: 'Manager', color: 'bg-orange-100 text-orange-800' },
    { value: 'SUPER_ADMIN', label: 'Super Admin', color: 'bg-red-100 text-red-800' },
  ];

  const getRoleColor = (role: string) => {
    return roleOptions.find(r => r.value === role)?.color || 'bg-gray-100 text-gray-800';
  };

  const filteredUsers = users.filter(user => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return user.name?.toLowerCase().includes(query) || user.email?.toLowerCase().includes(query);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Cari nama atau email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 w-64"
          />
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2"
          >
            <option value="">Semua Role</option>
            {roleOptions.map((role) => (
              <option key={role.value} value={role.value}>{role.label}</option>
            ))}
          </select>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
        >
          + Tambah User
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    {searchQuery ? 'Tidak ada user yang cocok' : 'Belum ada user'}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className={!user.isActive ? 'bg-gray-50' : ''}>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                        {roleOptions.find(r => r.value === user.role)?.label || user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleToggleActive(user)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          user.isActive
                            ? 'bg-orange-100 text-orange-800 hover:bg-orange-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {user.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('id-ID') : '-'}
                    </td>
                    <td className="px-6 py-4 text-right text-sm space-x-3">
                      <button
                        onClick={() => {
                          setSelectedUser({ ...user });
                          setShowEditModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id, false)}
                        className="text-orange-600 hover:text-orange-900"
                      >
                        Nonaktifkan
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id, true)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Buat User Baru</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="user@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama *</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Nama Lengkap"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Minimal 6 karakter"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  {roleOptions.map((role) => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewUser({ email: '', name: '', password: '', role: 'USER' });
                }}
                className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={handleCreateUser}
                disabled={!newUser.email || !newUser.name || !newUser.password}
                className="flex-1 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Buat User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Edit User</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={selectedUser.email}
                  onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                <input
                  type="text"
                  value={selectedUser.name}
                  onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={selectedUser.role}
                  onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  {roleOptions.map((role) => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="userActive"
                  checked={selectedUser.isActive}
                  onChange={(e) => setSelectedUser({ ...selectedUser, isActive: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <label htmlFor="userActive" className="text-sm text-gray-700">User Aktif</label>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedUser(null);
                }}
                className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={handleUpdateUser}
                className="flex-1 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
