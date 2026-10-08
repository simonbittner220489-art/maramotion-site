import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { siteUrl } from '@/lib/site';
import './globals.css';

const nunito = localFont({ src: [
  { path: '../public/fonts/Nunito-latin_latin-ext-regular.woff2', weight: '400' },
  { path: '../public/fonts/Nunito-latin_latin-ext-800.woff2', weight: '800' },
], display: 'swap', variable: '--font-nunito' });
const roboto = localFont({ src: '../public/fonts/Roboto-latin_latin-ext-regular.woff2', display: 'swap', variable: '--font-roboto' });
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: 'Maras Regenwaldwelt',
  description: 'Kinderbücher und Wissen über Tiere des Regenwaldes',
  icons: { icon: '/icon.png' },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="de" className={`${nunito.variable} ${roboto.variable}`}><body id="top">{children}</body></html>;
}
