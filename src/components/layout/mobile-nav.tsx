'use client';

import { LayoutDashboard, Package, ArrowRightLeft, Bell, Menu } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface MobileNavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const mobileNavItems: MobileNavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Produits', href: '/dashboard/produits', icon: Package },
  { label: 'Mouvements', href: '/dashboard/mouvements', icon: ArrowRightLeft },
  { label: 'Alertes', href: '/dashboard/alertes', icon: Bell },
  { label: 'Menu', href: '/dashboard', icon: Menu },
];

function isPathActive(pathname: string, href: string): boolean {
  if (href === '/dashboard') {
    return pathname === '/dashboard' || pathname === '/';
  }
  return pathname.startsWith(href);
}

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 w-full items-center border-t border-border bg-card lg:hidden">
      {mobileNavItems.map((item) => {
        const active = isPathActive(pathname, item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`
              flex flex-1 flex-col items-center justify-center gap-1 py-2 text-xs font-medium
              transition-colors duration-150
              ${active
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'}
            `}
          >
            <Icon className={`h-5 w-5 ${active ? 'stroke-[2.5px]' : ''}`} />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
