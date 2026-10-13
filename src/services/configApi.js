import { MOCK_WORK_SCHEDULE, MOCK_ORGANIZATION } from '../data/mockData';
import { auditApi } from './auditApi';
import { apiClient } from './apiClient';

const STORAGE_KEY_SCHEDULE = 'mandala_config_schedule';
const STORAGE_KEY_ORG = 'mandala_config_org';

export const configApi = {
  getWorkSchedule: async () => {
    if (!apiClient.isMockMode()) {
      return apiClient.get('/config/schedule');
    }

    await new Promise((r) => setTimeout(r, 150));
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY_SCHEDULE);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      // fallback
    }
    return MOCK_WORK_SCHEDULE;
  },

  updateWorkSchedule: async (newSchedule, actorName = 'Superadmin') => {
    if (!apiClient.isMockMode()) {
      return apiClient.put('/config/schedule', newSchedule);
    }

    await new Promise((r) => setTimeout(r, 250));
    try {
      sessionStorage.setItem(STORAGE_KEY_SCHEDULE, JSON.stringify(newSchedule));
      // Catat ke audit log
      await auditApi.logAction(
        actorName,
        'UPDATE_WORK_SCHEDULE',
        `Pembaruan aturan durasi kerja minimal: ${newSchedule.minDurationFormatted || `${newSchedule.minWorkHours || 8} jam ${newSchedule.minWorkMinutes || 30} menit`} dari jam masuk`
      );
      return { success: true, data: newSchedule };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  getOrganization: async () => {
    if (!apiClient.isMockMode()) {
      return apiClient.get('/config/organization');
    }

    await new Promise((r) => setTimeout(r, 150));
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY_ORG);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      // fallback
    }
    return MOCK_ORGANIZATION;
  },

  updateOrganization: async (newOrg, actorName = 'Superadmin') => {
    if (!apiClient.isMockMode()) {
      return apiClient.put('/config/organization', newOrg);
    }

    await new Promise((r) => setTimeout(r, 250));
    try {
      sessionStorage.setItem(STORAGE_KEY_ORG, JSON.stringify(newOrg));
      await auditApi.logAction(
        actorName,
        'UPDATE_ORGANIZATION',
        `Pembaruan profil organisasi: ${newOrg.companyName}, ${newOrg.address}`
      );
      return { success: true, data: newOrg };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },
};
