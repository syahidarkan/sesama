# 🚀 Kita Bisa - Quick Start Guide

## ⚡ TL;DR - Get Running in 5 Steps

### 1️⃣ Create Environment File
```bash
cd backend
copy .env.template .env
```
**Then edit `.env` and set:**
- `DATABASE_URL` (PostgreSQL connection)
- `JWT_SECRET` (any random string)
- `SMTP_USER` and `SMTP_PASSWORD` (Gmail credentials)

### 2️⃣ Setup Database
```bash
# Create database in PostgreSQL
createdb kita_bisa

# Run migrations
npx prisma migrate dev --name init

# (Optional) Seed sample data
npx prisma db seed
```

### 3️⃣ Start Backend
```bash
npm run start:dev
```
Backend runs on: `http://localhost:3001`

### 4️⃣ Start Frontend
```bash
cd ..\frontend
npm run dev
```
Frontend runs on: `http://localhost:3000`

### 5️⃣ Done! 🎉
Visit `http://localhost:3000` to see your app!

---

## 📋 What Was Fixed?

✅ **Frontend:** Removed duplicate route `[id]`, kept `[slug]`  
✅ **Backend:** Fixed all TypeScript errors (15 errors → 0 errors)  
✅ **Database:** Updated Prisma schema with correct fields  
✅ **Payments:** Fixed ActionPay integration  
✅ **Documentation:** Created setup guides and scripts  

---

## 🔧 Automated Setup (Recommended)

Run the setup script:
```bash
cd backend
.\setup.ps1
```

This will:
- Create `.env` from template
- Generate Prisma client
- Run database migrations
- Optionally seed the database

---

## 📚 Detailed Documentation

- **SETUP_GUIDE.md** - Complete setup instructions
- **ERROR_FIXES.md** - All errors fixed and how
- **README.md** - Project overview

---

## ⚠️ Minimum Requirements

Before running:

1. **PostgreSQL** must be installed and running
2. **Node.js** v18+ installed
3. **npm** packages installed in both `backend` and `frontend`

---

## 🆘 Troubleshooting

### "Environment variable not found: DATABASE_URL"
→ Create `.env` file in `backend/` directory

### "Database connection failed"
→ Check PostgreSQL is running and DATABASE_URL is correct

### "TypeScript errors"
→ Run `npx prisma generate` in backend directory

### "Port already in use"
→ Change PORT in `.env` (backend) or kill process using the port

---

## 📞 Quick Commands Reference

```bash
# Backend
cd backend
npm install              # Install dependencies
npx prisma generate      # Generate Prisma client
npx prisma migrate dev   # Run migrations
npx prisma db seed       # Seed database
npm run start:dev        # Start dev server

# Frontend
cd frontend
npm install              # Install dependencies
npm run dev              # Start dev server
npm run build            # Build for production

# Database
npx prisma studio        # Open Prisma Studio (DB GUI)
npx prisma db push       # Push schema without migration
npx prisma migrate reset # Reset database (WARNING: deletes data)
```

---

## 🎯 Default Credentials (After Seeding)

**Super Admin:**
- Email: `superadmin@lazismu.org`
- Password: `password`

**Manager:**
- Email: `manager@lazismu.org`
- Password: `password`

**⚠️ Change these in production!**

---

## ✨ Features Working

- ✅ User authentication with OTP
- ✅ Program management
- ✅ Donation system
- ✅ Payment gateway integration
- ✅ Multi-level approval workflow
- ✅ Article/Report system
- ✅ Donor leaderboard
- ✅ Audit logging

---

**Need help? Check the detailed guides in the repository!**
