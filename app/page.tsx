'use client'

import Link from 'next/link'

const cardStyle:React.CSSProperties={border:'1px solid #e5e7eb',borderRadius:20,padding:28,background:'#fff',boxShadow:'0 12px 36px rgba(20,24,35,.06)',display:'flex',flexDirection:'column',minHeight:260}
const buttonStyle:React.CSSProperties={display:'inline-flex',alignItems:'center',justifyContent:'center',borderRadius:10,padding:'12px 16px',fontWeight:700,fontSize:14,textDecoration:'none',width:'100%',boxSizing:'border-box'}

export default function Home(){
 return <main style={{minHeight:'100vh',background:'linear-gradient(180deg,#f7fbf8 0%,#f7f7fa 48%,#f5f6fa 100%)',color:'#171923',fontFamily:'Inter,Arial,sans-serif',padding:'32px 20px',boxSizing:'border-box'}}>
  <div style={{maxWidth:1000,margin:'0 auto'}}>
   <header style={{display:'flex',alignItems:'center',gap:12,marginBottom:72}}>
    <img src="/logo-mark.svg" alt="" width="48" height="48" style={{borderRadius:13,display:'block'}}/>
    <div><div style={{fontSize:24,fontWeight:800,letterSpacing:'-0.8px',color:'#087F5B'}}>NelaPost</div><div style={{fontSize:12,color:'#777383',marginTop:3}}>Free and open-source tools for getting things done</div></div>
   </header>
   <section style={{maxWidth:720,marginBottom:38}}>
    <p style={{fontSize:12,letterSpacing:2,fontWeight:800,color:'#087F5B',margin:'0 0 12px'}}>YOUR WORKSPACE STARTS HERE</p>
    <h1 style={{fontSize:'clamp(36px,7vw,60px)',lineHeight:1.04,letterSpacing:'-2.2px',margin:'0 0 18px'}}>Meet NelaPost.</h1>
    <p style={{fontSize:18,lineHeight:1.7,color:'#626672',margin:0}}>A growing set of practical tools for business, creativity and your next opportunity. Choose where you want to start.</p>
   </section>
   <section aria-label="Choose a workspace" style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,280px),1fr))',gap:18}}>
    <article style={cardStyle}>
     <div style={{width:46,height:46,borderRadius:13,background:'#e8f5ef',color:'#087F5B',display:'grid',placeItems:'center',fontSize:24,marginBottom:20}}>▣</div>
     <h2 style={{fontSize:23,letterSpacing:'-.6px',margin:'0 0 10px'}}>Business Tools</h2>
     <p style={{fontSize:14,lineHeight:1.7,color:'#686575',margin:'0 0 24px',flex:1}}>Manage sales, products and stock, expenses, reports and customer invoices in one workspace.</p>
     <Link href="/business" style={{...buttonStyle,background:'#087F5B',color:'#fff'}}>Open Business Tools <span aria-hidden="true" style={{marginLeft:8}}>→</span></Link>
    </article>
    <article style={{...cardStyle,background:'#fbfbfc',borderStyle:'dashed'}}>
     <div style={{width:46,height:46,borderRadius:13,background:'#f0f1f4',color:'#777383',display:'grid',placeItems:'center',fontSize:24,marginBottom:20}}>◷</div>
     <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:10,flexWrap:'wrap'}}>
      <h2 style={{fontSize:23,letterSpacing:'-.6px',margin:0}}>Social Publishing</h2>
      <span style={{fontSize:10,fontWeight:800,letterSpacing:'.8px',borderRadius:99,padding:'6px 9px',background:'#f0f1f4',color:'#686575'}}>COMING SOON</span>
     </div>
     <p style={{fontSize:14,lineHeight:1.7,color:'#777383',margin:'14px 0 24px',flex:1}}>We’re working on this part of NelaPost. Social publishing isn’t available yet, but it’s on the roadmap.</p>
     <div style={{...buttonStyle,background:'#f0f1f4',color:'#8a8d97',cursor:'not-allowed'}} aria-disabled="true">Under development</div>
    </article>
    <article style={cardStyle}>
     <div style={{width:46,height:46,borderRadius:13,background:'#edf4ff',color:'#1769e0',display:'grid',placeItems:'center',fontSize:24,marginBottom:20}}>▤</div>
     <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:10,flexWrap:'wrap'}}>
      <h2 style={{fontSize:23,letterSpacing:'-.6px',margin:0}}>CV Studio</h2>
      <span style={{fontSize:10,fontWeight:800,letterSpacing:'.8px',borderRadius:99,padding:'6px 9px',background:'#e8f5ef',color:'#087F5B'}}>FREE</span>
     </div>
     <p style={{fontSize:14,lineHeight:1.7,color:'#686575',margin:'14px 0 24px',flex:1}}>Build a professional, ATS-friendly CV with three styles, practical writing guidance and PDF or Word exports.</p>
     <Link href="/cv-studio" style={{...buttonStyle,background:'#087F5B',color:'#fff'}}>Open CV Studio <span aria-hidden="true" style={{marginLeft:8}}>→</span></Link>
    </article>
   </section>
   <footer style={{marginTop:54,paddingTop:18,borderTop:'1px solid #e4e5eb',display:'flex',justifyContent:'space-between',gap:12,flexWrap:'wrap',fontSize:11,color:'#8b8e99'}}>
    <span>© {new Date().getFullYear()} NelaPost</span><span>Useful tools, built one step at a time.</span>
   </footer>
  </div>
 </main>
}