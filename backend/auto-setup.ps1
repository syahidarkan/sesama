# ========================================
# SETUP OTOMATIS KITA BISA
# ========================================
# Script ini akan setup SEMUA yang dibutuhkan
# Anda hanya perlu input password PostgreSQL sekali!

param(
    [string]$PostgresPassword = ""
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🚀 KITA BISA - AUTO SETUP" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Fungsi untuk cek command
function Test-Command {
    param($Command)
    try {
        Get-Command $Command -ErrorAction Stop | Out-Null
        return $true
    } catch {
        return $false
    }
}

# ========================================
# CEK POSTGRESQL
# ========================================
Write-Host "🔍 Mengecek PostgreSQL..." -ForegroundColor Cyan

if (-not (Test-Command "psql")) {
    Write-Host "❌ PostgreSQL tidak ditemukan!" -ForegroundColor Red
    Write-Host ""
    Write-Host "INSTALL POSTGRESQL DULU:" -ForegroundColor Yellow
    Write-Host "1. Download: https://www.postgresql.org/download/windows/" -ForegroundColor White
    Write-Host "2. Install dengan default settings" -ForegroundColor White
    Write-Host "3. INGAT password untuk user 'postgres'!" -ForegroundColor White
    Write-Host "4. Setelah install, tambahkan ke PATH:" -ForegroundColor White
    Write-Host "   C:\Program Files\PostgreSQL\16\bin" -ForegroundColor Cyan
    Write-Host "5. Restart PowerShell dan jalankan script ini lagi" -ForegroundColor White
    Write-Host ""
    Write-Host "Atau jika sudah terinstall, jalankan ini:" -ForegroundColor Yellow
    Write-Host '$env:Path += ";C:\Program Files\PostgreSQL\16\bin"' -ForegroundColor Cyan
    Write-Host ""
    exit 1
}

Write-Host "✅ PostgreSQL ditemukan!" -ForegroundColor Green

# ========================================
# INPUT PASSWORD
# ========================================
if ([string]::IsNullOrWhiteSpace($PostgresPassword)) {
    Write-Host ""
    Write-Host "Masukkan password PostgreSQL (user: postgres):" -ForegroundColor Cyan
    $securePassword = Read-Host -AsSecureString
    $PostgresPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
    )
}

$env:PGPASSWORD = $PostgresPassword

# ========================================
# TEST KONEKSI
# ========================================
Write-Host ""
Write-Host "🔌 Testing koneksi PostgreSQL..." -ForegroundColor Cyan

try {
    $testResult = psql -U postgres -h localhost -p 5432 -d postgres -c "SELECT 1;" 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Koneksi gagal"
    }
    Write-Host "✅ Koneksi berhasil!" -ForegroundColor Green
} catch {
    Write-Host "❌ Koneksi gagal! Cek password atau PostgreSQL service." -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "1. Pastikan password benar" -ForegroundColor White
    Write-Host "2. Pastikan PostgreSQL service berjalan (services.msc)" -ForegroundColor White
    Write-Host "3. Cek port 5432 tidak dipakai aplikasi lain" -ForegroundColor White
    exit 1
}

# ========================================
# BUAT DATABASE
# ========================================
Write-Host ""
Write-Host "📦 Membuat database 'kita_bisa'..." -ForegroundColor Cyan

$checkDb = psql -U postgres -h localhost -p 5432 -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='kita_bisa'" 2>&1

if ($checkDb -eq "1") {
    Write-Host "⚠️  Database sudah ada, akan di-reset..." -ForegroundColor Yellow
    psql -U postgres -h localhost -p 5432 -d postgres -c "DROP DATABASE IF EXISTS kita_bisa;" 2>&1 | Out-Null
}

psql -U postgres -h localhost -p 5432 -d postgres -c "CREATE DATABASE kita_bisa;" 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database berhasil dibuat!" -ForegroundColor Green
} else {
    Write-Host "❌ Gagal membuat database!" -ForegroundColor Red
    exit 1
}

# ========================================
# UPDATE .ENV
# ========================================
Write-Host ""
Write-Host "📝 Membuat file .env..." -ForegroundColor Cyan

$databaseUrl = "postgresql://postgres:${PostgresPassword}@localhost:5432/kita_bisa?schema=public"

# Baca template
if (Test-Path ".env.template") {
    $envContent = Get-Content ".env.template" -Raw
    
    # Replace DATABASE_URL
    $envContent = $envContent -replace 'DATABASE_URL=".*"', "DATABASE_URL=`"$databaseUrl`""
    
    # Replace JWT secrets dengan random strings
    $jwtSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
    $jwtRefreshSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
    
    $envContent = $envContent -replace 'JWT_SECRET=".*"', "JWT_SECRET=`"$jwtSecret`""
    $envContent = $envContent -replace 'JWT_REFRESH_SECRET=".*"', "JWT_REFRESH_SECRET=`"$jwtRefreshSecret`""
    
    # Simpan ke .env
    $envContent | Set-Content ".env" -NoNewline
    Write-Host "✅ File .env berhasil dibuat!" -ForegroundColor Green
} else {
    Write-Host "❌ .env.template tidak ditemukan!" -ForegroundColor Red
    exit 1
}

# ========================================
# PRISMA GENERATE
# ========================================
Write-Host ""
Write-Host "🔨 Generate Prisma Client..." -ForegroundColor Cyan
npx prisma generate | Out-Null
Write-Host "✅ Prisma Client generated!" -ForegroundColor Green

# ========================================
# MIGRATION
# ========================================
Write-Host ""
Write-Host "🗄️  Running database migration..." -ForegroundColor Cyan
npx prisma migrate dev --name init

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Migration berhasil!" -ForegroundColor Green
} else {
    Write-Host "❌ Migration gagal!" -ForegroundColor Red
    exit 1
}

# ========================================
# SEED
# ========================================
Write-Host ""
Write-Host "🌱 Seeding database..." -ForegroundColor Cyan
npx prisma db seed

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database seeded!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Seed gagal, tapi bisa dilanjutkan" -ForegroundColor Yellow
}

# Clear password
$env:PGPASSWORD = $null

# ========================================
# SELESAI!
# ========================================
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ SETUP SELESAI!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Cara menjalankan aplikasi:" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend:" -ForegroundColor Yellow
Write-Host "  npm run start:dev" -ForegroundColor White
Write-Host ""
Write-Host "Frontend (terminal baru):" -ForegroundColor Yellow
Write-Host "  cd ..\frontend" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Lalu buka: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Default login (Super Admin):" -ForegroundColor Yellow
Write-Host "  Email: superadmin@sobatbantu.org" -ForegroundColor White
Write-Host "  Password: password" -ForegroundColor White
Write-Host ""
