# SobatBantu Platform - Platform Donasi

Platform donasi internal yang aman dan transparan dengan sistem multi-role approval, integrasi payment gateway Midtrans, gamification, dan CMS laporan penyaluran.

---

## Fitur Utama

### Multi-Role System (7 Roles)

| Role | Akses |
|------|-------|
| **USER** | Donatur publik, melihat program & laporan |
| **PENGUSUL** | Membuat program donasi (butuh approval MANAGER) |
| **MANAGER** | Approve/reject registrasi, program, laporan |
| **CONTENT_MANAGER** | Membuat konten (butuh approval MANAGER) |
| **SUPERVISOR** | Read-only semua data, monitoring |
| **FINANCE** | Akses data keuangan |
| **SUPER_ADMIN** | Full access |

### Payment Gateway - Midtrans
- Direct payment via Midtrans Snap
- Webhook untuk update status otomatis
- Support: Credit Card, GoPay, Bank Transfer, QRIS, E-Wallet

### Keamanan
- JWT Authentication dengan refresh token
- 2FA/OTP via email untuk admin
- Auto logout setelah idle 10 menit
- Rate limiting (10 req/min)
- Audit log untuk semua aktivitas

### Gamification
- Donor leaderboard
- Donor titles: PEMULA, DERMAWAN, JURAGAN, SULTAN, LEGEND

---

## Tech Stack

**Backend:** NestJS, PostgreSQL, Prisma ORM, JWT + Passport
**Frontend:** Next.js 16, TypeScript, Tailwind CSS, Zustand
**Payment:** Midtrans Snap

---

## Quick Start

### Prerequisites
- Node.js 20 LTS+
- PostgreSQL 15+
- npm

### 1. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Setup Database (Windows)

**Opsi A - Via pgAdmin (Recommended):**
1. Buka pgAdmin
2. Klik kanan Databases > Create > Database
3. Nama: `kita_bisa`
4. Save

**Opsi B - Via psql:**
```powershell
$env:PGPASSWORD="PASSWORD_ANDA"
psql -U postgres -c "CREATE DATABASE kita_bisa;"
```

### 3. Setup Environment Variables

**Backend** - Edit `backend/.env`:
```env
# Database
DATABASE_URL="postgresql://postgres:PASSWORD_ANDA@localhost:5432/kita_bisa?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-CHANGE-THIS"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="your-refresh-secret-CHANGE-THIS"
JWT_REFRESH_EXPIRES_IN="7d"

# Session
SESSION_IDLE_TIMEOUT=600000
SESSION_MAX_AGE=86400000

# Midtrans
MIDTRANS_SERVER_KEY="Mid-server-xxx"
MIDTRANS_CLIENT_KEY="Mid-client-xxx"
MIDTRANS_IS_PRODUCTION=false
MIDTRANS_MERCHANT_ID="Gxxx"

# Email (SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
EMAIL_FROM="Platform <noreply@example.com>"

# Application
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

**Frontend** - Buat `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### 4. Run Database Migration

```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
```

### 5. Start Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run start:dev
```
Backend berjalan di `http://localhost:3001`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend berjalan di `http://localhost:3000`

---

## Demo Accounts

Setelah seeding, login dengan akun berikut:

| Role | Email | Password |
|------|-------|----------|
| SUPER_ADMIN | superadmin@sobatbantu.org | password |
| MANAGER | manager@sobatbantu.org | password |
| CONTENT_MANAGER | content@sobatbantu.org | password |
| SUPERVISOR | supervisor@sobatbantu.org | password |
| PENGUSUL | pengusul1@example.com | password |

---

## Midtrans Setup

### 1. Daftar Akun Sandbox
1. Buka: https://dashboard.sandbox.midtrans.com/register
2. Daftar & verify email
3. Login ke dashboard

### 2. Dapatkan API Keys
1. Settings > Access Keys
2. Copy Server Key & Client Key
3. Update di `backend/.env`

### 3. Webhook Configuration
Untuk testing lokal, gunakan ngrok:

```bash
ngrok http 3001
```

Copy HTTPS URL (contoh: `https://abc123.ngrok-free.app`)

Di Midtrans Dashboard:
1. Settings > Configuration
2. Payment Notification URL: `https://abc123.ngrok-free.app/api/payments/webhook`
3. Save

### 4. Test Payment

**Kartu Kredit (Success):**
```
Card: 4811 1111 1111 1114
CVV: 123
Exp: 01/25
OTP: 112233
```

**GoPay:**
```
HP: 081234567890
OTP: 123456
```

---

## Troubleshooting

### Backend tidak berjalan

1. Cek PostgreSQL service berjalan:
```powershell
Get-Service -Name postgresql*
Start-Service -Name postgresql-x64-18
```

2. Cek file `.env` sudah benar
3. Jalankan ulang migration

### Port 3001 already in use

```powershell
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### Frontend Network Error

1. Pastikan backend berjalan di port 3001
2. Test: buka `http://localhost:3001/api` di browser
3. Restart frontend

### Database connection failed

1. Pastikan PostgreSQL berjalan
2. Cek DATABASE_URL di `.env`
3. Test koneksi: `psql -U postgres -h localhost -d kita_bisa`

### Login gagal

1. Pastikan database sudah di-seed: `npx prisma db seed`
2. Cek user di database: `npx prisma studio`

### PostgreSQL PATH tidak dikenali

Tambahkan ke PATH:
```powershell
$env:Path += ";C:\Program Files\PostgreSQL\18\bin"
```

Atau permanent via System Environment Variables.

### Reset Password PostgreSQL

Via pgAdmin:
1. Buka pgAdmin
2. Login/Group Roles > postgres > Properties
3. Tab Definition > masukkan password baru
4. Save

---

## Development Commands

### Backend
```bash
npm run start:dev      # Development mode
npm run build          # Production build
npm run start:prod     # Production mode
npx prisma generate    # Generate Prisma client
npx prisma migrate dev # Run migrations
npx prisma db seed     # Seed database
npx prisma studio      # Database GUI
```

### Frontend
```bash
npm run dev      # Development server
npm run build    # Production build
npm run start    # Production server
npm run lint     # Linting
```

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login (dengan OTP untuk admin)
- `POST /api/auth/verify-otp` - Verify OTP
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout

### Programs
- `GET /api/programs` - List programs (public)
- `GET /api/programs/:slug` - Detail program
- `POST /api/programs` - Create program
- `PUT /api/programs/:id` - Update program

### Donations
- `GET /api/donations` - List donations
- `POST /api/donations` - Create donation

### Payments
- `POST /api/payments/create` - Create payment
- `POST /api/payments/webhook` - Midtrans webhook
- `GET /api/payments/status/:orderId` - Check status

### Articles
- `GET /api/articles` - List articles
- `GET /api/articles/slug/:slug` - Detail article
- `POST /api/articles` - Create article
- `PUT /api/articles/:id` - Update article

### Gamification
- `GET /api/gamification/leaderboard` - Get leaderboard
- `GET /api/gamification/rank` - Get donor rank

### Comments
- `GET /api/comments?programId=xxx` - List comments
- `POST /api/comments` - Create comment (auth required)
- `PATCH /api/comments/:id/hide` - Hide comment (admin)
- `PATCH /api/comments/:id/unhide` - Unhide comment (admin)
- `DELETE /api/comments/:id` - Delete comment (admin)

---

## Project Structure

```
kita-bisa/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── src/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── programs/
│   │   ├── donations/
│   │   ├── payments/
│   │   ├── articles/
│   │   ├── comments/
│   │   ├── gamification/
│   │   ├── audit-log/
│   │   └── email/
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   └── store/
│   └── .env.local
│
└── README.md
```

---

## Deployment

### Backend (Railway/VPS)
1. Set environment variables
2. `npm run build`
3. `npm run start:prod`

### Frontend (Vercel)
1. Connect Git repository
2. Set `NEXT_PUBLIC_API_URL` environment variable
3. Deploy

### Production Checklist
- [ ] Ganti semua secret keys
- [ ] Setup production database
- [ ] Configure Midtrans production credentials
- [ ] Setup SMTP email service
- [ ] Configure webhook URL di Midtrans dashboard
- [ ] Setup domain & SSL certificate

---

## Support

Jika ada masalah, cek:
1. PostgreSQL service berjalan
2. File `.env` sudah benar
3. Database sudah di-seed
4. Backend & frontend berjalan

**Happy Coding!**
