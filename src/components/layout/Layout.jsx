import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Header } from './Header';
import { DesktopSidebar } from './DesktopSidebar';
import { MobileBottomNav } from './MobileBottomNav';
import { MockNoticeBanner } from '../common/MockNoticeBanner';
import { PwaInstallBanner } from '../common/PwaInstallBanner';

export const Layout = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-brand-bg flex flex-col">
        <PwaInstallBanner />
        <MockNoticeBanner />
        <main className="flex-1 flex items-center justify-center p-4">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col text-brand-text">
      <PwaInstallBanner />
      {/* Label Mock Data Global */}
      <MockNoticeBanner />

      {/* Header Utama */}
      <Header />

      {/* Konten dengan Sidebar Desktop (Menempel penuh di sisi kiri tanpa margin kosong) */}
      <div className="flex-1 flex w-full">
        <DesktopSidebar />

        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
          {children}
        </main>
      </div>

      {/* Navigasi Bawah Mobile */}
      <MobileBottomNav />
    </div>
  );
};
