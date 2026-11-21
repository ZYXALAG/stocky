'use client';

import { ReactNode, useState, useCallback } from 'react';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';
import { MobileNav } from './mobile-nav';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  // Mobile sidebar state (can be used for future mobile drawer overlay)
  const [_mobileOpen, setMobileOpen] = useState(false);
  const toggleMobile = useCallback(() => setMobileOpen((v) => !v), []);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Topbar: mobile only */}
      <Topbar onMenuClick={toggleMobile} />

      {/* Sidebar: desktop only */}
      <Sidebar />

      {/* Main Content */}
      <main
        className={`
          flex-1 py-6 transition-all duration-300
          /* Desktop: offset by sidebar width */
          lg:ml-64 lg:py-6 lg:px-8
          /* Tablet */
          md:py-6 md:px-6
          /* Mobile */
          px-4 pb-20
        `}
      >
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>

      {/* Mobile bottom nav */}
      <MobileNav />
    </div>
  );
}
