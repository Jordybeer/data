// src/data/drugs.ts

// 1. INTERFACES
// ============
export interface UsefulLink {
  name: string;
  description: string;
  url: string;
  color: string; // 6-digit Hex code (e.g. #FF0000)
  icon: 'eye' | 'clipboard' | 'chart' | 'heart';
}

export interface Drug { 
  id: number; 
  name: string; 
  category: string; 
  notes: string 
}

// 2. CONFIG & TEXT
// ===============
export const ADMIN_EMAIL = 'contact@jordy.beer';
export const CATEGORY_ORDER = ['Street drugs', 'Research chemicals'];

export const DISCLAIMER = `Alle psychoactieve stoffen in deze lijst zijn persoonlijk getest. De informatie die je hier leest is voornamelijk gebaseerd op persoonlijke ervaringen en observaties. Doe daarom altijd zelf onderzoek voordat je iets aanneemt als feit.`;

export const DISCLAIMER_SUBTEXT = "Top websites voor info & tools:";

// 3. LINKS CONFIGURATION
// =====================
export const USEFUL_LINKS: UsefulLink[] = [
  {
    name: "PsychonautWiki",
    description: "Uitgebreide encyclopedie",
    url: "https://psychonautwiki.org",
    color: "#2D2D2D", 
    icon: "eye"
  },
  {
    name: "PsyLog",
    description: "Gratis app om gebruik te loggen",
    url: "https://www.psylog.net",
    color: "#4F46E5", 
    icon: "clipboard"
  },
  {
    name: "Nationale Drug Monitor",
    description: "Feiten, cijfers & trends (NL)",
    url: "https://www.nationaledrugmonitor.nl/leeswijzer/",
    color: "#005CA9", 
    icon: "chart"
  },
  {
    name: "Safe 'n Sound (BE)",
    description: "Schadebeperking in het uitgaansleven",
    url: "https://safensound.be",
    color: "#E94E1B", 
    icon: "heart"
  }
];

// Data now lives in Supabase (table: drugs). Seed via the SQL below.

