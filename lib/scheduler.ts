import {admin} from './server'
import {publishTarget} from './publisher'

export async function runScheduledPosts(){
  const db=admin()
  const now=new Date().toISOString()
  const {data:posts,error}=await db.from('posts').select('*,post_targets(*)').eq('status','scheduled').lte('scheduled_for',now).limit(20)
  if(error) throw error
  for(const post of posts||[]){
    await db.from('posts').update({status:'publishing',updated_at:new Date().toISOString()}).eq('id',post.id)
    for(const target of post.post_targets||[]){
      if(target.status!=='pending') continue
      await db.from('post_targets').update({status:'publishing'}).eq('id',target.id)
      try{
        const result=await publishTarget({installation_id:post.installation_id,platform:target.platform,caption:post.caption,media_url:post.media_url||undefined,media_type:post.media_type||undefined})
        await db.from('post_targets').update({status:'published',external_post_id:String(result?.id||result?.data?.id||''),published_at:new Date().toISOString()}).eq('id',target.id)
      }catch(error:any){
        await db.from('post_targets').update({status:'failed',error_message:error?.message||'Publishing failed'}).eq('id',target.id)
      }
    }
    const {data:targets}=await db.from('post_targets').select('status').eq('post_id',post.id)
    const statuses=(targets||[]).map(x=>x.status)
    const status=statuses.length&&statuses.every(x=>x==='published')?'published':statuses.some(x=>x==='published')?'published':'failed'
    await db.from('posts').update({status,updated_at:new Date().toISOString()}).eq('id',post.id)
  }
}
