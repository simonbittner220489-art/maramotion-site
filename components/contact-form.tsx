'use client';

import { useState } from 'react';
import Link from 'next/link';

export function ContactForm() {
  const [state, setState] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setState('sending');
    try {
      const response = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: data.get('name'), email: data.get('email'), message: data.get('message'), consentGdpr: data.get('consent') === 'on', honeypot: data.get('website') }) });
      if (!response.ok) throw new Error(response.status === 429 ? 'Bitte warte einen Moment, bevor du eine weitere Nachricht sendest.' : 'Die Nachricht konnte nicht gespeichert werden. Bitte prüfe deine Angaben und versuche es erneut.');
      setState('success');
      form.reset();
    } catch (error) { setState('error'); setMessage(error instanceof Error ? error.message : 'Die Verbindung wurde unterbrochen. Bitte versuche es erneut.'); }
  }
  return <form onSubmit={submit} className="contact-form">
    <div className="eyebrow">POST AUS DEM REGENWALD</div><h2>Deine Nachricht.</h2>
    <label>Dein Name <span aria-hidden="true">*</span><input name="name" required minLength={2} maxLength={200} autoComplete="name" /></label>
    <label>E-Mail-Adresse <input name="email" type="email" maxLength={254} autoComplete="email" /><small>Damit Wolfgang dir antworten kann.</small></label>
    <label>Was möchtest du erzählen?<textarea name="message" rows={5} maxLength={5000} /></label>
    <div className="honeypot" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
    <label className="checkbox-label"><input type="checkbox" name="consent" required /><span>Ich bin damit einverstanden, dass meine Daten zur Kontaktaufnahme gespeichert und verarbeitet werden. Ich kann meine Einwilligung jederzeit widerrufen. <Link href="/rechtliches">Datenschutz</Link></span></label>
    <button className="button" disabled={state === 'sending'} type="submit">{state === 'sending' ? 'Wird gespeichert …' : 'Nachricht senden'} <span aria-hidden="true">↗</span></button>
    <div aria-live="polite" role="status">{state === 'success' && <p className="success-message">Vielen Dank! Deine Nachricht wurde gespeichert. Wolfgang kann sie im Kontaktbereich lesen.</p>}{state === 'error' && <p className="error-message">{message}</p>}</div>
    <small>Mit * markierte Angaben sind erforderlich. Bitte keine vertraulichen Daten oder persönlichen Angaben von Kindern senden.</small>
  </form>;
}
