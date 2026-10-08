import { notFound, redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getDb } from '@/db/client';
import { pages } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { AdminEditor, type EditablePage } from '@/components/admin-editor';
import { AdminShell } from '@/components/admin-shell';
import { blocksOf } from '@/lib/site';

export default async function EditorPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || !['admin', 'editor'].includes(user.role || '')) redirect('/admin');
  const { id } = await params;
  let initial: EditablePage = { slug: '', title: '', excerpt: '', blocks: [], seoTitle: '', seoDescription: '', published: false };
  if (id !== 'new') {
    if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
    const [page] = await getDb().select().from(pages).where(eq(pages.id, id));
    if (!page) notFound();
    initial = { id: page.id, slug: page.slug, title: page.title, excerpt: page.excerpt || '', blocks: blocksOf(page.blocks), seoTitle: page.seoTitle || '', seoDescription: page.seoDescription || '', published: page.published || false };
  }
  return <AdminShell name={user.name || 'Redaktion'}><AdminEditor initial={initial} /></AdminShell>;
}
