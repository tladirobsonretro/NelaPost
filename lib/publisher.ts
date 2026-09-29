import {admin, decryptSecret} from './server'

type Connection = {
  id:string
  platform:string
  access_token:string
  refresh_token:string|null
  metadata:Record<string,unknown>
}

async function getConnection(installation_id:string, platform:string):Promise<Connection> {
  const {data,error}=await admin().from('social_connections').select('*').eq('installation_id',installation_id).eq('platform',platform).maybeSingle()
  if(error) throw error
  if(!data) throw new Error(`${platform} is not connected`)
  return {...data,access_token:await decryptSecret(data.access_token),metadata:data.metadata||{}}
}

async function metaRequest(path:string, token:string, init?:RequestInit) {
  const res=await fetch(`https://graph.facebook.com/v24.0${path}`,{...init,headers:{...(init?.headers||{}),Authorization:`Bearer ${token}`}})
  const text=await res.text()
  let data:any
  try{data=JSON.parse(text)}catch{data={raw:text}}
  if(!res.ok||data.error) throw new Error(data.error?.message||`Meta request failed (${res.status})`)
  return data
}

async function publishMeta(connection:Connection, caption:string, mediaUrl?:string, mediaType?:string) {
  const pageId=String(connection.metadata.page_id||'')
  const igUserId=String(connection.metadata.ig_user_id||'')
  if(connection.platform==='facebook'){
    if(!pageId) throw new Error('No Facebook Page is connected')
    if(!mediaUrl) return metaRequest(`/${pageId}/feed`,connection.access_token,{method:'POST',body:new URLSearchParams({message:caption})})
    if(mediaType==='video') return metaRequest(`/${pageId}/videos`,connection.access_token,{method:'POST',body:new URLSearchParams({file_url:mediaUrl,description:caption})})
    return metaRequest(`/${pageId}/photos`,connection.access_token,{method:'POST',body:new URLSearchParams({url:mediaUrl,caption})})
  }
  if(!igUserId) throw new Error('No Instagram Professional account is connected')
  if(!mediaUrl) throw new Error('Instagram publishing requires an image or video')
  const params=new URLSearchParams(mediaType==='video'
    ? {video_url:mediaUrl,caption,media_type:'REELS'}
    : {image_url:mediaUrl,caption,media_type:'IMAGE'})
  const container=await metaRequest(`/${igUserId}/media`,connection.access_token,{method:'POST',body:params})
  const creationId=container.id
  for(let i=0;i<18;i++){
    const status=await metaRequest(`/${creationId}?fields=status_code,status`,connection.access_token)
    if(status.status_code==='FINISHED') break
    if(status.status_code==='ERROR') throw new Error(status.status||'Instagram media processing failed')
    await new Promise(r=>setTimeout(r,5000))
    if(i===17) throw new Error('Instagram media is still processing. Try publishing again shortly.')
  }
  return metaRequest(`/${igUserId}/media_publish`,connection.access_token,{method:'POST',body:new URLSearchParams({creation_id:creationId})})
}

async function xUpload(token:string, mediaUrl:string, mediaType:string) {
  const source=await fetch(mediaUrl)
  if(!source.ok) throw new Error('NelaPost could not retrieve the uploaded media')
  const buffer=Buffer.from(await source.arrayBuffer())
  const mime=source.headers.get('content-type')||mediaType||'application/octet-stream'
  const category=mime.startsWith('video/')?'tweet_video':'tweet_image'
  const init=await fetch('https://api.x.com/2/media/upload/initialize',{
    method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},
    body:JSON.stringify({total_bytes:buffer.length,media_type:mime,media_category:category})
  })
  const initText=await init.text();let initData:any
  try{initData=JSON.parse(initText)}catch{initData={}}
  if(!init.ok||!initData.data?.id) throw new Error(initData.errors?.[0]?.detail||'X media upload initialization failed')
  const id=initData.data.id
  const chunkSize=4*1024*1024
  for(let offset=0,segment=0;offset<buffer.length;offset+=chunkSize,segment++){
    const chunk=buffer.subarray(offset,Math.min(offset+chunkSize,buffer.length))
    const form=new FormData()
    form.append('media',new Blob([chunk],{type:mime}),`segment-${segment}`)
    form.append('segment_index',String(segment))
    const r=await fetch(`https://api.x.com/2/media/upload/${id}/append`,{method:'POST',headers:{Authorization:`Bearer ${token}`},body:form})
    if(!r.ok) throw new Error('X media upload failed during chunk upload')
  }
  const finalize=await fetch(`https://api.x.com/2/media/upload/${id}/finalize`,{method:'POST',headers:{Authorization:`Bearer ${token}`}})
  let finalData:any={}
  try{finalData=await finalize.json()}catch{}
  if(!finalize.ok) throw new Error(finalData.errors?.[0]?.detail||'X media upload finalization failed')
  let info=finalData.data?.processing_info
  while(info&&info.state!=='succeeded'){
    if(info.state==='failed') throw new Error(info.error?.message||'X media processing failed')
    await new Promise(r=>setTimeout(r,Math.max(1000,(info.check_after_secs||2)*1000)))
    const status=await fetch(`https://api.x.com/2/media/upload?command=STATUS&media_id=${encodeURIComponent(id)}`,{headers:{Authorization:`Bearer ${token}`}})
    const statusData=await status.json()
    info=statusData.data?.processing_info
  }
  return id
}

async function publishX(connection:Connection, caption:string, mediaUrl?:string, mediaType?:string) {
  const body:any={text:caption||''}
  if(mediaUrl) body.media={media_ids:[await xUpload(connection.access_token,mediaUrl,mediaType||'application/octet-stream')]}
  const res=await fetch('https://api.x.com/2/tweets',{method:'POST',headers:{Authorization:`Bearer ${connection.access_token}`,'Content-Type':'application/json'},body:JSON.stringify(body)})
  const data=await res.json()
  if(!res.ok) throw new Error(data.errors?.[0]?.detail||data.detail||'X post failed')
  return data
}

export async function publishTarget(input:{installation_id:string;platform:string;caption:string;media_url?:string;media_type?:string}) {
  const connection=await getConnection(input.installation_id,input.platform)
  if(input.platform==='facebook'||input.platform==='instagram') return publishMeta(connection,input.caption,input.media_url,input.media_type)
  if(input.platform==='x') return publishX(connection,input.caption,input.media_url,input.media_type)
  throw new Error(`${input.platform} publishing is not enabled yet`)
}
