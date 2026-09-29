import {NextResponse} from 'next/server'
import {cookies} from 'next/headers'
export async function GET(request:Request){
 const u=new URL(request.url);const code=u.searchParams.get('code');const state=u.searchParams.get('state');const c=await cookies()
 if(!code||!state||state!==c.get('meta_oauth_state')?.value)return NextResponse.json({error:'Invalid Meta authorization request.'},{status:400})
 const appId=process.env.META_APP_ID;const secret=process.env.META_APP_SECRET;const redirect=process.env.META_REDIRECT_URI||new URL('/api/auth/meta/callback',request.url).toString();const version=process.env.META_GRAPH_VERSION||'v24.0'
 if(!appId||!secret)return NextResponse.json({error:'Meta OAuth is not configured.'},{status:503})
 const token=await fetch('https://graph.facebook.com/'+version+'/oauth/access_token?'+new URLSearchParams({client_id:appId,client_secret:secret,redirect_uri:redirect,code}))
 if(!token.ok)return NextResponse.json({error:'Meta authorization failed.'},{status:400})
 const data=await token.json();c.set('meta_access_token',data.access_token,{httpOnly:true,secure:true,sameSite:'lax',maxAge:60*60*24*30,path:'/'});c.set('meta_connected','1',{httpOnly:true,secure:true,sameSite:'lax',maxAge:60*60*24*30,path:'/'});c.delete('meta_oauth_state')
 return NextResponse.redirect(new URL('/?meta=connected',request.url))
}