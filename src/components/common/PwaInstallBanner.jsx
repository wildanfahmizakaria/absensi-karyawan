import React, { useState } from 'react';
import { usePwaInstall } from '../../hooks/usePwaInstall';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { Button } from './Button';
import { IconDownload, IconX, IconAlertTriangle } from './Icons';

export const PwaInstallBanner = () => {
  const { isInstallable, promptInstall } = usePwaInstall();
  const { isOnline } = useNetworkStatus();
  const [isDismissed, setIsDismissed] = useState(false);

  // Jika sedang offline, tampilkan notifikasi offline
  if (!isOnline) {
    return (
      <div className="bg-amber-600 text-white px-4 py-2.5 text-xs sm:text-sm font-medium flex items-center justify-between shadow-xs z-50 sticky top-0 animate-fadeIn w-full">
        <div className="flex items-center gap-2 w-full">
          <IconAlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-200" />
          <span>
            <strong>Perangkat Sedang Offline.</strong> Anda dapat melihat data riwayat tersimpan, namun verifikasi kamera dan rekaman GPS memerlukan internet.
          </span>
        </div>
      </div>
    );
  }

  // Jika dapat diinstall sebagai PWA dan belum ditutup pengguna
  if (!isInstallable || isDismissed) {
    return null;
  }

  return (
    <aside
      aria-label="Promosi Instalasi Aplikasi"
      className="bg-gradient-to-r from-blue-700 to-primary text-white px-4 py-2.5 text-xs sm:text-sm z-40 sticky top-0 shadow-xs animate-fadeIn w-full"
    >
      <div className="w-full flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
            <IconDownload className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-semibold block">Pasang Aplikasi Mandala Absensi</span>
            <span className="text-[11px] text-blue-100 hidden sm:inline">
              Akses cepat tanpa browser address bar dan performa responsif di layar utama smartphone.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={() => promptInstall()}
            className="bg-white text-primary hover:bg-blue-50 px-3 py-1 rounded-lg text-xs font-bold transition-all shadow-xs"
          >
            Pasang Sekarang
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 hover:bg-white/20 rounded-md text-white/80 hover:text-white transition-colors"
            aria-label="Tutup saran pemasangan PWA"
          >
            <IconX className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
