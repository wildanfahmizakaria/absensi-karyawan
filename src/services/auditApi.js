import { MOCK_AUDIT_LOGS } from '../data/mockData';
import { apiClient } from './apiClient';

const STORAGE_KEY_AUDIT = 'mandala_audit_logs';

export const auditApi = {
  getAuditLogs: async () => {
    if (!apiClient.isMockMode()) {
      return apiClient.get('/audit-logs');
    }

    await new Promise((r) => setTimeout(r, 150));
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY_AUDIT);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      // fallback
    }
    return MOCK_AUDIT_LOGS;
  },

  logAction: async (actorName, actionType, details) => {
    if (!apiClient.isMockMode()) {
      return apiClient.post('/audit-logs', { actor: actorName, action: actionType, details });
    }

    try {
      const currentLogs = await auditApi.getAuditLogs();
      const now = new Date();
      const timeString = `${now.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(
        2,
        '0'
      )}:${String(now.getSeconds()).padStart(2, '0')} WIB`;

      const newLog = {
        id: `AUD-${Date.now().toString().slice(-4)}`,
        timestamp: timeString,
        actor: actorName || 'Admin Sistem',
        action: actionType,
        details,
      };

      const updatedLogs = [newLog, ...currentLogs];
      sessionStorage.setItem(STORAGE_KEY_AUDIT, JSON.stringify(updatedLogs));
      return newLog;
    } catch (e) {
      console.warn('Gagal mencatat audit log:', e);
      return null;
    }
  },
};
