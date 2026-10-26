'use client'

import Link from 'next/link'
import {useEffect,useState} from 'react'
import {useRouter} from 'next/navigation'
import {createClient} from '../../lib/supabase-browser'
import DailyMotivation from '../../components/DailyMotivation'

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

 if(!ready)return <main className="portalLoading" aria-label="Loading workspace"><span /></main>

 return <main className="portalPage">
  <section className="portalWrap" aria-labelledby="portal-title">
   <header className="portalBrand">
    <img src="/logo-mark.svg" alt="NelaPost logo" />
    <h1 id="portal-title">NelaPost</h1>
    <p>Create. Manage. Grow.</p>
   </header>
   <div className="portalHeading">
    <span>YOUR WORKSPACE</span>
    <h2>Where would you like to go?</h2>
   </div>
   <DailyMotivation compact />
   <nav className="portalChoices" aria-label="Choose a workspace">
    <Link href="/" className="portalChoice portalChoiceSocial">
     <span className="portalChoiceName">Social</span>
     <span className="portalChoiceDescription">Create and manage your social content</span>
    </Link>
    <Link href="/business" className="portalChoice portalChoiceBusiness">
     <span className="portalChoiceName">Business Tool</span>
     <span className="portalChoiceDescription">Manage sales, stock and business records</span>
    </Link>
   </nav>
   <footer className="portalFooter">
    <span className="portalEmail" title={email}>{email}</span>
    <button onClick={signOut}>Sign out</button>
   </footer>
  </section>
  <style jsx>{`
   .portalPage{min-height:100svh;display:grid;place-items:center;padding:32px 20px;background:#fafafa;color:#111}
   .portalWrap{width:min(100%,660px);padding:clamp(24px,5vw,42px);background:#fff;border:1px solid #e9e9e9;border-radius:18px;box-shadow:0 20px 70px #00000007}
   .portalBrand{display:flex;align-items:center;flex-direction:column;text-align:center}
   .portalBrand img{width:62px;height:62px;border-radius:14px;display:block}
   .portalBrand h1{margin:16px 0 0;font-size:34px;line-height:1.1;font-weight:750;letter-spacing:-1.5px}
   .portalBrand p{margin:8px 0 0;color:#777;font-size:11px;letter-spacing:.12em}
   .portalHeading{margin:48px 0 20px;text-align:center}
   .portalHeading>span{font-size:9px;font-weight:750;letter-spacing:.2em;color:#888}
   .portalHeading h2{margin:10px 0 0;font-size:21px;line-height:1.3;font-weight:600;letter-spacing:-.55px}
   .portalChoices{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:13px}
   .portalChoice{min-height:130px;padding:22px;border:1px solid #111;border-radius:12px;display:flex;flex-direction:column;justify-content:center;gap:9px;text-decoration:none;transition:transform .16s ease,box-shadow .16s ease,border-color .16s ease}
   .portalChoice:hover{transform:translateY(-2px);box-shadow:0 10px 26px #00000010}
   .portalChoice:focus-visible,.portalFooter button:focus-visible{outline:3px solid #777;outline-offset:4px}
   .portalChoiceSocial{background:#111;color:#fff}
   .portalChoiceBusiness{background:#fff;color:#111}
   .portalChoiceName{font-size:18px;font-weight:650;letter-spacing:-.35px}
   .portalChoiceDescription{font-size:11px;line-height:1.6;color:#bdbdbd}
   .portalChoiceBusiness .portalChoiceDescription{color:#777}
   .portalFooter{display:flex;align-items:center;justify-content:space-between;gap:14px;margin-top:26px;padding-top:17px;border-top:1px solid #eee;color:#888;font-size:11px}
   .portalEmail{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
   .portalFooter button{border:1px solid #e5e5e5;border-radius:8px;background:#fff;color:#222;padding:9px 12px;font-size:11px;font-weight:650}
   .portalFooter button:hover{background:#f6f6f6;border-color:#cfcfcf}
   .portalLoading{min-height:100svh;display:grid;place-items:center;background:#fafafa}
   .portalLoading span{width:22px;height:22px;border:2px solid #ddd;border-top-color:#111;border-radius:50%;animation:portalSpin .7s linear infinite}
   @keyframes portalSpin{to{transform:rotate(360deg)}}
   @media(max-width:560px){.portalPage{padding:20px 14px}.portalWrap{padding:25px 18px;border-radius:15px}.portalBrand img{width:56px;height:56px}.portalBrand h1{font-size:30px}.portalHeading{margin:38px 0 18px}.portalHeading h2{font-size:19px}.portalChoices{grid-template-columns:1fr;gap:10px}.portalChoice{min-height:96px;padding:18px 19px}.portalChoiceName{font-size:17px}.portalFooter{margin-top:21px}}
   @media(prefers-reduced-motion:reduce){.portalChoice,.portalLoading span{animation:none;transition:none}.portalChoice:hover{transform:none}}
  `}</style>
 </main>
}
