import sanitizeHtmlLib from 'sanitize-html';

export function sanitizeHtml(html: string, options?: sanitizeHtmlLib.IOptions): string {
  const defaults = {
    allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'sup', 'sub'],
    allowedAttributes: { a: ['href', 'title'] },
    allowedSchemes: ['https', 'http', 'mailto', 'tel'],
    allowProtocolRelative: false,
    disallowedTagsMode: 'discard' as const,
  };

  return sanitizeHtmlLib(html, { ...defaults, ...options });
}

export function validateImageUrl(url: string): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url, 'http://localhost');
    return parsed.pathname.match(/\.(webp|jpg|jpeg|png)$/i) !== null;
  } catch {
    return false;
  }
}
