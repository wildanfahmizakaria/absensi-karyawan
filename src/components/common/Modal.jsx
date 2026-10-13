import React from 'react';
import { IconX, IconInfo } from './Icons';
import { Button } from './Button';

export const Modal = ({
  isOpen,
  onClose,
  title = "Fitur Belum Tersedia",
  phase = "Fase Mendatang",
  message = "Fitur ini dijadwalkan pada fase berikutnya sesuai SOT Implementation Plan dan belum aktif pada Fase 1.",
}) => {
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn"
    >
      <div className="bg-white rounded-card max-w-md w-full p-6 shadow-float border border-brand-border">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-primary flex items-center justify-center flex-shrink-0">
              <IconInfo className="w-6 h-6" />
            </div>
            <div>
              <h3 id="modal-title" className="text-base font-bold text-brand-text">{title}</h3>
              <span className="text-xs font-medium text-primary bg-blue-50 px-2 py-0.5 rounded">
                Target: {phase}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-brand-muted hover:text-brand-text p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <IconX className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-control p-3.5 mb-5 text-sm text-slate-700 leading-relaxed">
          {message}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="primary" size="md" onClick={onClose}>
            Mengerti
          </Button>
        </div>
      </div>
    </div>
  );
};
