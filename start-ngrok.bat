@echo off
cls
echo ================================================
echo    NGROK - Midtrans Webhook Setup
echo ================================================
echo.
echo Backend Port: 3001
echo.
echo PENTING:
echo 1. Tunggu sampai muncul URL HTTPS
echo 2. Copy URL: https://xxxxx.ngrok-free.app
echo 3. Paste ke Midtrans Dashboard:
echo    https://xxxxx.ngrok-free.app/api/payments/webhook
echo.
echo ================================================
echo.
echo Starting ngrok...
echo.

ngrok http 3001

echo.
echo ================================================
echo Ngrok stopped or error occurred
echo ================================================
pause
