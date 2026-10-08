import type { NextConfig } from 'next';

const config: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ['@electric-sql/pglite', 'postgres'],
  images: { formats: ['image/webp', 'image/avif'], ...(process.env.S3_PUBLIC_URL ? { remotePatterns: [new URL(`${process.env.S3_PUBLIC_URL.replace(/\/$/, '')}/**`)] } : {}) },
  poweredByHeader: false,
  async redirects() {
    return [
      { source: '/index.html', destination: '/', permanent: true },
      { source: '/:slug/index.html', destination: '/:slug', permanent: true },
      { source: '/home', destination: '/', permanent: true },
    ];
  },
  async headers() {
    return [{ source: '/:path*', headers: [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self'; media-src 'self' https://pub-0d0a6aa441e24549b4c166c4f7cafd31.r2.dev; connect-src 'self'; frame-src https://www.youtube-nocookie.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'" },
    ] }];
  },
};
export default config;
