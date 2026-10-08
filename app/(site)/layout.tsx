import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { MotionSystem } from '@/components/motion';
import { getDb } from '@/db/client';
import { siteSettings } from '@/db/schema';
import { nav } from '@/lib/site';

export const dynamic = 'force-dynamic';
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getDb().select().from(siteSettings);
  const links = settings.find(row => row.key === 'navigation')?.value as typeof nav | undefined;
  const footer = settings.find(row => row.key === 'footer')?.value as { text?: string } | undefined;
  return <><a className="skip-link" href="#main">Zum Inhalt springen</a><Navigation links={links} /><div className="page-transition">{children}</div><Footer text={footer?.text} /><MotionSystem /></>;
}
