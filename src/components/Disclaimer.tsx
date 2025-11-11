import React from 'react'
import { DISCLAIMER } from '../data/drugs'
export const Disclaimer: React.FC = () => <section className="card p-6"><h2 className="text-warning font-semibold mb-3">⚠️ Disclaimer</h2><p className="text-textc/80 whitespace-pre-line text-sm">{DISCLAIMER}</p></section>