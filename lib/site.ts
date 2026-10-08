import type { ContentBlock } from './types';

export const animalNames: Record<string, string> = {
  faultier: 'Faultier', gelbbrustara: 'Gelbbrustara', 'gruene-anakonda': 'Grüne Anakonda', harpyie: 'Harpyie', jaguar: 'Jaguar', kapuzineraffe: 'Kapuzineraffe', kolibri: 'Kolibri', libelle: 'Libelle', 'mata-mata': 'Mata-Mata', pfeilgiftfrosch: 'Pfeilgiftfrosch', tukan: 'Tukan', diskusbuntbarsch: 'Diskusbuntbarsch',
};
export const pageNames: Record<string, string> = {
  home: 'Maras Regenwaldwelt', 'der-regenwald': 'Der Regenwald', 'entdecke-die-tiere-des-regenwaldes': 'Eine Welt voller Leben.', 'maras-abenteuer': 'Maras Abenteuer', 'uber-mich': 'Hallo, ich bin Wolfgang.', 'fuer-eltern-und-paedagog-innen': 'Gemeinsam die Welt entdecken.', kontakt: 'Lass uns ins Gespräch kommen.', impressum: 'Impressum', rechtliches: 'Rechtliches & Datenschutz',
};
export const nav = [
  { label: 'Startseite', href: '/' },
  { label: 'Der Regenwald', href: '/der-regenwald' },
  { label: 'Die Tierwelt', href: '/entdecke-die-tiere-des-regenwaldes' },
  { label: 'Maras Abenteuer', href: '/maras-abenteuer' },
  { label: 'Für Erwachsene', href: '/fuer-eltern-und-paedagog-innen' },
  { label: 'Über mich', href: '/uber-mich' },
  { label: 'Rechtliches', href: '/rechtliches' },
];
export const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
export const hrefFor = (slug: string) => slug === 'home' ? '/' : `/${slug}`;
export const blocksOf = (blocks: unknown) => Array.isArray(blocks) ? blocks as ContentBlock[] : [];
export const imageOf = (blocks: unknown) => blocksOf(blocks).find(block => block.type === 'image');
export const shortTitle = (slug: string, title: string) => title || animalNames[slug] || pageNames[slug] || slug;
export const stripDecorations = (text: string) => text.replace(/[\p{Extended_Pictographic}\uFE0F\u200D]/gu, '').trim();
