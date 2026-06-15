import Link from 'next/link';
import { EntryCard } from '@/app/components/entry-card';
import { siteConfig } from '@/app/lib/site';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-4 py-16">
      <div className="text-center">
        <h1 className="text-6xl font-bold tracking-tight">{siteConfig.name}</h1>
        <p className="text-muted-foreground mt-3 max-w-md text-balance text-lg">
          {siteConfig.tagline}
        </p>
      </div>
      <EntryCard />
      <div className="text-muted-foreground flex flex-col items-center gap-2 text-sm">
        <span>o practicá solo:</span>
        <div className="flex gap-4">
          <Link
            href="/jugar/caida-libre"
            className="hover:text-foreground underline underline-offset-4"
          >
            Caída Libre 🪂
          </Link>
          <Link href="/jugar/trivia" className="hover:text-foreground underline underline-offset-4">
            Trivia IA 🧠
          </Link>
        </div>
      </div>
    </main>
  );
}
