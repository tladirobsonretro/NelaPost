'use client'

import {FormEvent,useState} from 'react'
import {useRouter} from 'next/navigation'
import {createClient} from '../../lib/supabase-browser'

export default function Login(){
 const router=useRouter()
 const supabase=createClient()
 const [mode,setMode]=useState<'login'|'signup'>('login')
 const [firstName,setFirstName]=useState('')
 const [surname,setSurname]=useState('')
 const [phone,setPhone]=useState('')
 const [email,setEmail]=useState('')
 const [password,setPassword]=useState('')
 const [showPassword,setShowPassword]=useState(false)
 const [verified,setVerified]=useState(false)
 const [busy,setBusy]=useState(false)
 const [message,setMessage]=useState('')
 const [error,setError]=useState('')
 const [termsAccepted,setTermsAccepted]=useState(false)
 const [signupComplete,setSignupComplete]=useState(false)

 const submit=async(e:FormEvent)=>{
  e.preventDefault();setBusy(true);setError('');setMessage('');setVerified(false);setSignupComplete(false)
  try{
   if(mode==='login'){
    const {error}=await supabase.auth.signInWithPassword({email,password})
    if(error)throw error
    setVerified(true)
    setMessage('You’re signed in. Taking you to your workspace…')
    router.replace('/workspace')
    router.refresh()
   }else{
    if(!termsAccepted)throw new Error('Please accept the Terms of Service and Privacy Policy to create your account.')
    if(!firstName.trim()||!surname.trim()||!phone.trim())throw new Error('Please enter your first name, surname and mobile number.')
    const {error}=await supabase.auth.signUp({email,password,options:{emailRedirectTo:window.location.origin+'/auth/callback?flow=email-confirmation',data:{first_name:firstName.trim(),last_name:surname.trim(),phone:phone.trim()}}})
    if(error)throw error
    setSignupComplete(true)
    setMessage('Please check your inbox and click the verification link in our email. Once your email is verified, come back here and sign in with your email address and password.')
    setPassword('')
   }
  }catch(err:any){
   const raw=String(err?.message||'')
   setError(mode==='login'&&/invalid login credentials|invalid credentials|email or password/i.test(raw)?'Those details don’t match our records. Check your email and password and try again, or choose Forgot Password.':raw||'We couldn’t complete that step. Please try again.')
  }finally{setBusy(false)}
 }

 const switchMode=(next:'login'|'signup')=>{
  setMode(next);setError('');setMessage('');setVerified(false);setSignupComplete(false);setTermsAccepted(false)
 }

 return <main className="loginPage">
  <section className="loginCard">
   <div className="loginLogo"><img src="/logo-mark.svg" alt="NelaPost" /></div>
   <div className="loginBrand">NELAPOST</div>
   <h1>{mode==='login'?'Welcome back':'Create your account'}</h1>
   <p>{mode==='login'?'Sign in to continue to your NelaPost workspace.':'A few quick details and you’re on your way.'}</p>
   <p className="loginAuthNote">Your NelaPost sign-in is handled securely by Supabase. We never ask for your social-media passwords.</p>
   <form onSubmit={submit}>
    {mode==='signup'&&<>
     <label>First name<input type="text" value={firstName} onChange={e=>setFirstName(e.target.value)} placeholder="Your first name" autoComplete="given-name" maxLength={80} required /></label>
     <label>Surname<input type="text" value={surname} onChange={e=>setSurname(e.target.value)} placeholder="Your surname" autoComplete="family-name" maxLength={80} required /></label>
     <label>Mobile number<input type="tel" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+27 82 123 4567" autoComplete="tel" inputMode="tel" minLength={7} maxLength={25} required /></label>
    </>}
    <label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" required /></label>
    <label>Password<span className="passwordInputWrap"><input type={showPassword?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder={mode==='signup'?'Create a password':'Your password'} autoComplete={mode==='login'?'current-password':'new-password'} minLength={6} required /><button type="button" className="passwordToggle" aria-label={showPassword?'Hide password':'Show password'} title={showPassword?'Hide password':'Show password'} onClick={()=>setShowPassword(v=>!v)}>{showPassword?<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.9 5.2A10.8 10.8 0 0112 5c5.3 0 9 5.2 9 7a8.8 8.8 0 01-2.1 3.2M6.2 6.2C4.1 7.5 3 10 3 12c0 1.8 3.7 7 9 7 1.3 0 2.5-.3 3.5-.8" /></svg>:<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.2-6.5 9.5-6.5 9.5 6.5 9.5 6.5-3.2 6.5-9.5 6.5S2.5 12 2.5 12z"/><circle cx="12" cy="12" r="2.7"/></svg>}</button></span></label>
    {mode==='signup'&&<label style={{display:'flex',alignItems:'flex-start',gap:9,margin:'15px 0',fontSize:11,lineHeight:1.6,color:'#525a54',fontWeight:400}}>
     <input type="checkbox" checked={termsAccepted} onChange={e=>setTermsAccepted(e.target.checked)} required style={{width:16,height:16,margin:'2px 0 0',flex:'0 0 16px'}} />
     <span>I have read and agree to the <a href="/terms" target="_blank" rel="noreferrer" style={{color:'#176b48',fontWeight:700}}>Terms of Service</a> and acknowledge the <a href="/privacy" target="_blank" rel="noreferrer" style={{color:'#176b48',fontWeight:700}}>Privacy Policy</a>.</span>
    </label>}
    {error&&<div className="loginError"><span className="loginSadIcon" aria-hidden="true">☹</span><span>{error}</span></div>}
    {message&&<div className={verified?'loginMessage loginVerified':'loginMessage'} role="status">{verified&&<span className="loginSuccessIcon" aria-hidden="true">✓</span>}{message}</div>}
    {!signupComplete&&<button className="loginButton" disabled={busy}>{busy&&<span className="loginSpinner" aria-hidden="true"></span>}{busy?(mode==='login'?'Signing you in…':'Creating your account…'):(mode==='login'?'Sign in':'Create account')}</button>}
   </form>
   {signupComplete&&<button type="button" className="loginButton" style={{marginTop:14}} onClick={()=>switchMode('login')}>Back to sign in</button>}
   {mode==='login'&&<a className="forgotPasswordLink" href="/forgot-password">Forgot Password?</a>}
   <div className="loginLegal"><a href="/about">About NelaPost</a><span>·</span><a href="/privacy">Privacy Policy</a><span>·</span><a href="/terms">Terms of Service</a></div>
   {!signupComplete&&<button className="loginSwitch" onClick={()=>switchMode(mode==='login'?'signup':'login')}>{mode==='login'?"Don't have an account? Create one":"Already have an account? Sign in"}</button>}
  </section>
 </main>
}
