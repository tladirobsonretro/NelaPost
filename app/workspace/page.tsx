'use client'

import Link from 'next/link'
import {useEffect,useState} from 'react'
import {useRouter} from 'next/navigation'
import {createClient} from '../../lib/supabase-browser'

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
   <div className="workspaceBrand"><img src="/logo-mark.svg" alt="NelaPost"/><span>NELAPOST</span></div>
   <p className="workspaceEyebrow">YOUR WORKSPACE</p>
   <h1>Where would you like to go?</h1>
   <p className="workspaceIntro">Choose what you want to focus on today.</p>
   <div className="workspaceChoices">
    <Link href="/" className="workspaceChoice publishChoice"><span className="workspaceIcon">↗</span><span><strong>Publish</strong><small>Create, schedule and manage your social posts.</small></span><span className="workspaceArrow">→</span></Link>
    <Link href="/business" className="workspaceChoice businessChoice"><span className="workspaceIcon">▦</span><span><strong>Business Tools</strong><small>Manage products, sales, expenses and your business team.</small></span><span className="workspaceArrow">→</span></Link>
   </div>
   <footer className="workspaceFooter"><span>{email}</span><button onClick={signOut}>Sign out</button></footer>
  </section>
 </main>
}
