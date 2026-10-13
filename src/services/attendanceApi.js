/**
 * attendanceApi.js — Adapter Layanan Absensi (SOT v0.2)
 * Mensimulasikan endpoint REST API:
 * - POST /api/v1/attendance/check-in
 * - POST /api/v1/attendance/check-out
 * - GET  /api/v1/attendance/today
 * 
 * Mengikuti konvensi respons: { data, meta, error }
 */

import { MOCK_ATTENDANCE_HISTORY } from '../data/mockData';
import { apiClient } from './apiClient';
import {
  calculateMinCheckOutTime,
  evaluateWorkDuration,
  MIN_WORK_MINUTES_TOTAL,
} from '../utils/timeUtils';

const STORAGE_KEY_TODAY = 'mandala_attendance_today';
const STORAGE_KEY_HISTORY = 'mandala_attendance_history';

export const attendanceApi = {
  /**
   * Mengambil status absensi hari ini untuk karyawan aktif
   */
  getTodayStatus: async (employeeId) => {
    // Mode REST API Backend Riil
    if (!apiClient.isMockMode()) {
      return apiClient.get(`/attendance/today?employee_id=${employeeId}`);
    }

    // Simulasi delay 200ms
    await new Promise((r) => setTimeout(r, 200));

    try {
      const stored = sessionStorage.getItem(`${STORAGE_KEY_TODAY}_${employeeId}`);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      // fallback
    }

    return {
      data: {
        employeeId,
        date: new Date().toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
        status: 'BELUM_ABSEN', // 'BELUM_ABSEN' | 'SUDAH_MASUK' | 'SELESAI'
        checkInTime: null,
        checkOutTime: null,
        minCheckOutTime: null,
        workDuration: null,
        durationStatus: null,
        durationLabel: null,
        lastTransaction: null,
      },
      meta: { timestamp: new Date().toISOString() },
      error: null,
    };
  },

  /**
   * Kirim Absen Masuk (Check-in)
   * Karyawan dapat absen masuk jam berapapun. Target absen pulang = masuk + 8 jam 30 menit.
   */
  submitCheckIn: async (payload) => {
    await new Promise((r) => setTimeout(r, 450));

    const { photoBlob, latitude, longitude, accuracy_m, employeeId, employeeName } = payload;

    // Validasi SOT API-spec
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

    // Mode REST API Backend Riil
    if (!apiClient.isMockMode()) {
      const formData = new FormData();
      formData.append('photo', photoBlob, 'selfie.jpg');
      formData.append('latitude', latitude);
      formData.append('longitude', longitude);
      formData.append('accuracy_m', accuracy_m);
      formData.append('employee_id', employeeId);
      formData.append('idempotency_key', payload.idempotency_key || `idmp_${Date.now()}`);
      formData.append('captured_at_client', payload.captured_at_client || new Date().toISOString());
      return apiClient.postMultipart('/attendance/check-in', formData);
    }

    const now = new Date();
    const timeString = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')} WIB`;

    // Hitung target jam pulang minimal: Jam Masuk + 8 Jam 30 Menit
    const minCheckOutTime = calculateMinCheckOutTime(timeString, MIN_WORK_MINUTES_TOTAL);

    const transaction = {
      id: `ATT-${Date.now().toString().slice(-8)}`,
      type: 'CHECK_IN',
      employeeId: employeeId || 'EMP-001',
      employeeName: employeeName || 'Budi Pratama',
      date: now.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      checkIn: timeString,
      checkOut: null,
      minCheckOutTime,
      status: 'MASUK_TERCATAT',
      statusLabel: `Tercatat (Min. Pulang: ${minCheckOutTime})`,
      coordinates: {
        latitude,
        longitude,
        accuracy_m: accuracy_m || 10,
      },
      locationNote: 'Koordinat GPS dicatat di sistem (SOT v0.2)',
      photoCaptured: true,
      capturedAtClient: payload.captured_at_client || new Date().toISOString(),
      idempotencyKey: payload.idempotency_key || `idmp_${Date.now()}`,
      serverRecordedAt: new Date().toISOString(),
    };

    // Simpan status baru hari ini ke sessionStorage
    const todayState = {
      data: {
        employeeId,
        date: transaction.date,
        status: 'SUDAH_MASUK',
        checkInTime: timeString,
        checkOutTime: null,
        minCheckOutTime,
        workDuration: null,
        durationStatus: null,
        durationLabel: null,
        lastTransaction: transaction,
      },
      meta: { timestamp: new Date().toISOString() },
      error: null,
    };

    try {
      sessionStorage.setItem(`${STORAGE_KEY_TODAY}_${employeeId}`, JSON.stringify(todayState));
      // Simpan riwayat transaksi absensi ke localStorage
      const existingHistory = JSON.parse(localStorage.getItem(STORAGE_KEY_HISTORY) || '[]');
      const newEntry = {
        id: transaction.id,
        employeeId: transaction.employeeId,
        employeeName: transaction.employeeName,
        date: transaction.date,
        checkIn: transaction.checkIn,
        checkOut: '-',
        minCheckOut: minCheckOutTime,
        workDuration: '-',
        status: transaction.status,
        statusLabel: transaction.statusLabel,
        coordinates: transaction.coordinates,
        photoUrl: payload.photoPreviewUrl || null,
        capturedAtClient: transaction.capturedAtClient,
      };
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify([newEntry, ...existingHistory]));
    } catch (e) {
      // ignore
    }

    return {
      data: transaction,
      meta: { message: `Absen masuk berhasil. Minimal absen pulang: ${minCheckOutTime}` },
      error: null,
    };
  },

  /**
   * Kirim Absen Pulang (Check-out)
   * Mengevaluasi apakah durasi kerja kurang atau lebih dari 8 jam 30 menit.
   */
  submitCheckOut: async (payload) => {
    await new Promise((r) => setTimeout(r, 450));

    const { photoBlob, latitude, longitude, accuracy_m, employeeId, employeeName } = payload;

    if (!photoBlob) {
      return {
        data: null,
        meta: {},
        error: {
          code: 'CAMERA_REQUIRED',
          message: 'Foto swafoto kamera live wajib disertakan saat absen pulang.',
        },
      };
    }

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

    // Mode REST API Backend Riil
    if (!apiClient.isMockMode()) {
      const formData = new FormData();
      formData.append('photo', photoBlob, 'selfie.jpg');
      formData.append('latitude', latitude);
      formData.append('longitude', longitude);
      formData.append('accuracy_m', accuracy_m);
      formData.append('employee_id', employeeId);
      formData.append('idempotency_key', payload.idempotency_key || `idmp_${Date.now()}`);
      formData.append('captured_at_client', payload.captured_at_client || new Date().toISOString());
      return apiClient.postMultipart('/attendance/check-out', formData);
    }

    const now = new Date();
    const timeString = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')} WIB`;

    // Ambil jam absen masuk efektif
    let effectiveCheckIn = payload.existingCheckInTime;
    if (!effectiveCheckIn) {
      try {
        const stored = sessionStorage.getItem(`${STORAGE_KEY_TODAY}_${employeeId}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          effectiveCheckIn = parsed?.data?.checkInTime;
        }
      } catch (e) {
        // ignore
      }
    }
    if (!effectiveCheckIn) {
      effectiveCheckIn = '08:00:00 WIB';
    }

    // Evaluasi durasi kerja terhadap batas minimal 8 jam 30 menit
    const evaluation = evaluateWorkDuration(effectiveCheckIn, timeString, MIN_WORK_MINUTES_TOTAL);
    const minCheckOutTime = calculateMinCheckOutTime(effectiveCheckIn, MIN_WORK_MINUTES_TOTAL);

    const transaction = {
      id: `ATT-${Date.now().toString().slice(-8)}`,
      type: 'CHECK_OUT',
      employeeId: employeeId || 'EMP-001',
      employeeName: employeeName || 'Budi Pratama',
      date: now.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      checkIn: effectiveCheckIn,
      checkOut: timeString,
      minCheckOutTime,
      workDuration: evaluation.durationFormatted,
      durationStatus: evaluation.status,
      durationLabel: evaluation.statusLabel,
      keterangan: evaluation.keterangan,
      status: evaluation.status,
      statusLabel: evaluation.statusLabel,
      coordinates: {
        latitude,
        longitude,
        accuracy_m: accuracy_m || 10,
      },
      photoCaptured: true,
      capturedAtClient: payload.captured_at_client || new Date().toISOString(),
      idempotencyKey: payload.idempotency_key || `idmp_${Date.now()}`,
      serverRecordedAt: new Date().toISOString(),
    };

    const todayState = {
      data: {
        employeeId,
        date: transaction.date,
        status: 'SELESAI',
        checkInTime: effectiveCheckIn,
        checkOutTime: timeString,
        minCheckOutTime,
        workDuration: evaluation.durationFormatted,
        durationStatus: evaluation.status,
        durationLabel: evaluation.statusLabel,
        keterangan: evaluation.keterangan,
        lastTransaction: transaction,
      },
      meta: { timestamp: new Date().toISOString() },
      error: null,
    };

    try {
      sessionStorage.setItem(`${STORAGE_KEY_TODAY}_${employeeId}`, JSON.stringify(todayState));
      // Perbarui riwayat transaksi di localStorage
      const existingHistory = JSON.parse(localStorage.getItem(STORAGE_KEY_HISTORY) || '[]');
      const index = existingHistory.findIndex((h) => h.employeeId === employeeId && h.date === transaction.date);
      if (index >= 0) {
        existingHistory[index].checkIn = effectiveCheckIn;
        existingHistory[index].checkOut = timeString;
        existingHistory[index].minCheckOut = minCheckOutTime;
        existingHistory[index].workDuration = evaluation.durationFormatted;
        existingHistory[index].durationStatus = evaluation.status;
        existingHistory[index].durationLabel = evaluation.statusLabel;
        existingHistory[index].keterangan = evaluation.keterangan;
        existingHistory[index].status = evaluation.status;
        existingHistory[index].statusLabel = evaluation.statusLabel;
        if (payload.photoPreviewUrl && !existingHistory[index].photoUrl) {
          existingHistory[index].photoUrl = payload.photoPreviewUrl;
        }
      } else {
        existingHistory.unshift({
          id: transaction.id,
          employeeId: transaction.employeeId,
          employeeName: transaction.employeeName,
          date: transaction.date,
          checkIn: effectiveCheckIn,
          checkOut: timeString,
          minCheckOut: minCheckOutTime,
          workDuration: evaluation.durationFormatted,
          durationStatus: evaluation.status,
          durationLabel: evaluation.statusLabel,
          keterangan: evaluation.keterangan,
          status: evaluation.status,
          statusLabel: evaluation.statusLabel,
          coordinates: transaction.coordinates,
          photoUrl: payload.photoPreviewUrl || null,
          capturedAtClient: transaction.capturedAtClient,
        });
      }
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(existingHistory));
    } catch (e) {
      // ignore
    }

    return {
      data: transaction,
      meta: { message: `Absen pulang berhasil. Durasi kerja: ${evaluation.durationFormatted} (${evaluation.keterangan})` },
      error: null,
    };
  },

  /**
   * Mengambil riwayat absensi gabungan (mock + dynamic storage)
   */
  getAttendanceHistory: async (filters = {}) => {
    // Mode REST API Backend Riil
    if (!apiClient.isMockMode()) {
      const queryParams = new URLSearchParams();
      if (filters.employeeId) queryParams.append('employee_id', filters.employeeId);
      if (filters.status && filters.status !== 'ALL') queryParams.append('status', filters.status);
      if (filters.search) queryParams.append('search', filters.search);
      return apiClient.get(`/attendance/history?${queryParams.toString()}`);
    }

    await new Promise((r) => setTimeout(r, 120));
    let customHistory = [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY_HISTORY);
      if (stored) customHistory = JSON.parse(stored);
    } catch (e) {
      customHistory = [];
    }

    let combined = [...customHistory, ...MOCK_ATTENDANCE_HISTORY];

    if (filters.employeeId) {
      combined = combined.filter((item) => item.employeeId === filters.employeeId);
    }
    if (filters.status && filters.status !== 'ALL') {
      combined = combined.filter((item) => item.status === filters.status);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      combined = combined.filter(
        (item) =>
          (item.employeeName && item.employeeName.toLowerCase().includes(q)) ||
          (item.date && item.date.toLowerCase().includes(q)) ||
          (item.id && item.id.toLowerCase().includes(q))
      );
    }

    return {
      data: combined,
      meta: { total: combined.length, timestamp: new Date().toISOString() },
      error: null,
    };
  },
};
