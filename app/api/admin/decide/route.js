import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import { sb } from '@/lib/db';

export async function POST(req) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const b = await req.json().catch(() => ({}));
  const id = String(b.discord_id || '');
  if (!/^\d+$/.test(id)) return NextResponse.json({ error: 'bad_id' }, { status: 400 });
  if (b.action !== 'accept' && b.action !== 'reject') return NextResponse.json({ error: 'bad_action' }, { status: 400 });

  if (b.action === 'accept') {
    const roleIds = (Array.isArray(b.roleIds) ? b.roleIds : []).map(String).filter((x) => /^\d+$/.test(x));
    if (roleIds.length && !process.env.DISCORD_BOT_TOKEN) return NextResponse.json({ error: 'no_bot' }, { status: 400 });
    for (const rid of roleIds) {
      const r = await fetch(`https://discord.com/api/v10/guilds/${process.env.DISCORD_GUILD_ID}/members/${id}/roles/${rid}`, {
        method: 'PUT',
        headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`, 'X-Audit-Log-Reason': 'Application accepted' },
      });
      if (!r.ok) {
        const error = r.status === 403 ? 'bot_role_too_low' : r.status === 404 ? 'user_left' : 'discord';
        return NextResponse.json({ error }, { status: 400 });
      }
    }
  }

  const r = await sb(`applications?discord_id=eq.${id}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({ status: b.action === 'accept' ? 'accepted' : 'rejected', reviewed_by: admin.username }),
  });
  if (!r.ok) return NextResponse.json({ error: 'db' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
