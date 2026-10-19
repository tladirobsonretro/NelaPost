'use client'

import Link from 'next/link'

export default function AboutPage(){
 return <main style={{minHeight:'100vh',background:'#f6f8f6',padding:'32px 18px',display:'flex',alignItems:'center',justifyContent:'center',color:'#202720'}}>
  <section style={{width:'100%',maxWidth:640,background:'#fff',border:'1px solid #e3e8e4',borderRadius:18,padding:'clamp(24px,5vw,44px)',boxShadow:'0 12px 36px rgba(20,40,28,.06)'}}>
   <Link href="/login" style={{display:'inline-flex',alignItems:'center',gap:8,color:'#176b48',fontSize:14,fontWeight:600,textDecoration:'none',marginBottom:28}}>← Back to sign in</Link>
   <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:28}}>
    <img src="/logo-mark.svg" alt="NelaPost" width="42" height="42"/>
    <span style={{fontSize:14,fontWeight:800,letterSpacing:'.16em'}}>NELAPOST</span>
   </div>
   <p style={{fontSize:12,fontWeight:700,letterSpacing:'.14em',textTransform:'uppercase',color:'#176b48',margin:'0 0 10px'}}>About</p>
   <h1 style={{fontSize:'clamp(30px,5vw,42px)',lineHeight:1.12,letterSpacing:'-.04em',margin:'0 0 16px'}}>Create. Manage. Grow.</h1>
   <p style={{fontSize:16,lineHeight:1.75,color:'#59645d',margin:'0 0 30px'}}>NelaPost is a software platform designed to help people and businesses manage their digital work through a growing set of practical tools.</p>
   <div style={{borderTop:'1px solid #e3e8e4',paddingTop:24}}>
    <h2 style={{fontSize:20,margin:'0 0 10px'}}>Who operates NelaPost?</h2>
    <p style={{fontSize:15,lineHeight:1.75,color:'#59645d',margin:'0 0 18px'}}>NelaPost is currently operated by <strong style={{color:'#202720'}}>Tladi Lisene</strong> as an individual and is not yet a separate registered company.</p>
    <div style={{display:'grid',gap:12,fontSize:14,lineHeight:1.6}}>
     <div><strong style={{display:'block',marginBottom:2}}>Email</strong><a href="mailto:tladirobson@gmail.com" style={{color:'#176b48',overflowWrap:'anywhere'}}>tladirobson@gmail.com</a></div>
     <div><strong style={{display:'block',marginBottom:2}}>Telephone</strong><a href="tel:0677274424" style={{color:'#176b48'}}>067 727 4424</a></div>
     <div><strong style={{display:'block',marginBottom:2}}>Website</strong><a href="https://nelapost.onrender.com" style={{color:'#176b48',overflowWrap:'anywhere'}}>nelapost.onrender.com</a></div>
    </div>
   </div>
   <div style={{display:'flex',flexWrap:'wrap',gap:16,borderTop:'1px solid #e3e8e4',marginTop:28,paddingTop:20,fontSize:13}}>
    <Link href="/privacy" style={{color:'#176b48'}}>Privacy Policy</Link>
    <Link href="/terms" style={{color:'#176b48'}}>Terms of Service</Link>
   </div>
  </section>
 </main>
}
