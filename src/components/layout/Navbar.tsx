'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, ShoppingBag, Sprout, MessageCircle } from 'lucide-react';
import { PUBLIC_NAV_ITEMS } from '@/config/navigation';
import { SITE_CONFIG } from '@/config/site';
import { useCart } from '@/hooks/useCart';
import { buildWhatsAppUrl } from '@/utils/whatsapp';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Drawer } from '@/components/ui/Drawer';

export function Navbar() {
  const pathname = usePathname();
  const { totalItems, openDrawer } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const quickWaUrl = buildWhatsAppUrl(
    `Halo ${SITE_CONFIG.shortName}, saya ingin bertanya tentang produk & layanan TPS 3R.`
  );

  return (
    <>
      <div className="announcement-bar no-print">{SITE_CONFIG.announcementDefault}</div>
      <header className="navbar no-print">
        <Container>
          <div className="navbar__inner">
            <Link
              href="/"
              className="navbar__brand"
              aria-label={SITE_CONFIG.organizationName}
              title={SITE_CONFIG.shortName}
            >
              <span className="navbar__brand-mark" aria-hidden="true">
                <Sprout size={22} />
              </span>
            </Link>

            <nav className="navbar__links" aria-label="Navigasi utama">
              {PUBLIC_NAV_ITEMS.map((item) => {
                const isActive =
                  item.href === '/'
                    ? pathname === '/'
                    : Boolean(pathname?.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={['navbar__link', isActive ? 'navbar__link--active' : '']
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="navbar__actions">
              <Button
                variant="outline"
                className="navbar__cart-btn"
                aria-label={`Buka keranjang belanja (${totalItems} item)`}
                onClick={openDrawer}
              >
                <ShoppingBag size={18} />
                <span className="sr-only">Keranjang</span>
                {totalItems > 0 ? (
                  <span className="navbar__cart-count">{totalItems}</span>
                ) : null}
              </Button>

              <a
                href={quickWaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn--wa btn--sm"
              >
                <MessageCircle size={16} />
                <span>WhatsApp</span>
              </a>

              <Button
                variant="ghost"
                iconOnly
                className="navbar__menu-toggle"
                aria-label="Buka menu navigasi"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu size={22} />
              </Button>
            </div>
          </div>
        </Container>
      </header>

      <Drawer
        open={mobileMenuOpen}
        title={SITE_CONFIG.shortName}
        side="left"
        onClose={() => setMobileMenuOpen(false)}
        footer={
          <div className="stack stack--xs">
            <a
              href={quickWaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--wa btn--block"
            >
              <MessageCircle size={18} />
              <span>Hubungi Pengurus via WA</span>
            </a>
            <Link
              href="/admin"
              className="btn btn--outline btn--block"
              onClick={() => setMobileMenuOpen(false)}
            >
              Portal Pengurus TPS 3R
            </Link>
          </div>
        }
      >
        <nav className="stack stack--xs" aria-label="Navigasi seluler">
          {PUBLIC_NAV_ITEMS.map((item) => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : Boolean(pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  'navbar__mobile-link',
                  isActive ? 'navbar__mobile-link--active' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </Drawer>
    </>
  );
}
