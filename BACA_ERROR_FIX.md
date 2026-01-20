# 🚨 PERBAIKAN ERROR - BACA INI!

## ❌ MASALAH YANG ANDA ALAMI

1. **AxiosError Network Error** - Frontend tidak bisa connect ke backend
2. **Data program tidak muncul** - API tidak bisa diakses
3. **Login gagal** - Semua password salah

## ✅ PENYEBAB

**Backend tidak berjalan!** Port 3001 tidak ada yang listening.

## 🔧 SOLUSI - IKUTI LANGKAH INI!

### LANGKAH 1: Setup Database (Hanya sekali)

Buka PowerShell di folder `backend`:

```powershell
cd backend
.\setup-simple.ps1
```

Script akan tanya:
- Username PostgreSQL (tekan Enter untuk `postgres`)
- Password PostgreSQL (masukkan password Anda)
- Nama database (tekan Enter untuk `kita_bisa`)

Script akan otomatis:
- ✅ Update file `.env`
- ✅ Generate Prisma Client
- ✅ Buat tabel di database
- ✅ Isi data awal (user admin, dll)

---

### LANGKAH 2: Start Backend

```powershell
# Masih di folder backend
npm run start:dev
```

**Tunggu sampai muncul:**
```
[Nest] Application successfully started on port 3001
```

**JANGAN TUTUP TERMINAL INI!**

---

### LANGKAH 3: Start Frontend (Terminal Baru)

Buka PowerShell baru:

```powershell
cd frontend
npm run dev
```

**Tunggu sampai muncul:**
```
- Local: http://localhost:3000
```

---

### LANGKAH 4: Buka Browser

Buka: **http://localhost:3000**

Data program seharusnya sudah muncul!

---

### LANGKAH 5: Login

Gunakan kredensial ini:

**Super Admin:**
- Email: `superadmin@lazismu.org`
- Password: `password`

**Admin Lazismu:**
- Email: `admin.lazismu@lazismu.org`
- Password: `password`

---

## 🆘 JIKA MASIH ERROR

### Error: "PostgreSQL tidak berjalan"

```powershell
# Cek service
Get-Service -Name postgresql*

# Start service jika stopped
Start-Service -Name postgresql-x64-18
```

### Error: "Port 3001 already in use"

```powershell
# Cari process yang pakai port 3001
netstat -ano | findstr :3001

# Kill process (ganti 1234 dengan PID yang muncul)
taskkill /PID 1234 /F

# Jalankan ulang backend
npm run start:dev
```

### Error: "Database connection failed"

1. Pastikan PostgreSQL berjalan
2. Jalankan ulang `.\setup-simple.ps1`
3. Pastikan password yang dimasukkan benar

### Frontend masih Network Error

1. **Pastikan backend berjalan!** Cek terminal backend
2. Test di browser: buka `http://localhost:3001/api`
3. Jika backend berjalan tapi frontend error, restart frontend (Ctrl+C lalu `npm run dev` lagi)

### Login masih gagal

1. Pastikan database sudah di-seed: `npx prisma db seed`
2. Cek user di database:
   ```powershell
   cd backend
   npx prisma studio
   ```
3. Buka tabel "User" dan pastikan ada user dengan email `superadmin@lazismu.org`

---

## 📋 CHECKLIST

Pastikan semua ini sudah dilakukan:

- [ ] PostgreSQL service berjalan
- [ ] Sudah jalankan `setup-simple.ps1`
- [ ] File `.env` di backend sudah terupdate
- [ ] Backend berjalan di terminal (port 3001)
- [ ] Frontend berjalan di terminal lain (port 3000)
- [ ] Browser bisa buka `http://localhost:3000`
- [ ] Data program muncul di homepage
- [ ] Bisa login dengan `superadmin@lazismu.org` / `password`

---

## 🎯 COPY-PASTE LENGKAP

Jika mau cepat, copy-paste ini (ganti `PASSWORD_ANDA`):

```powershell
# Terminal 1 - Setup dan Backend
cd backend

# Setup (input password saat diminta)
.\setup-simple.ps1

# Start backend
npm run start:dev
```

```powershell
# Terminal 2 - Frontend
cd frontend
npm run dev
```

Lalu buka browser: `http://localhost:3000`

---

## 📞 MASIH BUTUH BANTUAN?

Screenshot error yang muncul dan tanyakan lagi!

**File panduan lainnya:**
- `MULAI_DISINI.md` - Panduan singkat
- `PERBAIKAN_ERROR.md` - Troubleshooting lengkap
- `QUICK_START.md` - Panduan detail
