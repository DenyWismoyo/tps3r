'use client';

import { useEffect, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { AdminShell } from '@/components/layout/AdminShell';
import { Container } from '@/components/ui/Container';
import { Skeleton } from '@/components/ui/Skeleton';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAdmin, loading } = useAuth();

  const isLoginRoute = pathname === '/admin/login';

  useEffect(() => {
    if (loading) return;
    if (!isLoginRoute && (!user || !isAdmin)) {
      router.replace('/admin/login');
    } else if (isLoginRoute && user && isAdmin) {
      router.replace('/admin');
    }
  }, [loading, isLoginRoute, user, isAdmin, router]);

  if (isLoginRoute) {
    return <>{children}</>;
  }

  if (loading || !user || !isAdmin) {
    return (
      <div className="login-shell">
        <Container narrow>
          <div className="stack">
            <Skeleton variant="title" />
            <Skeleton variant="card" />
          </div>
        </Container>
      </div>
    );
  }

  return <AdminShell>{children}</AdminShell>;
}
