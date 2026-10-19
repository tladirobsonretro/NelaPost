'use client'

import Link from 'next/link'
import {useEffect,useState} from 'react'
import {useRouter} from 'next/navigation'
import {createClient} from '../../lib/supabase-browser'

function PublishIcon(){return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4h6v6M20 4 11 13"/><path d="M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5"/></svg>}
function BusinessIcon(){return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="4" width="17" height="16" rx="2.5"/><path d="M8 8h2M14 8h2M8 12h2M14 12h2M8 16h2M14 16h2"/></svg>}
function ArrowIcon(){return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>}

export default function Workspace(){
 const router=useRouter()
 const supabase=createClient()
 const [ready,setReady]=useState(false)
 const [email,setEmail]=useState('')
 useEffect(()=>{
  let active=true
  supabase.auth.getUser().then(({data})=>{
   if(!active)return
   if(!data.user){router.replace('/login');return}
   setEmail(data.user.email||'')
   setReady(true)
  })
  return()=>{active=false}
 },[])
 const signOut=async()=>{await supabase.auth.signOut();router.replace('/login');router.refresh()}
 if(!ready)return <main className="authLoading">Loading your workspace…</main>
 return <main className="workspacePage">
  <section className="workspaceWrap">
   <header className="workspaceBrand"><img src="/logo-mark.svg" alt=""/><span>NELAPOST</span></header>
   <div className="workspaceHeading">
    <p className="workspaceEyebrow">YOUR WORKSPACE</p>
    <h1>Where would you like to go?</h1>
    <p className="workspaceIntro">Choose what you want to focus on today.</p>
   </div>
   <nav className="workspaceChoices" aria-label="Choose a workspace">
    <Link href="/" className="workspaceChoice publishChoice">
     <span className="workspaceIcon"><PublishIcon/></span>
     <span className="workspaceChoiceCopy"><strong>Publish</strong><small>Create, schedule and manage your social posts.</small></span>
     <span className="workspaceArrow"><ArrowIcon/></span>
    </Link>
    <Link href="/business" className="workspaceChoice businessChoice">
     <span className="workspaceIcon"><BusinessIcon/></span>
     <span className="workspaceChoiceCopy"><strong>Business Tools</strong><small>Manage products, sales, expenses and your business team.</small></span>
     <span className="workspaceArrow"><ArrowIcon/></span>
    </Link>
   </nav>
   <footer className="workspaceFooter"><span className="workspaceEmail" title={email}>{email}</span><button onClick={signOut}>Sign out</button></footer>
  </section>
 </main>
}
