import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import {
  IconHome,
  IconHistory,
  IconFileText,
  IconSettings,
  IconChart,
  IconShield,
  IconUsers,
} from '../common/Icons';

export const MobileBottomNav = () => {
  const { currentRole } = useAuth();
  const { currentPage, navigateTo, getDefaultPageForRole } = useNavigation();

  // Konfigurasi item menu per peran
  const getNavItems = () => {
    const dashboardPage = getDefaultPageForRole(currentRole);

    if (currentRole === 'employee') {
      return [
        { id: dashboardPage, label: 'Beranda', icon: IconHome },
        { id: 'history', label: 'Riwayat', icon: IconHistory },
        { id: 'settings', label: 'Profil', icon: IconSettings },
      ];
    }

    if (currentRole === 'admin') {
      return [
        { id: dashboardPage, label: 'Dashboard', icon: IconChart },
        { id: 'employees', label: 'Karyawan', icon: IconUsers },
        { id: 'history', label: 'Riwayat', icon: IconHistory },
        { id: 'reports', label: 'Laporan', icon: IconFileText },
        { id: 'settings', label: 'Pengaturan', icon: IconSettings },
      ];
    }

    // superadmin
    return [
      { id: dashboardPage, label: 'Sistem', icon: IconShield },
      { id: 'employees', label: 'Karyawan', icon: IconUsers },
      { id: 'history', label: 'Riwayat', icon: IconHistory },
      { id: 'reports', label: 'Laporan', icon: IconFileText },
      { id: 'settings', label: 'Konfigurasi', icon: IconSettings },
    ];
  };

  const navItems = getNavItems();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-brand-border shadow-float">
      <div
        className="grid max-w-lg mx-auto"
        style={{ gridTemplateColumns: `repeat(${navItems.length}, minmax(0, 1fr))` }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => navigateTo(item.id)}
              className={`flex flex-col items-center justify-center py-2 min-h-[56px] transition-colors ${
                isActive
                  ? 'text-primary font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div
                className={`p-1 rounded-lg transition-transform ${
                  isActive ? 'scale-110 bg-blue-50 text-primary' : ''
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[11px] mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
