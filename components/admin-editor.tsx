'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { ContentBlock } from '@/lib/types';
import { hrefFor } from '@/lib/site';

export interface EditablePage { id?: string; slug: string; title: string; excerpt: string; blocks: ContentBlock[]; seoTitle: string; seoDescription: string; published: boolean; }
export function AdminEditor({ initial }: { initial: EditablePage }) {
  const [page, setPage] = useState(initial);
  const [status, setStatus] = useState('');
  const [pending, setPending] = useState(false);
  const router = useRouter();
  function updateBlock(index: number, values: Partial<ContentBlock>) { setPage(current => ({ ...current, blocks: current.blocks.map((block, i) => i === index ? { ...block, ...values } : block) })); }
  function move(index: number, direction: number) {
    const blocks = [...page.blocks];
    const target = index + direction;
    if (target < 0 || target >= blocks.length) return;
    [blocks[index], blocks[target]] = [blocks[target], blocks[index]];
    setPage({ ...page, blocks });
  }
  async function save(event: React.FormEvent) {
    event.preventDefault();
    setPending(true); setStatus('');
    const { id, slug, ...data } = page;
    try {
      const response = await fetch(id ? `/api/content/pages/${id}` : '/api/content/pages', { method: id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(id ? data : { ...data, slug }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Speichern fehlgeschlagen.');
      setStatus('Gespeichert. Die Änderung ist auf der Website verfügbar.');
      if (!id) router.push(`/admin/pages/${result.page.id}`);
      router.refresh();
    } catch (error) { setStatus(error instanceof Error ? error.message : 'Verbindung fehlgeschlagen.'); }
    finally { setPending(false); }
  }
  return <form className="admin-editor" onSubmit={save}><div className="admin-title-row"><div><Link href="/admin">← Alle Inhalte</Link><h1>{initial.id ? 'Seite bearbeiten' : 'Neue Seite'}</h1></div><div className="button-row">{initial.id && <Link href={hrefFor(page.slug)} className="button secondary">Seite ansehen ↗</Link>}<button className="button" disabled={pending}>{pending ? 'Speichert …' : 'Änderungen speichern'}</button></div></div><p role="status" aria-live="polite">{status}</p>
    <section className="admin-card admin-fields"><label>Seitentitel<input value={page.title} onChange={e => setPage({ ...page, title: e.target.value })} required maxLength={500} /></label><label>URL-Adresse<input value={page.slug} disabled={Boolean(initial.id)} onChange={e => setPage({ ...page, slug: e.target.value })} pattern="[a-z0-9]+(-[a-z0-9]+)*" required /></label><label>Einleitung<textarea value={page.excerpt} onChange={e => setPage({ ...page, excerpt: e.target.value })} rows={3} maxLength={1000} /></label><label className="checkbox-label"><input type="checkbox" checked={page.published} onChange={e => setPage({ ...page, published: e.target.checked })} />Veröffentlicht</label></section>
    <section className="admin-card"><h2>Inhaltsblöcke</h2><p>Texte direkt bearbeiten. Bestehende Links und Hervorhebungen bleiben erhalten.</p><div className="block-list">{page.blocks.map((block, index) => <div className="block-editor" key={`${index}-${block.type}`}><div className="block-toolbar"><strong>{index + 1}. {block.type === 'image' ? 'Bild' : block.type === 'heading' ? 'Überschrift' : block.type === 'link' ? 'Link' : 'Text'}</strong><span><button type="button" aria-label={`Block ${index + 1} nach oben`} onClick={() => move(index, -1)} disabled={index === 0}>↑</button><button type="button" aria-label={`Block ${index + 1} nach unten`} onClick={() => move(index, 1)} disabled={index === page.blocks.length - 1}>↓</button><button type="button" aria-label={`Block ${index + 1} entfernen`} onClick={() => setPage({ ...page, blocks: page.blocks.filter((_, i) => i !== index) })}>Entfernen</button></span></div>
      {block.type === 'image' ? <><label>Bildpfad<input value={block.src || ''} onChange={e => updateBlock(index, { src: e.target.value })} /></label><label>Bildbeschreibung<input value={block.alt || ''} onChange={e => updateBlock(index, { alt: e.target.value })} /></label><small>Den Bildpfad findest du in der Mediathek.</small></> : <><div className="rich-editor" contentEditable suppressContentEditableWarning role="textbox" aria-label={`Text für Block ${index + 1}`} aria-multiline="true" onBlur={e => updateBlock(index, { html: e.currentTarget.innerHTML, content: e.currentTarget.innerText })} dangerouslySetInnerHTML={{ __html: block.html || (block.content || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') }} />{block.type === 'link' && <label>Link-Adresse<input value={block.href || ''} onChange={e => updateBlock(index, { href: e.target.value })} /></label>}</>}</div>)}</div><div className="button-row">{(['paragraph', 'heading', 'image', 'link'] as const).map(type => <button className="button secondary" type="button" key={type} onClick={() => setPage({ ...page, blocks: [...page.blocks, { type, content: '', ...(type === 'heading' ? { level: 2 } : {}) }] })}>+ {type === 'paragraph' ? 'Text' : type === 'heading' ? 'Überschrift' : type === 'image' ? 'Bild' : 'Link'}</button>)}</div></section>
    <section className="admin-card admin-fields"><h2>Suchmaschinen</h2><label>SEO-Titel<input value={page.seoTitle} onChange={e => setPage({ ...page, seoTitle: e.target.value })} maxLength={200} /></label><label>SEO-Beschreibung<textarea value={page.seoDescription} onChange={e => setPage({ ...page, seoDescription: e.target.value })} maxLength={500} rows={3} /></label></section><button className="button" disabled={pending}>Änderungen speichern</button>
  </form>;
}
