'use client';
import { useState } from 'react';
import Link from 'next/link';
import { LeadsPanel, MediaPanel, SettingsPanel } from './admin-panels';
import { shortTitle } from '@/lib/site';

type Entry = { id: string; slug: string; title: string; published: boolean | null; };
export function AdminDashboard({ initial, admin }: { initial: Entry[]; admin: boolean }) {
  const [tab, setTab] = useState('pages'), [query, setQuery] = useState(''), [entries, setEntries] = useState(initial), [status, setStatus] = useState('');
  async function remove(page: Entry) {
    if (!confirm(`Die Seite „${page.title}“ dauerhaft löschen?`)) return;
    try {
      const response = await fetch(`/api/content/pages/${page.id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error((await response.json()).error);
      setEntries(entries.filter(entry => entry.id !== page.id)); setStatus('Seite gelöscht.');
    } catch (error) { setStatus((error as Error).message); }
  }
  const tabs = [{ id: 'pages', label: 'Seiten & Tiere' }, { id: 'media', label: 'Mediathek' }, ...(admin ? [{ id: 'contacts', label: 'Kontaktanfragen' }, { id: 'settings', label: 'Einstellungen' }] : [])];
  return <><div className="admin-title-row"><div><span className="eyebrow">ALLES AN EINEM ORT</span><h1>Deine Regenwaldwelt.</h1></div><Link href="/admin/pages/new" className="button">+ Neue Seite</Link></div><div className="admin-stats"><div><strong>{entries.length}</strong><span>Inhalte</span></div><div><strong>{entries.filter(entry => entry.published).length}</strong><span>Veröffentlicht</span></div><div><strong>{entries.filter(entry => !entry.published).length}</strong><span>Entwürfe</span></div></div><nav className="admin-tabs" aria-label="Verwaltungsbereiche">{tabs.map(item => <button key={item.id} aria-current={tab === item.id ? 'page' : undefined} onClick={() => setTab(item.id)}>{item.label}</button>)}</nav>
    {tab === 'pages' && <section><label className="admin-search">Inhalte durchsuchen<input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Seitentitel oder URL" /></label><p role="status">{status}</p><div className="admin-page-list">{entries.filter(entry => `${entry.title} ${entry.slug}`.toLowerCase().includes(query.toLowerCase())).map(entry => <article className="admin-page-row" key={entry.id}><div><Link href={`/admin/pages/${entry.id}`}><h3>{shortTitle(entry.slug, entry.title)}</h3></Link><small>/{entry.slug === 'home' ? '' : entry.slug}</small></div><span className={`badge ${entry.published ? 'published' : ''}`}>{entry.published ? 'Veröffentlicht' : 'Entwurf'}</span><div className="button-row"><Link className="button secondary" href={`/admin/pages/${entry.id}`}>Bearbeiten</Link>{admin && !['home', 'impressum', 'rechtliches', 'kontakt'].includes(entry.slug) && <button className="admin-delete" aria-label={`${entry.title} löschen`} onClick={() => remove(entry)}>Löschen</button>}</div></article>)}</div></section>}
    {tab === 'media' && <MediaPanel />}{tab === 'contacts' && <LeadsPanel />}{tab === 'settings' && <SettingsPanel />}
  </>;
}
