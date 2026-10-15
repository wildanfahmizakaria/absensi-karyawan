import { useState, useCallback } from 'react';

/**
 * Hook useGeolocation — Mode SOT Fase 1 (Simulasi / Mock)
 * Sesuai kontrak AGENTS.md & IMPLEMENTATION_PLAN.md Fase 1:
 * - Akses sensor hardware Geolocation API peramban DINONAKTIFKAN kembali.
 * - Menggunakan koordinat tiruan acuan kantor [MOCK DATA].
 * - Tidak memicu dialog izin lokasi pada peramban klien.
 * - Sensor lokasi GPS perangkat dijadwalkan aktif pada Fase 3.
 */
export const useGeolocation = () => {
  const [coords, setCoords] = useState({
    latitude: -6.982614,
    longitude: 110.409152,
    accuracy_m: 10,
    isMock: true,
    label: 'Kantor CV Mandala Mahardika (Simulasi SOT Fase 1)',
    timestamp: new Date().toISOString(),
  });
  const [status, setStatus] = useState('success'); // 'idle' | 'locating' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');

  // Pengambilan lokasi simulasi Fase 1
  const getLocation = useCallback(() => {
    return new Promise((resolve) => {
      setStatus('locating');
      setTimeout(() => {
        const mockLocation = {
          latitude: -6.982614,
          longitude: 110.409152,
          accuracy_m: 10,
          isMock: true,
          label: 'Kantor CV Mandala Mahardika (Simulasi SOT Fase 1)',
          timestamp: new Date().toISOString(),
        };
        setCoords(mockLocation);
        setStatus('success');
        resolve({ success: true, coords: mockLocation });
      }, 150);
    });
  }, []);

  const useSimulatedLocation = useCallback(() => {
    return coords;
  }, [coords]);

  const resetLocation = useCallback(() => {
    setStatus('success');
  }, []);

  return {
    coords,
    status,
    errorMessage,
    isMockMode: true,
    getLocation,
    useSimulatedLocation,
    resetLocation,
  };
};
