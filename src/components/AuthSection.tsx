'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSession } from '@/components/SessionProvider';

export const AuthSection: React.FC = () => {
  const { session } = useSession();
  const [open, setOpen] = useState(false);

  const signOut = async () => {
    await fetch('/api/auth/signout', { method: 'POST' });
    window.location.href = '/';
  };

  if (session.isAdmin) {
    return (
      <div className="card p-5 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <span className="px-2 py-1 rounded-full bg-green-600/20 border border-green-500/30 text-green-400 text-xs font-bold uppercase tracking-wider">
            Admin
          </span>
          <p className="text-textc/82 text-sm">{session.email}</p>
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
        <button onClick={() => setOpen(true)} className="text-xs text-textc/55">
          Admin
        </button>
      ) : (
        <div className="card p-5 flex flex-col gap-3 w-full max-w-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-textc/90">Admin inloggen</p>
            <button
              type="button"
              aria-label="Sluiten"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center w-11 h-11 -mr-2 rounded-full text-textc/65"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <a href="/api/auth/github" className="btn btn-primary w-full flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12" />
            </svg>
            Inloggen met GitHub
          </a>
        </div>
      )}
    </div>
  );
};
