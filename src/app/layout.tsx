import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Outfit, Plus_Jakarta_Sans } from 'next/font/google';
import { SITE_CONFIG } from '@/config/site';
import { ToastProvider } from '@/components/ui/Toast';
import { AuthProvider } from '@/hooks/useAuth';
import { CartProvider } from '@/hooks/useCart';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { MiniCartDrawer } from '@/components/shared/MiniCartDrawer';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: `${SITE_CONFIG.shortName} — Ekonomi Sirkular & Kelompok Tani`,
    template: `%s | ${SITE_CONFIG.shortName}`,
  },
  description: SITE_CONFIG.description,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id" className={`${plusJakarta.variable} ${outfit.variable}`}>
      <body>
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              <Navbar />
              {children}
              <Footer />
              <MiniCartDrawer />
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
