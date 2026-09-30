import {admin,decryptSecret,encryptSecret} from './server'

type Connection={id:string;platform:string;access_token:string;refresh_token:string|null;token_expires_at?:string|null;metadata:Record<string,unknown>}

async function getConnection(installation_id:string,platform:string):Promise<Connection>{
 const db=admin();const {data,error}=await db.from('social_connections').select('*').eq('installation_id',installation_id).eq('platform',platform).maybeSingle()
 if(error)throw error
 if(!data)throw new Error(`${platform} is not connected`)
 let access_token=await decryptSecret(data.access_token)
 if((platform==='x'||platform==='tiktok')&&data.refresh_token&&data.token_expires_at&&new Date(data.token_expires_at).getTime()<Date.now()+60_000){
  const refresh_token=await decryptSecret(data.refresh_token)
  const clientId=platform==='x'?process.env.X_CLIENT_ID:process.env.TIKTOK_CLIENT_KEY
  const clientSecret=platform==='x'?process.env.X_CLIENT_SECRET:process.env.TIKTOK_CLIENT_SECRET
  if(clientId&&clientSecret){
   const headers=platform==='x'?{Authorization:`Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,'Content-Type':'application/x-www-form-urlencoded'}:{'Content-Type':'application/x-www-form-urlencoded','Cache-Control':'no-cache'}
   const body=platform==='x'?new URLSearchParams({refresh_token,grant_type:'refresh_token',client_id:clientId}):new URLSearchParams({client_key:clientId,client_secret:clientSecret,refresh_token,grant_type:'refresh_token'})
   const res=await fetch(platform==='x'?'https://api.x.com/2/oauth2/token':'https://open.tiktokapis.com/v2/oauth/token/',{method:'POST',headers,body})
   if(res.ok){
    const next=await res.json();access_token=next.access_token
    await db.from('social_connections').update({access_token:await encryptSecret(access_token),refresh_token:next.refresh_token?await encryptSecret(next.refresh_token):data.refresh_token,token_expires_at:next.expires_in?new Date(Date.now()+Number(next.expires_in)*1000).toISOString():data.token_expires_at,updated_at:new Date().toISOString()}).eq('id',data.id)
   }
  }
 }
 return {...data,access_token,metadata:data.metadata||{}}
}

async function metaRequest(path:string,token:string,init?:RequestInit){
 const res=await fetch(`https://graph.facebook.com/v24.0${path}`,{...init,headers:{...(init?.headers||{}),Authorization:`Bearer ${token}`}})
 const text=await res.text();let data:any;try{data=JSON.parse(text)}catch{data={raw:text}}
 if(!res.ok||data.error)throw new Error(data.error?.message||`Meta request failed (${res.status})`)
 return data
}
async function publishMeta(connection:Connection,caption:string,mediaUrl?:string,mediaType?:string){
 const pageId=String(connection.metadata.page_id||'');const igUserId=String(connection.metadata.ig_user_id||'')
 if(connection.platform==='facebook'){
  if(!pageId)throw new Error('No Facebook Page is connected')
  if(!mediaUrl)return metaRequest(`/${pageId}/feed`,connection.access_token,{method:'POST',body:new URLSearchParams({message:caption})})
  if(mediaType==='video')return metaRequest(`/${pageId}/videos`,connection.access_token,{method:'POST',body:new URLSearchParams({file_url:mediaUrl,description:caption})})
  return metaRequest(`/${pageId}/photos`,connection.access_token,{method:'POST',body:new URLSearchParams({url:mediaUrl,caption})})
 }
 if(!igUserId)throw new Error('No Instagram Professional account is connected')
 if(!mediaUrl)throw new Error('Instagram publishing requires an image or video')
 const params=new URLSearchParams(mediaType==='video'?{video_url:mediaUrl,caption,media_type:'REELS'}:{image_url:mediaUrl,caption,media_type:'IMAGE'})
 const container=await metaRequest(`/${igUserId}/media`,connection.access_token,{method:'POST',body:params});const creationId=container.id
 for(let i=0;i<18;i++){const status=await metaRequest(`/${creationId}?fields=status_code,status`,connection.access_token);if(status.status_code==='FINISHED')break;if(status.status_code==='ERROR')throw new Error(status.status||'Instagram media processing failed');await new Promise(r=>setTimeout(r,5000));if(i===17)throw new Error('Instagram media is still processing. Try publishing again shortly.')}
 return metaRequest(`/${igUserId}/media_publish`,connection.access_token,{method:'POST',body:new URLSearchParams({creation_id:creationId})})
}
async function xUpload(token:string,mediaUrl:string,mediaType:string){
 const source=await fetch(mediaUrl);if(!source.ok)throw new Error('NelaPost could not retrieve the uploaded media');const buffer=Buffer.from(await source.arrayBuffer());const mime=source.headers.get('content-type')||mediaType||'application/octet-stream';const category=mime.startsWith('video/')?'tweet_video':'tweet_image'
 const init=await fetch('https://api.x.com/2/media/upload/initialize',{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({total_bytes:buffer.length,media_type:mime,media_category:category})});const initText=await init.text();let initData:any;try{initData=JSON.parse(initText)}catch{initData={}}
 if(!init.ok||!initData.data?.id)throw new Error(initData.errors?.[0]?.detail||'X media upload initialization failed')
 const id=initData.data.id;const chunkSize=4*1024*1024
 for(let offset=0,segment=0;offset<buffer.length;offset+=chunkSize,segment++){const chunk=buffer.subarray(offset,Math.min(offset+chunkSize,buffer.length));const form=new FormData();form.append('media',new Blob([chunk],{type:mime}),`segment-${segment}`);form.append('segment_index',String(segment));const r=await fetch(`https://api.x.com/2/media/upload/${id}/append`,{method:'POST',headers:{Authorization:`Bearer ${token}`},body:form});if(!r.ok)throw new Error('X media upload failed during chunk upload')}
 const finalize=await fetch(`https://api.x.com/2/media/upload/${id}/finalize`,{method:'POST',headers:{Authorization:`Bearer ${token}`}});let finalData:any={};try{finalData=await finalize.json()}catch{};if(!finalize.ok)throw new Error(finalData.errors?.[0]?.detail||'X media upload finalization failed')
 let info=finalData.data?.processing_info
 while(info&&info.state!=='succeeded'){if(info.state==='failed')throw new Error(info.error?.message||'X media processing failed');await new Promise(r=>setTimeout(r,Math.max(1000,(info.check_after_secs||2)*1000)));const status=await fetch(`https://api.x.com/2/media/upload?command=STATUS&media_id=${encodeURIComponent(id)}`,{headers:{Authorization:`Bearer ${token}`}});const statusData=await status.json();info=statusData.data?.processing_info}
 return id
}
async function publishTikTok(connection:Connection,caption:string,mediaUrl?:string,mediaType?:string){
 if(!mediaUrl)throw new Error('TikTok publishing requires an image or video')
 const creatorRes=await fetch('https://open.tiktokapis.com/v2/post/publish/creator_info/query/',{method:'POST',headers:{Authorization:'Bearer '+connection.access_token,'Content-Type':'application/json'}})
 const creatorData=await creatorRes.json()
 if(!creatorRes.ok||creatorData.error?.code&&creatorData.error.code!=='ok')throw new Error(creatorData.error?.message||'TikTok creator information could not be retrieved')
 const options=creatorData.data?.privacy_level_options||[]
 const privacy=options.includes('PUBLIC_TO_EVERYONE')?'PUBLIC_TO_EVERYONE':options[0]
 if(!privacy)throw new Error('TikTok did not return a valid privacy option')
 let init:any
 if(mediaType==='image'){
  const res=await fetch('https://open.tiktokapis.com/v2/post/publish/content/init/',{method:'POST',headers:{Authorization:'Bearer '+connection.access_token,'Content-Type':'application/json'},body:JSON.stringify({post_info:{title:caption.slice(0,90),description:caption.slice(0,4000),privacy_level:privacy,brand_organic_toggle:false},source_info:{source:'PULL_FROM_URL',photo_cover_index:0,photo_images:[mediaUrl]},post_mode:'DIRECT_POST',media_type:'PHOTO'})})
  init=await res.json()
 }else{
  const res=await fetch('https://open.tiktokapis.com/v2/post/publish/video/init/',{method:'POST',headers:{Authorization:'Bearer '+connection.access_token,'Content-Type':'application/json'},body:JSON.stringify({post_info:{title:caption.slice(0,2200),privacy_level:privacy,disable_duet:!!creatorData.data?.duet_disabled,disable_comment:!!creatorData.data?.comment_disabled,disable_stitch:!!creatorData.data?.stitch_disabled},source_info:{source:'PULL_FROM_URL',video_url:mediaUrl})})
  init=await res.json()
 }
 if(init.error?.code&&init.error.code!=='ok')throw new Error(init.error.message||'TikTok publish failed')
 if(!init.data?.publish_id)throw new Error('TikTok did not return a publish ID')
 const publishId=init.data.publish_id
 for(let i=0;i<12;i++){
  await new Promise(r=>setTimeout(r,3000))
  const statusRes=await fetch('https://open.tiktokapis.com/v2/post/publish/status/fetch/',{method:'POST',headers:{Authorization:'Bearer '+connection.access_token,'Content-Type':'application/json'},body:JSON.stringify({publish_id:publishId})})
  const statusData=await statusRes.json()
  const status=statusData.data?.status
  if(status==='PUBLISH_COMPLETE')return {id:statusData.data?.publicaly_available_post_id?.[0]||publishId,publish_id:publishId}
  if(status==='FAILED')throw new Error(statusData.data?.fail_reason||'TikTok publishing failed')
 }
 return {id:publishId,publish_id:publishId,status:'PROCESSING'}
}
async function publishX(connection:Connection,caption:string,mediaUrl?:string,mediaType?:string){
 const body:any={text:caption||''};if(mediaUrl)body.media={media_ids:[await xUpload(connection.access_token,mediaUrl,mediaType||'application/octet-stream')]}
 const res=await fetch('https://api.x.com/2/tweets',{method:'POST',headers:{Authorization:`Bearer ${connection.access_token}`,'Content-Type':'application/json'},body:JSON.stringify(body)});const data=await res.json();if(!res.ok)throw new Error(data.errors?.[0]?.detail||data.detail||'X post failed');return data
}
export async function publishTarget(input:{installation_id:string;platform:string;caption:string;media_url?:string;media_type?:string}){
 const connection=await getConnection(input.installation_id,input.platform)
 if(input.platform==='facebook'||input.platform==='instagram')return publishMeta(connection,input.caption,input.media_url,input.media_type)
 if(input.platform==='x')return publishX(connection,input.caption,input.media_url,input.media_type)
 if(input.platform==='tiktok')return publishTikTok(connection,input.caption,input.media_url,input.media_type)
 throw new Error(`${input.platform} publishing is not enabled yet`)
}