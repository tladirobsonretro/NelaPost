'use client'

import {FormEvent,useEffect,useState} from 'react'
import Link from 'next/link'
import {useRouter} from 'next/navigation'
import {createClient} from '../../lib/supabase-browser'

export default function ResetPassword(){
 const supabase=createClient()
 const router=useRouter()
 const [password,setPassword]=useState('')
 const [confirm,setConfirm]=useState('')
 const [ready,setReady]=useState(false)
 const [busy,setBusy]=useState(false)
 const [message,setMessage]=useState('')
 const [error,setError]=useState('')
 useEffect(()=>{
  let active=true
  supabase.auth.getSession().then(({data})=>{if(active)setReady(!!data.session)})
  const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,session)=>{if(active)setReady(!!session)})
  return()=>{active=false;subscription.unsubscribe()}
 },[])
 const submit=async(e:FormEvent)=>{
  e.preventDefault();setError('');setMessage('')
  if(password.length<6){setError('Use at least 6 characters for your new password.');return}
  if(password!==confirm){setError('The passwords do not match.');return}
  setBusy(true)
  try{
   const {error}=await supabase.auth.updateUser({password})
   if(error)throw error
   setMessage('Your password has been updated. You can continue to your workspace.')
   setTimeout(()=>router.replace('/workspace'),900)
  }catch(err:any){setError(err?.message||'This reset link may have expired. Request a new one and try again.')}finally{setBusy(false)}
 }
 return <main className="loginPage"><section className="loginCard">
  <div className="loginLogo"><img src="/logo-mark.svg" alt="NelaPost"/></div>
  <div className="loginBrand">NELAPOST</div>
  <h1>Choose a new password</h1>
  <p>Enter and confirm your new NelaPost password below.</p>
  {!ready?<div className="loginError">Your reset link is missing or has expired. Request a new password reset link to continue.</div>:<form onSubmit={submit}>
   <label>New password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="new-password" minLength={6} required/></label>
   <label>Confirm new password<input type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} autoComplete="new-password" minLength={6} required/></label>
   {error&&<div className="loginError">{error}</div>}
   {message&&<div className="loginMessage">{message}</div>}
   <button className="loginButton" disabled={busy}>{busy?'Updating password…':'Update password'}</button>
  </form>}
  <Link className="loginBackLink" href="/login">Back to sign in</Link>
 </section></main>
}
