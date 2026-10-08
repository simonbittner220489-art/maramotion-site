export interface ContentBlock {
  type: 'heading' | 'paragraph' | 'image' | 'list-item' | 'list' | 'quiz' | 'download' | 'link' | 'embed';
  content?: string;
  html?: string;
  level?: number;
  items?: string[];
  src?: string;
  alt?: string;
  href?: string;
  width?: number;
  height?: number;
}

export interface ImportedPage {
  slug: string;
  title: string;
  excerpt?: string;
  content: string;
  blocks: ContentBlock[];
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  published: boolean;
  order: number;
}
