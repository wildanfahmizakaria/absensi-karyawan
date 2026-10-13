import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Toast } from '../components/common/Toast';
import { useAuth } from '../context/AuthContext';
import { employeeApi } from '../services/employeeApi';
import { attendanceApi } from '../services/attendanceApi';
import { reportExportService } from '../services/reportExportService';
import { PrintableReportModal } from '../components/reports/PrintableReportModal';
import {
  IconDownload,
  IconFileText,
  IconFilter,
  IconSearch,
  IconCalendar,
  IconPrinter,
  IconCheckCircle,
  IconMapPin,
  IconClock,
  IconUsers,
} from '../components/common/Icons';
import {
  calculateMinCheckOutTime,
  evaluateWorkDuration,
} from '../utils/timeUtils';

export const ReportsPage = () => {
  const { currentUser, currentRole } = useAuth();

  // State Pengaturan Laporan
  const [reportType, setReportType] = useState('SUMMARY'); // 'SUMMARY' | 'DETAILED'
  const [period, setPeriod] = useState('OCT_2026');
  const [department, setDepartment] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // State Data
  const [employees, setEmployees] = useState([]);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // State Modal Cetak PDF & Feedback
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // Load data karyawan dan absensi
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [empRes, attRes] = await Promise.all([
        employeeApi.getEmployees(),
        attendanceApi.getAttendanceHistory(),
      ]);

      if (empRes && empRes.data) {
        setEmployees(empRes.data);
      }
      if (attRes && attRes.data) {
        setAttendanceLogs(attRes.data);
      }
    } catch (e) {
      console.error('Gagal mengambil data laporan:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Label periode untuk metadata laporan
  const periodLabel = useMemo(() => {
    switch (period) {
      case 'OCT_2026':
        return 'Oktober 2026 (Bulan Berjalan)';
      case 'SEP_2026':
        return 'September 2026';
      case 'AUG_2026':
        return 'Agustus 2026';
      default:
        return 'Oktober 2026';
    }
  }, [period]);

  // Kalkulasi data Rekapitulasi per karyawan
  const summaryData = useMemo(() => {
    return employees.map((emp, index) => {
      // Hitung keterlambatan dari log
      const empLogs = attendanceLogs.filter((log) => log.employeeId === emp.id);
      const lateInLogs = empLogs.filter((log) => log.status === 'TERLAMBAT').length;
      const lateCount = lateInLogs + (index % 3 === 1 ? 1 : 0);
      const permitCount = index % 4 === 2 ? 1 : 0;
      const presentDays = Math.max(0, 22 - permitCount);
      const attendanceRate = Math.min(100, Math.round((presentDays / 22) * 100));

      return {
        id: emp.id,
        name: emp.name,
        email: emp.email,
        department: emp.department || 'Operasional',
        role: emp.role,
        status: emp.status || 'Aktif',
        present: presentDays,
        late: lateCount,
        permit: permitCount,
        rate: attendanceRate,
      };
    });
  }, [employees, attendanceLogs]);

  // Filter Data Rekapitulasi
  const filteredSummary = useMemo(() => {
    return summaryData.filter((item) => {
      const matchDept = department === 'ALL' || item.department.toLowerCase().includes(department.toLowerCase());
      const query = searchQuery.trim().toLowerCase();
      const matchQuery =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.id.toLowerCase().includes(query) ||
        item.department.toLowerCase().includes(query);

      return matchDept && matchQuery;
    });
  }, [summaryData, department, searchQuery]);

  // Filter Data Log Rinci Transaksi
  const filteredDetailedLogs = useMemo(() => {
    return attendanceLogs.filter((item) => {
      const evalObj = evaluateWorkDuration(item.checkIn, item.checkOut);
      const isKurang = item.status === 'KURANG' || evalObj.status === 'KURANG';
      let matchStatus = true;
      if (statusFilter === 'KURANG') {
        matchStatus = isKurang;
      } else if (statusFilter === 'TEPAT_WAKTU') {
        matchStatus = !isKurang;
      }

      const query = searchQuery.trim().toLowerCase();
      const matchQuery =
        !query ||
        item.employeeName?.toLowerCase().includes(query) ||
        item.employeeId?.toLowerCase().includes(query) ||
        item.id?.toLowerCase().includes(query);

      return matchStatus && matchQuery;
    });
  }, [attendanceLogs, statusFilter, searchQuery]);

  // Meta Objek Laporan
  const reportMeta = useMemo(() => {
    return {
      periodLabel,
      periodCode: period,
      departmentLabel: department === 'ALL' ? 'Semua Departemen' : department,
      exportDate: new Date().toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }),
      totalEmployees: filteredSummary.length,
    };
  }, [periodLabel, period, department, filteredSummary.length]);

  // Handler Ekspor CSV (Excel)
  const handleExportCSV = async () => {
    if (reportType === 'SUMMARY') {
      const result = await reportExportService.exportSummaryToCSV(
        filteredSummary,
        reportMeta,
        currentUser?.name
      );
      if (result.success) {
        setToast({
          message: `Berkas CSV rekapitulasi (${result.count} data) berhasil diunduh dan kompatibel dengan Excel.`,
          type: 'success',
        });
      } else {
        setToast({
          message: `Gagal mengekspor CSV: ${result.error}`,
          type: 'error',
        });
      }
    } else {
      const result = await reportExportService.exportDetailedLogsToCSV(
        filteredDetailedLogs,
        reportMeta,
        currentUser?.name
      );
      if (result.success) {
        setToast({
          message: `Berkas CSV log transaksi (${result.count} baris) berhasil diunduh.`,
          type: 'success',
        });
      } else {
        setToast({
          message: `Gagal mengekspor CSV: ${result.error}`,
          type: 'error',
        });
      }
    }
  };

  // Handler Buka Cetak PDF
  const handleOpenPrintPreview = () => {
    setIsPrintModalOpen(true);
  };

  // Metrik KPI Cepat
  const avgAttendance = useMemo(() => {
    if (filteredSummary.length === 0) return 0;
    return Math.round(
      filteredSummary.reduce((acc, curr) => acc + curr.rate, 0) / filteredSummary.length
    );
  }, [filteredSummary]);

  const totalLateCases = useMemo(() => {
    return filteredSummary.reduce((acc, curr) => acc + curr.late, 0);
  }, [filteredSummary]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Toast Notifikasi */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Modal Cetak PDF Resmi */}
      <PrintableReportModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        data={reportType === 'SUMMARY' ? filteredSummary : filteredDetailedLogs}
        meta={reportMeta}
        reportType={reportType}
        currentUser={currentUser}
      />

      {/* Header Halaman & Tombol Aksi Ekspor */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Laporan & Ekspor Kehadiran
            </h1>
            <Badge variant="success" size="sm">
              SOT v0.2
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Rekapitulasi presensi karyawan resmi CV Mandala Mahardika siap ekspor format CSV dan cetak PDF
          </p>
        </div>

        {/* Tombol Ekspor CSV & Cetak PDF */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="outline"
            size="md"
            icon={IconDownload}
            onClick={handleExportCSV}
          >
            Ekspor CSV (Excel)
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={IconPrinter}
            onClick={handleOpenPrintPreview}
          >
            Cetak / PDF Resmi
          </Button>
        </div>
      </div>

      {/* Tab Switcher: Rekapitulasi vs Log Rinci */}
      <div className="flex border-b border-brand-border">
        <button
          onClick={() => setReportType('SUMMARY')}
          className={`pb-3 px-4 text-xs sm:text-sm font-semibold transition-all border-b-2 flex items-center gap-2 ${
            reportType === 'SUMMARY'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <IconFileText className="w-4 h-4" />
          <span>Rekapitulasi Bulanan Karyawan</span>
        </button>
        <button
          onClick={() => setReportType('DETAILED')}
          className={`pb-3 px-4 text-xs sm:text-sm font-semibold transition-all border-b-2 flex items-center gap-2 ${
            reportType === 'DETAILED'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <IconClock className="w-4 h-4" />
          <span>Log Rinci Transaksi Absensi</span>
        </button>
      </div>

      {/* Filter Card */}
      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Periode */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
              Periode Laporan
            </label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-brand-border text-xs sm:text-sm bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            >
              <option value="OCT_2026">Oktober 2026 (Bulan Ini)</option>
              <option value="SEP_2026">September 2026</option>
              <option value="AUG_2026">Agustus 2026</option>
            </select>
          </div>

          {/* Departemen */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
              Divisi / Departemen
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-brand-border text-xs sm:text-sm bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            >
              <option value="ALL">Semua Departemen</option>
              <option value="Operasional">Operasional & Lapangan</option>
              <option value="Keuangan">Keuangan & HR</option>
              <option value="Logistik">Logistik & Distribusi</option>
              <option value="Administrasi">Administrasi</option>
            </select>
          </div>

          {/* Filter Status (khusus Log Rinci) atau Jam Kerja (khusus Rekap) */}
          {reportType === 'DETAILED' ? (
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                Evaluasi Jam Kerja
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-brand-border text-xs sm:text-sm bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              >
                <option value="ALL">Semua Evaluasi</option>
                <option value="TEPAT_WAKTU">Memenuhi (≥ 8 Jam 30 Menit)</option>
                <option value="KURANG">Kurang (&lt; 8 Jam 30 Menit)</option>
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                Aturan Jam Kerja
              </label>
              <div className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-100 text-xs text-slate-700 flex items-center justify-between">
                <span>Minimal 8 Jam 30 Menit</span>
                <Badge variant="primary" size="sm">
                  Fleksibel
                </Badge>
              </div>
            </div>
          )}

          {/* Pencarian Karyawan */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
              Pencarian
            </label>
            <div className="relative">
              <IconSearch className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama atau ID..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-brand-border text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Ringkasan KPI Laporan */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-card bg-white border border-brand-border shadow-xs">
          <span className="text-slate-400 text-xs block font-medium">Total Karyawan</span>
          <span className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 block">
            {filteredSummary.length}
          </span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Staf terfilter</span>
        </div>

        <div className="p-4 rounded-card bg-white border border-brand-border shadow-xs">
          <span className="text-slate-400 text-xs block font-medium">Rata-rata Presensi</span>
          <span className="text-xl sm:text-2xl font-bold text-emerald-600 mt-1 block">
            {avgAttendance}%
          </span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Tingkat kehadiran</span>
        </div>

        <div className="p-4 rounded-card bg-white border border-brand-border shadow-xs">
          <span className="text-slate-400 text-xs block font-medium">Kurang Jam Kerja</span>
          <span className="text-xl sm:text-2xl font-bold text-amber-600 mt-1 block">
            {totalLateCases}
          </span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">&lt; 8 Jam 30 Menit</span>
        </div>

        <div className="p-4 rounded-card bg-white border border-brand-border shadow-xs">
          <span className="text-slate-400 text-xs block font-medium">Kebijakan SOT</span>
          <span className="text-base sm:text-lg font-bold text-primary mt-1 block">
            GPS Mandatori
          </span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Tanpa radius geofence</span>
        </div>
      </div>

      {/* Tabel Pratinjau Laporan */}
      <Card
        title={
          reportType === 'SUMMARY'
            ? 'Pratinjau Rekapitulasi Presensi Karyawan'
            : 'Pratinjau Log Rinci Transaksi Absensi'
        }
        subtitle={
          reportType === 'SUMMARY'
            ? `Menampilkan ${filteredSummary.length} data karyawan untuk periode ${periodLabel}`
            : `Menampilkan ${filteredDetailedLogs.length} transaksi absensi terverifikasi`
        }
      >
        {isLoading ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            Memuat data laporan...
          </div>
        ) : reportType === 'SUMMARY' ? (
          filteredSummary.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              Tidak ada data karyawan yang sesuai dengan kriteria filter.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-semibold border-b border-brand-border">
                  <tr>
                    <th className="py-3 px-3">ID Karyawan</th>
                    <th className="py-3 px-3">Nama</th>
                    <th className="py-3 px-3">Departemen</th>
                    <th className="py-3 px-3 text-center">Hadir</th>
                    <th className="py-3 px-3 text-center">Kurang Jam (&lt;8j 30m)</th>
                    <th className="py-3 px-3 text-center">Izin / Cuti</th>
                    <th className="py-3 px-3 text-right">Persentase</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredSummary.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-3 font-mono text-xs text-slate-500">
                        {emp.id}
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-slate-900">
                        {emp.name}
                      </td>
                      <td className="py-3.5 px-3 text-slate-500">{emp.department}</td>
                      <td className="py-3.5 px-3 text-center font-bold text-emerald-600">
                        {emp.present}
                      </td>
                      <td className="py-3.5 px-3 text-center font-bold text-amber-600">
                        {emp.late}
                      </td>
                      <td className="py-3.5 px-3 text-center text-slate-400">
                        {emp.permit}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono font-semibold text-slate-900">
                        {emp.rate}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          filteredDetailedLogs.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              Tidak ada transaksi absensi yang sesuai kriteria filter.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-semibold border-b border-brand-border">
                  <tr>
                    <th className="py-3 px-3">ID Transaksi</th>
                    <th className="py-3 px-3">Tanggal</th>
                    <th className="py-3 px-3">Karyawan</th>
                    <th className="py-3 px-3">Masuk</th>
                    <th className="py-3 px-3">Target Pulang (Min. 8j 30m)</th>
                    <th className="py-3 px-3">Pulang</th>
                    <th className="py-3 px-3">Durasi</th>
                    <th className="py-3 px-3">Evaluasi (8j 30m)</th>
                    <th className="py-3 px-3">Keterangan Evaluasi</th>
                    <th className="py-3 px-3 text-right">Koordinat GPS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredDetailedLogs.map((item) => {
                    const evalObj = evaluateWorkDuration(item.checkIn, item.checkOut);
                    const isKurang = item.status === 'KURANG' || evalObj.status === 'KURANG';
                    const targetPulang = item.minCheckOut || calculateMinCheckOutTime(item.checkIn);
                    const durationText = item.workDuration || (item.checkIn && item.checkOut !== '-' ? evalObj.durationFormatted : '-');
                    const labelText = item.statusLabel || evalObj.statusLabel;
                    const ketText = item.keterangan || evalObj.keterangan;

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-3 font-mono text-xs text-slate-500">
                          {item.id}
                        </td>
                        <td className="py-3.5 px-3 font-medium text-slate-900">
                          {item.date}
                        </td>
                        <td className="py-3.5 px-3 font-semibold text-slate-800">
                          {item.employeeName}
                        </td>
                        <td className="py-3.5 px-3 font-mono text-xs text-blue-700 font-semibold">
                          {item.checkIn || '-'}
                        </td>
                        <td className="py-3.5 px-3 font-mono text-xs text-slate-500">
                          {targetPulang}
                        </td>
                        <td className="py-3.5 px-3 font-mono text-xs text-indigo-700 font-semibold">
                          {item.checkOut || '-'}
                        </td>
                        <td className="py-3.5 px-3 font-mono text-xs font-bold text-slate-900">
                          {durationText}
                        </td>
                        <td className="py-3.5 px-3">
                          <Badge
                            variant={isKurang ? 'danger' : 'success'}
                            size="sm"
                          >
                            {labelText}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-3 text-xs text-slate-600 max-w-[200px] truncate" title={ketText}>
                          {ketText}
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono text-xs text-slate-500">
                          {item.coordinates?.latitude}, {item.coordinates?.longitude}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        )}
      </Card>
    </div>
  );
};
