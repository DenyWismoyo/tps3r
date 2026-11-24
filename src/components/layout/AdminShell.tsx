'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ClipboardPlus,
  ExternalLink,
  Inbox,
  LogOut,
  Package,
  Sprout,
  Users,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { ADMIN_NAV_ITEMS } from '@/config/navigation';
import { SITE_CONFIG } from '@/config/site';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';

const NAV_ICONS: Record<string, ReactNode> = {
  '/admin': <ClipboardPlus size={19} />,
  '/admin/produk': <Package size={19} />,
  '/admin/penyetor': <Users size={19} />,
  '/admin/permintaan': <Inbox size={19} />,
};

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(window.navigator.onLine);
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  return (
    <div className="admin-shell">
      {/* Topbar Mobile */}
      <header className="admin-topbar no-print">
        <div className="cluster">
          <Sprout size={20} aria-hidden="true" />
          <strong>Pengurus TPS 3R</strong>
        </div>
        <div className="cluster">
          <span
            className={[
              'admin-status-pill',
              !isOnline ? 'admin-status-pill--offline' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
            <span>{isOnline ? 'Online' : 'Offline Cache'}</span>
          </span>
          <Button variant="ghost" size="sm" onClick={() => void logout()}>
            <LogOut size={16} />
            <span className="sr-only">Keluar</span>
          </Button>
        </div>
      </header>

      {/* Sidebar Desktop */}
      <aside className="admin-sidebar no-print" aria-label="Menu pengurus">
        <div className="stack stack--xs">
          <div className="cluster">
            <Sprout size={22} aria-hidden="true" />
            <strong>{SITE_CONFIG.shortName}</strong>
          </div>
          <span className="text-xs">{user?.email || 'Panel Pengurus Lapangan'}</span>
          <span
            className={[
              'admin-status-pill',
              !isOnline ? 'admin-status-pill--offline' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
            <span>{isOnline ? 'Tersambung' : 'Mode Offline (Auto-Sync)'}</span>
          </span>
        </div>

        <nav className="stack stack--xs">
          {ADMIN_NAV_ITEMS.map((item) => {
            const isActive =
              item.href === '/admin'
                ? pathname === '/admin'
                : Boolean(pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  'admin-sidebar__link',
                  isActive ? 'admin-sidebar__link--active' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {NAV_ICONS[item.href]}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="stack stack--xs">
          <Link href="/" className="admin-sidebar__link">
            <ExternalLink size={18} />
            <span>Lihat Situs Publik</span>
          </Link>
          <Button variant="outline" size="sm" block onClick={() => void logout()}>
            <LogOut size={16} />
            <span>Keluar</span>
          </Button>
        </div>
      </aside>

      <main className="admin-main">{children}</main>

      {/* Bottom Navigation Mobile-First */}
      <nav className="admin-bottom-nav no-print" aria-label="Navigasi bawah pengurus">
        {ADMIN_NAV_ITEMS.map((item) => {
          const isActive =
            item.href === '/admin'
              ? pathname === '/admin'
              : Boolean(pathname?.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                'admin-bottom-nav__item',
                isActive ? 'admin-bottom-nav__item--active' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {NAV_ICONS[item.href]}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
