/**
 * attendanceApi.js — Service Transaksi Absensi CV Mandala Mahardika
 * Mengonsumsi REST API Backend Produksi:
 * - GET  /attendance/today
 * - POST /attendance/check-in
 * - POST /attendance/check-out
 * - GET  /attendance (Riwayat Absensi)
 * - GET  /attendance/:id (Detail Sesi)
 * - GET  /attendance/corrections (Daftar Pengajuan Koreksi)
 * - POST /attendance/corrections (Ajukan Koreksi)
 * - PATCH /attendance/corrections/:id/review (Tinjau Koreksi)
 * - GET  /dashboard/employee (KPI Karyawan)
 * - GET  /dashboard/admin (KPI Admin)
 */

import { apiClient } from './apiClient';
import {
  calculateMinCheckOutTime,
  evaluateWorkDuration,
  MIN_WORK_MINUTES_TOTAL,
} from '../utils/timeUtils';

export const attendanceApi = {
  /**
   * Mengambil status absensi hari ini untuk karyawan yang sedang login
   */
  getTodayStatus: async (employeeId) => {
    try {
      const res = await apiClient.get('/attendance/today');
      if (res.error) {
        return { data: null, meta: res.meta || {}, error: res.error };
      }

      const rawData = res.data || {};
      const activeSession = rawData.active_session;
      const todayHistory = rawData.today_history || [];

      let status = 'BELUM_ABSEN';
      let checkInTime = null;
      let checkOutTime = null;
      let minCheckOutTime = null;
      let workDuration = null;
      let durationStatus = null;
      let durationLabel = null;
      let lastTransaction = null;

      if (activeSession && !activeSession.check_out_at) {
        status = 'SUDAH_MASUK';
        // Format check_in_at: "YYYY-MM-DD HH:mm:ss"
        const timePart = activeSession.check_in_at?.includes(' ')
          ? activeSession.check_in_at.split(' ')[1]
          : activeSession.check_in_at;
        checkInTime = timePart ? `${timePart} WIB` : null;
        minCheckOutTime = calculateMinCheckOutTime(checkInTime, MIN_WORK_MINUTES_TOTAL);
        lastTransaction = {
          id: `ATT-${activeSession.id}`,
          type: 'CHECK_IN',
          checkIn: checkInTime,
          date: activeSession.check_in_at?.split(' ')[0] || new Date().toISOString().split('T')[0],
          coordinates: {
            latitude: activeSession.check_in_latitude,
            longitude: activeSession.check_in_longitude,
            accuracy_m: activeSession.check_in_accuracy_m,
          },
          photoUrl: activeSession.check_in_selfie_path,
        };
      } else if (todayHistory.length > 0) {
        status = 'SELESAI';
        const latest = todayHistory[0];
        checkInTime = latest.check_in_at?.split(' ')[1] ? `${latest.check_in_at.split(' ')[1]} WIB` : null;
        checkOutTime = latest.check_out_at?.split(' ')[1] ? `${latest.check_out_at.split(' ')[1]} WIB` : null;
        durationStatus = latest.duration_status;
        lastTransaction = latest;
      }

      return {
        data: {
          employeeId,
          date: new Date().toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          }),
          status,
          checkInTime,
          checkOutTime,
          minCheckOutTime,
          workDuration,
          durationStatus,
          durationLabel,
          activeSession,
          todayHistory,
          lastTransaction,
        },
        meta: res.meta || {},
        error: null,
      };
    } catch (err) {
      return {
        data: null,
        meta: {},
        error: { code: 'CLIENT_ERROR', message: err.message },
      };
    }
  },

  /**
   * Kirim Absen Masuk (Check-in) dengan Swafoto Kamera Live & GPS
   */
  submitCheckIn: async (payload) => {
    const { photoBlob, latitude, longitude, accuracy_m, notes } = payload;

    if (!photoBlob) {
      return {
        data: null,
        meta: {},
        error: {
          code: 'CAMERA_REQUIRED',
          message: 'Foto swafoto kamera live wajib disertakan saat absen masuk.',
        },
      };
    }

    if (latitude === undefined || longitude === undefined || latitude === null) {
      return {
        data: null,
        meta: {},
        error: {
          code: 'LOCATION_REQUIRED',
          message: 'Koordinat lokasi GPS wajib disertakan saat absen masuk.',
        },
      };
    }

    const formData = new FormData();
    formData.append('photo', photoBlob, 'selfie_checkin.jpg');
    formData.append('latitude', String(latitude));
    formData.append('longitude', String(longitude));
    formData.append('accuracy_m', String(accuracy_m || 10));
    if (notes) formData.append('notes', notes);

    const res = await apiClient.postMultipart('/attendance/check-in', formData);

    if (res.data && res.data.session) {
      const session = res.data.session;
      const timePart = session.check_in_at?.includes(' ') ? session.check_in_at.split(' ')[1] : session.check_in_at;
      const formattedTime = timePart ? `${timePart} WIB` : '-';
      const minCheckOutTime = calculateMinCheckOutTime(formattedTime, MIN_WORK_MINUTES_TOTAL);

      return {
        data: {
          ...session,
          id: `ATT-${session.id}`,
          rawId: session.id,
          checkIn: formattedTime,
          minCheckOutTime,
          statusLabel: `Tercatat (Min. Pulang: ${minCheckOutTime})`,
        },
        meta: { message: res.data.message || 'Absen masuk berhasil dicatat.' },
        error: null,
      };
    }

    return res;
  },

  /**
   * Kirim Absen Pulang (Check-out) dengan GPS & Evaluasi Target 510 Menit
   */
  submitCheckOut: async (payload) => {
    const { photoBlob, latitude, longitude, accuracy_m, notes } = payload;

    if (latitude === undefined || longitude === undefined || latitude === null) {
      return {
        data: null,
        meta: {},
        error: {
          code: 'LOCATION_REQUIRED',
          message: 'Koordinat lokasi GPS wajib disertakan saat absen pulang.',
        },
      };
    }

    let res;
    if (photoBlob) {
      const formData = new FormData();
      formData.append('photo', photoBlob, 'selfie_checkout.jpg');
      formData.append('latitude', String(latitude));
      formData.append('longitude', String(longitude));
      formData.append('accuracy_m', String(accuracy_m || 10));
      if (notes) formData.append('notes', notes);
      res = await apiClient.postMultipart('/attendance/check-out', formData);
    } else {
      res = await apiClient.post('/attendance/check-out', {
        latitude: String(latitude),
        longitude: String(longitude),
        accuracy_m: String(accuracy_m || 10),
        notes: notes || 'Selesai bertugas',
      });
    }

    if (res.data && res.data.session) {
      const session = res.data.session;
      const evalObj = res.data.evaluation || {};
      return {
        data: {
          ...session,
          id: `ATT-${session.id}`,
          rawId: session.id,
          workDuration: evalObj.duration_human || `${session.elapsed_minutes || 0} menit`,
          durationStatus: session.duration_status,
          evaluation: evalObj,
        },
        meta: { message: res.data.message },
        error: null,
      };
    }

    return res;
  },

  /**
   * Mengambil riwayat absensi dari endpoint REST API
   */
  getAttendanceHistory: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    if (filters.page) queryParams.append('page', filters.page);
    if (filters.limit) queryParams.append('limit', filters.limit);
    if (filters.startDate) queryParams.append('start_date', filters.startDate);
    if (filters.endDate) queryParams.append('end_date', filters.endDate);
    if (filters.durationStatus && filters.durationStatus !== 'ALL') {
      queryParams.append('duration_status', filters.durationStatus);
    }
    if (filters.userId) queryParams.append('user_id', filters.userId);

    const endpoint = `/attendance?${queryParams.toString()}`;
    const res = await apiClient.get(endpoint);

    if (res.error) {
      return { data: [], meta: res.meta || {}, error: res.error };
    }

    // Normalisasi struktur item agar sesuai kebutuhan komponen tampilan tabel/kartu
    const items = (res.data || []).map((row) => {
      const checkInParts = (row.check_in_at || '').split(' ');
      const checkOutParts = (row.check_out_at || '').split(' ');

      const checkInTime = checkInParts[1] ? `${checkInParts[1]} WIB` : '-';
      const checkOutTime = checkOutParts[1] ? `${checkOutParts[1]} WIB` : '-';
      const minCheckOut = calculateMinCheckOutTime(checkInTime, MIN_WORK_MINUTES_TOTAL);

      let durationLabel = 'Sedang Berjalan';
      let statusLabel = 'Sedang Bekerja';
      if (row.duration_status === 'MEETS_MINIMUM') {
        durationLabel = 'Target Terpenuhi (≥ 8j 30m)';
        statusLabel = 'Memenuhi Target';
      } else if (row.duration_status === 'BELOW_MINIMUM') {
        durationLabel = 'Kurang Durasi (< 8j 30m)';
        statusLabel = 'Kurang Jam Kerja';
      }

      return {
        id: `ATT-${row.id}`,
        rawId: row.id,
        user_id: row.user_id,
        employeeId: row.employee_code || `EMP-${row.user_id}`,
        employeeName: row.full_name || 'Karyawan',
        email: row.email,
        date: checkInParts[0] || row.date || '-',
        checkIn: checkInTime,
        checkOut: checkOutTime,
        minCheckOut,
        workDuration: row.elapsed_minutes ? `${Math.floor(row.elapsed_minutes / 60)} jam ${row.elapsed_minutes % 60} menit` : '-',
        durationStatus: row.duration_status,
        durationLabel,
        status: row.duration_status,
        statusLabel,
        notes: row.notes,
        coordinates: {
          latitude: row.check_in_latitude,
          longitude: row.check_in_longitude,
          accuracy_m: row.check_in_accuracy_m,
        },
        photoCaptured: Boolean(row.check_in_selfie_path),
      };
    });

    return {
      data: items,
      meta: res.meta || {},
      error: null,
    };
  },

  /**
   * Detail Sesi Absensi Tertentu
   */
  getAttendanceDetail: async (id) => {
    const rawId = String(id).replace('ATT-', '');
    const res = await apiClient.get(`/attendance/${rawId}`);
    if (res.data && res.data.session) {
      return { data: res.data.session, meta: res.meta, error: null };
    }
    return res;
  },

  /**
   * Mengambil Dashboard Karyawan dari API
   */
  getEmployeeDashboard: async () => {
    return apiClient.get('/dashboard/employee');
  },

  /**
   * Mengambil Dashboard Admin dari API
   */
  getAdminDashboard: async () => {
    return apiClient.get('/dashboard/admin');
  },

  /**
   * Mengambil Permohonan Koreksi Absensi
   */
  getCorrections: async (filters = {}) => {
    const query = new URLSearchParams();
    if (filters.page) query.append('page', filters.page);
    if (filters.limit) query.append('limit', filters.limit);
    if (filters.status && filters.status !== 'ALL') query.append('status', filters.status);

    return apiClient.get(`/attendance/corrections?${query.toString()}`);
  },

  /**
   * Mengajukan Koreksi Absensi (Karyawan)
   */
  requestCorrection: async (payload) => {
    const { attendance_session_id, reason, proposed_check_in_at, proposed_check_out_at } = payload;
    const rawSessionId = typeof attendance_session_id === 'string'
      ? parseInt(attendance_session_id.replace('ATT-', ''), 10)
      : attendance_session_id;

    return apiClient.post('/attendance/corrections', {
      attendance_session_id: rawSessionId,
      reason,
      proposed_check_in_at: proposed_check_in_at || null,
      proposed_check_out_at: proposed_check_out_at || null,
    });
  },

  /**
   * Meninjau Koreksi Absensi (Admin Approve / Reject)
   */
  reviewCorrection: async (correctionId, status, note) => {
    return apiClient.patch(`/attendance/corrections/${correctionId}/review`, {
      status, // 'APPROVED' | 'REJECTED'
      note: note || '',
    });
  },
};
