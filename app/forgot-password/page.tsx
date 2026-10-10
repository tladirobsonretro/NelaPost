'use client'

import {FormEvent,useState} from 'react'
import Link from 'next/link'
import {createClient} from '../../lib/supabase-browser'

const SITE_URL=process.env.NEXT_PUBLIC_SITE_URL||'https://nelapost.onrender.com'

export default function ForgotPassword(){
 const supabase=createClient()
 const [email,setEmail]=useState('')
 const [busy,setBusy]=useState(false)
 const [message,setMessage]=useState('')
 const [error,setError]=useState('')
 const submit=async(e:FormEvent)=>{
  e.preventDefault();setBusy(true);setMessage('');setError('')
  try{
   const {error}=await supabase.auth.resetPasswordForEmail(email,{redirectTo:SITE_URL+'/reset-password'})
   if(error)throw error
   setMessage('If an account exists for that email, a password reset link is on its way. Check your inbox and spam folder.')
  }catch(err:any){setError(err?.message||'Could not request a password reset. Please try again.')}finally{setBusy(false)}
 }
 return <main className="loginPage"><section className="loginCard">
  <div className="loginLogo"><img src="/logo-mark.svg" alt="NelaPost"/></div>
  <div className="loginBrand">NELAPOST</div>
  <h1>Reset your password</h1>
  <p>Enter the email address associated with your NelaPost account and we’ll send you a reset link.</p>
  <form onSubmit={submit}>
   <label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" required/></label>
   {error&&<div className="loginError">{error}</div>}
   {message&&<div className="loginMessage">{message}</div>}
   <button className="loginButton" disabled={busy}>{busy?'Sending link…':'Send reset link'}</button>
  </form>
  <Link className="loginBackLink" href="/login">Back to sign in</Link>
 </section></main>
}
