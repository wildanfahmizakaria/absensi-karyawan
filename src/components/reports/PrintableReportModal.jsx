import React from 'react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import {
  IconPrinter,
  IconX,
  IconCheckCircle,
  IconBuilding,
  IconCalendar,
} from '../common/Icons';
import { reportExportService } from '../../services/reportExportService';
import {
  calculateMinCheckOutTime,
  evaluateWorkDuration,
} from '../../utils/timeUtils';

export const PrintableReportModal = ({
  isOpen,
  onClose,
  data = [],
  meta = {},
  reportType = 'SUMMARY', // 'SUMMARY' | 'DETAILED'
  currentUser,
}) => {
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handlePrint = async () => {
    // Catat ke audit log
    await reportExportService.logPdfExport(
      currentUser?.name || 'Admin Sistem',
      `Mencetak/menyimpan PDF Laporan Kehadiran (${reportType === 'SUMMARY' ? 'Rekapitulasi' : 'Log Rinci'}, Periode: ${meta.periodLabel || 'Oktober 2026'})`
    );
    // Panggil dialog cetak browser native (yang dapat memilih "Save as PDF")
    window.print();
  };

  const currentDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Kalkulasi ringkasan KPI untuk rekap
  const totalEmployees = data.length;
  const avgAttendance =
    totalEmployees > 0
      ? Math.round(
          data.reduce((acc, curr) => acc + (parseFloat(curr.rate) || 0), 0) / totalEmployees
        )
      : 0;
  const totalLate = data.reduce((acc, curr) => acc + (parseInt(curr.late, 10) || 0), 0);
  const totalPresent = data.reduce((acc, curr) => acc + (parseInt(curr.present, 10) || 0), 0);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Pratinjau Dokumen Cetak PDF"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex justify-center p-2 sm:p-6 animate-fadeIn"
    >
      {/* Kontainer Modal */}
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-float flex flex-col my-auto border border-brand-border">
        {/* Header Aksi (Disembunyikan saat mencetak via .no-print) */}
        <div className="no-print flex items-center justify-between px-6 py-4 border-b border-brand-border bg-slate-50 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 text-primary rounded-xl">
              <IconPrinter className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Pratinjau Dokumen Cetak / PDF Resmi
              </h3>
              <p className="text-xs text-slate-500">
                Format siap cetak atau simpan sebagai file PDF melalui dialog cetak browser
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-slate-600"
            >
              Tutup
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={IconPrinter}
              onClick={handlePrint}
            >
              Cetak / Simpan ke PDF
            </Button>
          </div>
        </div>

        {/* AREA DOKUMEN CETAK RESMI (id="printable-report-area") */}
        <div className="p-6 sm:p-10 overflow-y-auto bg-white" id="printable-report-area">
          {/* KOP SURAT RESMI CV MANDALA MAHARDIKA */}
          <div className="text-center pb-4 border-b-4 border-double border-slate-800 mb-6">
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="font-black text-xl sm:text-2xl tracking-wider text-slate-900 uppercase">
                CV Mandala Mahardika
              </span>
            </div>
            <p className="text-xs sm:text-sm font-medium text-slate-700">
              General Trading, Operations & Distribution Management
            </p>
            <p className="text-[11px] text-slate-500">
              Jl. Pemuda No. 108, Kota Semarang, Jawa Tengah | Telepon: (024) 841-2345 | Email: info@mandalamahardika.com
            </p>
          </div>

          {/* JUDUL DOKUMEN & NOMOR */}
          <div className="text-center mb-6">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 uppercase tracking-tight underline">
              {reportType === 'SUMMARY'
                ? 'Laporan Rekapitulasi Presensi Kehadiran Karyawan'
                : 'Log Rinci Transaksi Absensi Kehadiran'}
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Periode: <strong className="text-slate-900">{meta.periodLabel || 'Oktober 2026'}</strong> | Divisi:{' '}
              <strong className="text-slate-900">{meta.departmentLabel || 'Semua Departemen'}</strong>
            </p>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">
              Ref SOT: v0.2 | Dicetak: {currentDate} | Diterbitkan oleh: {currentUser?.name || 'Administrator'}
            </p>
          </div>

          {/* PARAMETER OPERASIONAL RESMI (SOT v0.2) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs mb-6">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Aturan Jam Kerja:</span>
              <span className="font-semibold text-slate-800">Minimal 8 Jam 30 Menit</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Target Pulang:</span>
              <span className="font-semibold text-slate-800">+8j 30m dari Masuk</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Verifikasi GPS:</span>
              <span className="font-semibold text-slate-800">Koordinat Dicatat</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Rata-rata Presensi:</span>
              <span className="font-bold text-blue-700">{avgAttendance}%</span>
            </div>
          </div>

          {/* TABEL DATA REKAP */}
          {reportType === 'SUMMARY' ? (
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-left text-xs border border-slate-300">
                <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] font-bold border-b border-slate-300">
                  <tr>
                    <th className="py-2 px-2.5 border-r border-slate-300 text-center w-8">No</th>
                    <th className="py-2 px-2.5 border-r border-slate-300 w-24">ID Karyawan</th>
                    <th className="py-2 px-2.5 border-r border-slate-300">Nama Lengkap</th>
                    <th className="py-2 px-2.5 border-r border-slate-300">Departemen</th>
                    <th className="py-2 px-2.5 border-r border-slate-300 text-center">Hadir</th>
                    <th className="py-2 px-2.5 border-r border-slate-300 text-center">Terlambat</th>
                    <th className="py-2 px-2.5 border-r border-slate-300 text-center">Izin/Cuti</th>
                    <th className="py-2 px-2.5 text-right font-bold">Tingkat Kehadiran</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800">
                  {data.map((row, idx) => (
                    <tr key={row.id || idx} className={idx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'}>
                      <td className="py-2 px-2.5 border-r border-slate-300 text-center font-mono">
                        {idx + 1}
                      </td>
                      <td className="py-2 px-2.5 border-r border-slate-300 font-mono text-[11px] text-slate-600">
                        {row.id}
                      </td>
                      <td className="py-2 px-2.5 border-r border-slate-300 font-medium">
                        {row.name}
                      </td>
                      <td className="py-2 px-2.5 border-r border-slate-300 text-slate-600">
                        {row.department}
                      </td>
                      <td className="py-2 px-2.5 border-r border-slate-300 text-center font-semibold text-emerald-700">
                        {row.present}
                      </td>
                      <td className="py-2 px-2.5 border-r border-slate-300 text-center font-semibold text-amber-700">
                        {row.late}
                      </td>
                      <td className="py-2 px-2.5 border-r border-slate-300 text-center text-slate-500">
                        {row.permit}
                      </td>
                      <td className="py-2 px-2.5 text-right font-bold text-slate-900 font-mono">
                        {row.rate}%
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-400 text-slate-900">
                  <tr>
                    <td colSpan="4" className="py-2 px-2.5 border-r border-slate-300 text-center uppercase">
                      Total Akumulasi ({totalEmployees} Karyawan)
                    </td>
                    <td className="py-2 px-2.5 border-r border-slate-300 text-center text-emerald-800">
                      {totalPresent}
                    </td>
                    <td className="py-2 px-2.5 border-r border-slate-300 text-center text-amber-800">
                      {totalLate}
                    </td>
                    <td className="py-2 px-2.5 border-r border-slate-300 text-center text-slate-600">
                      {data.reduce((acc, curr) => acc + (parseInt(curr.permit, 10) || 0), 0)}
                    </td>
                    <td className="py-2 px-2.5 text-right font-mono text-primary">
                      {avgAttendance}%
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-left text-xs border border-slate-300">
                <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] font-bold border-b border-slate-300">
                  <tr>
                    <th className="py-2 px-2 border-r border-slate-300 text-center w-8">No</th>
                    <th className="py-2 px-2 border-r border-slate-300">Tanggal</th>
                    <th className="py-2 px-2 border-r border-slate-300">Karyawan</th>
                    <th className="py-2 px-2 border-r border-slate-300">Masuk</th>
                    <th className="py-2 px-2 border-r border-slate-300">Target Pulang</th>
                    <th className="py-2 px-2 border-r border-slate-300">Pulang</th>
                    <th className="py-2 px-2 border-r border-slate-300">Durasi</th>
                    <th className="py-2 px-2 border-r border-slate-300">Evaluasi 8j 30m</th>
                    <th className="py-2 px-2 text-right">Koordinat GPS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800">
                  {data.map((row, idx) => {
                    const evalObj = evaluateWorkDuration(row.checkIn, row.checkOut);
                    const durationText = row.workDuration || (row.checkIn && row.checkOut !== '-' ? evalObj.durationFormatted : '-');
                    const labelText = row.keterangan || evalObj.keterangan;
                    const isMet = row.status === 'LEBIH' || row.status === 'TEPAT' || evalObj.targetMet;

                    return (
                      <tr key={row.id || idx}>
                        <td className="py-2 px-2 border-r border-slate-300 text-center">{idx + 1}</td>
                        <td className="py-2 px-2 border-r border-slate-300 font-medium">{row.date}</td>
                        <td className="py-2 px-2 border-r border-slate-300">{row.employeeName}</td>
                        <td className="py-2 px-2 border-r border-slate-300 font-mono text-blue-700">{row.checkIn || '-'}</td>
                        <td className="py-2 px-2 border-r border-slate-300 font-mono text-slate-500">
                          {row.minCheckOut || calculateMinCheckOutTime(row.checkIn)}
                        </td>
                        <td className="py-2 px-2 border-r border-slate-300 font-mono text-indigo-700">{row.checkOut || '-'}</td>
                        <td className="py-2 px-2 border-r border-slate-300 font-mono font-semibold">{durationText}</td>
                        <td className="py-2 px-2 border-r border-slate-300">
                          <span className={isMet ? 'text-emerald-700 font-semibold' : 'text-rose-700 font-semibold'}>
                            {labelText}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-right font-mono text-[10px] text-slate-600">
                          {row.coordinates?.latitude}, {row.coordinates?.longitude}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* LEMBAR PENGESAHAN TANDA TANGAN */}
          <div className="mt-8 pt-4 border-t border-slate-300">
            <div className="flex justify-between items-start text-xs text-slate-800">
              <div className="w-48 text-center">
                <p className="text-slate-500 mb-1">Disusun & Diverifikasi Oleh:</p>
                <p className="font-semibold text-slate-900">Admin Operasional & HR</p>
                <div className="h-16 flex items-end justify-center">
                  <span className="text-[10px] font-mono text-slate-400 italic">[Tanda Tangan Digital]</span>
                </div>
                <div className="border-t border-slate-400 pt-1 mt-1 font-bold text-slate-900">
                  {currentUser?.name || 'Siti Rahmawati'}
                </div>
                <p className="text-[10px] text-slate-500">CV Mandala Mahardika</p>
              </div>

              <div className="w-56 text-center">
                <p className="text-slate-500 mb-1">Semarang, {currentDate}</p>
                <p className="font-semibold text-slate-900">Mengetahui & Menyetujui:</p>
                <div className="h-16 flex items-end justify-center">
                  <span className="text-[10px] font-mono text-slate-400 italic">[Stempel & Pengesahan]</span>
                </div>
                <div className="border-t border-slate-400 pt-1 mt-1 font-bold text-slate-900">
                  Hendro Wijaya
                </div>
                <p className="text-[10px] text-slate-500">Direktur Utama</p>
              </div>
            </div>

            <div className="mt-8 text-center text-[9px] text-slate-400 font-mono">
              *** Rekapitulasi sah dicetak otomatis melalui Aplikasi Absensi CV Mandala Mahardika — Validasi GPS & Swafoto Kamera SOT v0.2 ***
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
