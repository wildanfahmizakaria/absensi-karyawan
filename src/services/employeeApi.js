/**
 * employeeApi.js — Service Manajemen Karyawan (CRUD Admin & Superadmin)
 * Mengonsumsi REST API Backend Produksi:
 * - GET    /admin/employees (List Karyawan terfilter)
 * - POST   /admin/employees (Tambah Karyawan Baru)
 * - GET    /admin/employees/:id (Detail Karyawan)
 * - PATCH  /admin/employees/:id (Perbarui Data Karyawan)
 * - DELETE /admin/employees/:id (Nonaktifkan Karyawan)
 */

import { apiClient } from './apiClient';

const mapRoleToBackend = (uiRole) => {
  if (!uiRole) return 'EMPLOYEE';
  const r = uiRole.toUpperCase();
  if (r === 'ADMIN') return 'ADMIN';
  if (r === 'SUPERADMIN') return 'SUPERADMIN';
  return 'EMPLOYEE';
};

const mapRoleToUI = (backendRole) => {
  if (!backendRole) return 'Karyawan';
  const r = backendRole.toUpperCase();
  if (r === 'SUPERADMIN') return 'Superadmin';
  if (r === 'ADMIN') return 'Admin';
  return 'Karyawan';
};

export const employeeApi = {
  /**
   * Mengambil daftar seluruh karyawan dengan parameter filter
   */
  getEmployees: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page);
    query.append('limit', params.limit || '50');
    if (params.search) query.append('search', params.search);
    if (params.role && params.role !== 'ALL') query.append('role', mapRoleToBackend(params.role));
    if (params.isActive !== undefined && params.isActive !== 'ALL') {
      query.append('is_active', params.isActive ? '1' : '0');
    }

    const res = await apiClient.get(`/admin/employees?${query.toString()}`);

    if (res.error) {
      return { data: [], meta: res.meta || {}, error: res.error };
    }

    const rawList = res.data || [];
    const formattedList = rawList.map((emp) => ({
      id: emp.id,
      code: emp.employee_code,
      name: emp.full_name,
      email: emp.email,
      department: emp.department || 'Operasional',
      role: mapRoleToUI(emp.role),
      rawRole: emp.role,
      status: emp.is_active ? 'Aktif' : 'Nonaktif',
      isActive: Boolean(emp.is_active),
      joinDate: emp.created_at
        ? new Date(emp.created_at).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })
        : '-',
    }));

    return {
      data: formattedList,
      meta: res.meta || { total: formattedList.length },
      error: null,
    };
  },

  /**
   * Detail Karyawan berdasarkan ID
   */
  getEmployeeById: async (id) => {
    return apiClient.get(`/admin/employees/${id}`);
  },

  /**
   * Tambah Karyawan Baru (Create)
   */
  addEmployee: async (employeeData) => {
    const payload = {
      employee_code: employeeData.code || employeeData.employee_code || `EMP-${Date.now().toString().slice(-4)}`,
      full_name: employeeData.name || employeeData.full_name,
      email: employeeData.email,
      password: employeeData.password || 'password123',
      role: mapRoleToBackend(employeeData.role),
    };

    const res = await apiClient.post('/admin/employees', payload);

    if (res.error) {
      return { success: false, error: res.error.message || 'Gagal menambahkan karyawan.' };
    }

    return { success: true, data: res.data?.employee, message: res.data?.message };
  },

  /**
   * Perbarui Data Karyawan (Update)
   */
  updateEmployee: async (id, updatedFields) => {
    const payload = {};
    if (updatedFields.name || updatedFields.full_name) {
      payload.full_name = updatedFields.name || updatedFields.full_name;
    }
    if (updatedFields.email) payload.email = updatedFields.email;
    if (updatedFields.role) payload.role = mapRoleToBackend(updatedFields.role);
    if (updatedFields.status !== undefined) {
      payload.is_active = updatedFields.status === 'Aktif' || updatedFields.status === 1 ? 1 : 0;
    } else if (updatedFields.isActive !== undefined) {
      payload.is_active = updatedFields.isActive ? 1 : 0;
    }
    if (updatedFields.password) payload.password = updatedFields.password;

    const res = await apiClient.patch(`/admin/employees/${id}`, payload);

    if (res.error) {
      return { success: false, error: res.error.message || 'Gagal memperbarui data karyawan.' };
    }

    return { success: true, data: res.data?.employee, message: res.data?.message };
  },

  /**
   * Nonaktifkan Akun Karyawan (Delete / Soft Deactivate)
   */
  toggleEmployeeStatus: async (id, newStatus) => {
    const isActivating = newStatus === 'Aktif';

    if (!isActivating) {
      // Panggil endpoint DELETE untuk soft-deactivate
      const res = await apiClient.delete(`/admin/employees/${id}`);
      if (res.error) {
        return { success: false, error: res.error.message || 'Gagal menonaktifkan akun karyawan.' };
      }
      return { success: true, message: res.data?.message };
    } else {
      // Re-aktifkan via PATCH
      const res = await apiClient.patch(`/admin/employees/${id}`, { is_active: 1 });
      if (res.error) {
        return { success: false, error: res.error.message || 'Gagal mengaktifkan akun karyawan.' };
      }
      return { success: true, message: res.data?.message };
    }
  },
};
