# CARA TERCEPAT - Start Ngrok Manual

## Langkah 1: Buka PowerShell

1. Tekan `Win + X`
2. Pilih **"Windows PowerShell"** atau **"Terminal"**

## Langkah 2: Masuk ke folder project

```powershell
cd C:\Users\User\kita-bisa
```

## Langkah 3: Jalankan ngrok

```powershell
ngrok http 3001
```

**ATAU** jika error, coba ini:

```powershell
C:\Users\User\AppData\Roaming\npm\ngrok.cmd http 3001
```

---

## ⚠️ Jika Muncul "Sign up for free"

Ngrok butuh akun gratis. Cepat kok:

1. Buka: https://dashboard.ngrok.com/signup
2. Sign up dengan Google/GitHub
3. Copy **Authtoken** dari dashboard
4. Jalankan di PowerShell:
   ```powershell
   ngrok config add-authtoken YOUR_TOKEN_HERE
   ```
5. Ulangi: `ngrok http 3001`

---

## ✅ Setelah Berhasil

Akan muncul:
```
Forwarding    https://abc123.ngrok-free.app -> http://localhost:3001
```

**Copy URL HTTPS-nya**, tambahkan `/api/payments/webhook`:
```
https://abc123.ngrok-free.app/api/payments/webhook
```

Paste ke Midtrans Dashboard → Settings → Configuration → Payment Notification URL

---

## 🎯 ALTERNATIF: Ngrok Web (Tanpa Install)

Jika ngrok CLI ribet, pakai **ngrok web**:

1. Buka: https://dashboard.ngrok.com/get-started/setup
2. Download ngrok untuk Windows
3. Extract file `ngrok.exe` ke `C:\Users\User\kita-bisa\`
4. Buka PowerShell di folder itu
5. Jalankan: `.\ngrok.exe http 3001`
