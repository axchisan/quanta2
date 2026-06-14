import { Button } from '@quanta/ui';

import { siteConfig } from '@/app/lib/site';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="text-6xl font-bold tracking-tight">{siteConfig.name}</h1>
      <p className="text-muted-foreground max-w-md text-balance text-lg">{siteConfig.tagline}</p>
      <Button size="lg">{siteConfig.cta}</Button>
    </main>
  );
}
