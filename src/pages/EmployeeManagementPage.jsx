import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { employeeApi } from '../services/employeeApi';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { DashboardSkeleton } from '../components/common/Skeleton';
import {
  IconUsers,
  IconSearch,
  IconFilter,
  IconCheckCircle,
  IconAlertTriangle,
  IconX,
  IconUser,
  IconBuilding,
} from '../components/common/Icons';

export const EmployeeManagementPage = () => {
  const { currentUser } = useAuth();

  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [confirmDeactivate, setConfirmDeactivate] = useState(null); // emp object

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: 'Operasional',
    role: 'Karyawan',
    status: 'Aktif',
  });
  const [formError, setFormError] = useState('');

  // Fetch employees
  const loadEmployees = async () => {
    setIsLoading(true);
    const data = await employeeApi.getEmployees();
    setEmployees(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowAddModal(false);
        setEditingEmployee(null);
        setConfirmDeactivate(null);
      }
    };
    if (showAddModal || editingEmployee || confirmDeactivate) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [showAddModal, editingEmployee, confirmDeactivate]);

  // Filter & Search logic
  const filteredEmployees = employees.filter((emp) => {
    const matchQuery =
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchDept = filterDepartment === 'ALL' || emp.department === filterDepartment;
    const matchStatus = filterStatus === 'ALL' || emp.status === filterStatus;

    return matchQuery && matchDept && matchStatus;
  });

  // Handle Submit Form Tambah / Edit
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim()) {
      setFormError('Nama lengkap karyawan wajib diisi.');
      return;
    }

    if (!formData.email.trim() || !formData.email.includes('@')) {
      setFormError('Alamat email valid wajib diisi.');
      return;
    }

    if (editingEmployee) {
      // Edit
      await employeeApi.updateEmployee(
        editingEmployee.id,
        formData,
        currentUser?.name || 'Admin'
      );
      setEditingEmployee(null);
    } else {
      // Tambah baru
      await employeeApi.addEmployee(formData, currentUser?.name || 'Admin');
      setShowAddModal(false);
    }

    setFormData({
      name: '',
      email: '',
      department: 'Operasional',
      role: 'Karyawan',
      status: 'Aktif',
    });
    loadEmployees();
  };

  // Open Edit Modal
  const handleOpenEdit = (emp) => {
    setEditingEmployee(emp);
    setFormData({
      name: emp.name,
      email: emp.email,
      department: emp.department,
      role: emp.role,
      status: emp.status,
    });
  };

  // Toggle status aktif/nonaktif
  const handleToggleStatus = async () => {
    if (!confirmDeactivate) return;
    const newStatus = confirmDeactivate.status === 'Aktif' ? 'Nonaktif' : 'Aktif';
    await employeeApi.toggleEmployeeStatus(
      confirmDeactivate.id,
      newStatus,
      currentUser?.name || 'Admin'
    );
    setConfirmDeactivate(null);
    loadEmployees();
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fadeIn">
      {/* Modal Tambah / Edit Karyawan */}
      {(showAddModal || editingEmployee) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-card max-w-md w-full p-6 shadow-float border border-brand-border">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border mb-4">
              <h3 className="text-base font-bold text-slate-900">
                {editingEmployee ? 'Ubah Data Karyawan' : 'Tambah Karyawan Baru'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingEmployee(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <IconX className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 mb-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmitForm} className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Pratama Wijaya"
                  className="w-full px-3 py-2 rounded-control border border-brand-border bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Email Perusahaan
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="nama@mandalamahardika.com"
                  className="w-full px-3 py-2 rounded-control border border-brand-border bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Departemen
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 rounded-control border border-brand-border bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="Operasional">Operasional</option>
                    <option value="Keuangan">Keuangan</option>
                    <option value="Logistik">Logistik</option>
                    <option value="HR & Operasional">HR</option>
                    <option value="Administrasi">Administrasi</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Peran
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 rounded-control border border-brand-border bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="Karyawan">Karyawan</option>
                    <option value="Admin">Admin</option>
                    <option value="Superadmin">Superadmin</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Status Akun
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-control border border-brand-border bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Nonaktif">Nonaktif</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingEmployee(null);
                  }}
                >
                  Batal
                </Button>
                <Button variant="primary" size="md" type="submit">
                  {editingEmployee ? 'Simpan Perubahan' : 'Tambah Karyawan'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dialog Konfirmasi Tindakan Berisiko (Nonaktifkan Karyawan) */}
      {confirmDeactivate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-card max-w-sm w-full p-6 shadow-float border border-brand-border">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                <IconAlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Konfirmasi Perubahan Status
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mb-4 leading-relaxed">
              Apakah Anda yakin ingin mengubah status karyawan <strong>{confirmDeactivate.name}</strong> ({confirmDeactivate.id}) menjadi{' '}
              <strong className={confirmDeactivate.status === 'Aktif' ? 'text-rose-600' : 'text-emerald-600'}>
                {confirmDeactivate.status === 'Aktif' ? 'Nonaktif' : 'Aktif'}
              </strong>?
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="md"
                onClick={() => setConfirmDeactivate(null)}
              >
                Batal
              </Button>
              <Button
                variant={confirmDeactivate.status === 'Aktif' ? 'danger' : 'primary'}
                size="md"
                onClick={handleToggleStatus}
              >
                Konfirmasi
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Manajemen Data Karyawan
            </h1>
            <Badge variant="mock" size="sm">
              Fase 4: Operasional
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Kelola data staf, penugasan divisi, dan hak akses CV Mandala Mahardika
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={IconUsers}
          onClick={() => {
            setEditingEmployee(null);
            setFormData({
              name: '',
              email: '',
              department: 'Operasional',
              role: 'Karyawan',
              status: 'Aktif',
            });
            setShowAddModal(true);
          }}
        >
          + Tambah Karyawan Baru
        </Button>
      </div>

      {/* Filter & Pencarian Bar */}
      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search input */}
          <div className="relative">
            <IconSearch className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama, email, atau ID..."
              className="w-full pl-9 pr-3.5 py-2 rounded-control border border-brand-border text-xs sm:text-sm bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Filter Departemen */}
          <div>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="w-full px-3 py-2 rounded-control border border-brand-border text-xs sm:text-sm bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="ALL">Semua Departemen</option>
              <option value="Operasional">Operasional</option>
              <option value="Keuangan">Keuangan</option>
              <option value="Logistik">Logistik</option>
              <option value="HR & Operasional">HR & Operasional</option>
            </select>
          </div>

          {/* Filter Status */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-control border border-brand-border text-xs sm:text-sm bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="ALL">Semua Status Akun</option>
              <option value="Aktif">Hanya Aktif</option>
              <option value="Nonaktif">Hanya Nonaktif</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Tabel Karyawan (Desktop) & Kartu (Mobile) */}
      <Card
        title={`Daftar Karyawan Terdaftar (${filteredEmployees.length} orang)`}
        subtitle="Data karyawan tersinkronisasi dengan audit log sistem"
      >
        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-semibold border-b border-brand-border">
              <tr>
                <th className="py-3 px-3">ID</th>
                <th className="py-3 px-3">Karyawan</th>
                <th className="py-3 px-3">Departemen</th>
                <th className="py-3 px-3">Peran</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-3 font-mono text-xs font-semibold text-slate-500">
                    {emp.id}
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-900">{emp.name}</div>
                    <div className="text-xs text-slate-400">{emp.email}</div>
                  </td>
                  <td className="py-3 px-3 text-slate-600">{emp.department}</td>
                  <td className="py-3 px-3 font-medium">{emp.role}</td>
                  <td className="py-3 px-3">
                    <Badge
                      variant={emp.status === 'Aktif' ? 'success' : 'danger'}
                      size="sm"
                    >
                      {emp.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-3 text-right space-x-2">
                    <button
                      onClick={() => handleOpenEdit(emp)}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded hover:bg-blue-50"
                    >
                      Ubah
                    </button>
                    <button
                      onClick={() => setConfirmDeactivate(emp)}
                      className={`text-xs font-medium px-2 py-1 rounded ${
                        emp.status === 'Aktif'
                          ? 'text-rose-600 hover:bg-rose-50'
                          : 'text-emerald-600 hover:bg-emerald-50'
                      }`}
                    >
                      {emp.status === 'Aktif' ? 'Nonaktifkan' : 'Aktifkan'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden divide-y divide-slate-100 -mx-5 -my-5">
          {filteredEmployees.map((emp) => (
            <div key={emp.id} className="p-4 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{emp.name}</h4>
                  <p className="text-xs text-slate-400 font-mono">{emp.id} • {emp.email}</p>
                </div>
                <Badge variant={emp.status === 'Aktif' ? 'success' : 'danger'} size="sm">
                  {emp.status}
                </Badge>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span>Divisi: {emp.department}</span>
                <span>•</span>
                <span>Peran: {emp.role}</span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button variant="outline" size="sm" onClick={() => handleOpenEdit(emp)}>
                  Ubah
                </Button>
                <Button
                  variant={emp.status === 'Aktif' ? 'danger' : 'primary'}
                  size="sm"
                  onClick={() => setConfirmDeactivate(emp)}
                >
                  {emp.status === 'Aktif' ? 'Nonaktifkan' : 'Aktifkan'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
