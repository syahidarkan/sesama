# 🔑 LUPA PASSWORD POSTGRESQL? BACA INI!

## ❌ MASALAH
Password PostgreSQL **TIDAK BISA DILIHAT** karena sudah di-encrypt untuk keamanan.

## ✅ SOLUSI: Reset Password

### 🚀 CARA TERCEPAT - Gunakan Script Otomatis

**Langkah 1:** Buka PowerShell **sebagai Administrator**
- Klik kanan icon PowerShell
- Pilih "Run as Administrator"

**Langkah 2:** Jalankan script reset password
```powershell
cd C:\Users\User\kita-bisa
.\reset-postgres-password.ps1
```

**Langkah 3:** Masukkan password baru saat diminta
- Contoh: `admin` atau `postgres123`
- Password ini untuk development, jadi bisa sederhana

**Langkah 4:** Script akan otomatis:
- ✅ Backup konfigurasi
- ✅ Ubah authentication method sementara
- ✅ Reset password
- ✅ Kembalikan konfigurasi
- ✅ Restart PostgreSQL service

**Langkah 5:** Update file `backend\.env`
```env
DATABASE_URL="postgresql://postgres:PASSWORD_BARU_ANDA@localhost:5432/kita_bisa?schema=public"
```

Ganti `PASSWORD_BARU_ANDA` dengan password yang baru saja Anda set.

---

### 🖱️ CARA MANUAL - Via pgAdmin (Lebih Mudah)

**Langkah 1:** Buka **pgAdmin** dari Start Menu

**Langkah 2:** Login ke pgAdmin
- Masukkan master password pgAdmin (bukan password PostgreSQL)

**Langkah 3:** Reset password user postgres
1. Expand "Servers" → "PostgreSQL 18"
2. Expand "Login/Group Roles"
3. Klik kanan "postgres" → "Properties"
4. Tab "Definition"
5. Masukkan password baru
6. Klik "Save"

**Langkah 4:** Update file `backend\.env` dengan password baru

---

## 🎯 REKOMENDASI

**Untuk development lokal, gunakan password sederhana:**
- `admin`
- `postgres123`
- `password`

**Contoh di `.env`:**
```env
DATABASE_URL="postgresql://postgres:admin@localhost:5432/kita_bisa?schema=public"
```

---

## 📋 SETELAH RESET PASSWORD

Jalankan setup database:

```powershell
cd backend

# Generate Prisma Client
npx prisma generate

# Run Migration
npx prisma migrate dev --name init

# Seed Database
npx prisma db seed

# Start Backend
npm run start:dev
```

---

## 🆘 TROUBLESHOOTING

### Script error: "cannot be loaded because running scripts is disabled"
```powershell
# Jalankan sebagai Administrator:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Error: "Access denied"
- Pastikan PowerShell dijalankan **sebagai Administrator**
- Klik kanan PowerShell → "Run as Administrator"

### pgAdmin tidak bisa connect
```powershell
# Restart PostgreSQL service
Restart-Service -Name postgresql-x64-18
```

---

## 📞 FILE PANDUAN LAINNYA

- **RESET_PASSWORD_POSTGRESQL.md** - Panduan lengkap reset password
- **EDIT_ENV_DULU.md** - Cara edit file .env
- **BACA_ERROR_FIX.md** - Fix error aplikasi

---

**Pilih salah satu cara di atas, lalu lanjutkan setup database! 🎉**
