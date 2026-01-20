# 🔧 PERBAIKAN ERROR - Kita Bisa Platform

## 🔴 MASALAH YANG DITEMUKAN

1. **Backend tidak berjalan** - Port 3001 tidak ada yang listening
2. **Database belum siap** - PostgreSQL belum terkonfigurasi atau belum running
3. **Frontend tidak bisa connect ke backend** - Network Error di Axios
4. **Login gagal** - Karena backend tidak berjalan

## ✅ SOLUSI LENGKAP (IKUTI URUTAN INI!)

### LANGKAH 1: Pastikan PostgreSQL Berjalan

```powershell
# Cek apakah PostgreSQL service berjalan
Get-Service -Name postgresql*

# Jika tidak berjalan, start service
Start-Service -Name postgresql-x64-16  # Sesuaikan dengan versi Anda
```

**Atau buka Services (services.msc) dan pastikan PostgreSQL service dalam status "Running"**

---

### LANGKAH 2: Edit File .env Backend

File `.env` ada di `backend\.env`. **WAJIB DIEDIT!**

Buka file tersebut dan pastikan baris berikut sudah benar:

```env
# Database
DATABASE_URL="postgresql://postgres:PASSWORD_ANDA@localhost:5432/kita_bisa?schema=public"

# JWT Secret (ganti dengan random string)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Email (untuk OTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="email@gmail.com"
SMTP_PASSWORD="your-app-password"

# Server
PORT=3001
NODE_ENV=development

# Midtrans (opsional untuk testing)
MIDTRANS_SERVER_KEY="your-midtrans-server-key"
MIDTRANS_CLIENT_KEY="your-midtrans-client-key"
MIDTRANS_IS_PRODUCTION=false
```

**PENTING:** Ganti `PASSWORD_ANDA` dengan password PostgreSQL Anda!

---

### LANGKAH 3: Buat Database

**OPSI A - Gunakan Script Otomatis:**
```powershell
cd backend
.\create-database.ps1
```

**OPSI B - Manual via psql:**
```powershell
# Set password PostgreSQL Anda
$env:PGPASSWORD="PASSWORD_ANDA"

# Buat database
psql -U postgres -h localhost -c "CREATE DATABASE kita_bisa;"

# Cek apakah berhasil
psql -U postgres -h localhost -c "\l" | Select-String "kita_bisa"
```

**OPSI C - Pakai pgAdmin (GUI):**
1. Buka pgAdmin
2. Klik kanan "Databases" → "Create" → "Database"
3. Nama: `kita_bisa`
4. Klik "Save"

---

### LANGKAH 4: Generate Prisma Client & Run Migration

```powershell
cd backend

# Generate Prisma Client
npx prisma generate

# Run migration untuk membuat tabel
npx prisma migrate dev --name init

# Seed database dengan data awal
npx prisma db seed
```

**Jika berhasil, Anda akan melihat:**
```
✔ Generated Prisma Client
✔ The migration has been created successfully
✅ Database seeded successfully!
```

---

### LANGKAH 5: Install Dependencies (Jika Belum)

```powershell
# Backend
cd backend
npm install

# Frontend
cd ..\frontend
npm install
```

---

### LANGKAH 6: Start Backend

```powershell
cd backend
npm run start:dev
```

**Tunggu sampai muncul:**
```
[Nest] Application successfully started on port 3001
```

**JANGAN TUTUP TERMINAL INI!** Biarkan backend tetap berjalan.

---

### LANGKAH 7: Start Frontend (Terminal Baru)

Buka terminal PowerShell baru:

```powershell
cd frontend
npm run dev
```

**Tunggu sampai muncul:**
```
- Local:        http://localhost:3000
```

---

### LANGKAH 8: Test Aplikasi

1. Buka browser: `http://localhost:3000`
2. Data program seharusnya sudah muncul
3. Coba login dengan kredensial default:
   - Email: `superadmin@lazismu.org`
   - Password: `password`

---

## 🆘 TROUBLESHOOTING

### Error: "Database connection failed"
**Solusi:**
1. Pastikan PostgreSQL service berjalan
2. Cek DATABASE_URL di `.env` sudah benar
3. Test koneksi: `psql -U postgres -h localhost -d kita_bisa`

### Error: "Port 3001 already in use"
**Solusi:**
```powershell
# Cari process yang pakai port 3001
netstat -ano | findstr :3001

# Kill process (ganti PID dengan nomor yang muncul)
taskkill /PID <PID> /F
```

### Error: "Environment variable not found: DATABASE_URL"
**Solusi:**
- Pastikan file `.env` ada di folder `backend`
- Restart terminal dan coba lagi

### Error: "Prisma Client not generated"
**Solusi:**
```powershell
cd backend
npx prisma generate
```

### Frontend masih Network Error
**Solusi:**
1. Pastikan backend berjalan di port 3001
2. Cek dengan: `curl http://localhost:3001/api` atau buka di browser
3. Restart frontend: `npm run dev`

### Login masih gagal setelah backend jalan
**Solusi:**
1. Pastikan database sudah di-seed: `npx prisma db seed`
2. Cek user di database:
```powershell
cd backend
npx prisma studio
```
3. Buka tabel "User" dan pastikan ada user dengan email `superadmin@lazismu.org`

---

## 📋 CHECKLIST SEBELUM RUNNING

- [ ] PostgreSQL service berjalan
- [ ] File `.env` di backend sudah diedit dengan benar
- [ ] Database `kita_bisa` sudah dibuat
- [ ] Migration sudah dijalankan (`npx prisma migrate dev`)
- [ ] Database sudah di-seed (`npx prisma db seed`)
- [ ] Dependencies sudah terinstall (`npm install`)
- [ ] Backend berjalan di port 3001
- [ ] Frontend berjalan di port 3000

---

## 🎯 QUICK COPY-PASTE (Ganti PASSWORD_ANDA!)

```powershell
# 1. Set password PostgreSQL
$env:PGPASSWORD="PASSWORD_ANDA"

# 2. Buat database
psql -U postgres -h localhost -c "CREATE DATABASE kita_bisa;"

# 3. Setup backend
cd backend
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed

# 4. Start backend (terminal 1)
npm run start:dev

# 5. Start frontend (terminal 2 - buka terminal baru)
cd ..\frontend
npm run dev
```

---

## 📞 KREDENSIAL DEFAULT (Setelah Seed)

**Super Admin:**
- Email: `superadmin@lazismu.org`
- Password: `password`

**Admin Lazismu:**
- Email: `admin.lazismu@lazismu.org`
- Password: `password`

**Admin IT:**
- Email: `admin.it@lazismu.org`
- Password: `password`

**Pengusul:**
- Email: `pengusul@example.com`
- Password: `password`

**⚠️ WAJIB GANTI PASSWORD DI PRODUCTION!**

---

## ✅ CARA CEK APAKAH SUDAH BENAR

### 1. Cek Backend Berjalan
```powershell
# Cek port 3001
netstat -ano | findstr :3001

# Atau test API
curl http://localhost:3001/api
```

### 2. Cek Database
```powershell
cd backend
npx prisma studio
```
Buka browser di `http://localhost:5555` dan lihat data di tabel.

### 3. Cek Frontend
Buka `http://localhost:3000` - seharusnya data program muncul.

---

**Jika masih ada error, screenshot error-nya dan tanyakan lagi!**
