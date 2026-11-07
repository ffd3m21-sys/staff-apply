'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

const yn = (b) => (b ? 'Yes · نعم' : 'No · لا');
const ERR = {
  no_bot: 'Bot token is missing in Vercel (DISCORD_BOT_TOKEN).',
  bot_role_too_low: 'The bot cannot give that role. In Discord, move the bot’s role ABOVE the role you want to give.',
  user_left: 'This person is no longer in the server.',
  discord: 'Discord refused. Check the bot has the Manage Roles permission.',
  db: 'Database error.',
};

export default function Admin() {
  const [me, setMe] = useState(undefined);
  const [denied, setDenied] = useState(false);
  const [apps, setApps] = useState([]);
  const [roles, setRoles] = useState([]);
  const [rolesErr, setRolesErr] = useState('');
  const [pick, setPick] = useState([]);
  const [tab, setTab] = useState('pending');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState('');

  const load = useCallback(async () => {
    const r = await fetch('/api/admin/applications');
    if (r.status === 403 || r.status === 401) { setDenied(true); return; }
    setApps((await r.json()).applications || []);
    const rr = await (await fetch('/api/admin/roles')).json().catch(() => ({}));
    setRoles(rr.roles || []);
    setRolesErr(rr.error || '');
  }, []);

  useEffect(() => {
    fetch('/api/me').then((r) => r.json()).then((m) => { setMe(m); if (m) load(); }).catch(() => setMe(null));
  }, [load]);

  async function decide(id, action) {
    setMsg(''); setBusy(id);
    const r = await fetch('/api/admin/decide', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ discord_id: id, action, roleIds: pick }) });
    const d = await r.json().catch(() => ({}));
    setBusy('');
    if (!r.ok) setMsg(ERR[d.error] || 'Something went wrong.');
    else { setMsg(action === 'accept' ? 'Accepted ✓' : 'Rejected ✓'); load(); }
  }

  const toggle = (id) => setPick((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  const list = apps.filter((a) => tab === 'all' || (a.status || 'pending') === tab);
  const count = (t) => apps.filter((a) => (a.status || 'pending') === t).length;

  return (
    <div className="wrap" style={{ maxWidth: 900 }}>
      <div className="bar">
        <Link href="/" className="home">← Home</Link>
        {me && <div className="user">{me.avatar && <img src={me.avatar} alt="" />}<span>{me.username}</span><a href="/api/auth/logout">Log out</a></div>}
      </div>
      <h1 className="title">Admin</h1>

      {me === undefined && <p className="sub">Loading…</p>}
      {me === null && <><p className="sub">Log in with Discord.</p><a className="btn red" href="/api/auth/login?next=/admin">Log in with Discord</a></>}
      {me && denied && <div className="msg-err" style={{ marginTop: 24 }}>You are not an admin. Your Discord ID is not in ADMIN_IDS.</div>}

      {me && !denied && (
        <>
          <div className="panel" style={{ margin: '24px 0' }}>
            <div style={{ fontWeight: 800 }}>Roles to give when you press Accept</div>
            {rolesErr && <div style={{ color: 'var(--mute)', marginTop: 8 }}>Roles list unavailable ({rolesErr === 'no_bot' ? 'add DISCORD_BOT_TOKEN in Vercel' : 'bot is not in the server or the token is wrong'}). You can still accept without roles.</div>}
            <div className="roles">
              {roles.map((r) => (
                <label className="opt" key={r.id}>
                  <input type="checkbox" checked={pick.includes(r.id)} onChange={() => toggle(r.id)} />
                  <span style={{ padding: '4px 14px', fontSize: '.9rem' }}>{r.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="opts" style={{ marginBottom: 12 }}>
            {['pending', 'accepted', 'rejected', 'all'].map((t) => (
              <label className="opt" key={t}>
                <input type="radio" name="tab" checked={tab === t} onChange={() => setTab(t)} />
                <span>{t}{t !== 'all' ? ` (${count(t)})` : ''}</span>
              </label>
            ))}
          </div>
          {msg && <div className="msg-err" role="status">{msg}</div>}

          {list.length === 0 && <p className="sub">Nothing here.</p>}
          {list.map((a) => (
            <div className="q" key={a.discord_id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1.2rem' }}>{a.discord_username} <span style={{ color: 'var(--mute)', fontWeight: 400, fontSize: '.85rem' }}>{a.discord_id}</span></div>
                  <div className="roles">{(a.discord_roles || []).map((r) => <span className="role" key={r}>{r}</span>)}</div>
                </div>
                <span className={`status ${a.status || 'pending'}`}>{a.status || 'pending'}</span>
              </div>
              <div className="ans">
                <div>Age · العمر: <b>{a.age}</b></div>
                <div>Been in a server · كان في سيرفر: <b>{yn(a.been_in_server)}</b></div>
                <div>Was staff · كان إدارياً: <b>{yn(a.was_staff)}</b>{a.staff_details && ` — ${a.staff_details}`}</div>
                <div>Sold products · باع منتجات: <b>{yn(a.sold_products)}</b>{a.sold_details && ` — ${a.sold_details}`}</div>
                <div>Can make apps · يبرمج: <b>{yn(a.can_make_apps)}</b>{a.apps_details && ` — ${a.apps_details}`}</div>
                {a.extra && <div>Extra: {a.extra}</div>}
                <div style={{ color: 'var(--mute)', fontSize: '.85rem' }}>{new Date(a.created_at).toLocaleString()}{a.reviewed_by && ` · reviewed by ${a.reviewed_by}`}</div>
              </div>
              {(a.status || 'pending') === 'pending' && (
                <div className="opts" style={{ marginTop: 14 }}>
                  <button className="btn red" disabled={busy === a.discord_id} onClick={() => decide(a.discord_id, 'accept')}>Accept</button>
                  <button className="btn" disabled={busy === a.discord_id} onClick={() => decide(a.discord_id, 'reject')}>Reject</button>
                </div>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  );
}
