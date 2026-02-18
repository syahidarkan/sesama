import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import slugify from 'slugify';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with new schema...');

  // Migrate old super admin email if exists
  await prisma.user.updateMany({
    where: { email: 'superadmin@sobatbantu.org', role: 'SUPER_ADMIN' },
    data: { email: 'syh.arkan@gmail.com' },
  });

  // Create Users with new roles
  const hashedPassword = await bcrypt.hash('password', 10);

  const superAdmin = await prisma.user.upsert({
    where: { email: 'syh.arkan@gmail.com' },
    update: {},
    create: {
      email: 'syh.arkan@gmail.com',
      name: 'Super Admin',
      passwordHash: hashedPassword,
      role: 'SUPER_ADMIN',
      isActive: true,
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: 'manager@sobatbantu.org' },
    update: {},
    create: {
      email: 'manager@sobatbantu.org',
      name: 'Manager SobatBantu',
      passwordHash: hashedPassword,
      role: 'MANAGER',
      isActive: true,
    },
  });

  const contentManager = await prisma.user.upsert({
    where: { email: 'content@sobatbantu.org' },
    update: {},
    create: {
      email: 'content@sobatbantu.org',
      name: 'Content Manager',
      passwordHash: hashedPassword,
      role: 'CONTENT_MANAGER',
      isActive: true,
    },
  });

  const supervisor = await prisma.user.upsert({
    where: { email: 'supervisor@sobatbantu.org' },
    update: {},
    create: {
      email: 'supervisor@sobatbantu.org',
      name: 'Supervisor',
      passwordHash: hashedPassword,
      role: 'SUPERVISOR',
      isActive: true,
    },
  });

  const pengusul1 = await prisma.user.upsert({
    where: { email: 'pengusul1@example.com' },
    update: {},
    create: {
      email: 'pengusul1@example.com',
      name: 'Ahmad Hidayat',
      passwordHash: hashedPassword,
      role: 'PENGUSUL',
      isActive: true,
      pengusulStatus: 'APPROVED',
      ktpNumber: '3201012345670001',
      ktpImageUrl: 'https://example.com/ktp/ahmad.jpg',
      phone: '081234567890',
      address: 'Jl. Contoh No. 123, Jakarta',
      institutionName: 'SobatBantu',
      institutionProfile: 'Yayasan yang bergerak di bidang pendidikan dan sosial',
      supportingDocuments: ['https://example.com/docs/akta.pdf'],
      verifiedAt: new Date(),
      verifiedBy: manager.id,
    },
  });

  const pengusul2 = await prisma.user.upsert({
    where: { email: 'pengusul2@example.com' },
    update: {},
    create: {
      email: 'pengusul2@example.com',
      name: 'Siti Nurhaliza',
      passwordHash: hashedPassword,
      role: 'PENGUSUL',
      isActive: true,
      pengusulStatus: 'APPROVED',
      ktpNumber: '3201012345670002',
      ktpImageUrl: 'https://example.com/ktp/siti.jpg',
      phone: '081234567891',
      address: 'Jl. Mawar No. 456, Bandung',
      institutionName: 'Masjid Al-Ikhlas',
      institutionProfile: 'Masjid dan lembaga pendidikan Islam',
      verifiedAt: new Date(),
      verifiedBy: manager.id,
    },
  });

  console.log('✅ Users created');

  // Create Programs with slug
  const slug1 = slugify('Bantuan Pendidikan Anak Yatim 2026', { lower: true }) + '-1';
  const program1 = await prisma.program.upsert({
    where: { slug: slug1 },
    update: {},
    create: {
      title: 'Bantuan Pendidikan Anak Yatim 2026',
      slug: slug1,
      description:
        'Program bantuan pendidikan untuk 100 anak yatim di berbagai daerah. Dana akan digunakan untuk biaya sekolah, buku, seragam, dan perlengkapan belajar.',
      targetAmount: 50000000,
      collectedAmount: 15000000,
      status: 'ACTIVE',
      category: 'Pendidikan',
      imageUrl: 'https://example.com/programs/pendidikan.jpg',
      createdBy: pengusul1.id,
      publishedAt: new Date(),
    },
  });

  const slug2 = slugify('Renovasi Masjid Al-Ikhlas', { lower: true }) + '-2';
  const program2 = await prisma.program.upsert({
    where: { slug: slug2 },
    update: {},
    create: {
      title: 'Renovasi Masjid Al-Ikhlas',
      slug: slug2,
      description:
        'Renovasi dan perbaikan masjid yang kondisinya sudah rusak. Meliputi atap, lantai, sound system, dan perlengkapan sholat.',
      targetAmount: 100000000,
      collectedAmount: 35000000,
      status: 'ACTIVE',
      category: 'Masjid',
      imageUrl: 'https://example.com/programs/masjid.jpg',
      createdBy: pengusul2.id,
      publishedAt: new Date(),
    },
  });

  const slug3 = slugify('Bantuan Pangan Ramadhan 1446H', { lower: true }) + '-3';
  const program3 = await prisma.program.upsert({
    where: { slug: slug3 },
    update: {},
    create: {
      title: 'Bantuan Pangan Ramadhan 1446H',
      slug: slug3,
      description:
        'Distribusi 500 paket sembako untuk keluarga dhuafa menjelang dan selama bulan Ramadhan. Setiap paket berisi beras, minyak, gula, dan kebutuhan pokok lainnya.',
      targetAmount: 30000000,
      collectedAmount: 12000000,
      status: 'ACTIVE',
      category: 'Sosial',
      createdBy: contentManager.id,
      publishedAt: new Date(),
    },
  });

  console.log('✅ Programs created');

  // Create sample donations
  await prisma.donation.createMany({
    skipDuplicates: true,
    data: [
      {
        programId: program1.id,
        donorName: 'Budi Santoso',
        donorEmail: 'budi@example.com',
        amount: 500000,
        actionpayOrderId: 'ACTIONPAY-SEED-001',
        status: 'SUCCESS',
        isAnonymous: false,
        paidAt: new Date(),
      },
      {
        programId: program1.id,
        donorName: 'Dewi Lestari',
        donorEmail: 'dewi@example.com',
        amount: 1000000,
        actionpayOrderId: 'ACTIONPAY-SEED-002',
        status: 'SUCCESS',
        isAnonymous: false,
        paidAt: new Date(),
      },
      {
        programId: program2.id,
        donorName: 'Hamba Allah',
        amount: 2000000,
        actionpayOrderId: 'ACTIONPAY-SEED-003',
        status: 'SUCCESS',
        isAnonymous: true,
        paidAt: new Date(),
      },
      {
        programId: program3.id,
        donorName: 'Rizki Maulana',
        donorEmail: 'rizki@example.com',
        amount: 750000,
        actionpayOrderId: 'ACTIONPAY-SEED-004',
        status: 'SUCCESS',
        isAnonymous: false,
        paidAt: new Date(),
      },
    ],
  });

  console.log('✅ Donations created');

  // Create leaderboard entries
  await prisma.donorLeaderboard.createMany({
    skipDuplicates: true,
    data: [
      {
        donorIdentifier: 'budi@example.com',
        donorName: 'Budi Santoso',
        totalDonations: 500000,
        donationCount: 1,
        title: 'PEMULA',
        isAnonymous: false,
        lastDonationAt: new Date(),
      },
      {
        donorIdentifier: 'dewi@example.com',
        donorName: 'Dewi Lestari',
        totalDonations: 1000000,
        donationCount: 1,
        title: 'DERMAWAN',
        isAnonymous: false,
        lastDonationAt: new Date(),
      },
      {
        donorIdentifier: 'rizki@example.com',
        donorName: 'Rizki Maulana',
        totalDonations: 750000,
        donationCount: 1,
        title: 'PEMULA',
        isAnonymous: false,
        lastDonationAt: new Date(),
      },
    ],
  });

  console.log('✅ Leaderboard created');

  // Create sample article (laporan penyaluran)
  const articleSlug = slugify('Laporan Penyaluran Bantuan Pendidikan Periode Januari 2026', {
    lower: true,
  });
  const article1 = await prisma.article.upsert({
    where: { slug: articleSlug },
    update: {},
    create: {
      title: 'Laporan Penyaluran Bantuan Pendidikan Periode Januari 2026',
      slug: articleSlug,
      content: `
# Laporan Penyaluran Bantuan Pendidikan

Alhamdulillah, pada bulan Januari 2026, kami telah berhasil menyalurkan bantuan pendidikan kepada 25 anak yatim di wilayah Jakarta dan sekitarnya.

## Detail Penyaluran

- **Jumlah Penerima**: 25 anak
- **Total Dana**: Rp 15.000.000
- **Bentuk Bantuan**:
  - Biaya SPP selama 6 bulan
  - Seragam sekolah lengkap
  - Tas dan perlengkapan sekolah

## Dokumentasi

Kegiatan penyaluran dilakukan dengan penuh kehangatan dan doa. Anak-anak sangat antusias dan bersyukur atas bantuan yang diberikan.

Terima kasih kepada semua donatur yang telah berpartisipasi. Semoga Allah SWT membalas kebaikan kalian semua.
      `,
      excerpt: 'Laporan penyaluran bantuan pendidikan kepada 25 anak yatim di Jakarta',
      coverImageUrl: 'https://example.com/articles/laporan-1.jpg',
      programId: program1.id,
      authorId: pengusul1.id,
      status: 'PUBLISHED',
      publishedAt: new Date(),
    },
  });

  console.log('✅ Articles created');

  // Seed System Settings (Dropdown Options)
  console.log('\n🔧 Creating system settings...');

  const programCategories = [
    { key: 'PENDIDIKAN', value: 'Pendidikan', sortOrder: 1 },
    { key: 'KESEHATAN', value: 'Kesehatan', sortOrder: 2 },
    { key: 'SOSIAL', value: 'Sosial & Kemanusiaan', sortOrder: 3 },
    { key: 'BENCANA', value: 'Tanggap Bencana', sortOrder: 4 },
    { key: 'EKONOMI', value: 'Pemberdayaan Ekonomi', sortOrder: 5 },
    { key: 'INFRASTRUKTUR', value: 'Infrastruktur', sortOrder: 6 },
    { key: 'LINGKUNGAN', value: 'Lingkungan', sortOrder: 7 },
  ];

  for (const cat of programCategories) {
    await prisma.systemSetting.upsert({
      where: { category_key: { category: 'program_categories', key: cat.key } },
      update: {},
      create: { category: 'program_categories', ...cat },
    });
  }

  const institutionTypes = [
    { key: 'YAYASAN', value: 'Yayasan', sortOrder: 1 },
    { key: 'PERKUMPULAN', value: 'Perkumpulan', sortOrder: 2 },
    { key: 'LAZ', value: 'Lembaga Sosial', sortOrder: 3 },
    { key: 'ORMAS', value: 'Organisasi Masyarakat', sortOrder: 4 },
    { key: 'PESANTREN', value: 'Pesantren', sortOrder: 5 },
    { key: 'MASJID', value: 'Masjid/Musholla', sortOrder: 6 },
    { key: 'SEKOLAH', value: 'Sekolah/Madrasah', sortOrder: 7 },
    { key: 'LAINNYA', value: 'Lainnya', sortOrder: 8 },
  ];

  for (const type of institutionTypes) {
    await prisma.systemSetting.upsert({
      where: { category_key: { category: 'institution_types', key: type.key } },
      update: {},
      create: { category: 'institution_types', ...type },
    });
  }

  const bankNames = [
    { key: 'BRI', value: 'Bank BRI', sortOrder: 1 },
    { key: 'BNI', value: 'Bank BNI', sortOrder: 2 },
    { key: 'BCA', value: 'Bank BCA', sortOrder: 3 },
    { key: 'MANDIRI', value: 'Bank Mandiri', sortOrder: 4 },
    { key: 'BSI', value: 'Bank Syariah Indonesia (BSI)', sortOrder: 5 },
    { key: 'BTN', value: 'Bank BTN', sortOrder: 6 },
    { key: 'CIMB', value: 'Bank CIMB Niaga', sortOrder: 7 },
    { key: 'DANAMON', value: 'Bank Danamon', sortOrder: 8 },
    { key: 'PERMATA', value: 'Bank Permata', sortOrder: 9 },
    { key: 'BNI_SYARIAH', value: 'BNI Syariah', sortOrder: 10 },
    { key: 'MUAMALAT', value: 'Bank Muamalat', sortOrder: 11 },
    { key: 'LAINNYA', value: 'Bank Lainnya', sortOrder: 12 },
  ];

  for (const bank of bankNames) {
    await prisma.systemSetting.upsert({
      where: { category_key: { category: 'bank_names', key: bank.key } },
      update: {},
      create: { category: 'bank_names', ...bank },
    });
  }

  console.log('✅ System settings created');

  // Seed Static Pages
  console.log('\n📄 Creating static pages...');

  const aboutUsContent = `
# Tentang SobatBantu

SobatBantu adalah platform donasi digital yang hadir untuk menghubungkan donatur dengan program-program sosial yang terverifikasi dan terpercaya. Kami berkomitmen untuk memastikan setiap donasi tersalurkan secara transparan, akuntabel, dan tepat sasaran kepada mereka yang membutuhkan.

## Visi
Menjadi platform donasi digital terpercaya dan berdampak nyata bagi masyarakat Indonesia.

## Misi
- Menyediakan platform donasi yang transparan dan akuntabel bagi seluruh lapisan masyarakat
- Menghubungkan donatur dengan program sosial yang terverifikasi dan berdampak nyata
- Memberikan kemudahan dan keamanan dalam berdonasi secara digital

## Kontak
Email: info@sobatbantu.org
Phone: (021) 1234-5678
      `;

  await prisma.staticPage.upsert({
    where: { slug: 'about-us' },
    update: { title: 'Tentang Kami', content: aboutUsContent },
    create: {
      slug: 'about-us',
      title: 'Tentang Kami',
      content: aboutUsContent,
    },
  });

  const legalContent = `
# Kebijakan Legal & Privasi

## Kebijakan Privasi
SobatBantu menghormati privasi Anda dan berkomitmen untuk melindungi data pribadi Anda.

## Syarat & Ketentuan
Dengan menggunakan platform ini, Anda menyetujui syarat dan ketentuan yang berlaku.

## Hubungi Kami
Jika ada pertanyaan terkait kebijakan legal, silakan hubungi legal@sobatbantu.org
      `;

  await prisma.staticPage.upsert({
    where: { slug: 'legal' },
    update: { title: 'Kebijakan Legal', content: legalContent },
    create: {
      slug: 'legal',
      title: 'Kebijakan Legal',
      content: legalContent,
    },
  });

  const privacyContent = `
# Kebijakan Privasi SobatBantu Platform

Terakhir diperbarui: Januari 2026

## Pendahuluan
SobatBantu Platform ("kami", "kita", atau "platform") berkomitmen untuk melindungi dan menghormati privasi Anda. Kebijakan privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi pribadi Anda.

## Informasi yang Kami Kumpulkan

### 1. Informasi Pribadi
- Nama lengkap
- Alamat email
- Nomor telepon
- Alamat
- Nomor KTP (untuk pengusul)

### 2. Informasi Donasi
- Jumlah donasi
- Metode pembayaran
- Riwayat transaksi

### 3. Informasi Teknis
- Alamat IP
- Browser yang digunakan
- Waktu akses

## Bagaimana Kami Menggunakan Informasi Anda
Informasi yang kami kumpulkan digunakan untuk:
- Memproses donasi Anda
- Mengirimkan konfirmasi dan tanda terima donasi
- Memberikan laporan transparansi
- Meningkatkan layanan platform
- Mematuhi kewajiban hukum

## Keamanan Data
Kami menerapkan langkah-langkah keamanan teknis dan organisasi yang sesuai untuk melindungi data pribadi Anda dari akses tidak sah, kehilangan, atau penyalahgunaan.

## Hak Anda
Anda berhak untuk:
- Mengakses data pribadi Anda
- Memperbarui atau mengoreksi data Anda
- Menghapus data Anda (dengan batasan tertentu)
- Menarik persetujuan Anda

## Hubungi Kami
Jika Anda memiliki pertanyaan tentang kebijakan privasi ini, silakan hubungi:
- Email: privacy@sobatbantu.org
- Telepon: (021) 1234-5678
      `;

  await prisma.staticPage.upsert({
    where: { slug: 'privacy-policy' },
    update: { title: 'Kebijakan Privasi', content: privacyContent },
    create: {
      slug: 'privacy-policy',
      title: 'Kebijakan Privasi',
      content: privacyContent,
    },
  });

  const tosContent = `
# Syarat dan Ketentuan Penggunaan

Terakhir diperbarui: Januari 2026

## 1. Penerimaan Syarat
Dengan mengakses dan menggunakan SobatBantu Platform, Anda setuju untuk terikat dengan syarat dan ketentuan berikut.

## 2. Penggunaan Platform

### 2.1 Eligibilitas
- Anda harus berusia minimal 17 tahun untuk menggunakan platform ini
- Anda bertanggung jawab atas keakuratan informasi yang Anda berikan

### 2.2 Akun Pengguna
- Anda bertanggung jawab untuk menjaga kerahasiaan kredensial akun Anda
- Anda setuju untuk tidak berbagi akun dengan orang lain
- Anda harus segera melaporkan penggunaan tidak sah atas akun Anda

## 3. Donasi

### 3.1 Proses Donasi
- Semua donasi bersifat sukarela
- Donasi yang telah diproses tidak dapat dikembalikan, kecuali dalam kondisi tertentu
- Kami berhak menolak donasi yang mencurigakan

### 3.2 Transparansi
- Kami berkomitmen untuk transparansi dalam penggunaan dana
- Laporan penyaluran dana akan dipublikasikan secara berkala

## 4. Program Pengusul

### 4.1 Pengajuan Program
- Pengusul harus menyediakan informasi yang akurat dan lengkap
- Semua dokumen yang diajukan harus autentik
- Kami berhak memverifikasi kebenaran informasi yang diberikan

### 4.2 Persetujuan Program
- Tidak semua program yang diajukan akan disetujui
- Keputusan persetujuan bersifat final

## 5. Tanggung Jawab Pengguna
Anda setuju untuk:
- Tidak menggunakan platform untuk tujuan ilegal
- Tidak melakukan penipuan atau penyalahgunaan
- Tidak mengganggu operasi normal platform
- Mematuhi semua hukum dan peraturan yang berlaku

## 6. Hak Kekayaan Intelektual
Semua konten di platform ini, termasuk teks, grafik, logo, dan perangkat lunak, adalah milik SobatBantu dan dilindungi oleh undang-undang hak cipta.

## 7. Pembatasan Tanggung Jawab
SobatBantu tidak bertanggung jawab atas:
- Kehilangan atau kerusakan yang timbul dari penggunaan platform
- Kesalahan atau kelalaian dalam konten
- Gangguan layanan atau downtime

## 8. Perubahan Syarat
Kami berhak mengubah syarat dan ketentuan ini kapan saja. Perubahan akan berlaku setelah dipublikasikan di platform.

## 9. Hukum yang Berlaku
Syarat dan ketentuan ini diatur oleh hukum Republik Indonesia.

## 10. Kontak
Untuk pertanyaan tentang syarat dan ketentuan ini:
- Email: legal@sobatbantu.org
- Telepon: (021) 1234-5678
      `;

  await prisma.staticPage.upsert({
    where: { slug: 'terms-of-service' },
    update: { title: 'Syarat dan Ketentuan', content: tosContent },
    create: {
      slug: 'terms-of-service',
      title: 'Syarat dan Ketentuan',
      content: tosContent,
    },
  });

  const faqContent = `
# Frequently Asked Questions (FAQ)

## Tentang Donasi

### Bagaimana cara berdonasi?
1. Pilih program yang ingin Anda dukung
2. Klik tombol "Donasi Sekarang"
3. Masukkan jumlah donasi
4. Pilih metode pembayaran
5. Selesaikan pembayaran

### Apakah donasi saya aman?
Ya, kami menggunakan sistem pembayaran yang aman dan terenkripsi untuk melindungi informasi Anda.

### Apakah saya akan mendapatkan tanda terima donasi?
Ya, tanda terima donasi akan dikirimkan ke email Anda setelah donasi berhasil diproses.

### Bisakah saya berdonasi secara anonim?
Ya, Anda dapat memilih opsi "Donasi Anonim" saat melakukan donasi.

### Apakah donasi dapat dikembalikan?
Donasi yang telah diproses umumnya tidak dapat dikembalikan. Namun, jika terjadi kesalahan teknis, silakan hubungi kami.

## Tentang Program

### Siapa yang dapat mengajukan program?
Individu atau lembaga yang telah terverifikasi sebagai pengusul dapat mengajukan program donasi.

### Berapa lama proses verifikasi pengusul?
Proses verifikasi biasanya memakan waktu 3-7 hari kerja setelah dokumen lengkap diterima.

### Apa saja dokumen yang diperlukan untuk menjadi pengusul?
Untuk individu: KTP, surat keterangan RT/RW, dan bukti kondisi.
Untuk lembaga: Akta notaris, SK Kemenkumham, NPWP, dan proposal program.

## Tentang Transparansi

### Bagaimana saya tahu dana saya digunakan dengan baik?
Kami mempublikasikan laporan penyaluran dana secara berkala untuk setiap program yang dapat Anda akses di platform.

### Apakah ada biaya administrasi?
Biaya administrasi maksimal 10% dari total donasi, yang digunakan untuk operasional platform dan verifikasi program.

## Tentang Akun

### Bagaimana cara mengubah informasi akun saya?
Login ke akun Anda, buka menu "Profil", dan perbarui informasi yang diperlukan.

### Saya lupa password, bagaimana cara mereset?
Klik "Lupa Password" di halaman login, masukkan email Anda, dan ikuti instruksi yang dikirimkan.

## Kontak

### Bagaimana cara menghubungi SobatBantu?
- Email: info@sobatbantu.org
- WhatsApp: +62 812-3456-7890
- Telepon: (021) 1234-5678
- Jam operasional: Senin-Jumat, 08:00-17:00 WIB

### Dimana alamat kantor SobatBantu?
Kantor Pusat SobatBantu
Jl. Menteng Raya No. 62, Jakarta Pusat 10340

Pertanyaan lain? Jangan ragu untuk menghubungi kami!
      `;

  await prisma.staticPage.upsert({
    where: { slug: 'faq' },
    update: { title: 'Frequently Asked Questions (FAQ)', content: faqContent },
    create: {
      slug: 'faq',
      title: 'Frequently Asked Questions (FAQ)',
      content: faqContent,
    },
  });

  const contactContent = `
# Hubungi Kami

Kami siap melayani dan menjawab pertanyaan Anda. Jangan ragu untuk menghubungi kami melalui channel berikut:

## Kantor Pusat

**SobatBantu Platform**
Jl. Menteng Raya No. 62
Jakarta Pusat 10340
Indonesia

## Kontak

### Customer Service
- **Email**: info@sobatbantu.org
- **WhatsApp**: +62 812-3456-7890
- **Telepon**: (021) 1234-5678
- **Fax**: (021) 1234-5679

### Media & Partnership
- **Email**: media@sobatbantu.org
- **Telepon**: (021) 1234-5680

### Legal & Compliance
- **Email**: legal@sobatbantu.org
- **Telepon**: (021) 1234-5681

## Jam Operasional
**Senin - Jumat**: 08:00 - 17:00 WIB
**Sabtu**: 08:00 - 12:00 WIB
**Minggu & Hari Libur**: Tutup

## Media Sosial

Ikuti kami di media sosial untuk update terbaru:

- **Facebook**: facebook.com/sobatbantu
- **Instagram**: @sobatbantu
- **Twitter**: @sobatbantu
- **YouTube**: SobatBantu Official

## Formulir Kontak

Untuk pertanyaan atau masukan, silakan isi formulir di bawah atau kirim email langsung ke info@sobatbantu.org

---

**Catatan**: Kami akan merespons pertanyaan Anda dalam waktu 1x24 jam (hari kerja). Terima kasih atas kesabaran Anda!
      `;

  await prisma.staticPage.upsert({
    where: { slug: 'contact' },
    update: { title: 'Hubungi Kami', content: contactContent },
    create: {
      slug: 'contact',
      title: 'Hubungi Kami',
      content: contactContent,
    },
  });

  console.log('✅ Static pages created');

  // Seed Form Field Configs
  console.log('\n⚙️ Creating form field configurations...');

  const lembagaFields = [
    'institutionName', 'institutionAddress', 'institutionPhone', 'institutionEmail',
    'institutionType', 'institutionEstablished', 'institutionProfile',
    'aktaNotaris', 'skKemenkumham', 'npwp', 'suratDomisili', 'legalityDocs',
    'proposalUrl', 'officialLetterUrl', 'budgetPlanUrl',
    'picName', 'picPosition', 'picPhone', 'picEmail',
    'bankName', 'bankAccountNumber', 'bankAccountName'
  ];

  for (const field of lembagaFields) {
    await prisma.formFieldConfig.upsert({
      where: { formType_fieldName: { formType: 'program_lembaga', fieldName: field } },
      update: {},
      create: {
        formType: 'program_lembaga',
        fieldName: field,
        isVisible: true,
        isRequired: true,
      },
    });
  }

  const individuFields = [
    'ktpPengajuUrl', 'buktiKondisiUrls', 'suratKeteranganRtUrl',
    'beneficiaryBankAccount', 'beneficiaryBankName'
  ];

  for (const field of individuFields) {
    await prisma.formFieldConfig.upsert({
      where: { formType_fieldName: { formType: 'program_individu', fieldName: field } },
      update: {},
      create: {
        formType: 'program_individu',
        fieldName: field,
        isVisible: true,
        isRequired: true,
      },
    });
  }

  console.log('✅ Form field configurations created');

  // Seed Sample Berita
  console.log('\n📰 Creating sample berita...');

  const beritaSlug = 'sobatbantu-salurkan-bantuan-korban-bencana';
  await prisma.berita.upsert({
    where: { slug: beritaSlug },
    update: {},
    create: {
      title: 'SobatBantu Salurkan Bantuan ke Korban Bencana',
      slug: beritaSlug,
      content: `
# SobatBantu Salurkan Bantuan ke Korban Bencana

Jakarta, 11 Januari 2026 - SobatBantu telah menyalurkan bantuan kemanusiaan kepada korban bencana alam di beberapa wilayah Indonesia.

## Detail Bantuan
- Bantuan sembako untuk 500 keluarga
- Selimut dan pakaian layak pakai
- Tenda darurat
- Obat-obatan dan alat kesehatan

Tim relawan SobatBantu terus berkoordinasi dengan pihak terkait untuk memastikan bantuan tepat sasaran.
      `,
      excerpt: 'SobatBantu menyalurkan bantuan kemanusiaan kepada korban bencana alam',
      category: 'SOSIAL',
      authorId: contentManager.id,
      status: 'PUBLISHED',
      publishedAt: new Date(),
    },
  });

  console.log('✅ Sample berita created');

  console.log('\n🎉 Seeding completed successfully!');
  console.log('\n📝 Demo Accounts (NEW ROLE SYSTEM):');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Email: syh.arkan@gmail.com     | Password: password | Role: SUPER_ADMIN');
  console.log('Email: manager@sobatbantu.org     | Password: password | Role: MANAGER');
  console.log('Email: content@sobatbantu.org     | Password: password | Role: CONTENT_MANAGER');
  console.log('Email: supervisor@sobatbantu.org  | Password: password | Role: SUPERVISOR');
  console.log('Email: pengusul1@example.com   | Password: password | Role: PENGUSUL (Approved)');
  console.log('Email: pengusul2@example.com   | Password: password | Role: PENGUSUL (Approved)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
