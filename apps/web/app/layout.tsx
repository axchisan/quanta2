import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { Baloo_2, Nunito } from 'next/font/google';

import { AtomMascot } from '@/components/atom-mascot';
import { AuthNav } from '@/components/auth-nav';
import { siteConfig } from '@/app/lib/site';

import './globals.css';

const baloo = Baloo_2({
  subsets: ['latin'],
  variable: '--font-baloo',
  weight: ['600', '700', '800'],
});
const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
  weight: ['400', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className={`${baloo.variable} ${nunito.variable}`}>
      <body className="min-h-screen">
        <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/" className="text-primary flex items-center gap-2">
            <AtomMascot className="h-9 w-9" />
            <span className="font-display text-2xl font-extrabold tracking-tight">Quanta</span>
          </Link>
          <AuthNav />
        </header>
        {children}
      </body>
    </html>
  );
}
