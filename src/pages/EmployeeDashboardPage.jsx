import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { DashboardSkeleton } from '../components/common/Skeleton';
import { AttendanceVerificationModal } from '../components/attendance/AttendanceVerificationModal';
import { attendanceApi } from '../services/attendanceApi';
import {
  MOCK_WORK_SCHEDULE,
  MOCK_ATTENDANCE_HISTORY,
} from '../data/mockData';
import {
  calculateMinCheckOutTime,
  evaluateWorkDuration,
  formatDurationHuman,
  getCurrentWIBString,
} from '../utils/timeUtils';
import {
  IconCamera,
  IconClock,
  IconMapPin,
  IconCheckCircle,
  IconCalendar,
  IconChevronRight,
  IconUser,
  IconAlertCircle,
} from '../components/common/Icons';

export const EmployeeDashboardPage = () => {
  const { currentUser } = useAuth();
  const { navigateTo } = useNavigation();

  const [isLoadingData, setIsLoadingData] = useState(false);
  const [liveCurrentTime, setLiveCurrentTime] = useState(getCurrentWIBString);
  const [todayStatus, setTodayStatus] = useState({
    status: 'BELUM_ABSEN', // 'BELUM_ABSEN' | 'SUDAH_MASUK' | 'SELESAI'
    checkInTime: null,
    checkOutTime: null,
    minCheckOutTime: null,
    workDuration: null,
    durationStatus: null,
    durationLabel: null,
  });

  // Timer pembaruan waktu berjalan setiap 5 detik
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveCurrentTime(getCurrentWIBString());
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const [verificationModal, setVerificationModal] = useState({
    isOpen: false,
    actionType: 'CHECK_IN', // 'CHECK_IN' | 'CHECK_OUT'
  });

  const [historyList, setHistoryList] = useState(MOCK_ATTENDANCE_HISTORY);

  // Ambil status absensi hari ini saat mount
  useEffect(() => {
    const fetchToday = async () => {
      const res = await attendanceApi.getTodayStatus(currentUser?.id || 'EMP-001');
      if (res.data) {
        setTodayStatus(res.data);
      }
    };
    fetchToday();
  }, [currentUser]);

  // Handler buka modal absensi live
  const handleOpenVerification = (actionType) => {
    setVerificationModal({
      isOpen: true,
      actionType,
    });
  };

  // Handler saat absensi sukses dikirim
  const handleAttendanceSuccess = (transaction) => {
    if (transaction.type === 'CHECK_IN') {
      setTodayStatus((prev) => ({
        ...prev,
        status: 'SUDAH_MASUK',
        checkInTime: transaction.checkIn,
      }));
    } else {
      setTodayStatus((prev) => ({
        ...prev,
        status: 'SELESAI',
        checkOutTime: transaction.checkOut,
      }));
    }

    // Tambahkan transaksi baru ke riwayat teratas
    setHistoryList((prev) => [transaction, ...prev]);
  };

  const handleRefreshData = () => {
    setIsLoadingData(true);
    setTimeout(() => {
      setIsLoadingData(false);
    }, 400);
  };

  // Reset status simulasi hari ini agar memudahkan pengujian berulang
  const handleResetToday = () => {
    sessionStorage.removeItem(`mandala_attendance_today_${currentUser?.id || 'EMP-001'}`);
    setTodayStatus({
      status: 'BELUM_ABSEN',
      checkInTime: null,
      checkOutTime: null,
      minCheckOutTime: null,
      workDuration: null,
      durationStatus: null,
      durationLabel: null,
    });
  };

  const recentHistory = historyList.slice(0, 3);

  if (isLoadingData) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn">
      {/* Modal Verifikasi Absensi Kamera Live & GPS (Fase 3) */}
      <AttendanceVerificationModal
        isOpen={verificationModal.isOpen}
        onClose={() => setVerificationModal({ ...verificationModal, isOpen: false })}
        actionType={verificationModal.actionType}
        employee={currentUser}
        checkInTime={todayStatus.checkInTime}
        onSuccess={handleAttendanceSuccess}
      />

      {/* Greeting & Header Tanggal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Halo, {currentUser.name}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {currentUser.department} • ID: {currentUser.id}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="primary" size="md">
            <IconCalendar className="w-3.5 h-3.5 mr-1" />
            Senin, 12 Oktober 2026
          </Badge>
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleOpenVerification(todayStatus.status === 'SUDAH_MASUK' ? 'CHECK_OUT' : 'CHECK_IN')}
            title="Buka dan aktifkan kamera live serta deteksi lokasi GPS sekarang"
            icon={IconCamera}
          >
            Aktifkan Kamera & GPS
          </Button>
          {todayStatus.status !== 'BELUM_ABSEN' && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetToday}
              title="Reset status hari ini untuk mencoba ulang absensi"
            >
              Reset Simulasi
            </Button>
          )}
        </div>
      </div>

      {/* Status Hari Ini & Tombol Aksi Utama */}
      <Card className="border-blue-100 bg-gradient-to-br from-white to-blue-50/30 shadow-card">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-blue-100/80">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-semibold tracking-wider uppercase text-blue-600 block">
                Status Kehadiran Hari Ini
              </span>
              <Badge variant="primary" size="xs">
                Minimal Kerja: 8 Jam 30 Menit
              </Badge>
            </div>

            {/* Status: Belum Absen */}
            {todayStatus.status === 'BELUM_ABSEN' && (
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-400 animate-pulse"></span>
                  <h2 className="text-lg font-bold text-slate-900">
                    Belum Melakukan Absen Masuk
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Absen masuk bebas jam berapapun. Target minimal absen pulang adalah <strong>8 jam 30 menit</strong> setelah jam absen masuk Anda.
                </p>
              </div>
            )}

            {/* Status: Sudah Absen Masuk */}
            {todayStatus.status === 'SUDAH_MASUK' && (
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                  <h2 className="text-base sm:text-lg font-bold text-emerald-800">
                    Sudah Masuk: {todayStatus.checkInTime}
                  </h2>
                  <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                    Target Pulang Min: {todayStatus.minCheckOutTime || calculateMinCheckOutTime(todayStatus.checkInTime)}
                  </span>
                </div>

                {/* Indikator Evaluasi Durasi Berjalan */}
                {(() => {
                  const evalRun = evaluateWorkDuration(todayStatus.checkInTime, liveCurrentTime);
                  const progressPct = Math.min(100, Math.round((evalRun.durationMinutes / 510) * 100));
                  return (
                    <div className="pt-1 max-w-lg">
                      <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                        <span>Durasi Kerja Berjalan: <strong>{evalRun.durationFormatted}</strong></span>
                        <span className={`font-semibold ${evalRun.targetMet ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {evalRun.targetMet ? 'Target Terpenuhi ✓' : `${progressPct}% (Target: 8j 30m)`}
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            evalRun.targetMet ? 'bg-emerald-500' : 'bg-blue-600'
                          }`}
                          style={{ width: `${progressPct}%` }}
                        ></div>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        {evalRun.targetMet ? (
                          <span className="text-emerald-700 font-medium">
                            ✅ Anda telah memenuhi batas minimal kerja 8 jam 30 menit (+{formatDurationHuman(evalRun.diffMinutes)}).
                          </span>
                        ) : (
                          <span className="text-amber-700 font-medium">
                            ⚠️ Durasi kerja saat ini masih kurang {formatDurationHuman(evalRun.diffMinutes)} dari batas minimal 8 jam 30 menit.
                          </span>
                        )}
                      </p>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Status: Selesai */}
            {todayStatus.status === 'SELESAI' && (
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-600"></span>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    Absensi Selesai ({todayStatus.checkInTime} – {todayStatus.checkOutTime})
                  </h2>
                  {(() => {
                    const evalFinished = evaluateWorkDuration(todayStatus.checkInTime, todayStatus.checkOutTime);
                    return (
                      <Badge variant={evalFinished.badgeVariant} size="sm">
                        {evalFinished.statusLabel}
                      </Badge>
                    );
                  })()}
                </div>

                {(() => {
                  const evalFinished = evaluateWorkDuration(todayStatus.checkInTime, todayStatus.checkOutTime);
                  return (
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 max-w-lg">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-slate-500">Total Durasi Kerja:</span>
                        <strong className="font-mono text-slate-900">{evalFinished.durationFormatted}</strong>
                      </div>
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-500">Keterangan Evaluasi:</span>
                        <span className={evalFinished.targetMet ? 'text-emerald-700 font-semibold' : 'text-rose-700 font-semibold'}>
                          {evalFinished.keterangan}
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          {/* Tombol Aksi Masuk / Pulang (Interaktif Fase 3) */}
          <div className="w-full md:w-auto flex flex-col sm:flex-row gap-2.5">
            {/* Tombol Absen Masuk */}
            <Button
              variant={todayStatus.status === 'BELUM_ABSEN' ? 'primary' : 'outline'}
              size="lg"
              className={`flex-1 sm:flex-none justify-center ${
                todayStatus.status === 'BELUM_ABSEN' ? 'shadow-float' : 'opacity-70'
              }`}
              disabled={todayStatus.status !== 'BELUM_ABSEN'}
              onClick={() => handleOpenVerification('CHECK_IN')}
              icon={todayStatus.status !== 'BELUM_ABSEN' ? IconCheckCircle : IconCamera}
            >
              {todayStatus.status === 'BELUM_ABSEN'
                ? 'Absen Masuk (Live)'
                : `Masuk: ${todayStatus.checkInTime}`}
            </Button>

            {/* Tombol Absen Pulang */}
            <Button
              variant={todayStatus.status === 'SUDAH_MASUK' ? 'primary' : 'outline'}
              size="lg"
              className={`flex-1 sm:flex-none justify-center ${
                todayStatus.status === 'SUDAH_MASUK' ? 'shadow-float bg-indigo-600 hover:bg-indigo-700 text-white' : 'text-slate-400 border-slate-200'
              }`}
              disabled={todayStatus.status !== 'SUDAH_MASUK'}
              onClick={() => handleOpenVerification('CHECK_OUT')}
              icon={todayStatus.status === 'SELESAI' ? IconCheckCircle : IconClock}
            >
              {todayStatus.status === 'SELESAI'
                ? `Pulang: ${todayStatus.checkOutTime}`
                : 'Absen Pulang (Live)'}
            </Button>
          </div>
        </div>

        {/* Ringkasan Parameter Kebijakan 8 Jam 30 Menit */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 text-xs">
          <div className="p-3 rounded-xl bg-white border border-slate-200/80">
            <div className="flex items-center gap-2 text-slate-500 mb-1">
              <IconClock className="w-4 h-4 text-blue-600" />
              <span className="font-semibold text-slate-700">Aturan Jam Kerja</span>
            </div>
            <p className="font-bold text-slate-900">Minimal 8 Jam 30 Menit</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Absen masuk fleksibel di jam berapapun</p>
          </div>

          <div className="p-3 rounded-xl bg-white border border-slate-200/80">
            <div className="flex items-center gap-2 text-slate-500 mb-1">
              <IconMapPin className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold text-slate-700">Perekaman GPS</span>
            </div>
            <p className="font-medium text-emerald-700 flex items-center gap-1">
              <IconCheckCircle className="w-3.5 h-3.5" />
              Aktif (Tanpa Geofence)
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Koordinat dicatat ke transaksi</p>
          </div>

          <div className="p-3 rounded-xl bg-white border border-slate-200/80">
            <div className="flex items-center gap-2 text-slate-500 mb-1">
              <IconCheckCircle className="w-4 h-4 text-blue-600" />
              <span className="font-semibold text-slate-700">Evaluasi Pulang</span>
            </div>
            <p className="font-medium text-blue-700">Kurang / Lebih 8j 30m</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Tercatat otomatis pada laporan</p>
          </div>
        </div>
      </Card>

      {/* Riwayat Absensi Terakhir */}
      <Card
        title="Riwayat Kehadiran Terbaru"
        subtitle="3 transaksi absensi terakhir Anda"
        action={
          <button
            onClick={() => navigateTo('history')}
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            <span>Lihat Semua</span>
            <IconChevronRight className="w-3.5 h-3.5" />
          </button>
        }
      >
        <div className="divide-y divide-slate-100">
          {recentHistory.map((item) => (
            <div
              key={item.id}
              className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <IconCheckCircle className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900">
                      {item.date}
                    </span>
                    <Badge
                      variant={
                        item.status === 'TEPAT_WAKTU' ? 'success' : 'warning'
                      }
                      size="sm"
                    >
                      {item.statusLabel}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                    <span>Masuk: {item.checkIn || '-'}</span>
                    <span>•</span>
                    <span>Pulang: {item.checkOut || '-'}</span>
                  </div>
                </div>
              </div>

              <div className="text-left sm:text-right pl-12 sm:pl-0">
                <span className="text-[11px] font-mono text-slate-400 block">
                  GPS: {item.coordinates.latitude}, {item.coordinates.longitude}
                </span>
                <span className="text-[10px] text-emerald-600 block">
                  Akurasi: ±{item.coordinates.accuracy_m}m • Server Recorded
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
