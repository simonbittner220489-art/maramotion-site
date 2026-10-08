'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { nav, animalNames } from '@/lib/site';

export function Navigation({ links = nav }: { links?: typeof nav }) {
  const [open, setOpen] = useState(false);
  const [submenu, setSubmenu] = useState<string | null>(null);
  const pathname = usePathname();
  const toggle = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLElement>(null);
  const submenuToggle = useRef<HTMLButtonElement | null>(null);
  const items = nav.map(link => ({ ...link, label: links.find(item => item.href === link.href)?.label || link.label })).map(link => ({ ...link, label: ['/maras-abenteuer', '/uber-mich', '/rechtliches'].includes(link.href) ? nav.find(item => item.href === link.href)!.label : link.label }));
  for (const link of links) if (!items.some(item => item.href === link.href) && link.href !== '/kontakt' && link.href !== '/impressum') items.push(link);
  const close = () => { setOpen(false); setSubmenu(null); };
  useEffect(() => {
    if (!submenu) return;
    const onPointer = (event: PointerEvent) => { if (!menu.current?.contains(event.target as Node)) setSubmenu(null); };
    document.addEventListener('pointerdown', onPointer);
    return () => document.removeEventListener('pointerdown', onPointer);
  }, [submenu]);
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    menu.current?.querySelector<HTMLAnchorElement>('a')?.focus();
    return () => { document.body.style.overflow = previous; };
  }, [open]);
  useEffect(() => {
    if (!open && !submenu) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        if (submenu) { setSubmenu(null); submenuToggle.current?.focus(); }
        else { setOpen(false); toggle.current?.focus(); }
      }
      if (event.key !== 'Tab' || !open) return;
      const targets = [toggle.current, ...Array.from(menu.current?.querySelectorAll<HTMLElement>('a, button') || [])].filter((target): target is HTMLElement => Boolean(target && target.getClientRects().length));
      const first = targets[0], last = targets[targets.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, submenu]);
  return <header className="site-header">
    <Link href="/" className="brand" onClick={close} aria-label="Maras Regenwaldwelt – zur Startseite"><span>maras</span><small>REGENWALDWELT</small></Link>
    <button className="menu-toggle" ref={toggle} aria-controls="main-nav" aria-expanded={open} onClick={() => { setOpen(!open); setSubmenu(null); }}>{open ? 'Schließen −' : 'Menü +'}</button>
    <nav ref={menu} id="main-nav" className={`main-nav ${open ? 'is-open' : ''}`} aria-label="Hauptnavigation" onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setSubmenu(null); }}>
      {items.map(link => {
        const group = link.href === '/entdecke-die-tiere-des-regenwaldes' ? 'animals' : link.href === '/rechtliches' ? 'legal' : null;
        if (!group) return <Link key={link.href} href={link.href} aria-current={pathname === link.href ? 'page' : undefined} onClick={close}>{link.label}</Link>;
        const children = group === 'animals' ? Object.entries(animalNames).map(([slug, label]) => ({ href: `/${slug}`, label })) : [{ href: '/rechtliches', label: 'Haftungsausschluss und Datenschutzbestimmungen' }, { href: '/impressum', label: 'Impressum' }];
        return <div className="nav-group" key={link.href}><div className="nav-group-label"><Link href={link.href} aria-current={pathname === link.href ? 'page' : undefined} onClick={close}>{link.label}</Link><button className="submenu-toggle" aria-label={group === 'animals' ? 'Tierseiten anzeigen' : 'Rechtliche Seiten anzeigen'} aria-expanded={submenu === group} aria-controls={`nav-${group}`} onClick={event => { submenuToggle.current = event.currentTarget; setSubmenu(submenu === group ? null : group); }}><span aria-hidden="true">⌄</span></button></div><div id={`nav-${group}`} className={`nav-submenu ${group === 'animals' ? 'animal-submenu' : ''}`} hidden={submenu !== group}>{children.map(child => <Link key={child.href} href={child.href} aria-current={pathname === child.href ? 'page' : undefined} onClick={close}>{child.label}</Link>)}</div></div>;
      })}
      <Link href="/kontakt" className="nav-contact" onClick={close}>Kontakt <span aria-hidden="true">↗</span></Link>
    </nav>
  </header>;
}
