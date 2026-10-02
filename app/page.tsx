'use client'

import Link from 'next/link'
import {useEffect,useState} from 'react'
import {useRouter} from 'next/navigation'
import {createClient} from '../lib/supabase-browser'

type Post={id:string|number;caption:string;platforms:string[];when:string;status:string;media?:string;targets?:{platform:string;status:string;error?:string|null}[]}
type Platform={name:string;icon:string;className:string;description:string;auth?:string}

const NELA_LOGO='/logo-mark.svg'

const platforms:Platform[]=[
 {name:'Instagram',icon:'◎',className:'instagramIcon',auth:'/api/auth/meta?platform=instagram',description:'Publish to your Instagram professional account.'},
 {name:'Facebook',icon:'f',className:'facebookIcon',auth:'/api/auth/meta?platform=facebook',description:'Publish to your Facebook Page.'},
 {name:'X',icon:'𝕏',className:'xIcon',auth:'/api/auth/x',description:'Post and manage your X presence.'},
 {name:'Threads',icon:'@',className:'threadsIcon',auth:'/api/auth/threads',description:'Publish to your Threads profile.'},
 {name:'TikTok',icon:'♪',className:'tiktokIcon',auth:'/api/auth/tiktok',description:'Publish videos and photos to TikTok.'},
 {name:'YouTube',icon:'▶',className:'youtubeIcon',auth:'/api/auth/youtube',description:'Publish videos or image Community posts.'}
]

export default function Home(){
 const router=useRouter()
 const supabase=createClient()
 const [userEmail,setUserEmail]=useState('')
 const [authReady,setAuthReady]=useState(false)
 const [view,setView]=useState<'create'|'upcoming'|'accounts'>('create')
 const [caption,setCaption]=useState('')
 const [selected,setSelected]=useState<string[]>(['X'])
 const [when,setWhen]=useState<'now'|'schedule'>('now')
 const [date,setDate]=useState('')
 const [time,setTime]=useState('')
 const [media,setMedia]=useState<string>()
 const [mediaFile,setMediaFile]=useState<File>()
 const [mediaType,setMediaType]=useState<'image'|'video'>()
 const [posts,setPosts]=useState<Post[]>([])
 const [calendar,setCalendar]=useState(false)
 const [previewPlatform,setPreviewPlatform]=useState('X')
 const [connected,setConnected]=useState<Record<string,{name:string}>>({})
 const [busy,setBusy]=useState(false)

 const loadConnections=async()=>{
  try{const r=await fetch('/api/connections',{cache:'no-store'});const data=await r.json();if(r.ok)setConnected(data.connected||{})}catch{}
 }
 const loadPosts=async()=>{
  try{
   const r=await fetch('/api/posts');const data=await r.json()
   if(r.ok)setPosts((data.posts||[]).map((p:any)=>({id:p.id,caption:p.caption||'Media post',platforms:(p.post_targets||[]).map((x:any)=>x.platform),when:p.scheduled_for?new Date(p.scheduled_for).toLocaleString():p.status==='publishing'?'Publishing now':p.status==='partial'?'Partially published':p.status==='failed'?'Failed':'Published',status:p.status,media:p.media_url||undefined,targets:(p.post_targets||[]).map((x:any)=>({platform:x.platform,status:x.status,error:x.error_message}))})))
  }catch{}
 }
 useEffect(()=>{
  let active=true
  supabase.auth.getUser().then(({data})=>{
   if(!active)return
   if(!data.user){router.replace('/login');return}
   setUserEmail(data.user.email||'')
   setAuthReady(true)
   loadConnections()
   if(new URLSearchParams(window.location.search).get('connected')){setView('accounts');history.replaceState({},'',window.location.pathname)}
  })
  return()=>{active=false}
 },[])
 useEffect(()=>{if(view==='upcoming')loadPosts();if(view==='accounts')loadConnections()},[view])

 const toggle=(platform:string)=>{
  setSelected(current=>{
   if(current.includes(platform))return current.filter(x=>x!==platform)
   return [...current,platform]
  })
 }

 const connect=(platform:string)=>{
  const route=platforms.find(p=>p.name===platform)?.auth
  if(!route){window.alert(`${platform} authorization is not connected to NelaPost yet.`);return}
  window.location.href=route
 }

 const handleMedia=(file?:File)=>{
  if(!file)return
  if(!file.type.startsWith('image/')&&!file.type.startsWith('video/')){window.alert('Please choose an image or video.');return}
  if(media)URL.revokeObjectURL(media)
  setMedia(URL.createObjectURL(file));setMediaFile(file);setMediaType(file.type.startsWith('video/')?'video':'image')
 }

 const submit=async()=>{
  if((!caption.trim()&&!mediaFile)||busy)return
  const missing=selected.filter(p=>!connected[p.toLowerCase()])
  if(missing.length){window.alert(`Link these platforms first: ${missing.join(', ')}`);return}
  const selectedPlatforms=selected.map(p=>p.toLowerCase())
  setBusy(true)
  try{
   let mediaUrl=''
   if(mediaFile){
    const form=new FormData();form.append('file',mediaFile)
    const upload=await fetch('/api/media',{method:'POST',body:form});const uploadData=await upload.json()
    if(!upload.ok)throw new Error(uploadData.error||'Media upload failed')
    mediaUrl=uploadData.url
   }
   const scheduled_for=when==='schedule'?new Date(`${date}T${time}`).toISOString():null
   if(when==='schedule'&&(!date||!time))throw new Error('Choose a date and time.')
   const response=await fetch('/api/posts',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({caption,media_url:mediaUrl||null,media_type:mediaType||null,platforms:selectedPlatforms,mode:when,scheduled_for})})
   const data=await response.json()
   if(!response.ok)throw new Error(data.error||'Could not publish the post')
   setCaption('');if(media)URL.revokeObjectURL(media);setMedia(undefined);setMediaFile(undefined);setMediaType(undefined);setView('upcoming');await loadPosts()
   if(data.status==='failed')window.alert(data.results?.map((x:any)=>`${x.platform}: ${x.error||'failed'}`).join('\n')||'The post failed on all selected platforms.')
  }catch(error:any){window.alert(error?.message||'Something went wrong while publishing.')}finally{setBusy(false)}
 }

 const logout=async()=>{await supabase.auth.signOut();router.replace('/login');router.refresh()}

 if(!authReady)return <main className="authLoading"><div>Loading NelaPost…</div></main>

 return <div className="appShell">
  <aside className="sidebar">
   <div className="brand"><div className="brandMark"><img src={NELA_LOGO} alt="" /></div><div><strong>NelaPost</strong><span>Create. Schedule. Publish.</span></div></div>
   <div className="navLabel">WORKSPACE</div>
   <nav className="nav">
    <button className={view==='create'?'active':''} onClick={()=>setView('create')}><span>＋</span>Create post</button>
    <button className={view==='upcoming'?'active':''} onClick={()=>setView('upcoming')}><span>◷</span>Calendar</button>
    <button className={view==='accounts'?'active':''} onClick={()=>setView('accounts')}><span>◎</span>Accounts</button>
   </nav>
   <div className="sidebarBottom"><div className="freeBadge"><b>Free & open source</b><span>Simple social publishing.</span></div></div>
  </aside>

  <main className="content">
   <header className="header">
    <div><div className="brandHeader">NELAPOST</div><h1>{view==='create'?'Create post':view==='accounts'?'Link your platforms':'Content calendar'}</h1><p>{view==='create'?'Create once. Publish everywhere.':view==='accounts'?'Connect your social platforms for publishing.':'Keep every scheduled post in one place.'}</p></div>
    <div className="headerActions">{view!=='create'&&<button className="headerButton" onClick={()=>setView('create')}>＋ New post</button>}<span className="userEmail">{userEmail}</span><button className="logoutButton" onClick={logout}>Log out</button></div>
   </header>

   {view==='create'&&<div className="composerLayout">
    <section className="composer card">
     <div className="sectionTitle"><div><span className="step">01</span><div><b>Content</b><small>What do you want to publish?</small></div></div></div>
     <label className="mediaDrop">
      {media?<>{mediaType==='video'?<video src={media} controls playsInline className="selectedVideo"/>:<img src={media} alt="Selected media" />}<button type="button" className="changeMedia" onClick={e=>{e.preventDefault();if(media)URL.revokeObjectURL(media);setMedia(undefined);setMediaFile(undefined);setMediaType(undefined)}}>Remove media</button></>:<><div className="uploadIcon">↑</div><b>Upload image or video</b><span>PNG, JPG, WEBP, MP4, MOV or WebM</span><em>Choose media</em></>}
      {!media&&<input type="file" accept="image/*,video/*" onChange={e=>handleMedia(e.target.files?.[0])}/>}
     </label>
     <div className="field"><div className="fieldTop"><label>Caption</label><span>{caption.length}/2,200</span></div><textarea value={caption} onChange={e=>setCaption(e.target.value)} placeholder="Write something worth publishing..." /></div>
     {mediaType&&<div className="mediaRules"><b>{mediaType==='image'?'IMAGE':'VIDEO'} DESTINATIONS</b><div>{selected.map(p=><span key={p}><strong>{p}</strong><small>{p==='YouTube'?(mediaType==='image'?'Community Post':'Video'):p==='TikTok'?(mediaType==='image'?'Photo Post':'Video Post'):p==='Instagram'?(mediaType==='image'?'Post':'Reel'):p==='Facebook'?(mediaType==='image'?'Photo Post':'Video Post'):p==='Threads'?(mediaType==='image'?'Image Post':'Video Post'):(mediaType==='image'?'Image Post':'Video Post')}</small></span>)}</div></div>}<div className="divider"/>
     <div className="sectionTitle compact"><div><span className="step">02</span><div><b>Platforms</b><small>Select your platforms</small></div></div><span className="platformLimit">{selected.length} selected</span></div>
     <div className="platformGrid">
      {platforms.map(platform=><div key={platform.name} className={selected.includes(platform.name)?'platformCard selected':'platformCard'} onClick={()=>toggle(platform.name)}>
       <span className={platform.className}>{platform.icon}</span><span className="platformMain"><b>{platform.name}</b><small>{connected[platform.name.toLowerCase()]?'Connected':platform.auth?'Not connected':'OAuth coming soon'}</small></span>
       {platform.auth?<button type="button" className="platformConnect" onClick={e=>{e.stopPropagation();connect(platform.name)}}>{connected[platform.name.toLowerCase()]?'Reconnect':'Link'}</button>:<button type="button" className="platformConnect" disabled>Soon</button>}
       <i>{selected.includes(platform.name)?'✓':'+'}</i>
      </div>)}
     </div>
    </section>

    <aside className="rightColumn">
     <section className="card scheduleCard">
      <div className="sectionTitle compact"><div><span className="step">03</span><div><b>Publish</b><small>Choose when it goes live</small></div></div></div>
      <div className="whenToggle"><button className={when==='now'?'active':''} onClick={()=>setWhen('now')}>Post now</button><button className={when==='schedule'?'active':''} onClick={()=>setWhen('schedule')}>Schedule</button></div>
      {when==='schedule'&&<div className="dateFields"><label>Date<input type="date" value={date} onChange={e=>setDate(e.target.value)} /></label><label>Time<input type="time" value={time} onChange={e=>setTime(e.target.value)} /></label><button className="calendarConnect" onClick={()=>{setCalendar(true);window.location.href='/api/auth/google'}}>◷ {calendar?'Google Calendar connected':'Connect Google Calendar'}</button></div>}
      <button className="publishButton" disabled={busy||(!caption.trim()&&!mediaFile)} onClick={submit}>{busy?'Publishing…':when==='now'?'Publish now':'Schedule post'} <span>→</span></button>
      <div className="publishNote">NelaPost will send the post through the platforms you authorized.</div>
     </section>

     <section className="previewCard">
      <div className="previewHeader"><span>LIVE PREVIEW</span><b>{previewPlatform}</b></div>
      <div className="previewTabs">{platforms.filter(p=>selected.includes(p.name)).map(platform=><button key={platform.name} className={previewPlatform===platform.name?'active':''} onClick={()=>setPreviewPlatform(platform.name)}>{platform.name}</button>)}</div>
      <div className={`socialPreview ${previewPlatform.toLowerCase()}Preview`}>
       {previewPlatform==='Instagram'&&<><div className="previewProfile"><div className="avatar">N</div><div><b>nelapost</b><span>Instagram · {mediaType==='video'?'Reel':'Post'}</span></div></div>{media?(mediaType==='video'?<video src={media} className="previewImage previewVideo instagramImage" controls muted playsInline/>:<img src={media} className="previewImage instagramImage" alt="Instagram preview" />):<div className="previewPlaceholder instagramImage"><span>Media preview</span></div>}<p><b>nelapost</b> {caption||'Your caption will appear here.'}</p></>}
       {previewPlatform==='Facebook'&&<><div className="previewProfile"><div className="avatar">N</div><div><b>NelaPost</b><span>Facebook Page · {mediaType==='video'?'Video':'Photo'}</span></div></div>{media?(mediaType==='video'?<video src={media} className="previewImage previewVideo facebookImage" controls muted playsInline/>:<img src={media} className="previewImage facebookImage" alt="Facebook preview" />):<div className="previewPlaceholder facebookImage"><span>Media preview</span></div>}<p>{caption||'Your post text will appear here.'}</p></>}
       {previewPlatform==='X'&&<div className="xPost"><div className="previewProfile"><div className="avatar">N</div><div><b>NelaPost</b><span>@nelapost · X · {mediaType==='video'?'Video':'Image'}</span></div></div><p>{caption||'Your post text will appear here.'}</p>{media?(mediaType==='video'?<video src={media} className="previewImage previewVideo xImage" controls muted playsInline/>:<img src={media} className="previewImage xImage" alt="X preview" />):<div className="previewPlaceholder xImage"><span>Media preview</span></div>}</div>}
       {previewPlatform==='TikTok'&&<div className="verticalPreview">{media?(mediaType==='video'?<video src={media} className="verticalMedia" controls muted playsInline/>:<img src={media} className="verticalMedia" alt="TikTok preview"/>):<div className="verticalMedia previewPlaceholder"><span>TikTok preview</span></div>}<div className="verticalOverlay"><b>@nelapost</b><span>{caption||'Posting made easy.'}</span></div></div>}
       {previewPlatform==='YouTube'&&<div className="youtubePreviewInner"><div className="previewProfile"><div className="avatar">N</div><div><b>NelaPost</b><span>YouTube · {mediaType==='image'?'Community Post':mediaType==='video'?'Video':'Post'}</span></div></div>{media?(mediaType==='video'?<video src={media} className="previewImage previewVideo" controls muted playsInline/>:<img src={media} className="previewImage" alt="YouTube Community Post preview"/>):<div className="previewPlaceholder"><span>YouTube preview</span></div>}<p>{caption||'Posting made easy.'}</p></div>}
       {previewPlatform==='Threads'&&<div className="threadsPreviewInner"><div className="previewProfile"><div className="avatar">N</div><div><b>NelaPost</b><span>Threads · {mediaType==='video'?'Video':'Post'}</span></div></div>{media?(mediaType==='video'?<video src={media} className="previewImage previewVideo" controls muted playsInline/>:<img src={media} className="previewImage" alt="Threads preview"/>):null}<p>{caption||'Posting made easy.'}</p></div>}
      </div>
     </section>
    </aside>
   </div>}

   {view==='upcoming'&&<section className="card calendarPanel">
    <div className="calendarToolbar"><div><b>Upcoming posts</b><span>{posts.length} post{posts.length===1?'':'s'}</span></div><button className="headerButton" onClick={()=>setView('create')}>＋ Create post</button></div>
    {posts.length?posts.map(post=><div className="postRow" key={post.id}>{post.media?<img src={post.media} alt="" />:<div className="postThumb">N</div>}<div className="postInfo"><b>{post.caption}</b><span>{post.when} · {post.platforms.join(' + ')}</span></div><div className="postTargetStatuses">{post.targets?.map(t=><span key={t.platform} title={t.error||undefined}>{t.platform}: {t.status}</span>)}</div></div>):<div className="emptyState"><div>◷</div><b>No scheduled posts</b><span>Create a post and it will appear here.</span><button className="headerButton" onClick={()=>setView('create')}>Create your first post</button></div>}
   </section>}

   {view==='accounts'&&<section className="card accountsPanel">
    <div className="accountHero"><div><b>Link your platforms</b><span>Connect your social accounts. NelaPost will use the authorization you grant.</span></div><strong>{Object.keys(connected).length} connected</strong></div>
    {platforms.map(platform=>{const isConnected=Boolean(connected[platform.name.toLowerCase()]);return <div className={`accountRow ${isConnected?'accountConnected':''}`} key={platform.name}><div className={`accountIcon ${platform.className}`}>{platform.icon}</div><div className="accountCopy"><div className="accountNameLine"><b>{platform.name}</b><span className={isConnected?'connectionStatus connected':'connectionStatus'}>{isConnected?'CONNECTED':'NOT CONNECTED'}</span></div><span>{isConnected?(connected[platform.name.toLowerCase()]?.name||'Account connected'):platform.description}</span></div><button className="headerButton" disabled={!platform.auth&&!isConnected} onClick={()=>connect(platform.name)}>{isConnected?'Reconnect':platform.auth?'Link':'Coming soon'}</button></div>})}
   </section>}

   <footer className="siteFooter"><span>© 2026 NelaPost</span><span>NelaPost helps you create, schedule and publish content through connected platforms.</span><Link href="/terms-of-service">Terms of Service</Link></footer>
  </main>
 </div>
}
