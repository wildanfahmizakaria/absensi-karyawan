import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const NavigationContext = createContext();

export const NavigationProvider = ({ children }) => {
  const { currentRole, isAuthenticated } = useAuth();

  // Helper untuk menentukan default page berdasarkan peran
  const getDefaultPageForRole = (role) => {
    switch (role) {
      case 'superadmin':
        return 'superadmin-dashboard';
      case 'admin':
        return 'admin-dashboard';
      case 'employee':
      default:
        return 'employee-dashboard';
    }
  };

  // Baca hash awal jika ada
  const getInitialPage = () => {
    const hash = window.location.hash.replace('#/', '').replace('#', '');
    const validPages = [
      'login',
      'register',
      'employee-dashboard',
      'admin-dashboard',
      'superadmin-dashboard',
      'employees',
      'history',
      'reports',
      'settings',
    ];
    if (hash && validPages.includes(hash)) {
      return hash;
    }
    return isAuthenticated ? getDefaultPageForRole(currentRole) : 'login';
  };

  const [currentPage, setCurrentPage] = useState(getInitialPage);

  // Sync hash saat currentPage berganti
  const navigateTo = (page) => {
    setCurrentPage(page);
    window.location.hash = `#/${page}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Dengarkan perubahan hash dari tombol back/forward browser
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '').replace('#', '');
      if (hash) {
        setCurrentPage(hash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Update halaman jika logout
  useEffect(() => {
    if (!isAuthenticated) {
      if (currentPage !== 'login' && currentPage !== 'register') {
        setCurrentPage('login');
        window.location.hash = '#/login';
      }
    }
  }, [isAuthenticated, currentPage]);

  return (
    <NavigationContext.Provider
      value={{
        currentPage,
        navigateTo,
        getDefaultPageForRole,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};
