'use client'

import Link from 'next/link'
import AccountMenu from '../../components/AccountMenu'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../lib/supabase-browser'

const panel: React.CSSProperties = { background: '#fff', border: '1px solid #e6e8ee', borderRadius: 20, boxShadow: '0 7px 25px rgba(32,35,49,.04)' }
const action: React.CSSProperties = { width: '100%', minHeight: 44, marginTop: 'auto', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 10, padding: '11px 14px', boxSizing: 'border-box', fontSize: 13, fontWeight: 750, textDecoration: 'none' }

export default function Workspace() {
  const router = useRouter()
  const supabase = createClient()
  const [ready, setReady] = useState(false)
  const [email, setEmail] = useState('')

  useEffect(() => {
    let active = true
    supabase.auth.getUser().then(({ data }) => {
      if (!active) return
      if (!data.user) { router.replace('/login'); return }
      setEmail(data.user.email || '')
      setReady(true)
    }).catch(() => { if (active) router.replace('/login') })
    return () => { active = false }
  }, [router, supabase])

  if (!ready) return <main aria-label="Loading workspace" style={{ minHeight: '100svh', display: 'grid', placeItems: 'center', background: '#f5f7f8' }}><span style={{ width: 24, height: 24, border: '2px solid #dce5df', borderTopColor: '#087F5B', borderRadius: '50%', animation: 'workspaceSpin .7s linear infinite' }} /><style>{'@keyframes workspaceSpin{to{transform:rotate(360deg)}}'}</style></main>

  const card: React.CSSProperties = { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: 0, minHeight: 230, padding: 22, border: '1px solid #e6e8ee', borderRadius: 16, background: '#fff', color: '#171923', boxShadow: '0 4px 16px rgba(20,24,35,.035)' }
  const icon: React.CSSProperties = { width: 46, height: 46, borderRadius: 13, display: 'grid', placeItems: 'center', flex: 'none' }

  return <main style={{ minHeight: '100svh', background: '#f5f7f8', color: '#171923', fontFamily: 'Inter,Arial,sans-serif', padding: '24px 16px 42px', boxSizing: 'border-box' }}>
    <div style={{ width: '100%', maxWidth: 920, margin: '0 auto' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, marginBottom: 24 }}>
        <Link href="/workspace" aria-label="NelaPost workspace" style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0, textDecoration: 'none' }}>
          <span style={{ width: 42, height: 42, flex: 'none', display: 'grid', placeItems: 'center', borderRadius: 12, background: '#11131a', color: '#fff', fontSize: 21, fontWeight: 800 }}>N.</span>
          <span style={{ minWidth: 0 }}><strong style={{ display: 'block', color: '#087F5B', fontSize: 22, lineHeight: 1.1, letterSpacing: '-.8px' }}>NelaPost</strong><small style={{ display: 'block', color: '#777b88', fontSize: 11, marginTop: 3 }}>Simple Growth. Real Progress.</small></span>
        </Link>
        <AccountMenu />
      </header>

      <section style={{ ...panel, padding: 'clamp(22px,5vw,36px)' }}>
        <div style={{ color: '#087F5B', fontSize: 11, fontWeight: 800, letterSpacing: 1.4, marginBottom: 10 }}>YOUR WORKSPACE</div>
        <h1 style={{ margin: 0, fontSize: 'clamp(27px,5vw,38px)', lineHeight: 1.12, letterSpacing: '-1.2px', fontWeight: 800 }}>Where would you like to go?</h1>
        <p style={{ maxWidth: 620, margin: '11px 0 26px', color: '#68707b', fontSize: 14, lineHeight: 1.65 }}>Choose a workspace and pick up where you need to make progress. Your practical tools, together in one place.</p>
        <div aria-label="Choose a workspace" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,260px),1fr))', gap: 14 }}>
          <article style={card}>
            <div style={{ ...icon, background: '#f0f1f4', color: '#737985' }} aria-hidden="true"><svg viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="16" rx="3"/><path d="M7 15l3-3 2 2 3-4 3 5"/></svg></div>
            <h2 style={{ margin: '17px 0 7px', fontSize: 18, letterSpacing: '-.4px' }}>Social</h2>
            <p style={{ margin: '0 0 18px', color: '#68707b', fontSize: 13, lineHeight: 1.65, flex: 1 }}>Create and organise your social content, plan posts and prepare your next campaign.</p>
            <div style={{ ...action, background: '#f1f2f4', color: '#7a808b', border: '1px solid #e7e9ed' }}>Coming Soon</div>
          </article>
          <article style={{ ...card, borderColor: '#cfe2d8' }}>
            <div style={{ ...icon, background: '#e8f5ef', color: '#087F5B' }} aria-hidden="true"><svg viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10 12 4l9 6"/><path d="M5 10v10h14V10M3 20h18"/><path d="M9 20v-6h6v6M8 10h.01M16 10h.01"/></svg></div>
            <h2 style={{ margin: '17px 0 7px', fontSize: 18, letterSpacing: '-.4px' }}>Business Tool</h2>
            <p style={{ margin: '0 0 18px', color: '#68707b', fontSize: 13, lineHeight: 1.65, flex: 1 }}>Manage sales, stock, expenses, cash-ups, reports and your business records.</p>
            <Link href="/business" style={{ ...action, background: '#087F5B', color: '#fff', border: '1px solid #087F5B' }}>Open Business Tool<svg aria-hidden="true" viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8h10M8 3l5 5-5 5"/></svg></Link>
          </article>
        </div>
      </section>

      <footer style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginTop: 20, padding: '15px 2px 0', borderTop: '1px solid #e1e5e8', color: '#858b95', fontSize: 11 }}>
        <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{email}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 16 }}><Link href="/about" style={{ color: '#087F5B', fontWeight: 700, textDecoration: 'none' }}>About</Link><Link href="/privacy" style={{ color: '#68707b', textDecoration: 'none' }}>Privacy</Link><Link href="/terms" style={{ color: '#68707b', textDecoration: 'none' }}>Terms</Link></span>
      </footer>
    </div>
  </main>
}
