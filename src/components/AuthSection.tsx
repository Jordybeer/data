'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSession } from '@/components/SessionProvider';
import { ADMIN_EMAIL } from '@/data/drugs';

export const AuthSection: React.FC = () => {
  const { session, refresh } = useSession();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const signOut = async () => {
    await fetch('/api/auth/signout', { method: 'POST' });
    await refresh();
  };

  const request = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('sending');
    setErrorMsg('');
    try {
      const r = await fetch('/api/auth/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (r.ok) {
        setStatus('sent');
      } else {
        const j = await r.json().catch(() => ({}));
        setErrorMsg(j?.error || 'Something went wrong.');
        setStatus('error');
      }
    } catch {
      setErrorMsg('Network error.');
      setStatus('error');
    }
  };

  if (session.isAdmin) {
    return (
      <div className="card p-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <span className="px-2 py-1 rounded bg-green-600 text-white text-sm font-semibold">👤 Admin</span>
            <p className="text-textc/80 text-sm">{session.email}</p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin" className="btn btn-primary">Admin panel</Link>
            <button className="btn bg-red-600 text-white hover:brightness-110" onClick={signOut}>Logout</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={request} className="card p-6 flex flex-col gap-3">
      <p className="text-sm text-textc/80">Enter the admin email to receive a magic sign-in link.</p>
      <input
        type="email"
        required
        autoComplete="email"
        className="input w-full p-3"
        placeholder={ADMIN_EMAIL}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button type="submit" className="btn btn-primary" disabled={status === 'sending' || status === 'sent'}>
        {status === 'sending' ? 'Sending…' : status === 'sent' ? 'Check your inbox' : 'Send magic link'}
      </button>
      {status === 'sent' && (
        <p className="text-sm text-green-600">
          If that email is authorized, a sign-in link is on its way. The link expires in 15 minutes.
        </p>
      )}
      {status === 'error' && <p className="text-sm text-red-600">{errorMsg || 'Could not send.'}</p>}
    </form>
  );
};
