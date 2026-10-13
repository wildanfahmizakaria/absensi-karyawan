# Sistem Absensi Karyawan — CV Mandala Mahardika

Sistem Absensi Karyawan Berbasis Website (Mobile-First / PWA) untuk CV Mandala Mahardika.  
Mengikuti keputusan **SOT v0.2** dan kontrak kerja agen `AGENTS.md`.

---

## 1. Status Proyek & Ringkasan SOT v0.2
- **Fase Saat Ini:** Fase 6 — PWA, Aksesibilitas, dan Hardening (Selesai). Menunggu persetujuan pemilik proyek untuk Fase 7.
- **Prinsip Utama SOT v0.2:**
  1. **Perekaman Koordinat GPS Mandatori:** Koordinat lokasi (latitude, longitude, akurasi dalam meter) wajib diambil dan dicatat pada setiap transaksi absensi masuk maupun pulang. Tidak ada pembatasan radius kantor (*geofence radius removed*).
  2. **Format Ekspor Laporan:** Format spreadsheet utama adalah **CSV** (dengan UTF-8 BOM, 100% kompatibel Microsoft Excel Windows) serta **PDF** siap cetak resmi ber-kop surat.
  3. **Jadwal Kerja Tetap:** Jam kerja standar pukul **08:00 – 17:00 WIB** dengan toleransi keterlambatan 15 menit (*grace period*).
  4. **Keamanan Alur Absensi:** Menggunakan **swafoto kamera live** dari stream `getUserMedia` offscreen canvas capture; input berkas galeri (`<input type="file">`) dilarang keras pada alur absensi.
  5. **Teknologi Front-End:** HTML5, CSS3, Tailwind CSS v3, React 18, dan Vite 5 (tanpa dependensi berat eksternal).

---

## 2. Struktur Proyek
```
frontend/
├── docs/                      # Single Source of Truth (SOT v0.2)
│   ├── PRD.md
│   ├── UI-GUIDELINE.md
│   ├── API-spec.md
│   ├── USER-FLOW.md
│   └── IMPLEMENTATION_PLAN.md
├── public/                    # Aset Publik & PWA
│   ├── icons/
│   │   ├── icon-192.svg       # Ikon PWA 192x192 Mandala Brand
│   │   └── icon-512.svg       # Ikon PWA 512x512 Mandala Brand
│   ├── manifest.json          # Web App Manifest PWA Standalone
│   ├── sw.js                  # Service Worker Application Shell Caching
│   └── offline.html           # Halaman fallback offline ramah pengguna
├── src/
│   ├── components/
│   │   ├── attendance/        # AttendanceVerificationModal (kamera live, panduan oval wajah, GPS, konfirmasi)
│   │   ├── common/            # Badge, Button, Card, Icons, Modal, MockNoticeBanner, PwaInstallBanner, RouteGuard, Skeleton, Toast
│   │   ├── layout/            # Header, DesktopSidebar, MobileBottomNav, RoleSwitcher, Layout
│   │   └── reports/           # PrintableReportModal (dokumen A4 resmi ber-kop surat & pengesahan tanda tangan)
│   ├── context/               # AuthContext (autentikasi & sesi), NavigationContext (routing client & perizinan)
│   ├── hooks/                 # useCamera, useGeolocation, useNetworkStatus, usePwaInstall
│   ├── services/              # attendanceApi, employeeApi, configApi, auditApi, reportExportService
│   ├── data/                  # mockData.js (akun uji coba, matriks izin peran, data tiruan [MOCK DATA])
│   ├── pages/                 # 8 Halaman: Login, EmployeeDashboard, AdminDashboard, SuperadminDashboard, History, Reports, Settings, EmployeeManagement
│   ├── App.jsx                # Integrasi RouteGuard, PwaInstallBanner, dan Toast
│   ├── index.css              # Token desain, target sentuh 44px, styling @media print A4
│   └── main.jsx               # Registrasi Service Worker PWA
├── index.html                 # PWA meta tags, viewport, theme-color
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
├── package.json
└── AGENTS.md                  # Kontrak kerja agen
```

---

## 3. Akun Uji Coba Simulasi (RBAC)

Untuk menguji autentikasi dan kontrol akses berbasis peran:

| Peran | Email | Kata Sandi | Akses Halaman |
|---|---|---|---|
| **Karyawan** | `karyawan@mandalamahardika.com` | `karyawan123` | Dashboard Karyawan (Absen Masuk/Pulang Live), Riwayat Saya, Profil. *(Dicegah oleh RouteGuard 403 jika mencoba akses dashboard admin/kelola staf)* |
| **Admin** | `admin@mandalamahardika.com` | `admin123` | Dashboard Admin, Kelola Karyawan, Monitoring Absensi, Laporan & Ekspor CSV/PDF, Pengaturan Jadwal |
| **Superadmin** | `superadmin@mandalamahardika.com` | `superadmin123` | Akses Penuh: Dashboard Sistem, Kelola Seluruh Akun Staf, Audit Log Dinamis, Konfigurasi Jam Kerja Tetap & Organisasi |

---

## 4. Instruksi Instalasi & Menjalankan Aplikasi

### Persyaratan Lingkungan
- Node.js: v20.x atau v24.x (teruji pada Node v24.20.0)
- npm: v10.x atau v11.x (teruji pada npm 11.19.0)

### Menjalankan Server Pengembangan (Dev)
```powershell
cd c:\laragon\www\absensi_karyawan\frontend
npm.cmd run dev
```
Aplikasi akan aktif di `http://127.0.0.1:3000/`.

### Menjalankan Build Produksi
```powershell
npm.cmd run build
```
Output build akan terkompilasi bersih tanpa peringatan di direktori `dist/`.

---

## 5. Fitur Unggulan Sistem (Fase 1 s/d Fase 6)

1. **Progressive Web App (PWA) & Offline Fallback (Fase 6):**
   - Mendukung instalasi ke layar utama (*Add to Home Screen*) pada perangkat Android, iOS, maupun desktop.
   - Dilengkapi `public/sw.js` yang menyimpan *application shell* secara aman untuk waktu muat instan.
   - Halaman `public/offline.html` dan `PwaInstallBanner` yang otomatis mendeteksi terputusnya koneksi internet secara santun.
2. **Kamera Live & Rekaman Koordinat GPS (Fase 3):**
   - Akses kamera perangkat via `getUserMedia` dengan filter panduan oval wajah.
   - Pengambilan swafoto murni dari stream kanvas tanpa dialog unggah berkas galeri.
   - Pengambilan koordinat GPS (latitude, longitude, akurasi meter) mandatori saat presensi masuk dan pulang.
3. **Riwayat & Manajemen Operasional (Fase 4):**
   - Manajemen staf lengkap (tambah, edit, aktifkan/nonaktifkan karyawan) yang tersinkronisasi ke audit log.
   - Riwayat kehadiran terpadu dengan modal rincian koordinat GPS dan tautan langsung ke peta Google Maps.
   - Konfigurasi jam kerja tetap (08:00–17:00 WIB, grace 15m) dan data profil instansi CV Mandala Mahardika.
   - Tabel audit log sistem dinamis dengan filter aksi.
4. **Laporan & Ekspor CSV / PDF (Fase 5):**
   - Ekspor berkas spreadsheet **CSV** dengan **UTF-8 BOM** yang dapat langsung dibuka dengan benar di Microsoft Excel Windows.
   - Pratinjau dan pencetakan dokumen **PDF resmi** A4 ber-kop surat CV Mandala Mahardika lengkap dengan lembar tanda tangan pengesahan pimpinan.
5. **Aksesibilitas & Hardening (Fase 6):**
   - Target sentuh minimal 44px (`touch-action: manipulation`).
   - Penanganan tombol ESC pada seluruh jendela modal untuk kemudahan navigasi keyboard.
   - Atribut semantik aksesibilitas (`role="dialog"`, `aria-modal="true"`, `aria-label`).
   - Tidak ada API key atau rahasia yang tersimpan di sisi klien.
