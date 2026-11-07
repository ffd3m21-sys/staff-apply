import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

const txt = (v) => (typeof v === 'string' ? v.trim().slice(0, 1500) : '');
const bool = (v) => v === true;

export async function POST(req) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: 'login' }, { status: 401 });
  if (!s.inServer) return NextResponse.json({ error: 'not_in_server' }, { status: 403 });

  const b = await req.json().catch(() => ({}));
  const age = parseInt(b.age, 10);
  if (!(age >= 10 && age <= 100)) return NextResponse.json({ error: 'age' }, { status: 400 });

  const row = {
    discord_id: s.id,
    discord_username: s.username,
    discord_roles: s.roles,
    age,
    been_in_server: bool(b.beenInServer),
    was_staff: bool(b.wasStaff),
    staff_details: txt(b.staffDetails),
    sold_products: bool(b.soldProducts),
    sold_details: txt(b.soldDetails),
    can_make_apps: bool(b.canMakeApps),
    apps_details: txt(b.appsDetails),
    extra: txt(b.extra),
  };

  const r = await fetch(`${process.env.SUPABASE_URL}/rest/v1/applications`, {
    method: 'POST',
    headers: {
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      ...(process.env.SUPABASE_SERVICE_ROLE_KEY.startsWith('eyJ') ? { Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}` } : {}),
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(row),
  });
  if (r.status === 409) return NextResponse.json({ error: 'duplicate' }, { status: 409 });
  if (!r.ok) return NextResponse.json({ error: 'db' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
