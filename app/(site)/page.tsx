import Image from 'next/image';
import Link from 'next/link';
import { getPage, listPages } from '@/lib/queries';
import { animalNames, blocksOf, imageOf } from '@/lib/site';
import { Content } from '@/components/content';
import { AnimalGrid } from '@/components/animal-grid';
import { pageMetadata } from '@/lib/seo';
import { SongPlayer, SecondSong } from '@/components/song-player';

export async function generateMetadata() { return pageMetadata(await getPage('home')); }
export default async function Home() {
  const [page, all] = await Promise.all([getPage('home'), listPages()]);
  if (!page) throw new Error('Content seed is required.');
  const blocks = blocksOf(page.blocks);
  const moreBlocks = blocks.filter(block => !(block.type === 'heading' && block.level === 1) && block.type !== 'image').slice(3);
  const conservationIndex = moreBlocks.findIndex(block => block.type === 'heading' && block.content?.includes('Gemeinsam für den Regenwald'));
  const animals = ['gelbbrustara', 'jaguar', 'faultier', 'tukan'].flatMap(slug => {
    const animal = all.find(item => item.slug === slug);
    return animal ? [{ slug, name: animalNames[slug], image: imageOf(animal.blocks)?.src || '' }] : [];
  });
  return <main id="main">
    <section className="hero">
      <div className="hero-image" data-parallax><Image src="/images/f7cf8f061c2c.webp" alt="Ein Wasserfall mitten im üppig grünen Regenwald" fill priority fetchPriority="high" sizes="100vw" /></div>
      <div className="hero-shade" /><div className="hero-content"><h1>Die Welt ist<br />voller <em>Wunder.</em></h1><p className="hero-description">Mit Mara den Regenwald entdecken.<br />Geschichten erleben. Tiere kennenlernen.<br />Und gemeinsam die Natur schützen.</p></div>
      <div className="hero-bottom"><span>ENTDECKEN. STAUNEN. SCHÜTZEN.</span></div>
    </section>
    <section id="willkommen" className="welcome section-pad"><div className="section-label"><span>01 — WILLKOMMEN BEI MARA</span><span>FÜR KLEINE & GROSSE ENTDECKER</span></div>
      <div className="welcome-grid"><h2 data-reveal>Kleine Entdecker.<br /><em>Großes Staunen.</em></h2><div className="welcome-copy" data-reveal><Content blocks={blocks.filter(block => block.type === 'heading' && block.level === 1)} /><Link className="text-link" href="/uber-mich">Die Geschichte hinter Mara <span aria-hidden="true">↗</span></Link></div></div>
    </section>
    <section className="wildlife section-pad"><div className="section-label"><span>Eine kleine Auswahl an Bewohnern des Regenwaldes</span><span>WILD. WUNDERSCHÖN. WICHTIG.</span></div><div className="section-heading"><h2 data-reveal>So viel Leben.<br /><em>So viel zu entdecken.</em></h2><Link href="/entdecke-die-tiere-des-regenwaldes" className="text-link">Weitere Tiere kennenlernen ↗</Link></div><AnimalGrid animals={animals} /></section>
    <section className="book-feature section-pad"><div className="book-art" data-reveal><div className="book-orbit" /><Image className="book-one" src="/images/885f4eee45e8.webp" alt="Buchcover: Mara und das große Regenwaldfest" width={498} height={760} sizes="(max-width: 768px) 40vw, 300px" /><Image className="book-two" src="/images/57dce10be77d.webp" alt="Buchcover: Mara und der Regenwald sind in Gefahr" width={768} height={993} sizes="(max-width: 768px) 40vw, 300px" /><span className="book-stamp">VORLESEN.<br />MITFÜHLEN.<br />MUTIG SEIN.</span></div><div className="book-copy" data-reveal><p className="eyebrow">03 — GESCHICHTEN, DIE WACHSEN</p><h2>Ein kleines Buch.<br /><em>Ein großes Abenteuer.</em></h2><Content blocks={blocks.filter(block => block.type === 'paragraph').slice(0, 2)} /><Link href="/maras-abenteuer" className="button">Maras Abenteuer entdecken <span aria-hidden="true">↗</span></Link></div></section>
    <section className="home-more section-pad"><div className="section-label"><span>04 — NOCH MEHR REGENWALDWELT</span><span>KREATIV SEIN & GUTES TUN</span></div><div className="home-more-grid"><div><Content blocks={conservationIndex < 0 ? moreBlocks : moreBlocks.slice(0, conservationIndex)} /><SongPlayer track="first" /><SecondSong />{conservationIndex >= 0 && <Content blocks={moreBlocks.slice(conservationIndex)} />}</div><aside className="home-collage" aria-label="Einblicke in Maras Welt">{blocks.filter(block => block.type === 'image').slice(2).filter(block => block.src !== '/images/8b748f11b063.webp').map((block, i) => <Image key={i} src={block.src!} alt={block.alt || 'Illustration aus Maras Regenwaldwelt'} width={block.width || 600} height={block.height || 600} sizes="(max-width: 768px) 85vw, 420px" />)}</aside></div></section>
  </main>;
}
