# Setup Instructions for Linux Environment

## Current Status

✅ **Completed:**
- Repository cloned successfully
- Backend dependencies installed (Node.js v20.20.0 via NVM)
- Frontend dependencies installed
- Backend `.env` file created with your credentials
- Frontend `.env.local` file created
- Prisma Client generated

❌ **Needs Attention:**
- PostgreSQL database setup (password and database creation)
- Run database migrations
- Seed database with initial data

---

## Issue: PostgreSQL Authentication

The PostgreSQL user `postgres` either:
1. Doesn't have a password set, OR
2. Has a different password than `arkan2006` (specified in your .env)

---

## Solution: Complete Database Setup

### Option 1: Run the Setup Script (Easiest)

```bash
cd /home/acan/kita-bisa
./setup-database.sh
```

This script will:
- Set the PostgreSQL password for user `postgres` to `arkan2006`
- Create the `kita_bisa` database
- Grant necessary privileges

**Note:** You'll need to enter your sudo password when prompted.

---

### Option 2: Manual Setup

If you prefer to do it manually:

#### Step 1: Set PostgreSQL Password

```bash
sudo -u postgres psql
```

Then in the PostgreSQL prompt:
```sql
ALTER USER postgres WITH PASSWORD 'arkan2006';
\q
```

#### Step 2: Create Database

```bash
sudo -u postgres psql -c "CREATE DATABASE kita_bisa;"
```

#### Step 3: Verify Connection

```bash
PGPASSWORD='arkan2006' psql -h localhost -U postgres -d postgres -c "\l"
```

You should see `kita_bisa` in the list of databases.

---

## After Database Setup

Once PostgreSQL is configured, run these commands:

### 1. Run Database Migrations

```bash
cd /home/acan/kita-bisa/backend
source ~/.nvm/nvm.sh
npx prisma migrate deploy
```

### 2. Seed Database with Initial Data

```bash
npx prisma db seed
```

This will create demo accounts:
- Super Admin: `syh.arkan@gmail.com` / `password`
- Manager: `manager@lazismu.org` / `password`
- Content Manager: `content@lazismu.org` / `password`
- Supervisor: `supervisor@lazismu.org` / `password`
- Pengusul: `pengusul1@example.com` / `password`

---

## Test the Application

### Terminal 1 - Start Backend:
```bash
cd /home/acan/kita-bisa/backend
source ~/.nvm/nvm.sh
npm run start:dev
```

Backend will run on: `http://localhost:3001`

### Terminal 2 - Start Frontend:
```bash
cd /home/acan/kita-bisa/frontend
source ~/.nvm/nvm.sh
npm run dev
```

Frontend will run on: `http://localhost:3000`

---

## Git Integration

After setup is complete, you can commit and push:

```bash
cd /home/acan/kita-bisa
git status
git add .
git commit -m "Setup Linux development environment"
git push origin main
```

**Note:** The `.env` files are in `.gitignore` so they won't be committed (security best practice).

---

## NVM Quick Reference

Since Node.js is installed via NVM, you need to source it in each new terminal:

```bash
source ~/.nvm/nvm.sh
```

To make this permanent, it's already configured in your `~/.bashrc`. Just restart your terminal or run:

```bash
source ~/.bashrc
```

---

## Troubleshooting

### "node: command not found"

Run: `source ~/.nvm/nvm.sh` before using node/npm commands.

### Port already in use

**Backend (3001):**
```bash
lsof -ti:3001 | xargs kill -9
```

**Frontend (3000):**
```bash
lsof -ti:3000 | xargs kill -9
```

### Database connection errors

1. Verify PostgreSQL is running:
   ```bash
   systemctl status postgresql
   ```

2. Test connection:
   ```bash
   PGPASSWORD='arkan2006' psql -h localhost -U postgres -d kita_bisa -c "SELECT 1;"
   ```

---

## Environment Files Created

### Backend: `/home/acan/kita-bisa/backend/.env`
- Database connection: `postgresql://postgres:arkan2006@localhost:5432/kita_bisa`
- Midtrans credentials (sandbox)
- SMTP email configuration
- JWT secrets
- All system settings

### Frontend: `/home/acan/kita-bisa/frontend/.env.local`
- API URL: `http://localhost:3001/api`

---

## Next Steps After Setup

1. ✅ Run `./setup-database.sh`
2. ✅ Run migrations: `npx prisma migrate deploy`
3. ✅ Seed database: `npx prisma db seed`
4. ✅ Start backend: `npm run start:dev`
5. ✅ Start frontend: `npm run dev`
6. ✅ Test login with demo accounts
7. ✅ Ready to edit and push to GitHub!

---

## Need Help?

Check the main [README.md](./README.md) for detailed application documentation.
