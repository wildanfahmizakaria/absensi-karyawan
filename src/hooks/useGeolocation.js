import { useState, useCallback } from 'react';

/**
 * Hook useGeolocation — Pengambilan Lokasi GPS Perangkat
 * Sesuai SOT v0.2:
 * - Mengambil koordinat GPS (latitude, longitude, accuracy_m) via Geolocation API
 * - Wajib diambil untuk setiap transaksi absensi sebagai bukti kehadiran otentik
 * - Tanpa pembatasan radius geofence kantor (SOT v0.2: GPS dicatat tanpa penolakan radius)
 */
export const useGeolocation = () => {
  const [coords, setCoords] = useState(null);
  const [status, setStatus] = useState('idle'); // 'idle' | 'locating' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');

  const getLocation = useCallback(() => {
    return new Promise((resolve) => {
      setStatus('locating');
      setErrorMessage('');

      if (!navigator.geolocation) {
        setStatus('error');
        const err = 'Browser Anda tidak mendukung layanan Geolocation API.';
        setErrorMessage(err);
        resolve({ success: false, error: err });
        return;
      }

      const attemptFetch = (isHighAccuracy = true) => {
        const options = {
          enableHighAccuracy: isHighAccuracy,
          timeout: isHighAccuracy ? 8000 : 15000,
          maximumAge: isHighAccuracy ? 0 : 60000,
        };

        navigator.geolocation.getCurrentPosition(
          (position) => {
            const locationData = {
              latitude: Number(position.coords.latitude.toFixed(6)),
              longitude: Number(position.coords.longitude.toFixed(6)),
              accuracy_m: Math.round(position.coords.accuracy || 15),
              timestamp: new Date(position.timestamp).toISOString(),
            };

            setCoords(locationData);
            setStatus('success');
            resolve({ success: true, coords: locationData });
          },
          (error) => {
            // Jika mode akurasi tinggi gagal/timeout di PC tanpa sensor satelit GPS, coba standar (Wi-Fi/jaringan)
            if (isHighAccuracy && (error.code === error.TIMEOUT || error.code === error.POSITION_UNAVAILABLE)) {
              attemptFetch(false);
              return;
            }

            let errText = '';
            switch (error.code) {
              case error.PERMISSION_DENIED:
                errText =
                  'Izin akses lokasi GPS ditolak oleh pengguna atau browser. Silakan aktifkan izin lokasi untuk melakukan absensi.';
                break;
              case error.POSITION_UNAVAILABLE:
                errText =
                  'Sinyal lokasi GPS perangkat tidak tersedia atau sedang lemah.';
                break;
              case error.TIMEOUT:
                errText =
                  'Waktu pencarian koordinat lokasi habis (timeout). Silakan coba lagi.';
                break;
              default:
                errText = `Gagal memperoleh lokasi: ${error.message || 'Kesalahan sensor'}`;
            }

            setStatus('error');
            setErrorMessage(errText);
            resolve({ success: false, error: errText });
          },
          options
        );
      };

      attemptFetch(true);
    });
  }, []);

  /**
   * Helper fallback koordinat simulasi (jika pengguna menguji di PC tanpa sensor GPS)
   */
  const useSimulatedLocation = useCallback(() => {
    const fallbackCoords = {
      latitude: -6.982614,
      longitude: 110.409152,
      accuracy_m: 8.5,
      isSimulated: true,
      timestamp: new Date().toISOString(),
    };
    setCoords(fallbackCoords);
    setStatus('success');
    setErrorMessage('');
    return fallbackCoords;
  }, []);

  const resetLocation = useCallback(() => {
    setCoords(null);
    setStatus('idle');
    setErrorMessage('');
  }, []);

  return {
    coords,
    status,
    errorMessage,
    getLocation,
    useSimulatedLocation,
    resetLocation,
  };
};
