'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../lib/supabase-browser'

type Preferences = { productUpdates:boolean; tips:boolean }

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [preferences, setPreferences] = useState<Preferences>({ productUpdates:false, tips:true })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    supabase.auth.getUser().then(({data,error}) => {
      if (!active) return
      if (error) { setError('We could not load your settings. Please refresh the page.'); setLoading(false); return }
      if (!data.user) { router.replace('/login'); return }
      setEmail(data.user.email || '')
      const saved = data.user.user_metadata?.preferences
      if (saved && typeof saved === 'object') setPreferences({ productUpdates:saved.productUpdates === true, tips:saved.tips !== false })
      setLoading(false)
    }).catch(() => { if (active) { setError('We could not connect to your account. Check your connection and try again.'); setLoading(false) } })
    return () => { active = false }
  }, [router])

  const savePreferences = async () => {
    setSaving(true); setMessage(''); setError('')
    try {
      const {error} = await supabase.auth.updateUser({data:{preferences:{productUpdates:preferences.productUpdates,tips:preferences.tips}}})
      if (error) throw error
      setMessage('Your preferences have been saved.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'We could not save your settings. Please try again.')
    } finally { setSaving(false) }
  }

  const signOut = async () => { await supabase.auth.signOut(); router.replace('/login'); router.refresh() }

  if (loading) return <main className="settingsPage"><div className="settingsLoading" aria-label="Loading settings" /></main>

  return <main className="settingsPage">
    <div className="settingsWrap">
      <header className="settingsTop"><Link href="/" className="settingsBrand">NelaPost</Link><Link href="/workspace" className="settingsBack">Back to tools</Link></header>
      <nav className="accountTabs" aria-label="Account pages"><Link href="/profile">Profile</Link><Link href="/settings" aria-current="page">Settings</Link></nav>
      <div className="settingsHeading"><p className="eyebrow">YOUR ACCOUNT</p><h1>Settings</h1><p>Manage your security, preferences and account access.</p></div>
      {error && <p className="noticeError" role="alert">{error}</p>}
      <section className="settingsCard">
        <div className="sectionHeading"><h2>Security</h2><p>Keep access to your account secure.</p></div>
        <div className="settingsRow"><div><strong>Password and sign-in</strong><p>Request a secure password reset link by email.</p></div><Link className="secondaryButton" href="/forgot-password">Reset password</Link></div>
        <div className="settingsRow"><div><strong>Sign-in email</strong><p>{email || 'Your account email address'}</p></div><span className="statusPill">Verified sign-in method</span></div>
      </section>
      <section className="settingsCard">
        <div className="sectionHeading"><h2>Notifications and updates</h2><p>Choose what you would like to hear about. These preferences are saved for future NelaPost communications; they do not activate notifications that are not yet available.</p></div>
        <label className="preferenceRow"><span><strong>Product updates</strong><small>New tools and important product changes.</small></span><input type="checkbox" checked={preferences.productUpdates} onChange={e=>setPreferences(p=>({...p,productUpdates:e.target.checked}))}/></label>
        <label className="preferenceRow"><span><strong>Practical tips</strong><small>Occasional guidance to help you get more from NelaPost.</small></span><input type="checkbox" checked={preferences.tips} onChange={e=>setPreferences(p=>({...p,tips:e.target.checked}))}/></label>
        <div className="settingsActions">{message&&<p className="noticeSuccess" role="status">{message}</p>}<button className="primaryButton" type="button" onClick={savePreferences} disabled={saving}>{saving?'Saving…':'Save preferences'}</button></div>
      </section>
      <section className="settingsCard">
        <div className="sectionHeading"><h2>Appearance</h2><p>NelaPost currently uses its standard light appearance. Additional appearance options can be introduced without affecting your account or business data.</p></div>
        <div className="appearancePreview"><span className="appearanceSwatch"/><div><strong>Light</strong><p>Current appearance</p></div><span className="statusPill">Active</span></div>
      </section>
      <section className="settingsCard">
        <div className="sectionHeading"><h2>Privacy and account</h2><p>Review how NelaPost handles your information or sign out from this device.</p></div>
        <div className="settingsRow"><div><strong>Privacy policy</strong><p>Read how account information is handled.</p></div><Link href="/privacy" className="secondaryButton">View privacy</Link></div>
        <div className="settingsRow"><div><strong>Terms of service</strong><p>Review the terms for using NelaPost.</p></div><Link href="/terms" className="secondaryButton">View terms</Link></div>
        <div className="settingsRow"><div><strong>Sign out</strong><p>End your current NelaPost session on this device.</p></div><button className="secondaryButton" type="button" onClick={signOut}>Sign out</button></div>
      </section>
      <footer className="settingsFooter"><Link href="/about">About NelaPost</Link><span>Personal account settings do not change your business details.</span></footer>
    </div>
    <style jsx>{`
      .settingsPage{min-height:100svh;background:#f6f9f7;color:#202720;padding:24px 16px 40px;font-family:Inter,Arial,sans-serif}.settingsWrap{max-width:860px;margin:0 auto}.settingsTop{display:flex;justify-content:space-between;align-items:center;gap:16px;margin-bottom:28px}.settingsBrand{color:#087f5b;text-decoration:none;font-size:22px;font-weight:800;letter-spacing:-.7px}.settingsBack,.settingsFooter a{color:#087f5b;text-decoration:none;font-size:13px;font-weight:650}
      .accountTabs{display:flex;gap:6px;padding:5px;background:#eaf1ec;border-radius:12px;width:max-content;margin-bottom:30px}.accountTabs a{padding:10px 18px;border-radius:8px;color:#58665d;text-decoration:none;font-size:12px;font-weight:750}.accountTabs a[aria-current=page]{background:#fff;color:#087f5b;box-shadow:0 2px 7px #1d33240b}
      .settingsHeading{margin-bottom:25px}.eyebrow{font-size:10px;font-weight:800;letter-spacing:.17em;color:#087f5b;margin:0 0 8px}.settingsHeading h1{font-size:clamp(30px,5vw,40px);letter-spacing:-1.3px;margin:0 0 8px}.settingsHeading>p:last-child{font-size:14px;line-height:1.6;color:#667169;margin:0}
      .settingsCard{background:#fff;border:1px solid #e1e9e3;border-radius:16px;padding:clamp(18px,3vw,25px);margin-bottom:14px;box-shadow:0 8px 24px #1d332408}.sectionHeading h2{font-size:17px;letter-spacing:-.35px;margin:0 0 6px}.sectionHeading p{font-size:12px;line-height:1.65;color:#758078;margin:0 0 18px}
      .settingsRow{display:flex;align-items:center;justify-content:space-between;gap:14px;border-top:1px solid #edf0ed;padding:15px 0}.settingsRow strong,.preferenceRow strong,.appearancePreview strong{font-size:12px;display:block;margin-bottom:5px}.settingsRow p,.preferenceRow small,.appearancePreview p{font-size:11px;line-height:1.55;color:#758078;margin:0}.secondaryButton,.primaryButton{display:inline-flex;align-items:center;justify-content:center;min-height:39px;border-radius:9px;padding:10px 13px;font-size:12px;font-weight:750;text-decoration:none;white-space:nowrap;cursor:pointer}.secondaryButton{border:1px solid #dce4de;background:#fff;color:#26382c}.primaryButton{border:1px solid #087f5b;background:#087f5b;color:#fff}.primaryButton:disabled{opacity:.6;cursor:wait}
      .statusPill{flex:none;font-size:10px;font-weight:750;color:#176b48;background:#eaf7ef;padding:7px 9px;border-radius:999px}.preferenceRow{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:14px 0;border-top:1px solid #edf0ed;cursor:pointer}.preferenceRow>span{display:block}.preferenceRow input{width:18px;height:18px;accent-color:#087f5b;flex:none}
      .settingsActions{display:flex;align-items:center;justify-content:flex-end;gap:12px;flex-wrap:wrap;border-top:1px solid #edf0ed;padding-top:16px}.noticeSuccess,.noticeError{font-size:12px;line-height:1.5;margin:0;padding:10px 12px;border-radius:8px}.noticeSuccess{color:#176b48;background:#eaf7ef}.noticeError{color:#9f2525;background:#fff0f0;margin-bottom:14px}.appearancePreview{display:flex;align-items:center;gap:12px;border-top:1px solid #edf0ed;padding-top:16px}.appearanceSwatch{width:38px;height:38px;border-radius:10px;border:1px solid #dfe7e1;background:#f6f9f7;box-shadow:inset 0 0 0 7px white;flex:none}.appearancePreview>div{flex:1}.settingsFooter{display:flex;justify-content:space-between;align-items:center;gap:14px;flex-wrap:wrap;padding-top:10px;color:#758078;font-size:11px}
      .settingsLoading{width:24px;height:24px;border:2px solid #dce6df;border-top-color:#087f5b;border-radius:50%;margin:40vh auto;animation:spin .7s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}
      @media(max-width:560px){.settingsPage{padding:18px 12px 30px}.settingsTop{margin-bottom:23px}.accountTabs{margin-bottom:24px}.settingsRow{align-items:flex-start;flex-wrap:wrap}.settingsRow .secondaryButton,.settingsRow button{margin-left:auto}.statusPill{white-space:normal}.settingsActions{align-items:stretch}.settingsActions .primaryButton{width:100%}.settingsFooter{align-items:flex-start}}@media(prefers-reduced-motion:reduce){.settingsLoading{animation:none}}
    `}</style>
  </main>
}
