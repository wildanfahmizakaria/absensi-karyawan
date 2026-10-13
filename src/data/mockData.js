/**
 * MOCK DATA — FASE 1 (Fondasi Front-end)
 * CATATAN PENTING:
 * Seluruh data dalam file ini adalah data tiruan (mock data) untuk demonstrasi
 * antarmuka pengguna pada Fase 1. Data ini TIDAK merepresentasikan data produksi
 * dan TIDAK tersimpan pada database nyata sebelum adanya konfirmasi backend API.
 */

export const MOCK_LABEL = "MOCK DATA — FASE 1 (SIMULASI)";

export const MOCK_AUTH_ACCOUNTS = [
  {
    email: "karyawan@mandalamahardika.com",
    alias: "budi.pratama@mandalamahardika.com",
    password: "karyawan123",
    role: "employee",
    userKey: "employee",
    label: "Karyawan — Budi Pratama",
  },
  {
    email: "admin@mandalamahardika.com",
    alias: "siti.rahmawati@mandalamahardika.com",
    password: "admin123",
    role: "admin",
    userKey: "admin",
    label: "Admin — Siti Rahmawati",
  },
  {
    email: "superadmin@mandalamahardika.com",
    alias: "hendro.wijaya@mandalamahardika.com",
    password: "superadmin123",
    role: "superadmin",
    userKey: "superadmin",
    label: "Superadmin — Hendro Wijaya",
  },
];

export const PAGE_PERMISSIONS = {
  'employee-dashboard': ['employee', 'admin', 'superadmin'],
  'admin-dashboard': ['admin', 'superadmin'],
  'superadmin-dashboard': ['superadmin'],
  'employees': ['admin', 'superadmin'],
  'history': ['employee', 'admin', 'superadmin'],
  'reports': ['admin', 'superadmin'],
  'settings': ['employee', 'admin', 'superadmin'],
};

export const MOCK_USERS = {
  employee: {
    id: "EMP-001",
    name: "Budi Pratama",
    email: "karyawan@mandalamahardika.com",
    role: "employee",
    roleLabel: "Karyawan",
    department: "Divisi Operasional & Lapangan",
    avatar: "BP",
    phone: "+62 812-3456-7890",
  },
  admin: {
    id: "ADM-001",
    name: "Siti Rahmawati",
    email: "admin@mandalamahardika.com",
    role: "admin",
    roleLabel: "Admin Operasional",
    department: "HR & Manajemen Operasional",
    avatar: "SR",
    phone: "+62 813-9876-5432",
  },
  superadmin: {
    id: "SUP-001",
    name: "Hendro Wijaya",
    email: "superadmin@mandalamahardika.com",
    role: "superadmin",
    roleLabel: "Superadmin",
    department: "Manajemen Sistem & Direksi",
    avatar: "HW",
    phone: "+62 811-2233-4455",
  },
};

export const MOCK_WORK_SCHEDULE = {
  type: "Kebijakan Durasi Fleksibel",
  timezone: "WIB (UTC+7)",
  minWorkHours: 8,
  minWorkMinutes: 30,
  minDurationFormatted: "8 Jam 30 Menit",
  minDurationMinutesTotal: 510,
  checkInRule: "Absen Masuk Bebas (Jam Berapapun)",
  checkOutRule: "Absen Pulang Minimal 8 Jam 30 Menit dari Jam Masuk",
  workDays: "Senin – Jumat",
  geolocationRule: "Perekaman Koordinat GPS Aktif (Tanpa Radius Geofence)",
};

export const MOCK_ORGANIZATION = {
  companyName: "CV Mandala Mahardika",
  address: "Jl. Pemuda No. 108, Kota Semarang, Jawa Tengah",
  officeCoordinates: {
    latitude: -6.9826,
    longitude: 110.4091,
    accuracy: "12m",
  },
  totalEmployees: 48,
  activeEmployees: 46,
};

export const MOCK_TODAY_ATTENDANCE = {
  employeeId: "EMP-001",
  date: "12 Oktober 2026",
  status: "BELUM_ABSEN", // "BELUM_ABSEN" | "SUDAH_MASUK" | "SELESAI"
  checkIn: null,
  checkOut: null,
  minCheckOutTime: null,
  workDuration: null,
  durationStatus: null,
  durationLabel: null,
  shiftInfo: "Batas Kerja: Minimal 8 Jam 30 Menit dari Jam Masuk",
};

export const MOCK_ATTENDANCE_HISTORY = [
  {
    id: "ATT-20261011-001",
    employeeId: "EMP-001",
    employeeName: "Budi Pratama",
    date: "11 Oktober 2026",
    checkIn: "07:54:12 WIB",
    checkOut: "17:05:40 WIB",
    minCheckOut: "16:24 WIB",
    workDuration: "9 jam 11 menit",
    status: "LEBIH",
    statusLabel: "Lebih (+41 menit)",
    durationStatus: "LEBIH",
    keterangan: "Lebih dari 8 jam 30 menit (+41 menit)",
    coordinates: {
      latitude: -6.98254,
      longitude: 110.40915,
      accuracy_m: 8.4,
    },
    locationNote: "Lokasi GPS tercatat di sistem",
    photoCaptured: true,
    verifiedByServer: true,
  },
  {
    id: "ATT-20261010-002",
    employeeId: "EMP-001",
    employeeName: "Budi Pratama",
    date: "10 Oktober 2026",
    checkIn: "08:12:05 WIB",
    checkOut: "16:15:00 WIB",
    minCheckOut: "16:42 WIB",
    workDuration: "8 jam 2 menit",
    status: "KURANG",
    statusLabel: "Kurang (-28 menit)",
    durationStatus: "KURANG",
    keterangan: "Kurang dari batas minimal 8 jam 30 menit (-28 menit)",
    coordinates: {
      latitude: -6.98310,
      longitude: 110.40890,
      accuracy_m: 14.2,
    },
    locationNote: "Lokasi GPS tercatat di sistem",
    photoCaptured: true,
    verifiedByServer: true,
  },
  {
    id: "ATT-20261009-003",
    employeeId: "EMP-001",
    employeeName: "Budi Pratama",
    date: "09 Oktober 2026",
    checkIn: "07:48:33 WIB",
    checkOut: "16:18:33 WIB",
    minCheckOut: "16:18 WIB",
    workDuration: "8 jam 30 menit",
    status: "TEPAT",
    statusLabel: "Tepat 8j 30m",
    durationStatus: "TEPAT",
    keterangan: "Memenuhi batas minimal (Tepat 8 jam 30 menit)",
    coordinates: {
      latitude: -6.98248,
      longitude: 110.40920,
      accuracy_m: 9.1,
    },
    locationNote: "Lokasi GPS tercatat di sistem",
    photoCaptured: true,
    verifiedByServer: true,
  },
  {
    id: "ATT-20261008-004",
    employeeId: "EMP-001",
    employeeName: "Budi Pratama",
    date: "08 Oktober 2026",
    checkIn: "07:58:19 WIB",
    checkOut: "17:01:44 WIB",
    minCheckOut: "16:28 WIB",
    workDuration: "9 jam 3 menit",
    status: "LEBIH",
    statusLabel: "Lebih (+33 menit)",
    durationStatus: "LEBIH",
    keterangan: "Lebih dari 8 jam 30 menit (+33 menit)",
    coordinates: {
      latitude: -6.98260,
      longitude: 110.40911,
      accuracy_m: 7.8,
    },
    locationNote: "Lokasi GPS tercatat di sistem",
    photoCaptured: true,
    verifiedByServer: true,
  },
  {
    id: "ATT-20261007-005",
    employeeId: "EMP-001",
    employeeName: "Budi Pratama",
    date: "07 Oktober 2026",
    checkIn: "08:30:00 WIB",
    checkOut: "16:45:00 WIB",
    minCheckOut: "17:00 WIB",
    workDuration: "8 jam 15 menit",
    status: "KURANG",
    statusLabel: "Kurang (-15 menit)",
    durationStatus: "KURANG",
    keterangan: "Kurang dari batas minimal 8 jam 30 menit (-15 menit)",
    coordinates: {
      latitude: -6.98275,
      longitude: 110.40898,
      accuracy_m: 11.5,
    },
    locationNote: "Lokasi GPS tercatat di sistem",
    photoCaptured: true,
    verifiedByServer: true,
  },
];

export const MOCK_ADMIN_SUMMARY = {
  date: "12 Oktober 2026",
  totalEmployees: 48,
  presentCount: 41,
  lateCount: 4,
  absentCount: 3,
  attendanceRate: "93.7%",
  recentActivity: [
    {
      id: "ACT-01",
      name: "Agus Santoso",
      department: "Operasional",
      type: "Absen Masuk",
      time: "07:51 WIB",
      status: "Tepat Waktu",
      coords: "-6.9825, 110.4091",
    },
    {
      id: "ACT-02",
      name: "Dewi Lestari",
      department: "Keuangan",
      type: "Absen Masuk",
      time: "07:55 WIB",
      status: "Tepat Waktu",
      coords: "-6.9824, 110.4093",
    },
    {
      id: "ACT-03",
      name: "Rian Hidayat",
      department: "Logistik",
      type: "Absen Masuk",
      time: "08:14 WIB",
      status: "Terlambat",
      coords: "-6.9828, 110.4087",
    },
    {
      id: "ACT-04",
      name: "Nurul Aini",
      department: "Administrasi",
      type: "Absen Masuk",
      time: "08:02 WIB",
      status: "Tepat Waktu",
      coords: "-6.9826, 110.4090",
    },
  ],
};

export const MOCK_EMPLOYEES_LIST = [
  {
    id: "EMP-001",
    name: "Budi Pratama",
    email: "budi.pratama@mandalamahardika.com",
    department: "Operasional",
    role: "Karyawan",
    status: "Aktif",
    joinDate: "15 Jan 2023",
  },
  {
    id: "EMP-002",
    name: "Agus Santoso",
    email: "agus.santoso@mandalamahardika.com",
    department: "Operasional",
    role: "Karyawan",
    status: "Aktif",
    joinDate: "01 Mar 2023",
  },
  {
    id: "EMP-003",
    name: "Dewi Lestari",
    email: "dewi.lestari@mandalamahardika.com",
    department: "Keuangan",
    role: "Karyawan",
    status: "Aktif",
    joinDate: "10 Jun 2022",
  },
  {
    id: "EMP-004",
    name: "Rian Hidayat",
    email: "rian.hidayat@mandalamahardika.com",
    department: "Logistik",
    role: "Karyawan",
    status: "Aktif",
    joinDate: "05 Nov 2023",
  },
  {
    id: "ADM-001",
    name: "Siti Rahmawati",
    email: "siti.rahmawati@mandalamahardika.com",
    department: "HR & Operasional",
    role: "Admin",
    status: "Aktif",
    joinDate: "01 Feb 2021",
  },
  {
    id: "SUP-001",
    name: "Hendro Wijaya",
    email: "hendro.wijaya@mandalamahardika.com",
    department: "Manajemen Sistem",
    role: "Superadmin",
    status: "Aktif",
    joinDate: "01 Jan 2020",
  },
];

export const MOCK_AUDIT_LOGS = [
  {
    id: "AUD-101",
    timestamp: "12 Okt 2026 07:30:11 WIB",
    actor: "Hendro Wijaya (Superadmin)",
    action: "UPDATE_CONFIG",
    details: "Pembaruan kebijakan jam kerja minimal 8 jam 30 menit dari jam masuk",
  },
  {
    id: "AUD-102",
    timestamp: "11 Okt 2026 17:15:40 WIB",
    actor: "Siti Rahmawati (Admin)",
    action: "EXPORT_REPORT",
    details: "Ekspor laporan absensi mingguan format CSV",
  },
  {
    id: "AUD-103",
    timestamp: "10 Okt 2026 09:00:22 WIB",
    actor: "Siti Rahmawati (Admin)",
    action: "UPDATE_EMPLOYEE",
    details: "Pembaruan data profil karyawan EMP-004 (Rian Hidayat)",
  },
];
