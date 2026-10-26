'use client'

import {useMemo} from 'react'

const messages=[
{theme:'PATIENCE',quote:"Rome wasn't built in a day, and neither is a successful business.",lesson:'Focus on the next meaningful step, not the entire journey.',action:'Choose your next step'},
{theme:'CONSISTENCY',quote:'Small steps taken consistently can carry you further than big plans left untouched.',lesson:'Choose one task today and finish it.',action:'Pick one task'},
{theme:'COURAGE',quote:'Every established business was once an idea someone was brave enough to pursue.',lesson:'Take one step towards something you have been postponing.',action:'Take the first step'},
{theme:'DISCIPLINE',quote:'Motivation may start the journey, but discipline keeps the doors open.',lesson:'Build a routine that works even on difficult days.',action:'Set a routine'},
{theme:'CUSTOMERS',quote:'A customer may come for your product, but excellent service gives them a reason to return.',lesson:'Make one customer feel genuinely valued today.',action:'Contact a customer'},
{theme:'PROGRESS',quote:'You do not have to be the biggest business in the room. You have to keep becoming better.',lesson:'Improve one small part of how you work.',action:'Improve one thing'},
{theme:'RESILIENCE',quote:'A difficult day is part of your business story, not the whole story.',lesson:'Learn what you can, adjust and begin again.',action:'Reset and refocus'},
{theme:'MONEY',quote:'Making sales is important. Knowing where the money goes is just as important.',lesson:'Review your expenses and understand your costs.',action:'Review expenses'},
{theme:'VISION',quote:'A dream gives you direction. A plan gives your effort somewhere to go.',lesson:'Write down one goal and its next practical step.',action:'Set a goal'},
{theme:'PATIENCE',quote:"Do not compare your first chapter with someone else's tenth.",lesson:'Measure your progress against where you started.',action:'Notice your progress'},
{theme:'REPUTATION',quote:'Your reputation is built in the moments when keeping your word costs you something.',lesson:'Honour a commitment or communicate early if plans change.',action:'Keep your word'},
{theme:'LEARNING',quote:'Every mistake has a lesson, if you are willing to look for it.',lesson:'Identify one thing you can do better next time.',action:'Learn and adjust'},
{theme:'FOCUS',quote:'Not every opportunity needs a yes. Sometimes protecting your focus is the smarter move.',lesson:'Check whether your next commitment serves your priorities.',action:'Check your priorities'},
{theme:'VALUE',quote:'People do not just pay for what you sell. They pay for the problem you help them solve.',lesson:'Explain clearly what makes your product or service useful.',action:'Clarify your value'},
{theme:'COURAGE',quote:'You can start before you feel completely ready. Learn as you go.',lesson:'Take a manageable first step instead of waiting for perfect conditions.',action:'Start small'},
{theme:'CASH FLOW',quote:'A busy business is not always a profitable business. Know your numbers.',lesson:'Check what you earned, what you spent and what remains.',action:'Check your numbers'},
{theme:'CUSTOMER CARE',quote:'Listening carefully can teach you more than selling loudly.',lesson:'Ask a customer what you could improve.',action:'Ask for feedback'},
{theme:'FOCUS',quote:'You cannot build everything at once. Give your best attention to what matters now.',lesson:'Choose your three most important tasks.',action:'Choose three tasks'},
{theme:'GROWTH',quote:'Growth begins when you become willing to learn what you do not yet know.',lesson:'Spend a little time learning a skill your business needs.',action:'Learn a new skill'},
{theme:'TRUST',quote:'Trust takes time to earn and seconds to damage. Treat it like an asset.',lesson:'Be transparent about prices, timelines and expectations.',action:'Communicate clearly'},
{theme:'PERSEVERANCE',quote:'Slow progress is still progress when you are moving in the right direction.',lesson:'Recognise one improvement you have made this month.',action:'Track progress'},
{theme:'PLANNING',quote:'A plan will not remove every problem, but it can help you face problems with purpose.',lesson:"Plan tomorrow's first task before you finish today.",action:'Plan tomorrow'},
{theme:'COMPETITION',quote:'Learn from your competitors without losing sight of what makes your business yours.',lesson:'Identify one thing you can do differently or better.',action:'Find your difference'},
{theme:'SELF-BELIEF',quote:'You are allowed to be a beginner and still take your ambition seriously.',lesson:'Work on your business without apologising for where you are.',action:'Own your journey'},
{theme:'ADAPTABILITY',quote:'When a strategy stops working, change the strategy, not the value of the goal.',lesson:'Review one approach and decide whether it needs adjusting.',action:'Review your approach'},
{theme:'OPPORTUNITY',quote:'Follow-ups, clear communication and showing up can open doors that waiting never will.',lesson:'Reconnect with one customer or business contact.',action:'Follow up'},
{theme:'LEADERSHIP',quote:'A strong business is not built on doing everything yourself. It is built on knowing what needs doing.',lesson:'Simplify one process or ask for help where appropriate.',action:'Simplify a task'},
{theme:'GRATITUDE',quote:'Never underestimate the value of the customers, skills and opportunities you already have.',lesson:'Appreciate one thing that is working and build on it.',action:'Build on a strength'},
{theme:'AMBITION',quote:'Think big enough to inspire yourself and start small enough to take action today.',lesson:'Break one ambitious goal into a task you can begin now.',action:'Take action'},
{theme:'YOUR JOURNEY',quote:'You started with an idea. Keep showing up, keep learning and keep building.',lesson:'Celebrate your progress and choose your next milestone.',action:'Choose your next milestone'}
]

function getSouthAfricanDate(){
 const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Africa/Johannesburg',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date())
 const part=(type:string)=>parts.find(p=>p.type===type)?.value||'0'
 return {year:Number(part('year')),month:Number(part('month')),day:Number(part('day'))}
}

export default function DailyMotivation({compact=false}:{compact?:boolean}){
 const daily=useMemo(()=>{
  const {year,month,day}=getSouthAfricanDate()
  const quarter=Math.floor((month-1)/3)
  const quarterStart=Date.UTC(year,quarter*3,1)
  const today=Date.UTC(year,month-1,day)
  const dayOfQuarter=Math.floor((today-quarterStart)/86400000)
  return {message:messages[dayOfQuarter%messages.length],dayInCycle:dayOfQuarter%messages.length+1,quarter:quarter+1,year}
 },[])
 const m=daily.message
 return <section aria-label="NelaPost daily motivation" style={{background:'#0B2D24',color:'#fff',borderRadius:16,padding:compact?'18px':'24px',display:'grid',gap:12,marginBottom:18}}>
  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:10,flexWrap:'wrap'}}>
   <span style={{fontSize:10,fontWeight:800,letterSpacing:1.5,color:'#A9DCC5'}}>YOUR DAILY BUSINESS REMINDER</span>
   <span style={{fontSize:10,color:'#B9D8CB'}}>DAY {daily.dayInCycle} · Q{daily.quarter} {daily.year}</span>
  </div>
  <div style={{fontSize:11,fontWeight:800,letterSpacing:1.2,color:'#A9DCC5'}}>{m.theme}</div>
  <h2 style={{fontSize:compact?22:28,lineHeight:1.22,letterSpacing:-.6,margin:0,fontWeight:750}}>{m.quote}</h2>
  <p style={{fontSize:14,lineHeight:1.65,color:'#E2EEE8',margin:0}}>{m.lesson}</p>
  <div style={{borderTop:'1px solid #42665A',paddingTop:12,display:'flex',alignItems:'center',gap:8,color:'#B9D8CB',fontSize:11}}>
   <span aria-hidden="true">✦</span><span>ONE STEP AT A TIME · {m.action}</span>
  </div>
 </section>
}
