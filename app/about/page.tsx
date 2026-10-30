'use client'

import Link from 'next/link'

const headingStyle = {fontSize:20,margin:'0 0 10px',letterSpacing:'-.02em'}
const paragraphStyle = {fontSize:15,lineHeight:1.8,color:'#59645d',margin:'0 0 16px'}
const sectionStyle = {borderTop:'1px solid #e3e8e4',paddingTop:24,marginTop:26}

export default function AboutPage(){
 return <main style={{minHeight:'100vh',background:'#f6f8f6',padding:'32px 18px',display:'flex',alignItems:'center',justifyContent:'center',color:'#202720'}}>
  <section style={{width:'100%',maxWidth:720,background:'#fff',border:'1px solid #e3e8e4',borderRadius:18,padding:'clamp(24px,5vw,44px)',boxShadow:'0 12px 36px rgba(20,40,28,.06)'}}>
   <Link href="/login" style={{display:'inline-flex',alignItems:'center',gap:8,color:'#176b48',fontSize:14,fontWeight:600,textDecoration:'none',marginBottom:28}}>← Back to sign in</Link>
   <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:28}}>
    <img src="/logo-mark.svg" alt="NelaPost" width="42" height="42"/>
    <span style={{fontSize:14,fontWeight:800,letterSpacing:'.16em'}}>NELAPOST</span>
   </div>
   <p style={{fontSize:12,fontWeight:700,letterSpacing:'.14em',textTransform:'uppercase',color:'#176b48',margin:'0 0 10px'}}>About</p>
   <h1 style={{fontSize:'clamp(30px,5vw,42px)',lineHeight:1.12,letterSpacing:'-.04em',margin:'0 0 16px'}}>Create. Manage. Grow.</h1>
   <p style={{fontSize:18,lineHeight:1.65,fontWeight:600,color:'#34443a',margin:'0 0 18px'}}>Good tools should help you move forward, not hold you back because you cannot afford them.</p>
   <p style={paragraphStyle}>NelaPost is a growing software platform built around a simple idea: everyone deserves access to practical tools that can help them create opportunities, manage their work and grow towards their goals, regardless of where they are financially.</p>
   <p style={paragraphStyle}>Whether you are starting a small business, building your professional profile, looking for your next job, preparing a business pitch or trying to make an existing business more sustainable, having useful tools can make a meaningful difference.</p>

   <div style={sectionStyle}>
    <h2 style={headingStyle}>Why NelaPost exists</h2>
    <p style={paragraphStyle}>The idea behind NelaPost came from a familiar frustration. When trying to use established platforms and software to create, manage and grow, I often found myself running into limitations. The tools were available and the possibilities were exciting, but accessing the features that could genuinely make a difference often came at a price.</p>
    <p style={paragraphStyle}>There is an understandable reason for that. Software companies have teams, technology and operating costs to support. But there is another side to the reality: what happens when you are still trying to get your business off the ground? When you are looking for your next job and need to present yourself professionally? When you have an idea, a proposal to prepare or a small operation to manage, but very little money available for expensive subscriptions?</p>
    <p style={paragraphStyle}>You still need to create. You still need to plan. You still need to present yourself well. And you still need opportunities to grow.</p>
    <p style={{...paragraphStyle,marginBottom:0}}><strong style={{color:'#202720'}}>NelaPost was created to help bridge some of that gap.</strong> It is not about replacing every established platform or promising enterprise-level solutions at no cost. It is about making useful, accessible tools available to people who need a helping hand along the way.</p>
   </div>

   <div style={sectionStyle}>
    <h2 style={headingStyle}>Tools for the journey</h2>
    <p style={paragraphStyle}>NelaPost is being developed as a growing collection of practical tools for different stages of personal, professional and business growth.</p>
    <div style={{display:'grid',gap:18}}>
     <div>
      <h3 style={{fontSize:16,margin:'0 0 6px'}}>Business Tools</h3>
      <p style={{...paragraphStyle,margin:0}}>Keep a closer eye on your business finances. Record income and expenses, track spending and review performance over time. Build a clearer picture of where money is going, where your business is doing well and where there may be room to improve.</p>
     </div>
     <div>
      <h3 style={{fontSize:16,margin:'0 0 6px'}}>Social Publishing</h3>
      <p style={{...paragraphStyle,margin:0}}>Get support with planning and managing social content. Use practical guidance to publish more consistently, communicate clearly and make better use of your online presence.</p>
     </div>
     <div>
      <h3 style={{fontSize:16,margin:'0 0 6px'}}>CV Studio and Professional Tools</h3>
      <p style={{...paragraphStyle,margin:0}}>Build a stronger professional profile, improve how you present your experience and prepare for new opportunities. Access tools that can help you put your best foot forward when pursuing your next role.</p>
     </div>
     <div>
      <h3 style={{fontSize:16,margin:'0 0 6px'}}>More tools as we grow</h3>
      <p style={{...paragraphStyle,margin:0}}>The platform will continue to expand into useful areas of everyday business and professional life, bringing together tools that help turn ideas into action, keep work organised and support steady progress.</p>
     </div>
    </div>
   </div>

   <div style={sectionStyle}>
    <h2 style={headingStyle}>Practical tools. Real progress.</h2>
    <p style={paragraphStyle}>We know that tools alone cannot build a business, secure a job or guarantee success. They cannot replace experience, hard work, sound decisions or the determination to keep going.</p>
    <p style={paragraphStyle}>But they can make the journey a little easier. They can help you understand your numbers, improve your presentation, organise your work, communicate with customers and recognise opportunities to do things better.</p>
    <p style={paragraphStyle}>NelaPost is not here to tell you that success comes from an app. It is here to give you a few more tools to help you work towards it. Our tools are designed to provide practical support and are not a substitute for qualified financial, legal or other professional advice where that is needed.</p>
    <p style={{...paragraphStyle,marginBottom:0}}>We are building as we learn, improving as we grow and adding features with practical needs in mind.</p>
    <p style={{fontSize:17,fontWeight:700,color:'#176b48',margin:'18px 0 0'}}>Start where you are. Use what you have. Keep building.</p>
   </div>

   <div style={sectionStyle}>
    <h2 style={headingStyle}>Who is behind NelaPost?</h2>
    <p style={{...paragraphStyle,marginBottom:18}}>NelaPost is independently owned and operated by <strong style={{color:'#202720'}}>Tladi Lisene</strong>.</p>
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
