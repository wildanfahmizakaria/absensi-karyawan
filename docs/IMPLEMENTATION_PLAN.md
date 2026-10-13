# Implementation Plan — SOT-driven
**Status:** Selesai Sepenuhnya (Fase 0 s/d Fase 7) — Siap Serah Terima & Rilis Produksi

## Prinsip kerja
- Jangan mengerjakan di luar PRD, UI-GUIDELINE, API-spec, USER-FLOW, dan fase yang disetujui.
- Satu fase aktif pada satu waktu.
- Sebelum pindah fase: tampilkan hasil, ringkasan perubahan, tes/validasi, risiko dan keputusan yang masih terbuka; lalu minta persetujuan.
- Jika ada konflik kebutuhan, berhenti dan tanyakan. Jangan mengasumsikan keputusan produk.
- Front-end: HTML, CSS, Tailwind CSS, React, Vite. Backend belum ditentukan.

## Fase 0 — Persetujuan & Penyesuaian SOT
**Output:** review dokumen SOT, pembaruan sesuai keputusan pemilik proyek (perekaman GPS tanpa radius geofence, ekspor CSV, kebijakan batas minimal kerja 8 jam 30 menit dengan evaluasi keterangan durasi kurang/lebih), dan kunci SOT v0.2.  
**Gate:** persetujuan eksplisit pemilik proyek untuk mengunci revisi SOT dan memulai Fase 1.

## Fase 1 — Fondasi front-end
**Output:** scaffold Vite + React, Tailwind, struktur folder, routing, token desain, layout responsif (mobile bottom nav & desktop sidebar), komponen dasar, state/loading/error dan data mock yang diberi label jelas.  
**Belum termasuk:** API/backend nyata, penyimpanan produksi, atau klaim absensi real.

## Fase 2 — Autentikasi dan dashboard berbasis peran
**Output:** layar login dan dashboard karyawan/admin/superadmin dengan guard UI; backend authorization tetap diperlukan untuk produksi.

## Fase 3 — Alur kamera live dan rekaman lokasi GPS
**Output:** komponen kamera live (`getUserMedia`), capture dari stream tanpa input file, Geolocation API untuk perekaman koordinat GPS (latitude, longitude, akurasi tanpa batasan radius geofence), alur konfirmasi dan adapter API.  
**Gate keamanan:** uji perangkat/browser dan kesiapan backend; GPS spoofing tidak dapat dijamin tertangkal hanya oleh front-end.

## Fase 4 — Riwayat dan manajemen operasional
**Output:** riwayat absensi dengan detail koordinat lokasi, filter, detail transaksi, manajemen karyawan, pengaturan batas minimal kerja 8 jam 30 menit & profil organisasi, serta audit-log UI.

## Fase 5 — Laporan dan ekspor
**Output:** laporan absensi terfilter dan unduhan berkas PDF serta CSV (format spreadsheet utama yang telah disetujui).

## Fase 6 — PWA, aksesibilitas, hardening
**Output:** manifest, ikon, cache shell aman, pengujian responsif/a11y, validasi error, security review, dokumentasi konfigurasi.

## Fase 7 — Integrasi dan serah terima
**Output:** integrasi API backend yang disetujui, tes end-to-end, instruksi setup/build, daftar keterbatasan dan checklist rilis.

## Definition of Done per fase
- Kriteria penerimaan fase terpenuhi.
- Tidak ada perubahan di luar scope yang disetujui.
- Validasi/test yang relevan dijalankan dan hasilnya dilaporkan.
- README/catatan perubahan diperbarui jika relevan.
- Pemilik proyek menyetujui sebelum fase berikutnya.
