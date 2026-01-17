# 🔧 Cara Setup Database - Windows

## Masalah: `createdb` tidak dikenali

`createdb` adalah command Linux/Mac. Di Windows, kita pakai cara lain.

---

## ✅ Solusi 1: Gunakan Script Otomatis (RECOMMENDED)

Jalankan script yang sudah saya buat:

```powershell
cd backend
.\create-database.ps1
```

Script ini akan:
1. Cek apakah PostgreSQL terinstall
2. Membuat database `kita_bisa`
3. Update file `.env` dengan DATABASE_URL yang benar
4. Siap untuk migration!

---

## ✅ Solusi 2: Manual via pgAdmin (GUI)

1. Buka **pgAdmin** (aplikasi PostgreSQL)
2. Klik kanan pada **Databases** → **Create** → **Database**
3. Nama database: `kita_bisa`
4. Klik **Save**

Lalu edit file `.env`:
```env
DATABASE_URL="postgresql://postgres:password_anda@localhost:5432/kita_bisa?schema=public"
```

---

## ✅ Solusi 3: Manual via Command Line (psql)

```powershell
# Masuk ke PostgreSQL
psql -U postgres

# Di dalam psql, jalankan:
CREATE DATABASE kita_bisa;

# Keluar
\q
```

Lalu edit file `.env`:
```env
DATABASE_URL="postgresql://postgres:password_anda@localhost:5432/kita_bisa?schema=public"
```

---

## ✅ Solusi 4: Jika PostgreSQL Belum Terinstall

### Download & Install PostgreSQL:
1. Download dari: https://www.postgresql.org/download/windows/
2. Install dengan default settings
3. **PENTING:** Ingat password yang Anda set untuk user `postgres`!
4. Setelah install, restart terminal/PowerShell

### Tambahkan PostgreSQL ke PATH:
```powershell
# Tambahkan ke PATH (sesuaikan versi PostgreSQL Anda)
$env:Path += ";C:\Program Files\PostgreSQL\16\bin"
```

Atau tambahkan permanent via System Environment Variables:
1. Search "Environment Variables" di Windows
2. Edit **Path** di System Variables
3. Tambahkan: `C:\Program Files\PostgreSQL\16\bin`
4. Restart terminal

---

## 🔍 Cek Apakah PostgreSQL Sudah Terinstall

```powershell
psql --version
```

Jika muncul versi (misal: `psql (PostgreSQL) 16.1`), berarti sudah terinstall! ✅

---

## 📝 Edit File .env

Setelah database dibuat, pastikan file `.env` berisi:

```env
DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/kita_bisa?schema=public"
```

Ganti:
- `USERNAME` → username PostgreSQL Anda (biasanya `postgres`)
- `PASSWORD` → password PostgreSQL Anda

**Contoh:**
```env
DATABASE_URL="postgresql://postgres:mypassword123@localhost:5432/kita_bisa?schema=public"
```

---

## ✅ Verifikasi Setup

Setelah database dibuat dan `.env` sudah benar:

```powershell
# Test koneksi
npx prisma db pull

# Jika berhasil, lanjut migration
npx prisma migrate dev --name init

# Seed database
npx prisma db seed

# Start backend
npm run start:dev
```

---

## 🆘 Troubleshooting

### Error: "password authentication failed"
→ Password salah di DATABASE_URL

### Error: "database does not exist"
→ Database belum dibuat, gunakan salah satu solusi di atas

### Error: "could not connect to server"
→ PostgreSQL service tidak berjalan
- Buka Services (Win+R → `services.msc`)
- Cari "postgresql-x64-16" (atau versi Anda)
- Klik kanan → Start

### Error: "psql is not recognized"
→ PostgreSQL belum terinstall atau belum di PATH

---

## 🎯 Quick Fix - Copy Paste Ini!

```powershell
# 1. Buat database (ganti PASSWORD_ANDA)
$env:PGPASSWORD="PASSWORD_ANDA"
psql -U postgres -c "CREATE DATABASE kita_bisa;"

# 2. Edit .env (ganti PASSWORD_ANDA)
# DATABASE_URL="postgresql://postgres:PASSWORD_ANDA@localhost:5432/kita_bisa?schema=public"

# 3. Run migration
npx prisma migrate dev --name init

# 4. Seed database
npx prisma db seed

# 5. Start server
npm run start:dev
```

---

**Jika masih error, jalankan script otomatis: `.\create-database.ps1`**
