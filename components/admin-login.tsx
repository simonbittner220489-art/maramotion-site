'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export function AdminLogin() {
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState(false);
  const router = useRouter();
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage('');
    const data = new FormData(event.currentTarget);
    try {
      const response = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: data.get('email'), password: data.get('password') }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || 'Anmeldung fehlgeschlagen.');
      router.refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Keine Verbindung. Bitte erneut versuchen.'); }
    finally { setPending(false); }
  }
  return <main className="admin-login"><Link className="brand" href="/"><span>mara.</span><small>REGENWALDWELT</small></Link><div className="admin-card"><span className="eyebrow">DEIN REDAKTIONSBEREICH</span><h1>Willkommen zurück.</h1><p>Verwalte Maras Inhalte, Bilder und Nachrichten.</p><form onSubmit={submit}><label>E-Mail-Adresse<input name="email" type="email" autoComplete="username" required /></label><label>Passwort<input name="password" type="password" autoComplete="current-password" required maxLength={128} /></label><button className="button" disabled={pending}>{pending ? 'Wird angemeldet …' : 'Sicher anmelden ↗'}</button><p role="alert">{message}</p></form><small>Der erste Zugang wird lokal mit <code>npm run admin:create</code> angelegt. Es gibt keine Standard-Zugangsdaten.</small></div><Link href="/">← Zur Website</Link></main>;
}
