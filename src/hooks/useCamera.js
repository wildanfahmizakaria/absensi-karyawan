import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Hook useCamera — Mode SOT Fase 1 (Simulasi / Mock)
 * Sesuai kontrak AGENTS.md & IMPLEMENTATION_PLAN.md Fase 1:
 * - Akses perangkat hardware kamera (getUserMedia) DINONAKTIFKAN kembali.
 * - Menggunakan generator swafoto tiruan (Mock / Canvas Simulation) dengan label jelas.
 * - Tidak memicu dialog izin kamera pada peramban klien.
 * - Kamera live nyata dijadwalkan pada rilis persetujuan Fase 3.
 */

// Helper untuk menghasilkan gambar swafoto simulasi Fase 1
const generateMockSelfie = (width = 640, height = 480) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return { dataUrl: '', blob: null };

  // Background gradien profesional
  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, '#1E293B');
  grad.addColorStop(1, '#0F172A');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Siluet wajah karyawan
  ctx.fillStyle = '#334155';
  ctx.beginPath();
  // Kepala
  ctx.arc(width / 2, height * 0.42, 85, 0, Math.PI * 2);
  ctx.fill();
  // Pundak / Badan
  ctx.beginPath();
  ctx.arc(width / 2, height + 40, 160, Math.PI, 0);
  ctx.fill();

  // Watermark / Badge Simulasi Fase 1
  ctx.fillStyle = 'rgba(239, 68, 68, 0.9)'; // Rose/Red badge
  ctx.roundRect ? ctx.roundRect(16, 16, 260, 28, 6) : ctx.fillRect(16, 16, 260, 28);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('MOCK DATA — SIMULASI FASE 1', 26, 35);

  // Informasi Timestamp & Instansi
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.font = '11px monospace';
  const nowStr = new Date().toLocaleString('id-ID');
  ctx.fillText(`CV Mandala Mahardika • ${nowStr}`, 16, height - 20);

  const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
  return { dataUrl, canvas };
};

export const useCamera = () => {
  const [stream, setStream] = useState(null);
  const [status, setStatus] = useState('idle'); // 'idle' | 'requesting' | 'active'
  const [errorMessage, setErrorMessage] = useState('');
  const [facingMode, setFacingMode] = useState('user');
  const videoRef = useRef(null);

  // Memulai simulasi kamera Fase 1 (tanpa memanggil getUserMedia perangkat)
  const startCamera = useCallback(() => {
    setStatus('requesting');
    setErrorMessage('');

    // Simulasi inisialisasi cepat 150ms
    setTimeout(() => {
      setStatus('active');
    }, 150);
  }, []);

  // Hentikan simulasi
  const stopCamera = useCallback(() => {
    setStatus('idle');
  }, []);

  // Beralih facing mode simulasi
  const toggleFacingMode = useCallback(() => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  }, []);

  // Mengambil frame foto simulasi ke Blob JPEG
  const capturePhoto = useCallback(() => {
    return new Promise((resolve) => {
      const { dataUrl, canvas } = generateMockSelfie();
      if (!canvas) {
        resolve(null);
        return;
      }

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve({ blob, dataUrl });
          } else {
            resolve(null);
          }
        },
        'image/jpeg',
        0.9
      );
    });
  }, []);

  return {
    videoRef,
    stream,
    status,
    errorMessage,
    facingMode,
    isMockMode: true,
    startCamera,
    stopCamera,
    toggleFacingMode,
    capturePhoto,
  };
};
