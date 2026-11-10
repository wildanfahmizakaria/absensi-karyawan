/**
 * configApi.js — Service Konfigurasi Sistem CV Mandala Mahardika
 * Mengonsumsi REST API Backend Produksi:
 * - GET   /admin/settings/organization
 * - PATCH /admin/settings/organization
 * - GET   /admin/settings/work-schedule
 * - PATCH /admin/settings/work-schedule
 */

import { apiClient } from './apiClient';

export const configApi = {
  /**
   * Mengambil aturan jadwal & durasi minimal kerja (510 menit)
   */
  getWorkSchedule: async () => {
    try {
      const res = await apiClient.get('/admin/settings/work-schedule');
      if (res.error) {
        return {
          type: 'Kebijakan Durasi Fleksibel',
          minDurationFormatted: '8 Jam 30 Menit',
          minDurationMinutesTotal: 510,
          minWorkHours: 8,
          minWorkMinutes: 30,
          checkInRule: 'Absen Masuk Bebas (Jam Berapapun)',
          checkOutRule: 'Absen Pulang Minimal 8 Jam 30 Menit dari Jam Masuk',
          timezone: 'WIB (UTC+7)',
          gpsRecordingEnabled: true,
          selfieCameraOnly: true,
        };
      }

      const d = res.data || {};
      const totalMinutes = d.minimum_work_duration_minutes || 510;
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;

      return {
        ...d,
        type: 'Kebijakan Durasi Fleksibel',
        minDurationMinutesTotal: totalMinutes,
        minWorkHours: hours,
        minWorkMinutes: minutes,
        minDurationFormatted: `${hours} Jam ${minutes} Menit`,
        checkInRule: 'Absen Masuk Bebas (Jam Berapapun)',
        checkOutRule: `Absen Pulang Minimal ${hours} Jam ${minutes} Menit dari Jam Masuk`,
        timezone: d.timezone ? `${d.timezone} (WIB)` : 'WIB (UTC+7)',
        gpsRecordingEnabled: d.gps_recording_enabled !== undefined ? Boolean(d.gps_recording_enabled) : true,
        selfieCameraOnly: d.selfie_camera_only !== undefined ? Boolean(d.selfie_camera_only) : true,
      };
    } catch (err) {
      return {
        type: 'Kebijakan Durasi Fleksibel',
        minDurationFormatted: '8 Jam 30 Menit',
        minDurationMinutesTotal: 510,
      };
    }
  },

  /**
   * Memperbarui aturan durasi kerja minimal
   */
  updateWorkSchedule: async (newSchedule) => {
    const totalMinutes =
      newSchedule.minDurationMinutesTotal ||
      (newSchedule.minWorkHours || 8) * 60 + (newSchedule.minWorkMinutes || 30);

    const payload = {
      minimum_work_duration_minutes: totalMinutes,
      allow_checkout_below_minimum: newSchedule.allowCheckoutBelowMinimum !== undefined ? newSchedule.allowCheckoutBelowMinimum : true,
      cross_midnight_session_enabled: newSchedule.crossMidnightSessionEnabled !== undefined ? newSchedule.crossMidnightSessionEnabled : true,
      gps_recording_enabled: newSchedule.gpsRecordingEnabled !== undefined ? newSchedule.gpsRecordingEnabled : true,
      gps_geofence_enabled: Boolean(newSchedule.gpsGeofenceEnabled),
      selfie_camera_only: newSchedule.selfieCameraOnly !== undefined ? newSchedule.selfieCameraOnly : true,
    };

    const res = await apiClient.patch('/admin/settings/work-schedule', payload);

    if (res.error) {
      return { success: false, error: res.error.message || 'Gagal memperbarui konfigurasi kerja.' };
    }

    return { success: true, data: res.data?.settings, message: res.data?.message };
  },

  /**
   * Mengambil profil organisasi
   */
  getOrganization: async () => {
    try {
      const res = await apiClient.get('/admin/settings/organization');
      if (res.error) {
        return {
          companyName: 'CV Mandala Mahardika',
          address: 'Jl. Pemuda No. 108, Kota Semarang, Jawa Tengah',
          timezone: 'Asia/Jakarta',
          reportExportFormat: 'CSV',
          activeEmployees: 0,
          totalEmployees: 0,
        };
      }

      const d = res.data || {};
      return {
        ...d,
        companyName: d.company_name || 'CV Mandala Mahardika',
        address: d.address || 'Jl. Pemuda No. 108, Kota Semarang, Jawa Tengah',
        timezone: d.timezone || 'Asia/Jakarta',
        reportExportFormat: d.report_export_format || 'CSV',
        activeEmployees: d.active_employees || 0,
        totalEmployees: d.total_employees || 0,
      };
    } catch (err) {
      return {
        companyName: 'CV Mandala Mahardika',
        address: 'Jl. Pemuda No. 108, Kota Semarang, Jawa Tengah',
      };
    }
  },

  /**
   * Memperbarui profil organisasi
   */
  updateOrganization: async (newOrg) => {
    const payload = {
      company_name: newOrg.companyName || newOrg.company_name,
      timezone: newOrg.timezone || 'Asia/Jakarta',
      report_export_format: newOrg.reportExportFormat || newOrg.report_export_format || 'CSV',
    };

    const res = await apiClient.patch('/admin/settings/organization', payload);

    if (res.error) {
      return { success: false, error: res.error.message || 'Gagal memperbarui profil organisasi.' };
    }

    return { success: true, data: res.data, message: res.data?.message };
  },
};
