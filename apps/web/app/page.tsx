import Link from 'next/link';
import { Badge, Button, Card } from '@quanta/ui';
import { AtomMascot } from '@/components/atom-mascot';
import { EntryCard } from '@/app/components/entry-card';
import { siteConfig } from '@/app/lib/site';

export default function HomePage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col items-center gap-8 px-4 py-8 text-center">
      <AtomMascot className="text-primary h-24 w-24 drop-shadow-sm" />

      <div>
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl">{siteConfig.name}</h1>
        <p className="text-muted-foreground mx-auto mt-3 max-w-md text-balance text-lg">
          {siteConfig.tagline}
        </p>
      </div>

      <Button asChild size="lg" className="text-xl">
        <Link href="/jugar">▶ Empezá a jugar</Link>
      </Button>

      <Card className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2">
          <span className="font-display text-lg font-bold">Jugar con amigos</span>
          <Badge variant="secondary">beta</Badge>
        </div>
        <p className="text-muted-foreground mt-1 text-sm">Creá una sala y compartí el código.</p>
        <div className="mt-4">
          <EntryCard />
        </div>
      </Card>
    </main>
  );
}
