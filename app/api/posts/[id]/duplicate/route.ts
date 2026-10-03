import {NextResponse} from 'next/server'
import {admin,installationId} from '../../../../../lib/server'

export async function POST(_request:Request,{params}:{params:Promise<{id:string}>}){
 const id=await installationId();const {id:postId}=await params
 try{
  const db=admin();const {data:source,error}=await db.from('posts').select('caption,media_url,media_type,installation_id').eq('id',postId).eq('installation_id',id).single()
  if(error)throw error
  const {data:post,error:postError}=await db.from('posts').insert({installation_id:id,caption:source.caption,media_url:source.media_url,media_type:source.media_type,status:'draft'}).select().single()
  if(postError)throw postError
  const {data:targets}=await db.from('post_targets').select('platform').eq('post_id',postId)
  if(targets?.length)await db.from('post_targets').insert(targets.map(t=>({post_id:post.id,installation_id:id,platform:t.platform,status:'pending'})))
  const {data:full}=await db.from('posts').select('*,post_targets(*)').eq('id',post.id).single()
  return NextResponse.json({ok:true,post:full})
 }catch(error:any){return NextResponse.json({error:error?.message||'Could not duplicate post'},{status:500})}
}
