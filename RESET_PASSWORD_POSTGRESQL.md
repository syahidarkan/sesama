# 🔑 Cara Reset Password PostgreSQL

## ❌ MASALAH
Password PostgreSQL tidak bisa "dilihat" karena sudah di-hash untuk keamanan.

## ✅ SOLUSI: Reset Password

### OPSI 1: Via pgAdmin (GUI - Paling Mudah)

1. **Buka pgAdmin** (cari di Start Menu: "pgAdmin")

2. **Login ke pgAdmin**
   - Masukkan master password pgAdmin (ini password pgAdmin, bukan PostgreSQL)
   - Jika lupa, bisa direset saat buka pgAdmin

3. **Connect ke Server**
   - Klik "Servers" di sidebar kiri
   - Klik "PostgreSQL 18" (atau versi Anda)
   - Jika diminta password, klik "Cancel" dulu

4. **Reset Password User postgres**
   - Klik kanan "Servers" → "Properties"
   - Tab "Connection"
   - Kosongkan field "Password"
   - Centang "Save password"
   - Klik "Save"

5. **Set Password Baru**
   - Expand "Servers" → "PostgreSQL 18"
   - Expand "Login/Group Roles"
   - Klik kanan "postgres" → "Properties"
   - Tab "Definition"
   - Masukkan password baru di field "Password"
   - Klik "Save"

6. **Password baru sudah aktif!**

---

### OPSI 2: Via Command Line (Tanpa Password Lama)

**Langkah 1: Edit File pg_hba.conf**

```powershell
# Cari lokasi file pg_hba.conf
# Biasanya di: C:\Program Files\PostgreSQL\18\data\pg_hba.conf

# Buka dengan Notepad sebagai Administrator
notepad "C:\Program Files\PostgreSQL\18\data\pg_hba.conf"
```

**Langkah 2: Ubah Authentication Method**

Cari baris seperti ini:
```
# IPv4 local connections:
host    all             all             127.0.0.1/32            scram-sha-256
```

Ubah `scram-sha-256` menjadi `trust`:
```
# IPv4 local connections:
host    all             all             127.0.0.1/32            trust
```

**Simpan file!**

**Langkah 3: Restart PostgreSQL Service**

```powershell
# Restart service
Restart-Service -Name postgresql-x64-18

# Atau via Services GUI:
# 1. Tekan Win+R, ketik: services.msc
# 2. Cari "postgresql-x64-18"
# 3. Klik kanan → Restart
```

**Langkah 4: Set Password Baru**

```powershell
# Masuk ke psql (sekarang tanpa password)
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres

# Di psql prompt, ketik:
ALTER USER postgres WITH PASSWORD 'password_baru_anda';

# Keluar
\q
```

**Langkah 5: Kembalikan Authentication Method**

Buka lagi `pg_hba.conf` dan kembalikan `trust` menjadi `scram-sha-256`:
```
host    all             all             127.0.0.1/32            scram-sha-256
```

**Simpan dan restart service lagi!**

---

### OPSI 3: Via SQL Shell (psql) - Jika Ingat Password

```powershell
# Buka SQL Shell (psql) dari Start Menu

# Login sebagai postgres
# Server: localhost
# Database: postgres
# Port: 5432
# Username: postgres
# Password: [masukkan password lama]

# Setelah login, ubah password:
ALTER USER postgres WITH PASSWORD 'password_baru';

# Keluar
\q
```

---

### OPSI 4: Set Password Sederhana untuk Development

Jika ini untuk development lokal, Anda bisa set password sederhana:

```powershell
# Ikuti OPSI 2 di atas, lalu set password:
ALTER USER postgres WITH PASSWORD 'admin';
```

Lalu di file `.env`:
```env
DATABASE_URL="postgresql://postgres:admin@localhost:5432/kita_bisa?schema=public"
```

---

## 🎯 REKOMENDASI UNTUK ANDA

**Cara Tercepat:**

1. **Buka pgAdmin**
2. **Reset password user postgres** via Properties → Definition
3. **Set password baru:** misalnya `admin` atau `postgres123`
4. **Update file `.env`:**
   ```env
   DATABASE_URL="postgresql://postgres:admin@localhost:5432/kita_bisa?schema=public"
   ```

---

## ⚠️ CATATAN PENTING

- Password PostgreSQL **TIDAK BISA DILIHAT**, hanya bisa **DIRESET**
- Untuk development lokal, gunakan password sederhana (contoh: `admin`, `postgres123`)
- Untuk production, gunakan password yang kuat!

---

## 🆘 JIKA MASIH GAGAL

### Error: "pgAdmin tidak bisa connect"
- Pastikan PostgreSQL service berjalan: `Get-Service postgresql*`
- Restart service: `Restart-Service postgresql-x64-18`

### Error: "Access denied saat edit pg_hba.conf"
- Buka Notepad sebagai Administrator
- Klik kanan Notepad → Run as Administrator
- Lalu buka file pg_hba.conf

### Tidak tahu lokasi pg_hba.conf
```powershell
# Cari file
Get-ChildItem -Path "C:\Program Files\PostgreSQL" -Recurse -Filter "pg_hba.conf" -ErrorAction SilentlyContinue
```

---

## ✅ SETELAH RESET PASSWORD

Lanjutkan dengan setup database:

```powershell
cd backend

# Update .env dengan password baru
# Lalu jalankan:

npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
npm run start:dev
```

---

**Semoga berhasil! 🎉**
