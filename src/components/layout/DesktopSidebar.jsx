import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { Badge } from '../common/Badge';
import {
  IconHome,
  IconChart,
  IconShield,
  IconHistory,
  IconFileText,
  IconSettings,
  IconBuilding,
  IconClock,
  IconMapPin,
  IconUsers,
} from '../common/Icons';

export const DesktopSidebar = () => {
  const { currentRole, currentUser } = useAuth();
  const { currentPage, navigateTo, getDefaultPageForRole } = useNavigation();

  const getMenuItems = () => {
    const dashboardPage = getDefaultPageForRole(currentRole);

    if (currentRole === 'employee') {
      return [
        {
          id: dashboardPage,
          label: 'Beranda Karyawan',
          icon: IconHome,
          desc: 'Absensi Masuk / Pulang',
        },
        {
          id: 'history',
          label: 'Riwayat Absensi',
          icon: IconHistory,
          desc: 'Catatan Kehadiran Saya',
        },
        {
          id: 'settings',
          label: 'Profil & Jadwal',
          icon: IconSettings,
          desc: 'Informasi Karyawan',
        },
      ];
    }

    if (currentRole === 'admin') {
      return [
        {
          id: dashboardPage,
          label: 'Dashboard Admin',
          icon: IconChart,
          desc: 'Ringkasan & KPI Kehadiran',
        },
        {
          id: 'employees',
          label: 'Kelola Karyawan',
          icon: IconUsers,
          desc: 'Data Karyawan & Status',
        },
        {
          id: 'history',
          label: 'Monitoring Absensi',
          icon: IconHistory,
          desc: 'Riwayat & Log Karyawan',
        },
        {
          id: 'reports',
          label: 'Laporan & Rekap',
          icon: IconFileText,
          desc: 'Filter & Ekspor CSV/PDF',
        },
        {
          id: 'settings',
          label: 'Pengaturan & Jadwal',
          icon: IconSettings,
          desc: 'Jadwal Kerja Tetap & Info',
        },
      ];
    }

    // Superadmin
    return [
      {
        id: dashboardPage,
        label: 'Dashboard Sistem',
        icon: IconShield,
        desc: 'Audit & Operasional Global',
      },
      {
        id: 'employees',
        label: 'Kelola Karyawan',
        icon: IconUsers,
        desc: 'Manajemen Akun Seluruh Staf',
      },
      {
        id: 'history',
        label: 'Riwayat Seluruh Absensi',
        icon: IconHistory,
        desc: 'Validasi & Detail Lokasi',
      },
      {
        id: 'reports',
        label: 'Laporan Eksekutif',
        icon: IconFileText,
        desc: 'Ekspor Data CSV/PDF',
      },
      {
        id: 'settings',
        label: 'Konfigurasi Sistem',
        icon: IconSettings,
        desc: 'Jadwal Tetap & Organisasi',
      },
    ];
  };

  const menuItems = getMenuItems();

  return (
    <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-white border-r border-brand-border flex-shrink-0">
      {/* Profil Singkat Peran */}
      <div className="p-5 border-b border-brand-border">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
            {currentUser.avatar}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-bold text-slate-900 truncate">
              {currentUser.name}
            </h4>
            <p className="text-xs text-slate-500 truncate">
              {currentUser.roleLabel}
            </p>
          </div>
        </div>
      </div>

      {/* Nav Menu */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
          Menu Navigasi
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => navigateTo(item.id)}
              className={`w-full flex items-start gap-3 px-3.5 py-3 rounded-control text-left transition-all ${
                isActive
                  ? 'bg-blue-50/80 text-primary font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div
                className={`mt-0.5 p-1 rounded-lg ${
                  isActive ? 'bg-primary text-white shadow-xs' : 'text-slate-400'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-sm leading-tight block">{item.label}</span>
                <span className="text-xs text-slate-400 font-normal leading-tight block mt-0.5">
                  {item.desc}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Info Organisasi & Aturan SOT */}
      <div className="p-4 border-t border-brand-border bg-slate-50/60 m-3 rounded-card space-y-2 text-xs">
        <div className="flex items-center gap-2 text-slate-700 font-semibold">
          <IconBuilding className="w-4 h-4 text-primary" />
          <span>CV Mandala Mahardika</span>
        </div>
        <div className="flex items-center gap-2 text-slate-500">
          <IconClock className="w-3.5 h-3.5 text-slate-400" />
          <span>Batas Kerja: Min. 8j 30m</span>
        </div>
        <div className="flex items-center gap-2 text-slate-500">
          <IconMapPin className="w-3.5 h-3.5 text-slate-400" />
          <span>GPS Dicatat (Tanpa Geofence)</span>
        </div>
        <div className="pt-2 border-t border-slate-200">
          <Badge variant="mock" size="sm" className="w-full justify-center">
            Fondasi Front-end v0.2
          </Badge>
        </div>
      </div>
    </aside>
  );
};
