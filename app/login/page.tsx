'use client'

import {FormEvent,useState} from 'react'
import {useRouter} from 'next/navigation'
import {createClient} from '../../lib/supabase-browser'

export default function Login(){
 const router=useRouter()
 const supabase=createClient()
 const [mode,setMode]=useState<'login'|'signup'>('login')
 const [email,setEmail]=useState('')
 const [password,setPassword]=useState('')
 const [busy,setBusy]=useState(false)
 const [message,setMessage]=useState('')
 const [error,setError]=useState('')

 const submit=async(e:FormEvent)=>{
  e.preventDefault();setBusy(true);setError('');setMessage('')
  try{
   if(mode==='login'){
    const {error}=await supabase.auth.signInWithPassword({email,password})
    if(error)throw error
    router.replace('/')
    router.refresh()
   }else{
    const {data,error}=await supabase.auth.signUp({email,password,options:{emailRedirectTo:window.location.origin+'/auth/callback'}})
    if(error)throw error
    if(data.session){router.replace('/');router.refresh()}
    else setMessage('Account created. Check your email to confirm your account, then sign in.')
   }
  }catch(err:any){setError(err?.message||'Authentication failed.')}finally{setBusy(false)}
 }

 return <main className="loginPage">
  <section className="loginCard">
   <div className="loginLogo"><img src="/logo-mark.svg" alt="NelaPost" /></div>
   <div className="loginBrand">NELAPOST</div>
   <h1>{mode==='login'?'Welcome back':'Create your account'}</h1>
   <p>{mode==='login'?'Sign in to manage your social publishing.':'Create your NelaPost account to start publishing.'}</p>
   <form onSubmit={submit}>
    <label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" required /></label>
    <label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Your password" autoComplete={mode==='login'?'current-password':'new-password'} minLength={6} required /></label>
    {error&&<div className="loginError">{error}</div>}
    {message&&<div className="loginMessage">{message}</div>}
    <button className="loginButton" disabled={busy}>{busy?(mode==='login'?'Signing in…':'Creating account…'):(mode==='login'?'Sign in':'Create account')}</button>
   </form>
   <button className="loginSwitch" onClick={()=>{setMode(mode==='login'?'signup':'login');setError('');setMessage('')}}>{mode==='login'?"Don't have an account? Create one":"Already have an account? Sign in"}</button>
  </section>
 </main>
}
