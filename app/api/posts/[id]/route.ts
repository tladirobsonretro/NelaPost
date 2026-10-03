import {NextResponse} from 'next/server'
import {admin,installationId} from '../../../../lib/server'

export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){
 const id=await installationId();const {id:postId}=await params
 try{
  const body=await request.json();const db=admin()
  const allowed=['caption','media_url','media_type','scheduled_for','status']
  const patch:any={}
  for(const key of allowed)if(key in body)patch[key]=body[key]
  if(patch.status&&!['draft','scheduled'].includes(patch.status))return NextResponse.json({error:'Only drafts and scheduled posts can be edited here.'},{status:400})
  const hasPlatforms=Array.isArray(body.platforms)
  const selectedPlatforms=hasPlatforms?[...new Set(body.platforms.map((p:any)=>String(p).toLowerCase()).filter(Boolean))]:null
  if(hasPlatforms&&!selectedPlatforms.length)return NextResponse.json({error:'Select at least one platform.'},{status:400})
  patch.updated_at=new Date().toISOString()
  const {data,error}=await db.from('posts').update(patch).eq('id',postId).eq('installation_id',id).select('*,post_targets(*)').single()
  if(error)throw error
  if(hasPlatforms){
   const {error:deleteError}=await db.from('post_targets').delete().eq('post_id',postId).eq('installation_id',id)
   if(deleteError)throw deleteError
   const {error:insertError}=await db.from('post_targets').insert(selectedPlatforms.map((platform:string)=>({post_id:postId,installation_id:id,platform,status:'pending'})))
   if(insertError)throw insertError
  }
  const {data:full,error:fullError}=await db.from('posts').select('*,post_targets(*)').eq('id',postId).eq('installation_id',id).single()
  if(fullError)throw fullError
  return NextResponse.json({ok:true,post:full})
 }catch(error:any){return NextResponse.json({error:error?.message||'Could not update post'},{status:500})}
}

export async function DELETE(_request:Request,{params}:{params:Promise<{id:string}>}){
 const id=await installationId();const {id:postId}=await params
 try{
  const db=admin();const {data,error}=await db.from('posts').delete().eq('id',postId).eq('installation_id',id).select('id').single()
  if(error)throw error
  return NextResponse.json({ok:true,id:data.id})
 }catch(error:any){return NextResponse.json({error:error?.message||'Could not delete post'},{status:500})}
}
