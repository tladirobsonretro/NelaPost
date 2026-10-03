'use client'

import Link from 'next/link'
import {useEffect,useState} from 'react'
import {useRouter} from 'next/navigation'
import {createClient} from '../lib/supabase-browser'

type Post={id:string|number;caption:string;platforms:string[];when:string;status:string;media?:string;mediaType?:'image'|'video';scheduledFor?:string|null;targets?:{platform:string;status:string;error?:string|null}[]}
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
 const [view,setView]=useState<'create'|'upcoming'|'drafts'|'library'|'accounts'>('create')
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
 const [editId,setEditId]=useState<string|number|null>(null)

 const loadConnections=async()=>{
  try{const r=await fetch('/api/connections',{cache:'no-store'});const data=await r.json();if(r.ok)setConnected(data.connected||{})}catch{}
 }
 const loadPosts=async()=>{
  try{
   const r=await fetch('/api/posts');const data=await r.json()
   if(r.ok)setPosts((data.posts||[]).map((p:any)=>({id:p.id,caption:p.caption||'Media post',platforms:(p.post_targets||[]).map((x:any)=>x.platform),when:p.scheduled_for?new Date(p.scheduled_for).toLocaleString():p.status==='publishing'?'Publishing now':p.status==='partial'?'Partially published':p.status==='failed'?'Failed':'Published',status:p.status,media:p.media_url||undefined,mediaType:p.media_type||undefined,scheduledFor:p.scheduled_for||null,targets:(p.post_targets||[]).map((x:any)=>({platform:x.platform,status:x.status,error:x.error_message}))}))))
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
 useEffect(()=>{if(view==='upcoming'||view==='drafts'||view==='library')loadPosts();if(view==='accounts')loadConnections()},[view])

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

 const saveDraft=async()=>{
  if((!caption.trim()&&!mediaFile)||busy)return
  setBusy(true)
  try{
   let mediaUrl=''
   if(mediaFile){const form=new FormData();form.append('file',mediaFile);const upload=await fetch('/api/media',{method:'POST',body:form});const uploadData=await upload.json();if(!upload.ok)throw new Error(uploadData.error||'Media upload failed');mediaUrl=uploadData.url}
   const response=await fetch('/api/posts',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({caption,media_url:mediaUrl||null,media_type:mediaType||null,platforms:selected.map(p=>p.toLowerCase()),mode:'draft'})});const data=await response.json();if(!response.ok)throw new Error(data.error||'Could not save draft')
   setCaption('');if(media)URL.revokeObjectURL(media);setMedia(undefined);setMediaFile(undefined);setMediaType(undefined);setView('drafts');await loadPosts()
  }catch(error:any){window.alert(error?.message||'Could not save draft')}finally{setBusy(false)}
 }

 const deletePost=async(id:string|number)=>{if(!window.confirm('Delete this post?'))return;const r=await fetch('/api/posts/'+id,{method:'DELETE'});if(!r.ok){const d=await r.json();window.alert(d.error||'Could not delete post');return}await loadPosts()}
 const duplicatePost=async(id:string|number)=>{const r=await fetch('/api/posts/'+id+'/duplicate',{method:'POST'});const d=await r.json();if(!r.ok){window.alert(d.error||'Could not duplicate post');return}await loadPosts();setView('drafts')}
 const editPost=(post:Post)=>{
  setEditId(post.id);setCaption(post.caption==='Media post'?'':post.caption);setMedia(post.media);setMediaFile(undefined);setMediaType(post.mediaType||'image');setSelected(post.platforms.map(p=>p.charAt(0).toUpperCase()+p.slice(1)));setWhen(post.status==='scheduled'?'schedule':'now')
  if(post.scheduledFor){const d=new Date(post.scheduledFor);const pad=(n:number)=>String(n).padStart(2,'0');setDate(`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`);setTime(`${pad(d.getHours())}:${pad(d.getMinutes())}`)}else{setDate('');setTime('')}
  setView('create')
 }
 const saveEdit=async()=>{
  if(!editId||busy||(!caption.trim()&&!mediaFile&&!media))return
  setBusy(true)
  try{
   let mediaUrl=media||null
   if(mediaFile){const form=new FormData();form.append('file',mediaFile);const upload=await fetch('/api/media',{method:'POST',body:form});const uploadData=await upload.json();if(!upload.ok)throw new Error(uploadData.error||'Media upload failed');mediaUrl=uploadData.url}
   if(when==='schedule'&&(!date||!time))throw new Error('Choose a date and time.')
   const scheduled_for=when==='schedule'?new Date(`${date}T${time}`).toISOString():null
   const status=when==='schedule'?'scheduled':'draft'
   const response=await fetch('/api/posts/'+editId,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({caption,media_url:mediaUrl,media_type:mediaType||null,scheduled_for,status})})
   const data=await response.json();if(!response.ok)throw new Error(data.error||'Could not save changes')
   if(media&&media.startsWith('blob:'))URL.revokeObjectURL(media)
   setEditId(null);setCaption('');setMedia(undefined);setMediaFile(undefined);setMediaType(undefined);setDate('');setTime('');setView(status==='draft'?'drafts':'upcoming');await loadPosts()
  }catch(error:any){window.alert(error?.message||'Could not save changes')}finally{setBusy(false)}
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
   if(data.status==='failed')window.alert(data.results?.map((x:any)=>`${x.platform}: ${x.error||'failed'}`).join('\\n')||'The post failed on all selected platforms.')
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
    <button className={view==='upcoming'?'active':''} onClick={()=>setView('upcoming')}><span>◷</span>Calendar</button><button className={view==='drafts'?'active':''} onClick={()=>setView('drafts')}><span>□</span>Drafts</button><button className={view==='library'?'active':''} onClick={()=>setView('library')}><span>▦</span>Library</button>
    <button className={view==='accounts'?'active':''} onClick={()=>setView('accounts')}><span>◎</span>Accounts</button>
   </nav>
   <div className="sidebarBottom"><div className="freeBadge"><b>Free & open source</b><span>Simple social publishing.</span></div></div>
  </aside>

  <main className="content">
   <header className="header">
    <div><div className="brandHeader">NELAPOST</div><h1>{view==='create'?'Create post':view==='accounts'?'Link your platforms':view==='drafts'?'Drafts':view==='library'?'Media library':'Content calendar'}</h1><p>{view==='create'?'Create once. Publish everywhere.':view==='accounts'?'Connect your social platforms for publishing.':view==='drafts'?'Keep unfinished posts ready to go.':view==='library'?'Reuse media you have already uploaded.':'Plan and manage every scheduled post.'}</p></div>
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
      <button className="publishButton" disabled={busy||(!caption.trim()&&!mediaFile&&!media)} onClick={editId?saveEdit:submit}>{busy?(editId?'Saving…':'Publishing…'):editId?'Save changes':when==='now'?'Publish now':'Schedule post'} <span>→</span></button>{!editId&&<button className="draftButton" disabled={busy||(!caption.trim()&&!mediaFile)} onClick={saveDraft}>Save as draft</button>}
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

   {(view==='upcoming'||view==='drafts')&&<section className="card calendarPanel">
    <div className="calendarToolbar"><div><b>{view==='drafts'?'Drafts':'Content calendar'}</b><span>{posts.filter(p=>view==='drafts'?p.status==='draft':p.status!=='draft').length} post{posts.filter(p=>view==='drafts'?p.status==='draft':p.status!=='draft').length===1?'':'s'}</span></div><button className="headerButton" onClick={()=>setView('create')}>＋ Create post</button></div>
    <div className="postList">{posts.filter(p=>view==='drafts'?p.status==='draft':p.status!=='draft').map(post=><div className="postRow" key={post.id}>{post.media?<img src={post.media} alt="" />:<div className="postThumb">N</div>}<div className="postInfo"><b>{post.caption||'Untitled post'}</b><span>{post.when} · {post.platforms.join(' + ')}</span><div className="postTargetStatuses">{post.targets?.map(t=><div className="postTargetCard" key={t.platform} title={t.error||undefined}><b>{t.platform}</b><span>{post.status==='scheduled'?'Scheduled':t.status==='pending'?'Pending':t.status.charAt(0).toUpperCase()+t.status.slice(1)}</span><small>{post.status==='scheduled'?post.when:''}</small></div>)}</div></div><div className="postActions">{(post.status==='scheduled'||post.status==='draft')&&<button onClick={()=>editPost(post)}>Edit</button>}<button onClick={()=>duplicatePost(post.id)}>Duplicate</button><button onClick={()=>deletePost(post.id)}>Delete</button></div></div>)}</div>
    {!posts.filter(p=>view==='drafts'?p.status==='draft':p.status!=='draft').length&&<div className="emptyState"><div>{view==='drafts'?'□':'◷'}</div><b>{view==='drafts'?'No drafts yet':'No posts yet'}</b><span>{view==='drafts'?'Save unfinished content here.':'Create a post and it will appear here.'}</span><button className="headerButton" onClick={()=>setView('create')}>Create a post</button></div>}
   </section>}
   {view==='library'&&<section className="card calendarPanel"><div className="calendarToolbar"><div><b>Media library</b><span>Previously uploaded media</span></div><button className="headerButton" onClick={()=>setView('create')}>＋ Create post</button></div><div className="mediaLibrary">{Array.from(new Map(posts.filter(p=>p.media).map(p=>[p.media,p])).values()).map(post=><button key={post.media} className="libraryItem" onClick={()=>{setView('create');setMedia(post.media);setMediaType(post.media?.match(/\.(mp4|mov|webm)(\?|$)/i)?'video':'image')}}><img src={post.media} alt="" /><span>{post.caption||'Media asset'}</span></button>)}</div>{!posts.some(p=>p.media)&&<div className="emptyState"><div>▦</div><b>Your library is empty</b><span>Upload media when creating a post and it will be collected here.</span></div>}</section>}

   {view==='accounts'&&<section className="card accountsPanel">
    <div className="accountHero"><div><b>Link your platforms</b><span>Connect your social accounts. NelaPost will use the authorization you grant.</span></div><strong>{Object.keys(connected).length} connected</strong></div>
    {platforms.map(platform=>{const isConnected=Boolean(connected[platform.name.toLowerCase()]);return <div className={`accountRow ${isConnected?'accountConnected':''}`} key={platform.name}><div className={`accountIcon ${platform.className}`}>{platform.icon}</div><div className="accountCopy"><div className="accountNameLine"><b>{platform.name}</b><span className={isConnected?'connectionStatus connected':'connectionStatus'}>{isConnected?'CONNECTED':'NOT CONNECTED'}</span></div><span>{isConnected?(connected[platform.name.toLowerCase()]?.name||'Account connected'):platform.description}</span></div><button className="headerButton" disabled={!platform.auth&&!isConnected} onClick={()=>connect(platform.name)}>{isConnected?'Reconnect':platform.auth?'Link':'Coming soon'}</button></div>})}
   </section>}

   <footer className="siteFooter"><span>© 2026 NelaPost</span><span>NelaPost helps you create, schedule and publish content through connected platforms.</span><Link href="/terms-of-service">Terms of Service</Link></footer>
  </main>
 </div>
}
