import React, { useEffect } from 'react';
import { IconCheckCircle, IconAlertCircle, IconInfo, IconX } from './Icons';

export const Toast = ({
  message,
  type = 'success',
  onClose,
  duration = 3500,
}) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const typeConfig = {
    success: {
      bg: 'bg-emerald-600',
      icon: IconCheckCircle,
    },
    error: {
      bg: 'bg-rose-600',
      icon: IconAlertCircle,
    },
    info: {
      bg: 'bg-blue-600',
      icon: IconInfo,
    },
  };

  const currentType = typeConfig[type] || typeConfig.success;
  const Icon = currentType.icon;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 z-50 animate-slideUp">
      <div
        className={`${currentType.bg} text-white px-4 py-3 rounded-xl shadow-float flex items-center gap-3 text-xs sm:text-sm font-medium border border-white/10 max-w-sm`}
      >
        <Icon className="w-5 h-5 flex-shrink-0" />
        <span className="flex-1">{message}</span>
        <button
          onClick={onClose}
          className="text-white/80 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors"
          aria-label="Tutup notifikasi"
        >
          <IconX className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
