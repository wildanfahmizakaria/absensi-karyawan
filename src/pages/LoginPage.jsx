import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { MOCK_AUTH_ACCOUNTS } from '../data/mockData';
import {
  IconBuilding,
  IconEye,
  IconEyeOff,
  IconShield,
  IconUser,
  IconUsers,
  IconLogIn,
  IconAlertCircle,
  IconCheckCircle,
} from '../components/common/Icons';

export const LoginPage = () => {
  const { loginWithCredentials, isLoadingAuth } = useAuth();
  const { navigateTo, getDefaultPageForRole } = useNavigation();

  // State Role Akses (Default: employee)
  const [selectedRole, setSelectedRole] = useState('employee');
  const [email, setEmail] = useState('karyawan@mandalamahardika.com');
  const [password, setPassword] = useState('karyawan123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Konfigurasi Role Akses
  const ROLE_OPTIONS = [
    {
      id: 'employee',
      label: 'Karyawan',
      sublabel: 'Staf Operasional',
      icon: IconUser,
      badge: 'Staf',
      badgeVariant: 'primary',
      activeColor: 'border-blue-600 bg-blue-50/70 text-blue-900 ring-2 ring-blue-500/20',
      activeIconBg: 'bg-blue-600 text-white',
      inactiveIconBg: 'bg-slate-100 text-slate-500',
      description: 'Presensi live camera & GPS, riwayat kehadiran pribadi, dan rekapitulasi shift.',
      defaultEmail: 'karyawan@mandalamahardika.com',
      defaultPassword: 'karyawan123',
    },
    {
      id: 'admin',
      label: 'Admin',
      sublabel: 'HR & Operasional',
      icon: IconUsers,
      badge: 'HR & Ops',
      badgeVariant: 'warning',
      activeColor: 'border-amber-500 bg-amber-50/70 text-amber-950 ring-2 ring-amber-500/20',
      activeIconBg: 'bg-amber-600 text-white',
      inactiveIconBg: 'bg-slate-100 text-slate-500',
      description: 'Pemantauan presensi harian, manajemen data karyawan, verifikasi, dan ekspor CSV.',
      defaultEmail: 'admin@mandalamahardika.com',
      defaultPassword: 'admin123',
    },
    {
      id: 'superadmin',
      label: 'Superadmin',
      sublabel: 'Direksi & Audit',
      icon: IconShield,
      badge: 'Eksekutif',
      badgeVariant: 'danger',
      activeColor: 'border-rose-600 bg-rose-50/70 text-rose-950 ring-2 ring-rose-500/20',
      activeIconBg: 'bg-rose-600 text-white',
      inactiveIconBg: 'bg-slate-100 text-slate-500',
      description: 'Audit trail aktivitas lengkap, konfigurasi jam kerja tetap, dan analitik eksekutif.',
      defaultEmail: 'superadmin@mandalamahardika.com',
      defaultPassword: 'superadmin123',
    },
  ];

  // Handler pemilihan Role Akses
  const handleSelectRole = (role) => {
    setSelectedRole(role.id);
    setEmail(role.defaultEmail);
    setPassword(role.defaultPassword);
    setErrorMsg('');
  };

  // Validasi format email sederhana
  const isValidEmail = (val) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim()) {
      setErrorMsg('Alamat email wajib diisi.');
      return;
    }

    if (!isValidEmail(email.trim())) {
      setErrorMsg('Format email tidak valid. Gunakan format contoh: nama@mandalamahardika.com');
      return;
    }

    if (!password) {
      setErrorMsg('Kata sandi wajib diisi.');
      return;
    }

    try {
      const loggedUser = await loginWithCredentials(email, password);
      // Alihkan langsung ke dashboard sesuai peran akun
      navigateTo(getDefaultPageForRole(loggedUser.role));
    } catch (err) {
      setErrorMsg(err.message || 'Terjadi kegagalan saat login. Silakan coba lagi.');
    }
  };

  const activeRoleConfig = ROLE_OPTIONS.find((r) => r.id === selectedRole) || ROLE_OPTIONS[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 selection:bg-blue-500 selection:text-white">
      <div className="w-full max-w-lg">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-700 to-blue-500 text-white items-center justify-center shadow-lg shadow-blue-500/25 mb-3">
            <IconBuilding className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            CV Mandala Mahardika
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Sistem Absensi Karyawan Mobile-First (SOT v0.2)
          </p>
        </div>

        <Card className="shadow-float border-slate-200/80 p-6 sm:p-8 bg-white/95 backdrop-blur-sm">
          {/* Header Kartu Login */}
          <div className="mb-5 pb-4 border-b border-slate-100">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Masuk ke Sistem
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Pilih peran akses Anda dan masukkan kredensial untuk melanjutkan
            </p>
          </div>

          {/* Bagian Pilihan Role Akses */}
          <div className="mb-5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Pilih Role Akses:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {ROLE_OPTIONS.map((role) => {
                const isSelected = selectedRole === role.id;
                const RoleIcon = role.icon;
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => handleSelectRole(role)}
                    disabled={isLoadingAuth}
                    className={`p-2.5 rounded-xl text-left border transition-all flex flex-col justify-between ${
                      isSelected
                        ? role.activeColor
                        : 'border-slate-200 bg-white hover:bg-slate-50/80 text-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                          isSelected ? role.activeIconBg : role.inactiveIconBg
                        }`}
                      >
                        <RoleIcon className="w-4 h-4" />
                      </div>
                      <Badge variant={role.badgeVariant} size="xs">
                        {role.badge}
                      </Badge>
                    </div>
                    <div>
                      <span className="block font-bold text-xs leading-tight">
                        {role.label}
                      </span>
                      <span className="block text-[10px] text-slate-400 mt-0.5 leading-none truncate">
                        {role.sublabel}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Keterangan Hak Akses Role Terpilih */}
            <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 text-[11px] text-slate-600 flex items-start gap-2">
              <IconCheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-800">
                  Hak Akses {activeRoleConfig.label}:
                </span>{' '}
                <span>{activeRoleConfig.description}</span>
              </div>
            </div>
          </div>

          {/* Form Login Kredensial */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Notifikasi Gagal */}
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-fadeIn">
                <IconAlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
                <div className="flex-1">
                  <span className="font-semibold block">Gagal Masuk:</span>
                  <span>{errorMsg}</span>
                </div>
              </div>
            )}

            {/* Input Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Alamat Email Pengguna
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="nama@mandalamahardika.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-slate-50/50"
                disabled={isLoadingAuth}
                required
              />
            </div>

            {/* Input Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Kata Sandi
                </label>
                <button
                  type="button"
                  className="text-xs text-primary hover:underline"
                  onClick={() =>
                    alert(
                      'Simulasi Pemulihan: Di lingkungan produksi nyata, token reset kata sandi dikirimkan ke email terdaftar.'
                    )
                  }
                >
                  Lupa sandi?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  placeholder="Masukkan kata sandi akun"
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-slate-50/50"
                  disabled={isLoadingAuth}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  aria-label={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                >
                  {showPassword ? (
                    <IconEyeOff className="w-4 h-4" />
                  ) : (
                    <IconEye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                disabled={isLoadingAuth}
                icon={isLoadingAuth ? undefined : IconLogIn}
                className="py-3 font-bold"
              >
                {isLoadingAuth
                  ? 'Memverifikasi Kredensial...'
                  : `Masuk sebagai ${activeRoleConfig.label}`}
              </Button>
            </div>
          </form>

          {/* Tautan Beralih ke Registrasi */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-600">
            Belum memiliki akun karyawan?{' '}
            <button
              type="button"
              onClick={() => navigateTo('register')}
              className="font-bold text-primary hover:underline ml-1"
            >
              Daftar Akun Baru
            </button>
          </div>
        </Card>

        {/* Footer Hak Cipta & Standar */}
        <div className="mt-5 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} CV Mandala Mahardika • Hak Cipta Dilindungi</p>
          <p className="mt-1 text-[11px] text-slate-400">
            Sistem Absensi Karyawan Terverifikasi (Kamera Live + GPS Mandatori SOT v0.2)
          </p>
        </div>
      </div>
    </div>
  );
};
