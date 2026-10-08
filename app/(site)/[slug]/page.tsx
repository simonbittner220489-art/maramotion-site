import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPage, listPages } from '@/lib/queries';
import { animalNames, blocksOf, imageOf, shortTitle } from '@/lib/site';
import { pageMetadata, structuredPage } from '@/lib/seo';
import { extractQuiz } from '@/lib/quiz';
import { Content } from '@/components/content';
import { ContactForm } from '@/components/contact-form';
import { AnimalGrid } from '@/components/animal-grid';
import { Quiz } from '@/components/quiz';
import { AdventuresContent } from '@/components/adventures-content';
import type { ContentBlock } from '@/lib/types';

type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props) { return pageMetadata(await getPage((await params).slug)); }
export default async function ContentPage({ params }: Props) {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page?.published || slug === 'home') notFound();
  const blocks = blocksOf(page.blocks);
  const isAnimal = Boolean(animalNames[slug]);
  const isCatalog = slug === 'entdecke-die-tiere-des-regenwaldes';
  const isLegal = slug === 'impressum' || slug === 'rechtliches';
  const image = imageOf(blocks);
  const all = isCatalog || isAnimal ? await listPages() : [];
  const animalCards = all.filter(item => animalNames[item.slug] && item.slug !== slug).map(item => ({ slug: item.slug, name: animalNames[item.slug], image: imageOf(item.blocks)?.src || '' }));
  const title = slug === 'maras-abenteuer' ? 'Maras Abenteuer' : shortTitle(slug, page.title);
  const hasRainforestHero = slug === 'der-regenwald' || slug === 'kontakt';
  const reviewBefore = 'Wenn euch dieses Buch gefallen hat, dann hinterlasst mir bitte eine positive Rezension auf Amazon.de.';
  const reviewAfter = 'Wenn euch eines oder mehrere dieser Bücher gefallen haben, dann hinterlasst mir bitte eine positive Rezension, sofern ihr diese(s) über Amazon.de erworben habt.';
  const chapters = ['Warum ist der Regenwald wichtig?', 'Wie sieht der Regenwald aus?', 'Welche Tiere leben im Regenwald?', 'Warum ist der Regenwald in Gefahr?', 'Wie können wir helfen?', '🌿 Maras Botschaft für den Regenwald'];
  const articleBlocks: ContentBlock[] = blocks.flatMap(block => {
    if (slug === 'kontakt') {
      if (block.type === 'image' && block.src === '/images/844b3630c87e.webp' || block.type === 'heading' && block.level === 1 && block.content === 'Der Regenwald') return [];
      return [{ ...block, content: block.content?.replace(reviewBefore, reviewAfter), html: block.html?.replace(reviewBefore, reviewAfter) }];
    }
    if (slug === 'der-regenwald') {
      if (block.type === 'heading' && block.level === 1 && block.content?.startsWith('Der Regenwald – eine faszinierende Welt voller Leben')) return [
        { type: 'paragraph', content: 'Entdecke faszinierende Tiere und die Geheimnisse des tropischen Regenwaldes' },
        { type: 'heading', level: 2, content: 'Was ist ein Regenwald?' },
      ];
      if (chapters.includes(block.content || '')) return [{ ...block, type: 'heading', level: 2 }];
    }
    return [block];
  });
  return <main id="main" className={`detail-page ${isAnimal ? 'animal-page' : ''} ${isLegal ? 'legal-page' : ''} ${slug === 'der-regenwald' ? 'rainforest-page' : ''}`}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredPage(page)).replace(/</g, '\\u003c') }} />
    <div className="breadcrumbs"><Link href="/">Maras Welt</Link><span aria-hidden="true">/</span>{isAnimal && <><Link href="/entdecke-die-tiere-des-regenwaldes">Die Tierwelt</Link><span aria-hidden="true">/</span></>}<span>{isAnimal ? title : page.title.length > 65 ? title : page.title}</span></div>
    <section className={`detail-hero ${isAnimal ? 'with-image' : ''} ${hasRainforestHero ? 'rainforest-hero' : ''}`}>
      {hasRainforestHero && <><Image className="rainforest-background" src="/images/f7cf8f061c2c.webp" alt="Ein Wasserfall im grünen tropischen Regenwald" fill priority fetchPriority="high" sizes="100vw" /><div className="rainforest-shade" /></>}
      <div className="detail-hero-copy"><p className="eyebrow">{isAnimal ? 'BEGEGNUNGEN IM REGENWALD' : isLegal ? 'TRANSPARENZ & VERTRAUEN' : 'Willkommen in Maras Regenwaldwelt'}</p><h1>{title}</h1><p className="detail-deck">{page.excerpt}</p>{isAnimal && <div className="button-row"><a className="button" href="#steckbrief">Lerne mich kennen ↓</a><a className="text-link" href="#tierquiz">Zum Tier-Quiz ↗</a></div>}</div>
      {isAnimal && image?.src && <div className="portrait-wrap"><Image src={image.src} alt={title} fill priority fetchPriority="high" sizes="(max-width: 768px) 90vw, 45vw" /><span className="portrait-label">{title} / Regenwald-Entdecker</span></div>}
    </section>
    {isCatalog ? <section className="catalog section-pad"><div className="catalog-intro"><Content blocks={blocks.filter(block => block.type !== 'image' && !Object.values(animalNames).some(name => block.content?.trim() === name))} /><Image className="expert-poster" src="/images/8b748f11b063.webp" alt="Bist du ein echter Regenwald-Experte?" width={941} height={941} sizes="(max-width: 768px) 85vw, 360px" /></div><AnimalGrid animals={animalCards} searchable /></section>
      : slug === 'maras-abenteuer' ? <AdventuresContent blocks={blocks} /> : <section id="steckbrief" className={`article-layout section-pad ${slug === 'kontakt' ? 'contact-layout' : ''}`}><div className="article-aside"><span className="eyebrow">{isAnimal ? 'DEIN STECKBRIEF' : 'MARAS REGENWALDWELT'}</span><div className="aside-line" /><p>{isAnimal ? 'Wissen macht neugierig. Neugier macht die Welt ein bisschen größer.' : 'Geschichten und Wissen, die uns der Natur näherbringen.'}</p></div><div className="article-body"><Content blocks={articleBlocks} skipImages={isAnimal} />{slug === 'kontakt' && <ContactForm />}{isAnimal && <div id="tierquiz"><Quiz questions={extractQuiz(blocks)} /></div>}{slug === 'rechtliches' && <section className="privacy-note"><h2>Datenschutz auf der neu aufgebauten Website</h2><p>Auf dieser Website werden keine Analyse- oder Werbetracker geladen. Kontaktanfragen werden mit Einwilligung in der eigenen Datenbank gespeichert. Der Adminbereich nutzt notwendige, zeitlich begrenzte Sitzungscookies. Externe Buchshops öffnen erst durch einen bewussten Klick. Die oben übernommenen Angaben zum früheren Hosting und dessen Statistikfunktionen sind Archivangaben; die tatsächlichen Hosting- und E-Mail-Dienstleister sind vor Veröffentlichung vom Betreiber zu aktualisieren.</p></section>}</div></section>}
    {isAnimal && <section className="related section-pad"><div className="section-heading"><h2>Noch mehr<br /><em>wilde Nachbarn.</em></h2><Link className="text-link" href="/entdecke-die-tiere-des-regenwaldes">Die ganze Tierwelt ↗</Link></div><AnimalGrid animals={animalCards.slice(0, 4)} /></section>}
  </main>;
}
