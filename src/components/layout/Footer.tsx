'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Clock, MapPin, MessageCircle, ShieldCheck, Sprout } from 'lucide-react';
import { FOOTER_QUICK_LINKS, PUBLIC_NAV_ITEMS } from '@/config/navigation';
import { SITE_CONFIG } from '@/config/site';
import { buildWhatsAppUrl } from '@/utils/whatsapp';
import { Container } from '@/components/ui/Container';

export function Footer() {
  const pathname = usePathname();

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const waUrl = buildWhatsAppUrl(
    `Halo ${SITE_CONFIG.organizationName}, saya ingin informasi lebih lanjut mengenai produk atau kemitraan.`
  );

  return (
    <footer className="footer no-print">
      <Container>
        <div className="footer__grid">
          <div className="stack stack--sm">
            <div className="cluster">
              <span className="navbar__brand-mark" aria-hidden="true">
                <Sprout size={20} />
              </span>
              <strong>{SITE_CONFIG.organizationName}</strong>
            </div>
            <p className="text-sm">{SITE_CONFIG.tagline}</p>
            <p className="footer__meta-row">
              <ShieldCheck size={15} aria-hidden="true" />
              <span>{SITE_CONFIG.legalityNumber}</span>
            </p>
          </div>

          <div>
            <h4>Navigasi</h4>
            <ul className="footer__links">
              {PUBLIC_NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4>Layanan Cepat</h4>
            <ul className="footer__links">
              {FOOTER_QUICK_LINKS.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="stack stack--sm">
            <h4>Lokasi &amp; Kontak</h4>
            <p className="footer__meta-row">
              <MapPin size={15} aria-hidden="true" />
              <span>{SITE_CONFIG.address}</span>
            </p>
            <p className="footer__meta-row">
              <Clock size={15} aria-hidden="true" />
              <span>{SITE_CONFIG.operatingHours}</span>
            </p>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--wa btn--sm"
            >
              <MessageCircle size={16} />
              <span>Chat WA ({SITE_CONFIG.phoneDisplay})</span>
            </a>
          </div>
        </div>

        <div className="footer__bottom">
          <span>
            © {new Date().getFullYear()} {SITE_CONFIG.organizationName}. Semua hak dilindungi.
          </span>
          <span>Sistem Digital Ekonomi Sirkular • TPS 3R & Kelompok Tani</span>
        </div>
      </Container>
    </footer>
  );
}
