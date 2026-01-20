# Script Setup Sederhana untuk Kita Bisa Platform
# Jalankan dengan: .\setup-simple.ps1

Write-Host "========================================"
Write-Host "  SETUP - Kita Bisa Platform"
Write-Host "========================================"
Write-Host ""

# 1. Cek PostgreSQL
Write-Host "[1/6] Cek PostgreSQL Service..." -ForegroundColor Yellow
$pgService = Get-Service -Name postgresql* -ErrorAction SilentlyContinue
if ($pgService -and $pgService.Status -eq 'Running') {
    Write-Host "OK: PostgreSQL berjalan" -ForegroundColor Green
} else {
    Write-Host "ERROR: PostgreSQL tidak berjalan!" -ForegroundColor Red
    Write-Host "Install dari: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# 2. Input Database Info
Write-Host "[2/6] Konfigurasi Database..." -ForegroundColor Yellow
Write-Host ""

$dbUser = Read-Host "Username PostgreSQL (default: postgres)"
if ([string]::IsNullOrWhiteSpace($dbUser)) { $dbUser = "postgres" }

$dbPassword = Read-Host "Password PostgreSQL" -AsSecureString
$dbPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($dbPassword))

$dbName = Read-Host "Nama Database (default: kita_bisa)"
if ([string]::IsNullOrWhiteSpace($dbName)) { $dbName = "kita_bisa" }

Write-Host ""

# 3. Update .env
Write-Host "[3/6] Update file .env..." -ForegroundColor Yellow

$DATABASE_URL = "postgresql://${dbUser}:${dbPasswordPlain}@localhost:5432/${dbName}?schema=public"

if (Test-Path ".env") {
    $envContent = Get-Content ".env"
} elseif (Test-Path ".env.template") {
    $envContent = Get-Content ".env.template"
} else {
    Write-Host "ERROR: File .env atau .env.template tidak ditemukan!" -ForegroundColor Red
    exit 1
}

$newEnvContent = @()
foreach ($line in $envContent) {
    if ($line -match '^DATABASE_URL=') {
        $newEnvContent += "DATABASE_URL=`"$DATABASE_URL`""
    } elseif ($line -match '^JWT_SECRET=' -and $line -match 'CHANGE-THIS') {
        $jwtSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
        $newEnvContent += "JWT_SECRET=`"$jwtSecret`""
    } else {
        $newEnvContent += $line
    }
}

$newEnvContent | Out-File -FilePath ".env" -Encoding UTF8
Write-Host "OK: File .env diupdate" -ForegroundColor Green

Write-Host ""

# 4. Generate Prisma
Write-Host "[4/6] Generate Prisma Client..." -ForegroundColor Yellow
npx prisma generate | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "OK: Prisma Client generated" -ForegroundColor Green
} else {
    Write-Host "ERROR: Gagal generate Prisma Client" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 5. Run Migration
Write-Host "[5/6] Run Migration..." -ForegroundColor Yellow
Write-Host "Ini akan membuat tabel di database..." -ForegroundColor Cyan

npx prisma migrate deploy 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Mencoba migrate dev..." -ForegroundColor Yellow
    npx prisma migrate dev --name init
}

if ($LASTEXITCODE -eq 0) {
    Write-Host "OK: Migration berhasil" -ForegroundColor Green
} else {
    Write-Host "WARNING: Migration gagal" -ForegroundColor Yellow
    Write-Host "Jalankan manual: npx prisma migrate dev --name init" -ForegroundColor Yellow
}

Write-Host ""

# 6. Seed Database
Write-Host "[6/6] Seed Database..." -ForegroundColor Yellow
Write-Host "Membuat user admin dan data sample..." -ForegroundColor Cyan

npx prisma db seed
if ($LASTEXITCODE -eq 0) {
    Write-Host "OK: Database seeded" -ForegroundColor Green
} else {
    Write-Host "WARNING: Seed gagal" -ForegroundColor Yellow
    Write-Host "Jalankan manual: npx prisma db seed" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================"
Write-Host "  SETUP SELESAI!"
Write-Host "========================================"
Write-Host ""
Write-Host "Langkah selanjutnya:" -ForegroundColor Yellow
Write-Host "1. Start backend: npm run start:dev" -ForegroundColor Cyan
Write-Host "2. Start frontend (terminal baru): cd ..\frontend && npm run dev" -ForegroundColor Cyan
Write-Host "3. Buka: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Login: superadmin@lazismu.org / password" -ForegroundColor Green
Write-Host ""
