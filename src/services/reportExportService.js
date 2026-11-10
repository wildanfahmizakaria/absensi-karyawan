/**
 * reportExportService.js — Layanan Ekspor Laporan Absensi CV Mandala Mahardika
 * Mengonsumsi REST API Backend Produksi:
 * - GET /admin/reports/attendance (JSON)
 * - GET /admin/reports/attendance/export?format=csv (Excel-Compatible UTF-8 BOM CSV Stream)
 * - GET /admin/reports/attendance/export?format=pdf (PDF Dokumen Resmi Landscape A4)
 */

import { apiClient } from './apiClient';

export const reportExportService = {
  /**
   * Mengambil data rekap laporan dari API Backend
   */
  getReportData: async (filters = {}) => {
    const query = new URLSearchParams();
    if (filters.userId) query.append('user_id', filters.userId);
    if (filters.startDate) query.append('start_date', filters.startDate);
    if (filters.endDate) query.append('end_date', filters.endDate);
    if (filters.durationStatus && filters.durationStatus !== 'ALL') {
      query.append('duration_status', filters.durationStatus);
    }

    return apiClient.get(`/admin/reports/attendance?${query.toString()}`);
  },

  /**
   * Unduh Berkas CSV Kompatibel Microsoft Excel langsung dari Server API
   */
  exportCSV: async (filters = {}) => {
    const query = new URLSearchParams();
    query.append('format', 'csv');
    if (filters.startDate) query.append('start_date', filters.startDate);
    if (filters.endDate) query.append('end_date', filters.endDate);

    const filename = `Laporan_Absensi_Mandala_${filters.startDate || 'all'}_${Date.now()}.csv`;
    return apiClient.downloadBlob(`/admin/reports/attendance/export?${query.toString()}`, filename);
  },

  /**
   * Unduh Dokumen Resmi PDF langsung dari Server API
   */
  exportPDF: async (filters = {}) => {
    const query = new URLSearchParams();
    query.append('format', 'pdf');
    if (filters.startDate) query.append('start_date', filters.startDate);
    if (filters.endDate) query.append('end_date', filters.endDate);

    const filename = `Laporan_Absensi_Mandala_${filters.startDate || 'all'}_${Date.now()}.pdf`;
    return apiClient.downloadBlob(`/admin/reports/attendance/export?${query.toString()}`, filename);
  },

  /**
   * Alias untuk kompatibilitas fungsi ekspor sebelumnya
   */
  exportSummaryToCSV: async (summaryList, meta, actorName) => {
    return reportExportService.exportCSV({
      startDate: meta?.startDate,
      endDate: meta?.endDate,
    });
  },

  exportDetailedLogsToCSV: async (attendanceLogs, meta, actorName) => {
    return reportExportService.exportCSV({
      startDate: meta?.startDate,
      endDate: meta?.endDate,
    });
  },

  logPdfExport: async (actorName, details) => {
    return true;
  },
};
