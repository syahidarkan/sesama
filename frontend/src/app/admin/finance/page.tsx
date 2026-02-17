'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { financeApi } from '@/lib/api';
import Link from 'next/link';
import {
  Wallet,
  TrendingUp,
  DollarSign,
  Users,
  Activity,
  ArrowLeft,
  Loader2,
  Download,
  Eye,
  Calendar,
  Filter,
  CreditCard,
  PieChart,
  X,
} from 'lucide-react';

export default function FinanceDashboardPage() {
  const router = useRouter();
  const { user, hasRole } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'programs' | 'transactions' | 'donors'>('overview');

  const [statistics, setStatistics] = useState<any>(null);
  const [programsFunds, setProgramsFunds] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [topDonors, setTopDonors] = useState<any[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<any>(null);
  const [programDonors, setProgramDonors] = useState<any[]>([]);
  const [showDonorsModal, setShowDonorsModal] = useState(false);
  const [loadingDonors, setLoadingDonors] = useState(false);

  useEffect(() => {
    if (!hasRole(['FINANCE', 'SUPER_ADMIN'])) {
      router.push('/admin/dashboard');
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, programsRes, transactionsRes, donorsRes] = await Promise.all([
        financeApi.getStatistics(),
        financeApi.getProgramsFunds(),
        financeApi.getAllTransactions({ limit: 50 }),
        financeApi.getTopDonors(10),
      ]);

      setStatistics(statsRes.data);
      setProgramsFunds(programsRes.data);
      setTransactions(transactionsRes.data.data);
      setTopDonors(donorsRes.data);
    } catch (error) {
      console.error('Failed to fetch finance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleViewProgramDetails = async (program: any) => {
    setSelectedProgram(program);
    setShowDonorsModal(true);
    setLoadingDonors(true);

    try {
      const donorsRes = await financeApi.getProgramDonors(program.id, 100, 0);
      setProgramDonors(donorsRes.data.data);
    } catch (error) {
      console.error('Failed to fetch program donors:', error);
    } finally {
      setLoadingDonors(false);
    }
  };

  // Generate PDF Report for overall finance
  const handleExportOverallPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Laporan Keuangan - SobatBantu Platform</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
          h1 { color: #0284c7; border-bottom: 2px solid #0284c7; padding-bottom: 10px; }
          h2 { color: #374151; margin-top: 30px; }
          .header { text-align: center; margin-bottom: 40px; }
          .stats { display: flex; flex-wrap: wrap; gap: 20px; margin: 20px 0; }
          .stat-card { border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px; flex: 1; min-width: 200px; }
          .stat-value { font-size: 24px; font-weight: bold; color: #059669; }
          .stat-label { color: #6b7280; font-size: 14px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #e5e7eb; padding: 12px; text-align: left; }
          th { background: #f3f4f6; font-weight: 600; }
          .text-right { text-align: right; }
          .text-green { color: #059669; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Laporan Keuangan</h1>
          <p>SobatBantu Platform - Donasi Digital Terpercaya</p>
          <p>Tanggal Cetak: ${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        <h2>Ringkasan Keuangan</h2>
        <div class="stats">
          <div class="stat-card">
            <div class="stat-value">${formatCurrency(statistics?.totalAmount || 0)}</div>
            <div class="stat-label">Total Dana Terkumpul</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${statistics?.totalDonations || 0}</div>
            <div class="stat-label">Total Transaksi</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${statistics?.activePrograms || 0}</div>
            <div class="stat-label">Program Aktif</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${formatCurrency(statistics?.averageDonation || 0)}</div>
            <div class="stat-label">Rata-rata Donasi</div>
          </div>
        </div>

        <h2>Rekap per Program</h2>
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Program</th>
              <th>Pembuat</th>
              <th>Status</th>
              <th class="text-right">Target</th>
              <th class="text-right">Terkumpul</th>
              <th class="text-right">Progress</th>
              <th class="text-right">Jumlah Donatur</th>
            </tr>
          </thead>
          <tbody>
            ${programsFunds.map((program, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${program.title}</td>
                <td>${program.creator?.name || '-'}</td>
                <td>${program.status}</td>
                <td class="text-right">${formatCurrency(Number(program.targetAmount))}</td>
                <td class="text-right text-green">${formatCurrency(Number(program.collectedAmount))}</td>
                <td class="text-right">${program.percentageReached.toFixed(1)}%</td>
                <td class="text-right">${program.donorCount}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <h2>Top 10 Donatur</h2>
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Nama Donatur</th>
              <th class="text-right">Total Donasi</th>
              <th class="text-right">Jumlah Transaksi</th>
              <th class="text-right">Program Didukung</th>
            </tr>
          </thead>
          <tbody>
            ${topDonors.slice(0, 10).map((donor, index) => `
              <tr>
                <td>#${index + 1}</td>
                <td>${donor.donorName}</td>
                <td class="text-right text-green">${formatCurrency(donor.totalAmount)}</td>
                <td class="text-right">${donor.donationCount}</td>
                <td class="text-right">${donor.programsSupported}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          <p>Dokumen ini dicetak secara otomatis dari SobatBantu Platform Finance Dashboard.</p>
          <p>Data akurat per tanggal dan waktu cetak.</p>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  };

  // Generate PDF for specific program
  const handleExportProgramPDF = async (program: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Fetch donors for this program
    let donors: any[] = [];
    try {
      const donorsRes = await financeApi.getProgramDonors(program.id, 100, 0);
      donors = donorsRes.data.data || [];
    } catch (error) {
      console.error('Failed to fetch donors for PDF:', error);
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Rekap Program - ${program.title}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
          h1 { color: #0284c7; border-bottom: 2px solid #0284c7; padding-bottom: 10px; }
          h2 { color: #374151; margin-top: 30px; }
          .header { text-align: center; margin-bottom: 40px; }
          .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 20px 0; }
          .info-item { border: 1px solid #e5e7eb; padding: 15px; border-radius: 8px; }
          .info-label { color: #6b7280; font-size: 12px; margin-bottom: 5px; }
          .info-value { font-size: 18px; font-weight: bold; }
          .text-green { color: #059669; }
          .progress-bar { width: 100%; height: 20px; background: #e5e7eb; border-radius: 10px; overflow: hidden; margin: 10px 0; }
          .progress-fill { height: 100%; background: #0284c7; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #e5e7eb; padding: 10px; text-align: left; }
          th { background: #f3f4f6; font-weight: 600; }
          .text-right { text-align: right; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Rekap Program Donasi</h1>
          <p>SobatBantu Platform - Donasi Digital Terpercaya</p>
          <p>Tanggal Cetak: ${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        <h2>${program.title}</h2>
        <p style="color: #6b7280;">Dibuat oleh: ${program.creator?.name || '-'} | Status: ${program.status}</p>

        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">Target Dana</div>
            <div class="info-value">${formatCurrency(Number(program.targetAmount))}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Dana Terkumpul</div>
            <div class="info-value text-green">${formatCurrency(Number(program.collectedAmount))}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Total Transaksi</div>
            <div class="info-value">${program.totalDonations}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Donatur Unik</div>
            <div class="info-value">${program.donorCount}</div>
          </div>
        </div>

        <div style="margin: 20px 0;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
            <span>Progress Donasi</span>
            <span>${program.percentageReached.toFixed(1)}%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${Math.min(program.percentageReached, 100)}%"></div>
          </div>
        </div>

        <h2>Daftar Donatur (${donors.length} donatur)</h2>
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Nama Donatur</th>
              <th>Email</th>
              <th class="text-right">Total Donasi</th>
              <th class="text-right">Jumlah Transaksi</th>
            </tr>
          </thead>
          <tbody>
            ${donors.map((donor, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${donor.isAnonymous ? 'Anonim' : donor.donorName || '-'}</td>
                <td>${donor.isAnonymous ? '-' : (donor.donorEmail || '-')}</td>
                <td class="text-right text-green">${formatCurrency(donor.totalAmount)}</td>
                <td class="text-right">${donor.donationCount}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          <p>Dokumen ini dicetak secara otomatis dari SobatBantu Platform Finance Dashboard.</p>
          <p>Data akurat per tanggal dan waktu cetak.</p>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600 mb-3" />
          <p className="text-sm text-gray-600">Loading finance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Finance Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">Kelola dan pantau seluruh transaksi keuangan</p>
        </div>
        <button
          onClick={handleExportOverallPDF}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Export PDF Laporan</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="text-sm text-gray-600 mb-1">Total Dana Terkumpul</div>
          <div className="text-2xl font-semibold text-gray-900">
            {formatCurrency(statistics?.totalAmount || 0)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {statistics?.totalDonations || 0} transaksi sukses
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-amber-600" />
            </div>
          </div>
          <div className="text-sm text-gray-600 mb-1">Dana Pending</div>
          <div className="text-2xl font-semibold text-gray-900">
            {formatCurrency(statistics?.pendingAmount || 0)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {statistics?.pendingDonations || 0} transaksi pending
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Wallet className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="text-sm text-gray-600 mb-1">Program Aktif</div>
          <div className="text-2xl font-semibold text-gray-900">
            {statistics?.activePrograms || 0}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Menerima donasi
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="text-sm text-gray-600 mb-1">Rata-rata Donasi</div>
          <div className="text-2xl font-semibold text-gray-900">
            {formatCurrency(statistics?.averageDonation || 0)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Per transaksi
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'overview'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <PieChart className="w-4 h-4" />
                <span>Overview</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('programs')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'programs'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Wallet className="w-4 h-4" />
                <span>E-Wallet per Program</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'transactions'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <CreditCard className="w-4 h-4" />
                <span>All Transactions</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('donors')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'donors'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>Top Donors</span>
              </div>
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-700">Program dengan Dana Terbanyak</h4>
                    {programsFunds.slice(0, 5).map((program, index) => (
                      <div key={program.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {index + 1}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{program.title}</div>
                            <div className="text-xs text-gray-500">{program.totalDonations} donasi</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-green-600">
                            {formatCurrency(Number(program.collectedAmount))}
                          </div>
                          <div className="text-xs text-gray-500">
                            {program.percentageReached.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-700">Top 5 Donatur</h4>
                    {topDonors.slice(0, 5).map((donor, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {index + 1}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{donor.donorName}</div>
                            <div className="text-xs text-gray-500">{donor.donationCount} donasi • {donor.programsSupported} program</div>
                          </div>
                        </div>
                        <div className="text-sm font-semibold text-purple-600">
                          {formatCurrency(donor.totalAmount)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Programs E-Wallet Tab */}
          {activeTab === 'programs' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">E-Wallet per Program</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {programsFunds.map((program) => (
                  <div key={program.id} className="border border-gray-200 rounded-lg p-5 hover:border-primary-300 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="text-base font-semibold text-gray-900 mb-1">{program.title}</h4>
                        <div className="text-xs text-gray-500">
                          by {program.creator.name}
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        program.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-700'
                          : program.status === 'COMPLETED'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {program.status}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Dana Terkumpul:</span>
                        <span className="text-lg font-semibold text-green-600">
                          {formatCurrency(Number(program.collectedAmount))}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Target:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {formatCurrency(Number(program.targetAmount))}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-600 rounded-full"
                          style={{ width: `${Math.min(program.percentageReached, 100)}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{program.totalDonations} transaksi</span>
                        <span>{program.donorCount} donatur unik</span>
                        <span>{program.percentageReached.toFixed(1)}%</span>
                      </div>

                      {program.recentDonations.length > 0 && (
                        <div className="pt-3 border-t border-gray-200">
                          <div className="text-xs font-medium text-gray-700 mb-2">Donasi Terbaru:</div>
                          <div className="space-y-1">
                            {program.recentDonations.slice(0, 3).map((donation: any) => (
                              <div key={donation.id} className="flex items-center justify-between text-xs">
                                <span className="text-gray-600">
                                  {donation.isAnonymous ? 'Anonim' : donation.donorName}
                                </span>
                                <span className="text-gray-900 font-medium">
                                  {formatCurrency(Number(donation.amount))}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => handleViewProgramDetails(program)}
                          className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Lihat Donatur</span>
                        </button>
                        <button
                          onClick={() => handleExportProgramPDF(program)}
                          className="flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                          title="Export PDF Rekap Program"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Transactions Tab */}
          {activeTab === 'transactions' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Semua Transaksi</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Order ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Program</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Donatur</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Jumlah</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Tanggal</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900 font-mono">{tx.actionpayOrderId}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{tx.program?.title || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {tx.isAnonymous ? 'Anonim' : tx.donorName || tx.user?.name || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-green-600">
                          {formatCurrency(Number(tx.amount))}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs font-medium rounded ${
                            tx.status === 'SUCCESS'
                              ? 'bg-green-100 text-green-700'
                              : tx.status === 'PENDING'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {tx.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">{formatDate(tx.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Donors Tab */}
          {activeTab === 'donors' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Top Donatur</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {topDonors.map((donor, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                    <div className="w-12 h-12 bg-primary-700 rounded-full flex items-center justify-center text-white text-lg font-bold">
                      #{index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="text-base font-semibold text-gray-900">{donor.donorName}</div>
                      <div className="text-xs text-gray-500">
                        {donor.donationCount} donasi • {donor.programsSupported} program didukung
                      </div>
                      {donor.donorEmail && (
                        <div className="text-xs text-gray-400">{donor.donorEmail}</div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        {formatCurrency(donor.totalAmount)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Donors Modal */}
      {showDonorsModal && selectedProgram && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Detail Donatur - {selectedProgram.title}
                  </h3>
                  <div className="text-sm text-gray-600">
                    Total: {formatCurrency(Number(selectedProgram.collectedAmount))} dari {selectedProgram.totalDonations} transaksi
                  </div>
                </div>
                <button
                  onClick={() => setShowDonorsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {loadingDonors ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary-600 mb-3" />
                  <p className="text-sm text-gray-600">Loading donors...</p>
                </div>
              ) : programDonors.length > 0 ? (
                <div className="space-y-3">
                  {programDonors.map((donor, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-medium">
                          {donor.isAnonymous ? '?' : (donor.donorName?.charAt(0).toUpperCase() || 'U')}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">
                            {donor.isAnonymous ? 'Anonymous' : donor.donorName || 'Unknown'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {donor.donationCount} donasi
                            {donor.donorEmail && !donor.isAnonymous && (
                              <span> • {donor.donorEmail}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-base font-bold text-green-600">
                          {formatCurrency(donor.totalAmount)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Total donasi
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-600">Belum ada donatur untuk program ini</p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Total {programDonors.length} donatur unik
                </div>
                <button
                  onClick={() => setShowDonorsModal(false)}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
