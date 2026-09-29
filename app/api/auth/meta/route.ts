import {NextResponse} from 'next/server'

export async function GET(request:Request){
 const incoming=new URL(request.url)
 const platform=incoming.searchParams.get('platform')
 if(platform!=='instagram'&&platform!=='facebook')return NextResponse.json({error:'Choose Instagram or Facebook.'},{status:400})

 const redirect=process.env.META_REDIRECT_URI||new URL('/api/auth/meta/callback',request.url).toString()
 const version=process.env.META_GRAPH_VERSION||'v24.0'
 const state=crypto.randomUUID()
 const res=NextResponse.redirect(new URL(platform==='instagram'?'https://www.instagram.com/oauth/authorize':'https://www.facebook.com/'+version+'/dialog/oauth'))
 
 if(platform==='instagram'){
  const appId=process.env.META_INSTAGRAM_APP_ID
  if(!appId)return NextResponse.json({error:'Instagram Business Login is not configured. Add META_INSTAGRAM_APP_ID in Render.'},{status:503})
  const url=new URL('https://www.instagram.com/oauth/authorize')
  url.searchParams.set('client_id',appId)
  url.searchParams.set('redirect_uri',redirect)
  url.searchParams.set('response_type','code')
  url.searchParams.set('scope','instagram_business_basic,instagram_business_content_publish,instagram_business_manage_comments,instagram_business_manage_messages')
  url.searchParams.set('state',state)
  const out=NextResponse.redirect(url)
  out.cookies.set('meta_oauth_state',state,{httpOnly:true,secure:true,sameSite:'lax',maxAge:600,path:'/'})
  out.cookies.set('meta_oauth_platform',platform,{httpOnly:true,secure:true,sameSite:'lax',maxAge:600,path:'/'})
  return out
 }

 const appId=process.env.META_APP_ID
 if(!appId)return NextResponse.json({error:'Facebook publishing is not configured on NelaPost yet. Add META_APP_ID and META_APP_SECRET in Render.'},{status:503})
 const url=new URL('https://www.facebook.com/'+version+'/dialog/oauth')
 url.searchParams.set('client_id',appId)
 url.searchParams.set('redirect_uri',redirect)
 url.searchParams.set('response_type','code')
 url.searchParams.set('state',state)
 url.searchParams.set('scope','pages_show_list,pages_manage_posts,pages_read_engagement,instagram_basic,instagram_content_publish')
 const out=NextResponse.redirect(url)
 out.cookies.set('meta_oauth_state',state,{httpOnly:true,secure:true,sameSite:'lax',maxAge:600,path:'/'})
 out.cookies.set('meta_oauth_platform',platform,{httpOnly:true,secure:true,sameSite:'lax',maxAge:600,path:'/'})
 return out
}
