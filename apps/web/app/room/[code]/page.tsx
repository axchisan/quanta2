import { Lobby } from './lobby';

export default async function RoomPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return <Lobby code={code.toUpperCase()} />;
}
