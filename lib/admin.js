import { getSession } from './session';

// Only Discord user IDs listed in ADMIN_IDS (comma separated) can use /admin
export async function requireAdmin() {
  const s = await getSession();
  if (!s) return null;
  const ids = (process.env.ADMIN_IDS || '').split(',').map((x) => x.trim()).filter(Boolean);
  return ids.includes(String(s.id)) ? s : null;
}
