/**
 * apiClient.js — Centralized HTTP Client & Backend Connector (SOT v0.2)
 * Digunakan untuk menjembatani komunikasi ke REST API backend produksi.
 * 
 * Standar Kontrak Respons SOT:
 * {
 *   data: Object | Array | null,
 *   meta: { timestamp, message, ... },
 *   error: { code, message, details } | null
 * }
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';
const USE_MOCK_ADAPTER = import.meta.env.VITE_USE_MOCK_ADAPTER !== 'false';

/**
 * Helper pembungkus request fetch dengan token otorisasi otomatis
 */
export const apiClient = {
  isMockMode: () => USE_MOCK_ADAPTER,
  getBaseUrl: () => API_BASE_URL,

  /**
   * Mengambil token autentikasi aktif dari session
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
   * Request GET umum
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
   * Request POST umum (JSON)
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
      // Catatan: Content-Type dibiarkan kosong agar browser otomatis menambahkan boundary multipart/form-data
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
   * Request PUT umum
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
};
