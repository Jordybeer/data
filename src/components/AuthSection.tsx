'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSession } from '@/components/SessionProvider';

export const AuthSection: React.FC = () => {
  const { session } = useSession();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const signOut = async () => {
    await fetch('/api/auth/signout', { method: 'POST' });
    window.location.href = '/';
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
        setErrorMsg(j?.error || 'Er ging iets mis.');
        setStatus('error');
      }
    } catch {
      setErrorMsg('Netwerkfout.');
      setStatus('error');
    }
  };

  if (session.isAdmin) {
    return (
      <div className="card p-5 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <span className="px-2 py-1 rounded-full bg-green-600/20 border border-green-500/30 text-green-400 text-xs font-bold uppercase tracking-wider">
            Admin
          </span>
          <p className="text-textc/70 text-sm">{session.email}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin" className="btn btn-primary">Beheer</Link>
          <button className="btn" onClick={signOut}>Uitloggen</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center pt-2 pb-4">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="text-xs text-textc/30"
        >
          Admin
        </button>
      ) : (
        <form
          onSubmit={request}
          className="card p-5 flex flex-col gap-3 w-full max-w-sm"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-textc/80">Admin inloggen</p>
            <button
              type="button"
              aria-label="Sluiten"
              onClick={() => { setOpen(false); setStatus('idle'); setEmail(''); }}
              className="flex items-center justify-center w-11 h-11 -mr-2 rounded-full text-textc/40"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <input
            type="email"
            required
            autoComplete="email"
            autoFocus
            className="input w-full"
            placeholder="jouw@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={status === 'sending' || status === 'sent'}
          >
            {status === 'sending' ? 'Versturen…' : status === 'sent' ? 'Controleer je inbox' : 'Stuur magic link'}
          </button>
          {status === 'sent' && (
            <p className="text-xs text-green-400 text-center">
              Als dat e-mailadres geautoriseerd is, is er een link onderweg. Verloopt in 15 minuten.
            </p>
          )}
          {status === 'error' && (
            <p className="text-xs text-red-400 text-center">{errorMsg || 'Kon niet versturen.'}</p>
          )}
        </form>
      )}
    </div>
  );
};
