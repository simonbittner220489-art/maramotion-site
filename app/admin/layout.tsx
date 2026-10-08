import type { Metadata } from 'next';
import './admin.css';
export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Mara Redaktion', robots: { index: false, follow: false } };
export default function AdminLayout({ children }: { children: React.ReactNode }) { return children; }
