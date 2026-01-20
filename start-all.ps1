# Script untuk menjalankan Backend dan Frontend secara bersamaan
# Jalankan dengan: .\start-all.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Starting Kita Bisa Platform" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Cek apakah .env sudah dikonfigurasi
if (Test-Path "backend\.env") {
    $envContent = Get-Content "backend\.env" -Raw
    if ($envContent -match 'postgresql://username:password@') {
        Write-Host "⚠ WARNING: File .env belum dikonfigurasi!" -ForegroundColor Red
        Write-Host "Silakan jalankan setup terlebih dahulu:" -ForegroundColor Yellow
        Write-Host "  cd backend" -ForegroundColor Cyan
        Write-Host "  .\setup-lengkap.ps1" -ForegroundColor Cyan
        Write-Host ""
        $continue = Read-Host "Lanjutkan tetap? (y/N)"
        if ($continue -ne 'y' -and $continue -ne 'Y') {
            exit 0
        }
    }
} else {
    Write-Host "✗ File backend\.env tidak ditemukan!" -ForegroundColor Red
    Write-Host "Silakan jalankan setup terlebih dahulu:" -ForegroundColor Yellow
    Write-Host "  cd backend" -ForegroundColor Cyan
    Write-Host "  .\setup-lengkap.ps1" -ForegroundColor Cyan
    exit 1
}

Write-Host "Starting Backend dan Frontend..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Backend akan berjalan di: http://localhost:3001" -ForegroundColor Cyan
Write-Host "Frontend akan berjalan di: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Tekan Ctrl+C untuk menghentikan semua server" -ForegroundColor Yellow
Write-Host ""

# Start backend di background job
Write-Host "[1/2] Starting Backend..." -ForegroundColor Yellow
$backendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD\backend
    npm run start:dev
}

# Tunggu sebentar untuk backend startup
Start-Sleep -Seconds 5

# Start frontend di background job
Write-Host "[2/2] Starting Frontend..." -ForegroundColor Yellow
$frontendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD\frontend
    npm run dev
}

Write-Host ""
Write-Host "✓ Backend dan Frontend sedang starting..." -ForegroundColor Green
Write-Host ""
Write-Host "Monitoring logs (Ctrl+C untuk stop):" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Gray

try {
    while ($true) {
        # Show backend output
        $backendOutput = Receive-Job -Job $backendJob -ErrorAction SilentlyContinue
        if ($backendOutput) {
            Write-Host "[BACKEND] $backendOutput" -ForegroundColor Blue
        }
        
        # Show frontend output
        $frontendOutput = Receive-Job -Job $frontendJob -ErrorAction SilentlyContinue
        if ($frontendOutput) {
            Write-Host "[FRONTEND] $frontendOutput" -ForegroundColor Magenta
        }
        
        # Check if jobs are still running
        if ($backendJob.State -ne 'Running' -and $frontendJob.State -ne 'Running') {
            Write-Host ""
            Write-Host "✗ Semua server telah berhenti" -ForegroundColor Red
            break
        }
        
        Start-Sleep -Milliseconds 500
    }
} finally {
    # Cleanup jobs on exit
    Write-Host ""
    Write-Host "Menghentikan server..." -ForegroundColor Yellow
    Stop-Job -Job $backendJob -ErrorAction SilentlyContinue
    Stop-Job -Job $frontendJob -ErrorAction SilentlyContinue
    Remove-Job -Job $backendJob -ErrorAction SilentlyContinue
    Remove-Job -Job $frontendJob -ErrorAction SilentlyContinue
    Write-Host "✓ Server dihentikan" -ForegroundColor Green
}
