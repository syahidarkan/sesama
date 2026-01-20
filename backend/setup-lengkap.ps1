# Script untuk Setup Database dan Environment
# Jalankan dengan: .\setup-lengkap.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SETUP LENGKAP - Kita Bisa Platform" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Cek PostgreSQL Service
Write-Host "[1/7] Mengecek PostgreSQL Service..." -ForegroundColor Yellow
$pgService = Get-Service -Name postgresql* -ErrorAction SilentlyContinue
if ($pgService -and $pgService.Status -eq 'Running') {
    Write-Host "✓ PostgreSQL service berjalan: $($pgService.DisplayName)" -ForegroundColor Green
} else {
    Write-Host "✗ PostgreSQL service tidak berjalan atau tidak ditemukan!" -ForegroundColor Red
    Write-Host "  Silakan install PostgreSQL terlebih dahulu dari:" -ForegroundColor Yellow
    Write-Host "  https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# 2. Input Kredensial Database
Write-Host "[2/7] Konfigurasi Database..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Masukkan kredensial PostgreSQL Anda:" -ForegroundColor Cyan

$dbUser = Read-Host "Username PostgreSQL (default: postgres)"
if ([string]::IsNullOrWhiteSpace($dbUser)) {
    $dbUser = "postgres"
}

$dbPassword = Read-Host "Password PostgreSQL" -AsSecureString
$dbPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($dbPassword)
)

$dbName = Read-Host "Nama Database (default: kita_bisa)"
if ([string]::IsNullOrWhiteSpace($dbName)) {
    $dbName = "kita_bisa"
}

$dbHost = Read-Host "Host Database (default: localhost)"
if ([string]::IsNullOrWhiteSpace($dbHost)) {
    $dbHost = "localhost"
}

$dbPort = Read-Host "Port Database (default: 5432)"
if ([string]::IsNullOrWhiteSpace($dbPort)) {
    $dbPort = "5432"
}

Write-Host ""

# 3. Buat DATABASE_URL
$DATABASE_URL = "postgresql://${dbUser}:${dbPasswordPlain}@${dbHost}:${dbPort}/${dbName}?schema=public"

Write-Host "[3/7] Membuat/Update file .env..." -ForegroundColor Yellow

# Baca template atau file .env yang ada
$envContent = @()
if (Test-Path ".env") {
    $envContent = Get-Content ".env"
} elseif (Test-Path ".env.template") {
    $envContent = Get-Content ".env.template"
} else {
    Write-Host "✗ File .env atau .env.template tidak ditemukan!" -ForegroundColor Red
    exit 1
}

# Update DATABASE_URL
$newEnvContent = @()
$databaseUrlUpdated = $false

foreach ($line in $envContent) {
    if ($line -match '^DATABASE_URL=') {
        $newEnvContent += "DATABASE_URL=`"$DATABASE_URL`""
        $databaseUrlUpdated = $true
    } elseif ($line -match '^JWT_SECRET=' -and $line -match 'CHANGE-THIS') {
        # Generate random JWT secret
        $jwtSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
        $newEnvContent += "JWT_SECRET=`"$jwtSecret`""
    } else {
        $newEnvContent += $line
    }
}

# Jika DATABASE_URL tidak ada, tambahkan
if (-not $databaseUrlUpdated) {
    $newEnvContent += "DATABASE_URL=`"$DATABASE_URL`""
}

# Simpan ke .env
$newEnvContent | Out-File -FilePath ".env" -Encoding UTF8
Write-Host "✓ File .env berhasil dibuat/diupdate" -ForegroundColor Green

Write-Host ""

# 4. Test Koneksi Database dengan Prisma
Write-Host "[4/7] Testing koneksi database..." -ForegroundColor Yellow

try {
    $testResult = npx prisma db pull --force 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Koneksi database berhasil!" -ForegroundColor Green
    } else {
        Write-Host "✗ Koneksi database gagal!" -ForegroundColor Red
        Write-Host "Error: $testResult" -ForegroundColor Red
        Write-Host ""
        Write-Host "Silakan cek:" -ForegroundColor Yellow
        Write-Host "1. Apakah PostgreSQL berjalan?" -ForegroundColor Yellow
        Write-Host "2. Apakah username dan password benar?" -ForegroundColor Yellow
        Write-Host "3. Apakah database '$dbName' sudah dibuat?" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "✗ Error saat test koneksi: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 5. Generate Prisma Client
Write-Host "[5/7] Generating Prisma Client..." -ForegroundColor Yellow
npx prisma generate
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Prisma Client berhasil di-generate" -ForegroundColor Green
} else {
    Write-Host "✗ Gagal generate Prisma Client" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 6. Run Migration
Write-Host "[6/7] Running database migrations..." -ForegroundColor Yellow
Write-Host "Ini akan membuat semua tabel yang diperlukan..." -ForegroundColor Cyan

$migrateChoice = Read-Host "Jalankan migration? (Y/n)"
if ($migrateChoice -ne 'n' -and $migrateChoice -ne 'N') {
    npx prisma migrate deploy
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Migration berhasil dijalankan" -ForegroundColor Green
    } else {
        Write-Host "⚠ Migration gagal, mencoba dengan migrate dev..." -ForegroundColor Yellow
        npx prisma migrate dev --name init
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Migration berhasil dijalankan" -ForegroundColor Green
        } else {
            Write-Host "✗ Migration gagal" -ForegroundColor Red
            Write-Host "Silakan jalankan manual: npx prisma migrate dev --name init" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "⊘ Migration dilewati" -ForegroundColor Yellow
}

Write-Host ""

# 7. Seed Database
Write-Host "[7/7] Seeding database dengan data awal..." -ForegroundColor Yellow
Write-Host "Ini akan membuat user admin dan data sample..." -ForegroundColor Cyan

$seedChoice = Read-Host "Jalankan seed? (Y/n)"
if ($seedChoice -ne 'n' -and $seedChoice -ne 'N') {
    npx prisma db seed
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Database berhasil di-seed" -ForegroundColor Green
    } else {
        Write-Host "✗ Seed gagal" -ForegroundColor Red
        Write-Host "Silakan jalankan manual: npx prisma db seed" -ForegroundColor Yellow
    }
} else {
    Write-Host "⊘ Seed dilewati" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SETUP SELESAI!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Langkah selanjutnya:" -ForegroundColor Yellow
Write-Host "1. Jalankan backend:" -ForegroundColor White
Write-Host "   npm run start:dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Di terminal baru, jalankan frontend:" -ForegroundColor White
Write-Host "   cd ..\frontend" -ForegroundColor Cyan
Write-Host "   npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Buka browser: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "Kredensial login default:" -ForegroundColor Yellow
Write-Host "  Email: superadmin@lazismu.org" -ForegroundColor Cyan
Write-Host "  Password: password" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠ WAJIB ganti password di production!" -ForegroundColor Red
Write-Host ""
