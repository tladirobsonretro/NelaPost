'use client'

import Link from 'next/link'
import {FormEvent,useEffect,useMemo,useState} from 'react'
import {useRouter} from 'next/navigation'
import {createClient} from '../../lib/supabase-browser'

type ProfileForm={firstName:string;lastName:string;phone:string}

export default function ProfilePage(){
 const router=useRouter()
 const supabase=createClient()
 const [email,setEmail]=useState('')
 const [form,setForm]=useState<ProfileForm>({firstName:'',lastName:'',phone:''})
 const [loading,setLoading]=useState(true)
 const [saving,setSaving]=useState(false)
 const [message,setMessage]=useState('')
 const [error,setError]=useState('')
 const [loadError,setLoadError]=useState('')

 useEffect(()=>{
  let active=true
  supabase.auth.getUser().then(({data,error:authError})=>{
   if(!active)return
   if(authError){setLoadError('We could not load your account details. Please refresh the page and try again.');setLoading(false);return}
   if(!data.user){router.replace('/login');return}
   const user=data.user
   setEmail(user.email||'')
   setForm({firstName:String(user.user_metadata?.first_name||''),lastName:String(user.user_metadata?.last_name||''),phone:String(user.user_metadata?.phone||'')})
   setLoading(false)
  }).catch(()=>{
   if(!active)return
   setLoadError('We could not connect to your account. Check your connection and refresh the page.')
   setLoading(false)
  })
  return()=>{active=false}
 },[router])

 const initials=useMemo(()=>`${form.firstName.trim().charAt(0)}${form.lastName.trim().charAt(0)}`.trim().toUpperCase()||email.trim().charAt(0).toUpperCase()||'N',[form.firstName,form.lastName,email])

 const saveProfile=async(e:FormEvent)=>{
  e.preventDefault();setSaving(true);setMessage('');setError('')
  try{
   const {error}=await supabase.auth.updateUser({data:{first_name:form.firstName.trim(),last_name:form.lastName.trim(),phone:form.phone.trim()}})
   if(error)throw error
   setMessage('Your profile has been updated.')
  }catch(err){
   setError(err instanceof Error?err.message:'We could not save your profile. Please try again.')
  }finally{setSaving(false)}
 }

 const signOut=async()=>{await supabase.auth.signOut();router.replace('/login');router.refresh()}

 if(loading)return <main className="profileLoading" aria-label="Loading profile"><span/></main>
 if(loadError)return <main className="profilePage"><div className="profileWrap"><section className="profileCard"><h1>Profile unavailable</h1><p role="alert">{loadError}</p><button type="button" className="primaryButton" onClick={()=>window.location.reload()}>Try again</button><p><Link href="/workspace" className="backLink">Back to workspace</Link></p></section></div></main>

 return <main className="profilePage">
  <div className="profileWrap">
   <header className="profileTop">
    <Link href="/" className="profileBrand"><img src="/logo-mark.svg" alt=""/> <span>NelaPost</span></Link>
    <Link href="/" className="backLink">Back to tools</Link>
   </header>
   <section className="profileIntro">
    <div className="avatar" aria-label="Profile initials">{initials}</div>
    <div><p className="eyebrow">YOUR ACCOUNT</p><h1>Profile & Settings</h1><p>Manage your details and account preferences.</p></div>
   </section>
   <div className="profileGrid">
    <section className="profileCard">
     <div className="sectionHeading"><h2>Personal details</h2><p>Keep your account information up to date.</p></div>
     <form onSubmit={saveProfile} className="profileForm">
      <label>First name<input autoComplete="given-name" value={form.firstName} onChange={e=>setForm({...form,firstName:e.target.value})} maxLength={80} required/></label>
      <label>Surname<input autoComplete="family-name" value={form.lastName} onChange={e=>setForm({...form,lastName:e.target.value})} maxLength={80} required/></label>
      <label>Mobile number<input autoComplete="tel" type="tel" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} maxLength={30}/></label>
      <label>Email address<input type="email" value={email} readOnly aria-describedby="email-note"/></label>
      <p id="email-note" className="fieldNote">Your sign-in email is shown here. Contact support if you need to change it.</p>
      {error&&<p className="formError" role="alert">{error}</p>}
      {message&&<p className="formSuccess" role="status">{message}</p>}
      <button className="primaryButton" type="submit" disabled={saving}>{saving?'Saving…':'Save changes'}</button>
     </form>
    </section>
    <section className="profileCard">
     <div className="sectionHeading"><h2>Account settings</h2><p>Security and NelaPost preferences.</p></div>
     <div className="settingRow"><div><strong>Password & sign-in</strong><p>Reset your password securely through email.</p></div><Link href="/forgot-password" className="secondaryButton">Reset password</Link></div>
     <div className="settingRow"><div><strong>Usage & wallet</strong><p>Usage credits and paid tools are being prepared. No payments or customer balances are active yet.</p></div><span className="comingSoon">Coming soon</span></div>
     <div className="settingRow"><div><strong>Profile avatar</strong><p>Your initials are used as a simple profile avatar for now. Photo uploads can be added later.</p></div><span className="avatarMini">{initials}</span></div>
     <div className="signOutRow"><button type="button" className="secondaryButton" onClick={signOut}>Sign out</button></div>
    </section>
   </div>
   <footer className="profileFooter"><Link href="/about">About NelaPost</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link></footer>
  </div>
  <style jsx>{`
   .profilePage,.profileLoading{min-height:100svh;background:#f6f9f7;color:#202720;font-family:Inter,Arial,sans-serif;padding:24px 16px 40px;box-sizing:border-box}
   .profileLoading{display:grid;place-items:center}.profileLoading span{width:24px;height:24px;border:2px solid #dce6df;border-top-color:#087f5b;border-radius:50%;animation:spin .7s linear infinite}
   .profileWrap{max-width:980px;margin:0 auto}.profileTop{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:42px}
   .profileBrand{display:flex;align-items:center;gap:10px;color:#087f5b;text-decoration:none;font-size:22px;font-weight:800;letter-spacing:-.7px}.profileBrand img{width:40px;height:40px;border-radius:11px}
   .backLink,.profileFooter a{color:#087f5b;text-decoration:none;font-size:13px;font-weight:650}
   .profileIntro{display:flex;align-items:center;gap:18px;margin-bottom:28px}.avatar{width:66px;height:66px;flex:none;display:grid;place-items:center;border-radius:50%;background:#dff2e7;color:#087f5b;font-size:23px;font-weight:800;letter-spacing:-.5px}
   .eyebrow{font-size:10px;font-weight:800;letter-spacing:.17em;color:#087f5b;margin:0 0 7px}h1{font-size:clamp(28px,4vw,38px);letter-spacing:-1.2px;line-height:1.12;margin:0 0 8px}.profileIntro p:last-child{margin:0;color:#667169;font-size:14px;line-height:1.6}
   .profileGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;align-items:start}.profileCard{background:#fff;border:1px solid #e1e9e3;border-radius:17px;padding:clamp(18px,3vw,26px);box-shadow:0 10px 28px #1d33240a;min-width:0}
   .sectionHeading h2{font-size:18px;letter-spacing:-.4px;margin:0 0 6px}.sectionHeading p{font-size:12px;color:#758078;margin:0 0 22px;line-height:1.6}
   .profileForm{display:grid;gap:14px}.profileForm label{display:grid;gap:7px;font-size:12px;font-weight:700;color:#3e4c42}
   .profileForm input{width:100%;min-width:0;box-sizing:border-box;border:1px solid #dce4de;border-radius:9px;padding:12px 13px;font:400 14px Inter,Arial,sans-serif;color:#202720;background:#fff;outline:none}
   .profileForm input:focus{border-color:#087f5b;box-shadow:0 0 0 3px #087f5b15}.profileForm input[readonly]{background:#f7f9f7;color:#69746c}
   .fieldNote{font-size:11px;line-height:1.5;color:#7b857d;margin:-6px 0 0}
   .primaryButton,.secondaryButton{display:inline-flex;align-items:center;justify-content:center;gap:8px;border-radius:9px;padding:11px 14px;font-size:12px;font-weight:750;text-decoration:none;cursor:pointer;white-space:nowrap}
   .primaryButton{border:1px solid #087f5b;background:#087f5b;color:#fff;margin-top:3px}.primaryButton:disabled{opacity:.6;cursor:wait}.secondaryButton{border:1px solid #dce4de;background:#fff;color:#26382c}
   .settingRow{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:17px 0;border-top:1px solid #edf0ed}.settingRow strong{display:block;font-size:12px;margin-bottom:5px}.settingRow p{font-size:11px;line-height:1.6;color:#758078;margin:0}
   .comingSoon{font-size:10px;font-weight:750;color:#68756c;background:#f0f4f1;padding:7px 9px;border-radius:999px;white-space:nowrap}
   .avatarMini{width:34px;height:34px;flex:none;display:grid;place-items:center;border-radius:50%;background:#dff2e7;color:#087f5b;font-size:11px;font-weight:800}
   .signOutRow{border-top:1px solid #edf0ed;padding-top:17px;display:flex;justify-content:flex-end}
   .formError,.formSuccess{font-size:12px;line-height:1.5;margin:0;padding:10px 12px;border-radius:8px}.formError{color:#9f2525;background:#fff0f0}.formSuccess{color:#176b48;background:#eaf7ef}
   .profileFooter{display:flex;gap:20px;flex-wrap:wrap;margin-top:24px;padding-top:18px;border-top:1px solid #e1e9e3}
   @keyframes spin{to{transform:rotate(360deg)}}@media(max-width:700px){.profileGrid{grid-template-columns:1fr}.profileTop{margin-bottom:32px}.profileIntro{align-items:flex-start}.profileCard{border-radius:14px}}
   @media(prefers-reduced-motion:reduce){.profileLoading span{animation:none}}
  `}</style>
 </main>
}
