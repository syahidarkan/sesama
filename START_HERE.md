# 🚀 Quick Start Guide - Linux Environment

## ⚡ TL;DR - Fast Setup (3 Commands)

```bash
# 1. Setup database (requires sudo password)
./setup-database.sh

# 2. Run migrations and seed
./complete-setup.sh

# 3. Start servers (2 terminals)
# Terminal 1:
cd backend && npm run start:dev

# Terminal 2:
cd frontend && npm run dev
```

---

## 📋 What Has Been Done

I've analyzed your project and prepared everything for development:

### ✅ Completed Automatically:

1. **Environment Files Created:**
   - `backend/.env` - All your credentials configured
   - `frontend/.env.local` - API endpoint configured

2. **Dependencies:**
   - Backend: NestJS + Prisma + all packages ✓
   - Frontend: Next.js 16 + React 19 + all packages ✓
   - Node.js v20.20.0 via NVM ✓

3. **Prisma Setup:**
   - Prisma Client generated ✓
   - Ready for migrations ✓

4. **Helper Scripts:**
   - `setup-database.sh` - Database setup automation
   - `complete-setup.sh` - Migrations + seed automation

### 🔧 Requires Your Action (One-Time):

**PostgreSQL Database Setup** - Needs your sudo password:

```bash
./setup-database.sh
```

This will:
- Set PostgreSQL password to match your .env (`arkan2006`)
- Create `kita_bisa` database
- Grant necessary privileges

---

## 🎯 Step-by-Step Setup

### Step 1: Database Setup (First Time Only)

```bash
./setup-database.sh
```

You'll be prompted for your sudo password. This is a one-time setup.

### Step 2: Complete Setup (Migrations + Seed)

```bash
./complete-setup.sh
```

This will:
- Run all Prisma migrations
- Seed database with demo accounts
- Verify everything is working

### Step 3: Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
source ~/.nvm/nvm.sh  # Only if you get "node: command not found"
npm run start:dev
```
→ Backend runs on `http://localhost:3001`

**Terminal 2 - Frontend:**
```bash
cd frontend
source ~/.nvm/nvm.sh  # Only if you get "node: command not found"
npm run dev
```
→ Frontend runs on `http://localhost:3000`

### Step 4: Test the Application

1. Open browser: `http://localhost:3000`
2. Login with demo account:
   - Email: `syh.arkan@gmail.com`
   - Password: `password`

---

## 📦 Demo Accounts (After Seed)

| Role | Email | Password |
|------|-------|----------|
| Super Admin | syh.arkan@gmail.com | password |
| Manager | manager@lazismu.org | password |
| Content Manager | content@lazismu.org | password |
| Supervisor | supervisor@lazismu.org | password |
| Pengusul | pengusul1@example.com | password |

---

## 🔄 Git & Deployment

### Ready to Commit

Your setup files are ready but won't be committed:
- `.env` files are in `.gitignore` (security)
- Only scripts and docs will be committed

```bash
git status
git add SETUP_INSTRUCTIONS.md START_HERE.md setup-database.sh complete-setup.sh
git commit -m "Add Linux setup automation scripts"
git push origin main
```

### Deployment Status

- ✅ GitHub: Connected
- ✅ Vercel: Frontend deployment
- ✅ Railway/VPS: Backend deployment

---

## 🐛 Common Issues & Solutions

### "node: command not found"

NVM not loaded. Run:
```bash
source ~/.nvm/nvm.sh
# or restart terminal
source ~/.bashrc
```

### "Database connection failed"

1. Check PostgreSQL is running:
   ```bash
   systemctl status postgresql
   ```

2. Re-run database setup:
   ```bash
   ./setup-database.sh
   ```

3. Test connection:
   ```bash
   cd backend
   npx prisma studio
   ```

### Port Already in Use

**Kill process on port 3001 (backend):**
```bash
lsof -ti:3001 | xargs kill -9
```

**Kill process on port 3000 (frontend):**
```bash
lsof -ti:3000 | xargs kill -9
```

---

## 📚 Project Structure

```
kita-bisa/
├── backend/              # NestJS API
│   ├── .env             # ✓ Created (your credentials)
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/   # ✓ Ready to run
│   │   └── seed.ts       # ✓ Ready to run
│   └── src/             # API modules
│
├── frontend/            # Next.js 16 App
│   ├── .env.local       # ✓ Created
│   └── src/             # React components
│
├── setup-database.sh    # ✓ Run this first
├── complete-setup.sh    # ✓ Run this second
├── START_HERE.md        # ← You are here
└── SETUP_INSTRUCTIONS.md # Detailed guide
```

---

## 🎓 Development Commands

### Backend
```bash
cd backend
npm run start:dev    # Development mode (hot reload)
npm run build        # Production build
npm run start:prod   # Production mode
npx prisma studio    # Database GUI
npx prisma generate  # Regenerate Prisma Client
```

### Frontend
```bash
cd frontend
npm run dev          # Development mode
npm run build        # Production build
npm run start        # Production mode
npm run lint         # Lint code
```

---

## 🔐 Security Notes

### Environment Variables

Your `.env` files contain sensitive credentials and are:
- ✅ Excluded from Git (`.gitignore`)
- ⚠️ Never commit these files
- ⚠️ Different credentials for production

### Credentials in Your .env

- **Database:** `postgres:arkan2006@localhost:5432/kita_bisa`
- **Midtrans:** Sandbox keys (safe for development)
- **Email:** Gmail SMTP configured
- **JWT:** Development secrets (change for production)

---

## ✅ Verification Checklist

Before you start coding, verify:

- [ ] `./setup-database.sh` completed successfully
- [ ] `./complete-setup.sh` completed successfully
- [ ] Backend starts without errors: `cd backend && npm run start:dev`
- [ ] Frontend starts without errors: `cd frontend && npm run dev`
- [ ] Can login at `http://localhost:3000`
- [ ] Can access API at `http://localhost:3001/api`

---

## 🆘 Need Help?

1. **Detailed Instructions:** See `SETUP_INSTRUCTIONS.md`
2. **Application Docs:** See `README.md`
3. **Database Issues:** Re-run `./setup-database.sh`
4. **Migration Issues:** Re-run `./complete-setup.sh`

---

**Ready to code! Happy developing! 🚀**
