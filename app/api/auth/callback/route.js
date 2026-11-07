import { NextResponse } from 'next/server';
import { setSession } from '@/lib/session';

const API = 'https://discord.com/api/v10';

export async function GET(req) {
  const site = process.env.SITE_URL;
  const fail = (e) => NextResponse.redirect(`${site}/apply?error=${e}`);
  const p = new URL(req.url).searchParams;
  const code = p.get('code');
  const state = p.get('state');
  if (!code || !state || state !== req.cookies.get('oauth_state')?.value) return fail('state');

  // 1) Trade the code for the user's token
  const tokRes = await fetch(`${API}/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID,
      client_secret: process.env.DISCORD_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code,
      redirect_uri: `${site}/api/auth/callback`,
    }),
  });
  if (!tokRes.ok) return fail('token');
  const { access_token } = await tokRes.json();
  const auth = { Authorization: `Bearer ${access_token}` };

  // 2) Who is this?
  const meRes = await fetch(`${API}/users/@me`, { headers: auth });
  if (!meRes.ok) return fail('user');
  const me = await meRes.json();

  // 3) Are they in YOUR server? What roles do they have?
  let inServer = false;
  let roles = [];
  const memRes = await fetch(`${API}/users/@me/guilds/${process.env.DISCORD_GUILD_ID}/member`, { headers: auth });
  if (memRes.ok) {
    inServer = true;
    const member = await memRes.json();
    roles = member.roles || [];
    // Turn role IDs into role names (needs the bot token)
    if (process.env.DISCORD_BOT_TOKEN && roles.length) {
      const rr = await fetch(`${API}/guilds/${process.env.DISCORD_GUILD_ID}/roles`, {
        headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` },
      });
      if (rr.ok) {
        const all = await rr.json();
        const map = Object.fromEntries(all.map((r) => [r.id, r.name]));
        roles = roles.map((id) => map[id] || id);
      }
    }
  }

  await setSession({
    id: me.id,
    username: me.global_name || me.username,
    avatar: me.avatar ? `https://cdn.discordapp.com/avatars/${me.id}/${me.avatar}.png?size=128` : null,
    inServer,
    roles,
  });
  const res = NextResponse.redirect(`${site}/apply`);
  res.cookies.delete('oauth_state');
  return res;
}
