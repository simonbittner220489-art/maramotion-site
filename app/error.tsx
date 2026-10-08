'use client';
export default function ErrorPage({ reset }: { reset: () => void }) {
  return <main id="main" className="error-page"><span className="eyebrow">KURZE VERSCHNAUFPAUSE</span><h1>Das hat nicht<br />ganz geklappt.</h1><p>Die Seite konnte gerade nicht geladen werden. Bitte versuche es erneut.</p><button className="button" onClick={reset}>Erneut versuchen</button><a href="/">Zur Startseite</a></main>;
}
