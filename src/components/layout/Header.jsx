import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { IconBuilding, IconLogOut, IconX, IconAlertTriangle } from '../common/Icons';

export const Header = () => {
  const { currentUser, currentRole, logout } = useAuth();
  const { navigateTo } = useNavigation();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  React.useEffect(() => {
    if (!showLogoutConfirm) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setShowLogoutConfirm(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showLogoutConfirm]);

  const confirmLogout = () => {
    logout();
    setShowLogoutConfirm(false);
    navigateTo('login');
  };

  const getRoleBadgeVariant = () => {
    switch (currentRole) {
      case 'superadmin':
        return 'danger';
      case 'admin':
        return 'warning';
      default:
        return 'primary';
    }
  };

  return (
    <>
      {/* Dialog Konfirmasi Logout */}
      {showLogoutConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Konfirmasi Keluar Akun"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn"
        >
          <div className="bg-white rounded-card max-w-sm w-full p-6 shadow-float border border-brand-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0">
                <IconAlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Konfirmasi Keluar
                </h3>
                <p className="text-xs text-slate-500">
                  Sesi login Anda akan diakhiri
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 mb-5 leading-relaxed">
              Apakah Anda yakin ingin keluar dari akun <strong>{currentUser.name}</strong> ({currentUser.roleLabel})?
            </p>

            <div className="flex justify-end gap-2.5">
              <Button
                variant="outline"
                size="md"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Batal
              </Button>
              <Button
                variant="danger"
                size="md"
                onClick={confirmLogout}
              >
                Keluar Sekarang
              </Button>
            </div>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-brand-border w-full">
        <div className="w-full px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 gap-3">
            {/* Logo & Brand Identity */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-blue-500 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                <IconBuilding className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 tracking-tight text-base sm:text-lg">
                    Mandala Mahardika
                  </span>
                  <span className="hidden md:inline-block">
                    <Badge variant={getRoleBadgeVariant()} size="sm">
                      {currentUser.roleLabel}
                    </Badge>
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium leading-none hidden sm:block">
                  Sistem Absensi Karyawan
                </p>
              </div>
            </div>

            {/* Right controls: User profile & logout */}
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-2.5 pl-2">
                <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs flex-shrink-0">
                  {currentUser.avatar}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-semibold text-slate-900 leading-tight">
                    {currentUser.name}
                  </p>
                  <p className="text-[11px] text-slate-500 leading-none truncate max-w-[140px]">
                    {currentUser.department}
                  </p>
                </div>

                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                  title="Keluar / Akhiri Sesi"
                  aria-label="Logout"
                >
                  <IconLogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};
