import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Hook useCamera — Pengelolaan Stream Kamera Live (getUserMedia)
 * Sesuai SOT PRD & AGENTS.md:
 * - Menggunakan stream live kamera perangkat (getUserMedia)
 * - Foto diambil langsung dari stream frame video ke canvas (bukan upload file galeri)
 * - Menangani error izin ditolak, kamera tidak ditemukan, atau insecure context
 */
export const useCamera = () => {
  const [stream, setStream] = useState(null);
  const [status, setStatus] = useState('idle'); // 'idle' | 'requesting' | 'active' | 'denied' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [facingMode, setFacingMode] = useState('user'); // 'user' (depan/swafoto) | 'environment' (belakang)
  const videoRef = useRef(null);

  // Memulai stream kamera live
  const startCamera = useCallback(async (customFacingMode = facingMode) => {
    setStatus('requesting');
    setErrorMessage('');

    // Periksa dukungan secure context dan navigator.mediaDevices
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setStatus('error');
      setErrorMessage(
        'Browser Anda tidak mendukung akses kamera live atau konteks tidak aman (memerlukan HTTPS / localhost).'
      );
      return false;
    }

    try {
      // Hentikan stream sebelumnya jika ada
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      const constraints = {
        video: {
          facingMode: customFacingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);
      setStatus('active');

      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        videoRef.current.play().catch((err) => {
          console.warn('Video autoplay dicegah oleh browser:', err);
        });
      }
      return true;
    } catch (err) {
      console.error('Gagal mengakses kamera:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setStatus('denied');
        setErrorMessage(
          'Izin akses kamera ditolak. Silakan berikan izin kamera pada pengaturan izin situs browser Anda untuk melakukan absensi.'
        );
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setStatus('error');
        setErrorMessage(
          'Perangkat kamera tidak ditemukan pada komputer/HP Anda.'
        );
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setStatus('error');
        setErrorMessage(
          'Kamera sedang digunakan oleh aplikasi lain. Tutup aplikasi tersebut dan coba lagi.'
        );
      } else {
        setStatus('error');
        setErrorMessage(
          `Gagal memulai kamera: ${err.message || 'Kesalahan tidak diketahui'}`
        );
      }
      return false;
    }
  }, [facingMode, stream]);

  // Menghentikan stream kamera dan membebaskan hardware
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStatus('idle');
  }, [stream]);

  // Beralih antara kamera depan (swafoto) dan belakang
  const toggleFacingMode = useCallback(() => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextMode);
    startCamera(nextMode);
  }, [facingMode, startCamera]);

  // Mengambil frame foto langsung dari stream video ke Blob JPEG
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || status !== 'active') {
      return Promise.resolve(null);
    }

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (!ctx) return Promise.resolve(null);

    // Jika kamera depan, buat cermin (mirror) agar foto swafoto natural
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.88);

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve({ blob, dataUrl });
          } else {
            resolve(null);
          }
        },
        'image/jpeg',
        0.88
      );
    });
  }, [facingMode, status]);

  // Bersihkan stream jika unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  return {
    videoRef,
    stream,
    status,
    errorMessage,
    facingMode,
    startCamera,
    stopCamera,
    toggleFacingMode,
    capturePhoto,
  };
};
