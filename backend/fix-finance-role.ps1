# Script untuk fix Finance role
Write-Host "=== Fixing Finance Role ===" -ForegroundColor Green

# Step 1: Generate Prisma Client
Write-Host "`n1. Generating Prisma Client..." -ForegroundColor Yellow
npx prisma generate

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error generating Prisma client. Please stop backend server first!" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Prisma Client generated successfully" -ForegroundColor Green

# Step 2: Check migration status
Write-Host "`n2. Checking migration status..." -ForegroundColor Yellow
npx prisma migrate status

Write-Host "`n=== Done! ===" -ForegroundColor Green
Write-Host "Please restart your backend server now." -ForegroundColor Cyan
