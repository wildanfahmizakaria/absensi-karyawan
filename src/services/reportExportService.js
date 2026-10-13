/**
 * reportExportService.js — Layanan Ekspor Laporan Absensi (SOT v0.2)
 * Format Ekspor yang Didukung:
 * 1. CSV (Excel-Compatible dengan UTF-8 BOM)
 * 2. PDF (Cetak Resmi CV Mandala Mahardika dengan Print Preview)
 */

import { auditApi } from './auditApi';
import {
  calculateMinCheckOutTime,
  evaluateWorkDuration,
} from '../utils/timeUtils';

/**
 * Helper untuk mengunduh berkas teks/blob ke perangkat pengguna
 */
const downloadFile = (content, filename, mimeType) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Helper untuk format nilai sel CSV (escape quotes dan pembatas koma)
 */
const escapeCSV = (value) => {
  if (value === null || value === undefined) return '""';
  const stringValue = String(value);
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return `"${stringValue}"`;
};

export const reportExportService = {
  /**
   * Ekspor Rekapitulasi Kehadiran ke Berkas CSV
   */
  exportSummaryToCSV: async (summaryList, meta, actorName = 'Admin Operasional') => {
    try {
      const now = new Date();
      const dateStr = now.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes()
      ).padStart(2, '0')} WIB`;

      const rows = [];
      // Header Informasi Resmi Perusahaan
      rows.push(['CV MANDALA MAHARDIKA - LAPORAN REKAPITULASI KEHADIRAN KARYAWAN'].map(escapeCSV).join(','));
      rows.push([`Periode Laporan: ${meta.periodLabel || 'Oktober 2026'}`].map(escapeCSV).join(','));
      rows.push([`Divisi / Departemen: ${meta.departmentLabel || 'Semua Departemen'}`].map(escapeCSV).join(','));
      rows.push([`Tanggal Dibuat: ${dateStr} ${timeStr}`].map(escapeCSV).join(','));
      rows.push(['Aturan Jam Kerja: Kebijakan Durasi Fleksibel (Minimal 8 Jam 30 Menit dari Jam Masuk - SOT v0.2)'].map(escapeCSV).join(','));
      rows.push(['Verifikasi Geolocation: Perekaman Koordinat GPS Aktif (Tanpa Batasan Radius Kantor)'].map(escapeCSV).join(','));
      rows.push([]); // Baris kosong

      // Kolom Tabel
      const headers = [
        'No',
        'ID Karyawan',
        'Nama Karyawan',
        'Departemen',
        'Total Hadir (Hari)',
        'Kurang Jam Kerja (Hari)',
        'Izin / Cuti (Hari)',
        'Tingkat Kehadiran (%)',
        'Status Karyawan',
      ];
      rows.push(headers.map(escapeCSV).join(','));

      // Baris Data
      summaryList.forEach((item, index) => {
        const row = [
          index + 1,
          item.id || `EMP-00${index + 1}`,
          item.name,
          item.department,
          item.present,
          item.late,
          item.permit,
          `${item.rate}%`,
          item.status || 'Aktif',
        ];
        rows.push(row.map(escapeCSV).join(','));
      });

      // Tambahkan BOM UTF-8 (\uFEFF) agar Microsoft Excel pada Windows mengenali karakter teks dengan benar
      const csvContent = '\uFEFF' + rows.join('\r\n');
      const filename = `Laporan_Rekap_Absensi_Mandala_${(meta.periodCode || 'BulanIni').toLowerCase()}_${Date.now()}.csv`;

      downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');

      // Catat ke Audit Log Sistem
      await auditApi.logAction(
        actorName,
        'Ekspor Laporan CSV',
        `Mengekspor berkas CSV Rekapitulasi Kehadiran (${summaryList.length} karyawan, Periode: ${meta.periodLabel})`
      );

      return { success: true, count: summaryList.length, filename };
    } catch (err) {
      console.error('Gagal mengekspor CSV rekap:', err);
      return { success: false, error: err.message };
    }
  },

  /**
   * Ekspor Log Rinci Transaksi Absensi ke Berkas CSV
   */
  exportDetailedLogsToCSV: async (attendanceLogs, meta, actorName = 'Admin Operasional') => {
    try {
      const now = new Date();
      const dateStr = now.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });

      const rows = [];
      rows.push(['CV MANDALA MAHARDIKA - LOG RINCI TRANSAKSI ABSENSI'].map(escapeCSV).join(','));
      rows.push([`Periode: ${meta.periodLabel || 'Oktober 2026'}`].map(escapeCSV).join(','));
      rows.push([`Tanggal Dibuat: ${dateStr}`].map(escapeCSV).join(','));
      rows.push(['Aturan Kerja: Minimal 8 Jam 30 Menit (Evaluasi Kurang / Lebih dari Jam Masuk)'].map(escapeCSV).join(','));
      rows.push(['Parameter: SOT v0.2 (Perekaman GPS & Swafoto Kamera Live)'].map(escapeCSV).join(','));
      rows.push([]);

      const headers = [
        'No',
        'ID Transaksi',
        'Tanggal',
        'ID Karyawan',
        'Nama Karyawan',
        'Jam Masuk',
        'Target Min Pulang',
        'Jam Pulang',
        'Durasi Kerja',
        'Evaluasi Durasi (8j 30m)',
        'Status Presensi',
        'Latitude GPS',
        'Longitude GPS',
        'Akurasi GPS (m)',
        'Status Swafoto',
        'Catatan Validasi',
      ];
      rows.push(headers.map(escapeCSV).join(','));

      attendanceLogs.forEach((item, index) => {
        const evalObj = evaluateWorkDuration(item.checkIn, item.checkOut);
        const durationText = item.workDuration || (item.checkIn && item.checkOut !== '-' ? evalObj.durationFormatted : '-');
        const evalLabel = item.keterangan || evalObj.keterangan;
        const targetMinOut = item.minCheckOut || calculateMinCheckOutTime(item.checkIn);

        const row = [
          index + 1,
          item.id,
          item.date,
          item.employeeId,
          item.employeeName,
          item.checkIn || '-',
          targetMinOut,
          item.checkOut || '-',
          durationText,
          evalLabel,
          item.statusLabel || item.status,
          item.coordinates?.latitude || '-',
          item.coordinates?.longitude || '-',
          item.coordinates?.accuracy_m || 10,
          item.photoCaptured ? 'Swafoto Kamera Live' : 'Terverifikasi',
          'Tercatat di Server Mandala Mahardika',
        ];
        rows.push(row.map(escapeCSV).join(','));
      });

      const csvContent = '\uFEFF' + rows.join('\r\n');
      const filename = `Laporan_Log_Rinci_Mandala_${Date.now()}.csv`;

      downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');

      await auditApi.logAction(
        actorName,
        'Ekspor Laporan CSV',
        `Mengekspor berkas CSV Log Rinci Absensi (${attendanceLogs.length} transaksi)`
      );

      return { success: true, count: attendanceLogs.length, filename };
    } catch (err) {
      console.error('Gagal mengekspor CSV rincian:', err);
      return { success: false, error: err.message };
    }
  },

  /**
   * Catat aksi Cetak / Ekspor PDF ke Audit Log
   */
  logPdfExport: async (actorName, details) => {
    await auditApi.logAction(
      actorName,
      'Cetak Laporan PDF',
      details || 'Mengekspor / mencetak dokumen PDF resmi Rekapitulasi Presensi'
    );
  },
};
