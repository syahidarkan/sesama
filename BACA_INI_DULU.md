# ⚡ LANGKAH CEPAT - BACA INI DULU!

## 🔴 MASALAH UTAMA

1. ❌ `createdb` tidak ada di Windows → Gunakan `psql` atau script saya
2. ❌ File `.env` belum di-edit → DATABASE_URL masih placeholder

---

## ✅ SOLUSI TERCEPAT (3 LANGKAH)

### LANGKAH 1: Edit File .env

File `.env` sudah dibuat di `backend/.env`. **BUKA DAN EDIT!**

Cari baris ini:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/kita_bisa?schema=public"
```

Ganti dengan kredensial PostgreSQL Anda:
```env
DATABASE_URL="postgresql://postgres:PASSWORD_ANDA@localhost:5432/kita_bisa?schema=public"
```

**Contoh:**
```env
DATABASE_URL="postgresql://postgres:admin123@localhost:5432/kita_bisa?schema=public"
```

### LANGKAH 2: Buat Database

**OPSI A - Gunakan Script Otomatis (MUDAH!):**
```powershell
cd backend
.\create-database.ps1
```
Script akan tanya username & password, lalu otomatis buat database!

**OPSI B - Manual via psql:**
```powershell
# Set password (ganti PASS_ANDA)
$env:PGPASSWORD="PASS_ANDA"

# Buat database
psql -U postgres -c "CREATE DATABASE kita_bisa;"
```

**OPSI C - Pakai pgAdmin (GUI):**
1. Buka pgAdmin
2. Klik kanan Databases → Create → Database
3. Nama: `kita_bisa`
4. Save

### LANGKAH 3: Run Migration

```powershell
cd backend
npx prisma migrate dev --name init
npx prisma db seed
npm run start:dev
```

---

## 🆘 JIKA POSTGRESQL BELUM TERINSTALL

1. Download: https://www.postgresql.org/download/windows/
2. Install (ingat password untuk user `postgres`!)
3. Restart terminal
4. Ulangi langkah di atas

---

## 🎯 COPY-PASTE INI (Ganti PASSWORD_ANDA!)

```powershell
# 1. Set password PostgreSQL Anda
$env:PGPASSWORD="PASSWORD_ANDA"

# 2. Buat database
psql -U postgres -h localhost -c "CREATE DATABASE kita_bisa;"

# 3. Edit .env di backend/.env
# Ganti baris DATABASE_URL dengan:
# DATABASE_URL="postgresql://postgres:PASSWORD_ANDA@localhost:5432/kita_bisa?schema=public"

# 4. Run migration
cd backend
npx prisma migrate dev --name init

# 5. Seed database
npx prisma db seed

# 6. Start server
npm run start:dev
```

---

## ✅ CEK APAKAH BERHASIL

Jika migration berhasil, Anda akan lihat:
```
✔ Generated Prisma Client
✔ The migration has been created successfully
```

Jika seed berhasil:
```
✅ Database seeded successfully!
```

---

## 📞 MASIH ERROR?

Baca file: `DATABASE_SETUP_WINDOWS.md` untuk troubleshooting lengkap!
