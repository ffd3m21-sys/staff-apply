import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  if (!process.env.DISCORD_BOT_TOKEN) return NextResponse.json({ roles: [], error: 'no_bot' });
  const r = await fetch(`https://discord.com/api/v10/guilds/${process.env.DISCORD_GUILD_ID}/roles`, {
    headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` },
    cache: 'no-store',
  });
  if (!r.ok) return NextResponse.json({ roles: [], error: 'bot_failed' });
  const all = await r.json();
  const roles = all
    .filter((x) => x.name !== '@everyone' && !x.managed)
    .sort((a, b) => b.position - a.position)
    .map((x) => ({ id: x.id, name: x.name }));
  return NextResponse.json({ roles });
}
