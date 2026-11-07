import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const key = () => new TextEncoder().encode(process.env.SESSION_SECRET || '');
const secure = process.env.NODE_ENV === 'production';

export async function setSession(data) {
  const token = await new SignJWT(data)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('2h')
    .sign(key());
  cookies().set('sess', token, { httpOnly: true, secure, sameSite: 'lax', path: '/', maxAge: 7200 });
}

export async function getSession() {
  const t = cookies().get('sess')?.value;
  if (!t) return null;
  try { return (await jwtVerify(t, key())).payload; } catch { return null; }
}
