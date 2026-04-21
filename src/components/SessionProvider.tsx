'use client';

import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';

type Session = { email: string | null; isAdmin: boolean };
type Ctx = { session: Session; loading: boolean; refresh: () => Promise<void> };

const SessionContext = createContext<Ctx>({
  session: { email: null, isAdmin: false },
  loading: true,
  refresh: async () => {},
});

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session>({ email: null, isAdmin: false });
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const r = await fetch('/api/auth/me', { cache: 'no-store' });
      const j = (await r.json()) as Session;
      setSession(j);
    } catch {
      setSession({ email: null, isAdmin: false });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return <SessionContext.Provider value={{ session, loading, refresh }}>{children}</SessionContext.Provider>;
}

export function useSession() {
  return useContext(SessionContext);
}
