import React, { createContext, useContext, useState, useEffect } from 'react';
import { MOCK_USERS, MOCK_AUTH_ACCOUNTS } from '../data/mockData';

const AuthContext = createContext();

const SESSION_STORAGE_KEY = 'mandala_auth_session';

export const AuthProvider = ({ children }) => {
  // Sesi awal dicoba dibaca dari localStorage
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedSession = localStorage.getItem(SESSION_STORAGE_KEY);
      if (savedSession) {
        const parsed = JSON.parse(savedSession);
        if (parsed && parsed.role && MOCK_USERS[parsed.role]) {
          return parsed.user;
        }
      }
    } catch (e) {
      console.warn('Gagal memuat sesi localStorage:', e);
    }
    // Default awal: Budi Pratama (karyawan)
    return MOCK_USERS.employee;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      const savedSession = localStorage.getItem(SESSION_STORAGE_KEY);
      if (savedSession) {
        return true;
      }
    } catch (e) {
      // fallback
    }
    return false; // Default awal: belum login, tampilkan Landing Page
  });

  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Simpan sesi ke localStorage setiap kali user berubah
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      try {
        localStorage.setItem(
          SESSION_STORAGE_KEY,
          JSON.stringify({
            token: `mock_jwt_session_${currentUser.role}_${Date.now()}`,
            role: currentUser.role,
            user: currentUser,
            timestamp: new Date().toISOString(),
          })
        );
      } catch (e) {
        console.warn('Gagal menyimpan sesi ke localStorage:', e);
      }
    } else {
      try {
        localStorage.removeItem(SESSION_STORAGE_KEY);
      } catch (e) {
        // ignore
      }
    }
  }, [isAuthenticated, currentUser]);

  /**
   * Fungsi Login Asynchronous dengan validasi kredensial (Fase 2)
   */
  const loginWithCredentials = async (email, password) => {
    setIsLoadingAuth(true);
    setAuthError(null);

    // Simulasi delay request jaringan (350ms)
    await new Promise((resolve) => setTimeout(resolve, 350));

    const normalizedEmail = email.trim().toLowerCase();

    // Gabungkan akun mock dengan akun yang didaftarkan melalui Register
    let customAccounts = [];
    try {
      customAccounts = JSON.parse(localStorage.getItem('mandala_custom_accounts') || '[]');
    } catch (e) {
      customAccounts = [];
    }

    const allAccounts = [...customAccounts, ...MOCK_AUTH_ACCOUNTS];
    const matchedAccount = allAccounts.find(
      (acc) =>
        acc.email.toLowerCase() === normalizedEmail ||
        (acc.alias && acc.alias.toLowerCase() === normalizedEmail)
    );

    if (!matchedAccount) {
      setIsLoadingAuth(false);
      const errorMsg = 'Email atau nama pengguna tidak terdaftar dalam sistem.';
      setAuthError(errorMsg);
      throw new Error(errorMsg);
    }

    if (matchedAccount.password !== password) {
      setIsLoadingAuth(false);
      const errorMsg = 'Kata sandi yang Anda masukkan salah. Silakan periksa kembali.';
      setAuthError(errorMsg);
      throw new Error(errorMsg);
    }

    // Ambil profil user jika mock, atau bangun profil dari custom account
    let targetUser = MOCK_USERS[matchedAccount.role];
    if (!targetUser && matchedAccount.userProfile) {
      targetUser = matchedAccount.userProfile;
    } else if (!targetUser) {
      targetUser = {
        id: matchedAccount.id || `EMP-${Date.now().toString().slice(-4)}`,
        name: matchedAccount.name || matchedAccount.alias || 'Karyawan CV Mandala',
        email: matchedAccount.email,
        role: matchedAccount.role || 'employee',
        roleLabel: matchedAccount.role === 'admin' ? 'Admin' : matchedAccount.role === 'superadmin' ? 'Superadmin' : 'Karyawan',
        department: matchedAccount.department || 'Operasional',
        avatar: (matchedAccount.name || 'Karyawan').substring(0, 2).toUpperCase(),
        phone: '+62 812-0000-0000',
      };
    }

    setCurrentUser(targetUser);
    setIsAuthenticated(true);
    setIsLoadingAuth(false);
    setAuthError(null);
    return targetUser;
  };

  /**
   * Fungsi Register Akun Baru
   */
  const registerUser = async ({ name, email, department, role = 'employee', password }) => {
    setIsLoadingAuth(true);
    setAuthError(null);

    await new Promise((resolve) => setTimeout(resolve, 400));

    const normalizedEmail = email.trim().toLowerCase();

    let customAccounts = [];
    try {
      customAccounts = JSON.parse(localStorage.getItem('mandala_custom_accounts') || '[]');
    } catch (e) {
      customAccounts = [];
    }

    const allAccounts = [...customAccounts, ...MOCK_AUTH_ACCOUNTS];
    const isExisting = allAccounts.some(
      (acc) => acc.email.toLowerCase() === normalizedEmail
    );

    if (isExisting) {
      setIsLoadingAuth(false);
      const errorMsg = 'Alamat email ini sudah terdaftar. Silakan gunakan email lain atau masuk.';
      setAuthError(errorMsg);
      throw new Error(errorMsg);
    }

    const assignedRole = role || 'employee';
    const initials = name
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .substring(0, 2)
      .toUpperCase() || 'KR';

    const newUserProfile = {
      id: `EMP-${Date.now().toString().slice(-4)}`,
      name: name.trim(),
      email: normalizedEmail,
      role: assignedRole,
      roleLabel:
        assignedRole === 'admin'
          ? 'Admin'
          : assignedRole === 'superadmin'
          ? 'Superadmin'
          : 'Karyawan',
      department: department || 'Operasional',
      avatar: initials,
      phone: '+62 812-0000-0000',
    };

    const newAccount = {
      email: normalizedEmail,
      alias: name.toLowerCase().replace(/\s+/g, ''),
      name: name.trim(),
      department: department || 'Operasional',
      password,
      role: assignedRole,
      userProfile: newUserProfile,
    };

    const updatedAccounts = [...customAccounts, newAccount];
    try {
      localStorage.setItem('mandala_custom_accounts', JSON.stringify(updatedAccounts));
    } catch (e) {
      // ignore
    }

    setCurrentUser(newUserProfile);
    setIsAuthenticated(true);
    setIsLoadingAuth(false);
    setAuthError(null);
    return newUserProfile;
  };

  /**
   * Fungsi Switch Role Cepat untuk demonstrasi evaluator
   */
  const switchRole = (newRole) => {
    if (MOCK_USERS[newRole]) {
      const targetUser = MOCK_USERS[newRole];
      setCurrentUser(targetUser);
      setIsAuthenticated(true);
      setAuthError(null);
    }
  };

  /**
   * Fungsi Logout
   */
  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setAuthError(null);
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch (e) {
      // ignore
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        currentUser: currentUser || MOCK_USERS.employee,
        currentRole: currentUser ? currentUser.role : 'employee',
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
