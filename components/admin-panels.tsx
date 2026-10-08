'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import type { nav } from '@/lib/site';

async function api<T>(url: string, method = 'GET', body?: unknown): Promise<T> {
  const form = body instanceof FormData;
  const response = await fetch(url, { method, headers: body && !form ? { 'Content-Type': 'application/json' } : {}, body: body ? form ? body : JSON.stringify(body) : undefined });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Anfrage fehlgeschlagen.');
  return result;
}
type Lead = { id: string; name: string | null; email: string; message: string; status: string; createdAt: string; };
export function LeadsPanel() {
  const [leads, setLeads] = useState<Lead[]>([]), [status, setStatus] = useState('Lädt …');
  useEffect(() => { api<{ contacts: Lead[] }>('/api/contacts').then(data => { setLeads(data.contacts); setStatus(''); }).catch(error => setStatus(error.message)); }, []);
  async function change(lead: Lead, status: string) {
    try { await api('/api/contacts', 'PATCH', { id: lead.id, status }); setLeads(leads.map(row => row.id === lead.id ? { ...row, status } : row)); setStatus('Status gespeichert.'); }
    catch (error) { setStatus((error as Error).message); }
  }
  async function remove(lead: Lead) {
    if (!confirm('Diese Nachricht dauerhaft löschen?')) return;
    try { await api('/api/contacts', 'DELETE', { id: lead.id }); setLeads(leads.filter(row => row.id !== lead.id)); setStatus('Nachricht gelöscht.'); }
    catch (error) { setStatus((error as Error).message); }
  }
  return <section><h2>Kontaktanfragen</h2><p>Nachrichten vertraulich behandeln und nicht mehr benötigte Einträge löschen.</p><p role="status">{status}</p>{!leads.length && !status && <p className="empty-state">Noch keine Kontaktanfragen. Neue Nachrichten erscheinen hier.</p>}{leads.map(lead => <article className="admin-card lead-card" key={lead.id}><div className="admin-title-row"><h3>{lead.name || 'Kontaktanfrage'}</h3><time>{new Date(lead.createdAt).toLocaleDateString('de-DE')}</time></div>{lead.email && <a className="text-link" href={`mailto:${lead.email}`}>{lead.email}</a>}<p className="lead-message">{lead.message || 'Keine Nachricht angegeben.'}</p><div className="button-row"><label>Status<select value={lead.status} onChange={event => change(lead, event.target.value)}><option value="new">Neu</option><option value="read">Gelesen</option><option value="replied">Beantwortet</option><option value="archived">Archiviert</option></select></label><button className="button secondary" onClick={() => remove(lead)}>Löschen</button></div></article>)}</section>;
}
type Media = { id: string; filename: string; path: string; width: number; height: number; };
export function MediaPanel() {
  const [media, setMedia] = useState<Media[]>([]), [status, setStatus] = useState('Lädt …');
  useEffect(() => { api<{ media: Media[] }>('/api/media').then(data => { setMedia(data.media); setStatus(''); }).catch(error => setStatus(error.message)); }, []);
  async function upload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = event.currentTarget; setStatus('Bild wird geprüft und optimiert …');
    try { const data = await api<{ media: Media }>('/api/media', 'POST', new FormData(form)); setMedia([data.media, ...media]); form.reset(); setStatus('Bild hochgeladen. Den Bildpfad kannst du in eine Seite einsetzen.'); }
    catch (error) { setStatus((error as Error).message); }
  }
  return <section><h2>Mediathek</h2><p>JPEG, PNG oder WebP, maximal 5 MB. Bilder werden geprüft, Metadaten entfernt und als WebP gespeichert.</p><form className="admin-card button-row" onSubmit={upload}><label>Bild auswählen<input name="file" type="file" accept="image/jpeg,image/png,image/webp" required /></label><button className="button">Bild hochladen</button></form><p role="status">{status}</p><div className="media-grid">{media.map(image => <article className="admin-card" key={image.id}><Image src={image.path} width={image.width || 300} height={image.height || 300} alt="Mediathek-Vorschau" unoptimized /><label>Bildpfad<input readOnly value={image.path} onFocus={event => event.target.select()} /></label></article>)}</div></section>;
}
export function SettingsPanel() {
  const [navigation, setNavigation] = useState<typeof nav>([]), [footer, setFooter] = useState(''), [status, setStatus] = useState('Lädt …');
  useEffect(() => { api<{ navigation: typeof nav; footer: { text: string } }>('/api/settings').then(data => { setNavigation(data.navigation); setFooter(data.footer?.text || ''); setStatus(''); }).catch(error => setStatus(error.message)); }, []);
  async function save(event: React.FormEvent) {
    event.preventDefault();
    try { await api('/api/settings', 'PUT', { navigation, footer: { text: footer } }); setStatus('Navigation und Footer gespeichert.'); }
    catch (error) { setStatus((error as Error).message); }
  }
  return <form onSubmit={save} className="admin-card admin-fields"><h2>Navigation & Footer</h2><p>Es sind nur existierende interne Seiten als Navigationsziele erlaubt.</p>{navigation.map((link, index) => <div className="admin-field-pair" key={index}><label>Menüpunkt {index + 1}<input value={link.label} onChange={e => setNavigation(navigation.map((item, i) => i === index ? { ...item, label: e.target.value } : item))} required maxLength={50} /></label><label>Linkziel {index + 1}<input value={link.href} onChange={e => setNavigation(navigation.map((item, i) => i === index ? { ...item, href: e.target.value } : item))} required /></label></div>)}<label>Footer-Text<textarea value={footer} onChange={e => setFooter(e.target.value)} maxLength={300} /></label><button className="button">Einstellungen speichern</button><p role="status">{status}</p></form>;
}
