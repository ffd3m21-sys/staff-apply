import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import { sb } from '@/lib/db';
export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const r = await sb('applications?select=*&order=created_at.desc&limit=200');
  if (!r.ok) return NextResponse.json({ error: 'db' }, { status: 500 });
  return NextResponse.json({ applications: await r.json() });
}
