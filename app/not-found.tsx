import Link from 'next/link';
export default function NotFound() {
  return <main id="main" className="error-page"><span className="eyebrow">404 — EIN KLEINER UMWEG</span><h1>Im Grünen<br /><em>verlaufen?</em></h1><p>Diese Seite gibt es nicht. Mara zeigt dir den Weg zurück.</p><Link className="button" href="/">Zurück in Maras Welt ↗</Link></main>;
}
