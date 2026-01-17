# 🕌 KITA BISA - Platform Donasi LAZISMU

Platform donasi internal yang aman dan transparan untuk organisasi Islam (LAZISMU dan lembaga mitra) dengan sistem multi-role approval, integrasi payment gateway ActionPay, gamification, dan CMS laporan penyaluran.

![License](https://img.shields.io/badge/license-Internal-blue)
![Backend](https://img.shields.io/badge/backend-NestJS-red)
![Frontend](https://img.shields.io/badge/frontend-Next.js%2014-black)
![Database](https://img.shields.io/badge/database-PostgreSQL-blue)
![Deployment](https://img.shields.io/badge/deployment-Shared%20Hosting-green)

---

## ✨ Fitur Utama

### 🔐 Multi-Role System (6 Roles)

1. **USER** - Donatur publik
   - Donasi tanpa login
   - Melihat program & laporan
   - Mengajukan registrasi sebagai pengusul

2. **PENGUSUL** - Proposer yang terverifikasi
   - Registrasi dengan verifikasi KTP & dokumen pendukung
   - Status: `pending_verification`, `approved`, `rejected`
   - Membuat program donasi (butuh approval MANAGER)
   - Membuat laporan penyaluran (butuh approval MANAGER)

3. **MANAGER** - Gatekeeper utama sistem
   - Approve/reject registrasi pengusul
   - Approve/reject program donasi
   - Approve/reject laporan penyaluran
   - Approve/reject konten dari content manager
   - **TIDAK ADA konten publik tanpa approval manager**

4. **CONTENT_MANAGER** - Admin internal
   - Membuat program donasi (butuh approval MANAGER)
   - Membuat laporan penyaluran (butuh approval MANAGER)
   - Manage konten platform

5. **SUPERVISOR** - Read-only access
   - Melihat semua data (user, donasi, keuangan, audit log)
   - **TIDAK BISA** edit/approve/delete apapun
   - Monitoring & reporting

6. **SUPER_ADMIN** - Full access (emergency & setup)
   - Akses penuh tanpa approval
   - Semua aktivitas tercatat di audit log
   - Override approval jika diperlukan

### 💳 Payment Gateway - ActionPay

- **Direct to LAZIS Account** - Dana donasi langsung masuk ke rekening LAZIS
- Platform hanya menerima notifikasi transaksi (webhook)
- Tidak ada wallet internal atau saldo di platform
- **Signature Verification** (HMAC SHA256)
- **Idempotency** untuk mencegah duplikasi
- **Auto Progress Bar Update** - Progress donasi update otomatis setiap transaksi sukses

**Status Transaksi:**
- `PENDING` - Menunggu pembayaran
- `SUCCESS` - Pembayaran berhasil
- `FAILED` - Pembayaran gagal
- `EXPIRED` - Waktu pembayaran habis

### 🔒 Keamanan Berlapis

1. **Admin Area Protection**
   - URL terpisah dari public area
   - Middleware protection (tidak bisa diakses publik)
   - Session-based dengan auto-logout

2. **2FA / OTP**
   - Email OTP untuk login admin
   - OTP berlaku 5 menit
   - Rate limiting untuk prevent brute force

3. **Session Security**
   - Auto logout setelah idle 10 menit
   - Max session age 24 jam
   - Session tracking per device

4. **Re-Authentication untuk Aksi Sensitif**
   - Create/approve program → wajib OTP ulang
   - Approve pengusul → wajib OTP ulang
   - Publish article → wajib OTP ulang
   - Delete sensitive data → wajib OTP ulang

5. **Rate Limiting**
   - Max 10 requests per minute
   - Protection dari brute force & DDoS

### ✅ Multi-Layer Approval Workflow

**Approval diperlukan untuk:**
1. Registrasi pengusul → MANAGER approve
2. Program donasi baru → MANAGER approve
3. Edit program → MANAGER approve
4. Laporan penyaluran (artikel) → MANAGER approve
5. Konten dari content manager → MANAGER approve

**Setiap approval:**
- Tercatat (siapa, kapan, aksi apa, comment)
- **Immutable** (tidak bisa dihapus)
- Audit trail lengkap

### 📝 CMS Laporan Penyaluran

**Modul CMS untuk artikel laporan penyaluran dana:**
- Bisa dibuat oleh: PENGUSUL, CONTENT_MANAGER
- **Status**: `draft`, `pending_approval`, `published`, `rejected`
- Editable dengan histori perubahan (versioning)
- Publish hanya setelah approval MANAGER
- Support markdown & rich content
- Link ke program terkait

### 🏆 Gamification - Donor Leaderboard

**Sistem penghargaan untuk donatur:**
- Akumulasi donasi per user/email
- **Donor Titles** (otomatis berdasarkan total donasi):
  - **PEMULA** - < Rp 1 juta
  - **DERMAWAN** - Rp 1-10 juta
  - **JURAGAN** - Rp 10-50 juta
  - **SULTAN** - Rp 50-100 juta
  - **LEGEND** - > Rp 100 juta
- Leaderboard publik (hanya non-anonim)
- Donatur bisa pilih anonim
- Tidak menampilkan data sensitif

### 📊 Audit Log System

**Immutable logging untuk semua aktivitas:**
- Login/logout
- Create/update/delete
- Approve/reject
- Donation success
- OTP sent
- Session expired
- Verify pengusul

**Data yang dicatat:**
- User ID & role
- Action type
- Entity type & ID
- Metadata (context)
- IP address & user agent
- Timestamp

**Akses:**
- SUPERVISOR: Read-only semua log
- SUPER_ADMIN: Full access
- Retention: 365 hari (configurable)

---

## 🛠️ Tech Stack

### Backend
- **NestJS** - Progressive Node.js framework (TypeScript)
- **PostgreSQL** - Relational database (ACID compliance)
- **Prisma ORM** - Type-safe database access
- **JWT + Passport** - Authentication & authorization
- **otplib + qrcode** - 2FA/OTP implementation
- **nodemailer** - Email service (OTP, notifications)
- **axios** - HTTP client (ActionPay API)
- **bcrypt** - Password hashing
- **slugify** - URL-friendly slugs
- **@nestjs/throttler** - Rate limiting

### Frontend
- **Next.js 14** - React framework dengan App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS
- **Zustand** - State management
- **React Query (TanStack Query)** - Data fetching & caching
- **React Hook Form + Zod** - Form handling & validation
- **Axios** - HTTP client dengan interceptors
- **Lucide React** - Icons

### Deployment
- **Shared Hosting Compatible**
- **No Docker** (dapat di-build untuk production)
- **No Redis** (session management tanpa Redis)
- **Managed PostgreSQL** (Neon, ElephantSQL, Supabase, dll)
- **Lightweight** & production-ready

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20 LTS atau lebih baru
- PostgreSQL 15+ (managed DB recommended)
- npm atau yarn
- ActionPay merchant account

### 1. Clone & Install

```bash
cd kita-bisa

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Setup

**Backend (.env)**
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` (sesuaikan dengan kredensial Anda):

```env
# Database
DATABASE_URL="postgresql://user:pass@host:5432/kita_bisa?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-CHANGE-THIS"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="your-refresh-secret-CHANGE-THIS"
JWT_REFRESH_EXPIRES_IN="7d"

# Session
SESSION_IDLE_TIMEOUT=600000  # 10 minutes
SESSION_MAX_AGE=86400000     # 24 hours

# ActionPay
ACTIONPAY_API_URL="https://api.actionpay.id"
ACTIONPAY_MERCHANT_ID="your-merchant-id"
ACTIONPAY_API_KEY="your-api-key"
ACTIONPAY_SECRET_KEY="your-secret-key"
ACTIONPAY_CALLBACK_URL="https://yourdomain.com/api/payments/webhook"

# Email (SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
EMAIL_FROM="LAZISMU Platform <noreply@lazismu.org>"

# OTP
OTP_EXPIRES_IN=300000  # 5 minutes
OTP_ISSUER="LAZISMU Platform"

# Application
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
ADMIN_FRONTEND_URL=http://localhost:3000/admin

# Rate Limiting
THROTTLE_TTL=60000
THROTTLE_LIMIT=10

# File Upload
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE=5242880  # 5MB

# Audit Log
AUDIT_LOG_RETENTION_DAYS=365
```

**Frontend (.env.local)**
```bash
cd frontend
```

Buat file `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### 3. Database Setup (Fresh Migration)

```bash
cd backend

# Generate Prisma Client
npm run prisma:generate

# Run migrations (fresh DB)
npm run prisma:migrate

# Seed demo data
npm run prisma:seed
```

Atau gunakan shortcut:
```bash
npm run db:setup
```

### 4. Start Development Servers

**Terminal 1 - Backend**
```bash
cd backend
npm run start:dev
```
Backend berjalan di `http://localhost:3001`

**Terminal 2 - Frontend**
```bash
cd frontend
npm run dev
```
Frontend berjalan di `http://localhost:3000`

---

## 👥 Demo Accounts

Setelah seeding, login dengan akun berikut:

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| **SUPER_ADMIN** | superadmin@lazismu.org | password | Full access (emergency) |
| **MANAGER** | manager@lazismu.org | password | Approve all (gatekeeper) |
| **CONTENT_MANAGER** | content@lazismu.org | password | Create content (butuh approval) |
| **SUPERVISOR** | supervisor@lazismu.org | password | Read-only all data |
| **PENGUSUL** | pengusul1@example.com | password | Approved pengusul |
| **PENGUSUL** | pengusul2@example.com | password | Approved pengusul |

---

## 📖 Cara Menggunakan

### 1. Donasi Publik (Tanpa Login)
1. Buka `http://localhost:3000`
2. Pilih program donasi
3. Isi nama & nominal (opsional: email)
4. Pilih anonim atau tidak
5. Klik "Lanjutkan Pembayaran"
6. Redirect ke ActionPay payment page
7. Selesaikan pembayaran
8. Progress bar update otomatis setelah sukses

### 2. Registrasi sebagai Pengusul
1. Login sebagai USER
2. Menu **Pengusul** → **Daftar**
3. Upload KTP & dokumen pendukung
4. Isi data diri lengkap
5. Submit → status `pending_verification`
6. Tunggu approval dari MANAGER
7. Notifikasi email setelah approved/rejected

### 3. Buat Program Donasi (Pengusul/Content Manager)
1. Login sebagai PENGUSUL atau CONTENT_MANAGER
2. Menu **Program** → **Buat Program**
3. Isi detail program (judul, deskripsi, target, kategori, gambar)
4. Submit → status `pending_approval`
5. Tunggu approval dari MANAGER
6. Program aktif setelah diapprove

### 4. Approve Program (Manager)
1. Login sebagai MANAGER
2. Menu **Persetujuan** → **Program**
3. Klik program yang pending
4. Review detail
5. Klik **Approve** atau **Reject** (wajib OTP ulang)
6. Isi comment (opsional)
7. Program akan aktif/rejected

### 5. Buat Laporan Penyaluran (Pengusul/Content Manager)
1. Login sebagai PENGUSUL atau CONTENT_MANAGER
2. Menu **Laporan** → **Buat Laporan**
3. Isi judul, konten (markdown support), gambar
4. Link ke program terkait
5. Submit → status `pending_approval`
6. Tunggu approval MANAGER
7. Publish setelah approved

### 6. Lihat Leaderboard (Public)
1. Buka `http://localhost:3000/leaderboard`
2. Lihat top donatur (non-anonim)
3. Lihat title & total donasi
4. Filter by time period (coming soon)

### 7. Lihat Audit Log (Supervisor/Super Admin)
1. Login sebagai SUPERVISOR atau SUPER_ADMIN
2. Menu **Audit Log**
3. Filter by user, action, entity, date range
4. Export to CSV (coming soon)

---

## 🔧 Development Commands

### Backend

```bash
# Development mode (auto-reload)
npm run start:dev

# Production build
npm run build
npm run start:prod

# Prisma commands
npm run prisma:generate    # Generate client
npm run prisma:migrate     # Run migrations
npm run prisma:seed        # Seed demo data
npm run db:setup           # All in one

# Testing
npm run test              # Unit tests
npm run test:e2e          # E2E tests
npm run test:cov          # Coverage
```

### Frontend

```bash
# Development server
npm run dev

# Production build
npm run build
npm run start

# Linting
npm run lint
```

---

## 📁 Project Structure

```
kita-bisa/
├── backend/                      # NestJS API
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema (NEW)
│   │   └── seed.ts              # Seed data (NEW)
│   ├── src/
│   │   ├── audit-log/           # Audit logging (NEW)
│   │   ├── auth/                # Authentication + 2FA/OTP
│   │   ├── users/               # User management
│   │   ├── pengusul/            # Pengusul verification (NEW)
│   │   ├── programs/            # Program CRUD + approval
│   │   ├── articles/            # CMS laporan (NEW)
│   │   ├── approvals/           # Multi-layer approval
│   │   ├── donations/           # Donation tracking
│   │   ├── payments/            # ActionPay integration (NEW)
│   │   ├── gamification/        # Leaderboard & titles (NEW)
│   │   ├── email/               # Email service (NEW)
│   │   ├── session/             # Session management (NEW)
│   │   └── prisma/              # Prisma service
│   └── package.json
│
├── frontend/                     # Next.js 14 App
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx             # Homepage
│   │   │   ├── programs/[slug]/     # Program detail
│   │   │   ├── articles/[slug]/     # Article detail (NEW)
│   │   │   ├── leaderboard/         # Leaderboard (NEW)
│   │   │   ├── login/               # Login page
│   │   │   └── admin/               # Admin dashboard (PROTECTED)
│   │   ├── components/              # Reusable components
│   │   ├── lib/
│   │   │   └── api.ts               # API client
│   │   └── store/
│   │       └── auth.ts              # Zustand store
│   └── package.json
│
└── README.md                     # This file (UPDATED)
```

---

## 🔐 Security Features

1. **JWT Authentication** dengan short expiry (15 min) + refresh token
2. **2FA/OTP** via email dengan 5 menit expiry
3. **Password Hashing** dengan bcrypt (salt rounds: 10)
4. **Role-Based Access Control (RBAC)** di semua endpoints
5. **ActionPay Signature Verification** (HMAC SHA256)
6. **Session Management** dengan auto-logout (idle 10 min)
7. **Re-Authentication** untuk aksi sensitif
8. **Input Validation** dengan class-validator & Zod
9. **SQL Injection Protection** via Prisma ORM
10. **Rate Limiting** (10 req/min)
11. **CORS Configuration** untuk API security
12. **Idempotency** untuk prevent duplicate transactions
13. **Audit Log** immutable untuk semua aktivitas
14. **Admin Area Protection** (tidak bisa diakses publik)

---

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user baru
- `POST /api/auth/login` - Login (dengan OTP untuk admin)
- `POST /api/auth/verify-otp` - Verify OTP
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout

### Pengusul
- `POST /api/pengusul/register` - Daftar sebagai pengusul
- `GET /api/pengusul/pending` - List pending (MANAGER only)
- `POST /api/pengusul/:id/approve` - Approve pengusul (MANAGER only)
- `POST /api/pengusul/:id/reject` - Reject pengusul (MANAGER only)
- `GET /api/pengusul/profile` - Get pengusul profile

### Programs
- `GET /api/programs` - List programs (public)
- `GET /api/programs/:slug` - Detail program
- `POST /api/programs` - Create program (Pengusul/Content Manager)
- `PUT /api/programs/:id` - Update program
- `POST /api/programs/:id/submit` - Submit for approval

### Donations
- `GET /api/donations` - List donations
- `GET /api/donations/stats` - Statistics
- `POST /api/donations` - Create donation (public)

### Payments (ActionPay)
- `POST /api/payments/create` - Create payment
- `POST /api/payments/webhook` - ActionPay webhook
- `GET /api/payments/status/:orderId` - Check status

### Articles (CMS)
- `GET /api/articles` - List articles
- `GET /api/articles/slug/:slug` - Detail article (public)
- `POST /api/articles` - Create article (Pengusul/Content Manager)
- `PUT /api/articles/:id` - Update article
- `POST /api/articles/:id/submit` - Submit for approval
- `POST /api/articles/:id/approve` - Approve (MANAGER only)
- `POST /api/articles/:id/reject` - Reject (MANAGER only)
- `GET /api/articles/:id/history` - Get edit history

### Gamification
- `GET /api/gamification/leaderboard` - Get leaderboard
- `GET /api/gamification/rank?identifier=email` - Get donor rank
- `GET /api/gamification/titles` - Get title info
- `GET /api/gamification/statistics` - Get statistics

### Approvals
- `GET /api/approvals` - List approvals (Admin only)
- `POST /api/approvals/:id/approve` - Approve
- `POST /api/approvals/:id/reject` - Reject

### Audit Logs
- `GET /api/audit-logs` - List logs (SUPERVISOR/SUPER_ADMIN only)
- `GET /api/audit-logs/user-activity?userId=xxx` - User activity

---

## 🎯 Key Differences from Old System

| Feature | OLD | NEW |
|---------|-----|-----|
| **Roles** | DONATUR, ADMIN_LAZISMU, ADMIN_LEMBAGA_ISLAMI, ADMIN_IT, DEVELOPER | USER, PENGUSUL, MANAGER, CONTENT_MANAGER, SUPERVISOR, SUPER_ADMIN |
| **Payment** | Midtrans | **ActionPay** |
| **Wallet** | Internal wallet + ledger | ❌ **REMOVED** (dana langsung ke LAZIS) |
| **Withdrawal** | Manual withdrawal system | ❌ **REMOVED** |
| **Approval** | 2-role approval | **Multi-layer approval** (MANAGER gatekeeper) |
| **CMS** | ❌ None | ✅ **Article system** dengan approval |
| **Gamification** | ❌ None | ✅ **Leaderboard + Donor Titles** |
| **Audit Log** | ❌ None | ✅ **Immutable logging** |
| **2FA/OTP** | ❌ None | ✅ **Email OTP** untuk admin |
| **Session** | Basic JWT | ✅ **Session tracking + auto-logout** |
| **Pengusul** | ❌ None | ✅ **Verification system** (KTP, docs) |
| **Deployment** | Docker + Redis | ✅ **Shared hosting compatible** |

---

## 🆘 Support & Documentation

Untuk bantuan atau pertanyaan:
- **Email**: support@lazismu.org
- **Developer**: superadmin@lazismu.org

---

## 🎉 Next Steps (Production)

1. ✅ Ganti semua secret keys (`JWT_SECRET`, `ACTIONPAY_SECRET_KEY`, dll)
2. ✅ Setup production database (managed PostgreSQL)
3. ✅ Configure ActionPay production credentials
4. ✅ Setup SMTP email service (Gmail, SendGrid, dll)
5. ✅ Deploy backend (Vercel, Railway, VPS, shared hosting)
6. ✅ Deploy frontend (Vercel, Netlify)
7. ✅ Configure webhook URL di ActionPay dashboard
8. ✅ Setup domain & SSL certificate
9. ✅ Test end-to-end di production
10. ✅ Setup backup & monitoring

**Happy Donating! 🤲 Semoga Berkah!**
