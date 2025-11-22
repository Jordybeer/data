import React from 'react';
import { USEFUL_LINKS, DISCLAIMER, DISCLAIMER_SUBTEXT } from './constants';

// Simple inline SVGs to avoid external dependencies
const Icons = {
  eye: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  clipboard: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>,
  chart: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  heart: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
};

const DisclaimerSection = () => {
  return (
    <div className="card p-6 max-w-2xl shadow-sm mx-auto">
      <p className="mb-6 text-textc/90 leading-relaxed">
        {DISCLAIMER}
      </p>
      
      <p className="font-bold text-xs text-textc/50 uppercase tracking-widest mb-4 ml-1">
        {DISCLAIMER_SUBTEXT}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {USEFUL_LINKS.map((site) => (
          <a
            key={site.name}
            href={site.url}
            target="_blank"
            rel="noopener noreferrer"
            // Uses `bg-bg` for default card color
            // Uses `hover:bg-bg-lighter` and `hover:border-primary` from your theme system
            className="group flex items-center gap-3 p-3 bg-bg border border-borderc rounded-lg hover:border-primary/30 hover:bg-bg-lighter hover:shadow-md transition-all duration-300 ease-out hover:-translate-y-0.5"
          >
            {/* Icon Box */}
            <div 
              className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full transition-colors"
              style={{ 
                // Uses the hex color from constants + '15' for ~8% opacity
                backgroundColor: `${site.color}15`,
                color: site.color 
              }} 
            >
               <span className="w-5 h-5">
                {Icons[site.icon]}
              </span>
            </div>
            
            {/* Text Content */}
            <div className="flex flex-col">
              <span className="text-sm font-bold text-textc group-hover:text-primary transition-colors">
                {site.name}
              </span>
              <span className="text-xs text-textc/60 font-medium">
                {site.description}
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default DisclaimerSection;
