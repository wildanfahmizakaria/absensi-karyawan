import React, { useState, useEffect } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { DashboardSkeleton } from '../components/common/Skeleton';
import { auditApi } from '../services/auditApi';
import { configApi } from '../services/configApi';
import {
  IconShield,
  IconBuilding,
  IconClock,
  IconMapPin,
  IconSettings,
  IconFileText,
  IconUsers,
} from '../components/common/Icons';

export const SuperadminDashboardPage = () => {
  const { navigateTo } = useNavigation();

  const [isLoadingData, setIsLoadingData] = useState(true);
  const [auditLogs, setAuditLogs] = useState([]);
  const [schedule, setSchedule] = useState({
    type: 'Kebijakan Durasi Fleksibel',
    minDurationFormatted: '8 Jam 30 Menit',
    minDurationMinutesTotal: 510,
    checkInRule: 'Absen Masuk Bebas (Jam Berapapun)',
    checkOutRule: 'Absen Pulang Minimal 8 Jam 30 Menit dari Jam Masuk',
    timezone: 'WIB (UTC+7)',
  });
  const [organization, setOrganization] = useState({
    companyName: 'CV Mandala Mahardika',
    address: 'Jl. Pemuda No. 108, Kota Semarang, Jawa Tengah',
    activeEmployees: 48,
    totalEmployees: 48,
  });

  const [logFilter, setLogFilter] = useState('ALL');

  const loadData = async () => {
    setIsLoadingData(true);
    const logs = await auditApi.getAuditLogs();
    const sch = await configApi.getWorkSchedule();
    const org = await configApi.getOrganization();
    setAuditLogs(logs);
    setSchedule(sch);
    setOrganization(org);
    setIsLoadingData(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredLogs = auditLogs.filter((log) => {
    if (logFilter === 'ALL') return true;
    return log.action.includes(logFilter);
  });

  if (isLoadingData) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fadeIn">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Dashboard Manajemen Sistem Superadmin
            </h1>
            <Badge variant="mock" size="sm">
              Fase 4: Operasional
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Pengaturan kebijakan global, audit log, dan profil {organization.companyName}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="md"
            onClick={loadData}
            title="Segarkan data log audit"
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
            variant="primary"
            size="md"
            icon={IconSettings}
            onClick={() => navigateTo('settings')}
          >
            Konfigurasi Sistem
          </Button>
        </div>
      </div>

      {/* Parameter Kebijakan SOT Aktif */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-blue-100 bg-gradient-to-br from-white to-blue-50/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase">
              Profil Perusahaan
            </span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <IconBuilding className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-base font-bold text-slate-900">
            {organization.companyName}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {organization.address}
          </p>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>Status Sistem:</span>
            <span className="font-bold text-emerald-600">
              Aktif & Beroperasi
            </span>
          </div>
        </Card>

        <Card className="border-emerald-100 bg-gradient-to-br from-white to-emerald-50/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase">
              Aturan Geolokasi (SOT v0.2)
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <IconMapPin className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-base font-bold text-emerald-700">
            Perekaman GPS Aktif
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Tanpa batas radius geofence kantor. Koordinat dicatat sebagai bukti audit.
          </p>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>Validasi Geofence:</span>
            <Badge variant="success" size="sm">
              Tanpa Radius Kantor
            </Badge>
          </div>
        </Card>

        <Card className="border-indigo-100 bg-gradient-to-br from-white to-indigo-50/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase">
              Kebijakan Jam Kerja
            </span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <IconClock className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-base font-bold text-indigo-700">
            Min. {schedule.minDurationFormatted || '8 Jam 30 Menit'}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Jam masuk bebas. Minimal absen pulang: Jam Masuk + 8 jam 30 menit.
          </p>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>Evaluasi Pulang:</span>
            <Badge variant="primary" size="sm">
              Kurang / Lebih Tercatat
            </Badge>
          </div>
        </Card>
      </div>

      {/* Log Audit Sistem */}
      <Card
        title="Audit Log Tindakan Administratif"
        subtitle="Pencatatan riwayat aktivitas konfigurasi dan tindakan sensitif secara real-time"
        action={
          <div className="flex items-center gap-2">
            <select
              value={logFilter}
              onChange={(e) => setLogFilter(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-brand-border bg-slate-50 focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="ALL">Semua Aksi</option>
              <option value="EMPLOYEE">Karyawan</option>
              <option value="SCHEDULE">Jadwal Kerja</option>
              <option value="ORGANIZATION">Organisasi</option>
            </select>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-semibold border-b border-brand-border">
              <tr>
                <th className="py-3 px-3">Waktu (Server)</th>
                <th className="py-3 px-3">Aktor</th>
                <th className="py-3 px-3">Aksi</th>
                <th className="py-3 px-3">Keterangan Aktivitas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="py-3 px-3 font-medium text-slate-900 whitespace-nowrap">
                    {log.actor}
                  </td>
                  <td className="py-3 px-3">
                    <Badge variant="primary" size="sm">
                      {log.action}
                    </Badge>
                  </td>
                  <td className="py-3 px-3 text-slate-600">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
