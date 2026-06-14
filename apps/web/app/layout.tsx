import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { siteConfig } from '@/app/lib/site';

import './globals.css';

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  );
}
