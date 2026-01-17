# ================================================
# NGROK - Expose Backend untuk Midtrans Webhook
# ================================================

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   Starting Ngrok for Midtrans Webhook" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend Port: 3001" -ForegroundColor Yellow
Write-Host "Checking ngrok installation..." -ForegroundColor Gray
Write-Host ""

# Check if ngrok is installed
$ngrokPath = Get-Command ngrok -ErrorAction SilentlyContinue

if (-not $ngrokPath) {
    Write-Host "ERROR: Ngrok is not installed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install ngrok first:" -ForegroundColor Yellow
    Write-Host "  npm install -g ngrok" -ForegroundColor White
    Write-Host ""
    Write-Host "Or download from: https://ngrok.com/download" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host "Ngrok found at: $($ngrokPath.Source)" -ForegroundColor Green
Write-Host ""
Write-Host "Starting ngrok tunnel on port 3001..." -ForegroundColor Yellow
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "PENTING: Setelah ngrok jalan, Anda akan lihat:" -ForegroundColor Yellow
Write-Host "  Forwarding  https://xxxxx.ngrok-free.app -> http://localhost:3001" -ForegroundColor White
Write-Host ""
Write-Host "COPY URL HTTPS tersebut dan paste ke Midtrans Dashboard:" -ForegroundColor Yellow
Write-Host "  https://xxxxx.ngrok-free.app/api/payments/webhook" -ForegroundColor Green
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Starting ngrok..." -ForegroundColor Gray
Write-Host ""

# Start ngrok
& ngrok http 3001
