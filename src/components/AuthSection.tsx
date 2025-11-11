import React, { useState } from 'react'
import { ADMIN_EMAIL } from '../data/drugs'
export const AuthSection: React.FC<{ isAdmin: boolean; onAuthChange: () => void; isPushEnabled: boolean; onPushChange: (b: boolean) => void }> = ({ isAdmin, onAuthChange, isPushEnabled, onPushChange }) => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const login = (e: React.FormEvent) => {
    e.preventDefault()
    if (email !== ADMIN_EMAIL) { setMsg('❌ Admin only'); return; }
    setLoading(true)
    setTimeout(() => {
      setMsg('✅ Magic link sent!')
      setLoading(false)
      setEmail('')
      setTimeout(() => onAuthChange(), 700)
    }, 700)
  }
  if (isAdmin) return <div className="card p-6"><div className="flex items-center justify-between flex-wrap gap-3"><div className="flex items-center gap-3"><span className="px-2 py-1 rounded bg-green-600 text-white text-sm font-semibold">👤 Admin</span><p className="text-textc/80 text-sm">{ADMIN_EMAIL}</p></div><button className="btn bg-red-600 text-white hover:brightness-110" onClick={onAuthChange}>Logout</button></div><div className="mt-4 flex items-center justify-between border border-borderc rounded-lg p-3"><label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={isPushEnabled} onChange={() => onPushChange(!isPushEnabled)} className="w-4 h-4" /><span className="text-sm">Push</span></label>{isPushEnabled && <span className="text-green-600 text-sm">● On</span>}</div></div>
  return <div className="card p-6"><form onSubmit={login} className="flex flex-col gap-4"><div className="flex gap-2 max-sm:flex-col"><input type="email" className="input flex-1" placeholder="info@jordy.beer" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} /><button type="submit" className="btn btn-primary whitespace-nowrap" disabled={loading}>{loading ? '⏳' : '✉️'}</button></div>{msg && <p className={`text-sm ${msg.includes('❌') ? 'text-red-500' : 'text-green-500'}`}>{msg}</p>}</form></div>
}