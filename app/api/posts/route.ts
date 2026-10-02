import {NextResponse} from 'next/server'
import {admin,installationId} from '../../../lib/server'
import {publishTarget} from '../../../lib/publisher'

export async function GET(){
 try{
  const id=await installationId()
  const {data,error}=await admin().from('posts').select('*,post_targets(*)').eq('installation_id',id).order('created_at',{ascending:false}).limit(100)
  if(error)throw error
  return NextResponse.json({posts:data||[]})
 }catch(error:any){return NextResponse.json({error:error?.message||'Could not load posts'},{status:500})}
}

export async function POST(request:Request){
 const id=await installationId()
 try{
  const body=await request.json()
  const caption=String(body.caption||'').trim()
  const media_url=body.media_url?String(body.media_url):null
  const media_type=body.media_type==='video'?'video':body.media_type==='image'?'image':null
  const platforms=Array.isArray(body.platforms)?body.platforms.filter((p:string)=>typeof p==='string'):[]
  const mode=body.mode==='schedule'?'schedule':'now'
  const scheduled_for=mode==='schedule'?String(body.scheduled_for||''):null
  if(!caption&&!media_url)return NextResponse.json({error:'Add a caption or media before publishing.'},{status:400})
  if(!platforms.length)return NextResponse.json({error:'Select your connected platform.'},{status:400})
  if(platforms.some((platform:string)=>!['x','facebook','instagram','tiktok','threads','youtube'].includes(platform)))return NextResponse.json({error:'One or more selected platforms are not supported.'},{status:400})
  if(mode==='schedule'&&!scheduled_for)return NextResponse.json({error:'Choose a date and time.'},{status:400})
  const db=admin()
  const {data:connections,error:connectionError}=await db.from('social_connections').select('platform').eq('installation_id',id).in('platform',platforms)
  if(connectionError)throw connectionError
  const connected=new Set((connections||[]).map(x=>x.platform))
  const missing=platforms.filter((p:string)=>!connected.has(p))
  if(missing.length)return NextResponse.json({error:`Link these platforms first: ${missing.join(', ')}`},{status:400})
  const {data:post,error:postError}=await db.from('posts').insert({installation_id:id,caption,media_url,media_type,scheduled_for,status:mode==='schedule'?'scheduled':'publishing'}).select().single()
  if(postError)throw postError
  const targets=platforms.map((platform:string)=>({post_id:post.id,installation_id:id,platform,status:mode==='schedule'?'pending':'publishing'}))
  const {error:targetError}=await db.from('post_targets').insert(targets)
  if(targetError)throw targetError
  if(mode==='schedule'){
   const response=NextResponse.json({ok:true,post_id:post.id,status:'scheduled'})
   response.cookies.set('nelapost_installation_id',id,{httpOnly:true,secure:true,sameSite:'lax',maxAge:60*60*24*365,path:'/'})
   return response
  }
  const results=[]
  for(const platform of platforms){
   try{
    const result=await publishTarget({installation_id:id,platform,caption,media_url:media_url||undefined,media_type:media_type||undefined})
    await db.from('post_targets').update({status:'published',external_post_id:String(result?.id||result?.data?.id||''),published_at:new Date().toISOString()}).eq('post_id',post.id).eq('platform',platform)
    results.push({platform,status:'published'})
   }catch(error:any){
    await db.from('post_targets').update({status:'failed',error_message:error?.message||'Publishing failed'}).eq('post_id',post.id).eq('platform',platform)
    results.push({platform,status:'failed',error:error?.message||'Publishing failed'})
   }
  }
  const published=results.filter(x=>x.status==='published').length;const failed=results.filter(x=>x.status==='failed').length;const overall=failed===0?'published':published>0?'partial':'failed'
  await db.from('posts').update({status:overall,updated_at:new Date().toISOString()}).eq('id',post.id)
  const response=NextResponse.json({ok:overall!=='failed',post_id:post.id,status:overall,results})
  response.cookies.set('nelapost_installation_id',id,{httpOnly:true,secure:true,sameSite:'lax',maxAge:60*60*24*365,path:'/'})
  return response
 }catch(error:any){return NextResponse.json({error:error?.message||'Could not create post'},{status:500})}
}
