'use client';

export const LoadingScreen = () => (
  <div className="min-h-screen flex flex-col items-center justify-center gap-8">
    {/* Pulsing orb stack */}
    <div className="relative flex items-center justify-center">
      {/* outer slow ring */}
      <div className="absolute w-28 h-28 rounded-full border border-primary/20 animate-[ping_2.4s_cubic-bezier(0,0,0.2,1)_infinite]" />
      {/* mid ring */}
      <div className="absolute w-20 h-20 rounded-full border border-primary/30 animate-[ping_2.4s_cubic-bezier(0,0,0.2,1)_0.4s_infinite]" />
      {/* glowing core */}
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center"
        style={{
          background: 'radial-gradient(circle, rgba(167,139,250,0.9) 0%, rgba(139,92,246,0.7) 50%, rgba(109,40,217,0.3) 100%)',
          boxShadow: '0 0 32px rgba(167,139,250,0.5), 0 0 64px rgba(139,92,246,0.25)',
          animation: 'breathe 2.4s ease-in-out infinite',
        }}
      >
        {/* molecule dot */}
        <div className="w-3 h-3 rounded-full bg-white/80" />
      </div>
    </div>

    {/* Logo */}
    <div className="text-center">
      <p className="text-xl font-bold tracking-tight">
        <span className="text-textc">Snuff</span>{' '}
        <span className="text-primary">DB</span>
      </p>
      <p className="text-sm text-textc/40 mt-1 animate-pulse">laden…</p>
    </div>

  </div>
);
