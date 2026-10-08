import Link from 'next/link';

export function Footer({ text = 'Geschichten, die verbinden. Eine Welt, die wir schützen.' }: { text?: string }) {
  return <footer className="site-footer"><div className="footer-top"><div><span className="eyebrow">DAS ABENTEUER GEHT WEITER</span><h2>Bleib neugierig.<br /><em>Bleib verbunden.</em></h2></div><Link href="/kontakt" className="round-link" aria-label="Kontakt aufnehmen">↗</Link></div>
    <div className="footer-bottom"><Link href="/" className="brand"><span>maras</span><small>REGENWALDWELT</small></Link><p>{text}</p><nav aria-label="Footernavigation"><Link href="/uber-mich">Über mich</Link><Link href="/kontakt">Kontakt</Link><Link href="/impressum">Impressum</Link><Link href="/rechtliches">Haftungsausschluss und Datenschutzbestimmungen</Link></nav></div>
    <div className="footer-credit"><Link href="/admin">Admin</Link><a href="#top">Nach oben ↑</a></div>
  </footer>;
}
