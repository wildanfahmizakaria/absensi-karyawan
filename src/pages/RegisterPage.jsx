import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import {
  IconBuilding,
  IconEye,
  IconEyeOff,
  IconUser,
  IconCheckCircle,
  IconAlertCircle,
  IconArrowLeft,
  IconShield,
} from '../components/common/Icons';

export const RegisterPage = () => {
  const { registerUser, isLoadingAuth } = useAuth();
  const { navigateTo, getDefaultPageForRole } = useNavigation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('Operasional');
  const [role, setRole] = useState('employee');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const isValidEmail = (val) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!name.trim()) {
      setErrorMsg('Nama lengkap wajib diisi.');
      return;
    }

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

    if (password.length < 6) {
      setErrorMsg('Kata sandi minimal terdiri dari 6 karakter.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Konfirmasi kata sandi tidak cocok. Silakan periksa kembali.');
      return;
    }

    try {
      const newUser = await registerUser({
        name,
        email,
        department,
        role,
        password,
      });

      setSuccessMsg(`Pendaftaran berhasil! Selamat datang, ${newUser.name}.`);
      // Arahkan ke dashboard sesuai role setelah jeda singkat
      setTimeout(() => {
        navigateTo(getDefaultPageForRole(newUser.role));
      }, 700);
    } catch (err) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat pendaftaran.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 selection:bg-blue-500 selection:text-white">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-float border border-slate-200/80 p-6 sm:p-8">
        {/* Header Form Registrasi */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-700 to-primary text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-blue-600/20">
            <IconBuilding className="w-6 h-6" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Daftar Akun Karyawan
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            CV Mandala Mahardika — Sistem Presensi SOT v0.2
          </p>
        </div>

        {/* Notifikasi Error */}
        {errorMsg && (
          <div className="p-3.5 mb-5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-start gap-2.5 animate-fadeIn">
            <IconAlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600 mt-0.5" />
            <span className="leading-snug">{errorMsg}</span>
          </div>
        )}

        {/* Notifikasi Sukses */}
        {successMsg && (
          <div className="p-3.5 mb-5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs sm:text-sm flex items-start gap-2.5 animate-fadeIn">
            <IconCheckCircle className="w-5 h-5 flex-shrink-0 text-emerald-600 mt-0.5" />
            <span className="leading-snug">{successMsg}</span>
          </div>
        )}

        {/* Form Registrasi */}
        <form onSubmit={handleRegister} className="space-y-4 text-xs sm:text-sm">
          {/* Nama Lengkap */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1 text-xs">
              Nama Lengkap Karyawan
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Rahmat Hidayat"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-xs sm:text-sm"
            />
          </div>

          {/* Alamat Email */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1 text-xs">
              Alamat Email Kantor / Aktif
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@mandalamahardika.com"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-xs sm:text-sm"
            />
          </div>

          {/* Departemen & Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1 text-xs">
                Divisi / Departemen
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-xs sm:text-sm"
              >
                <option value="Operasional">Operasional & Lapangan</option>
                <option value="Keuangan">Keuangan & HR</option>
                <option value="Logistik">Logistik & Distribusi</option>
                <option value="Administrasi">Administrasi</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1 text-xs">
                Peran Akun
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-xs sm:text-sm"
              >
                <option value="employee">Karyawan (Staf)</option>
                <option value="admin">Admin Operasional</option>
              </select>
            </div>
          </div>

          {/* Kata Sandi */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1 text-xs">
              Kata Sandi (Minimal 6 Karakter)
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Buat kata sandi akun"
                required
                className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-brand-border bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-xs sm:text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
              >
                {showPassword ? <IconEyeOff className="w-4 h-4" /> : <IconEye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Konfirmasi Kata Sandi */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1 text-xs">
              Konfirmasi Kata Sandi
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ulangi kata sandi Anda"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-xs sm:text-sm"
            />
          </div>

          {/* Ketentuan Jam Kerja & GPS */}
          <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-[11px] text-slate-600 leading-relaxed">
            Pendaftaran akun ini terikat pada aturan jam kerja fleksibel (minimal durasi kerja 8 jam 30 menit dari jam absen masuk) serta verifikasi swafoto kamera live dan koordinat GPS mandatori sesuai standar operasional CV Mandala Mahardika.
          </div>

          {/* Tombol Submit */}
          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full py-3 font-bold"
              disabled={isLoadingAuth}
            >
              {isLoadingAuth ? 'Mendaftarkan Akun...' : 'Daftar & Masuk ke Sistem'}
            </Button>
          </div>
        </form>

        {/* Tautan Masuk */}
        <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-500">
          Sudah memiliki akun terdaftar?{' '}
          <button
            onClick={() => navigateTo('login')}
            className="font-bold text-primary hover:underline"
          >
            Masuk di sini
          </button>
        </div>
      </div>
    </div>
  );
};
