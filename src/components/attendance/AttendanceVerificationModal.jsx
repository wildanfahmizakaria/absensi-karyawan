import React, { useState, useEffect } from 'react';
import { useCamera } from '../../hooks/useCamera';
import { useGeolocation } from '../../hooks/useGeolocation';
import { attendanceApi } from '../../services/attendanceApi';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import {
  IconCamera,
  IconMapPin,
  IconCheckCircle,
  IconAlertCircle,
  IconAlertTriangle,
  IconX,
  IconRefreshCw,
} from '../common/Icons';
import {
  calculateMinCheckOutTime,
  evaluateWorkDuration,
  getCurrentWIBString,
} from '../../utils/timeUtils';

export const AttendanceVerificationModal = ({
  isOpen,
  onClose,
  actionType = 'CHECK_IN', // 'CHECK_IN' | 'CHECK_OUT'
  employee,
  checkInTime,
  onSuccess,
}) => {
  const isCheckIn = actionType === 'CHECK_IN';
  const actionTitle = isCheckIn ? 'Absen Masuk' : 'Absen Pulang';

  // Hook Kamera Live
  const {
    videoRef,
    status: cameraStatus,
    errorMessage: cameraError,
    facingMode,
    startCamera,
    stopCamera,
    toggleFacingMode,
    capturePhoto,
  } = useCamera();

  // Hook Geolokasi GPS
  const {
    coords,
    status: geoStatus,
    errorMessage: geoError,
    getLocation,
    useSimulatedLocation,
  } = useGeolocation();

  // State lokal modal
  const [step, setStep] = useState('CAPTURE'); // 'CAPTURE' | 'CONFIRM' | 'SUBMITTING' | 'SUCCESS'
  const [capturedPhoto, setCapturedPhoto] = useState(null); // { blob, dataUrl }
  const [submitResult, setSubmitResult] = useState(null);
  const [apiError, setApiError] = useState('');

  // Mulai kamera dan deteksi GPS saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      setStep('CAPTURE');
      setCapturedPhoto(null);
      setApiError('');
      setSubmitResult(null);

      // Buka kamera
      startCamera();
      // Ambil GPS
      getLocation();

      // Listener ESC key
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        stopCamera();
      };
    } else {
      stopCamera();
    }
  }, [isOpen, startCamera, stopCamera, getLocation, onClose]);

  // Handler Ambil Foto dari Stream
  const handleTakePhoto = async () => {
    const result = await capturePhoto();
    if (result) {
      setCapturedPhoto(result);
      // Jika GPS belum didapat, coba lagi
      if (!coords) {
        getLocation();
      }
      setStep('CONFIRM');
    }
  };

  // Handler Ambil Ulang
  const handleRetakePhoto = () => {
    setCapturedPhoto(null);
    setStep('CAPTURE');
    startCamera();
  };

  // Handler Kirim Transaksi
  const handleSubmitAttendance = async () => {
    if (!capturedPhoto || !capturedPhoto.blob) {
      setApiError('Foto swafoto kamera live belum berhasil diambil.');
      return;
    }

    // Pastikan koordinat ada (jika di browser PC tanpa GPS, gunakan fallback jika perlu)
    let activeCoords = coords;
    if (!activeCoords) {
      activeCoords = useSimulatedLocation();
    }

    setStep('SUBMITTING');
    setApiError('');

    try {
      const payload = {
        photoBlob: capturedPhoto.blob,
        latitude: activeCoords.latitude,
        longitude: activeCoords.longitude,
        accuracy_m: activeCoords.accuracy_m,
        employeeId: employee?.id || 'EMP-001',
        employeeName: employee?.name || 'Budi Pratama',
        captured_at_client: new Date().toISOString(),
        idempotency_key: `idmp_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        photoPreviewUrl: capturedPhoto.dataUrl,
      };

      const res = isCheckIn
        ? await attendanceApi.submitCheckIn(payload)
        : await attendanceApi.submitCheckOut(payload);

      if (res.error) {
        setApiError(res.error.message || 'Gagal mengirim transaksi absensi.');
        setStep('CONFIRM');
      } else {
        setSubmitResult(res.data);
        setStep('SUCCESS');
        stopCamera();
        if (onSuccess) {
          onSuccess(res.data);
        }
      }
    } catch (err) {
      setApiError(err.message || 'Terjadi kesalahan sistem.');
      setStep('CONFIRM');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-verification-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn overflow-y-auto"
    >
      <div className="bg-white rounded-card max-w-lg w-full p-5 sm:p-6 shadow-float border border-brand-border my-auto">
        {/* Header Modal */}
        <div className="flex items-center justify-between pb-3 border-b border-brand-border mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 id="modal-verification-title" className="text-base sm:text-lg font-bold text-slate-900">
                Verifikasi {actionTitle}
              </h2>
              <Badge variant="success" size="sm">
                SOT v0.2
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              CV Mandala Mahardika • Bukti Swafoto Live & Koordinat GPS
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Tutup modal"
          >
            <IconX className="w-5 h-5" />
          </button>
        </div>

        {/* TAHAP 1: SUKSES */}
        {step === 'SUCCESS' && submitResult && (
          <div className="text-center py-6 space-y-4 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
              <IconCheckCircle className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {actionTitle} Berhasil Dicatat!
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Transaksi kehadiran Anda telah tersimpan resmi pada catatan server
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">ID Transaksi:</span>
                <span className="font-mono font-semibold text-slate-900">{submitResult.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Waktu Tercatat:</span>
                <span className="font-semibold text-blue-700">
                  {submitResult.checkIn || submitResult.checkOut}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status Kehadiran:</span>
                <Badge
                  variant={submitResult.status === 'KURANG' ? 'danger' : 'success'}
                  size="sm"
                >
                  {submitResult.statusLabel}
                </Badge>
              </div>
              {submitResult.workDuration && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Durasi Kerja:</span>
                  <span className="font-semibold text-slate-800">{submitResult.workDuration}</span>
                </div>
              )}
              {submitResult.keterangan && (
                <div className="flex justify-between items-start gap-2">
                  <span className="text-slate-500">Evaluasi 8j 30m:</span>
                  <span className="font-semibold text-slate-800 text-right">{submitResult.keterangan}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">Koordinat GPS:</span>
                <span className="font-mono text-slate-700">
                  {submitResult.coordinates.latitude}, {submitResult.coordinates.longitude}
                </span>
              </div>
            </div>

            <Button variant="primary" size="lg" fullWidth onClick={onClose}>
              Selesai & Kembali ke Beranda
            </Button>
          </div>
        )}

        {/* TAHAP 2: CAPTURE ATAU CONFIRM */}
        {step !== 'SUCCESS' && (
          <div className="space-y-4">
            {/* Banner Evaluasi Durasi Kerja Batas 8 Jam 30 Menit untuk Absen Pulang */}
            {!isCheckIn && (() => {
              const currentWIB = getCurrentWIBString();
              const evalNow = evaluateWorkDuration(checkInTime || '08:00:00 WIB', currentWIB);
              const minTarget = calculateMinCheckOutTime(checkInTime || '08:00:00 WIB');
              return (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                    evalNow.targetMet
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-amber-50 border-amber-200 text-amber-800'
                  }`}
                >
                  <IconClock
                    className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                      evalNow.targetMet ? 'text-emerald-600' : 'text-amber-600'
                    }`}
                  />
                  <div className="flex-1 leading-snug">
                    <span className="font-bold block mb-0.5">
                      {evalNow.targetMet
                        ? 'Target Batas Kerja 8 Jam 30 Menit Terpenuhi ✓'
                        : 'Peringatan: Durasi Kerja Belum Mencapai Batas Minimal'}
                    </span>
                    <p className="text-[11px]">
                      Jam Masuk: <strong>{checkInTime || '08:00 WIB'}</strong> • Target Pulang Min: <strong>{minTarget}</strong>
                    </p>
                    <p className="text-[11px] mt-0.5">
                      Durasi saat ini: <strong>{evalNow.durationFormatted}</strong> ({evalNow.keterangan}).
                    </p>
                  </div>
                </div>
              );
            })()}

            {apiError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                <IconAlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
                <span>{apiError}</span>
              </div>
            )}

            {/* Video Viewport / Photo Preview */}
            <div className="relative w-full aspect-[4/3] bg-slate-950 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center border border-slate-800">
              {/* Jika masih dalam mode CAPTURE */}
              {step === 'CAPTURE' && (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover ${
                      facingMode === 'user' ? 'scale-x-[-1]' : ''
                    }`}
                  />

                  {/* Panduan Bingkai Wajah (Face Guide Oval) */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-48 h-60 border-2 border-white/60 border-dashed rounded-full shadow-lg"></div>
                    <span className="absolute bottom-3 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-[11px] font-medium tracking-wide">
                      Posisikan wajah Anda di dalam oval
                    </span>
                  </div>

                  {/* Tombol Balik Kamera (Depan / Belakang) */}
                  <button
                    type="button"
                    onClick={toggleFacingMode}
                    className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white p-2 rounded-xl text-xs backdrop-blur-sm transition-colors flex items-center gap-1.5"
                    title="Ganti kamera depan / belakang"
                  >
                    <IconCamera className="w-4 h-4" />
                    <span className="text-[10px]">Balik</span>
                  </button>

                  {/* Indikator Status Kamera */}
                  {cameraStatus === 'requesting' && (
                    <div className="absolute inset-0 bg-slate-900/80 flex flex-col items-center justify-center text-white text-xs gap-2">
                      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      <span>Mengaktifkan kamera live...</span>
                    </div>
                  )}

                  {cameraStatus === 'denied' && (
                    <div className="absolute inset-0 bg-slate-900/90 p-5 flex flex-col items-center justify-center text-center text-white gap-3">
                      <IconAlertTriangle className="w-8 h-8 text-amber-400" />
                      <p className="text-xs text-slate-200">{cameraError}</p>
                      <Button variant="secondary" size="sm" onClick={() => startCamera()}>
                        Coba Lagi Buka Kamera
                      </Button>
                    </div>
                  )}

                  {cameraStatus === 'error' && (
                    <div className="absolute inset-0 bg-slate-900/90 p-5 flex flex-col items-center justify-center text-center text-white gap-3">
                      <IconAlertCircle className="w-8 h-8 text-rose-400" />
                      <p className="text-xs text-slate-200">{cameraError}</p>
                      <Button variant="secondary" size="sm" onClick={() => startCamera()}>
                        Ulangi
                      </Button>
                    </div>
                  )}
                </>
              )}

              {/* Jika dalam mode CONFIRM (Preview Hasil Foto) */}
              {step !== 'CAPTURE' && capturedPhoto && (
                <div className="w-full h-full relative">
                  <img
                    src={capturedPhoto.dataUrl}
                    alt="Swafoto Live"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-emerald-600/90 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 shadow-md">
                    <IconCheckCircle className="w-3.5 h-3.5" />
                    <span>Swafoto Diambil dari Stream</span>
                  </div>
                </div>
              )}
            </div>

            {/* Status Rekaman Geolokasi GPS */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                  <IconMapPin className="w-4 h-4 text-primary" />
                  <span>Status Lokasi GPS:</span>
                </div>
                {geoStatus === 'locating' && (
                  <span className="text-blue-600 flex items-center gap-1 font-medium">
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
                    Mencari koordinat...
                  </span>
                )}
                {geoStatus === 'success' && coords && (
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <IconCheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    Koordinat Siap Direkam
                  </span>
                )}
                {geoStatus === 'error' && (
                  <button
                    onClick={() => getLocation()}
                    className="text-rose-600 hover:underline font-medium"
                  >
                    Coba Lagi
                  </button>
                )}
              </div>

              {coords ? (
                <div className="font-mono text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span>Lat: {coords.latitude}, Lng: {coords.longitude}</span>
                  <span className="text-emerald-600 font-sans font-medium">
                    Akurasi: ±{coords.accuracy_m}m {coords.isSimulated ? '(Simulasi PC)' : '(GPS)'}
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>{geoError || 'Sensor GPS perangkat sedang disinkronkan...'}</span>
                  <button
                    type="button"
                    onClick={useSimulatedLocation}
                    className="text-primary hover:underline text-[10px] ml-2"
                    title="Gunakan koordinat acuan jika di perangkat komputer tanpa sensor GPS"
                  >
                    [Gunakan Koordinat PC]
                  </button>
                </div>
              )}

              <p className="text-[10px] text-slate-400">
                *Sesuai SOT v0.2: Perekaman GPS wajib tanpa batasan radius kantor. Koordinat dicatat sebagai bukti otentik kehadiran.
              </p>
            </div>

            {/* Tombol Kontrol Aksi */}
            <div className="pt-2">
              {step === 'CAPTURE' && (
                <div className="flex gap-2.5">
                  <Button
                    variant="outline"
                    size="lg"
                    className="flex-1"
                    onClick={onClose}
                  >
                    Batal
                  </Button>
                  <Button
                    variant="primary"
                    size="lg"
                    className="flex-2 shadow-float"
                    disabled={cameraStatus !== 'active'}
                    onClick={handleTakePhoto}
                    icon={IconCamera}
                  >
                    Ambil Swafoto
                  </Button>
                </div>
              )}

              {step === 'CONFIRM' && (
                <div className="flex gap-2.5">
                  <Button
                    variant="outline"
                    size="lg"
                    className="flex-1"
                    onClick={handleRetakePhoto}
                  >
                    Ambil Ulang
                  </Button>
                  <Button
                    variant="primary"
                    size="lg"
                    className="flex-2 shadow-float"
                    onClick={handleSubmitAttendance}
                    icon={IconCheckCircle}
                  >
                    Konfirmasi & Kirim Absen
                  </Button>
                </div>
              )}

              {step === 'SUBMITTING' && (
                <Button variant="primary" size="lg" fullWidth disabled>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                  Memverifikasi & Menyimpan Transaksi ke Server...
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
