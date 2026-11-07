import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

// TEMPORARY test page. Delete this folder when everything works.
export async function GET() {
  const url = process.env.SUPABASE_URL || '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const out = {
    SUPABASE_URL_found: !!url,
    SUPABASE_URL_looks_ok: /^https:\/\/[a-z0-9]+\.supabase\.co$/.test(url),
    KEY_found: !!key,
    KEY_starts: key.slice(0, 10),
    KEY_length: key.length,
    SESSION_SECRET_found: !!process.env.SESSION_SECRET,
    ADMIN_IDS_found: !!process.env.ADMIN_IDS,
    BOT_TOKEN_found: !!process.env.DISCORD_BOT_TOKEN,
  };
  try {
    const r = await fetch(`${url}/rest/v1/applications?select=discord_id,status,reviewed_by&limit=1`, {
      headers: { apikey: key, ...(key.startsWith('eyJ') ? { Authorization: `Bearer ${key}` } : {}) },
      cache: 'no-store',
    });
    out.database_status = r.status;
    out.database_answer = (await r.text()).slice(0, 300);
  } catch (e) {
    out.database_status = 'cannot reach database';
    out.database_answer = String(e.message || e);
  }
  return NextResponse.json(out);
}
