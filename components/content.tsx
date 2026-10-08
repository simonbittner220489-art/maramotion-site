import Image from 'next/image';
import sanitize from 'sanitize-html';
import type { ContentBlock } from '@/lib/types';
import { stripDecorations } from '@/lib/site';

export function RichText({ block }: { block: ContentBlock }) {
  const html = sanitize(block.html || '', { allowedTags: ['strong', 'b', 'em', 'i', 'a', 'br', 'sup', 'sub'], allowedAttributes: { a: ['href', 'title'] }, allowedSchemes: ['https', 'http', 'mailto', 'tel'], allowProtocolRelative: false });
  return html ? <span dangerouslySetInnerHTML={{ __html: html }} /> : <>{block.content}</>;
}

export function Content({ blocks, skipImages = false, skipHeading = false }: { blocks: ContentBlock[]; skipImages?: boolean; skipHeading?: boolean }) {
  return <div className="source-content">{blocks.map((block, index) => {
    if (block.type === 'image') return skipImages || !block.src ? null : <figure key={index} data-reveal><Image src={block.src} width={block.width || 960} height={block.height || 1200} alt={block.alt || 'Ein Einblick in Maras Regenwaldwelt'} sizes="(max-width: 768px) 90vw, 640px" /></figure>;
    if (block.type === 'heading') {
      if (skipHeading && block.level === 1) return null;
      return block.level === 1 || (block.content?.length || 0) > 160 ? <div className="source-intro" key={index}><RichText block={block} /></div> : <h2 key={index} data-reveal>{stripDecorations(block.content || '')}</h2>;
    }
    if (block.type === 'link' || block.type === 'download') return <a className="text-link" key={index} href={block.href || block.src}>{block.content} <span aria-hidden="true">↗</span></a>;
    if (block.type === 'list') return <ul key={index}>{block.items?.map(item => <li key={item}>{item}</li>)}</ul>;
    if (block.type === 'list-item') return <ul className="source-list" key={index}><li><RichText block={block} /></li></ul>;
    return <p key={index}><RichText block={block} /></p>;
  })}</div>;
}
