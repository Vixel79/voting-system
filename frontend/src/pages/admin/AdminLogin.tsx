import React, { useState } from 'react';
import { KeyRoundIcon, LockIcon, UserIcon } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Field';
import { LogoMark } from '../../components/brand/Logo';
import { Led } from '../../components/ui/Status';

export function AdminLogin({ onAuth }: {onAuth: () => void;}) {
  const [username, setUsername] = useState('control');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || password.length < 4) {
      setError('Enter your operator credentials to continue.');
      return;
    }
    setError('');
    setLoading(true);
    window.setTimeout(onAuth, 700);
  };

  return (
    <div className="tech-grid-dark tech-noise relative grid min-h-full w-full place-items-center px-5 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/60 to-transparent" />
      
      <div className="w-full max-w-[420px]">
        <div className="mb-8 flex flex-col items-center text-center">
          <LogoMark size={64} />
          <h1 className="mt-5 text-2xl font-extrabold tracking-tight">
            Event Control Room
          </h1>
          <p className="mt-1.5 text-xs font-bold uppercase tracking-tech text-fg-dim">
            Authorized operators only
          </p>
        </div>

        <form
          onSubmit={submit}
          className="relative overflow-hidden rounded-lg border border-line bg-ink-900 shadow-panel">
          
          <div className="hatch h-1.5 w-full" aria-hidden />

          <div className="flex items-center justify-between border-b border-line bg-ink-850 px-6 py-3">
            <span className="text-[10px] font-extrabold uppercase tracking-tech text-fg-muted">
              Terminal 01 · Sign in
            </span>
            <span className="flex items-center gap-2">
              <Led tone="live" blink />
              <span className="text-[10px] font-extrabold uppercase tracking-tech text-brand">
                Secure
              </span>
            </span>
          </div>

          <div className="space-y-4 px-6 py-6">
            <Input
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              icon={<UserIcon className="h-4 w-4" strokeWidth={2} />}
              autoComplete="username" />
            
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<LockIcon className="h-4 w-4" strokeWidth={2} />}
              placeholder="••••••••"
              autoComplete="current-password"
              error={error}
              hint="Demo: any password with 4+ characters" />
            
            <Button
              type="submit"
              size="lg"
              block
              loading={loading}
              icon={<KeyRoundIcon className="h-4 w-4" strokeWidth={2.5} />}>
              
              {loading ? 'Authenticating…' : 'Sign In'}
            </Button>
          </div>

          <div className="flex items-center justify-between border-t border-line bg-ink-950 px-6 py-3">
            <span className="num text-[10px] font-extrabold tracking-tech text-ink-600">
              BUILD 4.2.1
            </span>
            <span className="text-[10px] font-extrabold uppercase tracking-tech text-ink-600">
              Session logged
            </span>
          </div>
        </form>
      </div>
    </div>);

}