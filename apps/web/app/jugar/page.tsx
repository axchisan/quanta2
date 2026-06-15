import Link from 'next/link';
import { Badge, Card, type BadgeProps } from '@quanta/ui';

const RETOS: Array<{
  href: string;
  emoji: string;
  title: string;
  subject: string;
  desc: string;
  variant: NonNullable<BadgeProps['variant']>;
}> = [
  {
    href: '/jugar/caida-libre',
    emoji: '🪂',
    title: 'Caída Libre',
    subject: 'Física',
    desc: 'Ajustá altura y gravedad, predecí el tiempo de caída y comprobá.',
    variant: 'accent',
  },
  {
    href: '/jugar/balanceo-metano',
    emoji: '⚗️',
    title: 'Balanceo de Ecuaciones',
    subject: 'Química',
    desc: 'Igualá los átomos de cada elemento a ambos lados.',
    variant: 'secondary',
  },
  {
    href: '/jugar/trivia',
    emoji: '🧠',
    title: 'Trivia IA',
    subject: 'Física + Química',
    desc: 'Preguntas de opción múltiple generadas por IA, con feedback.',
    variant: 'default',
  },
];

export default function JugarPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/" className="text-muted-foreground hover:text-primary text-sm font-semibold">
        ← Inicio
      </Link>
      <h1 className="mt-2 text-center text-4xl font-extrabold tracking-tight">Elegí un reto</h1>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {RETOS.map((r) => (
          <Link key={r.href} href={r.href} className="group">
            <Card className="hover:shadow-soft h-full transition-transform duration-150 group-hover:-translate-y-1">
              <div className="text-5xl">{r.emoji}</div>
              <h2 className="mt-3 text-xl font-bold">{r.title}</h2>
              <Badge variant={r.variant} className="mt-2">
                {r.subject}
              </Badge>
              <p className="text-muted-foreground mt-3 text-sm">{r.desc}</p>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
}
