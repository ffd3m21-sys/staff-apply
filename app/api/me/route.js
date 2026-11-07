import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
export const dynamic = 'force-dynamic';
export async function GET() {
  const s = await getSession();
  return NextResponse.json(s ? { id: s.id, username: s.username, avatar: s.avatar, inServer: s.inServer, roles: s.roles } : null);
}
