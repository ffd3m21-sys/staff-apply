import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET(req) {
  const state = crypto.randomBytes(16).toString('hex');
  const url = new URL('https://discord.com/oauth2/authorize');
  url.searchParams.set('client_id', process.env.DISCORD_CLIENT_ID);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('redirect_uri', `${process.env.SITE_URL}/api/auth/callback`);
  url.searchParams.set('scope', 'identify guilds.members.read');
  url.searchParams.set('state', state);
  const res = NextResponse.redirect(url);
  res.cookies.set('oauth_state', state, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 600 });
  if (new URL(req.url).searchParams.get('next') === '/admin') res.cookies.set('oauth_next', '/admin', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 600 });
  return res;
}
