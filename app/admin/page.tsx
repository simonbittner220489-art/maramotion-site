import { getCurrentUser } from '@/lib/auth';
import { getAllPages } from '@/lib/queries';
import { AdminLogin } from '@/components/admin-login';
import { AdminShell } from '@/components/admin-shell';
import { AdminDashboard } from '@/components/admin-dashboard';

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user || !['admin', 'editor'].includes(user.role || '')) return <AdminLogin />;
  const pages = await getAllPages();
  return <AdminShell name={user.name || 'Redaktion'}><AdminDashboard admin={user.role === 'admin'} initial={pages.map(({ id, slug, title, published }) => ({ id, slug, title, published }))} /></AdminShell>;
}
