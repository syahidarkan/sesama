# ⚡ LANGKAH PALING PENTING - EDIT FILE .ENV!

## 🔴 INI PENYEBAB ERROR ANDA!

File `.env` di folder `backend` masih menggunakan **placeholder**!

```
DATABASE_URL="postgresql://username:password@localhost:5432/kita_bisa?schema=public"
                          ^^^^^^^^ ^^^^^^^^
                          MASIH PLACEHOLDER!
```

## ✅ CARA MEMPERBAIKI

### OPSI 1: Edit Manual (Paling Mudah)

1. **Buka file:** `backend\.env` dengan Notepad atau VS Code

2. **Cari baris ini:**
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/kita_bisa?schema=public"
   ```

3. **Ganti dengan:**
   ```
   DATABASE_URL="postgresql://postgres:PASSWORD_ANDA@localhost:5432/kita_bisa?schema=public"
   ```
   
   **PENTING:** Ganti `PASSWORD_ANDA` dengan password PostgreSQL Anda!

4. **Contoh:**
   Jika password PostgreSQL Anda adalah `admin123`, maka:
   ```
   DATABASE_URL="postgresql://postgres:admin123@localhost:5432/kita_bisa?schema=public"
   ```

5. **Simpan file** (Ctrl+S)

---

### OPSI 2: Gunakan Script

```powershell
cd backend
.\setup-simple.ps1
```

Script akan tanya password dan otomatis update file `.env`.

---

## 📋 SETELAH EDIT .ENV

Jalankan perintah ini satu per satu:

```powershell
cd backend

# 1. Generate Prisma Client
npx prisma generate

# 2. Run Migration (buat tabel)
npx prisma migrate dev --name init

# 3. Seed database (isi data awal)
npx prisma db seed

# 4. Start backend
npm run start:dev
```

**Tunggu sampai muncul:**
```
[Nest] Application successfully started on port 3001
```

---

## 🌐 LALU START FRONTEND

Di terminal baru:

```powershell
cd frontend
npm run dev
```

Buka browser: **http://localhost:3000**

---

## 🔑 LOGIN

- Email: `superadmin@lazismu.org`
- Password: `password`

---

## ❓ TIDAK TAHU PASSWORD POSTGRESQL?

### Cara 1: Cek saat install
Password PostgreSQL dibuat saat Anda install PostgreSQL.

### Cara 2: Reset password
```powershell
# Buka pgAdmin
# Klik kanan "postgres" user → Properties → Definition → Password
# Masukkan password baru
```

### Cara 3: Reinstall PostgreSQL
Download dari: https://www.postgresql.org/download/windows/

---

## 📞 MASIH BINGUNG?

**Kirim screenshot file `.env` Anda** (tutup passwordnya!) dan saya bantu!
