'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export interface AnimalCard { slug: string; name: string; image: string; }
export function AnimalGrid({ animals, searchable = false }: { animals: AnimalCard[]; searchable?: boolean }) {
  const [query, setQuery] = useState('');
  const filtered = animals.filter(animal => animal.name.toLocaleLowerCase('de').includes(query.toLocaleLowerCase('de')));
  return <>{searchable && <div className="animal-search"><label htmlFor="animal-search">Welches Tier möchtest du kennenlernen?</label><input id="animal-search" type="search" placeholder="Zum Beispiel: Jaguar" value={query} onChange={event => setQuery(event.target.value)} /><span aria-live="polite">{filtered.length} Tiere entdeckt</span></div>}
    <div className="animal-grid">{filtered.map((animal, index) => <Link key={animal.slug} href={`/${animal.slug}`} className="animal-card" data-reveal>
      <div className="animal-picture"><Image src={animal.image} alt={animal.name} fill sizes="(max-width: 650px) calc((100vw - 63px) / 2), (max-width: 900px) 43vw, 22vw" /><span className="animal-number">{String(index + 1).padStart(2, '0')}</span></div>
      <div className="animal-caption"><h3>{animal.name}</h3><span aria-hidden="true">↗</span></div>
    </Link>)}</div>
    {!filtered.length && <p className="empty-state">Kein Tier gefunden. Versuche einen anderen Namen.</p>}
  </>;
}
