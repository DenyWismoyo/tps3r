'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogIn, Sprout } from 'lucide-react';
import { SITE_CONFIG } from '@/config/site';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardBody } from '@/components/ui/Card';
import { InputField } from '@/components/ui/InputField';
import { Button } from '@/components/ui/Button';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      router.replace('/admin');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Login gagal. Periksa email dan kata sandi pengurus.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-shell">
      <Card elevated className="login-card">
        <CardBody className="stack">
          <div className="stack stack--xs text-center">
            <div className="cluster">
              <span className="navbar__brand-mark" aria-hidden="true">
                <Sprout size={20} />
              </span>
              <strong>{SITE_CONFIG.shortName}</strong>
            </div>
            <h1>Login Pengurus</h1>
            <p className="text-sm text-muted">
              Masuk untuk mencatat timbangan harian, memperbarui stok katalog, dan mengelola poin
              penyetor.
            </p>
          </div>

          {error ? (
            <div className="form-error" role="alert">
              {error}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="stack stack--sm">
            <InputField
              id="admin-email"
              label="Email Pengurus"
              type="email"
              autoComplete="email"
              required
              placeholder="pengurus@tps3r.id"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <InputField
              id="admin-password"
              label="Kata Sandi"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button type="submit" variant="primary" size="lg" block disabled={loading}>
              <LogIn size={18} />
              <span>{loading ? 'Memeriksa Akses...' : 'Masuk ke Panel Pengurus'}</span>
            </Button>
          </form>

          <Link href="/" className="btn btn--ghost btn--sm btn--block">
            Kembali ke Beranda Publik
          </Link>
        </CardBody>
      </Card>
    </main>
  );
}
