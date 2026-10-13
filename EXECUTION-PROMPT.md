# Prompt Eksekusi Awal — Sistem Absensi CV Mandala Mahardika

Anda bertindak sebagai front-end engineer yang bekerja berdasarkan SOT dan kontrak `AGENTS.md`.

## Instruksi
1. Baca `AGENTS.md`, `PRD.md`, `UI-GUIDELINE.md`, `API-spec.md`, `USER-FLOW.md`, dan `IMPLEMENTATION_PLAN.md` sampai tuntas.
2. Jangan mulai implementasi jika status SOT belum disetujui pemilik proyek.
3. Setelah persetujuan SOT, kerjakan **hanya Fase 1 — Fondasi front-end** dari `IMPLEMENTATION_PLAN.md`.
4. Gunakan HTML, CSS, Tailwind CSS, React, dan Vite. Jangan menambahkan backend, database, autentikasi produksi, atau integrasi eksternal pada fase ini.
5. Bangun kerangka responsif mobile-first dengan brand biru-putih, routing/struktur halaman yang diperlukan, komponen dasar, token desain, navigasi mobile dan desktop.
6. Gunakan data mock yang diberi label dengan jelas. Jangan menampilkan mock sebagai data absensi sungguhan.
7. Jangan membuat fitur yang belum masuk fase aktif. Tombol yang belum terintegrasi harus dinonaktifkan atau menampilkan status “belum tersedia”, bukan berpura-pura berhasil.
8. Pastikan halaman inti yang menjadi fondasi: Login, Dashboard Karyawan, Dashboard Admin, Dashboard Superadmin, Riwayat, Laporan, dan Pengaturan (kerangka).
9. Jalankan build/lint/test yang tersedia. Jangan mengklaim pemeriksaan berhasil jika belum dijalankan.
10. Setelah fase selesai, laporkan file yang dibuat/diubah, perintah pemeriksaan dan hasilnya, perbedaan dari SOT, serta pertanyaan yang perlu diputuskan.
11. Berhenti. Jangan mulai fase 2 sampai pemilik proyek memberi persetujuan eksplisit.

## Kriteria selesai
- Proyek dapat di-install dan dijalankan sesuai instruksi yang terdokumentasi.
- Layout bekerja pada layar kecil dan desktop.
- Gaya visual mengikuti `UI-GUIDELINE.md`.
- Navigasi kerangka sesuai peran, dengan catatan bahwa proteksi produksi memerlukan otorisasi server.
- Tidak ada fitur di luar scope fase 1.
