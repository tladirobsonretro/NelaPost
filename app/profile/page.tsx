'use client'

import Link from 'next/link'
import { FormEvent, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../lib/supabase-browser'
import ProfileAvatar, { AvatarConfig, cleanAvatarConfig } from '../../components/ProfileAvatar'

type ProfileForm = { firstName: string; lastName: string; phone: string }
const avatarChoices = {
  skin: [{id:'warm',label:'Warm'},{id:'deep',label:'Deep'},{id:'rich',label:'Rich'},{id:'golden',label:'Golden'},{id:'fair',label:'Fair'},{id:'rose',label:'Rose'}],
  hair: [{id:'coils',label:'Coils'},{id:'curly',label:'Curly'},{id:'short',label:'Short'},{id:'long',label:'Long'}],
  outfit: [{id:'suit',label:'Suit'},{id:'tshirt',label:'T-shirt'},{id:'blazer',label:'Blazer + T-shirt'}],
  shirt: [{id:'green',label:'Green'},{id:'blue',label:'Blue'},{id:'purple',label:'Purple'},{id:'orange',label:'Orange'},{id:'pink',label:'Pink'},{id:'black',label:'Black'}],
  background: [{id:'mint',label:'Mint'},{id:'sky',label:'Sky'},{id:'lilac',label:'Lilac'},{id:'peach',label:'Peach'},{id:'lemon',label:'Lemon'},{id:'slate',label:'Slate'}],
} as const

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [form, setForm] = useState<ProfileForm>({ firstName:'', lastName:'', phone:'' })
  const [avatar, setAvatar] = useState<Required<AvatarConfig>>(cleanAvatarConfig(null))
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    let active = true
    supabase.auth.getUser().then(({ data, error: authError }) => {
      if (!active) return
      if (authError) { setLoadError('We could not load your account details. Please refresh the page and try again.'); setLoading(false); return }
      if (!data.user) { router.replace('/login'); return }
      const user = data.user
      setEmail(user.email || '')
      setForm({ firstName:String(user.user_metadata?.first_name || ''), lastName:String(user.user_metadata?.last_name || ''), phone:String(user.user_metadata?.phone || '') })
      setAvatar(cleanAvatarConfig(user.user_metadata?.avatar_config))
      setLoading(false)
    }).catch(() => {
      if (!active) return
      setLoadError('We could not connect to your account. Check your connection and refresh the page.')
      setLoading(false)
    })
    return () => { active = false }
  }, [router])

  const initials = useMemo(() => `${form.firstName.trim().charAt(0)}${form.lastName.trim().charAt(0)}`.trim().toUpperCase() || email.trim().charAt(0).toUpperCase() || 'N', [form.firstName, form.lastName, email])

  const saveProfile = async (e: FormEvent) => {
    e.preventDefault(); setSaving(true); setMessage(''); setError('')
    try {
      const { error } = await supabase.auth.updateUser({ data:{
        first_name:form.firstName.trim(), last_name:form.lastName.trim(), phone:form.phone.trim(),
        avatar_config: { skin:avatar.skin, hair:avatar.hair, shirt:avatar.shirt, outfit:avatar.outfit, background:avatar.background }
      }})
      if (error) throw error
      setMessage('Your profile and avatar have been saved.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'We could not save your profile. Please try again.')
    } finally { setSaving(false) }
  }

  if (loading) return <main className="profileLoading" aria-label="Loading profile"><span /></main>
  if (loadError) return <main className="profilePage"><div className="profileWrap"><section className="profileCard"><h1>Profile unavailable</h1><p role="alert">{loadError}</p><button type="button" className="primaryButton" onClick={() => window.location.reload()}>Try again</button><p><Link href="/workspace" className="backLink">Back to workspace</Link></p></section></div></main>

  return <main className="profilePage">
    <div className="profileWrap">
      <header className="profileTop"><Link href="/" className="profileBrand">NelaPost</Link><Link href="/workspace" className="backLink">Back to tools</Link></header>
      <nav className="accountTabs" aria-label="Account pages"><Link href="/profile" aria-current="page">Profile</Link><Link href="/settings">Settings</Link></nav>
      <section className="profileIntro"><ProfileAvatar config={avatar} initials={initials} size={76}/><div><p className="eyebrow">YOUR ACCOUNT</p><h1>Your profile</h1><p>Manage your personal details and make your NelaPost avatar yours.</p></div></section>
      <form onSubmit={saveProfile} className="profileGrid">
        <section className="profileCard">
          <div className="sectionHeading"><h2>Personal details</h2><p>These details belong to you, not your business.</p></div>
          <div className="profileForm">
            <label>First name<input autoComplete="given-name" value={form.firstName} onChange={e=>setForm({...form,firstName:e.target.value})} maxLength={80} required /></label>
            <label>Surname<input autoComplete="family-name" value={form.lastName} onChange={e=>setForm({...form,lastName:e.target.value})} maxLength={80} required /></label>
            <label>Mobile number<input autoComplete="tel" type="tel" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} maxLength={30} /></label>
            <label>Email address<input type="email" value={email} readOnly aria-describedby="email-note" /></label>
            <p id="email-note" className="fieldNote">Your sign-in email is shown here and cannot be changed on this page.</p>
          </div>
        </section>
        <section className="profileCard avatarCard">
          <div className="sectionHeading"><h2>Build your avatar</h2><p>Choose a look. No photo uploads and no image files are stored.</p></div>
          <div className="avatarPreview"><ProfileAvatar config={avatar} initials={initials} size={112}/><div><strong>Your NelaPost avatar</strong><p>Your choices are saved as a few small settings with your account.</p></div></div>
          {(['skin','hair','outfit','shirt','background'] as const).map(group => (
            <fieldset className="choiceGroup" key={group}>
              <legend>{group === 'skin' ? 'Skin tone' : group === 'hair' ? 'Hairstyle' : group === 'outfit' ? 'Clothing style' : group === 'shirt' ? 'Clothing colour' : 'Background colour'}</legend>
              <div className="choiceOptions">
                {avatarChoices[group].map(option => (
                  <button key={option.id} type="button" className={avatar[group] === option.id ? 'choice selected' : 'choice'} aria-pressed={avatar[group] === option.id} onClick={() => setAvatar(current => ({...current, [group]:option.id}))}>{group === 'skin' || group === 'shirt' || group === 'background' ? <span className={`colourDot ${option.id}`} aria-hidden="true"/> : group === 'hair' ? <span className={`hairSample ${option.id}`} aria-hidden="true"/> : null}{option.label}</button>
                ))}
              </div>
            </fieldset>
          ))}
        </section>
        <div className="profileSaveArea">{error&&<p className="formError" role="alert">{error}</p>}{message&&<p className="formSuccess" role="status">{message}</p>}<button className="primaryButton" type="submit" disabled={saving}>{saving?'Saving…':'Save profile'}</button></div>
      </form>
      <footer className="profileFooter"><Link href="/about">About NelaPost</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link></footer>
    </div>
    <style jsx>{`
      .profilePage,.profileLoading{min-height:100svh;background:#f6f9f7;color:#202720;font-family:Inter,Arial,sans-serif;padding:24px 16px 40px;box-sizing:border-box}.profileLoading{display:grid;place-items:center}.profileLoading span{width:24px;height:24px;border:2px solid #dce6df;border-top-color:#087f5b;border-radius:50%;animation:spin .7s linear infinite}
      .profileWrap{max-width:1000px;margin:0 auto}.profileTop{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:28px}.profileBrand{color:#087f5b;text-decoration:none;font-size:22px;font-weight:800;letter-spacing:-.7px}.backLink,.profileFooter a{color:#087f5b;text-decoration:none;font-size:13px;font-weight:650}
      .accountTabs{display:flex;gap:6px;padding:5px;background:#eaf1ec;border-radius:12px;width:max-content;margin-bottom:28px}.accountTabs a{padding:10px 18px;border-radius:8px;color:#58665d;text-decoration:none;font-size:12px;font-weight:750}.accountTabs a[aria-current=page]{background:#fff;color:#087f5b;box-shadow:0 2px 7px #1d33240b}
      .profileIntro{display:flex;align-items:center;gap:18px;margin-bottom:26px}.eyebrow{font-size:10px;font-weight:800;letter-spacing:.17em;color:#087f5b;margin:0 0 7px}h1{font-size:clamp(28px,4vw,38px);letter-spacing:-1.2px;line-height:1.12;margin:0 0 8px}.profileIntro p:last-child{margin:0;color:#667169;font-size:14px;line-height:1.6}
      .profileGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;align-items:start}.profileCard{background:#fff;border:1px solid #e1e9e3;border-radius:17px;padding:clamp(18px,3vw,26px);box-shadow:0 10px 28px #1d33240a;min-width:0}.sectionHeading h2{font-size:18px;letter-spacing:-.4px;margin:0 0 6px}.sectionHeading p{font-size:12px;color:#758078;margin:0 0 22px;line-height:1.6}
      .profileForm{display:grid;gap:14px}.profileForm label{display:grid;gap:7px;font-size:12px;font-weight:700;color:#3e4c42}.profileForm input{width:100%;min-width:0;box-sizing:border-box;border:1px solid #dce4de;border-radius:9px;padding:12px 13px;font:400 14px Inter,Arial,sans-serif;color:#202720;background:#fff;outline:none}.profileForm input:focus{border-color:#087f5b;box-shadow:0 0 0 3px #087f5b15}.profileForm input[readonly]{background:#f7f9f7;color:#69746c}.fieldNote{font-size:11px;line-height:1.5;color:#7b857d;margin:-6px 0 0}
      .avatarPreview{display:flex;align-items:center;gap:15px;padding:14px;background:#f8fbf9;border:1px solid #edf2ee;border-radius:13px;margin-bottom:22px}.avatarPreview strong{font-size:13px}.avatarPreview p{font-size:11px;line-height:1.55;color:#758078;margin:5px 0 0}
      .choiceGroup{border:0;border-top:1px solid #edf0ed;padding:15px 0 0;margin:0 0 14px;min-width:0}.choiceGroup legend{padding:0 0 10px;font-size:12px;font-weight:800;color:#354238}.choiceOptions{display:flex;flex-wrap:wrap;gap:7px}.choice{display:inline-flex;align-items:center;gap:7px;min-height:38px;border:1px solid #dfe7e1;background:#fff;color:#3c4940;border-radius:9px;padding:8px 10px;font-size:11px;font-weight:650}.choice.selected{border-color:#087f5b;background:#edf8f1;color:#075b43;box-shadow:0 0 0 1px #087f5b20}.colourDot{width:15px;height:15px;border-radius:50%;border:1px solid #00000015;background:#087f5b}.colourDot.warm{background:#C9855B}.colourDot.deep{background:#70432F}.colourDot.rich{background:#4A2C24}.colourDot.golden{background:#E2AC78}.colourDot.fair{background:#F0C8A4}.colourDot.rose{background:#D99B83}.colourDot.green{background:#087F5B}.colourDot.blue{background:#3768A8}.colourDot.purple{background:#7652A5}.colourDot.orange{background:#D97736}.colourDot.pink{background:#C65D85}.colourDot.black{background:#30343B}.colourDot.mint{background:#DDF2E7}.colourDot.sky{background:#DCEBFA}.colourDot.lilac{background:#EAE2F7}.colourDot.peach{background:#F9E4D6}.colourDot.lemon{background:#F5F0C9}.colourDot.slate{background:#E5E9ED}
      .hairSample{width:15px;height:15px;border-radius:50%;background:#33251F;display:inline-block}.hairSample.short{border-radius:8px 8px 4px 4px;height:11px}.hairSample.long{border-radius:8px 8px 3px 3px;height:15px}.hairSample.curly{border-radius:40%;box-shadow:3px -2px 0 #6c4b39,-3px -1px 0 #6c4b39}.hairSample.coils{border-radius:50%;box-shadow:3px -2px 0 #6c4b39,-3px -1px 0 #6c4b39,0 -4px 0 #6c4b39}
      .profileSaveArea{grid-column:1/-1;display:flex;align-items:center;justify-content:flex-end;gap:12px;flex-wrap:wrap}.primaryButton{display:inline-flex;align-items:center;justify-content:center;border:1px solid #087f5b;border-radius:9px;padding:12px 17px;background:#087f5b;color:#fff;font-size:12px;font-weight:750;cursor:pointer;white-space:nowrap}.primaryButton:disabled{opacity:.6;cursor:wait}.formError,.formSuccess{font-size:12px;line-height:1.5;margin:0;padding:10px 12px;border-radius:8px}.formError{color:#9f2525;background:#fff0f0}.formSuccess{color:#176b48;background:#eaf7ef}.profileFooter{display:flex;gap:20px;flex-wrap:wrap;margin-top:24px;padding-top:18px;border-top:1px solid #e1e9e3}
      @keyframes spin{to{transform:rotate(360deg)}}@media(max-width:760px){.profileGrid{grid-template-columns:1fr}.profileTop{margin-bottom:24px}.profileIntro{align-items:flex-start}.profileCard{border-radius:14px}.profileSaveArea{justify-content:stretch}.profileSaveArea .primaryButton{width:100%}}@media(prefers-reduced-motion:reduce){.profileLoading span{animation:none}}
    `}</style>
  </main>
}
