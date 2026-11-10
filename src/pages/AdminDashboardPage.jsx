import React, { useState, useEffect } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { DashboardSkeleton } from '../components/common/Skeleton';
import { attendanceApi } from '../services/attendanceApi';
import { reportExportService } from '../services/reportExportService';
import {
  IconUsers,
  IconCheckCircle,
  IconAlertTriangle,
  IconClock,
  IconDownload,
  IconFilter,
  IconMapPin,
  IconShield,
} from '../components/common/Icons';

export const AdminDashboardPage = () => {
  const { navigateTo } = useNavigation();

  const [isLoadingData, setIsLoadingData] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    kpi: {
      total_active_employees: 0,
      checked_in_today: 0,
      currently_working: 0,
      completed_today: 0,
      today_meets_minimum: 0,
      today_below_minimum: 0,
    },
    month_to_date: {
      total_completed_sessions: 0,
      total_hours: '0.0',
      meets_minimum_count: 0,
      below_minimum_count: 0,
    },
    recent_activity: [],
  });
  const [isExporting, setIsExporting] = useState(false);

  const loadData = async () => {
    setIsLoadingData(true);
    try {
      const res = await attendanceApi.getAdminDashboard();
      if (res && res.data) {
        setDashboardData(res.data);
      }
    } catch (err) {
      console.error('Gagal memuat dashboard admin:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleExportCsvClick = async () => {
    setIsExporting(true);
    try {
      await reportExportService.exportCSV();
    } catch (err) {
      alert('Gagal mengunduh berkas CSV: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoadingData) {
    return <DashboardSkeleton />;
  }

  const { kpi, month_to_date, recent_activity } = dashboardData;
  const attendanceRate =
    kpi.total_active_employees > 0
      ? Math.round((kpi.checked_in_today / kpi.total_active_employees) * 100)
      : 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fadeIn">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Dashboard Operasional Admin
            </h1>
            <Badge variant="success" size="sm">
              Live API
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Monitoring kehadiran harian CV Mandala Mahardika • Kebijakan Durasi Fleksibel (Min 8 Jam 30 Menit)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="md"
            onClick={loadData}
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
            disabled={isExporting}
          >
            {isExporting ? 'Mengunduh...' : 'Ekspor CSV'}
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

      {/* Kartu Ringkasan KPI Kehadiran Real */}
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
              {kpi.total_active_employees}
            </span>
            <span className="text-xs text-slate-400">orang aktif</span>
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
              {kpi.checked_in_today}
            </span>
            <span className="text-xs text-emerald-600 font-medium">
              ({attendanceRate}%)
            </span>
          </div>
        </Card>

        <Card className="bg-white border-amber-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Sedang Bertugas
            </span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <IconClock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-amber-600">
              {kpi.currently_working}
            </span>
            <span className="text-xs text-slate-400">karyawan aktif</span>
          </div>
        </Card>

        <Card className="bg-white border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Bulan Berjalan
            </span>
            <div className="p-2 rounded-lg bg-slate-50 text-slate-600">
              <IconShield className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-800">
              {month_to_date.total_completed_sessions}
            </span>
            <span className="text-xs text-slate-400">sesi ({month_to_date.total_hours} jam)</span>
          </div>
        </Card>
      </div>

      {/* Tabel Monitoring Aktivitas Absensi Terkini Real dari API */}
      <Card
        title="Pemantauan Aktivitas Masuk/Pulang Terkini"
        subtitle="Log kehadiran real-time tersinkronisasi dengan server basis data"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-semibold border-b border-brand-border">
              <tr>
                <th className="py-3 px-3">Karyawan</th>
                <th className="py-3 px-3">Kode ID</th>
                <th className="py-3 px-3">Jam Masuk</th>
                <th className="py-3 px-3">Jam Pulang</th>
                <th className="py-3 px-3">Durasi</th>
                <th className="py-3 px-3">Status Evaluasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {recent_activity.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-6 text-center text-slate-400">
                    Belum ada rekaman aktivitas absensi hari ini.
                  </td>
                </tr>
              ) : (
                recent_activity.map((row) => {
                  let badgeVariant = 'neutral';
                  let statusText = 'Sedang Bekerja';
                  if (row.duration_status === 'MEETS_MINIMUM') {
                    badgeVariant = 'success';
                    statusText = 'Memenuhi Target (≥ 510m)';
                  } else if (row.duration_status === 'BELOW_MINIMUM') {
                    badgeVariant = 'warning';
                    statusText = 'Kurang Durasi (< 510m)';
                  }

                  const checkInFormatted = row.check_in_at ? row.check_in_at.split(' ')[1] || row.check_in_at : '-';
                  const checkOutFormatted = row.check_out_at ? row.check_out_at.split(' ')[1] || row.check_out_at : 'Aktif';

                  return (
                    <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-3 font-medium text-slate-900">
                        {row.full_name || 'Karyawan'}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-500">{row.employee_code || '-'}</td>
                      <td className="py-3 px-3 font-mono text-blue-700">{checkInFormatted}</td>
                      <td className="py-3 px-3 font-mono text-slate-600">{checkOutFormatted}</td>
                      <td className="py-3 px-3">
                        {row.elapsed_minutes
                          ? `${Math.floor(row.elapsed_minutes / 60)}j ${row.elapsed_minutes % 60}m`
                          : '-'}
                      </td>
                      <td className="py-3 px-3">
                        <Badge variant={badgeVariant} size="sm">
                          {statusText}
                        </Badge>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
