import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { PAGE_PERMISSIONS } from '../../data/mockData';
import { Card } from './Card';
import { Button } from './Button';
import { Badge } from './Badge';
import { IconShield, IconAlertTriangle, IconArrowLeft } from './Icons';

export const RouteGuard = ({ pageId, children }) => {
  const { isAuthenticated, currentRole, currentUser } = useAuth();
  const { navigateTo, getDefaultPageForRole } = useNavigation();

  if (!isAuthenticated) {
    navigateTo('login');
    return null;
  }

  const allowedRoles = PAGE_PERMISSIONS[pageId] || ['employee', 'admin', 'superadmin'];
  const hasAccess = allowedRoles.includes(currentRole);

  if (!hasAccess) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <Card className="border-rose-200 shadow-float overflow-hidden">
          <div className="bg-gradient-to-r from-rose-500 to-rose-600 p-6 text-white text-center">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-3">
              <IconAlertTriangle className="w-9 h-9 text-white" />
            </div>
            <h2 className="text-xl font-bold tracking-tight">
              403 — Akses Ditolak (Peran Tidak Diizinkan)
            </h2>
            <p className="text-rose-100 text-xs sm:text-sm mt-1">
              Hak akses halaman ini dibatasi sesuai kontrol akses berbasis peran (RBAC)
            </p>
          </div>

          <div className="p-6 space-y-4 text-center">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs sm:text-sm text-slate-700 space-y-2">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-500">Halaman yang Diminta:</span>
                <span className="font-mono font-semibold text-slate-900">{pageId}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-500">Peran Akun Aktif:</span>
                <Badge variant="primary" size="sm">
                  {currentUser.roleLabel} ({currentRole})
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Peran yang Diizinkan:</span>
                <span className="font-semibold text-rose-600">
                  {allowedRoles.join(', ')}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Akun Anda tidak memiliki kewenangan operasional untuk mengakses modul ini. Silakan kembali ke dashboard yang sesuai dengan peran Anda atau hubungi Superadmin jika Anda memerlukan izin tambahan.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                variant="primary"
                size="md"
                icon={IconArrowLeft}
                onClick={() => navigateTo(getDefaultPageForRole(currentRole))}
              >
                Kembali ke Dashboard {currentUser.roleLabel}
              </Button>
            </div>

            <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400">
              *Catatan Keamanan SOT: Pembatasan antarmuka ini dilindungi oleh guard UI sisi klien. Di lingkungan produksi, otorisasi wajib ditegakkan secara independen oleh server.
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return children;
};
