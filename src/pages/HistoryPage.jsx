import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { useAuth } from '../context/AuthContext';
import { attendanceApi } from '../services/attendanceApi';
import {
  IconCalendar,
  IconCheckCircle,
  IconClock,
  IconFilter,
  IconMapPin,
  IconCamera,
  IconSearch,
  IconUser,
  IconAlertCircle,
} from '../components/common/Icons';
import {
  calculateMinCheckOutTime,
  evaluateWorkDuration,
} from '../utils/timeUtils';

export const HistoryPage = () => {
  const { currentUser, currentRole } = useAuth();
  const [historyList, setHistoryList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDetail, setSelectedDetail] = useState(null);

  // Load history records from API adapter
  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const res = await attendanceApi.getAttendanceHistory({
        employeeId: currentRole === 'employee' ? currentUser?.id : undefined,
      });
      if (res && res.data) {
        setHistoryList(res.data);
      }
    } catch (e) {
      console.error('Failed to load attendance history', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [currentUser, currentRole]);

  useEffect(() => {
    if (!selectedDetail) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setSelectedDetail(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedDetail]);

  // Filter records based on status and search query
  const filteredList = historyList.filter((item) => {
    const matchesStatus = selectedStatus === 'ALL' || item.status === selectedStatus;
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      (item.employeeName && item.employeeName.toLowerCase().includes(query)) ||
      (item.date && item.date.toLowerCase().includes(query)) ||
      (item.id && item.id.toLowerCase().includes(query));

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Modal Detail Transaksi Absensi */}
      {selectedDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-card max-w-lg w-full p-6 shadow-float border border-brand-border max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Detail Transaksi Absensi
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  ID: {selectedDetail.id}
                </p>
              </div>
              <Badge
                variant={
                  selectedDetail.status === 'TEPAT_WAKTU' ? 'success' : 'warning'
                }
                size="md"
              >
                {selectedDetail.statusLabel || selectedDetail.status}
              </Badge>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-xs">Tanggal:</span>
                  <span className="font-semibold text-slate-800">
                    {selectedDetail.date}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs">Karyawan:</span>
                  <span className="font-semibold text-slate-800">
                    {selectedDetail.employeeName}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs">Absen Masuk:</span>
                  <span className="font-semibold text-blue-600">
                    {selectedDetail.checkIn || '-'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs">Target Min. Pulang:</span>
                  <span className="font-semibold text-blue-700">
                    {selectedDetail.minCheckOut || calculateMinCheckOutTime(selectedDetail.checkIn)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs">Absen Pulang:</span>
                  <span className="font-semibold text-indigo-600">
                    {selectedDetail.checkOut || '-'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs">Durasi Kerja:</span>
                  <span className="font-bold text-slate-900 font-mono">
                    {selectedDetail.workDuration || (selectedDetail.checkIn && selectedDetail.checkOut !== '-' ? evaluateWorkDuration(selectedDetail.checkIn, selectedDetail.checkOut).durationFormatted : '-')}
                  </span>
                </div>
                <div className="col-span-2 pt-1.5 border-t border-slate-200">
                  <span className="text-slate-400 block text-xs mb-0.5">Evaluasi Durasi (Batas Min. 8j 30m):</span>
                  {(() => {
                    const evalObj = evaluateWorkDuration(selectedDetail.checkIn, selectedDetail.checkOut);
                    const label = selectedDetail.keterangan || evalObj.keterangan;
                    const isMet = selectedDetail.status === 'LEBIH' || selectedDetail.status === 'TEPAT' || evalObj.targetMet;
                    return (
                      <span className={`font-semibold text-xs ${isMet ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {label}
                      </span>
                    );
                  })()}
                </div>
              </div>

              {/* Data GPS SOT v0.2 */}
              <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 font-semibold text-blue-900">
                    <IconMapPin className="w-4 h-4 text-primary" />
                    <span>Rekaman Koordinat GPS:</span>
                  </div>
                  {selectedDetail.coordinates?.latitude && selectedDetail.coordinates?.longitude && (
                    <a
                      href={`https://www.google.com/maps?q=${selectedDetail.coordinates.latitude},${selectedDetail.coordinates.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline font-medium"
                    >
                      Buka Peta ↗
                    </a>
                  )}
                </div>
                <p className="font-mono text-xs text-slate-700">
                  Latitude: {selectedDetail.coordinates?.latitude || '-'} | Longitude: {selectedDetail.coordinates?.longitude || '-'}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Akurasi: ±{selectedDetail.coordinates?.accuracy_m || 10} meter (SOT v0.2 — tanpa pembatasan radius kantor)
                </p>
              </div>

              {/* Preview Foto Kamera Live */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                {selectedDetail.photoUrl ? (
                  <div className="w-40 h-40 mx-auto rounded-xl overflow-hidden mb-2 border border-slate-300 shadow-xs">
                    <img
                      src={selectedDetail.photoUrl}
                      alt="Bukti Swafoto Kamera Live"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-28 h-28 mx-auto rounded-xl bg-slate-200 flex flex-col items-center justify-center text-slate-400 mb-2">
                    <IconCamera className="w-8 h-8 text-blue-600 mb-1" />
                    <span className="text-[10px] text-slate-600 font-medium">Swafoto Kamera</span>
                  </div>
                )}
                <Badge variant="success" size="sm">
                  Swafoto Kamera Live Terverifikasi
                </Badge>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <Button
                variant="primary"
                size="md"
                onClick={() => setSelectedDetail(null)}
              >
                Tutup Detail
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {currentRole === 'employee' ? 'Riwayat Absensi Saya' : 'Monitoring & Riwayat Absensi'}
            </h1>
            <Badge variant="mock" size="sm">
              SOT v0.2
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {currentRole === 'employee'
              ? 'Daftar catatan kehadiran Anda beserta bukti swafoto live dan koordinat GPS'
              : 'Daftar kehadiran seluruh karyawan beserta rekaman GPS dan verifikasi kamera live'}
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 self-start sm:self-auto">
          <button
            onClick={() => setSelectedStatus('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectedStatus === 'ALL'
                ? 'bg-white text-primary shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua ({historyList.length})
          </button>
          <button
            onClick={() => setSelectedStatus('TEPAT_WAKTU')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectedStatus === 'TEPAT_WAKTU'
                ? 'bg-white text-emerald-600 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tepat Waktu
          </button>
          <button
            onClick={() => setSelectedStatus('TERLAMBAT')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectedStatus === 'TERLAMBAT'
                ? 'bg-white text-amber-600 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Terlambat
          </button>
        </div>
      </div>

      {/* Search Input Bar (Untuk Admin/Superadmin atau Filter Tanggal) */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <IconSearch className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              currentRole === 'employee'
                ? 'Cari tanggal atau ID transaksi...'
                : 'Cari nama karyawan, tanggal, atau ID transaksi...'
            }
            className="w-full pl-9 pr-4 py-2 bg-white border border-brand-border rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="text-xs text-slate-400 hover:text-slate-600 font-medium px-2 py-1"
          >
            Reset
          </button>
        )}
      </div>

      {/* Tampilan Desktop (Tabel) & Mobile (Daftar Kartu) */}
      <Card>
        {isLoading ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            Memuat riwayat kehadiran...
          </div>
        ) : filteredList.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            Tidak ada riwayat absensi yang sesuai kriteria pencarian.
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-semibold border-b border-brand-border">
                  <tr>
                    <th className="py-3 px-3">Tanggal</th>
                    {currentRole !== 'employee' && (
                      <th className="py-3 px-3">Karyawan</th>
                    )}
                    <th className="py-3 px-3">Jam Masuk</th>
                    <th className="py-3 px-3">Target Pulang</th>
                    <th className="py-3 px-3">Jam Pulang</th>
                    <th className="py-3 px-3">Durasi Kerja</th>
                    <th className="py-3 px-3">Evaluasi 8j 30m</th>
                    <th className="py-3 px-3">Koordinat GPS</th>
                    <th className="py-3 px-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredList.map((item) => {
                    const evalObj = evaluateWorkDuration(item.checkIn, item.checkOut);
                    const isKurang = item.status === 'KURANG' || evalObj.status === 'KURANG';
                    const isTepat = item.status === 'TEPAT' || evalObj.status === 'TEPAT';
                    const durationText = item.workDuration || (item.checkIn && item.checkOut !== '-' ? evalObj.durationFormatted : '-');
                    const labelText = item.statusLabel || evalObj.statusLabel;

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-3 font-medium text-slate-900">
                          {item.date}
                        </td>
                        {currentRole !== 'employee' && (
                          <td className="py-3.5 px-3">
                            <span className="font-medium text-slate-800">
                              {item.employeeName}
                            </span>
                          </td>
                        )}
                        <td className="py-3.5 px-3 font-mono text-xs text-blue-700">
                          {item.checkIn || '-'}
                        </td>
                        <td className="py-3.5 px-3 font-mono text-xs text-slate-500">
                          {item.minCheckOut || calculateMinCheckOutTime(item.checkIn)}
                        </td>
                        <td className="py-3.5 px-3 font-mono text-xs text-indigo-700">
                          {item.checkOut || '-'}
                        </td>
                        <td className="py-3.5 px-3 font-mono text-xs font-semibold text-slate-900">
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
                        <td className="py-3.5 px-3 font-mono text-xs text-slate-500">
                          {item.coordinates?.latitude}, {item.coordinates?.longitude}
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedDetail(item)}
                          >
                            Detail
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-slate-100 -mx-5 -my-5">
              {filteredList.map((item) => {
                const evalObj = evaluateWorkDuration(item.checkIn, item.checkOut);
                const isKurang = item.status === 'KURANG' || evalObj.status === 'KURANG';
                const durationText = item.workDuration || (item.checkIn && item.checkOut !== '-' ? evalObj.durationFormatted : '-');
                const labelText = item.statusLabel || evalObj.statusLabel;

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedDetail(item)}
                    className="p-4 active:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div>
                        <span className="font-semibold text-slate-900 text-sm">
                          {item.date}
                        </span>
                        {currentRole !== 'employee' && (
                          <span className="block text-xs text-slate-500 font-medium">
                            {item.employeeName}
                          </span>
                        )}
                      </div>
                      <Badge
                        variant={isKurang ? 'danger' : 'success'}
                        size="sm"
                      >
                        {labelText}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mb-2 bg-slate-50 p-2 rounded-lg">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Masuk:</span>
                        <span className="font-semibold text-blue-700">{item.checkIn || '-'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Pulang:</span>
                        <span className="font-semibold text-indigo-700">{item.checkOut || '-'}</span>
                      </div>
                      <div className="col-span-2 pt-1 border-t border-slate-200 flex justify-between items-center">
                        <span className="text-slate-500 text-[11px]">Durasi Kerja:</span>
                        <span className="font-bold text-slate-900 font-mono">{durationText}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>GPS: ±{item.coordinates?.accuracy_m || 10}m</span>
                      <span className="text-primary font-sans font-medium">
                        Ketuk untuk detail →
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </Card>
    </div>
  );
};
