import {NextResponse} from 'next/server'
export async function GET(request:Request){
 const appId=process.env.META_APP_ID
 const redirect=process.env.META_REDIRECT_URI||new URL('/api/auth/meta/callback',request.url).toString()
 const version=process.env.META_GRAPH_VERSION||'v24.0'
 if(!appId)return NextResponse.json({error:'Meta publishing is not configured on NelaPost yet. Add META_APP_ID and META_APP_SECRET in Render.'},{status:503})
 const state=crypto.randomUUID()
 const url=new URL('https://www.facebook.com/'+version+'/dialog/oauth')
 url.searchParams.set('client_id',appId);url.searchParams.set('redirect_uri',redirect);url.searchParams.set('response_type','code');url.searchParams.set('state',state)
 url.searchParams.set('scope','pages_show_list,pages_manage_posts,pages_read_engagement,instagram_basic,instagram_content_publish')
 const res=NextResponse.redirect(url)
 res.cookies.set('meta_oauth_state',state,{httpOnly:true,secure:true,sameSite:'lax',maxAge:600,path:'/'})
 return res
}