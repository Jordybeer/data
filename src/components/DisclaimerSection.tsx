import React from 'react';
import { DISCLAIMER, DISCLAIMER_SUBTEXT, USEFUL_LINKS } from '@/data/drugs';

const iconMap = {
  eye: (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
  ),
  clipboard: (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
      />
    </svg>
  ),
  chart: (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      />
    </svg>
  ),
  heart: (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
      />
    </svg>
  ),
};

export const DisclaimerSection = () => (
  <div className="card p-6">
    <h3 className="text-sm font-bold text-textc/80 mb-3 uppercase tracking-wider">
      ⚠️ Disclaimer
    </h3>
    <p className="text-sm text-textc/80 leading-relaxed mb-6">{DISCLAIMER}</p>

    <h4 className="text-sm font-semibold text-textc/90 mb-3">
      {DISCLAIMER_SUBTEXT}
    </h4>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {USEFUL_LINKS.map((link) => (
        <a
          key={link.name}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-start gap-3 p-3 rounded-lg border border-borderc hover:border-primary/50 transition-all group bg-bg/30 hover:bg-bg/50"
          style={{ borderLeftColor: link.color, borderLeftWidth: '3px' }}
        >
          <div
            className="p-2 rounded-lg flex-shrink-0"
            style={{ backgroundColor: `${link.color}20`, color: link.color }}
          >
            {iconMap[link.icon]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm group-hover:text-primary transition-colors">
              {link.name}
            </div>
            <div className="text-xs text-textc/60 mt-0.5">
              {link.description}
            </div>
          </div>
        </a>
      ))}
    </div>
  </div>
);
