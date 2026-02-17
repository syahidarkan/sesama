#!/bin/bash
set -e

# ============================================
# SobatBantu/SOBATBANTU VPS Auto-Setup Script
# Run as root on fresh Ubuntu 22.04
# ============================================

DOMAIN="sobatbantu.com"
API_DOMAIN="api.sobatbantu.com"
REPO_URL="https://github.com/syahidarkan/sesama.git"
DB_NAME="sobatbantu"
DB_USER="sobatbantu"
DB_PASS="SeSaMa2026SecureDB!"
APP_DIR="/var/www/sobatbantu"

echo ""
echo "=========================================="
echo "  SOBATBANTU VPS Auto-Setup"
echo "=========================================="
echo "  Domain:  $DOMAIN"
echo "  API:     $API_DOMAIN"
echo "  IP:      $(curl -s ifconfig.me 2>/dev/null || echo 'unknown')"
echo "=========================================="
echo ""

# ==========================================
# 1. UPDATE SYSTEM
# ==========================================
echo "[1/10] Updating system..."
apt update && apt upgrade -y
apt install -y curl git build-essential software-properties-common ufw fail2ban unattended-upgrades certbot python3-certbot-nginx

# ==========================================
# 2. INSTALL NODE.JS 22
# ==========================================
echo "[2/10] Installing Node.js 22..."
if ! command -v node &>/dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
    apt install -y nodejs
fi
echo "Node.js: $(node -v)"
echo "npm: $(npm -v)"

# Install PM2 globally
npm install -g pm2

# ==========================================
# 3. INSTALL POSTGRESQL
# ==========================================
echo "[3/10] Installing PostgreSQL..."
if ! command -v psql &>/dev/null; then
    apt install -y postgresql postgresql-contrib
fi
systemctl enable postgresql
systemctl start postgresql

# Create database and user
sudo -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" | grep -q 1 || \
    sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';"
sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" | grep -q 1 || \
    sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
echo "PostgreSQL: ready"

# ==========================================
# 4. INSTALL NGINX
# ==========================================
echo "[4/10] Installing Nginx..."
apt install -y nginx
systemctl enable nginx
systemctl start nginx

# ==========================================
# 5. SETUP FIREWALL
# ==========================================
echo "[5/10] Setting up firewall..."
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
echo "y" | ufw enable
echo "Firewall: active"

# ==========================================
# 6. SETUP FAIL2BAN
# ==========================================
echo "[6/10] Setting up Fail2ban..."
cat > /etc/fail2ban/jail.local <<'JAIL'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
JAIL
systemctl enable fail2ban
systemctl restart fail2ban
echo "Fail2ban: active"

# ==========================================
# 7. SETUP AUTO SECURITY UPDATES
# ==========================================
echo "[7/10] Setting up auto security updates..."
cat > /etc/apt/apt.conf.d/20auto-upgrades <<'AUTO'
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
APT::Periodic::AutocleanInterval "7";
AUTO

# ==========================================
# 8. CLONE & SETUP APPLICATION
# ==========================================
echo "[8/10] Cloning and setting up application..."
mkdir -p /var/www
if [ -d "$APP_DIR" ]; then
    cd "$APP_DIR" && git pull
else
    git clone "$REPO_URL" "$APP_DIR"
fi
cd "$APP_DIR"

# --- BACKEND ---
echo "Setting up backend..."
cd "$APP_DIR/backend"
npm install

# Create .env
cat > .env <<ENVFILE
DATABASE_URL="postgresql://$DB_USER:$DB_PASS@localhost:5432/$DB_NAME?schema=public"

JWT_SECRET="$(openssl rand -hex 32)"
JWT_REFRESH_SECRET="$(openssl rand -hex 32)"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

NODE_ENV="production"
PORT=3001

SMTP_HOST="smtp.gmail.com"
SMTP_PORT=465
SMTP_USER="halo.pandatech@gmail.com"
SMTP_PASSWORD="eypt gwvo upna bfkk"
EMAIL_FROM="SOBATBANTU Platform <halo.pandatech@gmail.com>"

FRONTEND_URL="https://$DOMAIN"
OTP_EXPIRES_IN=300000
ENVFILE

# Run Prisma
npx prisma generate
npx prisma migrate deploy
npx ts-node prisma/seed.ts || echo "Seed may have already been applied"

# Build backend
npm run build

# Start backend with PM2
pm2 delete sobatbantu-backend 2>/dev/null || true
pm2 start dist/main.js --name sobatbantu-backend
echo "Backend: running on port 3001"

# --- FRONTEND ---
echo "Setting up frontend..."
cd "$APP_DIR/frontend"
npm install

# Create .env.local
cat > .env.local <<ENVFILE
NEXT_PUBLIC_API_URL=https://$API_DOMAIN/api
ENVFILE

# Build frontend
npm run build

# Start frontend with PM2
pm2 delete sobatbantu-frontend 2>/dev/null || true
pm2 start npm --name sobatbantu-frontend -- start -- -p 3000
echo "Frontend: running on port 3000"

# PM2 auto-start on reboot
pm2 save
pm2 startup systemd -u root --hp /root | tail -1 | bash

# ==========================================
# 9. SETUP NGINX
# ==========================================
echo "[9/10] Configuring Nginx..."

# Frontend: sobatbantu.com
cat > /etc/nginx/sites-available/sobatbantu <<'NGINX'
server {
    listen 80;
    server_name sobatbantu.com www.sobatbantu.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINX

# Backend API: api.sobatbantu.com
cat > /etc/nginx/sites-available/sobatbantu-api <<'NGINX'
server {
    listen 80;
    server_name api.sobatbantu.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        client_max_body_size 10M;
    }
}
NGINX

# Enable sites
ln -sf /etc/nginx/sites-available/sobatbantu /etc/nginx/sites-enabled/
ln -sf /etc/nginx/sites-available/sobatbantu-api /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

nginx -t && systemctl restart nginx
echo "Nginx: configured"

# ==========================================
# 10. SETUP SSL (Let's Encrypt)
# ==========================================
echo "[10/10] Setting up SSL..."
echo "Attempting SSL certificate..."
certbot --nginx -d $DOMAIN -d www.$DOMAIN -d $API_DOMAIN --non-interactive --agree-tos --email syh.arkan@gmail.com --redirect || \
    echo "SSL setup failed - DNS may not be propagated yet. Run this later: certbot --nginx -d $DOMAIN -d www.$DOMAIN -d $API_DOMAIN"

# ==========================================
# 11. SETUP AUTO-DEPLOY WEBHOOK
# ==========================================
echo "Setting up auto-deploy script..."
cat > /var/www/sobatbantu/deploy.sh <<'DEPLOY'
#!/bin/bash
cd /var/www/sobatbantu
git pull origin main

# Rebuild backend
cd /var/www/sobatbantu/backend
npm install --production
npx prisma generate
npx prisma migrate deploy
npm run build
pm2 restart sobatbantu-backend

# Rebuild frontend
cd /var/www/sobatbantu/frontend
npm install --production
npm run build
pm2 restart sobatbantu-frontend

echo "Deploy complete: $(date)"
DEPLOY
chmod +x /var/www/sobatbantu/deploy.sh

# ==========================================
# DONE!
# ==========================================
PUBLIC_IP=$(curl -s ifconfig.me)

echo ""
echo "=========================================="
echo "  SETUP COMPLETE!"
echo "=========================================="
echo ""
echo "  Frontend:  http://$DOMAIN"
echo "  Backend:   http://$API_DOMAIN/api"
echo "  Static IP: $PUBLIC_IP"
echo ""
echo "  Database:"
echo "    Host: localhost"
echo "    Name: $DB_NAME"
echo "    User: $DB_USER"
echo "    Pass: $DB_PASS"
echo ""
echo "  PM2 Commands:"
echo "    pm2 status          - Check status"
echo "    pm2 logs            - View logs"
echo "    pm2 restart all     - Restart all"
echo ""
echo "  Deploy update:"
echo "    /var/www/sobatbantu/deploy.sh"
echo ""
echo "  SSL (if DNS ready):"
echo "    certbot --nginx -d $DOMAIN -d www.$DOMAIN -d $API_DOMAIN"
echo ""
echo "  Whitelist this IP in Actionpay: $PUBLIC_IP"
echo ""
echo "=========================================="
