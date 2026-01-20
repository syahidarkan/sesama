# Script untuk Reset Password PostgreSQL
# Jalankan sebagai Administrator!

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Reset Password PostgreSQL" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Cek apakah running as admin
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "ERROR: Script ini harus dijalankan sebagai Administrator!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Cara menjalankan sebagai Administrator:" -ForegroundColor Yellow
    Write-Host "1. Klik kanan PowerShell" -ForegroundColor White
    Write-Host "2. Pilih 'Run as Administrator'" -ForegroundColor White
    Write-Host "3. Jalankan script ini lagi" -ForegroundColor White
    Write-Host ""
    pause
    exit 1
}

# Cari PostgreSQL installation
$pgPath = "C:\Program Files\PostgreSQL\18"
if (-not (Test-Path $pgPath)) {
    Write-Host "ERROR: PostgreSQL 18 tidak ditemukan di $pgPath" -ForegroundColor Red
    exit 1
}

$pgHbaPath = "$pgPath\data\pg_hba.conf"
$psqlPath = "$pgPath\bin\psql.exe"

Write-Host "PostgreSQL ditemukan di: $pgPath" -ForegroundColor Green
Write-Host ""

# Backup pg_hba.conf
Write-Host "[1/5] Backup pg_hba.conf..." -ForegroundColor Yellow
$backupPath = "$pgHbaPath.backup.$(Get-Date -Format 'yyyyMMdd_HHmmss')"
Copy-Item -Path $pgHbaPath -Destination $backupPath
Write-Host "Backup dibuat: $backupPath" -ForegroundColor Green
Write-Host ""

# Edit pg_hba.conf - ubah ke trust
Write-Host "[2/5] Mengubah authentication method ke 'trust'..." -ForegroundColor Yellow
$pgHbaContent = Get-Content $pgHbaPath
$newContent = $pgHbaContent -replace 'scram-sha-256', 'trust' -replace 'md5', 'trust'
$newContent | Set-Content $pgHbaPath
Write-Host "pg_hba.conf diubah" -ForegroundColor Green
Write-Host ""

# Restart PostgreSQL service
Write-Host "[3/5] Restart PostgreSQL service..." -ForegroundColor Yellow
$serviceName = "postgresql-x64-18"
Restart-Service -Name $serviceName -Force
Start-Sleep -Seconds 3
Write-Host "Service restarted" -ForegroundColor Green
Write-Host ""

# Set password baru
Write-Host "[4/5] Set password baru..." -ForegroundColor Yellow
Write-Host ""
$newPassword = Read-Host "Masukkan password baru untuk user 'postgres'"
Write-Host ""

$sqlCommand = "ALTER USER postgres WITH PASSWORD '$newPassword';"
$env:PGPASSWORD = ""
& $psqlPath -U postgres -d postgres -c $sqlCommand

if ($LASTEXITCODE -eq 0) {
    Write-Host "Password berhasil diubah!" -ForegroundColor Green
} else {
    Write-Host "ERROR: Gagal mengubah password" -ForegroundColor Red
    # Restore backup
    Copy-Item -Path $backupPath -Destination $pgHbaPath -Force
    Restart-Service -Name $serviceName -Force
    exit 1
}
Write-Host ""

# Restore pg_hba.conf - kembalikan ke scram-sha-256
Write-Host "[5/5] Mengembalikan authentication method..." -ForegroundColor Yellow
Copy-Item -Path $backupPath -Destination $pgHbaPath -Force
Restart-Service -Name $serviceName -Force
Start-Sleep -Seconds 3
Write-Host "Authentication method dikembalikan" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PASSWORD BERHASIL DIRESET!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Password baru: $newPassword" -ForegroundColor Cyan
Write-Host ""
Write-Host "Langkah selanjutnya:" -ForegroundColor Yellow
Write-Host "1. Edit file backend\.env" -ForegroundColor White
Write-Host "2. Update DATABASE_URL dengan password baru:" -ForegroundColor White
Write-Host "   DATABASE_URL=`"postgresql://postgres:$newPassword@localhost:5432/kita_bisa?schema=public`"" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Jalankan setup:" -ForegroundColor White
Write-Host "   cd backend" -ForegroundColor Cyan
Write-Host "   npx prisma generate" -ForegroundColor Cyan
Write-Host "   npx prisma migrate dev --name init" -ForegroundColor Cyan
Write-Host "   npx prisma db seed" -ForegroundColor Cyan
Write-Host "   npm run start:dev" -ForegroundColor Cyan
Write-Host ""
pause
