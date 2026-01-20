# 🚀 CARA TERCEPAT - START DISINI!

## ⚡ 2 Langkah Saja!

### LANGKAH 1: Setup Database (Sekali saja)

```powershell
cd backend
.\setup-lengkap.ps1
```

Script ini akan:
- ✅ Cek PostgreSQL service
- ✅ Tanya username & password database
- ✅ Buat file `.env` otomatis
- ✅ Test koneksi database
- ✅ Generate Prisma Client
- ✅ Run migration (buat tabel)
- ✅ Seed data awal (user admin, dll)

**PENTING:** Siapkan password PostgreSQL Anda!

---

### LANGKAH 2: Jalankan Aplikasi

**OPSI A - Jalankan Backend & Frontend Bersamaan:**
```powershell
.\start-all.ps1
```

**OPSI B - Jalankan Manual (2 Terminal):**

Terminal 1 - Backend:
```powershell
cd backend
npm run start:dev
```

Terminal 2 - Frontend:
```powershell
cd frontend
npm run dev
```

---

## 🌐 Akses Aplikasi

Buka browser: **http://localhost:3000**

---

## 🔑 Login Default

**Super Admin:**
- Email: `superadmin@lazismu.org`
- Password: `password`

**Admin Lazismu:**
- Email: `admin.lazismu@lazismu.org`
- Password: `password`

**Admin IT:**
- Email: `admin.it@lazismu.org`
- Password: `password`

---

## 🆘 Jika Ada Error

### "PostgreSQL tidak berjalan"
```powershell
# Start service
Start-Service -Name postgresql-x64-18
```

### "Port 3001 sudah dipakai"
```powershell
# Cari dan kill process
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### "Database connection failed"
1. Pastikan PostgreSQL berjalan
2. Jalankan ulang `.\setup-lengkap.ps1`
3. Pastikan password yang dimasukkan benar

### "Frontend Network Error"
1. Pastikan backend berjalan (cek terminal backend)
2. Test: buka `http://localhost:3001/api` di browser
3. Restart frontend

---

## 📋 Checklist

- [ ] PostgreSQL terinstall dan berjalan
- [ ] Sudah jalankan `setup-lengkap.ps1`
- [ ] Backend berjalan di port 3001
- [ ] Frontend berjalan di port 3000
- [ ] Bisa login dengan kredensial default

---

## 📞 File Panduan Lainnya

- **PERBAIKAN_ERROR.md** - Troubleshooting lengkap
- **QUICK_START.md** - Panduan detail
- **README.md** - Dokumentasi lengkap

---

**Selamat mencoba! 🎉**
