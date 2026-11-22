'use client';

import {
  LayoutDashboard,
  Package,
  Tag,
  Users,
  ArrowRightLeft,
  Bell,
  Layers,
  Settings,
  Box,
  LogOut,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getAlertCount } from '@/lib/alerts';
import { Badge } from '@/components/ui/badge';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Produits', href: '/dashboard/produits', icon: Package },
  { label: 'Catégories', href: '/dashboard/categories', icon: Tag },
  { label: 'Fournisseurs', href: '/dashboard/fournisseurs', icon: Users },
  { label: 'Mouvements', href: '/dashboard/mouvements', icon: ArrowRightLeft },
  { label: 'Alertes', href: '/dashboard/alertes', icon: Bell },
  { label: 'Templates', href: '/dashboard/templates', icon: Layers },
  { label: 'Paramètres', href: '/dashboard/parametres', icon: Settings },
];

function isPathActive(pathname: string, href: string): boolean {
  if (href === '/dashboard') {
    return pathname === '/dashboard' || pathname === '/';
  }
  return pathname.startsWith(href);
}

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [alertCount, setAlertCount] = useState(0);
  const { profile, signOut } = useAuth();

  useEffect(() => {
    getAlertCount('').then(setAlertCount);
    const interval = setInterval(() => {
      getAlertCount('').then(setAlertCount);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const toggle = useCallback(() => setCollapsed((v) => !v), []);

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-40 flex flex-col bg-card border-r border-border
        transition-all duration-300 ease-in-out
        ${collapsed ? 'w-16' : 'w-64'}
        hidden lg:flex
      `}
    >
      {/* Logo */}
      <div
        className={`
          flex items-center gap-3 px-4 py-5 border-b border-border
          ${collapsed ? 'justify-center' : ''}
        `}
      >
        <Box className="h-7 w-7 text-primary flex-shrink-0" />
        {!collapsed && (
          <span className="text-xl font-bold text-foreground truncate">Stocky</span>
        )}
      </div>

      {/* Nav Links */}
      <nav className="flex-1 overflow-y-auto py-3">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => {
            const active = isPathActive(pathname, item.href);
            const Icon = item.icon;
            const showAlertBadge = item.href === '/dashboard/alertes' && alertCount > 0;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`
                    flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium
                    transition-colors duration-150
                    ${active
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'}
                    ${collapsed ? 'justify-center' : ''}
                  `}
                  title={collapsed ? item.label : undefined}
                >
                  <div className="relative flex items-center justify-center">
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {showAlertBadge && (
                      <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                        {alertCount > 9 ? '9+' : alertCount}
                      </span>
                    )}
                  </div>
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-border p-3">
        {/* Collapse Toggle (desktop only) */}
        <button
          onClick={toggle}
          className={`
            w-full rounded-lg p-2 text-muted-foreground transition-colors
            hover:bg-accent hover:text-accent-foreground mb-2
            ${collapsed ? '' : 'flex items-center gap-3 px-3'}
          `}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg
            className={`h-5 w-5 flex-shrink-0 transition-transform duration-300 ${collapsed ? '' : ''}`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d={collapsed ? 'M13 5l7 7-7 7M5 5l7 7-7 7' : 'M11 19l-7-7 7-7m0 14l-7-7 7-7'} />
          </svg>
          {!collapsed && <span className="text-sm">Réduire</span>}
        </button>

        {/* User Profile */}
        <div
          className={`
            flex items-center gap-3 rounded-lg px-2 py-2
            ${collapsed ? 'justify-center' : ''}
          `}
        >
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
            {(profile?.full_name?.[0] ?? 'U').toUpperCase()}
          </div>
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {profile?.full_name ?? 'Utilisateur'}
                </p>
              </div>
              <button
                onClick={signOut}
                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive hover:text-destructive-foreground"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
