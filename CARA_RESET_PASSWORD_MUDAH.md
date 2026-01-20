# 🎯 CARA PALING MUDAH - RESET PASSWORD POSTGRESQL

## Anda punya 2 pilihan:

---

### PILIHAN 1: Gunakan pgAdmin (PALING MUDAH) ⭐

#### Langkah-langkah:

1. **Buka Start Menu**, ketik: `pgAdmin`
   
2. **Klik pgAdmin 4** untuk membuka

3. **Login pgAdmin:**
   - Masukkan master password pgAdmin
   - (Ini password yang Anda buat saat install pgAdmin, BUKAN password PostgreSQL)

4. **Di sidebar kiri, expand:**
   ```
   Servers
   └── PostgreSQL 18
       └── Login/Group Roles
   ```

5. **Klik kanan "postgres"** → Pilih **"Properties"**

6. **Klik tab "Definition"**

7. **Masukkan password baru:**
   - Ketik password baru (contoh: `admin`)
   - Ketik lagi untuk konfirmasi

8. **Klik "Save"**

9. **SELESAI!** Password sudah berubah.

---

### PILIHAN 2: Coba Password Default

Mungkin password PostgreSQL Anda masih default. Coba password ini:

1. **Buka file:** `backend\.env`

2. **Edit baris DATABASE_URL, coba satu per satu:**

   **Coba 1:**
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/kita_bisa?schema=public"
   ```

   **Coba 2:**
   ```env
   DATABASE_URL="postgresql://postgres:admin@localhost:5432/kita_bisa?schema=public"
   ```

   **Coba 3:**
   ```env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/kita_bisa?schema=public"
   ```

   **Coba 4:**
   ```env
   DATABASE_URL="postgresql://postgres:root@localhost:5432/kita_bisa?schema=public"
   ```

3. **Test setiap password:**
   ```powershell
   cd backend
   npx prisma db pull --force
   ```

4. **Jika berhasil**, Anda akan lihat:
   ```
   ✔ Introspected 15 models
   ```

5. **Jika gagal**, coba password berikutnya.

---

## 🆘 Jika Semua Gagal

### Opsi Terakhir: Reinstall PostgreSQL

1. **Uninstall PostgreSQL** dari Control Panel
2. **Download PostgreSQL baru:** https://www.postgresql.org/download/windows/
3. **Install dan SET PASSWORD BARU** (ingat password ini!)
4. **Update `backend\.env`** dengan password baru

---

## ✅ SETELAH PASSWORD BENAR

Jalankan setup:

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

## 📞 BUTUH BANTUAN?

**Saya sarankan pakai PILIHAN 1 (pgAdmin)** karena paling mudah dan pasti berhasil!

Jika ada error, screenshot dan tanyakan lagi.
