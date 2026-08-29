# TEMU — Bantu Temukan yang Hilang

Platform web untuk membantu masyarakat mencari dan melaporkan **orang, hewan, kendaraan, dokumen, barang, dan objek lain yang hilang/ditemukan**.

**Tagline:** *Bantu Temukan yang Hilang.*

## Tech Stack
- Next.js 16 App Router + TypeScript
- Tailwind CSS v4 + shadcn/ui
- Auth.js (NextAuth v5) Credentials
- React Hook Form + Zod
- **JVault** sebagai database (https://jvault.aerialstudio.tech)
- **Catbox.moe** via **node-catbox** sebagai image hosting

## Fitur
- Homepage modern, responsive, mobile-first
- Search dengan filter kategori/status/kota/radius/sort
- Detail report dengan galeri, map, tips, similar reports
- Create/Edit report dengan validasi Zod & upload gambar
- Location picker + "Laporan di Sekitar Saya" (haversine)
- Auth: register/login/logout, proteksi server-side
- Dashboard: laporan saya, tersimpan, notifikasi, tips masuk
- Tips: "Saya Punya Informasi" → notifikasi ke pemilik
- Similar reports (algoritma skor kategori/keyword/lokasi/waktu)
- Admin moderasi: hide/delete report, suspend user, audit logs, flags
- Security: Zod, rate-limit, password hashing (bcryptjs), IDOR protection, sanitasi, tidak expose API key

## Struktur BIN JVault
- **Users BIN** `3f60815f-5d45-4bdc-a8e6-a1ebabd65aad` → `{ users: [] }`
- **Data BIN** `a3b993fe-3f68-445b-87b6-3fec8dd4e113` → `{ reports, reportTips, notifications, savedReports, flags, categories, auditLogs }`

Jika `JVAULT_API_KEY` kosong, aplikasi fallback ke in-memory (cocok untuk dev tanpa koneksi JVault).

## Setup

```bash
npm install
cp .env.example .env.local
# isi JVAULT_API_KEY (CATBOX_USERHASH opsional)
npm run dev
```

Buka http://localhost:3000

### Environment (.env.local)
```
JVAULT_BASE_URL=https://jvault.aerialstudio.tech
JVAULT_API_KEY=ISI_API_KEY_JVAULT
JVAULT_DATA_BIN_ID=a3b993fe-3f68-445b-87b6-3fec8dd4e113
JVAULT_USERS_BIN_ID=3f60815f-5d45-4bdc-a8e6-a1ebabd65aad
CATBOX_USERHASH=ISI_CATBOX_USERHASH_OPSIONAL
AUTH_SECRET=generate_dengan_openssl_rand_-base64_32
NEXTAUTH_URL=http://localhost:3000
```

> **Jangan gunakan `NEXT_PUBLIC_` untuk API key.** Semua key hanya di server.

### Akun Admin Demo
- Daftar dengan email `admin@temu.id` lalu login → otomatis dapat akses `/admin`
- Atau register manual, admin bisa suspend user & moderasi laporan

## Image Upload Flow
Browser → Next.js `/api/upload/image` (validasi 5MB, JPG/PNG/WebP, max 10) → `node-catbox` (Catbox.moe) → URL disimpan di JVault. Jika Catbox tidak dapat diakses saat development, akan otomatis fallback ke picsum placeholder agar dev tetap jalan.


## Scripts
- `npm run dev` — development
- `npm run build` — production build
- `npm start` — run production

## Keamanan
- Semua mutasi dicek `auth()` di server
- Rate limiting in-memory per IP/user
- Validasi Zod di client & server
- Password di-hash bcryptjs
- Lokasi orang/hewan tidak presisi (addressApproximate)

## Lisensi
MIT
