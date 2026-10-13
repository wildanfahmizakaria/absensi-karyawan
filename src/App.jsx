import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NavigationProvider, useNavigation } from './context/NavigationContext';
import { Layout } from './components/layout/Layout';
import { RouteGuard } from './components/common/RouteGuard';
import { Toast } from './components/common/Toast';

import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { EmployeeDashboardPage } from './pages/EmployeeDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { SuperadminDashboardPage } from './pages/SuperadminDashboardPage';
import { HistoryPage } from './pages/HistoryPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { EmployeeManagementPage } from './pages/EmployeeManagementPage';

const AppContent = () => {
  const { isAuthenticated, currentRole } = useAuth();
  const { currentPage, navigateTo, getDefaultPageForRole } = useNavigation();
  const [toastMessage, setToastMessage] = useState(null);

  // Jika belum login, hanya rute autentikasi (Login dan Register)
  if (!isAuthenticated) {
    if (currentPage === 'register') {
      return <RegisterPage />;
    }
    return <LoginPage />;
  }

  // Jika sudah login tapi berada di rute login/register/landing, arahkan ke dashboard sesuai peran
  const effectivePage =
    currentPage === 'login' || currentPage === 'register' || currentPage === 'landing'
      ? getDefaultPageForRole(currentRole)
      : currentPage;

  const renderGuardedPage = () => {
    switch (effectivePage) {
      case 'employee-dashboard':
        return (
          <RouteGuard pageId="employee-dashboard">
            <EmployeeDashboardPage />
          </RouteGuard>
        );
      case 'admin-dashboard':
        return (
          <RouteGuard pageId="admin-dashboard">
            <AdminDashboardPage />
          </RouteGuard>
        );
      case 'superadmin-dashboard':
        return (
          <RouteGuard pageId="superadmin-dashboard">
            <SuperadminDashboardPage />
          </RouteGuard>
        );
      case 'employees':
        return (
          <RouteGuard pageId="employees">
            <EmployeeManagementPage />
          </RouteGuard>
        );
      case 'history':
        return (
          <RouteGuard pageId="history">
            <HistoryPage />
          </RouteGuard>
        );
      case 'reports':
        return (
          <RouteGuard pageId="reports">
            <ReportsPage />
          </RouteGuard>
        );
      case 'settings':
        return (
          <RouteGuard pageId="settings">
            <SettingsPage />
          </RouteGuard>
        );
      default:
        return (
          <RouteGuard pageId="employee-dashboard">
            <EmployeeDashboardPage />
          </RouteGuard>
        );
    }
  };

  return (
    <Layout>
      {renderGuardedPage()}
      {toastMessage && (
        <Toast
          message={toastMessage.text}
          type={toastMessage.type}
          onClose={() => setToastMessage(null)}
        />
      )}
    </Layout>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <NavigationProvider>
        <AppContent />
      </NavigationProvider>
    </AuthProvider>
  );
}
