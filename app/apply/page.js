'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

const ERR = {
  state: ['فشل تسجيل الدخول، حاول مرة أخرى.', 'Login failed, please try again.'],
  token: ['فشل تسجيل الدخول، حاول مرة أخرى.', 'Login failed, please try again.'],
  user: ['تعذّر جلب حسابك.', 'Could not read your Discord account.'],
};

function YesNo({ name, value, onChange }) {
  return (
    <div className="opts" role="radiogroup">
      {[[true, 'نعم', 'Yes'], [false, 'لا', 'No']].map(([v, ar, en]) => (
        <label className="opt" key={String(v)}>
          <input type="radio" name={name} checked={value === v} onChange={() => onChange(v)} />
          <span>{ar} · {en}</span>
        </label>
      ))}
    </div>
  );
}

function Q({ ar, en, children }) {
  return (
    <div className="q">
      <div className="q-ar">{ar}</div>
      <div className="q-en">{en}</div>
      {children}
    </div>
  );
}

export default function Apply() {
  const [me, setMe] = useState(undefined);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [f, setF] = useState({ age: '', beenInServer: null, wasStaff: null, staffDetails: '', soldProducts: null, soldDetails: '', canMakeApps: null, appsDetails: '', extra: '' });
  const set = (k) => (v) => setF((p) => ({ ...p, [k]: v }));
  const txt = (k) => (e) => set(k)(e.target.value);

  useEffect(() => {
    const e = new URLSearchParams(location.search).get('error');
    if (e) setErr(e);
    fetch('/api/me').then((r) => r.json()).then(setMe).catch(() => setMe(null));
  }, []);

  async function submit(e) {
    e.preventDefault();
    if ([f.beenInServer, f.wasStaff, f.soldProducts, f.canMakeApps].includes(null)) {
      setErr('missing'); return;
    }
    setBusy(true); setErr('');
    const r = await fetch('/api/apply', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(f) });
    setBusy(false);
    if (r.ok) setDone(true);
    else setErr((await r.json().catch(() => ({}))).error || 'db');
  }

  const errBox = err && (() => {
    const m = {
      ...ERR,
      missing: ['من فضلك أجب عن جميع الأسئلة.', 'Please answer every question.'],
      age: ['العمر غير صحيح.', 'Please enter a valid age.'],
      duplicate: ['لقد قدّمت طلباً من قبل.', 'You have already applied.'],
      db: ['حدث خطأ، حاول لاحقاً.', 'Something went wrong, try again later.'],
      login: ['انتهت الجلسة، سجّل الدخول مجدداً.', 'Session expired, log in again.'],
    }[err] || ERR.token;
    return <div className="msg-err" role="alert"><div dir="rtl">{m[0]}</div><div>{m[1]}</div></div>;
  })();

  return (
    <div className="wrap">
      <div className="bar">
        <Link href="/" className="home">← Home</Link>
        {me && (
          <div className="user">
            {me.avatar && <img src={me.avatar} alt="" />}
            <span>{me.username}</span>
            <a href="/api/auth/logout">Log out</a>
          </div>
        )}
      </div>

      <h1 className="title">Staff application</h1>
      <div className="title-ar">طلب الانضمام للإدارة</div>

      {me === undefined && <p className="sub">Loading…</p>}

      {me === null && (
        <>
          <p className="sub">Log in with Discord so we can confirm you are in our server. · سجّل الدخول بحساب ديسكورد للتأكد من وجودك في السيرفر.</p>
          {errBox}
          <a className="btn red" href="/api/auth/login">Log in with Discord · تسجيل الدخول</a>
        </>
      )}

      {me && !me.inServer && (
        <div className="panel" style={{ marginTop: 32 }}>
          <div dir="rtl" style={{ fontWeight: 800 }}>لم نجدك في السيرفر. انضم أولاً ثم سجّل الدخول مجدداً.</div>
          <div>We couldn’t find you in our server. Join first, then log in again.</div>
          {process.env.NEXT_PUBLIC_DISCORD_INVITE && <a className="btn red" style={{ marginTop: 20 }} href={process.env.NEXT_PUBLIC_DISCORD_INVITE}>Join the server · انضم</a>}
        </div>
      )}

      {me && me.inServer && done && (
        <div className="ok">
          <div className="big">✓</div>
          <h2 dir="rtl">تم إرسال طلبك</h2>
          <h2>Application sent</h2>
        </div>
      )}

      {me && me.inServer && !done && (
        <form onSubmit={submit}>
          <div className="panel" style={{ margin: '32px 0 8px' }}>
            <div style={{ fontWeight: 800 }}>Verified in the server · تم التحقق من وجودك في السيرفر</div>
            {me.roles.length > 0 && <div className="roles">{me.roles.map((r) => <span className="role" key={r}>{r}</span>)}</div>}
          </div>
          {errBox}

          <Q ar="كم عمرك؟" en="How old are you?">
            <input className="field" type="number" min="10" max="100" required value={f.age} onChange={txt('age')} />
          </Q>
          <Q ar="هل سبق أن كنت عضواً في سيرفر ديسكورد؟" en="Have you ever been in a Discord server?">
            <YesNo name="a" value={f.beenInServer} onChange={set('beenInServer')} />
          </Q>
          <Q ar="هل سبق أن كنت إدارياً في سيرفر؟" en="Have you ever been staff in a server?">
            <YesNo name="b" value={f.wasStaff} onChange={set('wasStaff')} />
            {f.wasStaff && <textarea className="field" placeholder="أي سيرفر وكم المدة؟ · Which server and for how long?" value={f.staffDetails} onChange={txt('staffDetails')} />}
          </Q>
          <Q ar="هل سبق أن بعت منتجات؟" en="Have you ever sold products?">
            <YesNo name="c" value={f.soldProducts} onChange={set('soldProducts')} />
            {f.soldProducts && <textarea className="field" placeholder="ماذا بعت؟ · What did you sell?" value={f.soldDetails} onChange={txt('soldDetails')} />}
          </Q>
          <Q ar="هل تستطيع صنع تطبيقات باستخدام لغات برمجة؟" en="Can you make apps using programming languages or software?">
            <YesNo name="d" value={f.canMakeApps} onChange={set('canMakeApps')} />
            {f.canMakeApps && <textarea className="field" placeholder="ما هي اللغات أو البرامج؟ · Which languages or software?" value={f.appsDetails} onChange={txt('appsDetails')} />}
          </Q>
          <Q ar="هل تريد إضافة شيء آخر؟ (اختياري)" en="Anything else you want to add? (optional)">
            <textarea className="field" style={{ marginTop: 0 }} value={f.extra} onChange={txt('extra')} />
          </Q>

          <button className="btn red submit" disabled={busy}>{busy ? 'Sending…' : 'Send application · إرسال الطلب'}</button>
        </form>
      )}
    </div>
  );
}
