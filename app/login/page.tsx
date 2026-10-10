'use client'

import {FormEvent,useState} from 'react'
import {useRouter} from 'next/navigation'
import {createClient} from '../../lib/supabase-browser'

const SITE_URL=process.env.NEXT_PUBLIC_SITE_URL||'https://nelapost.onrender.com'

export default function Login(){
 const router=useRouter()
 const supabase=createClient()
 const [mode,setMode]=useState<'login'|'signup'>('login')
 const [email,setEmail]=useState('')
 const [password,setPassword]=useState('')
 const [showPassword,setShowPassword]=useState(false)
 const [verified,setVerified]=useState(false)
 const [busy,setBusy]=useState(false)
 const [message,setMessage]=useState('')
 const [error,setError]=useState('')

 const submit=async(e:FormEvent)=>{
  e.preventDefault();setBusy(true);setError('');setMessage('');setVerified(false)
  try{
   if(mode==='login'){
    const {error}=await supabase.auth.signInWithPassword({email,password})
    if(error)throw error
    setVerified(true)
    setMessage('Credentials verified. Taking you to your workspace…')
    router.replace('/workspace')
    router.refresh()
   }else{
    const {data,error}=await supabase.auth.signUp({email,password,options:{emailRedirectTo:SITE_URL+'/auth/callback'}})
    if(error)throw error
    if(data.session){setVerified(true);setMessage('Account created. Taking you to your workspace…');router.replace('/workspace');router.refresh()}
    else setMessage('NelaPost has created your account. Check your email to confirm your account, then return to NelaPost to sign in.')
   }
  }catch(err:any){
   const raw=String(err?.message||'')
   setError(mode==='login'&&/invalid login credentials|invalid credentials|email or password/i.test(raw)?'😕 Those details don’t match our records. Check your email and password and try again, or choose Forgot Password.':raw||'We couldn’t sign you in. Please try again.')
  }finally{setBusy(false)}
 }

 return <main className="loginPage">
  <section className="loginCard">
   <div className="loginLogo"><img src="/logo-mark.svg" alt="NelaPost" /></div>
   <div className="loginBrand">NELAPOST</div>
   <h1>{mode==='login'?'Welcome back':'Create your account'}</h1>
   <p>NelaPost requires authentication. Sign in to manage your social publishing.</p>
   <p className="loginAuthNote">Authentication is securely handled by Supabase. NelaPost never asks you to enter your social-media passwords here.</p>
   <form onSubmit={submit}>
    <label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" required /></label>
    <label>Password<span className="passwordInputWrap"><input type={showPassword?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Your password" autoComplete={mode==='login'?'current-password':'new-password'} minLength={6} required /><button type="button" className="passwordToggle" aria-label={showPassword?'Hide password':'Show password'} title={showPassword?'Hide password':'Show password'} onClick={()=>setShowPassword(v=>!v)}>{showPassword?<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.9 5.2A10.8 10.8 0 0112 5c5.3 0 9 5.2 9 7a8.8 8.8 0 01-2.1 3.2M6.2 6.2C4.1 7.5 3 10 3 12c0 1.8 3.7 7 9 7 1.3 0 2.5-.3 3.5-.8" /></svg>:<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.2-6.5 9.5-6.5 9.5 6.5 9.5 6.5-3.2 6.5-9.5 6.5S2.5 12 2.5 12z"/><circle cx="12" cy="12" r="2.7"/></svg>}</button></span></label>
    {error&&<div className="loginError"><span className="loginSadIcon" aria-hidden="true">☹</span><span>{error.replace(/^😕\s*/, '')}</span></div>}
    {message&&<div className={verified?'loginMessage loginVerified':'loginMessage'}>{verified&&<span className="loginSuccessIcon" aria-hidden="true">✓</span>}{message}</div>}
    <button className="loginButton" disabled={busy}>{busy&&<span className="loginSpinner" aria-hidden="true"></span>}{busy?(mode==='login'?'Checking your details…':'Creating your account…'):(mode==='login'?'Sign in':'Create account')}</button>
   </form>
   {mode==='login'&&<a className="forgotPasswordLink" href="/forgot-password">Forgot Password?</a>}
   <div className="loginLegal"><a href="/privacy">Privacy Policy</a><span>·</span><a href="/terms">Terms of Service</a></div>
   <button className="loginSwitch" onClick={()=>{setMode(mode==='login'?'signup':'login');setError('');setMessage('')}}>{mode==='login'?"Don't have an account? Create one":"Already have an account? Sign in"}</button>
  </section>
 </main>
}
