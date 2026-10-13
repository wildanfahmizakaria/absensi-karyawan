import React, { useState } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { DashboardSkeleton } from '../components/common/Skeleton';
import {
  MOCK_ADMIN_SUMMARY,
  MOCK_WORK_SCHEDULE,
} from '../data/mockData';
import {
  IconUsers,
  IconCheckCircle,
  IconAlertTriangle,
  IconClock,
  IconDownload,
  IconFilter,
  IconMapPin,
} from '../components/common/Icons';

export const AdminDashboardPage = () => {
  const { navigateTo } = useNavigation();

  const [isLoadingData, setIsLoadingData] = useState(false);
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    phase: '',
    message: '',
  });

  const handleExportCsvClick = () => {
    setModalState({
      isOpen: true,
      title: 'Ekspor CSV Laporan — Belum Aktif',
      phase: 'Fase 5 (Laporan & Ekspor)',
      message:
        'Fitur pembuatan dan pengunduhan berkas CSV (kompatibel Excel) dijadwalkan pada Fase 5. Data saat ini merupakan pratinjau antarmuka Fase 2.',
    });
  };

  const handleRefreshData = () => {
    setIsLoadingData(true);
    setTimeout(() => {
      setIsLoadingData(false);
    }, 450);
  };

  if (isLoadingData) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fadeIn">
      {/* Modal Notifikasi */}
      <Modal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        title={modalState.title}
        phase={modalState.phase}
        message={modalState.message}
      />

      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Dashboard Operasional Admin
            </h1>
            <Badge variant="mock" size="sm">
              Mock Data
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Monitoring kehadiran harian CV Mandala Mahardika • {MOCK_WORK_SCHEDULE.type}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="md"
            onClick={handleRefreshData}
            title="Segarkan data KPI"
          >
            Segarkan
          </Button>
          <Button
            variant="outline"
            size="md"
            icon={IconUsers}
            onClick={() => navigateTo('employees')}
          >
            Kelola Karyawan
          </Button>
          <Button
            variant="outline"
            size="md"
            icon={IconDownload}
            onClick={handleExportCsvClick}
          >
            Ekspor CSV
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={IconFilter}
            onClick={() => navigateTo('reports')}
          >
            Laporan
          </Button>
        </div>
      </div>

      {/* Kartu Ringkasan KPI Kehadiran */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="bg-white border-blue-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Karyawan
            </span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <IconUsers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900">
              {MOCK_ADMIN_SUMMARY.totalEmployees}
            </span>
            <span className="text-xs text-slate-400">orang terdaftar</span>
          </div>
        </Card>

        <Card className="bg-white border-emerald-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Hadir Hari Ini
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <IconCheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-emerald-600">
              {MOCK_ADMIN_SUMMARY.presentCount}
            </span>
            <span className="text-xs text-emerald-600 font-medium">
              ({MOCK_ADMIN_SUMMARY.attendanceRate})
            </span>
          </div>
        </Card>

        <Card className="bg-white border-amber-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Kurang Jam Kerja
            </span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <IconAlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-amber-600">
              {MOCK_ADMIN_SUMMARY.lateCount}
            </span>
            <span className="text-xs text-slate-400">&lt; 8 jam 30 menit</span>
          </div>
        </Card>

        <Card className="bg-white border-rose-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Belum Absen
            </span>
            <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
              <IconClock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-rose-600">
              {MOCK_ADMIN_SUMMARY.absentCount}
            </span>
            <span className="text-xs text-slate-400">per 08:30 WIB</span>
          </div>
        </Card>
      </div>

      {/* Tabel Monitoring Aktivitas Absensi Terkini */}
      <Card
        title="Pemantauan Aktivitas Masuk/Pulang Terkini"
        subtitle="Log kehadiran real-time hari ini (Senin, 12 Oktober 2026)"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-semibold border-b border-brand-border">
              <tr>
                <th className="py-3 px-3">Karyawan</th>
                <th className="py-3 px-3">Divisi</th>
                <th className="py-3 px-3">Aksi</th>
                <th className="py-3 px-3">Waktu</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Koordinat GPS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {MOCK_ADMIN_SUMMARY.recentActivity.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-3 font-medium text-slate-900">
                    {row.name}
                  </td>
                  <td className="py-3 px-3 text-slate-500">{row.department}</td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center gap-1 font-medium text-blue-700">
                      {row.type}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono">{row.time}</td>
                  <td className="py-3 px-3">
                    <Badge
                      variant={
                        row.status === 'Tepat Waktu' ? 'success' : 'warning'
                      }
                      size="sm"
                    >
                      {row.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                    <div className="flex items-center gap-1">
                      <IconMapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{row.coords}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
