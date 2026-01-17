# Kita Bisa - Quick Setup Script
# Run this script to set up the backend

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Kita Bisa - Backend Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
if (-Not (Test-Path ".env")) {
    Write-Host "❌ .env file not found!" -ForegroundColor Red
    Write-Host "📝 Creating .env from template..." -ForegroundColor Yellow
    
    if (Test-Path ".env.template") {
        Copy-Item ".env.template" ".env"
        Write-Host "✅ .env file created!" -ForegroundColor Green
        Write-Host "⚠️  IMPORTANT: Edit .env and update the following:" -ForegroundColor Yellow
        Write-Host "   - DATABASE_URL (PostgreSQL connection)" -ForegroundColor Yellow
        Write-Host "   - JWT_SECRET and JWT_REFRESH_SECRET" -ForegroundColor Yellow
        Write-Host "   - SMTP credentials (for OTP emails)" -ForegroundColor Yellow
        Write-Host "   - ActionPay credentials (for payments)" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Press any key to continue after editing .env..." -ForegroundColor Cyan
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    } else {
        Write-Host "❌ .env.template not found! Please create .env manually." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ .env file found!" -ForegroundColor Green
}

Write-Host ""
Write-Host "Step 1: Generating Prisma Client..." -ForegroundColor Cyan
npx prisma generate

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Prisma generate failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Prisma Client generated!" -ForegroundColor Green

Write-Host ""
Write-Host "Step 2: Running database migrations..." -ForegroundColor Cyan
Write-Host "⚠️  Make sure PostgreSQL is running and DATABASE_URL is correct!" -ForegroundColor Yellow
Write-Host ""

$response = Read-Host "Continue with migration? (y/n)"
if ($response -eq "y" -or $response -eq "Y") {
    npx prisma migrate dev --name init
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Migration failed! Check your DATABASE_URL and PostgreSQL connection." -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Database migrated successfully!" -ForegroundColor Green
    
    Write-Host ""
    $seedResponse = Read-Host "Do you want to seed the database with sample data? (y/n)"
    if ($seedResponse -eq "y" -or $seedResponse -eq "Y") {
        npx prisma db seed
        Write-Host "✅ Database seeded!" -ForegroundColor Green
    }
} else {
    Write-Host "⏭️  Skipping migration. Run 'npx prisma migrate dev' manually when ready." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "To start the backend server:" -ForegroundColor Cyan
Write-Host "  npm run start:dev" -ForegroundColor White
Write-Host ""
Write-Host "To start the frontend:" -ForegroundColor Cyan
Write-Host "  cd ..\frontend" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""
