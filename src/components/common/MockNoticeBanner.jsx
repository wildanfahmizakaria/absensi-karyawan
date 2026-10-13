import React, { useState } from 'react';
import { IconInfo, IconX } from './Icons';

export const MockNoticeBanner = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white px-4 py-2.5 text-xs sm:text-sm border-b border-blue-800 w-full">
      <div className="w-full flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1">
          <span className="bg-amber-400 text-slate-950 font-bold px-2 py-0.5 rounded text-[11px] tracking-wide uppercase flex-shrink-0">
            Fase 1 Fondasi
          </span>
          <p className="text-blue-100 leading-snug">
            <strong className="text-white">Status Mock Data:</strong> Seluruh data pada antarmuka ini adalah data simulasi (Mock Data). Tombol aksi absensi live kamera dan rekaman GPS nyata dinonaktifkan sesuai kontrak SOT Fase 1.
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-blue-200 hover:text-white p-1 rounded hover:bg-blue-800/50 transition-colors"
          title="Tutup pemberitahuan"
          aria-label="Tutup pemberitahuan"
        >
          <IconX className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
