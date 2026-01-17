# Script untuk membuat database PostgreSQL di Windows
# Pastikan PostgreSQL sudah terinstall!

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Membuat Database PostgreSQL" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Cek apakah psql tersedia
$psqlPath = Get-Command psql -ErrorAction SilentlyContinue

if (-not $psqlPath) {
    Write-Host "❌ PostgreSQL tidak ditemukan!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Silakan install PostgreSQL terlebih dahulu:" -ForegroundColor Yellow
    Write-Host "https://www.postgresql.org/download/windows/" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Atau jika sudah terinstall, tambahkan ke PATH:" -ForegroundColor Yellow
    Write-Host "C:\Program Files\PostgreSQL\16\bin" -ForegroundColor Cyan
    exit 1
}

Write-Host "✅ PostgreSQL ditemukan!" -ForegroundColor Green
Write-Host ""

# Input kredensial
Write-Host "Masukkan kredensial PostgreSQL:" -ForegroundColor Cyan
$username = Read-Host "Username PostgreSQL (default: postgres)"
if ([string]::IsNullOrWhiteSpace($username)) {
    $username = "postgres"
}

$password = Read-Host "Password PostgreSQL" -AsSecureString
$passwordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))

$dbname = "kita_bisa"

Write-Host ""
Write-Host "Membuat database '$dbname'..." -ForegroundColor Cyan

# Set PGPASSWORD environment variable
$env:PGPASSWORD = $passwordPlain

# Coba buat database
try {
    # Cek apakah database sudah ada
    $checkDb = psql -U $username -h localhost -p 5432 -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$dbname'" 2>&1
    
    if ($checkDb -eq "1") {
        Write-Host "⚠️  Database '$dbname' sudah ada!" -ForegroundColor Yellow
        $recreate = Read-Host "Hapus dan buat ulang? (y/n)"
        
        if ($recreate -eq "y" -or $recreate -eq "Y") {
            Write-Host "Menghapus database lama..." -ForegroundColor Yellow
            psql -U $username -h localhost -p 5432 -d postgres -c "DROP DATABASE IF EXISTS $dbname;" 2>&1 | Out-Null
            
            Write-Host "Membuat database baru..." -ForegroundColor Cyan
            psql -U $username -h localhost -p 5432 -d postgres -c "CREATE DATABASE $dbname;" 2>&1 | Out-Null
            Write-Host "✅ Database berhasil dibuat ulang!" -ForegroundColor Green
        } else {
            Write-Host "✅ Menggunakan database yang sudah ada." -ForegroundColor Green
        }
    } else {
        # Buat database baru
        psql -U $username -h localhost -p 5432 -d postgres -c "CREATE DATABASE $dbname;" 2>&1 | Out-Null
        Write-Host "✅ Database '$dbname' berhasil dibuat!" -ForegroundColor Green
    }
    
    # Update .env file
    Write-Host ""
    Write-Host "Memperbarui file .env..." -ForegroundColor Cyan
    
    $databaseUrl = "postgresql://${username}:${passwordPlain}@localhost:5432/${dbname}?schema=public"
    
    if (Test-Path ".env") {
        $envContent = Get-Content ".env" -Raw
        $envContent = $envContent -replace 'DATABASE_URL=".*"', "DATABASE_URL=`"$databaseUrl`""
        $envContent | Set-Content ".env" -NoNewline
        Write-Host "✅ File .env berhasil diperbarui!" -ForegroundColor Green
    } else {
        Write-Host "❌ File .env tidak ditemukan!" -ForegroundColor Red
        Write-Host "DATABASE_URL yang harus digunakan:" -ForegroundColor Yellow
        Write-Host $databaseUrl -ForegroundColor White
    }
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "✅ Setup Database Selesai!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Langkah selanjutnya:" -ForegroundColor Cyan
    Write-Host "1. npx prisma migrate dev --name init" -ForegroundColor White
    Write-Host "2. npx prisma db seed" -ForegroundColor White
    Write-Host "3. npm run start:dev" -ForegroundColor White
    
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "1. Pastikan PostgreSQL service berjalan" -ForegroundColor White
    Write-Host "2. Cek username dan password benar" -ForegroundColor White
    Write-Host "3. Cek PostgreSQL berjalan di port 5432" -ForegroundColor White
} finally {
    # Clear password dari environment
    $env:PGPASSWORD = $null
}
