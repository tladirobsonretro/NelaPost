'use client'

import {useState} from 'react'

type Post={id:number;caption:string;platforms:string[];when:string;status:string;media?:string}

const NELA_LOGO='https://media.canva.com/v2/document-image/hash:438808723/height=447/id:DAHWl0QCodc/type:B/width=447?brand=BAD5Clcd_zQ&csig=AAAAAAAAAAAAAAAAAAAAADafIGfhBxq6HHxsVhlgezs4LkJ7LsrQEJOphcUqD6Pr&disableexport=T&exp=1790699570&fallback=https%3A%2F%2Fs3.amazonaws.com%2Fdocument-export.canva.com%2FQCodc%2FDAHWl0QCodc%2F3%2Fthumbnail%2F0001.png%3FX-Amz-Algorithm%3DAWS4-HMAC-SHA256%26X-Amz-Credential%3DAKIAQYCGKMUHTDF2ZFFQ%252F20260929%252Fus-east-1%252Fs3%252Faws4_request%26X-Amz-Date%3D20260929T152143Z%26X-Amz-Expires%3D6967%26X-Amz-Signature%3D8be1a67deaa12bba4455e6a189a2b87e5b70fcb17782c3a1e9243ee427ff7508%26X-Amz-SignedHeaders%3Dhost%26response-expires%3DTue%252C%252029%2520Sep%25202026%252017%253A17%3A50%20GMT&osig=AAAAAAAAAAAAAAAAAAAAAMLPwwOH7jqwKnGjR02ubDJsQc5HxLMqRpOVRkBgHa9&page=1&signed=brand%2Cdisableexport%2Cfallback%2Cpage%2Cversion&signer=document-rpc&version=4'

type Platform={name:string;icon:string;className:string;login:string;description:string}

const platforms:Platform[]=[
 {name:'Instagram',icon:'◎',className:'instagramIcon',login:'https://www.instagram.com/?flo=true',description:'Instagram creator and business accounts.'},
 {name:'Facebook',icon:'f',className:'facebookIcon',login:'https://www.facebook.com/',description:'Facebook profiles and Pages.'},
 {name:'X',icon:'𝕏',className:'xIcon',login:'https://x.com/?lang=en',description:'Post and manage your X presence.'},
 {name:'TikTok',icon:'♪',className:'tiktokIcon',login:'https://www.tiktok.com/en/',description:'TikTok creator and business accounts.'},
 {name:'Snapchat',icon:'◉',className:'snapchatIcon',login:'https://accounts.snapchat.com/v2/login',description:'Snapchat creator and business accounts.'},
 {name:'LinkedIn',icon:'in',className:'linkedinIcon',login:'https://www.linkedin.com/login',description:'Professional profiles and company Pages.'},
 {name:'YouTube',icon:'▶',className:'youtubeIcon',login:'https://www.youtube.com/',description:'YouTube channels and brand accounts.'},
 {name:'Pinterest',icon:'P',className:'pinterestIcon',login:'https://www.pinterest.com/login/',description:'Pinterest creator and business accounts.'},
 {name:'Threads',icon:'@',className:'threadsIcon',login:'https://www.threads.net/login',description:'Threads profiles for publishing and discovery.'},
 {name:'Google Business',icon:'G',className:'googleBusinessIcon',login:'https://www.google.com/business/',description:'Manage your Google Business Profile presence.'}
]

export default function Home(){
  const [view,setView]=useState<'create'|'upcoming'|'accounts'>('create')
  const [caption,setCaption]=useState('')
  const [selected,setSelected]=useState<string[]>(['Instagram','Facebook'])
  const [when,setWhen]=useState<'now'|'schedule'>('now')
  const [date,setDate]=useState('')
  const [time,setTime]=useState('')
  const [media,setMedia]=useState<string>()
  const [posts,setPosts]=useState<Post[]>([])
  const [calendar,setCalendar]=useState(false)
  const [previewPlatform,setPreviewPlatform]=useState('Instagram')

  const toggle=(platform:string)=>{
    setSelected(current=>{
      if(current.includes(platform))return current.filter(x=>x!==platform)
      if(current.length>=3)return current
      return [...current,platform]
    })
  }

  const connect=(url:string)=>{window.location.href=url}

  const submit=()=>{
    if(!caption.trim()&&!media)return
    const whenText=when==='now'?'Publishing now':`${date||'Choose date'} · ${time||'Choose time'}`
    setPosts(current=>[{id:Date.now(),caption:caption||'Media post',platforms:selected,when:whenText,status:when==='now'?'Publishing':'Scheduled',media},...current])
    setCaption('')
    setMedia(undefined)
    setView('upcoming')
  }

  return <div className="appShell">
    <aside className="sidebar">
      <div className="brand">
        <div className="brandMark"><img src={NELA_LOGO} alt="" /></div>
        <div><strong>NelaPost</strong><span>Create. Schedule. Publish.</span></div>
      </div>

      <div className="navLabel">WORKSPACE</div>
      <nav className="nav">
        <button className={view==='create'?'active':''} onClick={()=>setView('create')}><span>＋</span>Create post</button>
        <button className={view==='upcoming'?'active':''} onClick={()=>setView('upcoming')}><span>◷</span>Calendar</button>
        <button className={view==='accounts'?'active':''} onClick={()=>setView('accounts')}><span>◎</span>Accounts</button>
      </nav>

      <div className="sidebarBottom">
        <div className="freeBadge"><b>Free & open source</b><span>Simple social publishing.</span></div>
      </div>
    </aside>

    <main className="content">
      <header className="header">
        <div>
          <div className="brandHeader">NELAPOST</div>
          <h1>{view==='create'?'Create post':view==='accounts'?'Link your platforms':'Content calendar'}</h1>
          <p>{view==='create'?'Create once. Publish everywhere.':view==='accounts'?'Choose up to 3 platforms to connect.':'Keep every scheduled post in one place.'}</p>
        </div>
        {view!=='create'&&<button className="headerButton" onClick={()=>setView('create')}>＋ New post</button>}
      </header>

      {view==='create'&&<div className="composerLayout">
        <section className="composer card">
          <div className="sectionTitle"><div><span className="step">01</span><div><b>Content</b><small>What do you want to publish?</small></div></div></div>

          <label className="mediaDrop">
            {media?<><img src={media} alt="Selected media" /><button type="button" className="changeMedia" onClick={e=>{e.preventDefault();setMedia(undefined)}}>Remove media</button></>:<><div className="uploadIcon">↑</div><b>Upload image or video</b><span>PNG, JPG, WEBP or MP4</span><em>Choose media</em></>}
            {!media&&<input type="file" accept="image/*,video/*" onChange={e=>{const f=e.target.files?.[0];if(f)setMedia(URL.createObjectURL(f))}}/>}
          </label>

          <div className="field">
            <div className="fieldTop"><label>Caption</label><span>{caption.length}/2,200</span></div>
            <textarea value={caption} onChange={e=>setCaption(e.target.value)} placeholder="Write something worth publishing..." />
          </div>

          <div className="divider"/>

          <div className="sectionTitle compact"><div><span className="step">02</span><div><b>Platforms</b><small>Select up to 3 platforms</small></div></div><span className="platformLimit">{selected.length}/3</span></div>
          <div className="platformGrid">
            {platforms.map(platform=><div key={platform.name} className={selected.includes(platform.name)?'platformCard selected':'platformCard'} onClick={()=>toggle(platform.name)}>
              <span className={platform.className}>{platform.icon}</span>
              <span className="platformMain"><b>{platform.name}</b><small>{selected.includes(platform.name)?'Selected':selected.length>=3?'Limit reached':'Not selected'}</small></span>
              <button type="button" className="platformConnect" onClick={e=>{e.stopPropagation();connect(platform.login)}}>Link</button>
              <i>{selected.includes(platform.name)?'✓':'+'}</i>
            </div>)}
          </div>
        </section>

        <aside className="rightColumn">
          <section className="card scheduleCard">
            <div className="sectionTitle compact"><div><span className="step">03</span><div><b>Publish</b><small>Choose when it goes live</small></div></div></div>
            <div className="whenToggle">
              <button className={when==='now'?'active':''} onClick={()=>setWhen('now')}>Post now</button>
              <button className={when==='schedule'?'active':''} onClick={()=>setWhen('schedule')}>Schedule</button>
            </div>
            {when==='schedule'&&<div className="dateFields">
              <label>Date<input type="date" value={date} onChange={e=>setDate(e.target.value)} /></label>
              <label>Time<input type="time" value={time} onChange={e=>setTime(e.target.value)} /></label>
              <button className="calendarConnect" onClick={()=>connect('https://calendar.google.com/')}>◷ {calendar?'Google Calendar connected':'Open Google Calendar'}</button>
            </div>}
            <button className="publishButton" disabled={!caption.trim()&&!media} onClick={submit}>{when==='now'?'Publish now':'Schedule post'} <span>→</span></button>
            <div className="publishNote">Your post will be sent to the platforms you selected.</div>
          </section>

          <section className="previewCard">
            <div className="previewHeader"><span>LIVE PREVIEW</span><b>{previewPlatform}</b></div>
            <div className="previewTabs">{platforms.filter(p=>selected.includes(p.name)).map(platform=><button key={platform.name} className={previewPlatform===platform.name?'active':''} onClick={()=>setPreviewPlatform(platform.name)}>{platform.name}</button>)}</div>
            <div className={`socialPreview ${previewPlatform.toLowerCase()}Preview`}>
              {previewPlatform==='Instagram'&&<><div className="previewProfile"><div className="avatar">N</div><div><b>nelapost</b><span>Instagram preview</span></div></div>{media?<img src={media} className="previewImage instagramImage" alt="Instagram preview" />:<div className="previewPlaceholder instagramImage"><span>Media preview</span></div>}<p><b>nelapost</b> {caption||'Your caption will appear here.'}</p></>}
              {previewPlatform==='Facebook'&&<><div className="previewProfile"><div className="avatar">N</div><div><b>NelaPost</b><span>Facebook Page preview</span></div></div>{media?<img src={media} className="previewImage facebookImage" alt="Facebook preview" />:<div className="previewPlaceholder facebookImage"><span>Media preview</span></div>}<p>{caption||'Your post text will appear here.'}</p></>}
              {previewPlatform==='X'&&<div className="xPost"><div className="previewProfile"><div className="avatar">N</div><div><b>NelaPost</b><span>@nelapost · X preview</span></div></div><p>{caption||'Your post text will appear here.'}</p>{media?<img src={media} className="previewImage xImage" alt="X preview" />:<div className="previewPlaceholder xImage"><span>Media preview</span></div>}</div>}
              {!['Instagram','Facebook','X'].includes(previewPlatform)&&<div className="genericPreview"><div className="previewProfile"><div className="avatar">N</div><div><b>NelaPost</b><span>{previewPlatform} preview</span></div></div>{media?<img src={media} className="previewImage" alt={`${previewPlatform} preview`} />:<div className="previewPlaceholder"><span>Media preview</span></div>}<p>{caption||'Your post text will appear here.'}</p></div>}
            </div>
          </section>
        </aside>
      </div>}

      {view==='upcoming'&&<section className="card calendarPanel">
        <div className="calendarToolbar"><div><b>Upcoming posts</b><span>{posts.length} post{posts.length===1?'':'s'}</span></div><button className="headerButton" onClick={()=>setView('create')}>＋ Create post</button></div>
        {posts.length?posts.map(post=><div className="postRow" key={post.id}>{post.media?<img src={post.media} alt="" />:<div className="postThumb">N</div>}<div className="postInfo"><b>{post.caption}</b><span>{post.when} · {post.platforms.join(' + ')}</span></div><span className="status">{post.status}</span><button className="deleteButton" onClick={()=>setPosts(x=>x.filter(p=>p.id!==post.id))}>Delete</button></div>):<div className="emptyState"><div>◷</div><b>No scheduled posts</b><span>Create a post and it will appear here.</span><button className="headerButton" onClick={()=>setView('create')}>Create your first post</button></div>}
      </section>}

      {view==='accounts'&&<section className="card accountsPanel">
        <div className="accountHero"><div><b>Link your platforms</b><span>Choose up to 3 social and business platforms.</span></div><strong>{selected.length} / 3 selected</strong></div>
        {platforms.map(platform=><div className="accountRow" key={platform.name}><div className={`accountIcon ${platform.className}`}>{platform.icon}</div><div className="accountCopy"><b>{platform.name}</b><span>{platform.description}</span></div><button className="headerButton" onClick={()=>connect(platform.login)}>{selected.includes(platform.name)?'Open':'Link'}</button></div>)}
      </section>}
    </main>
  </div>
}
