'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'

type PlanPost = { id: string; date: string; theme: string; format: string; idea: string; caption: string; status: 'Planned' | 'Ready' | 'Published' }

const weekdays = [{ short: 'Sun', full: 'Sunday' }, { short: 'Mon', full: 'Monday' }, { short: 'Tue', full: 'Tuesday' }, { short: 'Wed', full: 'Wednesday' }, { short: 'Thu', full: 'Thursday' }, { short: 'Fri', full: 'Friday' }, { short: 'Sat', full: 'Saturday' }]
const weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const themes = {
  Awareness: [
    { theme: 'Meet the business', format: 'Photo', idea: 'Introduce yourself, your business and who you help.', caption: 'Hello from our side! We help people with [what you offer]. Follow along for useful updates, helpful tips and a closer look at what we do.' },
    { theme: 'Behind the scenes', format: 'Photo or short video', idea: 'Show a real moment from preparing, making or delivering your work.', caption: 'Here is a little look behind the scenes at [business name]. Every detail matters because we want you to have a good experience.' },
    { theme: 'Product or service spotlight', format: 'Photo carousel', idea: 'Show one product or service clearly and explain what it is for.', caption: 'Today’s spotlight: [product or service]. It is a good fit for [customer need]. Send us a message if you would like to know more.' },
    { theme: 'Meet the people', format: 'Photo', idea: 'Introduce a team member, maker or the person behind the business.', caption: 'Meet the people behind [business name]. We believe good service starts with people who care about the work they do.' }
  ],
  Engagement: [
    { theme: 'Ask your audience', format: 'Text or photo', idea: 'Ask one easy question your customers will enjoy answering.', caption: 'We want to hear from you: [ask a simple question]. Share your answer in the comments. We are listening!' },
    { theme: 'This or that', format: 'Two photos', idea: 'Give people two options related to your products or services.', caption: 'Help us choose! Are you team [option A] or team [option B]? Tell us below.' },
    { theme: 'Customer story', format: 'Photo or quote', idea: 'Share a customer experience, with their permission.', caption: 'A kind word from a customer means a lot to us. Thank you for trusting [business name]. Your support keeps us going.' },
    { theme: 'Community conversation', format: 'Text post', idea: 'Start a friendly conversation connected to your industry or community.', caption: 'Let’s talk about [relevant topic]. What has your experience been? Share your thoughts below.' }
  ],
  Sales: [
    { theme: 'Offer or featured item', format: 'Product photo', idea: 'Highlight an available product, service or genuine special offer.', caption: 'Looking for [customer need]? Take a look at [product or service]. Contact us for current availability and details.' },
    { theme: 'Show the value', format: 'Photo carousel', idea: 'Explain three practical benefits of what you sell.', caption: 'Here are three reasons customers choose [product or service]: [benefit 1], [benefit 2] and [benefit 3]. Get in touch if it sounds right for you.' },
    { theme: 'Answer a buying question', format: 'Text or short video', idea: 'Answer a common question customers ask before buying.', caption: 'A question we often get: [customer question]. Here is the answer: [clear answer]. Need more details? We are happy to help.' },
    { theme: 'Clear next step', format: 'Product or service photo', idea: 'Tell people exactly how to enquire, order, book or visit.', caption: 'Ready to get started? [Explain how to order, book or enquire]. We look forward to helping you.' }
  ],
  Trust: [
    { theme: 'Helpful tip', format: 'Graphic or carousel', idea: 'Teach your audience one useful thing related to your work.', caption: 'A quick tip from us: [helpful tip]. Save this for later and share it with someone who might find it useful.' },
    { theme: 'Frequently asked question', format: 'Text or short video', idea: 'Answer a question clearly and honestly, without jargon.', caption: 'You asked, we answered: [question]. [Helpful answer]. If anything is still unclear, leave us a question.' },
    { theme: 'How it works', format: 'Step-by-step carousel', idea: 'Walk through the process of buying or using your service.', caption: 'Here is how it works: 1) [step one] 2) [step two] 3) [step three]. We keep the process straightforward.' },
    { theme: 'Values in action', format: 'Photo', idea: 'Show a real example of the care, quality or service you stand for.', caption: 'At [business name], we care about [value]. Here is one way we put that into practice: [real example].' }
  ]
}
const businessLabels: Record<string, string> = { general: 'your business', retail: 'your shop', food: 'your food business', services: 'your service business', creator: 'your creative work', community: 'your organisation' }
const goalOptions = ['Awareness', 'Engagement', 'Sales', 'Trust'] as const

function localISODate(date: Date) {
  return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0')
}
function escapeCSV(value: string) { return '"' + value.replace(/"/g, '""') + '"' }
function downloadFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
function escapeICS(value: string) { return value.replace(/\\/g, '\\\\').replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\n/g, '\\n') }

export default function SocialPlannerPage() {
  const now = new Date()
  const [month, setMonth] = useState(String(now.getFullYear()) + '-' + String(now.getMonth() + 1).padStart(2, '0'))
  const [businessType, setBusinessType] = useState('general')
  const [goal, setGoal] = useState<(typeof goalOptions)[number]>('Awareness')
  const [selectedDays, setSelectedDays] = useState<string[]>(['Tue', 'Thu', 'Sat'])
  const [posts, setPosts] = useState<PlanPost[]>([])
  const [hasGenerated, setHasGenerated] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draftCaption, setDraftCaption] = useState('')
  const [year, monthNumber] = month.split('-').map(Number)
  const firstDay = new Date(year, monthNumber - 1, 1)
  const firstWeekday = firstDay.getDay()
  const daysInMonth = new Date(year, monthNumber, 0).getDate()
  const monthLabel = firstDay.toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' })
  const calendarCells = useMemo(() => {
    const cells: Array<{ date: string; day: number } | null> = Array(firstWeekday).fill(null)
    for (let day = 1; day <= daysInMonth; day++) cells.push({ date: String(year) + '-' + String(monthNumber).padStart(2, '0') + '-' + String(day).padStart(2, '0'), day })
    while (cells.length % 7 !== 0) cells.push(null)
    return cells
  }, [year, monthNumber, daysInMonth, firstWeekday])
  const scheduledCount = posts.length
  const readyCount = posts.filter((post) => post.status === 'Ready' || post.status === 'Published').length

  function resetPlan() {
    setPosts([])
    setHasGenerated(false)
    setEditingId(null)
  }
  function moveMonth(amount: number) {
    const date = new Date(year, monthNumber - 1 + amount, 1)
    resetPlan()
    setMonth(String(date.getFullYear()) + '-' + String(date.getMonth() + 1).padStart(2, '0'))
  }
  function toggleDay(day: string) {
    resetPlan()
    setSelectedDays((current) => current.includes(day) ? current.filter((item) => item !== day) : [...current, day])
  }
  function generatePlan() {
    if (selectedDays.length === 0) return
    const chosenDays = weekdays.filter((day) => selectedDays.includes(day.short)).map((day) => day.full)
    const nextPosts: PlanPost[] = []
    const options = themes[goal]
    const brandLabel = businessLabels[businessType] || businessLabels.general
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, monthNumber - 1, day)
      if (!chosenDays.includes(weekdayNames[date.getDay()])) continue
      const option = options[nextPosts.length % options.length]
      nextPosts.push({
        id: localISODate(date) + '-' + nextPosts.length,
        date: localISODate(date),
        theme: option.theme,
        format: option.format,
        idea: option.idea.replace('your audience', brandLabel === 'your business' ? 'your audience' : brandLabel + ' audience'),
        caption: option.caption.replaceAll('[business name]', brandLabel).replaceAll('[product or service]', businessType === 'food' ? 'your menu or offering' : 'your product or service'),
        status: 'Planned'
      })
    }
    setPosts(nextPosts)
    setHasGenerated(true)
    setEditingId(null)
  }
  function updateStatus(id: string, status: PlanPost['status']) {
    setPosts((current) => current.map((post) => post.id === id ? { ...post, status } : post))
  }
  function saveCaption(id: string) {
    setPosts((current) => current.map((post) => post.id === id ? { ...post, caption: draftCaption } : post))
    setEditingId(null)
  }
  function exportCSV() {
    const header = ['Date', 'Day', 'Theme', 'Format', 'Post idea', 'Caption', 'Status']
    const rows = posts.map((post) => [post.date, new Date(post.date + 'T12:00:00').toLocaleDateString('en-ZA', { weekday: 'long' }), post.theme, post.format, post.idea, post.caption, post.status])
    const csv = [header, ...rows].map((row) => row.map((value) => escapeCSV(String(value))).join(',')).join('\r\n')
    downloadFile('nelapost-social-plan-' + month + '.csv', csv, 'text/csv;charset=utf-8;')
  }
  function exportCalendar() {
    const events = posts.map((post) => {
      const date = post.date.replaceAll('-', '')
      return ['BEGIN:VEVENT', 'UID:' + post.id + '@nelapost', 'DTSTAMP:' + new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''), 'DTSTART;VALUE=DATE:' + date, 'SUMMARY:' + escapeICS(post.theme + ' - ' + post.format), 'DESCRIPTION:' + escapeICS(post.idea + '\n\nCaption idea: ' + post.caption), 'END:VEVENT'].join('\r\n')
    })
    const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//NelaPost//Social Planner//EN', 'CALSCALE:GREGORIAN', ...events, 'END:VCALENDAR'].join('\r\n')
    downloadFile('nelapost-social-plan-' + month + '.ics', ics, 'text/calendar;charset=utf-8;')
  }

  return (
    <main className="planner-page">
      <style jsx global>{".planner-page{min-height:100vh;background:#f7f8fa;color:#171923;font-family:Inter,Arial,sans-serif;padding:24px 18px 48px;box-sizing:border-box}.planner-wrap{max-width:1180px;margin:0 auto}.planner-header{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:34px}.planner-brand{display:flex;align-items:center;gap:11px;text-decoration:none;color:inherit}.planner-logo{width:42px;height:42px;border-radius:12px;display:block}.planner-link{color:#087f5b;font-weight:700;text-decoration:none;font-size:13px}.planner-hero{display:flex;justify-content:space-between;align-items:flex-end;gap:20px;margin-bottom:24px}.planner-kicker{font-size:11px;letter-spacing:1.8px;font-weight:800;color:#087f5b;margin:0 0 10px}.planner-hero h1{font-size:clamp(32px,5vw,48px);letter-spacing:-1.8px;line-height:1.08;margin:0 0 12px}.planner-muted{color:#666b78;line-height:1.65;margin:0;max-width:670px;font-size:14px}.planner-badge{border:1px solid #dcece4;background:#eff8f2;color:#087f5b;padding:8px 11px;border-radius:999px;font-size:11px;font-weight:800;white-space:nowrap}.planner-panel{background:#fff;border:1px solid #e6e8ed;border-radius:18px;padding:20px;box-shadow:0 8px 26px rgba(20,24,35,.035);margin-bottom:20px}.planner-panel h2{font-size:17px;letter-spacing:-.3px;margin:0 0 5px}.planner-sub{font-size:12px;color:#747887;line-height:1.55;margin:0 0 16px}.planner-controls{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.planner-field label{display:block;font-size:11px;font-weight:800;color:#555b67;margin-bottom:7px}.planner-field select{width:100%;border:1px solid #dfe3e8;border-radius:10px;padding:11px 12px;background:#fff;color:#171923;font:inherit;font-size:13px;min-height:42px}.planner-day-picks{display:flex;gap:8px;flex-wrap:wrap;margin-top:16px}.planner-day{border:1px solid #dfe3e8;background:#fff;border-radius:999px;padding:9px 13px;font-size:12px;font-weight:700;color:#555b67;cursor:pointer}.planner-day.active{background:#eaf6ef;color:#087f5b;border-color:#a8d8bf}.planner-actions{display:flex;gap:9px;flex-wrap:wrap;margin-top:18px}.planner-btn{border:1px solid #dce1e6;background:#fff;color:#303440;border-radius:10px;padding:11px 14px;font-size:12px;font-weight:800;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;justify-content:center;gap:7px}.planner-btn.primary{background:#087f5b;color:#fff;border-color:#087f5b}.planner-btn:disabled{opacity:.45;cursor:not-allowed}.planner-summary{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;margin:24px 0 12px}.planner-summary h2{margin:0;font-size:23px;letter-spacing:-.7px}.planner-stats{display:flex;gap:8px;flex-wrap:wrap}.planner-stat{border:1px solid #e4e7ec;background:#fff;border-radius:999px;padding:8px 11px;color:#626775;font-size:11px}.planner-calendar{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:7px}.planner-weekday{text-align:center;font-size:10px;font-weight:800;color:#777d89;padding:8px 0}.planner-cell{background:#fff;border:1px solid #e5e7eb;border-radius:12px;min-height:125px;padding:9px;min-width:0}.planner-cell.empty{background:transparent;border-color:transparent}.planner-date{font-size:11px;font-weight:800;color:#5f6571;margin-bottom:7px}.planner-event{width:100%;text-align:left;border:1px solid #d4eadc;background:#f1faf4;border-radius:9px;padding:8px;color:#164e36;cursor:pointer;display:block}.planner-event strong{display:block;font-size:10px;line-height:1.35;margin-bottom:4px}.planner-event span{display:block;font-size:9px;color:#4d725f;line-height:1.35}.planner-status{display:inline-block;margin-top:6px;font-size:9px;font-weight:800;border-radius:999px;padding:3px 6px;background:#e4f1e8;color:#286344}.planner-status.ready{background:#e8efff;color:#315db5}.planner-status.published{background:#f0f1f4;color:#686d79}.planner-empty-note{color:#7a7f8b;font-size:11px;line-height:1.4;margin:0}.planner-post-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:16px}.planner-post{border:1px solid #e5e7eb;border-radius:14px;background:#fff;padding:15px;min-width:0}.planner-post-top{display:flex;justify-content:space-between;align-items:flex-start;gap:10px;margin-bottom:10px}.planner-post-date{font-size:11px;color:#087f5b;font-weight:800;margin-bottom:5px}.planner-post h3{font-size:14px;margin:0 0 4px;letter-spacing:-.2px}.planner-format{font-size:10px;color:#777d89}.planner-idea{font-size:12px;color:#565d69;line-height:1.6;margin:10px 0}.planner-caption{background:#f7f8fa;border-radius:9px;padding:11px;font-size:12px;line-height:1.6;white-space:pre-wrap;color:#333945}.planner-caption textarea,.planner-post textarea{width:100%;min-height:125px;border:1px solid #dfe3e8;border-radius:8px;padding:10px;font:inherit;font-size:12px;line-height:1.5;box-sizing:border-box;resize:vertical}.planner-post-actions{display:flex;gap:7px;flex-wrap:wrap;margin-top:11px}.planner-small-btn{border:1px solid #dfe3e8;border-radius:8px;background:#fff;padding:7px 9px;font-size:10px;font-weight:800;cursor:pointer;color:#4e5460}.planner-note{font-size:11px;color:#777d89;line-height:1.6;margin:22px 0 0}@media(max-width:760px){.planner-hero{align-items:flex-start;flex-direction:column}.planner-controls{grid-template-columns:1fr}.planner-calendar{gap:4px}.planner-cell{min-height:83px;padding:5px;border-radius:8px}.planner-date{font-size:10px;margin-bottom:4px}.planner-event{padding:5px 4px;border-radius:6px}.planner-event strong{font-size:9px}.planner-event span{display:none}.planner-status{font-size:8px;padding:2px 4px}.planner-weekday{font-size:9px}.planner-post-list{grid-template-columns:1fr}.planner-panel{padding:15px}.planner-cell.empty{min-height:0}}@media print{.planner-page{background:#fff;padding:0}.planner-header,.planner-controls-panel,.planner-actions,.planner-post-actions,.planner-note,.planner-badge,.planner-link{display:none!important}.planner-panel{box-shadow:none;border:0;padding:0}.planner-calendar{gap:4px}.planner-cell{min-height:90px;break-inside:avoid}.planner-post-list{grid-template-columns:1fr 1fr}.planner-post{break-inside:avoid;box-shadow:none}.planner-summary{margin-top:8px}.planner-event{print-color-adjust:exact;-webkit-print-color-adjust:exact}}"}</style>
      <div className="planner-wrap">
        <header className="planner-header">
          <Link href="/" className="planner-brand">
            <img src="/logo-mark.svg" alt="" className="planner-logo" />
            <span><strong style={{ display: 'block', fontSize: 20, letterSpacing: '-.6px', color: '#087f5b' }}>NelaPost</strong><span style={{ display: 'block', color: '#777d89', fontSize: 10, marginTop: 2 }}>Essentials</span></span>
          </Link>
          <Link href="/" className="planner-link">← All Essentials</Link>
        </header>
        <section className="planner-hero">
          <div><p className="planner-kicker">SOCIAL PLANNER</p><h1>Your month, planned.</h1><p className="planner-muted">Simple ideas for what to post and when. Make a plan that fits your business, edit the captions and take your calendar with you. No social account connections and no AI required.</p></div>
          <span className="planner-badge">Free · Download-first · Private by design</span>
        </section>
        <section className="planner-panel planner-controls-panel">
          <h2>Build your content calendar</h2><p className="planner-sub">Choose your month, the kind of work you do and what you want your posts to achieve.</p>
          <div className="planner-controls">
            <div className="planner-field"><label htmlFor="planner-month">MONTH</label><input id="planner-month" type="month" value={month} onChange={(event) => { resetPlan(); setMonth(event.target.value) }} style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #dfe3e8', borderRadius: 10, padding: '11px 12px', font: 'inherit', fontSize: 13, minHeight: 42 }} /></div>
            <div className="planner-field"><label htmlFor="planner-business">WHAT DO YOU DO?</label><select id="planner-business" value={businessType} onChange={(event) => { resetPlan(); setBusinessType(event.target.value) }}><option value="general">Small business / something else</option><option value="retail">Shop or retail</option><option value="food">Food, baking or catering</option><option value="services">Services or freelancing</option><option value="creator">Creator or personal brand</option><option value="community">Community group or organisation</option></select></div>
            <div className="planner-field"><label htmlFor="planner-goal">MAIN GOAL</label><select id="planner-goal" value={goal} onChange={(event) => { resetPlan(); setGoal(event.target.value as (typeof goalOptions)[number]) }}>{goalOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select></div>
          </div>
          <div style={{ marginTop: 17 }}><div style={{ fontSize: 11, fontWeight: 800, color: '#555b67', marginBottom: 8 }}>WHICH DAYS WOULD YOU LIKE TO POST?</div><div className="planner-day-picks">{weekdays.map((day) => <button key={day.short} type="button" className={'planner-day ' + (selectedDays.includes(day.short) ? 'active' : '')} aria-pressed={selectedDays.includes(day.short)} onClick={() => toggleDay(day.short)}>{day.short}</button>)}</div></div>
          <div className="planner-actions"><button type="button" className="planner-btn primary" onClick={generatePlan} disabled={selectedDays.length === 0}>✦ Generate my calendar</button><button type="button" className="planner-btn" onClick={() => moveMonth(-1)}>← Previous month</button><button type="button" className="planner-btn" onClick={() => moveMonth(1)}>Next month →</button></div>
          {selectedDays.length === 0 && <p className="planner-note" style={{ color: '#a33b3b' }}>Choose at least one day to generate a plan.</p>}
        </section>
        <div className="planner-summary"><h2>{monthLabel}</h2><div className="planner-stats"><span className="planner-stat">{scheduledCount} planned posts</span><span className="planner-stat">{readyCount} ready or published</span></div></div>
        <section className="planner-panel" aria-label={monthLabel + ' content calendar'}>
          <div className="planner-calendar">
            {weekdays.map((day) => <div className="planner-weekday" key={day.short}>{day.short}</div>)}
            {calendarCells.map((cell, index) => {
              const post = cell ? posts.find((item) => item.date === cell.date) : undefined
              return <div key={cell?.date || 'empty-' + index} className={'planner-cell ' + (cell ? '' : 'empty')}>
                {cell && <><div className="planner-date">{cell.day}</div>{post ? <button type="button" className="planner-event" onClick={() => document.getElementById('post-' + post.id)?.scrollIntoView({ behavior: 'smooth', block: 'center' })}><strong>{post.theme}</strong><span>{post.format}</span><span className={'planner-status ' + post.status.toLowerCase()}>{post.status}</span></button> : hasGenerated ? <p className="planner-empty-note">Rest day</p> : null}</>}
              </div>
            })}
          </div>
          {!hasGenerated && <p className="planner-note">Choose your posting days and select “Generate my calendar” to fill the month with practical post ideas.</p>}
          {hasGenerated && posts.length === 0 && <p className="planner-note">No posts were generated. Choose at least one posting day and try again.</p>}
          {hasGenerated && posts.length > 0 && <div className="planner-actions"><button type="button" className="planner-btn primary" onClick={exportCSV}>↓ Download plan (CSV)</button><button type="button" className="planner-btn" onClick={exportCalendar}>＋ Add to my calendar (.ics)</button><button type="button" className="planner-btn" onClick={() => window.print()}>Print / Save as PDF</button></div>}
        </section>
        {hasGenerated && posts.length > 0 && <>
          <div className="planner-summary"><h2>Post ideas and captions</h2><span style={{ fontSize: 12, color: '#777d89' }}>Select a caption to personalise it.</span></div>
          <section className="planner-post-list">{posts.map((post) => <article id={'post-' + post.id} key={post.id} className="planner-post">
            <div className="planner-post-top"><div><div className="planner-post-date">{new Date(post.date + 'T12:00:00').toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short' })}</div><h3>{post.theme}</h3><div className="planner-format">{post.format}</div></div><span className={'planner-status ' + post.status.toLowerCase()}>{post.status}</span></div>
            <p className="planner-idea">{post.idea}</p>
            {editingId === post.id ? <div><textarea aria-label={'Edit caption for ' + post.theme} value={draftCaption} onChange={(event) => setDraftCaption(event.target.value)} /><div className="planner-post-actions"><button type="button" className="planner-small-btn" onClick={() => saveCaption(post.id)}>Save caption</button><button type="button" className="planner-small-btn" onClick={() => setEditingId(null)}>Cancel</button></div></div> : <div className="planner-caption">{post.caption}</div>}
            <div className="planner-post-actions">{editingId !== post.id && <button type="button" className="planner-small-btn" onClick={() => { setEditingId(post.id); setDraftCaption(post.caption) }}>Edit caption</button>}<button type="button" className="planner-small-btn" onClick={() => updateStatus(post.id, post.status === 'Planned' ? 'Ready' : post.status === 'Ready' ? 'Published' : 'Planned')}>{post.status === 'Planned' ? 'Mark ready' : post.status === 'Ready' ? 'Mark published' : 'Reset status'}</button></div>
          </article>)}</section>
        </>}
        <p className="planner-note">Your plan is created in this browser session. NelaPost does not upload it to a database or connect to your social accounts. Download it before leaving or refreshing this page, because unsaved edits are not retained.</p>
      </div>
    </main>
  )
}
