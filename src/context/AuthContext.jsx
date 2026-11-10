import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../services/apiClient';

const AuthContext = createContext();

const SESSION_STORAGE_KEY = 'mandala_auth_session';

const formatUserObject = (rawUser) => {
  if (!rawUser) return null;
  const roleStr = (rawUser.role || 'EMPLOYEE').toUpperCase();
  const roleLower = roleStr.toLowerCase(); // 'employee' | 'admin' | 'superadmin'

  return {
    id: rawUser.id,
    employee_code: rawUser.employee_code || `EMP-${rawUser.id}`,
    name: rawUser.full_name || rawUser.name || 'Pengguna',
    full_name: rawUser.full_name || rawUser.name || 'Pengguna',
    email: rawUser.email,
    role: roleLower,
    rawRole: roleStr,
    roleLabel:
      roleStr === 'SUPERADMIN'
        ? 'Superadmin'
        : roleStr === 'ADMIN'
        ? 'Admin'
        : 'Karyawan',
    department: rawUser.department || 'Operasional',
    avatar: (rawUser.full_name || rawUser.name || 'US').substring(0, 2).toUpperCase(),
    phone: rawUser.phone || '+62 812-0000-0000',
    isActive: rawUser.is_active !== undefined ? Boolean(rawUser.is_active) : true,
  };
};

export const AuthProvider = ({ children }) => {
  // Sesi awal dipulihkan dari localStorage
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedSession = localStorage.getItem(SESSION_STORAGE_KEY);
      if (savedSession) {
        const parsed = JSON.parse(savedSession);
        if (parsed && parsed.user && parsed.token) {
          return formatUserObject(parsed.user);
        }
      }
    } catch (e) {
      console.warn('Gagal memuat sesi localStorage:', e);
    }
    return null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      const savedSession = localStorage.getItem(SESSION_STORAGE_KEY);
      if (savedSession) {
        const parsed = JSON.parse(savedSession);
        return Boolean(parsed && parsed.token && parsed.user);
      }
    } catch (e) {
      // ignore
    }
    return false;
  });

  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Verifikasi token aktif ke server saat aplikasi dimuat ulang
  useEffect(() => {
    const verifySession = async () => {
      const token = apiClient.getAuthToken();
      if (!token) return;

      try {
        const res = await apiClient.get('/auth/me');
        if (res && res.data && res.data.user) {
          const formatted = formatUserObject(res.data.user);
          setCurrentUser(formatted);
          setIsAuthenticated(true);
        } else if (res && res.error && (res.error.code === 'UNAUTHENTICATED' || res.error.code === 'FORBIDDEN')) {
          // Token kedaluwarsa atau tidak valid
          logout();
        }
      } catch (err) {
        console.warn('Verifikasi sesi gagal:', err);
      }
    };

    verifySession();
  }, []);

  /**
   * Fungsi Login REST API Nyata (/auth/login)
   */
  const loginWithCredentials = async (email, password) => {
    setIsLoadingAuth(true);
    setAuthError(null);

    const normalizedEmail = email.trim().toLowerCase();

    try {
      const response = await apiClient.post('/auth/login', {
        email: normalizedEmail,
        password,
      });

      if (response.error) {
        const errorMsg = response.error.message || 'Login gagal. Periksa email dan kata sandi Anda.';
        setAuthError(errorMsg);
        setIsLoadingAuth(false);
        throw new Error(errorMsg);
      }

      if (!response.data || !response.data.token) {
        const errorMsg = 'Respons server tidak valid (Token tidak ditemukan).';
        setAuthError(errorMsg);
        setIsLoadingAuth(false);
        throw new Error(errorMsg);
      }

      const formattedUser = formatUserObject(response.data.user);

      // Simpan token dan data user ke localStorage
      localStorage.setItem(
        SESSION_STORAGE_KEY,
        JSON.stringify({
          token: response.data.token,
          user: formattedUser,
          role: formattedUser.role,
          timestamp: new Date().toISOString(),
        })
      );

      setCurrentUser(formattedUser);
      setIsAuthenticated(true);
      setIsLoadingAuth(false);
      setAuthError(null);
      return formattedUser;
    } catch (err) {
      setIsLoadingAuth(false);
      const msg = err.message || 'Koneksi ke backend server gagal.';
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  /**
   * Fungsi Logout REST API Nyata (/auth/logout)
   */
  const logout = async () => {
    try {
      await apiClient.post('/auth/logout', {});
    } catch (e) {
      // Abaikan jika logout request gagal jaringan
    } finally {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      setIsAuthenticated(false);
      setCurrentUser(null);
      setAuthError(null);
    }
  };

  /**
   * Fungsi Register Akun Karyawan Terpusat
   */
  const registerUser = async ({ name, email, department, role, password }) => {
    setIsLoadingAuth(true);
    setAuthError(null);
    try {
      const res = await apiClient.post('/admin/employees', {
        employee_code: `EMP-${Date.now().toString().slice(-4)}`,
        full_name: name,
        email,
        password,
        role: (role || 'EMPLOYEE').toUpperCase(),
      });

      setIsLoadingAuth(false);
      if (res.error) {
        const errorMsg = res.error.message || 'Pendaftaran akun gagal. Silakan hubungi Administrator HR.';
        setAuthError(errorMsg);
        throw new Error(errorMsg);
      }

      return res.data?.employee || { name, role: role || 'employee' };
    } catch (err) {
      setIsLoadingAuth(false);
      throw err;
    }
  };

  /**
   * Fungsi Switch Akun Cepat untuk evaluasi (menggunakan kredensial resmi API)
   */
  const switchRole = async (newRole) => {
    const roleAccounts = {
      superadmin: { email: 'superadmin@mandalamahardika.com', password: 'password123' },
      admin: { email: 'admin@mandalamahardika.com', password: 'password123' },
      employee: { email: 'budi.santoso@mandalamahardika.com', password: 'password123' },
    };

    const target = roleAccounts[newRole.toLowerCase()];
    if (target) {
      return loginWithCredentials(target.email, target.password);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        currentUser,
        currentRole: currentUser ? currentUser.role : 'guest',
        isLoadingAuth,
        authError,
        loginWithCredentials,
        registerUser,
        switchRole,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
