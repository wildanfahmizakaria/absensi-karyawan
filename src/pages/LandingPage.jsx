import React from 'react';
import { useNavigation } from '../context/NavigationContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import {
  IconBuilding,
  IconCamera,
  IconMapPin,
  IconClock,
  IconShield,
  IconFileText,
  IconCheckCircle,
  IconUser,
  IconLogIn,
  IconArrowLeft,
  IconDownload,
} from '../components/common/Icons';

export const LandingPage = () => {
  const { navigateTo } = useNavigation();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-blue-500 selection:text-white">
      {/* 1. TOP NAVBAR LANDING PAGE */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-blue-700 to-primary text-white flex items-center justify-center shadow-md shadow-blue-600/20">
              <IconBuilding className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900">
                  CV Mandala Mahardika
                </span>
                <Badge variant="primary" size="sm">
                  SOT v0.2
                </Badge>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Sistem Presensi Karyawan Berbasis Web & PWA
              </p>
            </div>
          </div>

          {/* Quick Nav Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-6 text-xs sm:text-sm font-medium text-slate-600">
            <a href="#fitur" className="hover:text-primary transition-colors">
              Fitur Unggulan
            </a>
            <a href="#alur" className="hover:text-primary transition-colors">
              Alur Presensi
            </a>
            <a href="#jadwal" className="hover:text-primary transition-colors">
              Jadwal Kerja
            </a>
            <a href="#kontak" className="hover:text-primary transition-colors">
              Profil Kantor
            </a>
          </nav>

          {/* Action Buttons: Login & Register */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => navigateTo('login')}
              className="px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-primary hover:bg-blue-50 rounded-xl transition-all"
            >
              Masuk
            </button>
            <button
              onClick={() => navigateTo('register')}
              className="px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-bold bg-primary hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-600/20 hover:shadow-lg hover:shadow-blue-600/30 transition-all flex items-center gap-1.5"
            >
              <IconUser className="w-4 h-4" />
              <span>Daftar Akun</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 lg:pt-28 lg:pb-32 bg-gradient-to-b from-blue-50/60 via-white to-slate-50 border-b border-slate-200">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-400/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Heading & CTAs */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 text-primary text-xs font-semibold border border-blue-200/60 animate-fadeIn">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span>Teknologi Presensi Swafoto Live & Koordinat GPS Terverifikasi</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
                Presensi Kerja Karyawan{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-700">
                  Cepat, Akurat
                </span>{' '}
                & Terintegrasi Real-Time
              </h1>

              <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Platform presensi digital resmi CV Mandala Mahardika dengan validasi kamera live anti-manipulasi, pencatatan koordinat GPS mandatori, dan rekapitulasi data kehadiran yang siap diekspor ke berkas Excel (CSV) maupun dokumen cetak resmi PDF.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                <button
                  onClick={() => navigateTo('login')}
                  className="w-full sm:w-auto px-6 py-3.5 bg-primary hover:bg-blue-700 text-white font-bold text-sm sm:text-base rounded-xl shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/35 transition-all flex items-center justify-center gap-2"
                >
                  <IconLogIn className="w-5 h-5" />
                  <span>Masuk ke Akun Saya</span>
                </button>
                <button
                  onClick={() => navigateTo('register')}
                  className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm sm:text-base rounded-xl border border-slate-300 shadow-sm hover:border-slate-400 transition-all flex items-center justify-center gap-2"
                >
                  <IconUser className="w-5 h-5 text-primary" />
                  <span>Daftar Karyawan Baru</span>
                </button>
              </div>

              {/* Live Status Indicators */}
              <div className="pt-4 grid grid-cols-3 gap-4 border-t border-slate-200/80 max-w-lg mx-auto lg:mx-0 text-left">
                <div>
                  <span className="text-xs text-slate-500 font-medium block">Jam Masuk</span>
                  <span className="text-base sm:text-lg font-bold text-slate-900">Bebas</span>
                  <span className="text-[10px] text-emerald-600 font-semibold">Fleksibel</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-medium block">Batas Kerja</span>
                  <span className="text-base sm:text-lg font-bold text-slate-900">Min. 8j 30m</span>
                  <span className="text-[10px] text-indigo-600 font-semibold">Dari Jam Masuk</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-medium block">Lokasi GPS</span>
                  <span className="text-base sm:text-lg font-bold text-blue-600">Mandatori</span>
                  <span className="text-[10px] text-slate-500">Tanpa Radius</span>
                </div>
              </div>
            </div>

            {/* Right Column: Visual Mockup Card */}
            <div className="lg:col-span-5 relative">
              <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-float border border-slate-200/80 relative z-10 space-y-5">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-primary font-bold flex items-center justify-center text-sm">
                      BP
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Budi Pratama</h4>
                      <p className="text-xs text-slate-500">Karyawan • Divisi Operasional</p>
                    </div>
                  </div>
                  <Badge variant="success" size="sm">
                    Tepat Waktu
                  </Badge>
                </div>

                {/* Simulated Camera & GPS Frame */}
                <div className="relative rounded-2xl bg-slate-900 h-52 overflow-hidden flex flex-col items-center justify-center text-white border border-slate-800">
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                  {/* Oval face guide */}
                  <div className="w-24 h-32 border-2 border-dashed border-emerald-400 rounded-full relative z-10 flex items-center justify-center">
                    <IconCamera className="w-6 h-6 text-emerald-400 opacity-60" />
                  </div>
                  <span className="relative z-10 text-[11px] font-semibold text-emerald-400 mt-2 bg-slate-900/80 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                    ✓ Swafoto Wajah Terdeteksi
                  </span>
                </div>

                {/* Simulated GPS Coordinate pill */}
                <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-700">
                    <IconMapPin className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="font-mono text-[11px]">-6.9826, 110.4091 (Akurasi: ±8.5m)</span>
                  </div>
                  <span className="font-bold text-primary text-[11px]">Server Verified</span>
                </div>

                {/* Status bar */}
                <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                  <span>Hari Ini: <strong>07:54 WIB</strong></span>
                  <span className="text-emerald-600 font-semibold">Tercatat di Server Mandala</span>
                </div>
              </div>

              {/* Decorative floating card */}
              <div className="hidden sm:block absolute -bottom-5 -left-6 bg-slate-900 text-white p-4 rounded-2xl shadow-float border border-slate-800 text-xs z-20 animate-fadeIn">
                <div className="flex items-center gap-2 mb-1">
                  <IconCheckCircle className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold">Keamanan Validasi SOT v0.2</span>
                </div>
                <p className="text-slate-400 text-[11px]">Kamera stream live tanpa upload galeri</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FITUR UNGGULAN SECTION */}
      <section id="fitur" className="py-16 sm:py-24 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-primary font-bold text-xs uppercase tracking-wider">
              Keunggulan Sistem
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1.5">
              Dirancang Khusus untuk Operasional CV Mandala Mahardika
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Kombinasi teknologi web modern untuk menjamin keabsahan data kehadiran karyawan di lapangan maupun kantor.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Live Camera */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-primary flex items-center justify-center mb-4">
                <IconCamera className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1.5">Swafoto Kamera Live</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pengambilan foto langsung dari stream kamera perangkat dengan panduan oval wajah. Mencegah manipulasi unggah foto lama dari galeri.
              </p>
            </div>

            {/* Card 2: GPS Mandatori */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                <IconMapPin className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1.5">Koordinat GPS Mandatori</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Perekaman otomatis latitude, longitude, dan estimasi akurasi meter pada setiap transaksi presensi tanpa batasan radius kantor.
              </p>
            </div>

            {/* Card 3: Kebijakan Fleksibel */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
                <IconClock className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1.5">Durasi Minimal 8 Jam 30 Menit</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Absen masuk bebas pada jam berapapun. Target absen pulang minimal dihitung otomatis Jam Masuk + 8 jam 30 menit dengan evaluasi keterangan durasi kurang/lebih.
              </p>
            </div>

            {/* Card 4: Ekspor CSV & PDF */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
                <IconFileText className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1.5">Ekspor CSV & Cetak PDF</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Ekspor rekap kehadiran ber-BOM UTF-8 yang kompatibel Excel serta dokumen cetak A4 ber-kop surat resmi dan lembar pengesahan direktur.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. ALUR PRESENSI (USER FLOW) */}
      <section id="alur" className="py-16 sm:py-24 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-primary font-bold text-xs uppercase tracking-wider">
              Langkah Sederhana
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1.5">
              Alur Presensi Karyawan dalam 4 Langkah
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Proses presensi selesai dalam waktu kurang dari 15 detik langsung dari smartphone Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 bg-white rounded-2xl border border-slate-200 text-center relative">
              <span className="w-8 h-8 rounded-full bg-primary text-white font-bold text-xs inline-flex items-center justify-center mb-3">
                1
              </span>
              <h4 className="font-bold text-slate-900 text-sm mb-1">Buka & Masuk</h4>
              <p className="text-xs text-slate-600">
                Akses sistem melalui browser atau aplikasi PWA di layar utama ponsel Anda.
              </p>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200 text-center relative">
              <span className="w-8 h-8 rounded-full bg-primary text-white font-bold text-xs inline-flex items-center justify-center mb-3">
                2
              </span>
              <h4 className="font-bold text-slate-900 text-sm mb-1">Izinkan Akses</h4>
              <p className="text-xs text-slate-600">
                Sistem mengaktifkan kamera depan dan membaca titik koordinat lokasi GPS perangkat.
              </p>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200 text-center relative">
              <span className="w-8 h-8 rounded-full bg-primary text-white font-bold text-xs inline-flex items-center justify-center mb-3">
                3
              </span>
              <h4 className="font-bold text-slate-900 text-sm mb-1">Ambil Swafoto</h4>
              <p className="text-xs text-slate-600">
                Posisikan wajah pada panduan oval di layar lalu ketuk tombol tangkap foto.
              </p>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200 text-center relative">
              <span className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs inline-flex items-center justify-center mb-3">
                ✓
              </span>
              <h4 className="font-bold text-slate-900 text-sm mb-1">Konfirmasi Selesai</h4>
              <p className="text-xs text-slate-600">
                Transaksi presensi beserta bukti foto dan GPS tersimpan secara aman di server.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PROFIL KANTOR & JADWAL KERJA */}
      <section id="jadwal" className="py-16 sm:py-20 bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-blue-900 via-primary to-blue-800 text-white shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <span className="text-blue-200 text-xs font-bold uppercase tracking-wider block mb-1">
                  Informasi Resmi Instansi
                </span>
                <h3 className="text-2xl sm:text-3xl font-black mb-3">
                  CV Mandala Mahardika
                </h3>
                <p className="text-xs sm:text-sm text-blue-100 leading-relaxed mb-6">
                  Perusahaan General Trading, Contractor, dan Layanan Operasional yang berkomitmen terhadap disiplin kehadiran kerja dan transparansi data karyawan.
                </p>
                <div className="space-y-2 text-xs text-blue-100">
                  <div className="flex items-center gap-2">
                    <IconMapPin className="w-4 h-4 text-blue-300 flex-shrink-0" />
                    <span>Jl. Pemuda No. 108, Kota Semarang, Jawa Tengah</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IconBuilding className="w-4 h-4 text-blue-300 flex-shrink-0" />
                    <span>Telp: (024) 841-2345 | Email: info@mandalamahardika.com</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 space-y-4">
                <h4 className="font-bold text-sm text-white border-b border-white/20 pb-2">
                  Aturan Jam Operasional Fleksibel
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-blue-200 block text-[11px]">Jam Masuk</span>
                    <span className="font-bold text-sm text-white">Bebas (Fleksibel)</span>
                  </div>
                  <div>
                    <span className="text-blue-200 block text-[11px]">Batas Minimal</span>
                    <span className="font-bold text-sm text-emerald-300">8 Jam 30 Menit</span>
                  </div>
                  <div>
                    <span className="text-blue-200 block text-[11px]">Target Pulang</span>
                    <span className="font-bold text-sm text-white">Masuk + 8j 30m</span>
                  </div>
                  <div>
                    <span className="text-blue-200 block text-[11px]">Evaluasi Pulang</span>
                    <span className="font-bold text-sm text-white">Kurang / Lebih</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-white/20 text-[11px] text-blue-100">
                  * Verifikasi kehadiran mencatat koordinat lokasi GPS secara mandatori.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION FOOTER BANNER */}
      <section className="py-14 bg-slate-100 text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
            Siap Memulai Aktivitas Kerja Hari Ini?
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mb-6">
            Masuk ke akun karyawan Anda untuk melakukan presensi masuk atau daftarkan akun baru jika belum terdaftar.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigateTo('login')}
              className="w-full sm:w-auto px-6 py-2.5 bg-primary hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition-all"
            >
              Masuk ke Sistem
            </button>
            <button
              onClick={() => navigateTo('register')}
              className="w-full sm:w-auto px-6 py-2.5 bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm rounded-xl border border-slate-300 transition-all"
            >
              Daftar Akun Baru
            </button>
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer id="kontak" className="bg-slate-900 text-slate-400 py-10 text-xs border-t border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-white font-bold">
            <IconBuilding className="w-4 h-4 text-primary" />
            <span>CV Mandala Mahardika — Sistem Absensi Karyawan</span>
          </div>
          <div className="text-center sm:text-right text-[11px]">
            <p>© 2026 CV Mandala Mahardika. Seluruh hak cipta dilindungi.</p>
            <p className="text-slate-500 mt-0.5">Sesuai Kontrak Kerja Single Source of Truth (SOT v0.2)</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
