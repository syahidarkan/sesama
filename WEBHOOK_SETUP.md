# 🔔 Setup Webhook Midtrans dengan Ngrok

Agar **progress bar donation otomatis update** setelah pembayaran, Midtrans harus bisa kirim webhook ke backend Anda. Karena backend di localhost, kita pakai **Ngrok** untuk expose ke internet.

---

## 📋 Langkah Setup (5 Menit)

### 1. Pastikan Backend Running

Buka terminal dan pastikan backend jalan di port 3001:

```bash
cd backend
npm run start:dev
```

Tunggu sampai muncul:
```
🚀 Backend server is running on: http://localhost:3001/api
```

---

### 2. Jalankan Ngrok

**Double-click file:** `start-ngrok.bat`

Atau manual via terminal:
```bash
ngrok http 3001
```

Anda akan lihat tampilan seperti ini:

```
ngrok

Session Status                online
Account                       your-account (Plan: Free)
Region                        Asia Pacific (ap)
Latency                       -
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123xyz.ngrok-free.app -> http://localhost:3001

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

---

### 3. Copy HTTPS URL

Dari tampilan ngrok di atas, **copy URL HTTPS**:

**Contoh:**
```
https://abc123xyz.ngrok-free.app
```

⚠️ **PENTING**:
- URL ini **berubah setiap kali** ngrok di-restart
- Gunakan URL yang **HTTPS** (bukan HTTP)
- Jangan tutup terminal ngrok selama testing!

---

### 4. Update Midtrans Dashboard

1. **Login** ke Midtrans Sandbox: https://dashboard.sandbox.midtrans.com

2. **Menu Settings** → **Configuration**

3. **Scroll ke bawah** sampai **"Payment Notification URL"**

4. **Masukkan URL webhook:**
   ```
   https://abc123xyz.ngrok-free.app/api/payments/webhook
   ```

   ⚠️ Ganti `abc123xyz.ngrok-free.app` dengan URL ngrok Anda!

5. **Klik Save/Update**

---

## ✅ Test Webhook

### 1. Coba Donate Lagi

1. Buka: http://localhost:3000
2. Pilih program ACTIVE
3. Klik "Donasi Sekarang"
4. Isi nominal: Rp 100.000
5. Isi nama & email
6. Klik "Lanjut ke Pembayaran"

### 2. Bayar dengan Kartu Test

Di halaman Midtrans Snap, pilih **Credit Card**:

```
Card Number: 4811 1111 1111 1114
CVV: 123
Exp Date: 01/25
3D Secure OTP: 112233
```

### 3. Lihat Logs Backend

Di terminal backend, Anda akan lihat:

```bash
📩 Midtrans Notification received: { order_id: '...', transaction_status: 'settlement', ... }
🔄 Updating donation xyz to status: SUCCESS
💰 Program ABC collected amount increased by 100000
🏆 Leaderboard updated for Test Donor: PEMULA
✅ Notification processed successfully: xyz
```

**Kalau muncul log ini = WEBHOOK BERHASIL!** ✅

### 4. Refresh Halaman Program

Setelah back to merchant page:
- **Progress bar** donation akan **otomatis bertambah** ✅
- **Collected amount** akan terupdate ✅
- **Donatur terbaru** akan muncul di sidebar ✅

---

## 🔍 Monitoring & Debugging

### Ngrok Web Interface

Buka browser: **http://127.0.0.1:4040**

Di sini Anda bisa lihat:
- **Requests** yang masuk ke ngrok
- **Request/Response** detail
- **Replay** request untuk testing

### Backend Logs

Terminal backend akan print:
```
📨 Webhook received from Midtrans
✅ Notification processed successfully
```

### Midtrans Dashboard Logs

1. Login ke https://dashboard.sandbox.midtrans.com
2. **Settings** → **HTTP(S) Notification/Webhook**
3. Lihat logs webhook yang terkirim
4. Status: SUCCESS = webhook berhasil
5. Status: FAILED = ada error (cek response body)

---

## ⚠️ Troubleshooting

### Webhook tidak dipanggil / Progress bar tidak update

**Cek:**
1. ✅ Ngrok masih running (jangan close terminal)
2. ✅ Backend masih running di port 3001
3. ✅ URL webhook di Midtrans dashboard benar (HTTPS + `/api/payments/webhook`)
4. ✅ Coba lihat ngrok Web Interface (http://127.0.0.1:4040) - ada request masuk?

**Solusi:**
- Restart ngrok → Copy URL baru → Update Midtrans dashboard lagi
- Cek backend logs untuk error

### Error "Invalid signature"

**Cek:**
- Server Key di `.env` harus match dengan Midtrans dashboard
- Restart backend setelah update `.env`

### Ngrok "Session Expired"

**Ngrok Free** punya limit waktu session. Kalau expired:
1. Restart ngrok (`start-ngrok.bat`)
2. Copy URL baru
3. Update Midtrans dashboard lagi

---

## 🎯 Cara Cepat Test (Tanpa Bayar Betulan)

Kalau mau test webhook **tanpa bayar**:

1. **Donate** seperti biasa → Akan dapat Order ID
2. **Login** ke https://dashboard.sandbox.midtrans.com
3. **Menu Transactions** → Cari transaction berdasarkan Order ID
4. **Actions** → **Change Status** → **settlement**
5. **Midtrans akan kirim webhook** → Backend update collected amount
6. **Refresh** halaman program → Progress bar update! ✅

---

## 📊 Flow Lengkap dengan Webhook

```
User bayar di Midtrans
   ↓
Midtrans process payment
   ↓
Midtrans kirim webhook ke ngrok
   ↓
Ngrok forward ke localhost:3001/api/payments/webhook
   ↓
Backend verify signature
   ↓
Backend update donation status → SUCCESS
Backend update program collected_amount
Backend update leaderboard
   ↓
Midtrans redirect user ke /donation/success
   ↓
User refresh program page
   ↓
✅ Progress bar otomatis bertambah!
```

---

## 🚀 Production Deployment

Ketika deploy ke server production (bukan localhost):

1. **Tidak perlu ngrok** lagi
2. Update Midtrans webhook URL langsung ke:
   ```
   https://yourdomain.com/api/payments/webhook
   ```
3. Pastikan server bisa diakses dari internet
4. Gunakan **Production Server Key** (bukan Sandbox)

---

## 💡 Tips

1. **Jangan close terminal ngrok** selama testing
2. **URL ngrok berubah** setiap restart - harus update Midtrans lagi
3. **Ngrok Free** cukup untuk development/testing
4. **Lihat logs** backend untuk debug webhook
5. **Gunakan ngrok Web Interface** (localhost:4040) untuk inspect requests

---

**Happy Testing! 🎉**

Webhook sudah jalan = Donation progress bar auto-update = Platform production-ready! ✅
