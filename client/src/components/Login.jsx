import React, { useState } from 'react';
import { Compass, ArrowRight, ShieldCheck, Mail, LockKeyhole, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { signIn, availableRoles } = useAuth();
  const [email, setEmail] = useState('commander@nexuspole.gov.in');
  const [password, setPassword] = useState('demo123');
  const [error, setError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');
    try {
      signIn(email.trim(), password);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <main className="login-shell min-h-screen text-slate-100 flex items-center justify-center px-4 py-8 relative overflow-hidden">
      <div className="absolute inset-0 opacity-60 [background-image:linear-gradient(rgba(176,196,181,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(176,196,181,0.045)_1px,transparent_1px)] [background-size:36px_36px]" />
      <section className="relative w-full max-w-5xl grid lg:grid-cols-[1.1fr_420px] gap-10 items-center">
        <div className="hidden lg:block px-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-white via-cyan-200 to-sky-500 flex items-center justify-center shadow-[0_18px_40px_rgba(73,194,220,0.3)] ring-1 ring-white/20">
              <Compass className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold tracking-tight text-white">NexusPole</p>
              <p className="text-xs text-cyan-300 font-mono tracking-[0.22em] uppercase">Mission control core</p>
            </div>
          </div>
          <p className="text-sm text-cyan-300 font-mono uppercase tracking-[0.24em] mb-4">Polar operations network / demo access</p>
          <h1 className="text-5xl font-semibold leading-[1.05] tracking-tight max-w-xl text-white">Coordinate the edge of the map.</h1>
          <p className="mt-6 text-slate-300 max-w-lg leading-relaxed">One command layer for stations, expeditions, people, assets, and the decisions that keep them moving.</p>
          <div className="mt-10 flex items-center gap-3 text-xs text-slate-300 border border-emerald-500/20 bg-emerald-500/5 rounded-2xl px-4 py-3 w-fit">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            Demo profiles for operational workflows
          </div>
        </div>

        <div className="login-card frost-panel rounded-3xl p-6 sm:p-8 border-cyan-200/20 shadow-[0_25px_60px_rgba(3,15,28,0.6)] backdrop-blur-xl">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <Compass className="w-8 h-8 text-cyan-400" />
            <span className="text-2xl font-bold">NexusPole</span>
          </div>
          <div className="mb-7">
            <p className="text-xs font-mono text-cyan-300 uppercase tracking-[0.2em]">Demo access</p>
            <h2 className="text-2xl font-semibold mt-2 text-white">Welcome back</h2>
            <p className="text-sm text-slate-400 mt-2">Enter with one of the sample mission accounts below.</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="text-xs text-slate-400">Mission email</span>
              <span className="mt-1.5 relative block">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <input value={email} onChange={event => setEmail(event.target.value)} type="email" required className="w-full rounded-xl bg-[#071827] border border-[#31536a] px-10 py-2.5 text-sm text-white outline-none focus:border-cyan-200 transition-shadow shadow-inner placeholder:text-slate-500" />
              </span>
            </label>
            <label className="block">
              <span className="text-xs text-slate-400">Password</span>
              <span className="mt-1.5 relative block">
                <LockKeyhole className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <input value={password} onChange={event => setPassword(event.target.value)} type="password" required className="w-full rounded-xl bg-[#071827] border border-[#31536a] px-10 py-2.5 text-sm text-white outline-none focus:border-cyan-200 transition-shadow shadow-inner placeholder:text-slate-500" />
              </span>
            </label>
            {error && <div role="alert" className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-xs text-red-300"><AlertCircle className="w-4 h-4" />{error}</div>}
            <button className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-white to-cyan-200 hover:from-cyan-50 hover:to-cyan-100 text-[#092033] font-semibold text-sm py-2.5 transition-all duration-200 shadow-[0_15px_25px_rgba(73,194,220,0.22)] hover:-translate-y-0.5">
              Enter command workspace
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
          <div className="mt-6 pt-5 border-t border-slate-800">
            <p className="text-[11px] text-slate-400 mb-2">Demo accounts · password <span className="text-cyan-300">demo123</span> for all</p>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {availableRoles.map(user => (
              <button
                type="button"
                key={user.id}
                onClick={() => { setEmail(user.email); setPassword('demo123'); setError(''); }}
                className="w-full flex items-center justify-between gap-3 rounded-lg border border-white/5 px-3 py-2 text-left transition hover:border-cyan-300/40 hover:bg-cyan-950/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
              >
                <span className="min-w-0">
                  <span className="block truncate text-xs font-medium text-white">{user.role}</span>
                  <span className="mt-0.5 block truncate text-[11px] text-slate-400">{user.email}</span>
                </span>
                <span className="shrink-0 text-[10px] text-cyan-300">Fill</span>
              </button>
            ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}