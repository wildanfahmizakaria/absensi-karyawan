import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { IconShield, IconUser, IconUsers } from '../common/Icons';

export const RoleSwitcher = () => {
  const { currentRole, switchRole } = useAuth();
  const { navigateTo, getDefaultPageForRole } = useNavigation();

  const handleRoleChange = (role) => {
    switchRole(role);
    navigateTo(getDefaultPageForRole(role));
  };

  const roles = [
    { id: 'employee', label: 'Karyawan', icon: IconUser },
    { id: 'admin', label: 'Admin', icon: IconUsers },
    { id: 'superadmin', label: 'Superadmin', icon: IconShield },
  ];

  return (
    <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
      <span className="text-[11px] font-semibold text-slate-500 uppercase px-2 hidden sm:inline">
        Simulasi Peran:
      </span>
      {roles.map((r) => {
        const Icon = r.icon;
        const isActive = currentRole === r.id;
        return (
          <button
            key={r.id}
            onClick={() => handleRoleChange(r.id)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              isActive
                ? 'bg-white text-primary shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
            title={`Ganti peran ke ${r.label}`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{r.label}</span>
          </button>
        );
      })}
    </div>
  );
};
