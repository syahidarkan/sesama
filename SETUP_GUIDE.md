# Kita Bisa - Setup & Fix Guide

## Issues Fixed

### Backend Issues:
1. ✅ Fixed Prisma schema - Added missing DonationStatus values (SETTLEMENT, DENY, CANCEL)
2. ✅ Fixed Prisma schema - Added missing fields (paymentMethod, metadata) to Donation model
3. ✅ Fixed donations service - Changed `midtransOrderId` to `actionpayOrderId`
4. ✅ Fixed programs service - Changed donation status filter from 'SETTLEMENT' to 'SUCCESS'
5. ✅ Fixed payments controller - Removed non-existent wallet service dependency
6. ✅ Fixed payments controller - Updated to use correct method signatures
7. ✅ Fixed payments service - Convert Decimal to number for leaderboard

### Frontend Issues:
1. ✅ Fixed Next.js routing - Removed duplicate `[id]` route (kept `[slug]` route)

## Setup Instructions

### 1. Backend Setup

#### Step 1: Create .env file
The `.env` file is gitignored. You need to create it manually:

```bash
cd backend
copy .env.example .env
```

Then edit the `.env` file and update these critical values:

```env
# Database - REQUIRED
DATABASE_URL="postgresql://username:password@localhost:5432/kita_bisa?schema=public"

# JWT Secrets - REQUIRED (change these!)
JWT_SECRET="your-super-secret-jwt-key-CHANGE-THIS-IN-PRODUCTION"
JWT_REFRESH_SECRET="your-refresh-secret-CHANGE-THIS-IN-PRODUCTION"

# ActionPay - REQUIRED for payments
ACTIONPAY_API_URL="https://api.actionpay.id"
ACTIONPAY_MERCHANT_ID="your-merchant-id"
ACTIONPAY_API_KEY="your-api-key"
ACTIONPAY_SECRET_KEY="your-secret-key"

# Email - REQUIRED for OTP
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-specific-password"
```

#### Step 2: Generate Prisma Client
```bash
npx prisma generate
```

#### Step 3: Run Database Migrations
```bash
npx prisma migrate dev --name init
```

#### Step 4: Seed the Database (Optional)
```bash
npx prisma db seed
```

#### Step 5: Start the Backend
```bash
npm run start:dev
```

The backend should now run without TypeScript errors on `http://localhost:3001`

### 2. Frontend Setup

The frontend should now work without the routing error.

#### Start the Frontend
```bash
cd frontend
npm run dev
```

The frontend should now run on `http://localhost:3000`

## Common Issues & Solutions

### Issue: "Environment variable not found: DATABASE_URL"
**Solution**: Make sure you created the `.env` file in the `backend` directory with the correct DATABASE_URL.

### Issue: Database connection failed
**Solution**: 
1. Make sure PostgreSQL is running
2. Check your DATABASE_URL credentials
3. Create the database if it doesn't exist:
   ```sql
   CREATE DATABASE kita_bisa;
   ```

### Issue: Prisma migration fails
**Solution**: 
1. Drop the database and recreate it:
   ```sql
   DROP DATABASE kita_bisa;
   CREATE DATABASE kita_bisa;
   ```
2. Run migrations again:
   ```bash
   npx prisma migrate dev --name init
   ```

### Issue: TypeScript errors still appear
**Solution**: 
1. Delete `node_modules` and reinstall:
   ```bash
   cd backend
   Remove-Item -Recurse -Force node_modules
   npm install
   ```
2. Regenerate Prisma client:
   ```bash
   npx prisma generate
   ```

## Next Steps

1. **Configure PostgreSQL Database**: Set up a PostgreSQL database and update the DATABASE_URL in `.env`

2. **Configure Email Service**: Set up SMTP credentials for OTP emails (Gmail App Password recommended)

3. **Configure Payment Gateway**: Get ActionPay credentials and update the `.env` file

4. **Test the Application**:
   - Backend: `http://localhost:3001/api` (check health endpoint)
   - Frontend: `http://localhost:3000`

## Database Schema Changes Summary

The following changes were made to the Prisma schema:

1. **DonationStatus enum**: Added `SETTLEMENT`, `DENY`, `CANCEL` statuses
2. **Donation model**: Added `paymentMethod` and `metadata` fields
3. All references to `midtransOrderId` changed to `actionpayOrderId`

## Code Changes Summary

### Backend:
- `prisma/schema.prisma`: Updated Donation model and DonationStatus enum
- `src/donations/donations.service.ts`: Changed field name to actionpayOrderId
- `src/programs/programs.service.ts`: Changed status filter to SUCCESS
- `src/payments/payments.controller.ts`: Removed wallet service, fixed method calls
- `src/payments/payments.service.ts`: Fixed Decimal to number conversion

### Frontend:
- Removed `src/app/programs/[id]` directory (duplicate route)
- Kept `src/app/programs/[slug]` as the main program detail route

## Running the Full Stack

```bash
# Terminal 1 - Backend
cd backend
npm run start:dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

Visit `http://localhost:3000` to see the application!
