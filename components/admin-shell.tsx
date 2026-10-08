'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function AdminShell({ children, name }: { children: React.ReactNode; name: string }) {
  const router = useRouter();
  const [error, setError] = useState('');
  async function logout() {
    try {
      const result = await fetch('/api/auth/logout', { method: 'POST' });
      if (!result.ok) throw new Error();
      router.push('/admin');
      router.refresh();
    } catch { setError('Abmeldung fehlgeschlagen. Bitte erneut versuchen.'); }
  }
  return <div className="admin-shell"><header className="admin-header"><Link className="brand" href="/admin"><span>mara.</span><small>REDAKTION</small></Link><nav aria-label="Adminnavigation"><Link href="/admin">Übersicht</Link><Link href="/">Website öffnen ↗</Link><span>{name}</span><button onClick={logout}>Abmelden</button></nav></header>{error && <p role="alert">{error}</p>}<main className="admin-main">{children}</main></div>;
}
