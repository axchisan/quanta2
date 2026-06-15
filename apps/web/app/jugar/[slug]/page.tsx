import { notFound } from 'next/navigation';
import { getPublicChallenge } from '@/lib/challenges/service';
import { getServiceClient } from '@/lib/supabase/server';
import { EquationBalancePlay } from './equation-balance-play';
import { FreeFallPlay } from './free-fall-play';

export default async function PlayPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const challenge = await getPublicChallenge(getServiceClient(), slug.toLowerCase()).catch(
    () => null,
  );
  if (!challenge) notFound();

  const payloadType = (challenge.payload as { type?: string }).type;
  if (payloadType === 'free_fall') return <FreeFallPlay challenge={challenge} />;
  if (payloadType === 'equation_balance') return <EquationBalancePlay challenge={challenge} />;
  notFound();
}
