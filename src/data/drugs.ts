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
export const ADMIN_EMAIL = 'magic@jordy.beer';
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
    description: "Logboek & statistieken",
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
    description: "Peer support & info",
    url: "https://safensound.be",
    color: "#E94E1B", 
    icon: "heart"
  }
];

// 4. DRUG DATA
// ===========
const STREET_DRUGS = [
  '11-OH-THC', 'Alcohol', 'Caffeine', 'Changa', 'Clonazepam', 'Cocaïne', 'Crack', 
  'Crystal meth', 'Dexamfetamine', 'Diazepam', 'Flurazepam', 'GHB', 'Heroïne', 
  'Ketamine', 'Lachgas', 'Lisdexamfetamine', 'Lormetazepam', 'Lorazepam', 'LSD-25', 
  'Methylfenidaat hcl', 'Methylfenidaat XR', 'MDMA', 'Mirtazapine', 'NN-DMT', 
  'Nicotine', 'Olanzapine', 'Oxycodone', 'Paddos', 'Poppers', 'Pregabalin', 
  'Rohypnol', 'Salvia Divinorum', 'Sisa', 'Speed', 'Trazodone', 
  'Tucci (pink cocaine)', 'Truffels', 'Wiet', 'XTC'
];

const RESEARCH_CHEMICALS = [
  '1-cP-AL-LAD', '1cP-LSD', '1B-LSD', '25E-NBOH', '2C-B-Fly', '2-CMC', '2C-E', 
  '2C-EF', '2-FEA', '2-FDCK', '2-FMA', '2-MMC', '3-CMC', '3-FA', '3-FEA', '3-FMA', 
  '3-FPM', '3-HO-PCP', '3-MeO-PCE', '3-MeO-PCP', '3-MMA', '3-MMC', '4-AcO-DET', 
  '4-AcO-DMT', '4-CL-PVP', '4-HO-MET', '4-FMA', '4F-MPH', '4-MMC', '4-MPD', 
  '5-APB', '5-MPPA', '5-MAPB', '5-MeO-DMT', '5-MeO-MiPT', '6-APB', 'A-D2PV', 
  'aMT', 'α-PcYP', 'α-PHP', 'α-PHIP', 'AL-LAD', 'βk-2C-B', 'Bromazolam', 
  'Clonazolam', 'DCK', 'Deschloroetizolam', 'DOC', 'DOM', 'DPT', 'Etizolam', 
  'Fanax', 'Flualprazolam', 'Flubromazepam', 'flunitrazolam', 'HHC', 'IPPH', 
  "Jordy's bliss", "Lily's bliss", 'Mefi', 'methallylescaline', 'MDAi', 'MDPHP', 
  'N-Ethylhexedrone (Hexen)', 'N-ethylpentedrone (NEP)', 'Newphoria', 
  'Norflurazepam', 'MF-PVP', 'MXE', 'MXPR', 'MXiPR', 'O-PCE', 'Pyrazolam', 
  'Phenibut', 'Pink star', 'SL-164', 'Yellow Mandala'
];

export const getAllDrugs = (): Drug[] => {
  let id = 1;
  const out: Drug[] = [];
  STREET_DRUGS.forEach(n => out.push({ id: id++, name: n, category: 'Street drugs', notes: '' }));
  RESEARCH_CHEMICALS.forEach(n => out.push({ id: id++, name: n, category: 'Research chemicals', notes: '' }));
  return out;
};
