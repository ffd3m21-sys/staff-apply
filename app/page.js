import Link from 'next/link';

export default function Home() {
  return (
    <main className="hero">
      <div className="hero-top">Staff Team</div>
      <div className="hero-main">
        <h1>Apply</h1>
        <h2>قدّم الآن</h2>
        <p>Log in with Discord, answer a few questions, and our team will review your application. · سجّل الدخول بحساب ديسكورد وأجب عن بعض الأسئلة وسنراجع طلبك.</p>
        <Link href="/apply" className="btn">Apply · قدّم الآن</Link>
      </div>
      <div className="hero-foot">You must be a member of our Discord server. · يجب أن تكون عضواً في سيرفرنا.</div>
    </main>
  );
}
