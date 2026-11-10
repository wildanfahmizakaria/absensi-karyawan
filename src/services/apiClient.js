/**
 * apiClient.js — Centralized HTTP Client & Backend Connector (CV Mandala Mahardika API)
 * Terhubung langsung ke REST API Backend Produksi:
 * Base URL: https://absensi-karyawan-backend-production.up.railway.app/api/v1
 * 
 * Standar Kontrak Respons:
 * {
 *   data: Object | Array | null,
 *   meta: { page, limit, total, total_pages, ... },
 *   error: { code, message } | null
 * }
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://absensi-karyawan-backend-production.up.railway.app/api/v1';
const USE_MOCK_ADAPTER = import.meta.env.VITE_USE_MOCK_ADAPTER === 'true';

export const apiClient = {
  isMockMode: () => USE_MOCK_ADAPTER,
  getBaseUrl: () => API_BASE_URL,

  /**
   * Mengambil token autentikasi aktif dari localStorage
   */
  getAuthToken: () => {
    try {
      const session = localStorage.getItem('mandala_auth_session');
      if (session) {
        const parsed = JSON.parse(session);
        return parsed.token || null;
      }
    } catch (e) {
      // ignore
    }
    return null;
  },

  /**
   * Request GET
   */
  get: async (endpoint, customHeaders = {}) => {
    const token = apiClient.getAuthToken();
    const headers = {
      'Accept': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...customHeaders,
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers,
      });

      const json = await response.json();
      return json;
    } catch (err) {
      return {
        data: null,
        meta: {},
        error: {
          code: 'NETWORK_ERROR',
          message: err.message || 'Koneksi ke backend server gagal.',
        },
      };
    }
  },

  /**
   * Request POST (JSON)
   */
  post: async (endpoint, body, customHeaders = {}) => {
    const token = apiClient.getAuthToken();
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...customHeaders,
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      const json = await response.json();
      return json;
    } catch (err) {
      return {
        data: null,
        meta: {},
        error: {
          code: 'NETWORK_ERROR',
          message: err.message || 'Gagal mengirim data ke server.',
        },
      };
    }
  },

  /**
   * Request POST Multipart (Form-Data untuk Foto Swafoto Live & Koordinat GPS)
   */
  postMultipart: async (endpoint, formData, customHeaders = {}) => {
    const token = apiClient.getAuthToken();
    const headers = {
      'Accept': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...customHeaders,
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: formData,
      });

      const json = await response.json();
      return json;
    } catch (err) {
      return {
        data: null,
        meta: {},
        error: {
          code: 'MULTIPART_ERROR',
          message: err.message || 'Gagal mengunggah rekaman presensi ke server.',
        },
      };
    }
  },

  /**
   * Request PUT (JSON)
   */
  put: async (endpoint, body, customHeaders = {}) => {
    const token = apiClient.getAuthToken();
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...customHeaders,
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(body),
      });

      const json = await response.json();
      return json;
    } catch (err) {
      return {
        data: null,
        meta: {},
        error: {
          code: 'NETWORK_ERROR',
          message: err.message || 'Gagal memperbarui data di server.',
        },
      };
    }
  },

  /**
   * Request PATCH (JSON)
   */
  patch: async (endpoint, body = {}, customHeaders = {}) => {
    const token = apiClient.getAuthToken();
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...customHeaders,
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(body),
      });

      const json = await response.json();
      return json;
    } catch (err) {
      return {
        data: null,
        meta: {},
        error: {
          code: 'NETWORK_ERROR',
          message: err.message || 'Gagal memperbarui data parsial di server.',
        },
      };
    }
  },

  /**
   * Request DELETE
   */
  delete: async (endpoint, customHeaders = {}) => {
    const token = apiClient.getAuthToken();
    const headers = {
      'Accept': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...customHeaders,
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers,
      });

      const json = await response.json();
      return json;
    } catch (err) {
      return {
        data: null,
        meta: {},
        error: {
          code: 'NETWORK_ERROR',
          message: err.message || 'Gagal menghapus data di server.',
        },
      };
    }
  },

  /**
   * Unduh Berkas Stream / Blob (CSV / PDF)
   */
  downloadBlob: async (endpoint, defaultFilename = 'laporan_absensi') => {
    const token = apiClient.getAuthToken();
    const headers = {
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        let errorMsg = 'Gagal mengunduh berkas laporan.';
        try {
          const errJson = await response.json();
          if (errJson?.error?.message) errorMsg = errJson.error.message;
        } catch (e) {
          // ignore
        }
        return { success: false, error: errorMsg };
      }

      const blob = await response.blob();
      const disposition = response.headers.get('Content-Disposition');
      let filename = defaultFilename;
      if (disposition && disposition.includes('filename=')) {
        const match = disposition.match(/filename="?([^"]+)"?/);
        if (match && match[1]) filename = match[1];
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      return { success: true, filename };
    } catch (err) {
      return {
        success: false,
        error: err.message || 'Gagal mengunduh file dari server.',
      };
    }
  },
};
