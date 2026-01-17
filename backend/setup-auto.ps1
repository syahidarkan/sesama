# KITA BISA - AUTO SETUP
# Jalankan script ini untuk setup otomatis

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "KITA BISA - AUTO SETUP" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Cek PostgreSQL
Write-Host "Mengecek PostgreSQL..." -ForegroundColor Cyan

# Auto-detect and add PostgreSQL to PATH
$postgresVersions = @("18", "17", "16", "15", "14", "13")
foreach ($ver in $postgresVersions) {
    $binPath = "C:\Program Files\PostgreSQL\$ver\bin"
    if (Test-Path $binPath) {
        Write-Host "Found PostgreSQL $ver at $binPath" -ForegroundColor Gray
        $env:Path += ";$binPath"
    }
}

$psqlExists = Get-Command psql -ErrorAction SilentlyContinue

if (-not $psqlExists) {
    Write-Host "ERROR: PostgreSQL tidak ditemukan!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Tambahkan PostgreSQL ke PATH:" -ForegroundColor Yellow
    Write-Host '  $env:Path += ";C:\Program Files\PostgreSQL\16\bin"' -ForegroundColor White
    Write-Host ""
    Write-Host "Lalu restart PowerShell dan jalankan script ini lagi" -ForegroundColor Yellow
    exit 1
}

Write-Host "OK: PostgreSQL ditemukan!" -ForegroundColor Green
Write-Host ""

# Input password
Write-Host "Masukkan password PostgreSQL (user: postgres):" -ForegroundColor Cyan
$securePass = Read-Host -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePass)
$password = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

$env:PGPASSWORD = $password

# Test koneksi
Write-Host ""
Write-Host "Testing koneksi PostgreSQL..." -ForegroundColor Cyan
$testResult = psql -U postgres -h localhost -d postgres -c "SELECT 1;" 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Koneksi gagal! Cek password atau PostgreSQL service" -ForegroundColor Red
    exit 1
}

Write-Host "OK: Koneksi berhasil!" -ForegroundColor Green

# Buat database
Write-Host ""
Write-Host "Membuat database kita_bisa..." -ForegroundColor Cyan

$checkDb = psql -U postgres -h localhost -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='kita_bisa'" 2>&1

if ($checkDb -eq "1") {
    Write-Host "Database sudah ada, akan di-reset..." -ForegroundColor Yellow
    psql -U postgres -h localhost -d postgres -c "DROP DATABASE IF EXISTS kita_bisa;" 2>&1 | Out-Null
}

psql -U postgres -h localhost -d postgres -c "CREATE DATABASE kita_bisa;" 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "OK: Database berhasil dibuat!" -ForegroundColor Green
} else {
    Write-Host "ERROR: Gagal membuat database!" -ForegroundColor Red
    exit 1
}

# Buat .env
Write-Host ""
Write-Host "Membuat file .env..." -ForegroundColor Cyan

$databaseUrl = "postgresql://postgres:$password@localhost:5432/kita_bisa?schema=public"

if (Test-Path ".env.template") {
    $envContent = Get-Content ".env.template" -Raw
    $envContent = $envContent -replace 'DATABASE_URL=".*"', "DATABASE_URL=`"$databaseUrl`""
    
    # Generate random JWT secrets
    $chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    $jwtSecret = -join (1..32 | ForEach-Object { $chars[(Get-Random -Maximum $chars.Length)] })
    $jwtRefresh = -join (1..32 | ForEach-Object { $chars[(Get-Random -Maximum $chars.Length)] })
    
    $envContent = $envContent -replace 'JWT_SECRET=".*"', "JWT_SECRET=`"$jwtSecret`""
    $envContent = $envContent -replace 'JWT_REFRESH_SECRET=".*"', "JWT_REFRESH_SECRET=`"$jwtRefresh`""
    
    $envContent | Set-Content ".env" -NoNewline
    Write-Host "OK: File .env berhasil dibuat!" -ForegroundColor Green
} else {
    Write-Host "ERROR: .env.template tidak ditemukan!" -ForegroundColor Red
    exit 1
}

# Prisma generate
Write-Host ""
Write-Host "Generate Prisma Client..." -ForegroundColor Cyan
npx prisma generate | Out-Null
Write-Host "OK: Prisma Client generated!" -ForegroundColor Green

# Migration
Write-Host ""
Write-Host "Running database migration..." -ForegroundColor Cyan
npx prisma migrate dev --name init

if ($LASTEXITCODE -eq 0) {
    Write-Host "OK: Migration berhasil!" -ForegroundColor Green
} else {
    Write-Host "ERROR: Migration gagal!" -ForegroundColor Red
    exit 1
}

# Seed
Write-Host ""
Write-Host "Seeding database..." -ForegroundColor Cyan
npx prisma db seed

if ($LASTEXITCODE -eq 0) {
    Write-Host "OK: Database seeded!" -ForegroundColor Green
} else {
    Write-Host "WARNING: Seed gagal, tapi bisa dilanjutkan" -ForegroundColor Yellow
}

# Clear password
$env:PGPASSWORD = $null

# Done
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "SETUP SELESAI!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Cara menjalankan aplikasi:" -ForegroundColor Cyan
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
Write-Host "Default login:" -ForegroundColor Yellow
Write-Host "  Email: superadmin@lazismu.org" -ForegroundColor White
Write-Host "  Password: password" -ForegroundColor White
Write-Host ""
