import { NextResponse } from 'next/server';
export async function GET() {
  const res = NextResponse.redirect(`${process.env.SITE_URL}/apply`);
  res.cookies.delete('sess');
  return res;
}
