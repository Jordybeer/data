import React, { useState } from 'react'
import { Category, Drug } from '../App'
import { DrugItem } from './DrugItem'
export const CategoryList: React.FC<{ categories: Category[]; onDrugClick: (d: Drug) => void }> = ({ categories, onDrugClick }) => {
  const [open, setOpen] = useState<Set<string>>(new Set(categories.map(c => c.name)))
  const toggle = (n: string) => setOpen(p => { const s = new Set(p); s.has(n) ? s.delete(n) : s.add(n); return s })
  return <div className="flex flex-col gap-4">{categories.map(cat => <div key={cat.name} className="card overflow-hidden"><button className="w-full flex items-center justify-between px-4 py-3 hover:bg-bg-hover" onClick={() => toggle(cat.name)}><h3 className="font-semibold">{cat.name}</h3><div className="flex items-center gap-3"><span className="text-xs font-semibold bg-primary text-white px-2 py-0.5 rounded-full">{cat.drugs.length}</span><span className={`transition-transform ${open.has(cat.name) ? 'rotate-180' : ''}`}>▼</span></div></button>{open.has(cat.name) && <div className="border-t border-borderc p-2 flex flex-col gap-1">{cat.drugs.map(d => <DrugItem key={d.id} drug={d} onClick={() => onDrugClick(d)} />)}</div>}</div>)}</div>
}