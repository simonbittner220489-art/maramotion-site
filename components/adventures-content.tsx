import Image from 'next/image';
import type { ContentBlock } from '@/lib/types';
import { Content } from './content';
import { SongPlayer, SecondSong } from './song-player';

export function AdventuresContent({ blocks }: { blocks: ContentBlock[] }) {
  const text = blocks.filter(block => block.type !== 'image');
  const first = text.findIndex(block => block.type === 'heading' && block.content === 'Mara und das große Regenwaldfest');
  const transition = text.findIndex(block => block.content?.startsWith('Doch Mara wird größer.'));
  const second = text.findIndex(block => block.type === 'heading' && block.content === 'Mara und der Regenwald sind in Gefahr');
  const song = text.findIndex(block => block.type === 'heading' && block.content?.includes('Gemeinsam sind wir stark'));
  const closing = text.findIndex(block => block.type === 'heading' && block.content?.includes('Jede Geschichte kann etwas bewegen'));
  return <section className="adventures-content section-pad">
    <div className="adventures-intro"><Content blocks={text.slice(0, first)} /></div>
    <div className="adventure-book"><div className="adventure-cover"><Image src="/images/885f4eee45e8.webp" alt="Buchcover: Mara und das große Regenwaldfest" width={498} height={760} sizes="240px" /></div><div><Content blocks={text.slice(first, transition >= 0 ? transition : second)} /><section className="source-content song-section"><h2>Der Song zu Maras erstem Abenteuer</h2><SongPlayer track="first" /></section></div></div>
    <div className="mara-growing"><Image src="/images/mara-baby-und-erwachsen.webp" alt="Mara als kleines Papageienküken und als größer gewordener Papagei im Regenwald" width={1800} height={859} sizes="(max-width: 1200px) 90vw, 1200px" />{transition >= 0 && <Content blocks={text.slice(transition, second)} />}</div>
    <div className="adventure-book"><div className="adventure-cover"><Image src="/images/24357f7e8d43.webp" alt="Buchcover: Mara und der Regenwald sind in Gefahr" width={1366} height={1881} sizes="240px" /></div><div><Content blocks={text.slice(second, song >= 0 ? song : closing >= 0 ? closing : text.length)} /><SecondSong /></div></div>
    {closing >= 0 && <div className="adventures-closing"><Content blocks={text.slice(closing)} /></div>}
  </section>;
}
