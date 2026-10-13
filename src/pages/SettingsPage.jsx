import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { configApi } from '../services/configApi';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Toast } from '../components/common/Toast';
import {
  IconBuilding,
  IconClock,
  IconMapPin,
  IconShield,
  IconUser,
  IconCheckCircle,
} from '../components/common/Icons';

export const SettingsPage = () => {
  const { currentUser, currentRole } = useAuth();

  const [schedule, setSchedule] = useState({
    type: 'Kebijakan Durasi Fleksibel',
    minWorkHours: 8,
    minWorkMinutes: 30,
    minDurationFormatted: '8 Jam 30 Menit',
    minDurationMinutesTotal: 510,
    checkInRule: 'Absen Masuk Bebas (Jam Berapapun)',
    checkOutRule: 'Absen Pulang Minimal 8 Jam 30 Menit dari Jam Masuk',
    workDays: 'Senin – Jumat',
    geolocationRule: 'Perekaman Koordinat GPS Aktif (Tanpa Radius Geofence)',
  });

  const [organization, setOrganization] = useState({
    companyName: 'CV Mandala Mahardika',
    address: 'Jl. Pemuda No. 108, Kota Semarang, Jawa Tengah',
  });

  const [isEditingSchedule, setIsEditingSchedule] = useState(false);
  const [isEditingOrg, setIsEditingOrg] = useState(false);
  const [scheduleForm, setScheduleForm] = useState(schedule);
  const [orgForm, setOrgForm] = useState(organization);
  const [toastMessage, setToastMessage] = useState(null);

  // Load config saat mount
  useEffect(() => {
    const loadConfig = async () => {
      const s = await configApi.getWorkSchedule();
      const o = await configApi.getOrganization();
      setSchedule(s);
      setScheduleForm(s);
      setOrganization(o);
      setOrgForm(o);
    };
    loadConfig();
  }, []);

  // Simpan Batas Minimal Durasi Kerja
  const handleSaveSchedule = async (e) => {
    e.preventDefault();
    const hours = Number(scheduleForm.minWorkHours) || 8;
    const minutes = Number(scheduleForm.minWorkMinutes) || 30;
    const totalMin = hours * 60 + minutes;
    const updated = {
      ...scheduleForm,
      type: 'Kebijakan Durasi Fleksibel',
      minWorkHours: hours,
      minWorkMinutes: minutes,
      minDurationFormatted: `${hours} Jam ${minutes} Menit`,
      minDurationMinutesTotal: totalMin,
      checkInRule: 'Absen Masuk Bebas (Jam Berapapun)',
      checkOutRule: `Absen Pulang Minimal ${hours} Jam ${minutes} Menit dari Jam Masuk`,
    };

    const res = await configApi.updateWorkSchedule(
      updated,
      currentUser?.name || 'Superadmin'
    );
    if (res.success) {
      setSchedule(updated);
      setScheduleForm(updated);
      setIsEditingSchedule(false);
      setToastMessage({
        text: 'Pengaturan Batas Minimal Durasi Kerja berhasil disimpan!',
        type: 'success',
      });
    }
  };

  // Simpan Profil Organisasi
  const handleSaveOrg = async (e) => {
    e.preventDefault();
    const res = await configApi.updateOrganization(
      orgForm,
      currentUser?.name || 'Superadmin'
    );
    if (res.success) {
      setOrganization(orgForm);
      setIsEditingOrg(false);
      setToastMessage({
        text: 'Profil Organisasi berhasil diperbarui!',
        type: 'success',
      });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn">
      {toastMessage && (
        <Toast
          message={toastMessage.text}
          type={toastMessage.type}
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Pengaturan & Konfigurasi Sistem
            </h1>
            <Badge variant="mock" size="sm">
              Fase 4: Operasional
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Parameter operasional jadwal kerja tetap, kebijakan GPS, dan profil instansi
          </p>
        </div>
      </div>

      {/* Konfigurasi Batas Minimal Durasi Kerja */}
      <Card
        title="Konfigurasi Batas Minimal Durasi Kerja"
        subtitle="Kebijakan batas kerja minimal 8 jam 30 menit & evaluasi pulang (SOT v0.2)"
        action={
          currentRole === 'superadmin' &&
          !isEditingSchedule && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditingSchedule(true)}
            >
              Ubah Parameter
            </Button>
          )
        }
      >
        {!isEditingSchedule ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3.5 rounded-control bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 block mb-1">
                Batas Durasi Minimal:
              </span>
              <span className="text-lg font-bold text-primary block font-mono">
                {schedule.minDurationFormatted || '8 Jam 30 Menit'}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Total {schedule.minDurationMinutesTotal || 510} menit waktu kerja efektif
              </span>
            </div>

            <div className="p-3.5 rounded-control bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 block mb-1">
                Aturan Jam Masuk:
              </span>
              <span className="text-base font-bold text-emerald-600 block">
                Fleksibel (Jam Berapapun)
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Karyawan bebas absen masuk jam berapa saja
              </span>
            </div>

            <div className="p-3.5 rounded-control bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 block mb-1">
                Target Pulang & Evaluasi:
              </span>
              <span className="text-base font-bold text-indigo-700 block">
                Jam Masuk + {schedule.minDurationFormatted || '8j 30m'}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Keterangan evaluasi otomatis (kurang / lebih)
              </span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSaveSchedule} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Batas Minimal Jam Kerja (Jam)
                </label>
                <input
                  type="number"
                  min="1"
                  max="24"
                  value={scheduleForm.minWorkHours ?? 8}
                  onChange={(e) =>
                    setScheduleForm({ ...scheduleForm, minWorkHours: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-control border border-brand-border text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tambahan Waktu Minimal (Menit)
                </label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={scheduleForm.minWorkMinutes ?? 30}
                  onChange={(e) =>
                    setScheduleForm({
                      ...scheduleForm,
                      minWorkMinutes: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-control border border-brand-border text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Hari Kerja Operasional
                </label>
                <input
                  type="text"
                  value={scheduleForm.workDays || 'Senin – Jumat'}
                  onChange={(e) =>
                    setScheduleForm({ ...scheduleForm, workDays: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-control border border-brand-border text-sm"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="md"
                onClick={() => setIsEditingSchedule(false)}
              >
                Batal
              </Button>
              <Button variant="primary" size="md" type="submit">
                Simpan Parameter Durasi
              </Button>
            </div>
          </form>
        )}
      </Card>

      {/* Kebijakan Perekaman Geolokasi GPS */}
      <Card
        title="Kebijakan Geolokasi GPS (SOT v0.2)"
        subtitle="Perekaman koordinat perangkat tanpa batasan radius geofence"
      >
        <div className="p-4 rounded-control bg-emerald-50/60 border border-emerald-100 space-y-2">
          <div className="flex items-center gap-2 text-emerald-800 font-semibold text-sm">
            <IconCheckCircle className="w-5 h-5 text-emerald-600" />
            <span>Perekaman Koordinat GPS Wajib Aktif</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Sesuai keputusan resmi Pemilik Proyek pada SOT v0.2:
            <strong> Tidak ada batasan radius geofence kantor</strong> yang menolak kehadiran karyawan. Namun koordinat (Latitude, Longitude, Akurasi) dari Geolocation API perangkat <strong>wajib diambil dan dicatat ke catatan transaksi server</strong> sebagai bukti audit kehadiran otentik.
          </p>
          <div className="pt-2 flex items-center gap-2">
            <Badge variant="success" size="sm">
              Geofence Radius: Ditiadakan
            </Badge>
            <Badge variant="primary" size="sm">
              Perekaman GPS: Wajib
            </Badge>
          </div>
        </div>
      </Card>

      {/* Profil Perusahaan */}
      <Card
        title="Profil Organisasi"
        subtitle="Identitas resmi instansi CV Mandala Mahardika"
        action={
          currentRole === 'superadmin' &&
          !isEditingOrg && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditingOrg(true)}
            >
              Ubah Profil
            </Button>
          )
        }
      >
        {!isEditingOrg ? (
          <div className="space-y-3 text-xs sm:text-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Nama Perusahaan:</span>
              <span className="font-semibold text-slate-900">
                {organization.companyName}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Alamat Kantor:</span>
              <span className="font-semibold text-slate-900">
                {organization.address}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Format Ekspor Spreadsheet:</span>
              <span className="font-semibold text-blue-700">
                CSV (Kompatibel Excel) & PDF
              </span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSaveOrg} className="space-y-3 pt-2 text-xs sm:text-sm">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nama Perusahaan
              </label>
              <input
                type="text"
                value={orgForm.companyName}
                onChange={(e) =>
                  setOrgForm({ ...orgForm, companyName: e.target.value })
                }
                className="w-full px-3 py-2 rounded-control border border-brand-border"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Alamat Kantor
              </label>
              <input
                type="text"
                value={orgForm.address}
                onChange={(e) =>
                  setOrgForm({ ...orgForm, address: e.target.value })
                }
                className="w-full px-3 py-2 rounded-control border border-brand-border"
                required
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="md"
                onClick={() => setIsEditingOrg(false)}
              >
                Batal
              </Button>
              <Button variant="primary" size="md" type="submit">
                Simpan Profil
              </Button>
            </div>
          </form>
        )}
      </Card>

      {/* Info Akun Pengguna Aktif */}
      <Card title="Akun Pengguna Aktif">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-lg shadow-sm">
            {currentUser.avatar}
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              {currentUser.name}
            </h3>
            <p className="text-xs text-slate-500">{currentUser.email}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <Badge variant="primary" size="sm">
                Peran: {currentUser.roleLabel}
              </Badge>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500">ID: {currentUser.id}</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
