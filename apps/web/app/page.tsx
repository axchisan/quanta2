import Link from 'next/link';
import { Badge, Button, Card } from '@quanta/ui';
import { Quark } from '@/components/quark';
import { siteConfig } from '@/app/lib/site';

export default function HomePage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col items-center gap-8 px-4 py-8 text-center">
      <Quark state="idle" className="text-primary h-24 w-24 drop-shadow-sm" />

      <div>
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl">{siteConfig.name}</h1>
        <p className="text-muted-foreground mx-auto mt-3 max-w-md text-balance text-lg">
          {siteConfig.tagline}
        </p>
      </div>

      <Button asChild variant="solid3d" size="lg" className="text-xl">
        <Link href="/jugar">▶ Empezá a jugar</Link>
      </Button>

      <Card className="w-full max-w-md text-center">
        <div className="flex items-center justify-center gap-2">
          <span className="font-display text-lg font-bold">Jugar con amigos</span>
          <Badge variant="secondary">en vivo</Badge>
        </div>
        <p className="text-muted-foreground mt-1 text-sm">
          Creá una sala Kahoot, compartí el código y compitan respondiendo trivia en tiempo real.
        </p>
        <Button asChild variant="accent" size="lg" className="mt-4">
          <Link href="/sala">Crear o unirse a una sala</Link>
        </Button>
      </Card>
    </main>
  );
}
