'use client';

import { useRef, useState } from 'react';

export function PrivacySettings() {
  const dialog = useRef<HTMLDialogElement>(null);
  const [external, setExternal] = useState(false);
  function open() {
    setExternal(localStorage.getItem('mara-external-consent') === 'yes');
    dialog.current?.showModal();
  }
  function save() {
    localStorage.setItem('mara-external-consent', external ? 'yes' : 'no');
    window.dispatchEvent(new Event('mara-consent-change'));
    dialog.current?.close();
  }
  return <><button className="footer-text-button" onClick={open}>Datenschutz-Einstellungen</button>
    <dialog ref={dialog} className="privacy-dialog" aria-labelledby="privacy-title">
      <h2 id="privacy-title">Deine Privatsphäre zählt.</h2><p>Hier werden keine Analyse- oder Werbetracker geladen. Notwendige Sitzungscookies werden nur für den Adminbereich verwendet.</p>
      <label className="checkbox-label"><input type="checkbox" checked={external} onChange={event => setExternal(event.target.checked)} /><span>Externe Medien nach meiner Auswahl erlauben. Dabei können Daten an den jeweiligen Anbieter übertragen werden.</span></label>
      <p>Die Auswahl wird ausschließlich in diesem Browser gespeichert. Du kannst sie jederzeit ändern.</p><div className="button-row"><button className="button" onClick={save}>Auswahl speichern</button><button className="button secondary" onClick={() => dialog.current?.close()}>Schließen</button></div>
    </dialog>
  </>;
}
