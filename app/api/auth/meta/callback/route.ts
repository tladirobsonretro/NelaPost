import {NextResponse} from 'next/server'
import {cookies} from 'next/headers'
import {installationId,saveConnection,canConnect} from '@/lib/server'
export async function GET(request:Request){
 const u=new URL(request.url);const code=u.searchParams.get('code');const state=u.searchParams.get('state');const c=await cookies()
 if(!code||!state||state!==c.get('meta_oauth_state')?.value)return NextResponse.json({error:'Invalid Meta authorization request.'},{status:400})
 const platform=c.get('meta_oauth_platform')?.value
 if(platform!=='instagram'&&platform!=='facebook')return NextResponse.json({error:'Invalid Meta platform.'},{status:400})
 const appId=process.env.META_APP_ID;const secret=process.env.META_APP_SECRET;const redirect=process.env.META_REDIRECT_URI||new URL('/api/auth/meta/callback',request.url).toString();const version=process.env.META_GRAPH_VERSION||'v24.0'
 if(!appId||!secret)return NextResponse.json({error:'Meta OAuth is not configured.'},{status:503})
 try{
  const installation_id=await installationId()
  if(!(await canConnect(installation_id,platform)))return NextResponse.json({error:'NelaPost allows a maximum of 3 connected platforms.'},{status:400})
  const tokenRes=await fetch('https://graph.facebook.com/'+version+'/oauth/access_token?'+new URLSearchParams({client_id:appId,client_secret:secret,redirect_uri:redirect,code}))
  if(!tokenRes.ok)return NextResponse.json({error:'Meta authorization failed.'},{status:400})
  const shortData=await tokenRes.json();const longRes=await fetch('https://graph.facebook.com/'+version+'/oauth/access_token?'+new URLSearchParams({grant_type:'fb_exchange_token',client_id:appId,client_secret:secret,fb_exchange_token:shortData.access_token}));const longData=longRes.ok?await longRes.json():shortData;const userToken=longData.access_token
  const pagesRes=await fetch('https://graph.facebook.com/'+version+'/me/accounts?'+new URLSearchParams({fields:'id,name,access_token',access_token:userToken}))
  if(!pagesRes.ok)return NextResponse.json({error:'Meta did not return a Facebook Page connection.'},{status:400})
  const pagesData=await pagesRes.json();const pages=Array.isArray(pagesData.data)?pagesData.data:[]
  const page=platform==='instagram'?(await Promise.all(pages.map(async(page:any)=>{const r=await fetch('https://graph.facebook.com/'+version+'/'+page.id+'?'+new URLSearchParams({fields:'instagram_business_account',access_token:page.access_token}));const d=r.ok?await r.json():{};return d.instagram_business_account?.id?{...page,ig_user_id:d.instagram_business_account.id}:null}))).find(Boolean):pages[0]
  if(!page)return NextResponse.json({error:platform==='instagram'?'No Instagram Professional account linked to an accessible Facebook Page was found.':'No Facebook Page was found for this account.'},{status:400})
  await saveConnection({installation_id,platform,access_token:page.access_token,external_account_id:String(platform==='instagram'?page.ig_user_id:page.id),external_account_name:String(page.name||''),metadata:{page_id:page.id,page_name:page.name||'',ig_user_id:page.ig_user_id||null}})
  const response=NextResponse.redirect(new URL('/?connected='+platform,u.origin));response.cookies.set('nelapost_installation_id',installation_id,{httpOnly:true,secure:true,sameSite:'lax',maxAge:60*60*24*365,path:'/'});response.cookies.delete('meta_oauth_state');response.cookies.delete('meta_oauth_platform');return response
 }catch(error:any){return NextResponse.json({error:error?.message||'Meta connection failed.'},{status:500})}
}