# 🚀 Quick Start - Setup Webhook dalam 2 Menit

## Langkah Cepat

### 1. Pastikan Backend Running

Buka terminal dan pastikan backend jalan:
```bash
cd backend
npm run start:dev
```

Tunggu sampai muncul: `🚀 Backend server is running on: http://localhost:3001/api`

---

### 2. Jalankan Ngrok

**Double-click file:** `start-ngrok.bat`

Atau manual via terminal:
```bash
ngrok http 3001
```

Anda akan lihat:
```
Forwarding    https://abc123xyz.ngrok-free.app -> http://localhost:3001
```

**COPY URL HTTPS-nya!** Contoh: `https://abc123xyz.ngrok-free.app`

---

### 3. Update Midtrans Dashboard

1. Login ke: https://dashboard.sandbox.midtrans.com
2. **Settings** → **Configuration**
3. Scroll ke **"Payment Notification URL"**
4. Paste URL ini:
   ```
   https://abc123xyz.ngrok-free.app/api/payments/webhook
   ```
   ⚠️ Ganti `abc123xyz` dengan URL ngrok Anda!
   ⚠️ HARUS ada `/api/payments/webhook` di akhir!

5. **Save/Update**

---

### 4. Test Donation

1. Buka http://localhost:3000
2. Pilih program ACTIVE
3. Donasi Rp 100.000
4. Bayar dengan kartu test:
   ```
   Card: 4811 1111 1111 1114
   CVV: 123
   Exp: 01/25
   OTP: 112233
   ```

### 5. Lihat Hasilnya

Di terminal backend, Anda akan lihat:
```
📩 Midtrans Notification received
🔄 Updating donation xyz to status: SUCCESS
💰 Program ABC collected amount increased by 100000
✅ Notification processed successfully
```

**Refresh halaman program** → Progress bar otomatis bertambah! ✅

---

## ⚠️ Penting

- **Jangan tutup terminal ngrok** selama testing!
- **URL ngrok berubah** setiap restart ngrok - harus update Midtrans lagi
- **Lihat ngrok web interface** di http://127.0.0.1:4040 untuk monitor requests

---

## 🔍 Troubleshooting

**Progress bar tidak update?**
1. Cek ngrok masih running
2. Cek backend masih running
3. Cek URL di Midtrans dashboard benar (HTTPS + `/api/payments/webhook`)
4. Lihat logs backend untuk error

**Ngrok "Session Expired"?**
1. Restart ngrok
2. Copy URL baru
3. Update Midtrans dashboard lagi

---

**Dokumentasi lengkap**: Lihat file `WEBHOOK_SETUP.md`
