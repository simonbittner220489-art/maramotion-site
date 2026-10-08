const songs = {
  first: { title: 'Mara und das große Regenwaldfest', file: 'mara-regenwaldfest.mp3' },
  second: { title: 'Mara – Gemeinsam sind wir stark', file: 'mara-gemeinsam-sind-wir-stark.mp3' },
};

export function SongPlayer({ track }: { track: keyof typeof songs }) {
  const song = songs[track];
  const src = `https://pub-0d0a6aa441e24549b4c166c4f7cafd31.r2.dev/${song.file}`;
  return <figure className="song-player"><figcaption>{song.title}</figcaption><audio controls preload="none" aria-label={song.title} src={src}>Dein Browser unterstützt die Audiowiedergabe nicht.</audio><a href={src} className="text-link">Song direkt anhören <span aria-hidden="true">↗</span></a></figure>;
}

export function SecondSong() {
  return <section className="source-content song-section"><h2>Der Song zu Maras neuem Abenteuer</h2><p>Mara entdeckt, dass ihr Regenwald Schutz braucht. In ihrem neuen Song geht es um Mut, Freundschaft und darum, was wir gemeinsam schaffen können</p><SongPlayer track="second" /><p>🎧 Jetzt anhören und Mara begleiten!</p></section>;
}
