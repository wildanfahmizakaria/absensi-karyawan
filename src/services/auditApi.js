/**
 * auditApi.js — Service Rekam Jejak Audit Sistem CV Mandala Mahardika
 * Mengonsumsi REST API Backend Produksi:
 * - GET /admin/audit-logs
 */

import { apiClient } from './apiClient';

export const auditApi = {
  /**
   * Mengambil rekam jejak audit sistem dari server
   */
  getAuditLogs: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page);
    query.append('limit', params.limit || '50');
    if (params.action && params.action !== 'ALL') query.append('action', params.action);
    if (params.entityType) query.append('entity_type', params.entityType);

    const res = await apiClient.get(`/admin/audit-logs?${query.toString()}`);

    if (res.error) {
      return [];
    }

    const rawList = res.data || [];
    return rawList.map((log) => {
      const actorName = log.full_name
        ? `${log.full_name} (${log.employee_code || log.role})`
        : log.actor || 'Admin Sistem';

      let detailsText = '';
      if (log.new_values && typeof log.new_values === 'object') {
        detailsText = JSON.stringify(log.new_values).replace(/["{}]/g, ' ');
      } else if (log.old_values && typeof log.old_values === 'object') {
        detailsText = JSON.stringify(log.old_values).replace(/["{}]/g, ' ');
      } else {
        detailsText = log.entity_type ? `Entitas: ${log.entity_type}` : '-';
      }

      return {
        id: `AUD-${log.id}`,
        rawId: log.id,
        timestamp: log.created_at || new Date().toISOString(),
        actor: actorName,
        action: log.action,
        details: detailsText,
        ipAddress: log.ip_address,
        raw: log,
      };
    });
  },

  /**
   * Helper lokal jika UI ingin merekam audit log (audit server otomatis dicatat oleh middleware)
   */
  logAction: async (actorName, actionType, details) => {
    // Backend API mencatat audit secara otomatis di controller / middleware server
    return null;
  },
};
