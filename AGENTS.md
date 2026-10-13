# AGENTS.md — Kontrak Kerja Agen
**Status:** Kontrak awal — aktif setelah disetujui pemilik proyek.

## Sumber kebenaran
1. `PRD.md`
2. `UI-GUIDELINE.md`
3. `API-spec.md`
4. `USER-FLOW.md`
5. `IMPLEMENTATION_PLAN.md`

Jika ada konflik, jangan memilih sendiri. Laporkan konflik dan minta keputusan pemilik proyek.

## Batasan wajib
- Kerjakan hanya fase yang secara eksplisit disetujui.
- Jangan memulai fase berikutnya tanpa persetujuan eksplisit.
- Jangan menambahkan fitur, library, backend, database, layanan eksternal, atau pola arsitektur di luar scope tanpa persetujuan.
- Jangan mengganti teknologi front-end yang ditentukan: HTML, CSS, Tailwind CSS, React, Vite.
- Jangan membuat klaim bahwa mock data adalah data produksi atau bahwa absensi benar-benar tersimpan sebelum API mengonfirmasi.
- Jangan menambahkan input upload galeri ke alur absensi; gunakan kamera live dan capture stream.
- Validasi otorisasi dan integritas rekaman lokasi GPS/waktu harus direncanakan di server; front-end bukan batas keamanan.
- Jangan menyimpan rahasia/API key di repository atau kode klien.
- Jangan menghapus atau mengubah file yang tidak terkait tanpa izin.

## Protokol fase
1. Baca dokumen SOT sebelum mulai.
2. Nyatakan fase dan deliverable yang akan dikerjakan.
3. Implementasikan hanya scope fase tersebut.
4. Jalankan pemeriksaan yang tersedia dan laporkan hasil nyata.
5. Ringkas file berubah, keputusan terbuka, risiko, dan keterbatasan.
6. Berhenti dan minta persetujuan sebelum fase berikutnya.

## Standar kualitas
- Mobile-first, aksesibel, state loading/empty/error/success yang jelas.
- Komponen dan nama variabel mudah dipahami.
- Hindari duplikasi dan dependensi yang tidak perlu.
- Validasi input; tampilkan error yang dapat ditindaklanjuti.
- Lindungi data karyawan, foto, lokasi, dan sesi.
- Tidak mengarang hasil tes, endpoint, atau integrasi yang belum ada.

## Format laporan agen
- Fase yang dikerjakan
- Ringkasan implementasi
- File yang dibuat/diubah
- Tes/check yang dijalankan dan hasilnya
- Kesesuaian terhadap SOT
- Risiko/pertanyaan terbuka
- Permintaan persetujuan fase berikutnya
