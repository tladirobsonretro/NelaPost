'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../lib/supabase-browser'

type AccountUser = {
  id: string
  email?: string
  user_metadata?: Record<string, unknown>
}

export default function AccountMenu() {
  const router = useRouter()
  const supabase = createClient()
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<AccountUser | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  useEffect(() => {
    let active = true
    supabase.auth.getUser()
      .then(({ data, error }) => {
        if (!active) return
        setUser(error ? null : (data.user as AccountUser | null))
      })
      .catch(() => {
        if (active) setUser(null)
      })
      .finally(() => {
        if (active) setLoaded(true)
      })
    return () => { active = false }
  }, [])

  const displayName = useMemo(() => {
    const metadata = user?.user_metadata || {}
    const first = String(metadata.first_name || '').trim()
    const last = String(metadata.last_name || '').trim()
    const saved = String(metadata.full_name || metadata.name || '').trim()
    return [first, last].filter(Boolean).join(' ') || saved || user?.email?.split('@')[0] || 'Your account'
  }, [user])

  const initials = useMemo(() => {
    const parts = displayName.trim().split(/\s+/).filter(Boolean)
    return (parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : parts[0]?.slice(0, 2) || 'N').toUpperCase()
  }, [displayName])

  const signOut = async () => {
    if (signingOut) return
    setSigningOut(true)
    try {
      await supabase.auth.signOut()
      setUser(null)
      setOpen(false)
      router.replace('/login')
      router.refresh()
    } finally {
      setSigningOut(false)
    }
  }

  return (
    <div className="accountMenu">
      <button
        type="button"
        className="accountTrigger"
        aria-label={open ? 'Close account menu' : 'Open account menu'}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(value => !value)}
      >
        <span className="accountAvatar" aria-hidden="true">{loaded && user ? initials : <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.5"/><path d="M4.8 20c.5-4 3.1-6 7.2-6s6.7 2 7.2 6"/></svg>}</span>
        <svg className={`accountChevron ${open ? 'isOpen' : ''}`} viewBox="0 0 16 16" aria-hidden="true"><path d="m4 6 4 4 4-4"/></svg>
      </button>
      {open && (
        <div className="accountDropdown" role="menu">
          {loaded && user ? (
            <>
              <div className="accountIdentity">
                <span className="accountAvatar accountAvatarLarge" aria-hidden="true">{initials}</span>
                <span className="accountIdentityText"><strong>{displayName}</strong><small>{user.email || 'NelaPost account'}</small></span>
              </div>
              <div className="accountDivider" />
              <Link role="menuitem" href="/profile" onClick={() => setOpen(false)}><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.5"/><path d="M4.8 20c.5-4 3.1-6 7.2-6s6.7 2 7.2 6"/></svg>Profile</Link>
              <Link role="menuitem" href="/profile#settings" onClick={() => setOpen(false)}><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="m19 13.5 1.2 1-1.5 2.6-1.5-.5a7 7 0 0 1-1.5.9l-.3 1.6h-3l-.3-1.6a7 7 0 0 1-1.5-.9l-1.5.5-1.5-2.6 1.2-1a7 7 0 0 1 0-1.8l-1.2-1 1.5-2.6 1.5.5a7 7 0 0 1 1.5-.9l.3-1.6h3l.3 1.6a7 7 0 0 1 1.5.9l1.5-.5 1.5 2.6-1.2 1a7 7 0 0 1 0 1.8Z"/></svg>Settings</Link>
              <button role="menuitem" type="button" onClick={signOut} disabled={signingOut}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 5H5v14h5M14 8l4 4-4 4M8 12h10"/></svg>{signingOut ? 'Signing out…' : 'Log out'}</button>
            </>
          ) : (
            <Link role="menuitem" href="/login" onClick={() => setOpen(false)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 5H5v14h5M14 8l4 4-4 4M8 12h10"/></svg>Sign in</Link>
          )}
        </div>
      )}
      <style jsx>{`
        .accountMenu{position:relative;display:inline-flex;align-items:center;z-index:30}
        .accountTrigger{display:inline-flex;align-items:center;gap:7px;border:1px solid #dfe7e1;border-radius:999px;padding:5px 8px 5px 5px;background:#fff;color:#25372c;cursor:pointer;box-shadow:0 4px 16px rgba(20,24,35,.04)}
        .accountTrigger:hover{border-color:#b9d5c4;background:#fbfdfb}
        .accountAvatar{width:34px;height:34px;flex:none;border-radius:50%;display:grid;place-items:center;background:#e8f5ef;color:#087f5b;font-size:12px;font-weight:800}
        .accountAvatar svg,.accountDropdown a svg,.accountDropdown button svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
        .accountChevron{width:13px;height:13px;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round;transition:transform .15s ease}
        .accountChevron.isOpen{transform:rotate(180deg)}
        .accountDropdown{position:absolute;top:calc(100% + 9px);right:0;width:246px;padding:8px;background:#fff;border:1px solid #e3e9e4;border-radius:14px;box-shadow:0 18px 48px rgba(20,35,25,.14);color:#26352b}
        .accountIdentity{display:flex;align-items:center;gap:10px;padding:9px 8px 11px;min-width:0}
        .accountAvatarLarge{width:38px;height:38px;font-size:13px}
        .accountIdentityText{display:grid;gap:4px;min-width:0}
        .accountIdentityText strong{font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .accountIdentityText small{font-size:10px;color:#788179;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:165px}
        .accountDivider{height:1px;background:#edf0ed;margin:2px 0 6px}
        .accountDropdown a,.accountDropdown button{width:100%;display:flex;align-items:center;gap:11px;padding:11px 10px;border:0;border-radius:8px;background:transparent;color:#354238;text-decoration:none;text-align:left;font-size:12px;font-weight:600;cursor:pointer}
        .accountDropdown a:hover,.accountDropdown button:hover{background:#f2f8f4;color:#087f5b}
        .accountDropdown button:disabled{opacity:.6;cursor:wait}
        @media(prefers-reduced-motion:reduce){.accountChevron{transition:none}}
      `}</style>
    </div>
  )
}
