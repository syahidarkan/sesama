# LANGKAH TERAKHIR - SETUP POSTGRESQL PATH

PostgreSQL sudah terinstall, tapi PowerShell belum bisa akses command `psql`.

## SOLUSI: Tambahkan PostgreSQL ke PATH

### CARA 1: Otomatis (Copy-Paste Ini)

```powershell
# Cari dimana PostgreSQL terinstall
$pgPath = Get-ChildItem "C:\Program Files\PostgreSQL" -Directory | Select-Object -First 1 -ExpandProperty FullName
$pgBin = Join-Path $pgPath "bin"

# Tambahkan ke PATH session ini
$env:Path += ";$pgBin"

# Test
psql --version

# Jika berhasil, jalankan setup
.\setup-auto.ps1
```

### CARA 2: Manual (Permanent)

1. Tekan `Win + R`
2. Ketik: `sysdm.cpl` lalu Enter
3. Tab **Advanced** → klik **Environment Variables**
4. Di **System variables**, pilih **Path** → klik **Edit**
5. Klik **New** → tambahkan: `C:\Program Files\PostgreSQL\16\bin`
   (Sesuaikan angka 16 dengan versi PostgreSQL Anda)
6. Klik **OK** semua
7. **RESTART PowerShell** (penting!)
8. Test: `psql --version`
9. Jalankan: `.\setup-auto.ps1`

### CARA 3: Quick Fix (Untuk Session Ini Saja)

Coba satu-satu sampai ada yang berhasil:

```powershell
# PostgreSQL 16
$env:Path += ";C:\Program Files\PostgreSQL\16\bin"
psql --version

# Atau PostgreSQL 15
$env:Path += ";C:\Program Files\PostgreSQL\15\bin"
psql --version

# Atau PostgreSQL 17
$env:Path += ";C:\Program Files\PostgreSQL\17\bin"
psql --version

# Atau PostgreSQL 14
$env:Path += ";C:\Program Files\PostgreSQL\14\bin"
psql --version
```

Jika salah satu berhasil (muncul versi PostgreSQL), langsung jalankan:
```powershell
.\setup-auto.ps1
```

---

## ATAU: Setup Manual Tanpa Script

Jika PATH tetap tidak bisa, setup manual:

### 1. Buat file .env

```powershell
copy .env.template .env
notepad .env
```

Edit baris `DATABASE_URL`, ganti dengan:
```
DATABASE_URL="postgresql://postgres:PASSWORD_ANDA@localhost:5432/kita_bisa?schema=public"
```

### 2. Buat Database via pgAdmin

1. Buka **pgAdmin** (aplikasi GUI PostgreSQL)
2. Klik kanan **Databases** → **Create** → **Database**
3. Nama: `kita_bisa`
4. Klik **Save**

### 3. Run Migration

```powershell
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
```

### 4. Start Aplikasi

```powershell
# Terminal 1
npm run start:dev

# Terminal 2 (baru)
cd ..\frontend
npm run dev
```

Buka: `http://localhost:3000`

---

## Cek Dimana PostgreSQL Terinstall

```powershell
Get-ChildItem "C:\Program Files\PostgreSQL" -Directory
```

Akan muncul folder versi PostgreSQL Anda (misal: 16, 15, dll)
