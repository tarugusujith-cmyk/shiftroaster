// Sign-in screen.
import { useState } from 'react';
import { api } from '../api';
import { useAuth } from '../auth';
import { HeroArt } from '../art';
export default function Login() {
  const { login } = useAuth();
  const [email, setE] = useState('');
  const [pw, setP] = useState('');
  const [err, setErr] = useState('');
  const [busy, setB] = useState(false);
  const go = async () => {
    if (!email || !pw) return setErr('Email and password are required');
    setB(true);
    try {
      const r = await api.get('/users', { params: { email, password: pw } });
      r.data[0] ? login(r.data[0]) : setErr('Invalid credentials');
    } catch {
      setErr('Server unreachable');
    }
    setB(false);
  };
  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="hidden md:flex flex-col justify-center p-12 text-white bg-gradient-to-br from-indigo-700 via-violet-600 to-fuchsia-500">
        <HeroArt className="w-full max-w-md mx-auto drop-shadow-2xl" />
        <h2 className="text-3xl font-bold mt-6">Every shift. Perfectly in rhythm.</h2>
        <p className="opacity-80 mt-2">
          Plan rotations, balance teams and keep everyone in the loop.
        </p>
      </div>
      <div className="flex items-center justify-center p-6">
        <div className="card w-full max-w-sm space-y-3">
          <div className="text-3xl">🗓️</div>
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-sm text-slate-500">Sign in to your roster</p>
          <input
            className="inp"
            placeholder="Email"
            value={email}
            onChange={(e) => setE(e.target.value)}
          />
          <input
            className="inp"
            type="password"
            placeholder="Password"
            value={pw}
            onChange={(e) => setP(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && go()}
          />
          {err && <p className="text-red-600 text-sm">{err}</p>}
          <button className="btn w-full" disabled={busy} onClick={go}>
            {busy ? 'Signing in…' : 'Login'}
          </button>
          <div className="flex gap-2 text-xs">
            {[
              ['Admin', 'admin@co.com', 'admin123'],
              ['Manager', 'manager@co.com', 'manager123'],
              ['Employee', 'emp@co.com', 'emp123'],
            ].map((d) => (
              <button
                key={d[0]}
                className="btn2 flex-1"
                onClick={() => {
                  setE(d[1]);
                  setP(d[2]);
                }}
              >
                {d[0]}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
