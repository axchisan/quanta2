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
    </main>
  );
}
