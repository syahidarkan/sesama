# ✅ PLATFORM SIAP DITEST!

## 🎉 Status Sistem

### Backend (Port 3001)
- ✅ **Running** di `http://localhost:3001/api`
- ✅ **Midtrans Sandbox** terintegrasi
- ✅ **Server Key**: `<MIDTRANS_SERVER_KEY>`
- ✅ **Client Key**: `<MIDTRANS_CLIENT_KEY>`
- ✅ Database PostgreSQL connected

### Frontend (Port 3000)
- ✅ **Running** di `http://localhost:3000`
- ✅ Connected ke Backend API

---

## 🚀 Cara Test Payment Gateway

### 1. Login ke Platform
1. Buka: **http://localhost:3000**
2. Login dengan akun USER biasa (bukan admin)
3. Atau register akun baru

### 2. Buat Program Donasi (PENGUSUL/ADMIN)
1. Login sebagai **PENGUSUL** atau **ADMIN**
2. Dashboard → **Ajukan Program Baru**
3. Isi form lengkap 7 langkah
4. Submit untuk approval
5. Login sebagai **MANAGER** → Approve program

### 3. Test Donasi dengan Midtrans

1. **Buka halaman program yang sudah ACTIVE**
2. **Klik "Donasi Sekarang"**
3. **Pilih nominal** (misal: Rp 100.000)
4. **Isi data donatur**
5. **Klik "Lanjut ke Pembayaran"**
6. **Redirect ke Midtrans Snap**
7. **Pilih metode pembayaran:**

---

## 💳 Metode Pembayaran Test (Sandbox)

### A. Kartu Kredit/Debit

**Kartu Sukses:**
```
Card Number: 4811 1111 1111 1114
CVV: 123
Exp Date: 01/25
3D Secure OTP: 112233
```

**Kartu Gagal:**
```
Card Number: 4911 1111 1111 1113
CVV: 123
Exp Date: 01/25
```

### B. GoPay

```
Nomor HP: 081234567890
OTP: 123456
```

Status langsung SUCCESS di sandbox!

### C. Bank Transfer (Virtual Account)

**BCA Virtual Account:**
- VA Number akan di-generate otomatis
- Status langsung PAID di sandbox

**Mandiri Virtual Account:**
- Bill Key + Biller Code otomatis
- Status langsung PAID

**BNI Virtual Account:**
- VA Number otomatis
- Status langsung PAID

### D. QRIS

QR Code akan muncul
→ Langsung simulasi SUCCESS di sandbox

### E. E-Wallet Lainnya

**ShopeePay:**
- Redirect ke Shopee
- Langsung simulasi SUCCESS

**Indomaret/Alfamart:**
- Payment code otomatis
- Langsung simulasi PAID

---

## 🔄 Flow Pembayaran

```
1. User klik "Donasi Sekarang" di halaman program
   ↓
2. Frontend POST ke /api/payments/create
   ↓
3. Backend create donation record (status: PENDING)
   ↓
4. Backend create Midtrans Snap transaction
   ↓
5. Backend return payment URL + Snap Token
   ↓
6. Frontend redirect user ke Midtrans payment page
   ↓
7. User pilih metode & bayar (gunakan data test di atas)
   ↓
8. Midtrans process payment
   ↓
9. Midtrans kirim webhook ke backend (/api/payments/webhook)
   ↓
10. Backend update donation status → SUCCESS
    Backend update program collected_amount
    Backend update leaderboard gamification
    ↓
11. Midtrans redirect user ke success page
    ↓
12. ✅ DONASI BERHASIL!
```

---

## 🧪 Simulasi Manual dari Dashboard Midtrans

Jika ingin test tanpa bayar betulan:

1. **Login ke Midtrans Dashboard**
   - URL: https://dashboard.sandbox.midtrans.com
   - Email & password yang Anda gunakan saat daftar

2. **Menu Transactions**
   - Lihat list semua transaksi
   - Cari berdasarkan Order ID

3. **Change Status Manual**
   - Klik transaction → **Actions** → **Change Status**
   - Pilih **settlement** (sukses)
   - Backend akan terima webhook dan update database

---

## 📊 Monitoring & Debugging

### Backend Logs

Backend akan print logs detail:
```bash
✅ Midtrans Snap transaction created: { orderId, token, url }
📩 Midtrans Notification received: { order_id, status, ... }
🔄 Updating donation xyz to status: SUCCESS
💰 Program ABC collected amount increased by 50000
🏆 Leaderboard updated for John Doe: DERMAWAN
✅ Notification processed successfully
```

Buka terminal backend untuk lihat logs real-time.

### Database Check

```sql
-- Cek donation records
SELECT * FROM "Donation" ORDER BY "createdAt" DESC LIMIT 10;

-- Cek program collected amount
SELECT id, title, "targetAmount", "collectedAmount" FROM "Program";

-- Cek leaderboard
SELECT * FROM "DonorLeaderboard" ORDER BY "totalDonations" DESC;
```

### Midtrans Dashboard

- **Transactions**: Lihat semua transaksi
- **Settings → HTTP(S) Notification**: Lihat webhook logs
- **Simulasi**: Change status manual

---

## 🎯 Test Checklist

- [ ] Login/Register user baru
- [ ] Buat program donasi sebagai PENGUSUL
- [ ] Approve program sebagai MANAGER
- [ ] Donasi dengan Kartu Kredit test
- [ ] Donasi dengan GoPay test
- [ ] Donasi dengan Bank Transfer
- [ ] Cek donation status di database
- [ ] Cek program collected amount bertambah
- [ ] Cek leaderboard gamification
- [ ] Test donasi anonim (Hamba Allah)
- [ ] Test donasi dengan nama
- [ ] Lihat donatur terbaru di sidebar program
- [ ] Test webhook dari Midtrans dashboard

---

## ⚠️ Troubleshooting

### Payment stuck di PENDING

**Solusi:**
1. Cek backend logs untuk error
2. Manual change status di Midtrans dashboard
3. Cek webhook URL accessible

### Error "Midtrans credentials not configured"

**Solusi:**
1. Pastikan `.env` sudah update dengan credentials yang benar
2. Restart backend: `Ctrl+C` lalu `npm run start:dev`

### Webhook tidak dipanggil

**Untuk testing lokal:**
1. Install ngrok: `npm install -g ngrok`
2. Run: `ngrok http 3001`
3. Copy HTTPS URL (misal: `https://abc123.ngrok.io`)
4. Update Midtrans Dashboard → Settings → Notification URL:
   ```
   https://abc123.ngrok.io/api/payments/webhook
   ```

---

## 📚 Referensi

- **Platform**: http://localhost:3000
- **Backend API**: http://localhost:3001/api
- **Midtrans Dashboard**: https://dashboard.sandbox.midtrans.com
- **Midtrans Docs**: https://docs.midtrans.com
- **Setup Guide**: [MIDTRANS_SETUP.md](MIDTRANS_SETUP.md)

---

## 🎊 Selamat Mencoba!

Semua sudah siap! Silakan test payment flow dari awal sampai akhir.

**Tips:**
- Gunakan kartu test untuk simulasi pembayaran sukses
- Monitor backend logs untuk debug
- Cek Midtrans dashboard untuk tracking transaksi
- Test berbagai metode pembayaran

**Happy Testing! 🚀**
