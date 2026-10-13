# UI Guideline — Absensi CV Mandala Mahardika
**Status:** Revisi SOT v0.2 — direvisi berdasarkan arahan pemilik proyek (menunggu konfirmasi)

## 1. Arah visual
Modern futuristic SaaS yang profesional, bersih, dan tepercaya. Identitas utama biru-putih; gunakan aksen secukupnya, hindari efek neon berlebihan dan dekorasi yang mengganggu tugas absensi.

## 2. Token desain awal
- Primary: `#2563EB` (biru aksi)
- Primary dark: `#1D4ED8`
- Background: `#F5F8FF`
- Surface: `#FFFFFF`
- Text utama: `#0F172A`
- Text sekunder: `#64748B`
- Border: `#E2E8F0`
- Success: `#16A34A`
- Warning: `#D97706`
- Danger: `#DC2626`
- Radius kartu: 16 px; kontrol: 12 px.
- Spacing berbasis kelipatan 4/8 px; bayangan ringan dan konsisten.

## 3. Responsif dan navigasi
- Mobile: header ringkas, konten satu kolom, bottom navigation untuk Beranda, Riwayat, Profil; tombol aksi absensi terlihat tanpa scroll panjang.
- Tablet: layout dua kolom jika membantu, navigasi dapat berubah menjadi sidebar ringkas.
- Desktop admin: sidebar tetap, header dengan pencarian/akun, area konten dengan tabel dan filter.
- Pada layar kecil, tabel berubah menjadi daftar kartu atau dapat digulir horizontal dengan label yang tetap jelas.

## 4. Halaman utama
1. Login: logo/wordmark, email atau username, kata sandi, tampilkan/sembunyikan kata sandi, pesan validasi.
2. Dashboard karyawan: salam dan tanggal, kartu status hari ini, tombol besar **Absen Masuk**/**Absen Pulang**, ringkasan jam kerja tetap, status lokasi/kamera, riwayat terbaru.
3. Modal/halaman verifikasi absensi: instruksi izin kamera/lokasi, preview kamera live, tombol ambil foto, preview hasil, status GPS dan akurasi yang siap direkam (tanpa batasan radius geofence), konfirmasi kirim.
4. Riwayat: filter tanggal/status, daftar transaksi, detail foto/lokasi koordinat/waktu dan status kehadiran.
5. Dashboard admin: KPI kehadiran, terlambat, belum absen, tren sederhana, aktivitas terbaru.
6. Manajemen karyawan: pencarian, filter status/peran, tambah/edit/nonaktifkan, detail karyawan.
7. Laporan: rentang tanggal, departemen/status, pratinjau tabel, tombol ekspor format PDF dan CSV.
8. Pengaturan superadmin: profil perusahaan/kantor, konfigurasi jadwal kerja tetap (jam kerja & toleransi), pengguna/peran, audit log.

## 5. Pola interaksi
- Gunakan satu CTA primer per area dan bedakan aksi masuk/pulang berdasarkan status transaksi.
- Tampilkan tahap alur: `Izin → Kamera Live → Rekam Lokasi GPS → Konfirmasi → Terkirim`.
- Jangan menyatakan absensi berhasil sebelum server mengonfirmasi.
- Tampilkan waktu lokal dan status lokasi yang mudah dipahami.
- Jika izin ditolak, berikan cara memperbaiki izin browser tanpa memaksa pengguna.
- Konfirmasi untuk tindakan berisiko seperti menonaktifkan karyawan atau mengoreksi absensi.
- Sediakan empty state, skeleton/loading, error state, toast sukses, dan dialog konfirmasi.

## 6. Aksesibilitas
- Kontras teks memenuhi target WCAG AA jika memungkinkan.
- Semua kontrol memiliki label, fokus keyboard terlihat, dan status tidak disampaikan lewat warna saja.
- Tombol utama mudah dijangkau ibu jari; ukuran target sekitar 44×44 px minimum.
- Kamera memiliki teks instruksi dan alternatif penanganan jika perangkat tidak mendukung.
- Hormati `prefers-reduced-motion`.

## 7. Keamanan dan privasi dalam UI
- Jelaskan alasan kamera dan lokasi diminta saat absensi.
- Jangan menampilkan koordinat presisi ke pihak yang tidak berwenang.
- Foto hanya dikirim saat pengguna menekan konfirmasi.
- Jangan menyediakan upload galeri sebagai jalur absensi.
- UI tidak boleh mengklaim deteksi fake GPS sempurna.
