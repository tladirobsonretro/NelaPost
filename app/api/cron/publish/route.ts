import {NextResponse} from 'next/server'
import {admin} from '../../../../lib/server'
import {publishTarget} from '../../../../lib/publisher'

export const dynamic='force-dynamic'

export async function GET(request:Request){
 const secret=process.env.CRON_SECRET
 const supabaseSecret=process.env.NELAPOST_SUPABASE_CRON_SECRET
 const auth=request.headers.get('authorization')
 const headerSecret=request.headers.get('x-nelapost-cron-secret')
 const authorized=(!!secret&&auth===`Bearer ${secret}`)||(!!supabaseSecret&&headerSecret===supabaseSecret)
 if(!authorized)return NextResponse.json({error:'Unauthorized'},{status:401})
 const db=admin()
 const now=new Date().toISOString()
 const {data:posts,error}=await db.from('posts').select('id,installation_id,caption,media_url,media_type,scheduled_for').eq('status','scheduled').lte('scheduled_for',now).order('scheduled_for',{ascending:true}).limit(20)
 if(error)return NextResponse.json({error:error.message},{status:500})
 const results:any[]=[]
 for(const post of posts||[]){
  const claim=await db.from('posts').update({status:'publishing',updated_at:new Date().toISOString()}).eq('id',post.id).eq('status','scheduled').select('id').maybeSingle()
  if(claim.error||!claim.data)continue
  const {data:targets}=await db.from('post_targets').select('platform').eq('post_id',post.id).eq('status','pending')
  const postResults:any[]=[]
  for(const target of targets||[]){
   await db.from('post_targets').update({status:'publishing',error_message:null}).eq('post_id',post.id).eq('platform',target.platform).eq('status','pending')
   try{
    const result=await publishTarget({installation_id:post.installation_id,platform:target.platform,caption:post.caption,media_url:post.media_url||undefined,media_type:post.media_type||undefined})
    await db.from('post_targets').update({status:'published',external_post_id:String(result?.id||result?.data?.id||''),published_at:new Date().toISOString(),error_message:null}).eq('post_id',post.id).eq('platform',target.platform)
    postResults.push({platform:target.platform,status:'published'})
   }catch(error:any){
    const message=error?.message||'Publishing failed'
    await db.from('post_targets').update({status:'failed',error_message:message}).eq('post_id',post.id).eq('platform',target.platform)
    postResults.push({platform:target.platform,status:'failed',error:message})
   }
  }
  const published=postResults.filter(x=>x.status==='published').length
  const failed=postResults.filter(x=>x.status==='failed').length
  const status=failed===0?'published':published>0?'partial':'failed'
  await db.from('posts').update({status,updated_at:new Date().toISOString()}).eq('id',post.id)
  results.push({id:post.id,status,targets:postResults})
 }
 return NextResponse.json({ok:true,processed:results.length,results})
}
