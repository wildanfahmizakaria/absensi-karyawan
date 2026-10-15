import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Hook useCamera — Pengelolaan Stream Kamera Live (getUserMedia)
 * Sesuai SOT PRD & AGENTS.md:
 * - Menggunakan stream live kamera perangkat (getUserMedia)
 * - Foto diambil langsung dari stream frame video ke canvas (bukan upload file galeri)
 * - Menangani error izin ditolak, kamera tidak ditemukan, atau insecure context
 * - Stabil terhadap re-render loop React
 */
export const useCamera = () => {
  const [stream, setStream] = useState(null);
  const [status, setStatus] = useState('idle'); // 'idle' | 'requesting' | 'active' | 'denied' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [facingMode, setFacingMode] = useState('user'); // 'user' (depan/swafoto) | 'environment' (belakang)
  
  const streamRef = useRef(null);
  const videoRef = useRef(null);
  const facingModeRef = useRef(facingMode);

  // Selaraskan ref facingMode
  useEffect(() => {
    facingModeRef.current = facingMode;
  }, [facingMode]);

  // Hentikan stream dan bebaskan perangkat kamera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {
          console.warn('Gagal menghentikan track kamera:', e);
        }
      });
      streamRef.current = null;
    }
    setStream(null);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStatus('idle');
  }, []);

  // Memulai stream kamera live dengan multi-tier fallback
  const startCamera = useCallback(async (customFacingMode) => {
    const targetFacingMode = customFacingMode || facingModeRef.current || 'user';
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
      // Hentikan stream aktif sebelumnya jika ada
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      let newStream = null;

      // Tier 1: Coba resolusi ideal dan facingMode yang diinginkan
      try {
        newStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: targetFacingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch (errTier1) {
        console.warn('Kamera Tier 1 (resolusi ideal) gagal, mencoba Tier 2 (facingMode murni):', errTier1);
        
        // Tier 2: Tanpa batas resolusi ideal (mengatasi ponsel dengan orientasi portrait 720x1280)
        try {
          newStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: targetFacingMode },
            audio: false,
          });
        } catch (errTier2) {
          console.warn('Kamera Tier 2 gagal, mencoba Tier 3 (video standar):', errTier2);
          
          // Tier 3: Menggunakan kamera video apapun yang tersedia di sistem
          newStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        }
      }

      if (!newStream) {
        throw new Error('Tidak ada stream video yang diterima dari browser.');
      }

      streamRef.current = newStream;
      setStream(newStream);
      setStatus('active');

      // Hubungkan ke elemen video langsung jika sudah terpasang di DOM
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        videoRef.current.muted = true;
        videoRef.current.playsInline = true;
        videoRef.current.play().catch((playErr) => {
          console.warn('Video play autoplay dicegah oleh browser:', playErr);
        });
      }

      return true;
    } catch (err) {
      console.error('Gagal mengakses kamera:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setStatus('denied');
        setErrorMessage(
          'Izin akses kamera ditolak. Silakan izinkan akses kamera pada pengaturan peramban / ikon gembok di bilah URL.'
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
          `Gagal memulai kamera: ${err.message || 'Kesalahan perangkat tidak diketahui'}`
        );
      }
      return false;
    }
  }, []);

  // Hubungkan videoRef secara otomatis setiap kali stream atau videoRef diperbarui
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.muted = true;
      videoRef.current.playsInline = true;
      videoRef.current.play().catch((playErr) => {
        console.warn('Video play sync error:', playErr);
      });
    }
  }, [stream]);

  // Beralih antara kamera depan (swafoto) dan belakang
  const toggleFacingMode = useCallback(() => {
    const nextMode = facingModeRef.current === 'user' ? 'environment' : 'user';
    setFacingMode(nextMode);
    startCamera(nextMode);
  }, [startCamera]);

  // Mengambil frame foto langsung dari stream video ke Blob JPEG
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !streamRef.current) {
      return Promise.resolve(null);
    }

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (!ctx) return Promise.resolve(null);

    // Jika kamera depan, buat efek cermin agar swafoto natural
    if (facingModeRef.current === 'user') {
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
  }, []);

  // Bersihkan stream jika unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

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
