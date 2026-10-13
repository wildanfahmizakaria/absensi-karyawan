import { MOCK_EMPLOYEES_LIST } from '../data/mockData';
import { auditApi } from './auditApi';
import { apiClient } from './apiClient';

const STORAGE_KEY_EMPLOYEES = 'mandala_employees_list';

export const employeeApi = {
  getEmployees: async () => {
    if (!apiClient.isMockMode()) {
      return apiClient.get('/employees');
    }

    await new Promise((r) => setTimeout(r, 200));
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY_EMPLOYEES);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      // fallback
    }
    return MOCK_EMPLOYEES_LIST;
  },

  addEmployee: async (employeeData, actorName = 'Admin') => {
    if (!apiClient.isMockMode()) {
      return apiClient.post('/employees', employeeData);
    }

    await new Promise((r) => setTimeout(r, 300));
    const currentList = await employeeApi.getEmployees();

    const newEmployee = {
      id: employeeData.id || `EMP-${String(currentList.length + 1).padStart(3, '0')}`,
      name: employeeData.name,
      email: employeeData.email,
      department: employeeData.department || 'Operasional',
      role: employeeData.role || 'Karyawan',
      status: employeeData.status || 'Aktif',
      joinDate: new Date().toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
    };

    const updatedList = [...currentList, newEmployee];
    sessionStorage.setItem(STORAGE_KEY_EMPLOYEES, JSON.stringify(updatedList));

    // Audit log
    await auditApi.logAction(
      actorName,
      'CREATE_EMPLOYEE',
      `Penambahan karyawan baru: ${newEmployee.name} (${newEmployee.id}) - Divisi ${newEmployee.department}`
    );

    return { success: true, data: newEmployee };
  },

  updateEmployee: async (id, updatedFields, actorName = 'Admin') => {
    if (!apiClient.isMockMode()) {
      return apiClient.put(`/employees/${id}`, updatedFields);
    }

    await new Promise((r) => setTimeout(r, 300));
    const currentList = await employeeApi.getEmployees();

    const index = currentList.findIndex((e) => e.id === id);
    if (index === -1) {
      return { success: false, error: 'Karyawan tidak ditemukan.' };
    }

    const updatedEmployee = { ...currentList[index], ...updatedFields };
    currentList[index] = updatedEmployee;

    sessionStorage.setItem(STORAGE_KEY_EMPLOYEES, JSON.stringify(currentList));

    // Audit log
    await auditApi.logAction(
      actorName,
      'UPDATE_EMPLOYEE',
      `Pembaruan data karyawan: ${updatedEmployee.name} (${updatedEmployee.id})`
    );

    return { success: true, data: updatedEmployee };
  },

  toggleEmployeeStatus: async (id, newStatus, actorName = 'Admin') => {
    if (!apiClient.isMockMode()) {
      return apiClient.put(`/employees/${id}/status`, { status: newStatus });
    }

    await new Promise((r) => setTimeout(r, 250));
    const currentList = await employeeApi.getEmployees();

    const index = currentList.findIndex((e) => e.id === id);
    if (index === -1) {
      return { success: false, error: 'Karyawan tidak ditemukan.' };
    }

    const emp = currentList[index];
    emp.status = newStatus;
    currentList[index] = emp;

    sessionStorage.setItem(STORAGE_KEY_EMPLOYEES, JSON.stringify(currentList));

    // Audit log
    await auditApi.logAction(
      actorName,
      newStatus === 'Nonaktif' ? 'DEACTIVATE_EMPLOYEE' : 'ACTIVATE_EMPLOYEE',
      `Perubahan status karyawan ${emp.name} (${emp.id}) menjadi ${newStatus}`
    );

    return { success: true, data: emp };
  },
};
